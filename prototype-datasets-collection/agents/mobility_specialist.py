from __future__ import annotations

import csv
import json
import statistics
import zipfile
from collections import defaultdict
from pathlib import Path
from typing import Any

import numpy as np
from shapely import make_valid
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import KFold, cross_val_predict

from .spatial import corridor_line, load_feature_collection, project_geometry


def _seconds(time: str) -> int:
    hours, minutes, seconds = (int(value) for value in time.split(":"))
    return hours * 3600 + minutes * 60 + seconds


def _gtfs_training_rows(gtfs_path: Path) -> list[tuple[float, int, float]]:
    with zipfile.ZipFile(gtfs_path) as archive:
        def table(name: str) -> list[dict[str, str]]:
            with archive.open(name) as raw:
                return list(csv.DictReader(line.decode("utf-8-sig") for line in raw))

        stop_times = table("stop_times.txt")
    trips: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in stop_times:
        trips[row["trip_id"]].append(row)
    unique = set()
    for rows in trips.values():
        rows.sort(key=lambda row: int(row["stop_sequence"]))
        if len(rows) < 2:
            continue
        distance = float(rows[-1]["shape_dist_traveled"]) - float(
            rows[0]["shape_dist_traveled"]
        )
        duration = (_seconds(rows[-1]["arrival_time"]) - _seconds(rows[0]["departure_time"])) / 60
        if distance > 0 and duration > 0:
            unique.add((round(distance, 3), len(rows), round(duration, 3)))
    return sorted(unique)


def _road_width_summary(corridor, road_widths_path: Path) -> dict[str, Any]:
    values = []
    nearby_segments = 0
    for feature in load_feature_collection(road_widths_path):
        road = make_valid(project_geometry(feature["geometry"]))
        if road.is_empty or road.distance(corridor) > 100:
            continue
        nearby_segments += 1
        properties = feature.get("properties", {})
        width = properties.get("rr_width_p") or properties.get("rr_width_b")
        if isinstance(width, (int, float)) and width > 0:
            values.append(float(width))
    return {
        "nearby_segment_count": nearby_segments,
        "segments_with_width": len(values),
        "median_width_m": statistics.median(values) if values else None,
        "below_20m_count": sum(value < 20 for value in values),
        "between_20m_and_30m_count": sum(20 <= value < 30 for value in values),
        "at_least_30m_count": sum(value >= 30 for value in values),
    }


def run_mobility_specialist(
    corridor_coordinates: list[list[float]],
    gtfs_path: Path,
    road_widths_path: Path,
    mobility_indicators_path: Path,
) -> dict[str, Any]:
    corridor = corridor_line(corridor_coordinates)
    corridor_km = corridor.length / 1_000
    training_rows = _gtfs_training_rows(gtfs_path)
    features = np.asarray([[distance, stops] for distance, stops, _ in training_rows])
    target = np.asarray([duration for _, _, duration in training_rows])
    model = Ridge(alpha=1.0, positive=True).fit(features, target)
    fitted = model.predict(features)
    folds = KFold(n_splits=min(5, len(training_rows)), shuffle=True, random_state=42)
    cross_validated = cross_val_predict(
        Ridge(alpha=1.0, positive=True), features, target, cv=folds
    )

    station_spacing = statistics.median(
        distance / max(1, stops - 1) for distance, stops, _ in training_rows
    )
    projected_stop_count = max(2, round(corridor_km / station_spacing) + 1)
    learned_metro_minutes = max(
        0.0, float(model.predict([[corridor_km, projected_stop_count]])[0])
    )
    baseline_road_minutes = corridor_km / 13.9 * 60
    free_flow_minutes = corridor_km / 28.0 * 60
    bpr_road_minutes = free_flow_minutes * (1 + 0.15 * (1.5**4))

    indicators = json.loads(mobility_indicators_path.read_text(encoding="utf-8"))
    city_context = {
        "zones": len(indicators),
        "mean_public_transport_mode_share_pct": statistics.mean(
            row["public_transport_mode_share_pct"] for row in indicators
        ),
        "mean_two_wheeler_mode_share_pct": statistics.mean(
            row["two_wheeler_mode_share_pct"] for row in indicators
        ),
        "mean_car_van_mode_share_pct": statistics.mean(
            row["car_van_mode_share_pct"] for row in indicators
        ),
        "source_period": "2010-2011",
    }
    return {
        "agent": "mobility_specialist",
        "corridor_length_km": corridor_km,
        "gtfs_schedule_model": {
            "model": "Ridge regression",
            "training_examples": len(training_rows),
            "features": ["distance_km", "stop_count"],
            "r2_on_training_patterns": r2_score(target, fitted),
            "cross_validated_mae_minutes": mean_absolute_error(target, cross_validated),
            "cross_validated_r2": r2_score(target, cross_validated),
            "coefficients": {
                "distance_km": float(model.coef_[0]),
                "stop_count": float(model.coef_[1]),
                "intercept": float(model.intercept_),
            },
            "median_station_spacing_km": station_spacing,
            "projected_stop_count": projected_stop_count,
            "projected_metro_minutes": learned_metro_minutes,
        },
        "road_comparison": {
            "road_minutes_at_13_9_kmh": baseline_road_minutes,
            "bpr_minutes_at_vc_1_5": bpr_road_minutes,
            "projected_minutes_saved_one_way": baseline_road_minutes
            - learned_metro_minutes,
            "bpr_parameters": {"free_flow_kmh": 28, "alpha": 0.15, "beta": 4, "v_c": 1.5},
        },
        "road_widths": _road_width_summary(corridor, road_widths_path),
        "historical_city_context": city_context,
        "limitations": [
            "The unofficial GTFS contains synthesized intermediate timings",
            "The BPR scenario uses an assumed V/C ratio, not live traffic telemetry",
            "Mobility indicators are a 2010-2011 historical baseline",
        ],
    }

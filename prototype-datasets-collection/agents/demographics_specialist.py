from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
from shapely import make_valid
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from .spatial import (
    corridor_line,
    load_feature_collection,
    project_geometry,
    unproject_coordinate,
)


def run_demographics_specialist(
    corridor_coordinates: list[list[float]],
    wards_path: Path,
    *,
    catchment_m: float = 2_000,
) -> dict[str, Any]:
    catchment = corridor_line(corridor_coordinates).buffer(catchment_m)
    impacts = []
    for feature in load_feature_collection(wards_path):
        properties = feature.get("properties", {})
        population = properties.get("population_2011")
        if not population:
            continue
        ward = make_valid(project_geometry(feature["geometry"]))
        if ward.is_empty or not ward.intersects(catchment):
            continue
        overlap_area = ward.intersection(catchment).area
        overlap_ratio = min(1.0, overlap_area / ward.area) if ward.area else 0.0
        reached = float(population) * overlap_ratio
        label_point = ward.intersection(catchment).representative_point()
        sc_st = float(properties.get("sc_population_2011") or 0) + float(
            properties.get("st_population_2011") or 0
        )
        impacts.append(
            {
                "ward_number": properties.get("WARD_NO")
                or properties.get("ward_no")
                or properties.get("KGISWardNo"),
                "ward_name": properties.get("WARD_NAME")
                or properties.get("ward_name")
                or properties.get("KGISWardName"),
                "coordinates": unproject_coordinate(label_point.x, label_point.y),
                "overlap_ratio": overlap_ratio,
                "population_reached_2011": reached,
                "population_density_per_sq_km": float(population)
                / (ward.area / 1_000_000),
                "sc_st_share": sc_st / float(population),
            }
        )

    cluster_summary = []
    if len(impacts) >= 3:
        matrix = np.asarray(
            [
                [
                    item["population_density_per_sq_km"],
                    item["sc_st_share"],
                    item["overlap_ratio"],
                ]
                for item in impacts
            ],
            dtype=float,
        )
        scaled = StandardScaler().fit_transform(matrix)
        cluster_count = min(3, len(impacts))
        labels = KMeans(n_clusters=cluster_count, random_state=42, n_init=20).fit_predict(
            scaled
        )
        for item, label in zip(impacts, labels):
            item["catchment_archetype"] = int(label)
        for label in range(cluster_count):
            members = [item for item in impacts if item["catchment_archetype"] == label]
            cluster_summary.append(
                {
                    "archetype": label,
                    "ward_count": len(members),
                    "mean_density_per_sq_km": sum(
                        item["population_density_per_sq_km"] for item in members
                    )
                    / len(members),
                    "mean_sc_st_share": sum(item["sc_st_share"] for item in members)
                    / len(members),
                    "wards": [item["ward_name"] for item in members],
                }
            )

    impacts.sort(key=lambda item: item["population_reached_2011"], reverse=True)
    total_reached = sum(item["population_reached_2011"] for item in impacts)
    weighted_equity = (
        sum(
            item["population_reached_2011"] * item["sc_st_share"] for item in impacts
        )
        / total_reached
        if total_reached
        else 0.0
    )
    return {
        "agent": "demographics_specialist",
        "algorithm": {
            "population": "area-weighted polygon intersection",
            "segmentation_model": "KMeans(k<=3) on density, SC/ST share, overlap",
        },
        "census_year": 2011,
        "catchment_m": catchment_m,
        "intersected_ward_count": len(impacts),
        "area_weighted_population_reached_2011": round(total_reached),
        "population_weighted_sc_st_share": weighted_equity,
        "catchment_archetypes": cluster_summary,
        "top_ward_impacts": impacts[:15],
        "limitations": [
            "Population is a Census 2011 baseline",
            "Areal weighting assumes population is uniform within each ward",
            "SC/ST share is an equity signal, not a complete income proxy",
        ],
    }

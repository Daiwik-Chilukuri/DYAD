from __future__ import annotations

from pathlib import Path
from typing import Any

from shapely import make_valid
from shapely.ops import nearest_points

from .spatial import (
    corridor_line,
    load_feature_collection,
    project_geometry,
    unproject_coordinate,
)


def run_water_bodies_agent(
    corridor_coordinates: list[list[float]],
    water_path: Path,
    *,
    watch_distance_m: float = 75,
) -> dict[str, Any]:
    line = corridor_line(corridor_coordinates)
    watchpoints = []
    scanned = 0
    for feature in load_feature_collection(water_path):
        geometry = make_valid(project_geometry(feature["geometry"]))
        if geometry.is_empty:
            continue
        scanned += 1
        distance = geometry.distance(line)
        if distance > watch_distance_m:
            continue
        properties = feature.get("properties", {})
        geometry_type = geometry.geom_type
        kind = "lake" if "Polygon" in geometry_type else "stream"
        nearest_on_water, _ = nearest_points(geometry, line)
        watchpoints.append(
            {
                "source_id": properties.get("source_id"),
                "name": properties.get("name")
                or properties.get("name_of_th")
                or properties.get("drain_name"),
                "kind": kind,
                "coordinates": unproject_coordinate(
                    nearest_on_water.x, nearest_on_water.y
                ),
                "distance_m": distance,
                "intersects_alignment": geometry.intersects(line),
            }
        )
    watchpoints.sort(key=lambda item: item["distance_m"])
    return {
        "agent": "water_bodies_agent",
        "algorithm": "projected line-to-water distance and intersection",
        "watch_distance_m": watch_distance_m,
        "features_scanned": scanned,
        "watchpoint_count": len(watchpoints),
        "alignment_intersection_count": sum(
            item["intersects_alignment"] for item in watchpoints
        ),
        "watchpoints": watchpoints[:25],
        "limitations": [
            "Watch distance is an analytical threshold, not a legal conclusion",
            "Legal buffers must be configured from a dated authoritative rule",
            "Source geometry may not represent seasonal water extent",
        ],
    }

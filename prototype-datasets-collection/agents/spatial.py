from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any, Iterable

from shapely.geometry import LineString, shape

EARTH_RADIUS_M = 6_371_008.8
ORIGIN_LON = 77.5946
ORIGIN_LAT = 12.9716


def project_coordinate(coordinate: Iterable[float]) -> tuple[float, float]:
    longitude, latitude = list(coordinate)[:2]
    x = (
        math.radians(float(longitude) - ORIGIN_LON)
        * EARTH_RADIUS_M
        * math.cos(math.radians(ORIGIN_LAT))
    )
    y = math.radians(float(latitude) - ORIGIN_LAT) * EARTH_RADIUS_M
    return x, y


def unproject_coordinate(x: float, y: float) -> list[float]:
    longitude = ORIGIN_LON + math.degrees(
        x / (EARTH_RADIUS_M * math.cos(math.radians(ORIGIN_LAT)))
    )
    latitude = ORIGIN_LAT + math.degrees(y / EARTH_RADIUS_M)
    return [longitude, latitude]


def _project_coordinates(value: Any) -> Any:
    if (
        isinstance(value, list)
        and len(value) >= 2
        and isinstance(value[0], (int, float))
        and isinstance(value[1], (int, float))
    ):
        return list(project_coordinate(value))
    if isinstance(value, list):
        return [_project_coordinates(child) for child in value]
    return value


def project_geometry(geometry: dict[str, Any]):
    if geometry.get("type") == "GeometryCollection":
        projected = {
            "type": "GeometryCollection",
            "geometries": [
                project_geometry(child).__geo_interface__
                for child in geometry.get("geometries", [])
            ],
        }
    else:
        projected = {
            "type": geometry["type"],
            "coordinates": _project_coordinates(geometry.get("coordinates")),
        }
    return shape(projected)


def corridor_line(coordinates: list[list[float]]) -> LineString:
    if len(coordinates) < 2:
        raise ValueError("a corridor needs at least two coordinates")
    return LineString([project_coordinate(coordinate) for coordinate in coordinates])


def load_feature_collection(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("type") != "FeatureCollection":
        raise ValueError(f"{path} is not a FeatureCollection")
    return payload["features"]


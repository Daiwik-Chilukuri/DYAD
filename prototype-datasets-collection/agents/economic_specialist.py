from __future__ import annotations

from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import numpy as np
from sklearn.cluster import DBSCAN

from .spatial import (
    corridor_line,
    load_feature_collection,
    project_coordinate,
    unproject_coordinate,
)


def run_economic_specialist(
    corridor_coordinates: list[list[float]],
    poi_path: Path,
    *,
    catchment_m: float = 2_000,
    cluster_radius_m: float = 500,
    minimum_cluster_size: int = 3,
) -> dict[str, Any]:
    line = corridor_line(corridor_coordinates)
    selected: list[tuple[dict[str, Any], tuple[float, float]]] = []
    for feature in load_feature_collection(poi_path):
        coordinate = feature.get("geometry", {}).get("coordinates")
        if not coordinate:
            continue
        projected = project_coordinate(coordinate)
        from shapely.geometry import Point

        if Point(projected).distance(line) <= catchment_m:
            selected.append((feature, projected))

    counts = Counter(
        feature.get("properties", {}).get("category", "other")
        for feature, _ in selected
    )
    clusters = []
    noise_count = 0
    if selected:
        matrix = np.asarray([coordinate for _, coordinate in selected], dtype=float)
        labels = DBSCAN(
            eps=cluster_radius_m, min_samples=minimum_cluster_size
        ).fit_predict(matrix)
        grouped: dict[int, list[int]] = defaultdict(list)
        for index, label in enumerate(labels):
            if label == -1:
                noise_count += 1
            else:
                grouped[int(label)].append(index)
        for label, indexes in grouped.items():
            centroid = matrix[indexes].mean(axis=0)
            category_counts = Counter(
                selected[index][0].get("properties", {}).get("category", "other")
                for index in indexes
            )
            named = [
                selected[index][0].get("properties", {}).get("name")
                for index in indexes
                if selected[index][0].get("properties", {}).get("name")
            ]
            clusters.append(
                {
                    "cluster_id": label,
                    "poi_count": len(indexes),
                    "coordinates": unproject_coordinate(*centroid),
                    "category_counts": dict(category_counts),
                    "examples": named[:5],
                }
            )
        clusters.sort(key=lambda cluster: cluster["poi_count"], reverse=True)

    return {
        "agent": "economic_specialist",
        "algorithm": {
            "name": "DBSCAN",
            "eps_m": cluster_radius_m,
            "min_samples": minimum_cluster_size,
        },
        "catchment_m": catchment_m,
        "poi_count": len(selected),
        "category_counts": dict(counts),
        "cluster_count": len(clusters),
        "noise_poi_count": noise_count,
        "top_clusters": clusters[:10],
        "limitations": [
            "OSM completeness varies by category and neighbourhood",
            "Ways and relations are represented by center points",
        ],
    }

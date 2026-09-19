from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

from .catalog import ROOT, load_catalog

BENGALURU_BOUNDS = (77.20, 12.65, 78.05, 13.35)


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _coordinates(value: Any) -> Iterator[tuple[float, float]]:
    if (
        isinstance(value, list)
        and len(value) >= 2
        and isinstance(value[0], (int, float))
        and isinstance(value[1], (int, float))
    ):
        yield float(value[0]), float(value[1])
        return
    if isinstance(value, list):
        for child in value:
            yield from _coordinates(child)


def validate_geojson(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    errors: list[str] = []
    if payload.get("type") != "FeatureCollection":
        errors.append("root type is not FeatureCollection")
    features = payload.get("features", [])
    if not isinstance(features, list):
        errors.append("features is not a list")
        features = []

    invalid_geometries = 0
    coordinate_count = 0
    outside_bounds = 0
    min_lng, min_lat, max_lng, max_lat = BENGALURU_BOUNDS
    for feature in features:
        geometry = feature.get("geometry")
        if not isinstance(geometry, dict) or not geometry.get("type"):
            invalid_geometries += 1
            continue
        for lng, lat in _coordinates(geometry.get("coordinates")):
            coordinate_count += 1
            if not (min_lng <= lng <= max_lng and min_lat <= lat <= max_lat):
                outside_bounds += 1

    if invalid_geometries:
        errors.append(f"{invalid_geometries} features have invalid or missing geometry")
    return {
        "path": str(path.relative_to(ROOT)),
        "feature_count": len(features),
        "coordinate_count": coordinate_count,
        "coordinates_outside_bengaluru_bounds": outside_bounds,
        "invalid_geometries": invalid_geometries,
        "errors": errors,
        "status": "valid" if not errors else "invalid",
    }


def validate_normalized() -> dict[str, Any]:
    catalog = load_catalog()
    raw_presence = []
    for dataset in catalog["datasets"]:
        path = ROOT / dataset["target"]
        metadata_path = path.with_suffix(path.suffix + ".metadata.json")
        checksum_valid: bool | None = None
        if path.exists() and metadata_path.exists():
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            checksum_valid = metadata.get("sha256") == _sha256(path)
        raw_presence.append(
            {
                "dataset_id": dataset["id"],
                "group": dataset["group"],
                "path": dataset["target"],
                "present": path.exists(),
                "bytes": path.stat().st_size if path.exists() else 0,
                "metadata_present": metadata_path.exists(),
                "checksum_valid": checksum_valid,
            }
        )

    geojson_reports = [
        validate_geojson(path)
        for path in sorted((ROOT / "normalized").rglob("*.geojson"))
    ] if (ROOT / "normalized").exists() else []

    ward_report = next(
        (
            report
            for report in geojson_reports
            if report["path"].endswith("wards_with_census.geojson")
        ),
        None,
    )
    if ward_report is not None:
        ward_path = ROOT / ward_report["path"]
        wards = json.loads(ward_path.read_text(encoding="utf-8"))
        statuses = [
            feature.get("properties", {}).get("census_join_status")
            for feature in wards.get("features", [])
        ]
        ward_report["matched_census_features"] = statuses.count("matched")
        ward_report["unmatched_census_features"] = statuses.count("unmatched")
        if ward_report["unmatched_census_features"]:
            ward_report["status"] = "invalid"
            ward_report["errors"].append("one or more wards did not match Census data")

    missing_default = [
        item["dataset_id"]
        for item in raw_presence
        if item["group"] == "default" and not item["present"]
    ]
    invalid_outputs = [
        item["path"] for item in geojson_reports if item["status"] != "valid"
    ]
    invalid_checksums = [
        item["dataset_id"]
        for item in raw_presence
        if item["present"] and item["checksum_valid"] is False
    ]
    status = (
        "invalid"
        if invalid_outputs or invalid_checksums
        else "incomplete"
        if missing_default
        else "valid"
    )
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "catalog_dataset_count": len(catalog["datasets"]),
        "missing_default_datasets": missing_default,
        "invalid_checksums": invalid_checksums,
        "raw_files": raw_presence,
        "geojson": geojson_reports,
        "status": status,
    }
    report_path = ROOT / "validation/report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return report

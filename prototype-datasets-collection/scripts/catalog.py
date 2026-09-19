from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "catalog" / "datasets.json"
REQUIRED_FIELDS = {
    "id",
    "title",
    "group",
    "agent",
    "source_type",
    "source_page",
    "target",
    "format",
    "license",
    "attribution",
    "temporal_coverage",
    "limitations",
}
ALLOWED_GROUPS = {"default", "large", "restricted"}
ALLOWED_SOURCE_TYPES = {"url", "ckan", "overpass"}


def load_catalog(path: Path = CATALOG_PATH) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        catalog = json.load(handle)
    validate_catalog(catalog)
    return catalog


def validate_catalog(catalog: dict[str, Any]) -> None:
    if catalog.get("schema_version") != 1:
        raise ValueError("catalog.schema_version must be 1")

    datasets = catalog.get("datasets")
    if not isinstance(datasets, list) or not datasets:
        raise ValueError("catalog.datasets must be a non-empty list")

    seen: set[str] = set()
    for index, dataset in enumerate(datasets):
        missing = REQUIRED_FIELDS - dataset.keys()
        if missing:
            raise ValueError(f"dataset[{index}] is missing: {sorted(missing)}")
        dataset_id = dataset["id"]
        if dataset_id in seen:
            raise ValueError(f"duplicate dataset id: {dataset_id}")
        seen.add(dataset_id)

        if dataset["group"] not in ALLOWED_GROUPS:
            raise ValueError(f"{dataset_id}: unsupported group {dataset['group']}")
        if dataset["source_type"] not in ALLOWED_SOURCE_TYPES:
            raise ValueError(
                f"{dataset_id}: unsupported source type {dataset['source_type']}"
            )
        if dataset["source_type"] == "url" and not dataset.get("download_url"):
            raise ValueError(f"{dataset_id}: URL source requires download_url")
        if dataset["source_type"] == "ckan":
            for field in ("ckan_base", "package_id", "resource_id"):
                if not dataset.get(field):
                    raise ValueError(f"{dataset_id}: CKAN source requires {field}")
        if dataset["source_type"] == "overpass":
            for field in ("endpoint", "query"):
                if not dataset.get(field):
                    raise ValueError(f"{dataset_id}: Overpass source requires {field}")
        target = Path(dataset["target"])
        if target.is_absolute() or ".." in target.parts:
            raise ValueError(f"{dataset_id}: target must stay inside the prototype")
        if not isinstance(dataset["limitations"], list):
            raise ValueError(f"{dataset_id}: limitations must be a list")


def datasets_for_group(catalog: dict[str, Any], group: str) -> list[dict[str, Any]]:
    if group == "all":
        return list(catalog["datasets"])
    if group not in ALLOWED_GROUPS:
        raise ValueError(f"unsupported group: {group}")
    return [dataset for dataset in catalog["datasets"] if dataset["group"] == group]


def dataset_by_id(catalog: dict[str, Any], dataset_id: str) -> dict[str, Any]:
    dataset = next(
        (item for item in catalog["datasets"] if item["id"] == dataset_id), None
    )
    if dataset is None:
        raise ValueError(f"unknown dataset id: {dataset_id}")
    return dataset

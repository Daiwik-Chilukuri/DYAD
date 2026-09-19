from __future__ import annotations

import hashlib
import json
import os
import shutil
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .catalog import ROOT, dataset_by_id, datasets_for_group, load_catalog

USER_AGENT = "DYAD-dataset-collector/1.0 (+https://github.com/Daiwik-Chilukuri/DYAD)"


def _request_json(url: str) -> dict[str, Any]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def resolve_download_url(dataset: dict[str, Any]) -> str:
    if dataset["source_type"] == "url":
        return dataset["download_url"]
    if dataset["source_type"] == "overpass":
        return dataset["endpoint"]

    api_url = (
        f"{dataset['ckan_base'].rstrip('/')}/api/3/action/package_show"
        f"?id={dataset['package_id']}"
    )
    payload = _request_json(api_url)
    if not payload.get("success"):
        raise RuntimeError(f"CKAN lookup failed for {dataset['id']}")
    resources = payload["result"].get("resources", [])
    resource = next(
        (item for item in resources if item.get("id") == dataset["resource_id"]),
        None,
    )
    if resource is None or not resource.get("url"):
        raise RuntimeError(
            f"CKAN resource {dataset['resource_id']} not found for {dataset['id']}"
        )
    return resource["url"]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def download_dataset(dataset: dict[str, Any], *, force: bool = False) -> Path:
    target = ROOT / dataset["target"]
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and not force:
        print(f"skip {dataset['id']}: {target.relative_to(ROOT)} already exists")
        return target

    url = resolve_download_url(dataset)
    headers = {"User-Agent": USER_AGENT}
    request_data = None
    if dataset["source_type"] == "overpass":
        request_data = urllib.parse.urlencode({"data": dataset["query"]}).encode()
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    request = urllib.request.Request(url, data=request_data, headers=headers)
    temporary_path: Path | None = None
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            with tempfile.NamedTemporaryFile(
                dir=target.parent, prefix=f".{target.name}.", delete=False
            ) as temporary:
                temporary_path = Path(temporary.name)
                shutil.copyfileobj(response, temporary, length=1024 * 1024)
        os.replace(temporary_path, target)
    except (OSError, urllib.error.URLError) as error:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)
        raise RuntimeError(f"download failed for {dataset['id']}: {error}") from error

    metadata = {
        "dataset_id": dataset["id"],
        "source_page": dataset["source_page"],
        "resolved_download_url": url,
        "license": dataset["license"],
        "attribution": dataset["attribution"],
        "downloaded_at": datetime.now(timezone.utc).isoformat(),
        "bytes": target.stat().st_size,
        "sha256": sha256_file(target),
    }
    metadata_path = target.with_suffix(target.suffix + ".metadata.json")
    metadata_path.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    print(
        f"downloaded {dataset['id']}: {target.relative_to(ROOT)} "
        f"({metadata['bytes']} bytes)"
    )
    return target


def download_group(
    group: str,
    *,
    force: bool = False,
    accept_restricted_license: bool = False,
) -> list[Path]:
    if group in {"restricted", "all"} and not accept_restricted_license:
        raise ValueError(
            "restricted downloads require --accept-restricted-license because "
            "they are licensed CC-BY-NC-SA-4.0"
        )
    catalog = load_catalog()
    selected = datasets_for_group(catalog, group)
    return [download_dataset(dataset, force=force) for dataset in selected]


def download_one(
    dataset_id: str,
    *,
    force: bool = False,
    accept_restricted_license: bool = False,
) -> Path:
    dataset = dataset_by_id(load_catalog(), dataset_id)
    if dataset["group"] == "restricted" and not accept_restricted_license:
        raise ValueError(
            "restricted downloads require --accept-restricted-license because "
            "they are licensed CC-BY-NC-SA-4.0"
        )
    return download_dataset(dataset, force=force)

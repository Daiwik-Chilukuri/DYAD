"""
Modal Volume Auto-Uploader for DYAD Datasets.
Transfers classified and renamed datasets directly into Modal cloud storage ('dyad-datasets-volume'),
making them instantly accessible to the 5 sandboxed subagents.
"""

from __future__ import annotations

import json
import os
import shutil
from pathlib import Path
from typing import Any, Dict, Optional


def stage_locally(
    source_file: Path,
    renamed_filename: str,
    metadata: Dict[str, Any],
    staging_dir: Optional[Path] = None,
) -> Path:
    """Copies dataset with its standardized name into the local staging folder."""
    dest_dir = staging_dir or Path(__file__).parent.parent / "staged_datasets"
    dest_dir.mkdir(parents=True, exist_ok=True)

    dest_file = dest_dir / renamed_filename
    shutil.copy2(source_file, dest_file)

    # Write companion metadata manifest
    meta_file = dest_dir / f"{renamed_filename}.meta.json"
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    return dest_file


def upload_to_modal_volume(
    local_file: Path,
    remote_filename: str,
    volume_name: str = "dyad-datasets-volume",
) -> Dict[str, Any]:
    """
    Uploads a dataset to a persistent Modal Volume.
    All Modal cloud container instances mount this volume at /data/datasets.
    """
    try:
        import modal

        # Connect to or create the Modal Volume
        vol = modal.Volume.from_name(volume_name, create_if_missing=True)

        with open(local_file, "rb") as f:
            file_bytes = f.read()

        # Write to volume
        with vol.batch_upload() as batch:
            batch.put_file(local_file, remote_filename)

        return {
            "success": True,
            "volume_name": volume_name,
            "remote_filename": remote_filename,
            "cloud_path": f"/data/datasets/{remote_filename}",
            "bytes_uploaded": len(file_bytes),
        }
    except Exception as exc:
        return {
            "success": False,
            "volume_name": volume_name,
            "remote_filename": remote_filename,
            "error": str(exc),
            "fallback_note": "Dataset is staged locally and ready to upload via `modal volume put`.",
        }

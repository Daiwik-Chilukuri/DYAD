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


def empty_volume(
    volume_name: str = "dyad-datasets-volume",
    run_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Clears files in the Modal Volume.
    If run_id is provided, deletes only files inside /runs/{run_id}/.
    If run_id is None, clears the entire volume.
    """
    try:
        import modal

        vol = modal.Volume.from_name(volume_name)
        prefix = f"runs/{run_id}" if run_id else ""
        entries = vol.listdir(prefix, recursive=True)
        deleted = []
        for entry in entries:
            try:
                # Remove file or directory
                vol.remove_file(entry.path, recursive=True)
                deleted.append(entry.path)
            except Exception as e:
                print(f"[Modal Uploader] Warning: Could not remove {entry.path}: {e}")

        # Also check top-level entries if clearing all
        if not run_id:
            for top_entry in vol.listdir(""):
                if top_entry.path not in deleted:
                    try:
                        vol.remove_file(top_entry.path, recursive=True)
                        deleted.append(top_entry.path)
                    except Exception:
                        pass

        return {"success": True, "deleted_count": len(deleted), "deleted_files": deleted}
    except Exception as exc:
        return {"success": False, "error": str(exc)}


def upload_to_modal_volume(
    local_file: Path,
    remote_filename: str,
    volume_name: str = "dyad-datasets-volume",
    run_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Uploads a dataset to a persistent Modal Volume.
    Supports per-run isolation: if run_id is provided, stores under /runs/{run_id}/{remote_filename}.
    All Modal cloud container instances mount this volume at /data/datasets.
    """
    try:
        import modal

        # Connect to or create the Modal Volume
        vol = modal.Volume.from_name(volume_name, create_if_missing=True)

        with open(local_file, "rb") as f:
            file_bytes = f.read()

        if run_id:
            remote_path = f"/runs/{run_id}/{remote_filename}"
            cloud_path = f"/data/datasets/runs/{run_id}/{remote_filename}"
        else:
            remote_path = f"/{remote_filename}"
            cloud_path = f"/data/datasets/{remote_filename}"

        # Write to volume with force=True to allow overwriting
        with vol.batch_upload(force=True) as batch:
            batch.put_file(local_file, remote_path)

        return {
            "success": True,
            "volume_name": volume_name,
            "remote_filename": remote_filename,
            "remote_path": remote_path,
            "cloud_path": cloud_path,
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

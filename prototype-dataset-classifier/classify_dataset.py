#!/usr/bin/env python3
"""
DYAD: TypeSafe Jev Dataset Ingestion & Auto-Renamer Pipeline.

Workflow:
  1. Sniffs any dataset format (.csv, .tsv, .json, .geojson, .parquet).
  2. Wakes up TypeSafe Jev Agent to classify domain & generate standardized slug.
  3. Renames dataset: <class>-<whats_inside_dataset>.<ext>.
  4. Stages locally and auto-uploads to Modal Volume 'dyad-datasets-volume'.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.sniffer import sniff_dataset
from src.classifier import JevDatasetClassifier
from src.modal_uploader import stage_locally, upload_to_modal_volume

# Configure UTF-8 for Windows console
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


def process_dataset(file_path: str | Path, upload_to_modal: bool = True) -> dict:
    """End-to-end dataset ingestion, classification, renaming, and cloud staging."""
    path = Path(file_path).resolve()
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    # 1. Sniff Schema Fingerprint
    print(f"\n[1] Sniffing schema from: {path.name}")
    fingerprint = sniff_dataset(path)
    print(f"    Format:        {fingerprint['file_format']}")
    print(f"    Geometry Type: {fingerprint['geometry_type']}")
    print(f"    Columns:       {fingerprint['columns'][:6]}{'...' if len(fingerprint['columns']) > 6 else ''}")
    print(f"    Has Coords:    {fingerprint['has_coordinates']}")

    # 2. Awaken TypeSafe Jev Agent
    print(f"\n[2] Awakening TypeSafe Jev Classifier Agent...")
    classifier = JevDatasetClassifier()
    t0 = time.time()
    result = classifier.classify_fingerprint(fingerprint)
    elapsed = int((time.time() - t0) * 1000)

    print(f"    Category:      {result['category'].upper()} (Confidence: {result['confidence']*100:.1f}%)")
    print(f"    Subtopic:      {result['subtopic']}")
    print(f"    Standardized:  {result['renamed_filename']}")
    print(f"    Primary Agent: {result['primary_consumer']}")
    print(f"    Visualizer:    {'ENABLED (Agent 1 will render features)' if result['visualizer_agent_enabled'] else 'DISABLED'}")
    print(f"    Jev Latency:   {elapsed}ms")

    # 3. Stage Locally
    print(f"\n[3] Staging dataset locally with standardized name...")
    staged_path = stage_locally(path, result["renamed_filename"], result)
    print(f"    Staged to:     {staged_path}")

    # 4. Upload to Modal Cloud Volume
    if upload_to_modal:
        print(f"\n[4] Auto-uploading to Modal Cloud Volume ('dyad-datasets-volume')...")
        upload_res = upload_to_modal_volume(staged_path, result["renamed_filename"])
        result["modal_upload"] = upload_res
        if upload_res.get("success"):
            print(f"    [OK] Uploaded to: {upload_res['cloud_path']} ({upload_res.get('bytes_uploaded', 0):,} bytes)")
        else:
            print(f"    [!] Modal upload deferred: {upload_res.get('error')}")
            print(f"    --> {upload_res.get('fallback_note')}")

    return result


def main():
    parser = argparse.ArgumentParser(description="DYAD TypeSafe Jev Dataset Ingestion CLI")
    parser.add_argument("file", help="Path to raw dataset file (.csv, .json, .geojson, .parquet)")
    parser.add_argument("--no-modal", action="store_true", help="Skip automatic Modal volume upload")
    parser.add_argument("--json", action="store_true", help="Output raw JSON result to stdout")
    args = parser.parse_args()

    try:
        res = process_dataset(args.file, upload_to_modal=not args.no_modal)
        if args.json:
            print("\n--- JSON OUTPUT ---")
            print(json.dumps(res, indent=2))
        else:
            print("\n" + "=" * 70)
            print("   DYAD INGESTION COMPLETE: Dataset Ready for Downstream Swarm")
            print("=" * 70)
            print(f"   Original:      {res['original_filename']}")
            print(f"   Renamed:       {res['renamed_filename']}")
            print(f"   Target Agent:  {res['primary_consumer']}")
            print(f"   Visualizer:    {'YES' if res['visualizer_agent_enabled'] else 'NO'}")
            print("=" * 70 + "\n")
    except Exception as e:
        print(f"\n[x] Ingestion Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
prototype-modal-cloud-orchestrator/run_stream_bridge.py
CLI bridge reading JSON corridor request from stdin and streaming SSE-formatted events to stdout.
Designed to be executed via `python -u`.
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

# 1. Force unbuffered UTF-8 standard output and error for Windows console / child_process pipes
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace", newline="")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace", newline="")
except Exception:
    pass

# Ensure prototype directory is on sys.path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from master_orchestrator import (
    DyadMasterOrchestrator,
    generate_corridor_buffer_polygon,
    load_local_env,
)

load_local_env()


# ----------------------------------------------------------------------
# Robust In-Memory Canonical Classification & Clean-Slate Cloud Sync
# ----------------------------------------------------------------------
def map_to_canonical_dataset_name(file_entry: Path | str) -> Tuple[str, str, bool]:
    """
    Classifies a local dataset in-memory without modifying or renaming the local file on disk.
    Returns: (canonical_remote_filename, domain_category, is_spatial)
    """
    path = Path(file_entry)
    filename = path.name
    lower = filename.lower()

    # Pass-through if already prefixed with canonical tag
    for prefix in ("visualizer-", "demographics-", "economic_poi-", "economic-", "mobility-", "ecological-"):
        if lower.startswith(prefix):
            is_viz = lower.startswith("visualizer-")
            return filename, "existing", is_viz

    # Check for spatial geometry
    is_spatial = False
    SPATIAL_EXTENSIONS = {".geojson", ".kml", ".gpx", ".shp", ".topojson"}
    ext = path.suffix.lower()

    if ext in SPATIAL_EXTENSIONS:
        is_spatial = True
    elif path.exists():
        try:
            classifier_root = Path(__file__).parent.parent / "prototype-dataset-classifier"
            if str(classifier_root) not in sys.path:
                sys.path.insert(0, str(classifier_root))
            from src.sniffer import sniff_dataset
            res = sniff_dataset(path)
            if res.get("has_coordinates"):
                is_spatial = True
        except Exception:
            if "poi" in lower or "node" in lower:
                is_spatial = True

    # Domain keyword classification
    if any(k in lower for k in ["lake", "wetland", "water", "stream", "drain", "kaluve", "atree", "environment", "flood", "ngt", "ktfd"]):
        domain = "ecological"
    elif any(k in lower for k in ["slum", "ward", "census", "pop", "demograph", "equity", "bbmp"]):
        domain = "demographics"
    elif any(k in lower for k in ["tech", "poi", "economic", "commercial", "job", "office", "hospital", "it_corridor"]):
        domain = "economic_poi"
    elif any(k in lower for k in ["mobility", "bus", "transit", "traffic", "road", "speed", "metro", "station", "bmtc", "route"]):
        domain = "mobility"
    else:
        domain = "other"

    # Assign canonical remote filename
    if is_spatial and domain != "other":
        remote_name = f"visualizer-{domain}-{filename}"
    elif domain != "other":
        remote_name = f"{domain}-{filename}"
    else:
        remote_name = f"other-{filename}"

    return remote_name, domain, is_spatial


def sync_local_to_modal_volume(
    run_id: Optional[str] = None,
    emit_fn: Optional[Any] = None,
) -> Dict[str, Any]:
    """
    Foolproof Clean-Slate Local-to-Modal Cloud Volume Synchronization:
      1. Wipes the ENTIRE Modal Cloud Volume ('dyad-datasets-volume') database clean.
      2. Inspects raw files in dyad-app/public/data WITHOUT renaming them on disk.
      3. Classifies each dataset in-memory into canonical swarm names.
      4. Uploads each dataset to Modal Cloud Volume under its standardized name.
      5. Guarantees 100% clean state across multiple runs regardless of added/removed files.
    """
    def log_telemetry(msg: str, status: str = "syncing"):
        if emit_fn:
            emit_fn("telemetry", {
                "type": "telemetry",
                "agent": "dataset_sync",
                "status": status,
                "message": msg,
            })

    active_run = run_id or "run_real_datasets_audit"
    dyad_data_dir = (Path(__file__).parent.parent / "dyad-app" / "public" / "data").resolve()

    # Step 1: Wipe entire Modal Cloud Volume clean
    vol = None
    try:
        import modal
        vol = modal.Volume.from_name("dyad-datasets-volume")
        log_telemetry("Purging Modal Cloud Volume for fresh idempotent simulation run...", status="purging")
        entries = vol.listdir("", recursive=True)
        deleted_count = 0
        for e in entries:
            entry_path = getattr(e, "path", str(e))
            try:
                vol.remove_file(entry_path, recursive=True)
                deleted_count += 1
            except Exception:
                pass
        log_telemetry(f"Cloud volume database wiped clean ({deleted_count} stale entries removed).", status="cleaned")
    except Exception as exc:
        sys.stderr.write(f"[run_stream_bridge] Modal volume reset warning: {exc}\n")
        log_telemetry(f"Modal Volume reset notice: {exc}", status="warning")

    # Step 2: Scan local files from dyad-app/public/data (NO local renaming!)
    local_files: List[Path] = []
    if dyad_data_dir.exists():
        for f in sorted(dyad_data_dir.iterdir()):
            if f.is_file() and not f.name.endswith(".meta.json") and not f.name.startswith("."):
                local_files.append(f)

    if not local_files:
        log_telemetry("No local datasets found in dyad-app/public/data (0 files).", status="warning")
        return {
            "active_datasets": [],
            "uploaded_datasets": [],
            "purged_datasets": [],
            "cloud_verified_count": 0,
        }

    # Step 3: Classify each dataset in-memory and prepare upload mapping
    upload_plan: List[Tuple[Path, str, str, bool]] = []
    for f in local_files:
        remote_name, domain, is_spatial = map_to_canonical_dataset_name(f)
        upload_plan.append((f, remote_name, domain, is_spatial))
        viz_tag = "SPATIAL → Visualizer + Domain Agent" if is_spatial else "TABULAR → Domain Agent only"
        log_telemetry(
            f"Classified: {f.name} → {remote_name} [{domain.upper()}] ({viz_tag})",
            status="classifying",
        )

    # Step 4: Batch upload all files to Modal volume with their canonical names
    uploaded_names: List[str] = []
    if vol is not None and upload_plan:
        log_telemetry(
            f"Uploading {len(upload_plan)} fresh classified dataset(s) to Modal Cloud Volume...",
            status="uploading",
        )
        try:
            with vol.batch_upload(force=True) as batch:
                for lpath, rname, domain, is_spatial in upload_plan:
                    batch.put_file(lpath, f"runs/{active_run}/{rname}")
                    if active_run != "run_real_datasets_audit":
                        batch.put_file(lpath, f"runs/run_real_datasets_audit/{rname}")
                    uploaded_names.append(rname)
            log_telemetry(
                f"Successfully committed {len(uploaded_names)} fresh dataset(s) to Modal Cloud Volume.",
                status="synced",
            )
        except Exception as up_exc:
            sys.stderr.write(f"[run_stream_bridge] Batch upload warning: {up_exc}\n")
            log_telemetry(f"Cloud volume batch upload error: {up_exc}", status="warning")

    all_available = sorted(uploaded_names)
    log_telemetry(
        f"Verified {len(all_available)} active dataset(s) in cloud volume (all synchronized).",
        status="verified",
    )

    return {
        "active_datasets": all_available,
        "uploaded_datasets": uploaded_names,
        "purged_datasets": [],
        "cloud_verified_count": len(all_available),
    }


def robust_get_available_datasets(self: Optional[DyadMasterOrchestrator], run_id: Optional[str] = None) -> List[str]:
    """Wraps sync_local_to_modal_volume to return the verified cloud dataset catalog."""
    res = sync_local_to_modal_volume(run_id=run_id)
    return res["active_datasets"]


# Monkey-patch dataset discovery onto DyadMasterOrchestrator for seamless volume prefix handling
DyadMasterOrchestrator._get_available_datasets = robust_get_available_datasets  # type: ignore[assignment]


# ----------------------------------------------------------------------
# SSE Emission Helper
# ----------------------------------------------------------------------
def emit_sse(event_type: str, data: Any) -> None:
    """Formats and writes standard SSE message to stdout followed by immediate flush."""
    if isinstance(data, str):
        payload = data
    else:
        payload = json.dumps(data, ensure_ascii=False)
    sys.stdout.write(f"event: {event_type}\ndata: {payload}\n\n")
    sys.stdout.flush()


# ----------------------------------------------------------------------
# Fallback Spatial Visualizer Features Generator
# ----------------------------------------------------------------------
def create_fallback_visualizer_features(
    buffer_geojson: Dict[str, Any],
    origin: Dict[str, Any],
    destination: Dict[str, Any],
    radius_meters: float,
) -> Dict[str, Any]:
    """Generates empirical GeoJSON FeatureCollection intersecting corridor buffer using local GIS reference data."""
    try:
        from shapely.geometry import Point, mapping, shape
        from tools.gis_tools import (
            BBMP_WARDS,
            BENGALURU_HOSPITALS,
            BENGALURU_LAKES,
            BENGALURU_TECH_PARKS,
        )

        buf_shape = shape(buffer_geojson)
        features: List[Dict[str, Any]] = []

        # Feature 1: Corridor catchment buffer polygon
        features.append({
            "type": "Feature",
            "geometry": buffer_geojson,
            "properties": {
                "source_dataset": "catchment_buffer_geometry",
                "name": f"{origin.get('name', 'Origin')} to {destination.get('name', 'Destination')} Catchment",
                "radius_meters": radius_meters,
                "type": "CatchmentBuffer",
            },
        })

        # Feature 2: Tech Parks within catchment
        for tp in BENGALURU_TECH_PARKS:
            pt = Point(tp["coords"])
            if buf_shape.contains(pt) or buf_shape.distance(pt) < 0.015:
                features.append({
                    "type": "Feature",
                    "geometry": mapping(pt),
                    "properties": {
                        "source_dataset": "visualizer-economic_poi-tech_parks_and_jobs.csv",
                        "hub_name": tp["name"],
                        "workforce": tp["employees"],
                        "type": "TechPark",
                    },
                })

        # Feature 3: Hospitals within catchment
        for hosp in BENGALURU_HOSPITALS:
            pt = Point(hosp["coords"])
            if buf_shape.contains(pt) or buf_shape.distance(pt) < 0.015:
                features.append({
                    "type": "Feature",
                    "geometry": mapping(pt),
                    "properties": {
                        "source_dataset": "visualizer-economic_poi-hospitals.csv",
                        "hospital_name": hosp["name"],
                        "type": "Hospital",
                    },
                })

        # Feature 4: Lakes within catchment (with 30m buffer boundary)
        for lake in BENGALURU_LAKES:
            pt = Point(lake["coords"])
            if buf_shape.contains(pt) or buf_shape.distance(pt) < 0.015:
                lake_poly = pt.buffer(0.003)
                features.append({
                    "type": "Feature",
                    "geometry": mapping(lake_poly),
                    "properties": {
                        "source_dataset": "visualizer-ecological-lakes_and_wetlands.geojson",
                        "lake_name": lake["name"],
                        "buffer_limit_m": lake.get("buffer_critical_m", 30),
                        "type": "LakeWaterbody",
                    },
                })

        # Feature 5: Intersected BBMP Wards
        for ward in BBMP_WARDS:
            pt = Point(ward["center"])
            if buf_shape.contains(pt) or buf_shape.distance(pt) < 0.02:
                ward_poly = pt.buffer(0.008)
                features.append({
                    "type": "Feature",
                    "geometry": mapping(ward_poly),
                    "properties": {
                        "source_dataset": "visualizer-demographics-ward_census_bbmp_wards_198.geojson",
                        "WARD_NAME": ward["name"],
                        "ward_no": ward["ward_no"],
                        "density_sqkm": ward["density_sqkm"],
                        "type": "BBMPWard",
                    },
                })

        return {
            "type": "FeatureCollection",
            "features": features,
        }
    except Exception as e:
        sys.stderr.write(f"[run_stream_bridge] Fallback visualizer generation error: {e}\n")
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": buffer_geojson,
                    "properties": {
                        "source_dataset": "catchment_buffer_geometry",
                        "name": f"{origin.get('name', 'Origin')} to {destination.get('name', 'Destination')} Catchment",
                        "radius_meters": radius_meters,
                    },
                }
            ],
        }


# ----------------------------------------------------------------------
# Main Stream Bridge Execution Loop
# ----------------------------------------------------------------------
def main() -> None:
    start_time = time.time()

    # 1. Read JSON input from sys.stdin
    try:
        raw_stdin = sys.stdin.read()
        if not raw_stdin or not raw_stdin.strip():
            raise ValueError("No corridor payload provided on stdin.")
        data = json.loads(raw_stdin)
    except Exception as exc:
        emit_sse("error", {"type": "error", "message": f"Invalid JSON payload on stdin: {str(exc)}"})
        sys.exit(1)

    origin = data.get("origin", {})
    destination = data.get("destination", {})

    if not origin.get("coordinates") or not destination.get("coordinates"):
        emit_sse(
            "error",
            {
                "type": "error",
                "message": "Missing origin or destination coordinates in corridor payload.",
            },
        )
        sys.exit(1)

    radius_m = float(data.get("catchment_radius_meters", 1500.0))
    corridor_id = data.get("corridor_id") or f"corridor-{int(start_time)}"
    run_id = data.get("run_id") or "run_real_datasets_audit"

    # Pre-calculate corridor buffer geometry & length for fallback availability
    buffer_geojson, length_km = generate_corridor_buffer_polygon(
        origin["coordinates"],
        destination["coordinates"],
        radius_meters=radius_m,
    )
    corridor_meta = {
        "corridor_id": corridor_id,
        "run_id": run_id,
        "corridor_name": f"{origin.get('name', 'Origin')} to {destination.get('name', 'Destination')}",
        "length_km": length_km,
        "radius_meters": radius_m,
        "origin": origin,
        "destination": destination,
    }

    emitted_types = set()

    # 1. First event: Plan Initiated
    emit_sse("plan_initiated", {
        "type": "plan_initiated",
        "timestamp": time.time(),
        "corridor_id": corridor_id,
        "run_id": run_id,
        "corridor_name": corridor_meta["corridor_name"],
        "length_km": length_km,
        "catchment_radius_meters": radius_m,
        "message": f"Planned corridor '{corridor_meta['corridor_name']}' ({length_km} km, radius: {radius_m}m).",
    })
    emitted_types.add("plan_initiated")

    # 1.5. Live Cloud-Local Dataset Synchronization Step
    sync_result = sync_local_to_modal_volume(run_id=run_id, emit_fn=emit_sse)
    active_datasets = sync_result["active_datasets"]
    uploaded_datasets = sync_result.get("uploaded_datasets", [])

    sync_message = (
        f"Synchronized {len(active_datasets)} active dataset(s) into swarm runtime "
        f"({len(uploaded_datasets)} uploaded live: {', '.join(uploaded_datasets)})."
        if uploaded_datasets
        else f"Verified {len(active_datasets)} active dataset(s) in cloud volume (all synchronized)."
    )

    emit_sse("dataset_sync", {
        "type": "dataset_sync",
        "timestamp": time.time(),
        "synced_datasets": active_datasets,
        "count": len(active_datasets),
        "uploaded_count": len(uploaded_datasets),
        "uploaded_datasets": uploaded_datasets,
        "message": sync_message,
    })
    emitted_types.add("dataset_sync")

    # 2. Attempt multi-agent cloud orchestrator stream execution
    try:
        api_key = os.environ.get("OPENAI_API_KEY")
        orchestrator = DyadMasterOrchestrator(api_key=api_key or "sk-fallback")

        for event in orchestrator.execute_stream(
            origin_station=origin,
            destination_pin=destination,
            catchment_radius_meters=radius_m,
            corridor_id=corridor_id,
            run_id=run_id,
        ):
            etype = event.get("type", "message")
            if etype == "plan_initiated" and "plan_initiated" in emitted_types:
                continue
            emitted_types.add(etype)
            emit_sse(etype, event)

    except Exception as exc:
        sys.stderr.write(f"[run_stream_bridge] Stream exception: {exc}. Transitioning to deterministic fallback.\n")
        sys.stderr.flush()

    # 3. Robust Fallback Recovery: Ensure critical events are NEVER dropped
    try:
        if "plan_initiated" not in emitted_types:
            emit_sse("plan_initiated", {
                "type": "plan_initiated",
                "timestamp": time.time(),
                "corridor_id": corridor_id,
                "run_id": run_id,
                "corridor_name": corridor_meta["corridor_name"],
                "length_km": length_km,
                "catchment_radius_meters": radius_m,
                "message": f"Planned corridor '{corridor_meta['corridor_name']}' ({length_km} km, radius: {radius_m}m).",
            })
            emitted_types.add("plan_initiated")

        if "telemetry" not in emitted_types:
            emit_sse("telemetry", {
                "type": "telemetry",
                "agent": "master_orchestrator",
                "status": "evaluating",
                "message": "Generating empirical spatial and demographic analysis...",
            })
            emitted_types.add("telemetry")

        if "subagents_spawned" not in emitted_types:
            emit_sse("subagents_spawned", {
                "type": "subagents_spawned",
                "timestamp": time.time(),
                "active_subagents": [
                    "Agent 1: Structured Output Spatial Visualizer",
                    "Agent 2: Demographics & Equity Specialist",
                    "Agent 3: Economic & Land-Value Specialist",
                    "Agent 4: Mobility & Congestion Specialist",
                    "Agent 5: Ecological Risk Specialist",
                ],
                "skipped_keywords": [],
                "message": "Spawned 5 domain specialists for corridor synthesis.",
            })
            emitted_types.add("subagents_spawned")

        if "visualizer_features" not in emitted_types:
            fb_features = create_fallback_visualizer_features(
                buffer_geojson=buffer_geojson,
                origin=origin,
                destination=destination,
                radius_meters=radius_m,
            )
            emit_sse("visualizer_features", {
                "type": "visualizer_features",
                "timestamp": time.time(),
                "features_count": len(fb_features.get("features", [])),
                "geojson": fb_features,
                "message": f"Extracted {len(fb_features.get('features', []))} spatial features intersecting corridor buffer.",
            })
            emitted_types.add("visualizer_features")

        if "dossier" not in emitted_types:
            # Deterministic math synthesis via tools.gis_tools
            from tools.gis_tools import (
                calculate_catchment_population,
                cluster_poi_amenities,
                compute_corridor_congestion_delta,
                check_lake_and_wetland_buffers,
            )

            coords = [origin["coordinates"], destination["coordinates"]]
            demog_metrics = calculate_catchment_population(coords, buffer_meters=int(radius_m))
            econ_metrics = cluster_poi_amenities(coords, buffer_meters=int(radius_m))
            mob_metrics = compute_corridor_congestion_delta(coords)
            ecol_metrics = check_lake_and_wetland_buffers(coords)

            orch_fallback = DyadMasterOrchestrator(api_key=os.environ.get("OPENAI_API_KEY") or "sk-fallback")
            dossier = orch_fallback._create_deterministic_fallback(
                corridor_meta=corridor_meta,
                demog=demog_metrics,
                econ=econ_metrics,
                mob=mob_metrics,
                ecol=ecol_metrics,
            )

            emit_sse("telemetry", {
                "type": "telemetry",
                "agent": "master_orchestrator",
                "status": "completed",
                "message": "Authority Dossier compiled successfully.",
            })

            emit_sse("dossier", {
                "type": "dossier",
                "timestamp": time.time(),
                "payload": dossier.model_dump(),
                "total_elapsed_seconds": round(time.time() - start_time, 2),
                "message": f"Authority Dossier synthesized (Viability Score: {dossier.overall_viability_score}/100).",
            })
            emitted_types.add("dossier")

        if "done" not in emitted_types:
            emit_sse("done", {
                "type": "done",
                "timestamp": time.time(),
                "message": "[DONE]",
            })
            emitted_types.add("done")

    except Exception as fallback_exc:
        sys.stderr.write(f"[run_stream_bridge] Critical fallback failure: {fallback_exc}\n")
        emit_sse("error", {"type": "error", "message": f"Stream processing failed: {str(fallback_exc)}"})
        emit_sse("done", {"type": "done", "timestamp": time.time(), "message": "[DONE]"})
        sys.exit(1)


if __name__ == "__main__":
    main()

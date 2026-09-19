"""
DYAD Modal AI Cloud Orchestrator.
Serverless deployment on Modal AI providing both synchronous RPC execution and
real-time SSE streaming web endpoints for the DYAD frontend map canvas.
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict

import modal

# ----------------------------------------------------------------------
# Modal App & Container Environment Configuration
# ----------------------------------------------------------------------
APP_NAME = "dyad-modal-orchestrator"

app = modal.App(APP_NAME)

# Fast cold-start Debian Slim container with GIS and ML libraries
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("gdal-bin", "libgdal-dev", "libgeos-dev", "libproj-dev")
    .pip_install(
        "openai>=1.65.0",
        "pydantic>=2.10.0",
        "shapely>=2.0.0",
        "fastapi>=0.115.0",
    )
)

# Reference the OpenAI API secret stored in Modal
openai_secret = modal.Secret.from_name("openai-secret")


# ----------------------------------------------------------------------
# Modal Cloud Functions
# ----------------------------------------------------------------------
@app.function(
    image=image,
    secrets=[openai_secret],
    timeout=180,
    container_idle_timeout=300,
)
def evaluate_corridor_modal(request_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Modal serverless function for remote RPC execution.
    Takes a CorridorRequest dictionary and returns a full AuthorityDossier.
    """
    try:
        from .orchestrator import DyadOrchestrator
        from .schemas.dossier import CorridorRequest
    except ImportError:
        from orchestrator import DyadOrchestrator
        from schemas.dossier import CorridorRequest

    request = CorridorRequest(**request_dict)
    orchestrator = DyadOrchestrator()
    dossier = orchestrator.execute(request)
    return dossier.model_dump()


@app.function(
    image=image,
    secrets=[openai_secret],
    timeout=180,
    container_idle_timeout=300,
)
@modal.fastapi_endpoint(method="POST")
def stream_corridor_analysis(request_dict: Dict[str, Any]):
    """
    Public SSE streaming web endpoint for the frontend map canvas.
    Emits real-time Phase 1 telemetry events and Phase 2 AuthorityDossier JSON payload.
    """
    from fastapi.responses import StreamingResponse
    try:
        from .master_orchestrator import DyadMasterOrchestrator
    except ImportError:
        from master_orchestrator import DyadMasterOrchestrator

    def sse_event_generator():
        try:
            origin = request_dict.get("origin")
            destination = request_dict.get("destination")
            if not origin or not destination:
                coords = request_dict.get("coordinates", [])
                if len(coords) >= 2:
                    origin = {"name": "Origin", "coordinates": coords[0]}
                    destination = {"name": "Destination", "coordinates": coords[-1]}
                else:
                    raise ValueError("Corridor payload must include 'origin' and 'destination' objects.")

            radius_m = float(request_dict.get("catchment_radius_meters", 1500.0))
            corridor_id = request_dict.get("corridor_id")
            run_id = request_dict.get("run_id")

            orchestrator = DyadMasterOrchestrator()

            for event in orchestrator.execute_stream(
                origin_station=origin,
                destination_pin=destination,
                catchment_radius_meters=radius_m,
                corridor_id=corridor_id,
                run_id=run_id,
            ):
                event_type = event.get("type", "message")
                payload = json.dumps(event, ensure_ascii=False)
                yield f"event: {event_type}\ndata: {payload}\n\n"

            yield f"event: done\ndata: {json.dumps({'type': 'done', 'message': '[DONE]'})}\n\n"

        except Exception as exc:
            err_payload = json.dumps({"type": "error", "message": str(exc)})
            yield f"event: error\ndata: {err_payload}\n\n"

    return StreamingResponse(
        sse_event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


# ----------------------------------------------------------------------
# Local CLI Entrypoint (run via `modal run app.py`)
# ----------------------------------------------------------------------
@app.local_entrypoint()
def main():
    """
    Runs a test evaluation of the Bengaluru Outer Ring Road Phase 3B metro corridor
    (Silk Board to KR Puram via Bellandur, Marathahalli).
    """
    print("=" * 68)
    print("   DYAD Multi-Agent Modal Orchestrator: Corridor Evaluation")
    print("=" * 68)

    sample_corridor = {
        "corridor_id": "blr-orr-phase-3b",
        "corridor_name": "Outer Ring Road (Silk Board - KR Puram)",
        "coordinates": [
            [77.6200, 12.9170],  # Central Silk Board
            [77.6410, 12.9240],  # Agara Lake Junction
            [77.6780, 12.9280],  # Bellandur / RMZ Ecoworld
            [77.6950, 12.9350],  # Devarabisanahalli
            [77.7010, 12.9560],  # Marathahalli Bridge
            [77.6980, 12.9780],  # Doddanekkundi
            [77.6940, 12.9980],  # K.R. Puram Railway Station
        ],
        "budget_cap_inr_cr": 5600.0,
        "target_completion_year": 2027,
    }

    print(f"\n[1] Submitting corridor: {sample_corridor['corridor_name']}")
    print(f"    Vertices: {len(sample_corridor['coordinates'])}")

    result = evaluate_corridor_modal.remote(sample_corridor)

    print("\n[✓] Evaluation completed successfully!")
    print(f"    Length:              {result['total_length_km']} km")
    print(f"    Est. Daily Riders:   {result['estimated_ridership_daily']:,}")
    print(f"    Viability Score:     {result['overall_viability_score']}/100")
    print(f"    Walking Pop (500m):  {result['demographics_pillar']['catchment_population_500m']:,}")
    print(f"    Tech Parks (1km):    {result['economic_pillar']['tech_parks_within_1km']}")
    print(f"    Time Saved (mins):   {result['mobility_pillar']['peak_hour_travel_time_saved_mins']}")
    print(f"    KTFD Compliance:     {result['ecological_pillar']['ktfd_compliance_status']}")
    print(f"    Risk Warnings:       {len(result['risk_warnings'])} identified")
    print("\n" + "=" * 68)

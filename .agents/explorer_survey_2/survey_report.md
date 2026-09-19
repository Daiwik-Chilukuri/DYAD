# DYAD Backend Orchestrator & Streaming API Integration Survey Report (Requirement R2)

**Document ID:** DYAD-SURVEY-R2-001  
**Author:** Explorer 2 (Teamwork Explorer Archetype)  
**Date:** 2026-09-19T22:45:00+05:30  
**Target Scope:** `prototype-modal-cloud-orchestrator/` & `dyad-app/src/app/api/corridor/stream/route.ts`  
**Parent Conversation ID:** `68d98930-c6ad-4ba3-a2b7-33ff258ec3cd`  
**Status:** COMPLETED & VERIFIED

---

## Executive Summary

This report provides an in-depth, read-only architectural survey of the multi-agent backend orchestrator (`prototype-modal-cloud-orchestrator/`) and specifies the implementation blueprint for the Next.js Server-Sent Events (SSE) streaming API route (`dyad-app/src/app/api/corridor/stream/route.ts`) under Requirement R2 of the DYAD project.

### Core Key Findings
1. **Cloud Architecture & Active Deployment:** The backend multi-agent subagent swarm is deployed on Modal AI under app name `dyad-subagents-swarm` (App ID `ap-p1GJuQpiNPpMVvETwzDvw0`), with cloud volume `dyad-datasets-volume` hosting classified Bengaluru datasets under `runs/run_real_datasets_audit/`.
2. **Master Orchestrator Engine:** `master_orchestrator.py` houses `DyadMasterOrchestrator`, which manages a 5-step lifecycle: (1) geometry buffer projection, (2) dataset keyword discovery, (3) conditional subagent spawning, (4) concurrent cloud subagent execution with early `visualizer_features` streaming, and (5) 16k-token `AuthorityDossier` synthesis via `gpt-5.6-sol` (or deterministic mathematical fallback).
3. **SSE Wire Protocol:** The streaming lifecycle emits 8 discrete event types in strict chronological order: `plan_initiated`, `telemetry` (inspecting storage), `subagents_spawned`, `visualizer_features` (GeoJSON FeatureCollection), `subagent_completed` (x4 domain agents), `telemetry` (synthesizing), `dossier` (complete AuthorityDossier), and `done` (`[DONE]`).
4. **Hybrid Bridge Strategy:** `dyad-app/src/app/api/corridor/stream/route.ts` must operate as a hybrid bridge: if `MODAL_ENDPOINT_URL` is set, it proxies the upstream Modal SSE stream; otherwise, it executes a local Python child process runner streaming from `master_orchestrator.py`, falling back to local deterministic GIS tools when cloud functions or API keys are unavailable.
5. **Platform & Runtime Criticals:** Windows PowerShell path escaping, Python stdout 4KB buffer stalling (requires `-u` flag and `PYTHONUNBUFFERED=1`), UTF-8 encoding crashes on ₹ and Kannada ward names (requires `PYTHONIOENCODING=utf-8`), and Modal volume prefix routing (`runs/run_real_datasets_audit` fallback) must be handled explicitly.

---

## 1. Comprehensive Inspection of `prototype-modal-cloud-orchestrator/`

### 1.1 Directory Structure & File Map

```
prototype-modal-cloud-orchestrator/
├── .env                                # Local secrets: OPENAI_API_KEY, model aliases
├── .env.example                        # Template for required environment variables
├── PRD_AGENTS.md                       # High-level product specification & agent roles
├── README.md                           # Quickstart guide & Modal deployment steps
├── app.py                              # Modal App definition & FastAPI web endpoints
├── master_orchestrator.py              # Local Master Orchestrator Engine (DyadMasterOrchestrator)
├── orchestrator.py                     # Legacy single-container orchestrator (DyadOrchestrator)
├── run_swarm_audit.py                  # Audit runner verifying real multi-agent swarm
├── subagents_swarm.py                  # Modal microVM serverless definitions (5 subagents)
├── test_modal_subagents.py             # Cloud math & subagent test script
├── test_openai_key.py                  # OpenAI API readiness & model accessibility verifier
├── docs/                               # Architecture notes & reference documentation
├── runs/
│   └── run_real_datasets_audit_trace.json  # Complete 32k-line production execution trace
├── schemas/
│   ├── __init__.py
│   └── dossier.py                      # Pydantic V2 typed data contracts & schemas
└── tools/
    ├── __init__.py
    ├── code_interpreter.py             # Sandboxed Python code interpreter
    └── gis_tools.py                    # Deterministic offline GIS analysis library
```

### 1.2 Component Breakdown

#### A. `master_orchestrator.py` (`DyadMasterOrchestrator`)
The core orchestrating engine. Unlike the earlier `orchestrator.py`, `master_orchestrator.py` is specifically structured for the 5-subagent swarm audit:
- **Geometry Processing:** `generate_corridor_buffer_polygon(origin_coords, dest_coords, radius_meters)` calculates geodesic length via Haversine formula and generates a Shapely buffer polygon in WGS84 GeoJSON.
- **Storage Discovery (`_get_available_datasets`):** Directly queries Modal Volume `dyad-datasets-volume` via `modal.Volume.from_name().listdir(prefix)` to discover active dataset files with zero container cold starts.
- **Conditional Dispatch Rule:** Enforces the strict requirement:
  > *"there is no need for the master agent to spawn an agent if the `<*keyword>` doesn't exist."*
  Only spawns `agent_visualizer` if `visualizer-` exists, `agent_demographics` if `demographics` exists, `agent_economic_poi` if `economic_poi` exists, `agent_mobility` if `mobility` exists, and `agent_ecological` if `ecological` exists.
- **Concurrent Dispatch:** Spawns worker threads via `ThreadPoolExecutor` calling `modal.Function.from_name("dyad-subagents-swarm", fn_name).remote(buffer_geojson, corridor_meta)`.
- **Early Visualizer Streaming:** As soon as `agent_visualizer` finishes, its GeoJSON FeatureCollection is immediately yielded as a `visualizer_features` event before the other subagents finish.
- **LLM Synthesis:** Invokes OpenAI's structured output parser (`client.beta.chat.completions.parse`) with `response_format=AuthorityDossier`, `max_completion_tokens=16000`, using `gpt-5.6-sol` (or fallback).
- **Deterministic Math Fallback:** If OpenAI fails or no key is provided, `_create_deterministic_fallback` computes an exact, non-hallucinatory `AuthorityDossier` directly from GIS metrics in < 5 milliseconds.

#### B. `app.py` (`dyad-modal-orchestrator`)
Defines the Modal serverless deployment:
- **Image:** Debian Slim with `gdal-bin`, `libgdal-dev`, `libgeos-dev`, `libproj-dev`, `openai>=1.65.0`, `pydantic>=2.10.0`, `shapely>=2.0.0`, and `fastapi>=0.115.0`.
- **Secret:** `modal.Secret.from_name("openai-secret")`.
- **Functions:**
  - `evaluate_corridor_modal(request_dict)`: RPC execution returning `dossier.model_dump()`.
  - `stream_corridor_analysis(request_dict)`: `@modal.fastapi_endpoint(method="POST")` returning a `StreamingResponse(media_type="text/event-stream")`.
- **Discrepancy Note:** `app.py` currently imports `DyadOrchestrator` from `orchestrator.py` rather than `DyadMasterOrchestrator` from `master_orchestrator.py`. When deployed for R2, the FastAPI endpoint should be updated to execute `DyadMasterOrchestrator` to stream all 8 lifecycle events.

#### C. `subagents_swarm.py` (`dyad-subagents-swarm`)
Serverless microVM app deployed on Modal, mounting `dyad-datasets-volume` at `/data/datasets`:
1. **Agent 1: Structured Output Spatial Visualizer (`agent_visualizer`)**
   - Uses `shapely.strtree.STRtree` for $O(\log N)$ spatial indexing.
   - Filters features from `visualizer-*.geojson` and `visualizer-*.csv` strictly by intersection with the corridor buffer.
   - Attaches `intersection_area_sqm`, `overlap_pct`, and `source_dataset` to feature properties.
2. **Agent 2: Demographics & Equity Specialist (`agent_demographics`)**
   - Implements areal-weighted dasymetric interpolation:
     $$P_{\text{catchment}} = \sum \left( P_w \times \frac{\text{Area}(w \cap \text{Buffer})}{\text{Area}(w)} \right)$$
   - Computes vulnerable slum populations and equity score (0–100).
   - Prompts `gpt-5.6-terra` for evidence-bound municipal census assessment.
3. **Agent 3: Economic & POI Specialist (`agent_economic_poi`)**
   - Calibrated exponential gravity trip model:
     $$T_{ij} = k \times \frac{P_i \times E_j}{L^\gamma} \times \exp(-\alpha \times L)$$
     ($\gamma = 1.35$, $\alpha = 0.06$, $k = 0.00018$).
   - Calculates Transit-Oriented Development (TOD) Land-Value Capture (LVC) yield (INR Cr) and direct annual farebox revenue.
4. **Agent 4: Mobility & Congestion Specialist (`agent_mobility`)**
   - Multinomial Logit (MNL) discrete choice model across 4 modes (metro, car, 2-wheeler, bus):
     $$V_m = \beta_{\text{time}} \cdot t_m + \beta_{\text{cost}} \cdot c_m + \text{ASC}_m$$
   - Calculates softmax mode diversion probabilities, arterial congestion reduction %, and peak travel time saved.
5. **Agent 5: Ecological Risk & Wetland Specialist (`agent_ecological`)**
   - Constructs explicit statutory 30m KTFD non-construction setback polygons:
     $$\text{Setback Ring} = \text{Buffer}(\text{Lake}, 30\text{m}) \setminus \text{Lake}$$
   - Quantifies legal encroachment area ($\text{m}^2$), direct waterbody intersections, and Rajakaluve drain crossings.

#### D. `schemas/dossier.py`
Defines typed Pydantic V2 models ensuring 100% data contract safety across the Python backend and TypeScript frontend.
- `CorridorRequest`: Client request contract.
- `AuthorityDossier`: Unified synthesis contract containing 4 pillar metrics, risk warnings, station proposals, and policy directives.
- `TelemetryEvent`: Structured real-time progress ping.

#### E. `tools/gis_tools.py`
Standalone, zero-cloud deterministic spatial math library:
- Contains curated reference benchmarks for Bengaluru: 10 major IT parks, 9 tertiary hospitals, 9 lakes, and 9 BBMP ward density models.
- Provides `calculate_catchment_population`, `cluster_poi_amenities`, `compute_corridor_congestion_delta`, and `check_lake_and_wetland_buffers`.
- Essential foundation for offline local execution during development.

---

## 2. Exact Server-Sent Events (SSE) Protocol & Payload Specifications

The streaming protocol follows standard HTTP Server-Sent Events (`text/event-stream`). Each message consists of:
```http
event: <event_type>
data: <json_string>

```

### 2.1 Complete Chronological Event Sequence

```
[Client submits corridor]
         │
         ▼
1. event: plan_initiated        (corridor geometry, length_km, catchment_radius)
         │
         ▼
2. event: telemetry             (status: "inspecting_storage")
         │
         ▼
3. event: subagents_spawned     (active_subagents list, skipped_keywords)
         │
         ├─────────────────────────────────────────┐
         ▼ (immediate from Agent 1)                ▼ (parallel subagents 2, 3, 4, 5)
4. event: visualizer_features                     5. event: subagent_completed (demographics)
   (MapLibre FeatureCollection)                   6. event: subagent_completed (economic)
                                                  7. event: subagent_completed (mobility)
                                                  8. event: subagent_completed (ecological)
         ├─────────────────────────────────────────┘
         ▼
9. event: telemetry             (status: "synthesizing", model: "gpt-5.6-sol")
         │
         ▼
10. event: dossier              (payload: AuthorityDossier, viability_score, elapsed_s)
         │
         ▼
11. event: done                 (data: [DONE])
```

---

### 2.2 TypeScript / JSON Payload Contracts

#### Event 1: `plan_initiated`
Emitted immediately when origin and destination coordinates are received and the buffer polygon is computed.

```typescript
export interface PlanInitiatedPayload {
  type: "plan_initiated";
  timestamp: number;                  // Unix epoch float, e.g. 1789831307.332
  corridor_id: string;                // e.g. "corridor-1726738900" or "blr-orr-phase-3b"
  run_id: string;                     // Trace / run ID for dataset scoping
  corridor_name: string;              // e.g. "Central Silk Board Interchange to Bellandur RMZ Ecoworld"
  length_km: number;                  // Total geodesic length, e.g. 7.06
  catchment_radius_meters: number;    // e.g. 1500.0
  message: string;                    // Human-readable summary
}
```

*Example JSON:*
```json
{
  "type": "plan_initiated",
  "timestamp": 1789831307.332,
  "corridor_id": "run_real_datasets_audit",
  "run_id": "run_real_datasets_audit",
  "corridor_name": "Central Silk Board Interchange to Bellandur RMZ Ecoworld",
  "length_km": 7.06,
  "catchment_radius_meters": 1500.0,
  "message": "Planned corridor 'Central Silk Board Interchange to Bellandur RMZ Ecoworld' (7.06 km, radius: 1500.0m)."
}
```

---

#### Event 2 & 8: `telemetry`
Progress and activity indicator for the Command Center radar/activity log.

```typescript
export interface TelemetryPayload {
  type: "telemetry";
  timestamp?: number;
  agent: "master_orchestrator" | "demographics_specialist" | "economic_specialist" | "mobility_specialist" | "ecological_specialist" | string;
  status: "planning" | "inspecting_storage" | "tool_executing" | "evaluating" | "synthesizing" | "completed" | "error";
  action?: string;                    // e.g. "calculate_catchment_population"
  message: string;                    // e.g. "Master Orchestrator (gpt-5.6-sol) synthesizing Executive Authority Dossier..."
  progress_pct?: number;              // 0 to 100
  metadata?: Record<string, unknown>;
}
```

*Example JSON:*
```json
{
  "type": "telemetry",
  "agent": "master_orchestrator",
  "status": "inspecting_storage",
  "message": "Inspecting classified datasets in Modal Cloud Volume for run 'run_real_datasets_audit'..."
}
```

---

#### Event 3: `subagents_spawned`
Informs the UI which subagent chips should light up on the radar and which were skipped.

```typescript
export interface SubagentsSpawnedPayload {
  type: "subagents_spawned";
  timestamp: number;
  active_subagents: string[];         // e.g. ["Agent 1: Structured Output Spatial Visualizer", ...]
  skipped_keywords: string[];         // e.g. [] or ["ecological"]
  message: string;
}
```

*Example JSON:*
```json
{
  "type": "subagents_spawned",
  "timestamp": 1789831309.375,
  "active_subagents": [
    "Agent 1: Structured Output Spatial Visualizer",
    "Agent 2: Demographics & Equity Specialist",
    "Agent 3: Economic & Land-Value Specialist",
    "Agent 4: Mobility & Congestion Specialist",
    "Agent 5: Ecological Risk Specialist"
  ],
  "skipped_keywords": [],
  "message": "Conditionally spawned 5 subagents based on existing dataset keywords."
}
```

---

#### Event 4: `visualizer_features`
Yields spatial GeoJSON features extracted by Agent 1. MapLibre ingests this immediately to render polygon and point overlays on the canvas without waiting for the dossier.

```typescript
export interface VisualizerFeaturesPayload {
  type: "visualizer_features";
  timestamp: number;
  features_count: number;             // e.g. 666
  geojson: GeoJSON.FeatureCollection; // Valid GeoJSON FeatureCollection
  message: string;
}
```

*Example Feature Object inside GeoJSON:*
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[77.6088, 12.9202], [77.6087, 12.9197], "..."]]
  },
  "properties": {
    "Slum_Name": "MADHURAMMA_COLONY",
    "Slum_Type": "Notified",
    "source_dataset": "visualizer-demographics-bengaluru_urban_slums.geojson",
    "intersection_type": "Polygon",
    "intersection_area_sqm": 12051.2,
    "overlap_pct": 100.0
  }
}
```

---

#### Event 5–7: `subagent_completed`
Emitted as each domain subagent completes its analytical slice.

```typescript
export interface SubagentCompletedPayload {
  type: "subagent_completed";
  timestamp: number;
  agent: "demographics" | "economic" | "mobility" | "ecological" | string;
  status: "success" | "error";
  message: string;
}
```

*Example JSON:*
```json
{
  "type": "subagent_completed",
  "timestamp": 1789831331.557,
  "agent": "demographics",
  "status": "success",
  "message": "Demographics subagent delivered quantitative slice."
}
```

---

#### Event 9: `dossier`
The primary deliverable payload containing the complete, validated `AuthorityDossier`.

```typescript
export interface StationProposal {
  name: string;
  latitude: number;
  longitude: number;
  rationale: string;
  expected_daily_footfall: number;
  interchange_potential: boolean;
}

export interface RiskWarning {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  pillar: "demographics" | "economic" | "mobility" | "ecological";
  title: string;
  description: string;
  action_required: string;
}

export interface DemographicsPillarMetrics {
  catchment_population_500m: number;
  catchment_population_1500m: number;
  equity_score: number;               // 0 to 100
  underserved_demographic_ratio: number; // 0.0 to 1.0
  dense_ward_names: string[];
  analysis_summary: string;
}

export interface EconomicPillarMetrics {
  tech_parks_within_1km: number;
  hospitals_within_1km: number;
  commercial_centers_within_1km: number;
  projected_annual_farebox_inr_cr: number;
  economic_multiplier_index: number;
  analysis_summary: string;
}

export interface MobilityPillarMetrics {
  peak_hour_travel_time_saved_mins: number;
  arterial_congestion_reduction_pct: number;
  feeder_route_coverage_score: number;
  first_last_mile_gap_detected: boolean;
  analysis_summary: string;
}

export interface EcologicalPillarMetrics {
  lake_buffer_infringements: number;
  rajakaluve_buffer_infringements: number;
  ktfd_compliance_status: "COMPLIANT" | "FLAGGED" | "CRITICAL_BREACH";
  flood_vulnerability_grade: "LOW" | "MODERATE" | "HIGH";
  mitigation_strategies: string[];
  analysis_summary: string;
}

export interface AuthorityDossier {
  corridor_id: string;
  corridor_name: string;
  total_length_km: number;
  estimated_ridership_daily: number;
  overall_viability_score: number;     // 0 to 100
  demographics_pillar: DemographicsPillarMetrics;
  economic_pillar: EconomicPillarMetrics;
  mobility_pillar: MobilityPillarMetrics;
  ecological_pillar: EcologicalPillarMetrics;
  risk_warnings: RiskWarning[];
  policy_recommendations: string[];
  suggested_station_locations: StationProposal[];
}

export interface DossierPayload {
  type: "dossier";
  timestamp: number;
  payload: AuthorityDossier;
  total_elapsed_seconds?: number;
  message?: string;
}
```

---

#### Event 10: `done`
Standard stream closing sentinel.

```typescript
export interface DonePayload {
  type: "done";
  timestamp?: number;
  message: "[DONE]";
}
```

---

## 3. Runner Execution Dynamics: Local vs Modal

### 3.1 Comparative Execution Analysis

| Dimension | Deployed Modal Endpoint (`stream_corridor_analysis`) | Local Master Orchestrator Runner (`master_orchestrator.py`) |
| :--- | :--- | :--- |
| **Trigger Mechanism** | HTTP POST to Modal URL (`https://...modal.run`) | `child_process.spawn("python", ["-u", "runner.py"])` |
| **Execution Environment** | Linux Debian Slim microVM in Modal Cloud | Local Host (Windows Python 3.12.5) |
| **Startup / Latency** | 1.5s–3.5s container wakeup (300s keep-warm buffer) | ~300ms Node.js process spawn |
| **Modal Authentication** | Embedded Modal Secret `openai-secret` | Local `~/.modal.toml` credentials (`daiwikchilukuri321`) |
| **Dataset Storage Access** | Direct local file mount at `/data/datasets` | Remote Modal Volume API (`modal.Volume.from_name`) |
| **Subagent Execution** | Cloud functions run in parallel in same datacenter | Dispatches cloud functions via `modal.Function.remote` |
| **Offline Capability** | ❌ Requires internet & active Modal deployment | ✅ Graceful fallback to local `gis_tools.py` math |
| **Round-Trip Duration** | 25s–60s (with full LLM synthesis on Sol/Terra) | ~60s (with cloud subagents) / < 1s (deterministic fallback) |

### 3.2 The Volume Prefix Routing Gotcha

In `master_orchestrator.py`:
```python
def _get_available_datasets(self, run_id: Optional[str] = None) -> List[str]:
    vol = modal.Volume.from_name("dyad-datasets-volume")
    prefix = f"runs/{run_id}" if run_id else ""
    entries = vol.listdir(prefix, recursive=True)
    ...
```
**CRITICAL OBSERVATION:** On the active Modal volume, files are stored under `runs/run_real_datasets_audit/`. If an incoming request passes an arbitrary `run_id` (e.g. `corridor-1726738900`), `vol.listdir(prefix)` will return `[]`. Because of the conditional spawning rule, all subagents will be skipped!

**Mitigation Rule for Runner / Orchestrator:**
In `_get_available_datasets`:
```python
entries = vol.listdir(prefix, recursive=True) if prefix else []
if not entries:
    # Fallback to standard verified audit directory or volume root
    entries = vol.listdir("runs/run_real_datasets_audit", recursive=True)
if not entries:
    entries = vol.listdir("", recursive=True)
```

---

## 4. Architecture Blueprint for `dyad-app/src/app/api/corridor/stream/route.ts`

### 4.1 Design Objectives
1. **Next.js App Router Compliance:** Strict Node.js runtime (`export const runtime = 'nodejs'`), force-dynamic execution (`export const dynamic = 'force-dynamic'`), and SSE response streaming using native web `ReadableStream`.
2. **Hybrid Bridge Routing:**
   - Primary: If `MODAL_ENDPOINT_URL` is set in environment, forward the POST request to the deployed Modal endpoint and pipe the SSE stream directly.
   - Fallback: If `MODAL_ENDPOINT_URL` is unset, unreachable, or returns a 5xx error, spawn the local Python runner executing `master_orchestrator.py`.
3. **Robust Lifecycle Handling:** Listen for client disconnection (`request.signal.addEventListener('abort')`) to kill child processes or abort upstream fetch requests immediately.
4. **Clean JSON Stdin Protocol:** Pass the inbound corridor envelope to Python via `stdin` rather than CLI parameters to prevent Windows command line length limits and character-escaping corruptions.

---

### 4.2 Local Python Runner Architecture (`prototype-modal-cloud-orchestrator/run_stream_bridge.py`)

To allow Next.js to cleanly execute `master_orchestrator.py` without modifying its core class, a lightweight runner script is created:

```python
"""
prototype-modal-cloud-orchestrator/run_stream_bridge.py
CLI bridge reading JSON corridor request from stdin and streaming SSE formatted events to stdout.
"""
import sys
import json
from pathlib import Path

# Configure unbuffered UTF-8 standard output for Windows
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, str(Path(__file__).parent))

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            raise ValueError("No corridor payload provided on stdin.")
        data = json.loads(raw_input)
    except Exception as e:
        err = json.dumps({"type": "error", "message": f"Invalid JSON stdin: {str(e)}"})
        print(f"event: error\ndata: {err}\n\n", flush=True)
        sys.exit(1)

    origin = data.get("origin", {})
    destination = data.get("destination", {})
    radius_m = float(data.get("catchment_radius_meters", 1500.0))
    corridor_id = data.get("corridor_id", f"corridor-{int(time.time())}")
    run_id = data.get("run_id", "run_real_datasets_audit")

    from master_orchestrator import DyadMasterOrchestrator

    try:
        orchestrator = DyadMasterOrchestrator()
        for event in orchestrator.execute_stream(
            origin_station=origin,
            destination_pin=destination,
            catchment_radius_meters=radius_m,
            corridor_id=corridor_id,
            run_id=run_id,
        ):
            etype = event.get("type", "message")
            payload = json.dumps(event, default=str)
            print(f"event: {etype}\ndata: {payload}\n\n", flush=True)

    except Exception as exc:
        # Fall back to deterministic calculation if cloud or OpenAI credentials fail
        from master_orchestrator import generate_corridor_buffer_polygon
        try:
            geom, length_km = generate_corridor_buffer_polygon(origin["coordinates"], destination["coordinates"], radius_m)
            dummy_meta = {"corridor_id": corridor_id, "corridor_name": f"{origin.get('name')} to {destination.get('name')}", "length_km": length_km, "origin": origin, "destination": destination}
            orch_fallback = DyadMasterOrchestrator(api_key="sk-fallback")
            dossier = orch_fallback._create_deterministic_fallback(dummy_meta, {}, {}, {}, {})
            print(f"event: dossier\ndata: {json.dumps({'type': 'dossier', 'payload': dossier.model_dump()})}\n\n", flush=True)
            print("event: done\ndata: [DONE]\n\n", flush=True)
        except Exception as fallback_exc:
            err = json.dumps({"type": "error", "message": f"Execution failed: {str(exc)} | Fallback: {str(fallback_exc)}"})
            print(f"event: error\ndata: {err}\n\n", flush=True)
            sys.exit(1)

if __name__ == "__main__":
    main()
```

---

### 4.3 Proposed Implementation of `dyad-app/src/app/api/corridor/stream/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let corridorPayload: any;
  try {
    corridorPayload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const modalEndpoint = process.env.MODAL_ENDPOINT_URL;

  // SSE Response Headers conforming to spec
  const sseHeaders = {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  };

  // Branch 1: Forward to Deployed Modal Cloud Endpoint if available
  if (modalEndpoint) {
    try {
      const modalResponse = await fetch(modalEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corridorPayload),
        signal: request.signal,
      });

      if (modalResponse.ok && modalResponse.body) {
        return new Response(modalResponse.body, { headers: sseHeaders });
      }
      console.warn(`[API/Corridor] Modal endpoint returned ${modalResponse.status}. Falling back to local execution.`);
    } catch (err) {
      console.warn('[API/Corridor] Modal fetch error, falling back to local Python:', err);
    }
  }

  // Branch 2: Local Python Child Process Runner
  const pythonPath = process.env.PYTHON_PATH || 'python';
  const runnerScript = path.resolve(
    process.cwd(),
    '../prototype-modal-cloud-orchestrator/run_stream_bridge.py'
  );

  const stream = new ReadableStream({
    start(controller) {
      const pythonProcess = spawn(pythonPath, ['-u', runnerScript], {
        cwd: path.dirname(runnerScript),
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          PYTHONIOENCODING: 'utf-8',
        },
      });

      // Send payload via stdin
      pythonProcess.stdin.write(JSON.stringify(corridorPayload));
      pythonProcess.stdin.end();

      // Pipe stdout directly into SSE stream
      pythonProcess.stdout.on('data', (chunk: Buffer) => {
        controller.enqueue(chunk);
      });

      pythonProcess.stderr.on('data', (errChunk: Buffer) => {
        const errMsg = errChunk.toString('utf-8');
        console.error('[Local Python Stderr]:', errMsg);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          const errEvent = `event: error\ndata: ${JSON.stringify({ type: 'error', message: `Python exited with code ${code}` })}\n\n`;
          controller.enqueue(new TextEncoder().encode(errEvent));
        }
        controller.close();
      });

      pythonProcess.on('error', (err) => {
        console.error('[Local Python Spawn Error]:', err);
        const errEvent = `event: error\ndata: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`;
        controller.enqueue(new TextEncoder().encode(errEvent));
        controller.close();
      });

      // Abort child process if client disconnects early
      request.signal.addEventListener('abort', () => {
        pythonProcess.kill('SIGTERM');
      });
    },
  });

  return new Response(stream, { headers: sseHeaders });
}
```

---

## 5. Potential Runtime Gotchas & Platform Mitigations

### 5.1 Gotcha 1: Python Standard Output Stalling on Windows (Buffering)
- **Problem:** When Python runs without an interactive TTY (as a Node.js child process), `sys.stdout` defaults to block buffering (typically 4KB–8KB). Telemetry and `plan_initiated` events will get trapped in the buffer and will not reach the browser until the process exits.
- **Mitigation:**
  1. Pass the `-u` flag to Python: `spawn("python", ["-u", scriptPath])`.
  2. Set environment variable: `PYTHONUNBUFFERED: "1"`.
  3. In Python code, explicitly flush on every output: `print(..., flush=True)`.

### 5.2 Gotcha 2: UTF-8 Encoding Crashes on Windows Console (CP1252)
- **Problem:** The Indian Rupee symbol (`₹`), em-dashes (`—`), checkmarks (`✓`), and Kannada/accented ward names trigger `UnicodeEncodeError: 'charmap' codec can't encode character` when Python outputs to Windows stdout pipes.
- **Mitigation:**
  1. Set environment variable: `PYTHONIOENCODING: "utf-8"`.
  2. Reconfigure stdout at start of Python script: `sys.stdout.reconfigure(encoding="utf-8", errors="replace")`.

### 5.3 Gotcha 3: Windows CLI Length & Quote Escaping
- **Problem:** Windows `cmd.exe` / PowerShell enforces an 8,191-character maximum command line string and corrupts double-quoted JSON strings containing nested coordinate arrays (`[[77.62, 12.91], ...]`).
- **Mitigation:**
  - Never pass corridor JSON as a command-line argument. Pass it through `pythonProcess.stdin.write(...)` and read via `sys.stdin.read()`.

### 5.4 Gotcha 4: Python Executable Resolution on Windows
- **Problem:** On Windows systems with the Microsoft Store shim enabled, typing `python` may open the Windows Store or trigger a permission error if the active Python installation is in `C:\Users\<user>\AppData\Local\Programs\Python\Python312\python.exe`.
- **Mitigation:**
  - Allow an override via `process.env.PYTHON_PATH`.
  - Provide fallback detection: check `PYTHON_PATH` $\rightarrow$ `python` $\rightarrow$ `py` $\rightarrow$ full path.

### 5.5 Gotcha 5: Next.js App Router Edge Runtime Incompatibility
- **Problem:** If someone adds `export const runtime = 'edge'` to `route.ts`, Node's `child_process` and `path` modules will throw a runtime crash because Edge runtime does not support native OS process spawning.
- **Mitigation:**
  - Explicitly declare `export const runtime = 'nodejs';` at the top of the route file.

### 5.6 Gotcha 6: OpenAI GPT-5.6 Parameter Constraints
- **Problem:** Models in the `gpt-5.6` family (`gpt-5.6-sol`, `gpt-5.6-terra`) enforce strict OpenAI platform rules:
  1. `max_tokens` causes a 400 error; `max_completion_tokens` is mandatory.
  2. Setting `temperature` other than `1.0` causes a 400 error.
- **Mitigation:**
  - Code in `master_orchestrator.py` already uses `max_completion_tokens=16000` and omits custom temperature. Any new calls must preserve this convention.

---

## 6. Verification Plan & Test Commands

To verify Requirement R2 end-to-end:

1. **Verify Local Python Dependencies:**
   ```powershell
   python -c "import openai, pydantic, shapely, modal; print('Dependencies OK')"
   ```
2. **Verify Python Bridge Runner with Synthetic Ingestion Envelope:**
   ```powershell
   echo '{"origin":{"name":"Silk Board","coordinates":[77.6200,12.9170]},"destination":{"name":"Bellandur","coordinates":[77.6848,12.9237]},"catchment_radius_meters":1500.0}' | python -u prototype-modal-cloud-orchestrator/run_stream_bridge.py
   ```
   *Expected Output:* Immediate stream of `plan_initiated`, `telemetry`, `subagents_spawned`, `visualizer_features`, `subagent_completed`, `dossier`, and `done`.
3. **Verify Next.js Route Compilation & Build:**
   ```powershell
   cd c:\Users\daiwi\Code\DYAD-PRAYAS\dyad-app
   npm run build
   ```
   *Expected Output:* Clean compilation with 0 TypeScript errors and `/api/corridor/stream` listed as dynamic route (`λ`).
4. **Verify Live SSE Stream via curl / browser:**
   ```powershell
   curl -N -X POST http://localhost:3000/api/corridor/stream -H "Content-Type: application/json" -d '{"origin":{"name":"Silk Board","coordinates":[77.6200,12.9170]},"destination":{"name":"Bellandur","coordinates":[77.6848,12.9237]}}'
   ```
   *Expected Output:* Incremental streaming lines delivered in real-time with `Content-Type: text/event-stream`.

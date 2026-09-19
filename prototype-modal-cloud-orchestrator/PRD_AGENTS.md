# DYAD Agent System: Product Requirements Document (PRD)

**Version:** 1.0.0  
**Status:** Approved for Implementation (Post `/grill-me` Alignment)  
**Target Environment:** Modal AI Serverless Cloud Containers (`modal.App`)  
**AI Inference Engine:** OpenAI API (`OPENAI_API_KEY` with `gpt-5.6-sol` [Sol-Medium] / `gpt-5.6-terra` [Terra] + automatic fallback to `gpt-4o` / `gpt-4o-mini`)  
**Integration Scope:** Isolated Prototype Subfolder (`prototype-modal-cloud-orchestrator/`)  

---

## 1. Executive Summary & Core Objective

DYAD is an autonomous spatial transit copilot and multi-agent synthesis platform designed for urban transit planners, municipal authorities, and infrastructure researchers (initially targeted at Bengaluru / BBMP / BMRCL). 

When a user submits a proposed transit corridor, metro extension, or feeder route via the interactive map canvas (`prototype-map-canvas-ui`), DYAD dispatches a swarm of sandboxed agents in the Modal AI cloud to run spatial analysis, mathematical regressions, demographic catchment queries, and environmental risk audits.

The output is not generic text, but an **Executive Authority Dossier (`AuthorityDossier`)** containing quantitative pillar metrics, spatial GeoJSON features, risk compliance redlines, and simulated economic yield projections.

---

## 2. Cloud Sandboxed Topology (Modal AI)

```
[ Frontend: prototype-map-canvas-ui ]
               │
               ▼ (POST /analyze-corridor with SSE)
┌─────────────────────────────────────────────────────────────┐
│ Modal Cloud Worker (@app.function / @modal.web_endpoint)    │
│ Python 3.11+ | GeoPandas | Shapely | PyProj | OpenAI Client │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Master Orchestrator Agent (Model: sol-medium)       │   │
│   │ - Spatial Bounding & Corridoring                    │   │
│   │ - Parallel Subagent Dispatch                        │   │
│   │ - Conflict Resolution & Final Dossier Synthesis     │   │
│   └──────────┬──────────────┬──────────────┬────────────┘   │
│              │              │              │                │
│     ┌────────▼────┐  ┌──────▼──────┐ ┌─────▼──────┐ ┌───────▼────┐
│     │Demographics │  │Economic/POI │ │Mobility    │ │Ecological  │
│     │Specialist   │  │Specialist   │ │Specialist  │ │Specialist  │
│     │(terra)      │  │(terra)      │ │(terra)     │ │(terra)     │
│     └──────┬──────┘  └──────┬──────┘ └─────┬──────┘ └───────┬────┘
│            │                │              │                │
│            ▼                ▼              ▼                ▼
│     ┌─────────────────────────────────────────────────────────┐
│     │ Hybrid Tooling Sandbox:                                 │
│     │ - Deterministic GIS Tools (GeoPandas / Shapely)         │
│     │ - Code Interpreter (Sandboxed Python math & stats)      │
│     └─────────────────────────────────────────────────────────┘
│                                                             │
│   Phase 1: Real-time Telemetry Events (SSE)                 │
│   Phase 2: Typed AuthorityDossier JSON Payload (SSE)        │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Modal Specifications
- **App Name:** `dyad-modal-orchestrator`
- **Container Image:** Debian Slim with `gdal-bin`, `libgdal-dev`, `geos`, `proj-bin`, Python 3.11+, and pip packages:
  - `openai>=1.65.0`
  - `pydantic>=2.10.0`
  - `geopandas>=1.0.0`
  - `shapely>=2.0.0`
  - `scikit-learn>=1.5.0`
  - `pandas>=2.2.0`
  - `numpy>=2.0.0`
- **Secrets:** Modal native Secret `openai-secret` containing `OPENAI_API_KEY`.
- **Concurrency & Scaling:** 1 to 20 autoscale container instances with keep-warm buffers (300s) to minimize cold-start latencies.

---

## 3. Agent Personas & Hierarchy

### 3.1 Master Orchestrator Agent
- **Model:** `sol-medium` (Fallback: `gpt-4o`)
- **System Role:** The Chief Urban Transit Architect.
- **Responsibilities:**
  1. Validates the transit geometry (e.g. LineString / MultiPoint station coordinates in EPSG:4326).
  2. Extracts the buffer catchment envelope (default: 500m walking catchment and 1500m feeder catchment).
  3. Spawns 4 concurrent domain specialist subagents, passing targeted geographical coordinates, corridor constraints, and relevant datasets.
  4. Collects partial results, validates consistency (e.g., population catchment vs. estimated daily ridership limits), and resolves conflicting findings.
  5. Synthesizes the final unified `AuthorityDossier`.

### 3.2 Domain Subagents (Model: `terra` / Fallback: `gpt-4o-mini`)

| Agent | Domain Persona | Primary Tools & Datasets | Key Quantitative Output |
|---|---|---|---|
| **Agent 1: Demographics** | Senior BBMP Census & Spatial Equity Analyst | `calculate_catchment_population`, `evaluate_transit_desert_index` | Catchment population, Equity/Inclusion score (0-100), Underserved demographic ratio. |
| **Agent 2: Economic & POI** | Infrastructure Economist & Land-Value Capture Lead | `cluster_poi_amenities`, `estimate_farebox_and_economic_yield` | High-density employment nodes within 800m, direct farebox ROI index, First-Mile commercial value. |
| **Agent 3: Mobility & Traffic** | TomTom Congestion & Multimodal Network Engineer | `compute_corridor_congestion_delta`, `simulate_feeder_coverage` | Peak hour travel time savings (mins), vehicle diversion rate (%), optimal feeder bus frequency. |
| **Agent 4: Ecological Risk** | Environmental Impact & Wetland Buffer Regulator | `check_lake_and_wetland_buffers`, `calculate_stormwater_flood_risk` | KTFD Act compliance status, 30m lake buffer breach count, flood risk grade (Low/Medium/High). |

---

## 4. Hybrid Tooling Architecture

Agents have access to two tiers of tooling:

### 4.1 Tier 1: Deterministic GIS Tools
Fast, pure-Python vector spatial operations using Shapely and GeoPandas:
1. `calculate_catchment_population(corridor_coords, buffer_meters)`: Computes overlapping population from ward census data polygons.
2. `cluster_poi_amenities(corridor_coords, buffer_meters, categories)`: Aggregates tech parks, hospitals, educational institutions within station catchments.
3. `compute_corridor_congestion_delta(corridor_coords, peak_hour)`: Compares baseline arterial travel time vs. grade-separated metro travel time.
4. `check_lake_and_wetland_buffers(corridor_coords, buffer_meters)`: Detects infringements into statutory 30m lake buffers and 50m rajakaluve stormwater drains.

### 4.2 Tier 2: Cloud Code Interpreter Tool
A sandboxed Python execution tool (`run_python_code(code_string)`):
- For complex mathematical modeling (e.g., Gravity Model passenger distribution, Monte Carlo ridership forecasting, custom Scikit-Learn spatial clustering).
- Executes within an isolated namespace with strict timeouts (10 seconds per execution).

---

## 5. Streaming Protocol (Two-Phase SSE)

To provide an instant, responsive UI experience in `prototype-map-canvas-ui`:

### Phase 1: Real-Time Telemetry Pings
During orchestrator planning and subagent execution, the Modal endpoint emits SSE chunks with the event name `telemetry`:
```json
{
  "type": "telemetry",
  "timestamp": 1726738900.123,
  "agent": "demographics_specialist",
  "status": "tool_executing",
  "action": "calculate_catchment_population",
  "message": "Computing 800m catchment buffer over 14 BBMP wards...",
  "progress_pct": 35
}
```

### Phase 2: Final Dossier Stream
Upon completion, the endpoint emits an event named `dossier` with the full `AuthorityDossier` JSON payload, followed by `[DONE]`.

---

## 6. Pydantic Output Contracts (`schemas/dossier.py`)

Every evaluation returns a strictly validated `AuthorityDossier`:

```python
class AuthorityDossier(BaseModel):
    corridor_id: str
    corridor_name: str
    total_length_km: float
    estimated_ridership_daily: int
    overall_viability_score: float # 0 to 100
    
    # 4 Core Pillars
    demographics_pillar: DemographicsPillarMetrics
    economic_pillar: EconomicPillarMetrics
    mobility_pillar: MobilityPillarMetrics
    ecological_pillar: EcologicalPillarMetrics
    
    # Actionable Insights
    risk_warnings: List[RiskWarning]
    policy_recommendations: List[str]
    suggested_station_locations: List[StationProposal]
```

---

## 7. Model Strategy & Verified API Conventions

The exact model identifiers and conventions on the OpenAI API platform are:
- **Master Orchestrator:** `gpt-5.6-sol` (commonly referred to as **Sol-Medium** when run with default/medium reasoning effort).
- **Domain Subagents:** `gpt-5.6-terra` (the cost-balanced **Terra** worker model).
- **Fast Chat / Telemetry:** `gpt-5.6-luna`.

### Crucial OpenAI API Constraints for GPT-5.6 Models:
1. **Token Parameter:** Must use `max_completion_tokens` instead of the legacy `max_tokens` (passing `max_tokens` triggers a 400 `unsupported_parameter` error).
2. **Temperature:** GPT-5.6 reasoning models enforce default `temperature=1` (passing `temperature=0.2` triggers a 400 `unsupported_value` error).
3. **Structured Outputs:** Both `gpt-5.6-sol` and `gpt-5.6-terra` natively support Pydantic structured output parsing via `client.beta.chat.completions.parse`.

### Automatic Fallback Matrix:
To guarantee resilience across all OpenAI account tiers:
- `gpt-5.6-sol` / `sol-medium` ➔ `gpt-4o`
- `gpt-5.6-terra` / `terra` ➔ `gpt-4o-mini`
- If offline / no API key: Deterministic GIS mathematical synthesis engine compiles compliant `AuthorityDossier`.

---

## 8. Verification & Delivery Milestones

1. **Milestone 1:** Standalone verification script (`test_openai_key.py`) passing with real OpenAI API Key.
2. **Milestone 2:** Strict Pydantic models defined in `schemas/dossier.py`.
3. **Milestone 3:** Deterministic GIS tools implemented in `tools/gis_tools.py`.
4. **Milestone 4:** Modal App defined in `app.py` with both CLI runner (`modal run app.py`) and Web SSE endpoint (`modal deploy app.py`).
5. **Milestone 5:** Documentation and team integration guide in `README.md` and `.agents/context.md`.

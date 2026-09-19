# Project: DYAD - Autonomous Transit Feasibility Platform

## Architecture
DYAD integrates a client-side MapLibre GL WebGL vector canvas and Turf.js spatial calculation engine (`dyad-app/`) with a multi-agent cloud/local orchestrator swarm (`prototype-modal-cloud-orchestrator/`), streaming real-time GIS layers and an AI Authority Dossier directly into a high-density Urban Command Center interface.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             USER / PLANNER                                 │
│  - Selects Origin Metro Station (snaps coordinates)                         │
│  - Drops Candidate Terminus Pin (or selects candidate preset)               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND ENGINE (`dyad-app`)                           │
│  1. MapCanvas (MapLibre GL JS + WebGL Shader Layers)                        │
│     - Origin/Terminus pins & dynamic viaduct polyline                       │
│     - Turf.js dynamic radial catchment buffer (<20ms local compute)         │
│     - visualizer-features-source (renders backend GeoJSON instantly)        │
│     - Suggested Station interactive markers with map.flyTo() camera focus   │
│                                                                             │
│  2. Route Handler (`/api/corridor/stream`)                                  │
│     - Server-Sent Events (SSE) hybrid bridge (`nodejs` runtime)             │
│     - Modal cloud proxy (if MODAL_ENDPOINT_URL set)                         │
│     - Local python child_process bridge runner (stdin/stdout UTF-8)         │
│                                                                             │
│  3. Authority Dossier Panel (Command Center Design System)                  │
│     - Live Agent Swarm Telemetry Stream (radar scanning, subagent chips)    │
│     - 0-100 Feasibility Score Gauge (SVG dial / composite score)            │
│     - 4 Domain Pillar Impact Cards (Demographics, Economic, Mobility, Eco)  │
│     - Actionable Risk Warnings with severity badges & mitigation steps      │
│     - Suggested Station Locations list with bi-directional map focus        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              BACKEND ORCHESTRATOR (`prototype-modal-cloud-orchestrator`)    │
│  - DyadMasterOrchestrator (`master_orchestrator.py`)                        │
│  - Modal cloud app (`dyad-subagents-swarm`) + `dyad-datasets-volume`         │
│  - Subagents: agent_visualizer, agent_demographics, agent_economic,         │
│               agent_mobility, agent_ecological                              │
│  - Structured synthesis via OpenAI GPT-4o (`AuthorityDossier`)              │
│  - Deterministic GIS fallback (<5ms zero-key mathematical calculation)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Purge Hardcoded Origin Coordinates | Remove `SILK_BOARD_COORDS` [77.6245, 12.9176] and `BELLANDUR_COORDS` constants from `page.tsx` and `MapCanvas.tsx` | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Purge Static Benefited Areas & Mock Zones | Remove static `BENEFITED_AREAS` (7 zones) from `page.tsx` and 145-line `BENEFITED_AREAS_CENTROIDS` GeoJSON from `MapCanvas.tsx` | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Dynamic Origin Station Snapping | Allow clicking existing metro station on MapLibre layer `metro-stations` to snap origin coordinates and display station name | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Dynamic Terminus Pin Dropping | Allow clicking arbitrary canvas coordinates to drop a candidate terminus pin | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Turf.js Dynamic Catchment Buffer | Recompute corridor lineString, radial buffer polygon, and local stats via Turf.js upon pin placement | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Dynamic Visualizer GeoJSON Layering | Ingest `visualizer_features` GeoJSON and render onto MapLibre via `visualizer-features-source` (polygons, lines, points) | M1 | ORIGINAL_REQUEST §R1 |
| 7 | Suggested Station Map Markers | Render backend suggested station proposals on MapLibre with interactive selection | M1 | ORIGINAL_REQUEST §R1 |
| 8 | SSE Streaming Route Handler | Next.js SSE route at `dyad-app/src/app/api/corridor/stream/route.ts` bridging requests via POST | M2 | ORIGINAL_REQUEST §R2 |
| 9 | Modal Cloud Endpoint Forwarding | Forward corridor payload to `MODAL_ENDPOINT_URL` when configured in environment | M2 | ORIGINAL_REQUEST §R2 |
| 10 | Local Python Orchestrator Runner Fallback | Spawn local Python runner `run_stream_bridge.py` communicating via `stdin`/`stdout` UTF-8 | M2 | ORIGINAL_REQUEST §R2 |
| 11 | Lifecycle SSE Event Streaming | Stream `plan_initiated`, `telemetry`, `subagents_spawned`, `visualizer_features`, `subagent_completed`, `dossier`, `done` | M2 | ORIGINAL_REQUEST §R2 |
| 12 | Deterministic Fallback Synthesis | Guarantee zero frontend crashes via mathematical fallback when OpenAI/Modal is offline | M2 | ORIGINAL_REQUEST §R2 |
| 13 | Command Center Surface Architecture | High-density palette (`#0E1117`, `#161B22`, hairline borders `border-white/[0.08]`, `ring-1 ring-white/5`) | M3 | ORIGINAL_REQUEST §R3 |
| 14 | Tabular Metric Monospace Typography | Strict `font-mono tabular-nums text-emerald-400 font-semibold` formatting for all figures | M3 | ORIGINAL_REQUEST §R3 |
| 15 | Emil Kowalski Physics Springs | Motion springs (`motionSprings.smooth`, `motionSprings.snappy`), tactile `whileTap={{ scale: 0.98 }}` | M3 | ORIGINAL_REQUEST §R3 |
| 16 | Live Agent Swarm Telemetry Stream | Real-time radar scan state and active subagent chips (Visualizer, Demographics, Economic, Mobility, Ecological) | M3 | ORIGINAL_REQUEST §R3 |
| 17 | 0-100 Feasibility Score Gauge | Circular gauge / composite index indicator with sentiment color coding | M3 | ORIGINAL_REQUEST §R3 |
| 18 | 4 Domain Pillar Impact Cards | Demographics (pop 500m/1500m, equity), Economic (tech parks, farebox Cr, multiplier), Mobility (time saved min, congestion drop %), Ecological (lake buffer infringements, flood grade) | M3 | ORIGINAL_REQUEST §R3 |
| 19 | Actionable Risk Warnings List | Categorized warnings with severity badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and mitigation actions | M3 | ORIGINAL_REQUEST §R3 |
| 20 | Interactive Suggested Stations | Clickable station proposal cards triggering `map.flyTo()` camera focus on MapLibre | M3 | ORIGINAL_REQUEST §R3 |
| 21 | Full End-to-End System Verification | Verified integration passing 100% E2E test suite (Tiers 1-4) and Tier 5 coverage hardening with `npm run build` 0 errors | M4 | ORIGINAL_REQUEST Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Dynamic Map Layers & Turf Catchment | Remove hardcoded constants, station click snapping, terminus pin drop, Turf.js catchment polygon, dynamic visualizer GeoJSON layers | None | PLANNED |
| M2 | Backend Integration & Streaming API Route | Next.js SSE route handler at `/api/corridor/stream`, Modal cloud bridge, local python bridge runner, lifecycle event streaming | None | PLANNED |
| M3 | Command Center AI Authority Dossier Panel | Right-Side dossier panel, Emil Kowalski springs, live swarm telemetry, feasibility gauge, 4 pillar cards, risk warnings, interactive suggested stations | M1, M2 | PLANNED |
| M4 | E2E Integration, Test Suite Pass & Adversarial Hardening | Pass 100% of E2E tests (Tiers 1-4), Tier 5 adversarial hardening, and verify `npm run build` completes with 0 TypeScript errors | M1, M2, M3 | PLANNED |

## Interface Contracts

### 1. Corridor Submission Payload (Client -> `/api/corridor/stream`)
```typescript
export interface CorridorStreamRequest {
  origin: {
    name: string;
    coordinates: [number, number]; // [lng, lat]
    line?: string;
  };
  destination: {
    name: string;
    coordinates: [number, number]; // [lng, lat]
  };
  catchment_radius_meters?: number; // default 2000
  budget_cap_inr_cr?: number;       // default 5000
  target_completion_year?: number;  // default 2030
}
```

### 2. Server-Sent Events (SSE) Stream (`/api/corridor/stream` -> Client)
```typescript
export type SSEEvent =
  | { type: 'plan_initiated'; timestamp: number; corridor_id: string; corridor_name: string }
  | { type: 'telemetry'; timestamp: number; stage: string; message: string; subagents_count?: number }
  | { type: 'subagents_spawned'; timestamp: number; subagents: string[]; count: number }
  | { type: 'visualizer_features'; timestamp: number; features_count: number; geojson: GeoJSON.FeatureCollection; message: string }
  | { type: 'subagent_completed'; timestamp: number; subagent: string; execution_time_seconds: number; summary: string }
  | { type: 'dossier'; timestamp: number; dossier: AuthorityDossier }
  | { type: 'done'; timestamp: number; message: string };
```

### 3. Authority Dossier TypeScript Contract (`types/dossier.ts`)
```typescript
export interface DemographicsPillarMetrics {
  catchment_population_500m: number;
  catchment_population_1500m: number;
  equity_index_score: number; // 0-100
  underserved_transit_ratio: number;
  density_per_sqkm: number;
}

export interface EconomicPillarMetrics {
  tech_parks_within_1km: number;
  commercial_centers_within_1km: number;
  hospitals_within_1km: number;
  annual_farebox_revenue_inr_cr: number;
  economic_multiplier_index: number;
  estimated_tod_yield_inr_cr: number;
}

export interface MobilityPillarMetrics {
  peak_hour_travel_time_saved_minutes: number;
  arterial_congestion_reduction_pct: number;
  feeder_route_coverage_score: number; // 0-100
  daily_projected_ridership: number;
}

export interface EcologicalPillarMetrics {
  lake_buffer_infringements_30m: number;
  rajakaluve_crossings_50m: number;
  ktfd_compliance_status: string; // 'COMPLIANT' | 'PERMIT_REQUIRED' | 'CRITICAL_BREACH'
  flood_vulnerability_grade: string; // 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  tree_canopy_loss_risk_score: number;
}

export interface RiskWarning {
  risk_id: string;
  category: 'ECOLOGICAL' | 'LAND_ACQUISITION' | 'FINANCIAL' | 'CIVIL_ENGINEERING';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  headline: string;
  description: string;
  mitigation_step: string;
}

export interface StationProposal {
  station_id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  typology: 'ELEVATED' | 'UNDERGROUND' | 'AT_GRADE';
  estimated_daily_boardings: number;
  interchange_with: string | null;
  priority: 'MANDATORY' | 'HIGH' | 'OPTIONAL';
}

export interface AuthorityDossier {
  corridor_id: string;
  corridor_name: string;
  overall_viability_score: number; // 0-100
  executive_summary: string;
  demographics: DemographicsPillarMetrics;
  economic: EconomicPillarMetrics;
  mobility: MobilityPillarMetrics;
  ecological: EcologicalPillarMetrics;
  risk_warnings: RiskWarning[];
  policy_recommendations: string[];
  suggested_stations: StationProposal[];
}
```

## Code Layout
- `dyad-app/src/app/page.tsx`: Root interactive war room connecting MapCanvas, stream client, and AuthorityDossierPanel.
- `dyad-app/components/MapCanvas.tsx`: MapLibre GL JS vector canvas, station snapping, terminus dropping, Turf.js catchment buffer, dynamic visualizer layers.
- `dyad-app/components/dossier/`:
  - `AuthorityDossierPanel.tsx`: Right-side collapsible command center container.
  - `SwarmTelemetryStream.tsx`: Live radar scan & agent chips.
  - `FeasibilityScoreGauge.tsx`: 0-100 composite index dial.
  - `DomainPillarCards.tsx`: 4 quantified impact cards.
  - `ActionableRiskWarnings.tsx`: Severity-badged risk alerts.
  - `SuggestedStationList.tsx`: Interactive station proposals triggering map.flyTo().
- `dyad-app/types/dossier.ts`: 100% typed contracts matching backend Pydantic models.
- `dyad-app/src/app/api/corridor/stream/route.ts`: Next.js App Router SSE route handler.
- `prototype-modal-cloud-orchestrator/run_stream_bridge.py`: Local CLI bridge runner for Python child_process execution.
- `dyad-app/tests/e2e/`: Opaque-box E2E test suites (Tiers 1-4).

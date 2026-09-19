# Original User Request

## 2026-09-19T17:08:53Z

Integrate the DYAD frontend map canvas (`dyad-app/`) with the multi-agent cloud backend (`prototype-modal-cloud-orchestrator/`), replacing all static placeholder stations, POIs, and ward grids with dynamic visualizer agent outputs and adding the official Right-Side AI Authority Dossier panel adhering to the `.agents/design-system.md` Command Center design system.

Working directory: c:\Users\daiwi\Code\DYAD-PRAYAS\dyad-app
Integrity mode: development

## Requirements

### R1. Remove Hardcoded Placeholders & Bind Dynamic Map Layers
- Purge hardcoded Central Silk Board origin coordinates (`SILK_BOARD_COORDS`), static `BENEFITED_AREAS`, hardcoded corridor presets, and static POI / ward mock states from `dyad-app/src/app/page.tsx` and `dyad-app/components/MapCanvas.tsx`.
- Enable dynamic origin station snapping and terminus pin dropping on the MapLibre canvas: user can click an existing metro station or arbitrary coordinate as the origin, and drop a terminus pin or click a candidate terminus.
- Dynamically ingest and render the spatial GeoJSON features emitted by the backend `agent_visualizer` (`visualizer_features` event) into MapLibre sources/layers rather than relying on static pre-rendered files.

### R2. Backend Integration & Streaming API Route
- Implement a Next.js Server-Sent Events (SSE) route handler at `dyad-app/src/app/api/corridor/stream/route.ts` that acts as a hybrid bridge:
  1. Forwards requests to the deployed Modal endpoint (`stream_corridor_analysis`) when `MODAL_ENDPOINT_URL` or Modal client is available.
  2. Falls back to executing the local master orchestrator runner (`prototype-modal-cloud-orchestrator/master_orchestrator.py` or runner script) during development.
- Transmit corridor payloads (`origin`, `destination`, `catchment_radius_meters`, `budget_cap_inr_cr`, `target_completion_year`) and stream back real-time lifecycle events: `plan_initiated`, `telemetry`, `subagents_spawned`, `visualizer_features`, `subagent_completed`, `dossier`, and `done`.

### R3. Right-Side AI Authority Dossier Panel (Command Center Design System)
- Build the dedicated Right-Side AI Intelligence Panel adhering strictly to `.agents/design-system.md`:
  - **Atmosphere & Surface:** High-density Urban Command Center palette (`#0E1117` base, `#161B22` elevated rows/cards, hairline specular borders `border-white/[0.08]` and `ring-1 ring-white/5`). No generic blurry bubbles or arbitrary CSS slop.
  - **Typography & Numbers:** Strict tabular monospace for all stats and metrics (`font-mono tabular-nums text-emerald-400 font-semibold`). Single-level cards (zero nested card-in-card recursion).
  - **Motion & Springs:** Emil Kowalski physics springs (`motionSprings.smooth` and `motionSprings.snappy`), origin-aware transforms, and `whileTap={{ scale: 0.98 }}` tactile feedback.
  - **Content & Architecture:**
    - Live Agent Swarm Telemetry stream during calculation (radar scanning state, active subagent chips: Visualizer, Demographics, Economic, Mobility, Ecological).
    - Overall Feasibility Score (0–100 composite index gauge).
    - 4 Domain Pillar Impact Cards:
      1. *Demographics & Spatial Equity:* 500m & 1500m walking population, equity score, underserved ratio.
      2. *Economic Corridor & TOD:* Tech parks, hospitals, commercial centers within 1km, farebox INR Cr, multiplier index.
      3. *Mobility & Congestion:* Peak-hour travel time saved (mins), arterial congestion reduction %, feeder route coverage.
      4. *Ecological & Risk Friction:* 30m lake buffer infringements, 50m rajakaluve infringements, KTFD compliance status, flood vulnerability grade.
    - Actionable Risk Warnings list with severity badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and recommended mitigation steps.
    - Suggested Station Locations list with interactive `map.flyTo()` bi-directional camera focus on click.

## Acceptance Criteria

### Map & Visualizer Interactivity
- [ ] Origin station and destination pin can be chosen dynamically; no hardcoded Silk Board fallback forced on the user.
- [ ] Map dynamically updates its catchment buffer polygon via Turf.js upon pin placement.
- [ ] When `visualizer_features` arrives via SSE, the map updates its GeoJSON source and renders newly extracted features immediately without waiting for the full dossier.
- [ ] Suggested station proposals from the backend dossier appear as interactive markers on the map canvas.

### Streaming & Communication
- [ ] Submitting a corridor triggers an active SSE connection to `/api/corridor/stream`.
- [ ] Agent telemetry stream shows real-time progress and logs from `prototype-modal-cloud-orchestrator`.
- [ ] When the stream emits `dossier`, the 0–100 Feasibility Score and all 4 pillar metric cards render with exact backend values.

### Design Craft & System Verification
- [ ] Zero arbitrary CSS pixel values; strict 4px/8px mathematical spacing rhythm.
- [ ] All metrics and numbers use `font-mono tabular-nums`.
- [ ] No nested card recursion; clean hairline borders (`border-white/[0.08]`).
- [ ] `npm run build` in `dyad-app` completes cleanly with 0 TypeScript compiler errors.

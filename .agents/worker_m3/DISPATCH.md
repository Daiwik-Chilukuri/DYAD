## 2026-09-19T17:24:47Z
You are the Implementation Worker for Milestone 3 (M3: Right-Side AI Authority Dossier Panel & UI Integration).
Your working directory is: c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\worker_m3\
You MUST read the authoritative original user request at:
c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\ORIGINAL_REQUEST.md
Also read:
c:\Users\daiwi\Code\DYAD-PRAYAS\PROJECT.md
c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\explorer_survey_3\survey_report.md
c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\context.md
c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\design-system.md
c:\Users\daiwi\Code\DYAD-PRAYAS\dyad-app\components\MapCanvas.tsx

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

FILE BOUNDARIES:
You exclusively own:
- `dyad-app/types/dossier.ts`
- `dyad-app/components/dossier/**`
- `dyad-app/src/app/page.tsx` (integrating the dossier panel, MapCanvas, and SSE streaming route)

YOUR MISSION:
1. Create `dyad-app/types/dossier.ts`:
   Define 100% typed TypeScript contracts for `AuthorityDossier`, `DemographicsPillarMetrics`, `EconomicPillarMetrics`, `MobilityPillarMetrics`, `EcologicalPillarMetrics`, `RiskWarning`, `StationProposal`, and `SSEEvent` matching `PROJECT.md § Interface Contracts`.
2. Build the Command Center Dossier Panel in `dyad-app/components/dossier/`:
   Adhere strictly to `.agents/design-system.md`:
   - Surface: Glassmorphic Urban Command Center (`bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5`).
   - Single-level cards (NO nested card-in-card recursion).
   - Typography: All metrics and tabular numbers must use `font-mono tabular-nums text-emerald-400 font-semibold`.
   - Motion: Emil Kowalski springs (`motionSprings.smooth` and `motionSprings.snappy`), tactile `whileTap={{ scale: 0.98 }}`.
   Components to create:
   - `AuthorityDossierPanel.tsx`: Collapsible right-side container (width 420px, anchored `top-4 right-4 bottom-4`, matching camera padding in `lib/camera.ts`).
   - `SwarmTelemetryStream.tsx`: Live radar scan state, subagent chips (Visualizer, Demographics, Economic, Mobility, Ecological), real-time progress logs from SSE.
   - `FeasibilityScoreGauge.tsx`: 0-100 composite index gauge with sentiment colors (emerald >= 70, amber 50-69, rose < 50).
   - `DomainPillarCards.tsx`: 4 domain pillar impact cards:
     1. Demographics & Spatial Equity (500m & 1500m pop, equity score 0-100, underserved ratio, density).
     2. Economic Corridor & TOD (tech parks 1km, hospitals 1km, commercial centers 1km, farebox INR Cr, multiplier index, TOD yield INR Cr).
     3. Mobility & Congestion (peak-hour time saved mins, arterial congestion reduction %, feeder route coverage score, daily boardings).
     4. Ecological & Risk Friction (30m lake buffer infringements, 50m rajakaluve infringements, KTFD compliance status, flood vulnerability grade).
   - `ActionableRiskWarnings.tsx`: Categorized warnings with severity badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and recommended mitigation steps.
   - `SuggestedStationList.tsx`: List of station proposals with typology badge and priority. Clicking a station triggers `onStationClick(station.coordinates)`.
   - `PolicyRecommendations.tsx`: Structured policy recommendations from the dossier.
3. Integrate into `dyad-app/src/app/page.tsx`:
   - Purge hardcoded `SILK_BOARD_COORDS`, static `BENEFITED_AREAS`, and placeholder corridor presets.
   - Bind `MapCanvas` with dynamic props:
     - `originStation`: snapped from metro station click or search
     - `destinationCoords`: dropped terminus pin from map click
     - `onOriginSelect`: updates origin state
     - `onDestinationSelect`: updates destination state
     - `visualizerGeoJSON`: dynamically updated when `visualizer_features` event arrives via SSE
     - `suggestedStations`: populated from `dossier.suggested_stations`
     - `activeStationFocus`: updated when user clicks a suggested station in the dossier
   - Implement SSE client connecting to `/api/corridor/stream`:
     - Dispatches corridor payload on "Evaluate Corridor" / "Run Feasibility Swarm"
     - Listens to SSE events: `plan_initiated`, `telemetry`, `subagents_spawned`, `visualizer_features`, `subagent_completed`, `dossier`, `done`
     - Renders live telemetry stream during evaluation
     - Displays full Authority Dossier once received
4. Verification:
   - Run `npx tsc --noEmit` and `npm run build` in `dyad-app/` ensuring 0 TypeScript errors and 0 build failures.
   - Run `node tests/e2e/runner.mjs` ensuring all 225 tests pass.

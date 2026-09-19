# Handoff Report — Explorer 3 (UI Architecture & Design System Alignment for R3)

## 1. Observation
1. **Current Right-Side UI in `dyad-app/src/app/page.tsx`**:
   - Lines 645–745 render a transient floating card only when a static `selectedArea` is clicked:
     ```tsx
     <AnimatePresence>
       {selectedArea && (
         <motion.div
           initial={{ x: 40, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           exit={{ x: 40, opacity: 0 }}
           transition={motionSprings.smooth}
           className="absolute top-6 right-6 w-96 bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-2xl pointer-events-auto z-20 flex flex-col gap-4"
         >
     ```
   - No permanent or collapsible Right-Side AI Authority Dossier Panel exists.
   - It displays hardcoded static mock stats (`BENEFITED_AREAS`), lacking 0–100 Feasibility Score, 4 structured domain pillars, risk warnings, station proposals, or live agent telemetry.

2. **Existing Camera Padding in `dyad-app/lib/camera.ts`**:
   - Line 13 of `dyad-app/lib/camera.ts` explicitly sets:
     ```ts
     padding: { top: 120, bottom: 120, left: 100, right: 460 }
     ```
   - Demonstrates that a 420px–440px right panel was pre-factored into the map projection math to prevent corridor occlusion.

3. **Motion and Design System Specs**:
   - `dyad-app/lib/motion.ts` (lines 1–23) defines `motionSprings.snappy` (400/30/0.8), `motionSprings.smooth` (300/32/1.0), and `motionSprings.bouncy` (450/22).
   - `.agents/design-system.md` (lines 45–97) enforces the Command Center palette (`#0E1117` base, `#161B22` elevated surfaces, hairline borders `border-white/[0.08]`, `ring-1 ring-white/5`), tabular monospace figures (`font-mono tabular-nums`), and single-level cards without nested card recursion.

4. **Authoritative Backend Data Contracts in `prototype-modal-cloud-orchestrator/schemas/dossier.py`**:
   - Lines 11–107 define Pydantic models: `TelemetryEvent`, `StationProposal`, `DemographicsPillarMetrics`, `EconomicPillarMetrics`, `MobilityPillarMetrics`, `EcologicalPillarMetrics`, `RiskWarning`, and `AuthorityDossier`.
   - Real output payload verified in `prototype-modal-cloud-orchestrator/runs/run_real_datasets_audit_trace.json` (lines 32450–32585): Viability score `68.0`, Demographics (71,769 500m pop, 98.0 equity), Economic (1 tech park, ₹36.5 Cr farebox, 2.77x multiplier, ₹40.02 Cr TOD yield), Mobility (21.8m time saved, 22.6% congestion drop), Ecological (108 lake buffer breaches, 2 Rajakaluve crossings, `CRITICAL_BREACH`, `HIGH` flood grade), 4 prioritized Risk Warnings, 7 Policy Recommendations, and 5 Suggested Stations.

5. **Tooling & Build Health**:
   - `dyad-app/package.json` contains `next: 16.3.5`, `react: 19.2.8`, `framer-motion: ^13.4.0`, `tailwindcss: ^4`, `@tailwindcss/postcss: ^4`, `lucide-react: ^1.47.0`, `maplibre-gl: ^4.7.1`.
   - Executed `npx tsc --noEmit` in `dyad-app/`: returned code 0 with zero compilation errors.

---

## 2. Logic Chain
1. From **Observation 1**, `dyad-app/src/app/page.tsx` currently only renders a small static popup for hardcoded zones, leaving the entire right side of the canvas empty and failing to fulfill Requirement R3.
2. From **Observation 2**, the existing camera framing helper `zoomToCorridor` already reserves 460px on the right (`right: 460`). Therefore, anchoring a 420px wide dossier panel (`absolute top-4 right-4 bottom-4 z-20 w-[420px]`) integrates into the map canvas with zero visual clipping of corridor geometry or stations.
3. From **Observation 3**, the design system requires eliminating "AI-slop" (nested cards, arbitrary CSS pixel values, plain sans numbers). By using `#0E1117` glassmorphic surfaces, hairline specular borders (`border-white/[0.08]`), `font-mono tabular-nums`, and Emil Kowalski springs (`motionSprings.smooth` and `motionSprings.snappy`), the panel achieves an industrial command-center aesthetic.
4. From **Observation 4**, the backend multi-agent swarm emits typed SSE events and an authoritative `AuthorityDossier`. Creating TypeScript data contracts in `dyad-app/types/dossier.ts` matching `dossier.py` guarantees seamless ingestion of real-time telemetry, 0–100 viability score, 4 domain pillars, risk warnings, and station proposals.
5. From **Observation 5**, React 19, Framer Motion 13, and Tailwind v4 are verified and healthy with zero TypeScript errors, allowing modular compilation of the dossier components without package incompatibilities.

---

## 3. Caveats
- **Read-Only Scope**: In compliance with the Master Compiler Agent Directive (`AGENTS.md` and `.agents/context.md`), this survey does NOT edit files in `dyad-app/` directly. The actual compilation and file creation will be executed by the Master Compiler Agent (`Antigravity`).
- **Map Marker Interaction**: The proposed dynamic station markers require attaching click event listeners to MapLibre HTML marker elements, which will trigger `onStationSelect(station)` and synchronize back to the dossier. The implementation must ensure previous markers are cleanly unmounted when recalculating a corridor to prevent DOM leaks.
- **Server-Sent Events Route (R2)**: The UI panel expects SSE event streaming from `/api/corridor/stream`. While the UI blueprint is resilient to null or partial data, full end-to-end functionality depends on R2's streaming route handler.

---

## 4. Conclusion
Requirement R3 is fully architected and ready for implementation. The architectural blueprint, detailed in `.agents/explorer_survey_3/survey_report.md`, provides:
1. Exact component hierarchy: `AuthorityDossierPanel`, `SwarmTelemetryStream`, `FeasibilityScoreGauge`, `DomainPillarCards`, `ActionableRiskWarnings`, `SuggestedStationList`, and `PolicyRecommendations`.
2. 100% typed contracts in TypeScript matching the backend Pydantic models.
3. Strict adherence to `.agents/design-system.md` (hairline borders, monospace tabular numbers, Emil Kowalski springs, no nested cards).
4. Bi-directional map synchronization (`map.flyTo()` on station click, and station card scroll/highlight on map marker click).

The Master Compiler Agent has all necessary specifications and blueprints to assemble these components into `dyad-app/` cleanly.

---

## 5. Verification Method
1. **Inspect Blueprint Deliverables**:
   - View `.agents/explorer_survey_3/survey_report.md` to confirm all 5 R3 sub-components, design tokens, and TypeScript contracts are completely specified.
2. **Inspect Data Contracts**:
   - Compare `dyad-app/types/dossier.ts` proposal against `prototype-modal-cloud-orchestrator/schemas/dossier.py` lines 11–107 to verify 1:1 schema alignment.
3. **Verify Baseline TypeScript Health**:
   - Run `npx tsc --noEmit` in `c:\Users\daiwi\Code\DYAD-PRAYAS\dyad-app` to verify 0 errors.
4. **Invalidation Conditions**:
   - Any proposal to use nested card-in-card rounded boxes, non-tabular sans numerals for telemetry, or linear CSS transitions would violate the design system and invalidate this blueprint.

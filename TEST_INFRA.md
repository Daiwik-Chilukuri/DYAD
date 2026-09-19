# DYAD Test Infrastructure Specification
## Complete 4-Tier Opaque-Box E2E Test Suite Architecture

> **Project:** DYAD — Autonomous Transit Feasibility Platform  
> **Integrity Mode:** Opaque-Box End-to-End System Verification  
> **Runner Location:** `dyad-app/tests/e2e/runner.mjs`  
> **Execution Command:** `node tests/e2e/runner.mjs` (or `node tests/e2e/runner.mjs --tier=1,2,3,4`)

---

## 1. Executive Summary & Testing Philosophy

DYAD is an authority-grade pre-feasibility platform evaluating high-stakes urban transit corridors across Bengaluru. Because municipal Detailed Project Reports (DPRs) involve statutory lake buffers (KTFD Act), arterial road congestion, demographic equity, and billions in capital expenditure, our test suite applies a strict **Opaque-Box Verification Protocol**.

### Core Tenets:
1. **Opaque-Box Independence:** Tests observe public interface boundaries only — spatial inputs, Turf.js buffer polygons, SSE stream events, MapLibre GeoJSON layers, and Authority Dossier JSON payloads. No reliance on private internal variables.
2. **Deterministic Mathematical Oracles:** Ground truth for spatial buffers, Haversine distances, and point-in-polygon containment are calculated using WGS84 geodesic algorithms and Turf.js (`@turf/turf`).
3. **Strict Contract Conformance:** Every SSE event, schema property, and domain metric is verified against both the TypeScript contracts in `types/dossier.ts` and the Python Pydantic models in `prototype-modal-cloud-orchestrator/schemas/dossier.py`.
4. **Design System & Craft Enforcement:** Design tokens, hairline specular borders (`border-white/[0.08]`), Emil Kowalski physics springs, and tabular-numbers typography (`font-mono tabular-nums`) are verified through static AST and token inspection.
5. **Real-World Bengaluru Corridors:** Real coordinates for operational Namma Metro stations (Purple, Green, Yellow lines) and critical transit choke points across Bengaluru are tested.

---

## 2. Test Suite Layout & Hierarchy

```
dyad-app/tests/e2e/
├── runner.mjs                          # Unified CLI test runner & tier aggregator
├── test_framework.mjs                  # Assertion library, colorized reporter & timer
├── fixtures/
│   ├── bengaluru_corridors.mjs         # Verified coordinates, stations, and presets
│   └── sse_mock_stream.mjs             # Lifecycle SSE packet streams and chunk splits
├── tier1_features/                     # Tier 1: Feature Coverage (>=5 tests per feature)
│   ├── f01_origin_purge.test.mjs       # Feature 1: Purge Hardcoded Origin Coordinates
│   ├── f02_benefited_areas_purge.test.mjs # Feature 2: Purge Static Benefited Areas
│   ├── f03_origin_snapping.test.mjs    # Feature 3: Dynamic Origin Station Snapping
│   ├── f04_terminus_dropping.test.mjs  # Feature 4: Dynamic Terminus Pin Dropping
│   ├── f05_turf_buffer.test.mjs        # Feature 5: Turf.js Dynamic Catchment Buffer
│   ├── f06_visualizer_geojson.test.mjs # Feature 6: Dynamic Visualizer GeoJSON Layering
│   ├── f07_suggested_stations_markers.test.mjs # Feature 7: Suggested Station Map Markers
│   ├── f08_sse_route_handler.test.mjs  # Feature 8: SSE Streaming Route Handler
│   ├── f09_modal_forwarding.test.mjs   # Feature 9: Modal Cloud Endpoint Forwarding
│   ├── f10_local_python_fallback.test.mjs # Feature 10: Local Python Orchestrator Runner Fallback
│   ├── f11_lifecycle_sse_events.test.mjs  # Feature 11: Lifecycle SSE Event Streaming
│   ├── f12_deterministic_fallback.test.mjs# Feature 12: Deterministic Fallback Synthesis
│   ├── f13_command_center_surface.test.mjs# Feature 13: Command Center Surface Architecture
│   ├── f14_tabular_typography.test.mjs # Feature 14: Tabular Metric Monospace Typography
│   ├── f15_spring_physics.test.mjs     # Feature 15: Emil Kowalski Physics Springs
│   ├── f16_telemetry_stream.test.mjs   # Feature 16: Live Agent Swarm Telemetry Stream
│   ├── f17_feasibility_gauge.test.mjs  # Feature 17: 0-100 Feasibility Score Gauge
│   ├── f18_four_pillar_cards.test.mjs  # Feature 18: 4 Domain Pillar Impact Cards
│   ├── f19_risk_warnings.test.mjs      # Feature 19: Actionable Risk Warnings List
│   ├── f20_interactive_stations.test.mjs # Feature 20: Interactive Suggested Stations
│   └── f21_e2e_verification.test.mjs   # Feature 21: Full End-to-End System Verification
├── tier2_boundaries/                   # Tier 2: Boundary & Corner Cases (>=5 tests per feature)
│   ├── f01_f05_spatial_boundaries.test.mjs
│   ├── f06_f10_stream_boundaries.test.mjs
│   ├── f11_f15_contract_boundaries.test.mjs
│   └── f16_f21_dossier_boundaries.test.mjs
├── tier3_combinations/                 # Tier 3: Cross-Feature Interactions
│   └── cross_feature.test.mjs
└── tier4_scenarios/                    # Tier 4: Real-World Bengaluru Scenarios
    └── bengaluru_corridors.test.mjs
```

---

## 3. Tier Coverage & Inventory Mapping

| Tier | Name | Target Features | Minimum Required | Actual Tests | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | Feature Coverage (Isolation) | Features 1–21 (PROJECT.md) | 105 (21 × 5) | 105 | READY |
| **Tier 2** | Boundary & Corner Cases | Features 1–21 (PROJECT.md) | 105 (21 × 5) | 105 | READY |
| **Tier 3** | Cross-Feature Interactions | Pairwise & Pipeline Integrations | 10 | 10 | READY |
| **Tier 4** | Real-World Application Scenarios | Bengaluru Corridors | 5 | 5 | READY |
| **Total** | **All Tiers Combined** | **Full System Verification** | **225** | **225** | **READY** |

---

## 4. Test Tier Detailed Specifications

### Tier 1: Feature Coverage (in Isolation)
Every feature in `PROJECT.md` is exercised through at least 5 isolated test cases:
* **F01 (Purge Origin):** Validates removal of hardcoded Silk Board constants and verifies arbitrary coordinate acceptance.
* **F02 (Purge Benefited Areas):** Confirms removal of static 7-zone list and validates 0 to N dynamic zone ingestion.
* **F03 (Station Snapping):** Tests snapping to Purple, Green, and Yellow Line stations with metadata extraction.
* **F04 (Terminus Dropping):** Tests dropping candidate pins across Sarjapur, Whitefield, Electronic City, and coordinate validation.
* **F05 (Turf.js Catchment Buffer):** Generates 500m, 1500m, 2000m buffers, verifies polygon closure, and validates <20ms runtime.
* **F06 (Dynamic Visualizer GeoJSON):** Validates FeatureCollections containing Polygons, LineStrings, and Points with custom properties.
* **F07 (Suggested Station Markers):** Validates parsing of `StationProposal` items into MapLibre marker coordinates and interchange tags.
* **F08 (SSE Route Handler):** Validates POST `/api/corridor/stream` headers (`text/event-stream`), request parsing, and error status codes.
* **F09 (Modal Endpoint Forwarding):** Validates cloud proxying, header transmission, timeout handling, and credential stripping.
* **F10 (Local Python Fallback):** Validates execution of local orchestrator bridge runner via `stdin`/`stdout` UTF-8 streaming.
* **F11 (Lifecycle SSE Streaming):** Validates emission of all 7 lifecycle events: `plan_initiated`, `telemetry`, `subagents_spawned`, `visualizer_features`, `subagent_completed`, `dossier`, `done`.
* **F12 (Deterministic Fallback):** Validates zero-cloud mathematical synthesis producing a complete 0-100 dossier in <50ms.
* **F13 (Surface Architecture):** Tests `#0E1117`, `#161B22`, specular borders (`border-white/[0.08]`), and single-level card rules.
* **F14 (Tabular Typography):** Verifies presence of `font-mono tabular-nums` on all telemetry figures and sentiment colors.
* **F15 (Emil Kowalski Springs):** Verifies spring parameter math (`snappy`, `smooth`, `bouncy`) and `whileTap={{ scale: 0.98 }}`.
* **F16 (Telemetry Stream):** Verifies radar scan states, 5 subagent status chips, and chronological log event ordering.
* **F17 (Feasibility Score Gauge):** Verifies 0-100 gauge calculations, SVG stroke-dashoffset formulas, and sentiment grades.
* **F18 (4 Domain Pillar Cards):** Verifies Demographics, Economic, Mobility, and Ecological metric structures and typed units.
* **F19 (Actionable Risk Warnings):** Verifies severity badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and mitigation step text.
* **F20 (Interactive Stations):** Tests station proposal card selection, coordinate payload generation, and `map.flyTo` triggers.
* **F21 (Full E2E Verification):** Validates end-to-end data pipeline integrity and schema parity between TypeScript and Pydantic.

### Tier 2: Boundary & Corner Cases
Tests system behavior under extreme, degenerate, and adversarial inputs:
* **Spatial Extremes:** Corridors with identical origin and destination (0km length), coordinates at Bengaluru's bounding box limits, buffer radius of 0m, huge 10,000m buffer polygons, and coordinate rounding precision up to 12 decimal places.
* **Stream Disruption & Resiliency:** Empty SSE payloads, partial chunks split across TCP packet boundaries, unknown event types, malformed JSON lines, rapid client disconnections, and child process exits.
* **Data Limits & Numerical Boundaries:** Feasibility scores of exactly 0 and 100, clamped negative scores, zero demographics population, zero farebox revenue, 999 lake buffer breaches, and empty risk warnings arrays.
* **UI & Responsive Extremes:** Viewport widths <320px, 4K ultra-wide (3840px), reduced-motion media query overrides, and HTML entity sanitization in metric labels.

### Tier 3: Cross-Feature Combinations
Tests pairwise and multi-module pipelines:
* **Snap + Buffer:** Origin station snapping instantly triggers Turf.js corridor buffer recalculation.
* **Buffer + Visualizer GeoJSON:** Emitted visualizer features are spatially clipped within the calculated catchment polygon.
* **SSE Chunks + Dossier Parsing:** Accumulation of streamed chunks safely parses into the 4 Domain Pillar Impact Cards.
* **Dossier Viability + Risk Penalties:** High-severity ecological risks properly correlate with viability score deductions.
* **Suggested Stations + Map Camera Navigation:** Selecting a suggested station proposal card emits camera focus coordinates to `map.flyTo()`.
* **Cloud Failure + Deterministic Fallback:** Modal timeout seamlessly triggers deterministic synthesis with zero frontend crashes.

### Tier 4: Real-World Bengaluru Corridor Scenarios
Tests 5 end-to-end realistic transit corridors:
1. **Silk Board $\rightarrow$ Sarjapur Road:** Yellow Line interchange, Agara Lake 30m buffer crossing, Wipro Tech Park catchment, peak travel time savings >35 mins.
2. **KR Puram $\rightarrow$ Whitefield Kadugodi:** Purple Line / Blue Line junction, Old Madras Road railway crossings, tech worker commute corridor.
3. **Electronic City Phase 1 $\rightarrow$ Bannerghatta Road:** South tech belt connecting Yellow Line to Pink Line, NICE road interface, ecological forest buffer checks.
4. **Majestic $\rightarrow$ Hebbal Junction:** High-density central core to North airport artery, Bellary Road congestion bypass, Sankey tank catchment analysis.
5. **Outer Ring Road Line 3 (Bellandur $\rightarrow$ Mahadevapura):** Highest commercial IT corridor in India (Ecospace, Prestige Tech Park, Bagmane), critical Bellandur lake rajakaluve crossings and flood vulnerability assessment.

---

## 5. Execution Commands & CLI Options

```bash
# Run the complete test suite across all 4 tiers:
node tests/e2e/runner.mjs

# Run a specific tier:
node tests/e2e/runner.mjs --tier=1
node tests/e2e/runner.mjs --tier=2
node tests/e2e/runner.mjs --tier=3
node tests/e2e/runner.mjs --tier=4

# Run with verbose assertion outputs:
node tests/e2e/runner.mjs --verbose

# Run with fail-fast (stops on first failure):
node tests/e2e/runner.mjs --bail
```

---

## 6. Exit Codes & Reporting Contract

* **Exit Code `0`:** All tests across the selected tiers passed with 100% assertion compliance.
* **Exit Code `1`:** One or more assertions failed or unhandled exceptions occurred.
* **Output Format:** Clean ANSI terminal output with tier counts, elapsed times, and summary breakdown table.

# 🚇 DYAD Application (`dyad-app/`)

> **Production Application Core for the DYAD Autonomous Transit Feasibility Platform**  
> Built with Next.js 16 (Turbopack), MapLibre GL JS, Turf.js, Tailwind CSS v4, and Server-Sent Events (SSE).

---

## 🏛️ Architecture & Folder Structure

```text
dyad-app/
├── components/
│   ├── BotLogo.tsx                     # Official DYAD brand vector mark
│   ├── MathFormula.tsx                 # KaTeX formula renderer for statutory formulas
│   ├── MapCanvas.tsx                   # MapLibre GL 3D mapping engine & Turf.js buffer layers
│   ├── dossier/                        # Authority Dossier Command Center components
│   │   ├── ActionableRiskWarnings.tsx  # Categorized statutory risk cards with severity tags
│   │   ├── AgentFlashCards.tsx         # Agent domain cards (Demographics, Economic, Mobility, Eco)
│   │   ├── AuthorityDossierPanel.tsx   # Docked right-hand panel & executive summary
│   │   ├── DomainPillarCards.tsx       # 4-pillar numeric KPI overview
│   │   ├── FeasibilityScoreGauge.tsx   # 0-100 radial feasibility dial
│   │   ├── SuggestedStationList.tsx    # Interactive intermediate station proposals with flyTo
│   │   └── SwarmTelemetryStream.tsx    # Real-time SSE thought log and active subagent chips
│   ├── landing/                        # High-impact cinematic landing page module
│   │   ├── LandingPage.tsx             # Root landing view with TomTom congestion radar
│   │   ├── components/                 # Bento grid, TomTom hero, product mockups, timeline
│   │   └── data/                       # Bundled metro geometries and city coordinates
│   └── navigation/
│       └── SidebarRail.tsx             # Floating slim navigation rail (Dashboard, Collect, Data, Agents)
├── lib/
│   ├── camera.ts                       # Map camera transitions and flyTo helpers
│   ├── motion.ts                       # Emil Kowalski physics spring presets (smooth, snappy)
│   ├── spatial-turf.ts                 # Turf.js catchment buffer and line geometry calculators
│   └── utils.ts                        # Tailwind class mergers (clsx + tailwind-merge)
├── public/
│   ├── data/                           # Verified geospatial and census layers
│   │   ├── metro_lines.geojson         # Bengaluru metro lines (Green, Purple, Yellow)
│   │   ├── metro_stations.geojson      # Snappable metro stations
│   │   ├── atree_lakes_streams.geojson # Lake waterbody polygons & KTFD buffer zones
│   │   ├── bbmp_wards_198.geojson      # Bengaluru 198 ward polygons
│   │   ├── chennai/                    # Chennai CMRL metro lines, GCC wards & CRZ boundaries
│   │   ├── hyderabad/                  # Hyderabad HMRL metro, GHMC wards & HYDRAA FTL layers
│   │   └── pune/                       # Pune Metro Line 3, PMC wards & floodline layers
├── scripts/
│   ├── run_browser_cloud_collector.py  # Browser Use Cloud autonomous scraper bridge
│   ├── fetch-all-lines.js              # OSM Overpass fetch scripts for transit lines
│   └── generate-lines.js               # BMRCL line geojson generation utilities
├── src/app/
│   ├── layout.tsx                      # Root layout with Geist sans/mono typography
│   ├── page.tsx                        # Root route redirecting to /landing
│   ├── landing/page.tsx                # Standalone landing page route
│   ├── dashboard/page.tsx              # Urban Command Center with interactive MapLibre canvas
│   ├── collector/page.tsx              # Autonomous Browser Use Cloud GIS harvester
│   ├── data/page.tsx                   # Unified Data Studio catalog & schema inspector
│   ├── agents/page.tsx                 # Agent swarm mathematical notation & trace center
│   ├── login/page.tsx                  # Clean authentication entry
│   ├── signup/page.tsx                 # Planner onboarding screen
│   └── api/                            # Backend route handlers (Edge & Node.js dynamic)
│       ├── collector/datasets/route.ts # Discovers and stages multi-city GIS layers
│       ├── collector/stream/route.ts   # SSE streaming bridge to Browser Use Cloud
│       ├── corridor/stream/route.ts    # SSE streaming bridge for corridor swarm simulation
│       ├── data/route.ts               # Schema profiler & file manager for public/data
│       └── data/raw/route.ts           # Test bench data management route
├── tests/                              # Master 4-Tier E2E Test Suite (230 tests)
│   ├── e2e/runner.mjs                  # Master test runner
│   ├── e2e/collector-suite.test.mjs    # Collector Studio verification suite
│   ├── e2e/tier1_features/             # Feature isolation tests (F01-F21)
│   ├── e2e/tier2_boundaries/           # Boundary, limit, and corner-case tests
│   ├── e2e/tier3_combinations/         # Cross-feature combination tests
│   └── e2e/tier4_scenarios/            # Real-world Bengaluru corridor scenarios
└── types/                              # TypeScript contract definitions
    ├── dossier.ts                      # Authority Dossier, Subagents, and Telemetry types
    └── map.ts                          # MapLibre layer and geometry interfaces
```

---

## ⚡ Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create `.env.local` in `dyad-app/`:
```bash
# Browser Use Cloud API Key (for autonomous web scraping at /collector)
BROWSER_USE_API_KEY=your_key_here
BROWSER_USE_MODEL=gpt-5.6-luna

# OpenAI API Key (for Modal / Python swarm subagents)
OPENAI_API_KEY=your_key_here
ORCHESTRATOR_MODEL=sol-medium
WORKER_MODEL=terra
```

### 3. Run Development Server
```bash
npm run dev
```
Visit **[http://localhost:3000](http://localhost:3000)**.

### 4. Run Test Suite
```bash
npm test
```
Executes all 230 opaque-box tests across all 4 tiers and the collector suite.

### 5. Production Build
```bash
npm run build
npm start
```
Compiles with Turbopack with 0 TypeScript errors.

---

## 🧭 Routes & User Flows

| Route | View Name | Purpose |
| :--- | :--- | :--- |
| `/` or `/landing` | **Landing Page** | TomTom congestion radar, 3D extruded hexagon layers, multi-city overview |
| `/dashboard` | **Urban Command Center** | Station snapping, terminus dropping, Turf.js buffer, live SSE swarm dossier |
| `/collector` | **GIS Collector Studio** | City-parametric Browser Use Cloud autonomous scraper with live CDP feed |
| `/data` | **Unified Data Studio** | Active spatial dataset table, column profiling, schema sniffing, file dropzone |
| `/agents` | **Agent Swarm Center** | KaTeX mathematical formulas, statutory regulatory limits, decision traces |
| `/login` & `/signup` | **Auth Shells** | Tactile authentication flows with Emil Kowalski spring animations |

---

## 🎨 Design System & Micro-Interactions
- **Palette:** Strict command center dark mode (`#0E1117` background, `#161B22` cards, hairline `border-white/[0.08]` borders).
- **Typography:** Tabular figures with `font-mono tabular-nums text-emerald-400 font-semibold` for all financial, distance, and population numbers.
- **Physics Springs:** Emil Kowalski motion curves (`motionSprings.smooth`, `motionSprings.snappy`) with tactile `whileTap={{ scale: 0.98 }}` tactile response.

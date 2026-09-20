<div align="center">

# 🚇 DYAD (Dynamic Urban Transit Autonomous Dossier)
### Autonomous Multi-Agent Intelligence for Rapid Urban Transit Feasibility, Statutory Environmental Compliance, and Dynamic Catchment Simulation

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.5_(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-v4.7.1-blue?style=for-the-badge&logo=maplibre)](https://maplibre.org/)
[![Turf.js](https://img.shields.io/badge/Turf.js-Spatial_Engine-green?style=for-the-badge)](https://turfjs.org/)
[![Modal Cloud](https://img.shields.io/badge/Modal-Cloud_Swarm-purple?style=for-the-badge)](https://modal.com/)
[![Browser Use Cloud](https://img.shields.io/badge/Browser_Use-Cloud_Agent-orange?style=for-the-badge)](https://cloud.browser-use.com/)
[![Tests Passing](https://img.shields.io/badge/E2E_Tests-230%2F230_Passed_(100%25)-brightgreen?style=for-the-badge)](https://github.com/Daiwik-Chilukuri/DYAD)

</div>

---

## 📌 Executive Summary & Hackathon Submission Brief

In Indian metropolitan cities, commissioning a new Metro rail or Bus Rapid Transit (BRT) corridor typically requires **18 to 36 months of manual consulting work**, costing municipal authorities crores of rupees for a single **Detailed Project Report (DPR)**. Planners are forced to manually sift through fragmented census sheets, stale traffic surveys, and siloed GIS shapefiles—often discovering catastrophic environmental violations (such as building over protected lake buffer zones or statutory floodways) only *after* contracts have been tendered.

**DYAD** replaces this slow, fragmented process with an **autonomous, multi-agent urban simulation platform**:
1. **Instant Corridors (<20ms):** Planners snap to existing metro networks or drop candidate terminus pins. The system generates high-precision line strings and dynamic radial catchment buffers instantly on the client via **Turf.js**.
2. **Autonomous Cloud Web Harvesting:** When expanding to new cities (e.g., Hyderabad, Pune, Chennai, Delhi-NCR), **Browser Use Cloud Agents** autonomously scour government open data portals (OpenCity.in, data.gov.in, TomTom Traffic Index, Overpass Turbo OSM) and extract verified 5-pillar spatial datasets.
3. **Parallel Multi-Agent Domain Swarm:** A coordinated swarm of specialized subagents (**Demographics, Economics & TOD, Mobility & Traffic, Ecological Risk & Waterbodies**) evaluate the corridor in parallel against real municipal boundaries and statutory mandates (**KTFD, HYDRAA, NGT, CRZ**).
4. **Authoritative Urban Command Center:** Streams real-time radar telemetry, 0–100 composite feasibility scoring, actionable risk mitigation steps, and interactive station proposals directly into a high-density, tactile UI built with **Emil Kowalski** spring micro-interactions.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              URBAN PLANNER / AUTHORITY                                  │
│  - Selects Origin Metro Station (Snaps to Green/Purple/Yellow Line coordinates)        │
│  - Drops Candidate Terminus Pin (Interactive WebGL Canvas)                             │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          DYAD FRONTEND ENGINE (`dyad-app/`)                            │
│                                                                                        │
│  1. WebGL Mapping Core (`MapCanvas.tsx` + MapLibre GL JS)                              │
│     - Station snapping & candidate viaduct polyline generation                         │
│     - Turf.js dynamic catchment polygon buffer (<20ms local compute)                   │
│     - Dynamic GeoJSON rendering (demographics, lakes, arterial roads, POIs)            │
│     - Bi-directional station marker interaction with `map.flyTo()` camera focus        │
│                                                                                        │
│  2. Real-Time Streaming Bridge (`/api/corridor/stream`)                                │
│     - Server-Sent Events (SSE) pipe with deterministic zero-crash fallback             │
│     - Modal Cloud volume synchronization & autonomous subagent dispatch                │
│                                                                                        │
│  3. Authority Command Center Surface (`AuthorityDossierPanel.tsx`)                     │
│     - Live Agent Radar Scan & Subagent Execution Telemetry                             │
│     - 0-100 Composite Feasibility Index Gauge                                          │
│     - 4 Domain Pillar Impact Cards (Demographics, Economics, Mobility, Ecological)     │
│     - Actionable Statutory Risk Mitigation Directives                                  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      AUTONOMOUS MULTI-AGENT SWARM (BACKEND)                            │
│                                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌────────────────────────────┐  │
│  │   Lead Synthesizer    │  │  Browser Use Agent    │  │   TypeSafe Classifier      │  │
│  │     (Sol-Medium)      │  │ (DeepSeek V4.1 Flash) │  │    (Jev Spatial Sniffer)   │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └─────────────┬──────────────┘  │
│              │                          │                            │                 │
│              ▼                          ▼                            ▼                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                             Specialist Domain Subagents                          │  │
│  │  - Demographics Terra:  Census catchment, slum equity index, transit dependency  │  │
│  │  - Economic Terra:      IT corridors, POI clustering, TOD yield & farebox model  │  │
│  │  - Mobility Terra:      Congestion reduction %, arterial speed delta vs road     │  │
│  │  - Ecological Terra:    Lake 30m FTL buffer infringements, stormwater drain flood│  │
│  │  - Visualizer Terra:    Boundary clipping, GeoJSON vector generation             │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Live Interactive Surfaces & Product Tour

DYAD provides 5 dedicated, cohesive product modules accessible from the sidebar:

### 1. Cinematic Urban Intelligence Landing Page (`/` or `/landing`)
* **Live TomTom Congestion Radar:** Contextual radar monitoring peak arterial speeds, annual congestion cost in hours, and travel time penalties across 6 Indian megacities (**Bengaluru, Hyderabad, Delhi-NCR, Mumbai, Chennai, Pune**).
* **3D Extruded Hexagon Congestion Mesh:** Powered by MapLibre GL `fill-extrusion` layers visualizing micro-level bottleneck hotspots.
* **Multi-Agent Pipeline Reel:** Interactive visual walkthrough demonstrating how Dyad compresses a 24-month DPR consulting cycle into 4 seconds of autonomous agent execution.

### 2. Urban Command Center Dashboard (`/dashboard`)
* **Origin Station Snapping:** Click any metro station on the canvas to anchor the viaduct origin.
* **Candidate Terminus Pin Drop:** Drop a pin anywhere in the metropolitan area to simulate a proposed viaduct extension.
* **Turf.js Catchment Buffer:** Instantly computes a 2,000m radial catchment envelope, identifying impacted wards and municipal population.
* **Real-Time Swarm Execution:** Hit *"Run Swarm Simulation"* to stream live telemetry thoughts, subagent execution chips, and radar scanning states.
* **Authority Dossier:** Delivers a comprehensive 0–100 feasibility rating, 4 domain pillar assessments, statutory risk alerts with mitigation actions, and AI-suggested intermediate station locations.

### 3. Autonomous GIS Collector Studio (`/collector`)
* **Browser Use Cloud Integration:** Deploys autonomous browser agents running on cloud microVMs powered by **DeepSeek-V4-Flash-Vision**.
* **5-Pillar Municipal Harvesting:** Directs the agent to discover, download, and verify spatial datasets from **OpenCity.in, TomTom Traffic Index, Overpass Turbo OSM, and state open data portals**.
* **Live CDP Video Preview:** Displays live video feed of the headless browser navigating portals, with real-time thought-action event logs.
* **One-Click Staging:** Promotes harvested city datasets directly into the active analytics pipeline.

### 4. Unified Data Studio (`/data`)
* **Ingested Dataset Catalog:** High-density table of all active spatial layers (Bengaluru, Chennai, Hyderabad, Pune).
* **Automated Schema Sniffing:** Automatically detects coordinate fields, geometry types (Point, LineString, Polygon), column null percentages, and data sample statistics.
* **Drag-and-Drop Ingestion:** Direct multi-format file uploader supporting GeoJSON, CSV, JSON, KML, Parquet, and DPR PDF documents.

### 5. Multi-Agent Mathematical & Trace Center (`/agents`)
* **Mathematical Formulations:** Renders rigorous mathematical formulas (via KaTeX) governing the feasibility scoring algorithms:
  $$\text{Score} = w_{\text{demo}} \cdot S_{\text{demo}} + w_{\text{econ}} \cdot S_{\text{econ}} + w_{\text{mob}} \cdot S_{\text{mob}} - \sum \text{Penalties}_{\text{eco}}$$
* **Statutory Compliance Mandates:** Outlines regulatory thresholds enforced by the Ecological agent (**KTFD 30m lake setbacks, HYDRAA Full Tank Level rules, CRZ coastal zones, NGT floodway buffers**).
* **Agent Trace Explorer:** Transparent execution logs detailing reasoning steps, primary inputs, and output decisions for each specialist agent.

---

## 👥 Hackathon Multi-Agent Prototyping & Contribution Proof

To ensure rapid, collision-free collaboration among teammates utilizing diverse AI coding agents (Antigravity, Claude, Cursor, Windsurf), the project strictly followed the **Modular Prototype Architecture** specified in `AGENTS.md`:

```text
DYAD-PRAYAS/
├── AGENTS.md                                   # Multi-agent governance and prototype rules
├── PROJECT.md                                  # Complete technical architecture specification
├── dyad-app/                                   # PRODUCTION APPLICATION (Synthesized by Master Compiler)
│   ├── components/                             # High-density UI (Dossier, MapCanvas, Landing, Navigation)
│   ├── public/data/                            # Active spatial layers (Bengaluru, Chennai, Hyderabad, Pune)
│   ├── scripts/                                # Browser Use Cloud collector and data automation
│   ├── src/app/                                # Next.js 16 App Router (dashboard, collector, data, agents)
│   └── tests/                                  # 4-Tier E2E test suite (230 tests)
├── prototype-modal-cloud-orchestrator/         # Modal Cloud multi-agent swarm & Python SSE bridge
├── prototype-browser-dataset-collector/        # Autonomous Browser Use Cloud scraping engine
├── prototype-dataset-classifier/               # TypeSafe / Jev in-memory dataset sniffer
├── prototype-datasets-collection/              # Curated raw GIS datasets & municipal census layers
├── prototype-map-canvas-ui/                    # WebGL map layers & landing page reference components
└── prototype-streaming-stress-tests/           # SSE network resilience & buffer stress test harness
```

### Team Contribution Tracks:
* **Track 1: GIS Map Engine & Landing Experience (`prototype-map-canvas-ui`)**  
  Authored the MapLibre GL 3D vector canvas, custom dark-matter basemap styling, TomTom traffic congestion radar, and interactive city flashcards.
* **Track 2: Cloud Multi-Agent Swarm Orchestrator (`prototype-modal-cloud-orchestrator`)**  
  Architected the Modal AI serverless app, OpenAI `sol-medium` / `terra` subagent pipelines, Pydantic schemas, and SSE stdout streaming bridge.
* **Track 3: Autonomous Web Dataset Collector (`prototype-browser-dataset-collector`)**  
  Engineered the city-parametric prompt generator and Browser Use Cloud autonomous browser execution pipeline using DeepSeek-V4-Flash-Vision.
* **Track 4: Dataset Classification & Spatial Ingestion (`prototype-dataset-classifier`)**  
  Created the schema sniffer for automated coordinate detection, spatial attribute classification, and TypeSafe AI integration.
* **Track 5: Master Compiler Agent (`Antigravity` by Google DeepMind)**  
  Extracted, verified, and unified components from all prototype folders into the production application in `dyad-app/`, maintaining clean design tokens, zero build errors, and a 230-test E2E test suite.

---

## 🧪 Comprehensive Verification & Test Results

DYAD is hardened by an opaque-box **4-Tier E2E Test Suite** containing **230 automated tests**:

```bash
cd dyad-app
npm test
```

### Test Suite Execution Summary:
```text
================================================================
       DYAD E2E OPAQUE-BOX TEST RUNNER (4-TIER SUITE)           
================================================================
Active Tiers: [1, 2, 3, 4] | Verbose: false | Bail: false

  T1  | Tier 1: Feature Coverage (Isolation) |   105 |  105 |    0 |   37ms
  T2  | Tier 2: Boundary & Corner Cases      |   105 |  105 |    0 |    7ms
  T3  | Tier 3: Cross-Feature Combinations   |    10 |   10 |    0 |    4ms
  T4  | Tier 4: Real-World Bengaluru Scenarios |     5 |    5 |    0 |    3ms
------|--------------------------------------|-------|------|------|--------
 TOTAL| All Active Tiers Combined             |   225 |  225 |    0 |   53ms
================================================================
✔ TEST SUITE PASSED: 100% (225/225) tests successful!

================================================================
       DYAD COLLECTOR STUDIO TEST SUITE                         
================================================================
  ✔ [PASS] SidebarRail has COLLECT navigation item with Compass icon
  ✔ [PASS] Collector page exists with City Profiles and 5-Pillar Prompt Builder
  ✔ [PASS] Harvested Hyderabad datasets are staged in public/data/hyderabad
  ✔ [PASS] Collector datasets API route handles listing and staging
  ✔ [PASS] Collector stream API route implements 5-pillar SSE pipeline
================================================================
 Collector Test Suite Result: 5/5 Passed (100%)
================================================================
```

### Production Build Validation:
- **Build Engine:** Next.js 16.3.5 (Turbopack)
- **TypeScript:** 0 compilation errors across all pages, API routes, and components.
- **Bundle Output:** Fully optimized static prerendering and dynamic server streaming handlers.

---

## 🛠️ Quickstart & Local Setup Guide

Follow these steps to run the complete DYAD platform locally:

### 1. Prerequisites
- **Node.js:** v18.17+ or v20+ (Node v20.x recommended)
- **Python:** v3.10+ (for local child process orchestrator / scraper runners)
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/Daiwik-Chilukuri/DYAD.git
cd DYAD
```

### 3. Install Frontend Dependencies
```bash
cd dyad-app
npm install
```

### 4. Configure Environment Variables
Inside `dyad-app/.env.local`, set your API credentials:
```bash
# Browser Use Cloud API Key (for autonomous dataset scraper at /collector)
BROWSER_USE_API_KEY=your_browser_use_api_key_here
BROWSER_USE_MODEL=gpt-5.6-luna

# OpenAI API Key (for cloud multi-agent swarm synthesis)
OPENAI_API_KEY=your_openai_api_key_here
ORCHESTRATOR_MODEL=sol-medium
WORKER_MODEL=terra
FALLBACK_ORCHESTRATOR_MODEL=gpt-4o
FALLBACK_WORKER_MODEL=gpt-4o-mini
```
*(Note: If no OpenAI key is present, DYAD automatically activates its **deterministic mathematical GIS fallback engine**, ensuring 100% functionality without crashes).*

### 5. Run the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser:
- **Landing Page:** `http://localhost:3000/`
- **Command Center:** `http://localhost:3000/dashboard`
- **GIS Collector Studio:** `http://localhost:3000/collector`
- **Unified Data Studio:** `http://localhost:3000/data`
- **Multi-Agent Trace Center:** `http://localhost:3000/agents`

### 6. Run the Test Suite
```bash
npm test
```

### 7. Build for Production
```bash
npm run build
npm start
```

---

## 📜 Key Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.5 (App Router, Turbopack) | Server-rendered streaming application core |
| **WebGL Mapping** | MapLibre GL JS v4.7.1 | Client-side 60fps vector basemap & layer rendering |
| **Spatial Engine** | Turf.js v7.4.0 | Real-time geodesic buffers, line intersections, point-in-polygon |
| **Styling & Design** | Tailwind CSS v4 + Watermelon UI | Strict dark command-center aesthetic (`#0E1117`, `#161B22`) |
| **Motion & Springs** | Framer Motion v13 (Emil Kowalski springs) | Tactile micro-interactions and smooth layout animations |
| **Formulas** | KaTeX | High-precision mathematical formula rendering in Agent Center |
| **Agent Swarm** | Modal AI + OpenAI (Sol-Medium / Terra / GPT-4o) | Parallel cloud multi-agent simulation & structured synthesis |
| **Web Crawler** | Browser Use Cloud SDK V4 + DeepSeek-V4 Flash | Autonomous browser agent for open-data portal acquisition |
| **Testing** | Custom ESM E2E Runner (230 tests) | Multi-tier contract, spatial boundary, and scenario validation |

---

## ⚖️ License & Acknowledgements

- **License:** MIT License.
- **Geospatial & Census Data Sources:** OpenStreetMap contributors, OpenCity.in, Bruhat Bengaluru Mahanagara Palike (BBMP), Greater Hyderabad Municipal Corporation (GHMC), Pune Municipal Corporation (PMC), Greater Chennai Corporation (GCC), BMRCL, and TomTom Traffic Index.

Developed with ❤️ for the Hackathon by the **DYAD Team**.

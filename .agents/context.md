# DYAD: Agent Context & Multi-Agent Prototyping Guide

> **CRITICAL INSTRUCTION FOR ALL AI CODING AGENTS (Antigravity, Cursor, Windsurf, Claude Code, Copilot, Cline, Aider, etc.):**
> Read this document completely before generating code or modifying the repository. All prototyping work must adhere strictly to the **Multi-Agent Prototyping Protocol** defined below to prevent merge conflicts among hackathon teammates.

---

## 1. Project Overview

* **Project Name:** DYAD
* **Tagline:** Google Maps on Steroids for Urban Transit Planners
* **Theme:** AI for Good (24-Hour Hackathon)
* **Target City:** Bengaluru (Namma Metro Network)
* **Core Mission:** Traditional transit Detailed Project Reports (DPRs) and pre-feasibility studies take **12 to 24 months and ₹5+ Crore** to assess candidate metro corridors. DYAD compresses this reconnaissance phase into **under 4 seconds** by combining instant deterministic spatial math with a swarm of specialized AI agents.

### The User Journey
1. **Interactive War Room:** Planners view Bengaluru's operational & planned metro lines on a futuristic dark vector canvas (MapLibre GL JS).
2. **Station-Snap & Target Pin:** User clicks an origin metro station (snaps to verified coordinates) and drops a terminus pin or selects a preset corridor (e.g., *Silk Board $\rightarrow$ Sarjapur*).
3. **Instant Geospatial Catchment:** Turf.js immediately projects a 2km radial catchment buffer and computes demographic overlap, POI counts, and travel time deltas in <20ms.
4. **Cloud Swarm & Experiments (Modal AI + OpenAI):** Parallel agents run serverless in the cloud on **Modal AI** powered by our team's **OpenAI API Key (GPT-4o)** to evaluate equity, economic density, TomTom road vs rail travel times, and environmental lake buffer risks.
5. **Interactive Authority Dossier:** Displays an overall 0–100 Feasibility Score and 4 Quantified Impact Cards with bi-directional map camera navigation (`map.flyTo()`).
6. **Dataset Ingestion Drawer:** A Segregator Agent accepts arbitrary CSV/GeoJSON files, detects schema, and registers them into the spatial index.

---

## 2. Core Architecture & Tech Stack

| Layer | Technology | Key Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14/15 (App Router, TypeScript)** | High-performance React, server components, Tailwind CSS, Lucide React, Framer Motion. |
| **Design System & Craft** | **Watermelon UI + Tri-Layer Stack** | React 19 + Tailwind v4 + Motion with **Taste**, **Impeccable** (strict tokens), and **Emil Kowalski** (spring physics). See [`.agents/design-system.md`](./design-system.md). |
| **Map Rendering** | **MapLibre GL JS** | Open-source WebGL vector renderer, CARTO Dark Matter basemap, neon line shaders, 3D camera controls. |
| **Local Spatial Math** | **Turf.js (`@turf/turf`)** | Deterministic in-browser and edge geometry compute: buffer, booleanIntersects, pointsWithinPolygon. |
| **Cloud Agent Execution** | **Modal AI (`modal.com`)** | Serverless cloud containers running parallel agent tasks, batch corridor simulations, and geospatial dataset experiments. |
| **LLM & Reasoning** | **OpenAI API (`gpt-4o`, `gpt-4o-mini`)** | Dedicated team API key used in Modal cloud functions and Next.js edge route handlers for structured JSON output. |
| **Curated Datasets** | **Bengaluru GeoJSON** | Namma Metro Phase 1/2 lines & stations, 198 BBMP ward boundaries + census, 350+ OSM POIs, NGT 75m lake buffers. |

---

## 3. Strict Multi-Agent Prototyping Protocol (Avoid Merge Conflicts)

Because multiple teammates are developing features in parallel using different coding agents and IDEs, strict isolation is enforced:

### Rule 1: Always Work in an Isolated Prototype Folder
* **NEVER directly edit shared root files** (`package.json`, root `src/`, root configuration) during the prototyping phase.
* Every teammate and agent MUST create and work inside their own dedicated subfolder at the root of the repository.

### Rule 2: Standardized, Self-Descriptive Folder Naming
Folder names must be **immediately understandable by any other agent or human** just by glancing at the directory name. 

Always follow the format:
```text
prototype-<domain-area>-<focus>/
```
or:
```text
<domain>-prototyping/
```

#### Approved Standard Prototype Folder Examples:
* `prototype-agent-orchestration/` — Multi-agent routing, OpenAI prompt chains, debate/scoring synthesis.
* `prototype-datasets-collection/` — Geospatial data sourcing, GeoJSON cleaning, BBMP ward census indexing.
* `prototype-modal-cloud-experiments/` — Modal AI serverless app (`app.py`), cloud container setup, batch dataset experiments.
* `prototype-map-canvas-ui/` — MapLibre GL map setup, dark mode basemap, neon line shaders, station markers.
* `prototype-dossier-panel/` — Glassmorphic briefing sidebar, metric cards, 3D `flyTo` camera hooks.
* `prototype-dataset-segregator/` — CSV/GeoJSON ingestion drawer, automatic schema classification agent.
* `prototype-mobility-models/` — TomTom congestion delta formulas, BPR road friction calculations, decarbonization math.

### Rule 3: Self-Contained Prototype Anatomy
Each prototype folder should be self-contained and include:
```text
prototype-<name>/
├── README.md              # Clear explanation of what this prototype accomplishes
├── index.ts (or main.py)  # Clear entry point / exported functions
├── ...                    # Internal components, scripts, or tests
└── types.ts (optional)    # Exported types or data contracts
```

### Rule 4: Export Clean, Modular Interfaces
When building a prototype, design its primary functionality as clean, modular functions or components so that other agents can easily import or adapt them:
* If building spatial utilities: export pure functions (e.g. `export function computeCorridorMetrics(...)`).
* If building UI widgets: export typed React components (e.g. `export function AuthorityDossierPanel(...)`).
* If building Modal functions: export clear `@app.function` definitions.

### Rule 5: End-of-Sprint Integration Phase (`/teamwork-preview` or `/goal`)
* As the 24-hour hackathon nears completion, the team will run an agent orchestration session (such as `/teamwork-preview` or `/goal`).
* The orchestrating agent will inspect all `prototype-*/` directories, extract the verified modules, and cleanly assemble them into the unified production Next.js App (`src/`) and Modal cloud deployment (`modal_app/`).
* Having separate prototype folders guarantees **zero merge conflicts**, **zero accidental code overwrites**, and **rapid parallel velocity**!

### Rule 6: Strict UI Craft & Anti-Slop Discipline
All frontend components, map layers, widgets, and drawer interactions must strictly follow [`.agents/design-system.md`](./design-system.md):
* **Taste:** High-contrast dark command center aesthetic; no generic SaaS templates or fuzzy purple blobs.
* **Impeccable:** Mathematical 4px/8px rhythm; no arbitrary CSS values; single-level cards; tabular figures for telemetry (`font-mono tabular-nums`).
* **Emil Kowalski:** Physics-based spring animations (`motionSprings`); origin-aware popover/drawer transforms; tactile button feedback (`whileTap: scale 0.98`).
* **Watermelon UI:** Extend and skin Watermelon UI primitives professionally without breaking design consistency.

---

## 4. Environment Variables & Secrets

Never commit actual secrets to git. Store local secrets in `.env.local`:
```bash
# OpenAI API Key (used for agent reasoning & synthesis)
OPENAI_API_KEY="sk-..."

# Modal AI Credentials (for deploying & running cloud experiments)
MODAL_TOKEN_ID="ak-..."
MODAL_TOKEN_SECRET="as-..."

# Optional fallbacks / other providers
NEXT_PUBLIC_MAP_STYLE="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
```

---

## 5. Quick Agent Prompt Snippet

When prompting your AI agent in Cursor, Windsurf, Claude Code, Antigravity, or Copilot, copy and paste this quick blurb at the top:

> **Agent Instruction:** "I am working on DYAD. Read `.agents/context.md` and `.agents/design-system.md` before taking action. Create/modify files ONLY inside my dedicated isolated prototype folder (e.g., `prototype-<feature-name>/`) to avoid git merge conflicts with teammates. Enforce the Tri-Layer Design Stack (Taste + Impeccable + Emil Kowalski) on all UI code."

# DYAD: Urban Transit Intelligence Copilot
## Product Requirements Document (PRD)

**Project Name:** DYAD  
**Theme:** AI for Good  
**Slogan:** Google Maps on Steroids  
**Target City Focus (Hackathon Pilot):** Bengaluru (Namma Metro Network)  
**Timeline:** 24-Hour Hackathon Build & Pitch  

---

## 1. Executive Summary

Bengaluru is officially the **second most congested city in the world** (TomTom Traffic Index 2025). The average commuter loses **168 hours every year** trapped in traffic, driving at an average rush-hour speed of just **13.9 km/h**. Traffic gridlock drains Bengaluru of **₹20,000 Crore annually** in lost productivity, fuel waste, and health impacts.

While expanding the Namma Metro is universally acknowledged as the primary cure, transit authorities (BMRCL, DULT, BBMP) face an agonizing planning bottleneck: **traditional Pre-Feasibility and Detailed Project Reports (DPRs) take 12 to 24 months and millions of rupees** just to collect, clean, cross-reference, and evaluate spatial demographics, land friction, and traffic displacement for candidate extension corridors.

**DYAD** is an AI-powered urban transit intelligence copilot designed to compress that 18-month preliminary reconnaissance phase into **under 5 seconds**. 

Authorities simply click an existing metro station, drop a target pin on the interactive dark-mode map, and unleash a **swarm of specialized AI agents running on Modal AI in the cloud (backed by OpenAI)** that run real-time spatial calculations (catchment demographics, POI clusters, commuter time savings, climate decarbonization, and ecological friction) and return a rich, interactive **Authority Intelligence Dossier** with bi-directional map camera controls.

---

## 2. Problem Statement & "AI for Good" Alignment

### 2.1 The Problem
1. **Siloed Urban Data:** Census data, IT corridor employment, road traffic telemetry, healthcare access, and lake catchment zones live in separate departmental silos (BBMP, BMRCL, OpenCity, Census of India, KSPCB).
2. **Extreme Sluggishness of Transit DPRs:** Before an authority can even debate whether to extend a line from *Silk Board to Sarjapur* or *Whitefield to Hosakote*, consultants must spend months running surveys and manual GIS overlays.
3. **Lack of Multi-Dimensional Tradeoff Visibility:** Planners frequently over-index on either pure passenger volume or pure construction feasibility, ignoring equity (connecting underserved working-class wards) or environmental risks (encroaching on sensitive lake buffers).

### 2.2 Why AI for Good?
* **Decarbonization at Scale:** Transportation accounts for Bengaluru's largest share of air pollution and GHG spikes. Prioritizing the right metro extensions eliminates tens of thousands of daily car/cab trips.
* **Transit Equity:** DYAD explicitly scores how many low-to-middle income citizens in peri-urban wards gain rapid transit access to central employment corridors.
* **Public Wealth Protection:** By triaging unviable corridors before expensive geotechnical surveys begin, public funds are allocated where human impact is maximized.

---

## 3. Target User Personas

| Persona | Role | Primary Goal | How DYAD Helps |
| :--- | :--- | :--- | :--- |
| **BMRCL Transit Planner** | Chief Route Feasibility Engineer | Rapidly compare 3 candidate extension alignments without commissioning 3 separate DPR studies. | Instant corridor buffer slicing, station-snap alignment, and quantified catchment reports. |
| **DULT Urban Strategist** | Directorate of Urban Land Transport Official | Ensure transit equity, modal shift from private vehicles, and non-conflicting master plans. | Real-time calculation of daily commute hours saved and modal shift percentage. |
| **Municipal Commissioner / Policymaker** | BBMP / Urban Development Authority | Present clear, visual, data-backed rationale to the public and ministry for funding approval. | Cinematic 3D camera sweeps, executive scorecards, and 1-click printable briefing dossiers. |

---

## 4. Key Product Features & User Journey

### Step 1: The Command Center (Landing & Map Canvas)
* **High-Tech Aesthetic:** A futuristic dark vector canvas (MapLibre GL JS) rendering Bengaluru’s full operational and under-construction Namma Metro network (Purple, Green, Yellow, Blue lines) with vibrant neon styling.
* **Macro City Telemetry:** Live header ticker showing real city stats: `Current Speed: 13.9 km/h` | `Annual Congestion Loss: ₹20,000 Cr` | `Active Stations: 76` | `Mode: Authority Pre-Feasibility`.
* **Preset Corridor Quick-Launcher:** 1-click buttons for famous high-friction Bengaluru corridors:
  * *The Sarjapur Tech Spine* (Silk Board $\rightarrow$ Sarjapur via Agara)
  * *The Eastern Industrial Belt* (Whitefield $\rightarrow$ Hosakote)
  * *The Bannerghatta Tech Link* (Jayadeva $\rightarrow$ Electronic City Phase 1)
  * *The North-West Commuter Reach* (Peenya $\rightarrow$ Nelamangala)

### Step 2: Interactive Corridor Definition
* **Station Snap-to-Grid:** Clicking near an existing metro station snaps the origin node directly to that station's verified coordinates.
* **Free Point Drop & Multi-Stop Waypoints:** The user clicks anywhere on the map to define the proposed extension terminus or add intermediate waypoints.
* **Dynamic Corridor Visualization:** The system immediately draws an animated gradient polyline and projects an adjustable **catchment buffer swath** (e.g., 1.5 km – 2.0 km radius) along the path.

### Step 3: Dataset Ingestion Drawer (Hybrid Capability)
* **Pre-bundled Curated Geospatial Assets:**
  * 198 BBMP Ward Boundaries with Census Demographics & Working-class population weights.
  * 300+ Verified Bengaluru Key POIs (Tech Parks: Manyata, Ecospace, RMZ, ITPL; Hospitals: Manipal, Narayana, Aster; Colleges: RV, PES, IISc; Transit hubs).
  * Major water bodies and sensitive ecological buffers (Bellandur Lake, Varthur Lake, Agara Lake).
* **Custom Dataset Dropzone:**
  * Users can upload arbitrary CSV, GeoJSON, or JSON files (e.g., localized bus feeder stops, new housing society clusters).
  * **The Segregator Agent** inspects headers, infers data schemas, assigns semantic tags (`[mobility]`, `[poi]`, `[census]`, `[environmental]`), and registers them into the active spatial index.

### Step 4: Parallel Multi-Agent Intelligence Engine (Modal AI + OpenAI)
Upon corridor confirmation, the agent orchestrator triggers **4 specialized domain agents** running in parallel. Heavy agent evaluations, batch corridor permutations, and dataset experiments run serverless in the cloud on **Modal AI**, powered by our team's **OpenAI API Key** (GPT-4o / GPT-4o-mini):
1. **Demographics & Equity Agent:** Computes total population within the 2km buffer, ward intersection percentages, working-class ratio, and equity index.
2. **POI & Economic Corridor Agent:** Clusters tech parks, offices, educational institutions, and healthcare centers along the path; assigns an Economic Density Score.
3. **Mobility & Transit Agent:** Compares TomTom road congestion (13.9 km/h baseline) with projected Metro travel times (36 km/h avg), calculating peak-hour commuter time savings and daily vehicle trip reductions.
4. **Feasibility & Ecological Risk Agent:** Scans corridor proximity to water bodies, lake buffer zones, green cover, and road width bottlenecks to identify infrastructure friction.

### Step 5: The Authority Intelligence Dossier & Bi-directional Map Interactivity
A sleek, collapsible glassmorphic right-hand briefing panel displays the synthesized findings:
* **Overall Corridor Impact Score:** A unified 0–100 index (e.g., `88/100 - Prime Candidate`).
* **4 Quantified Impact Cards:**
  * 👥 **Catchment:** Total residents reached + % working class.
  * ⏱️ **Time Saved:** Hours saved per commuter annually + congestion cost averted.
  * 🌱 **Climate:** Metric tons of $CO_2$ offset/year + vehicles removed from road.
  * ⚠️ **Friction & Feasibility:** Top 3 land/environmental friction watchpoints.
* **Bi-directional "Fly to Focus" Buttons:**
  * Clicking any POI or ward mentioned in the brief triggers a smooth `map.flyTo()` camera animation that tilts the map to a 45° 3D pitch, zooms directly into that coordinate, and illuminates the asset.
* **Interactive Ward Hover Tooltips:**
  * Hovering over any intersected BBMP ward on the map displays a micro-card explaining how this specific extension relieves pressure in that specific neighborhood.
* **Export Dossier:** 1-click export of an Executive Briefing PDF / JSON report ready for committee presentations.

---

## 5. Non-Functional & Hackathon Requirements

1. **Zero-Latency Resilience & Cloud Execution (Modal AI + Local Cache):**
   * Pre-computed Turf.js spatial computations run synchronously or within <1.5s in the browser / Next.js edge API.
   * Cloud agents and dataset experiments execute on **Modal AI** serverless infrastructure using our dedicated **OpenAI API key** with sub-second container dispatch.
   * LLM agents run with streaming status indicators ("Classifying POI density...", "Evaluating Bellandur lake buffer...").
   * Built-in deterministic fallback cache: If third-party LLM APIs face rate limits or Wi-Fi drops on stage, the app gracefully falls back to pre-synthesized high-quality responses with zero UI stutter.
2. **Device Responsiveness:** Optimized for presentation screens, laptops, and wide displays.
3. **Open & Scalable Stack:** Built on MapLibre GL JS (open-source vector tiles), Turf.js, Modal AI serverless cloud runtime, and OpenAI (GPT-4o) APIs.

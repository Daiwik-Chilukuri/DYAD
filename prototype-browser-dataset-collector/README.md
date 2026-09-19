# Prototype: Browser Use Cloud Dataset Collector (Generic City Agent)

Autonomous, city-parametric dataset acquisition engine for **DYAD** powered by **Browser Use Cloud API V4** and **DeepSeek V4.1 Flash Vision** (`deepseek-v4-flash-vision`).

---

## 1. Concept & Architecture

In DYAD, when a user enters **any city name** (or when switching from manual dataset uploads to autonomous collection):
1. **Generic City-Parametric Prompt Generator (`prompt_generator.py`)**:
   Automatically synthesizes a comprehensive, municipal-specific search, download, and verification directive across the **5 Core DYAD Spatial Pillars**:
   * **Pillar 1: Demographics & Equity** (Municipal ward boundary GeoJSONs, census population density, urban slum/informal settlement records).
   * **Pillar 2: Economic & Tech Hubs** (IT corridors, SEZs, office campuses, hospital POIs, Overpass Turbo OSM queries).
   * **Pillar 3: Mobility & Traffic** (Metro rail stations/alignments, TomTom peak arterial road speeds, feeder bus terminals).
   * **Pillar 4: Ecological Risk & Waterbody Setbacks** (Lakes, rivers, stormwater nalas, and statutory buffer laws such as HYDRAA 30m FTL in Hyderabad, KTFD 30m in Bengaluru, or Red/Blue flood lines in Pune).
   * **Pillar 5: Map Canvas Visualizer** (Metropolitan municipal boundary GeoJSON).

2. **Browser Use Cloud Agent (`cloud_collector.py`)**:
   Connects to Browser Use Cloud via `browser-use-sdk.v4`, spins up a dedicated persistent cloud workspace (`dyad-<city_slug>`), executes autonomous browser navigation on cloud microVMs using **DeepSeek V4.1 Flash**, and downloads the harvested datasets to local storage (`downloads/<city_slug>/raw/`).

---

## 2. Directory Structure

```text
prototype-browser-dataset-collector/
├── prompt_generator.py            # Generic City-Parametric Prompt Generator
├── cloud_collector.py             # Browser Use Cloud V4 Agent runner
├── eval_collector.py              # Test & evaluation benchmark runner
├── docs/
│   └── browser_use_llms.txt       # Local copy of Browser Use documentation
├── prompts/
│   ├── hyderabad_generated_prompt.md  # Auto-generated prompt for Hyderabad
│   └── hyderabad_collector_prompt.md  # Reference manual prompt
├── downloads/
│   └── hyderabad/raw/             # Local landing folder for harvested GeoJSON/CSV files
├── .env                           # API Key configuration
└── README.md
```

---

## 3. Configuration (`.env`)

Edit `prototype-browser-dataset-collector/.env`:
```bash
# Get your API key at https://cloud.browser-use.com/settings?tab=api-keys
BROWSER_USE_API_KEY=your_actual_browser_use_api_key

# Cloud Agent Model
BROWSER_USE_MODEL=deepseek-v4-flash-vision
```

---

## 4. Running Evaluations

### 1. Test Generic Prompt Generation & Dry Run (No API key needed):
```bash
python eval_collector.py --city "Hyderabad" --corridor "Raidurg to Kokapet Neopolis" --dry-run
```

### 2. Test Other Cities (Pune, Chennai, Mumbai, etc.):
```bash
python eval_collector.py --city "Pune" --corridor "Hinjawadi to Shivajinagar" --dry-run
```

### 3. Launch Live Cloud Agent Run (Requires `BROWSER_USE_API_KEY` in `.env`):
```bash
python eval_collector.py --city "Hyderabad"
```
Once dispatched, you will receive:
- **Cloud Run ID & Workspace ID**
- **Live Video & Telemetry Preview URL**: `https://cloud.browser-use.com/runs/<run_id>`
- Automatic local download of all harvested datasets into `downloads/hyderabad/raw/` upon completion.

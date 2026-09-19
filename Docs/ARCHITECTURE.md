# System Architecture: DYAD
## Technical Design & Multi-Agent Specification

```mermaid
flowchart TD
    subgraph UI ["Client Layer (Next.js 14/15 + React + MapLibre GL)"]
        Canvas["MapLibre GL Canvas (Dark Basemap)"]
        StationsLayer["Namma Metro Lines & Stations Layer"]
        CorridorTool["Station-Snap & Pin Drop Engine"]
        BriefPanel["Authority Intelligence Dossier (Right Panel)"]
        IngestModal["Dataset Ingestion Drawer (CSV / GeoJSON)"]
    end

    subgraph SpatialEngine ["Deterministic Spatial Compute (Turf.js)"]
        BufferGen["turf.buffer(corridor, 2.0km)"]
        POIIntersect["turf.pointsWithinPolygon()"]
        WardIntersect["turf.intersect(buffer, BBMP_Wards)"]
        MetricCalc["Distance, Speed Delta & Time Savings Engine"]
    end

    subgraph CloudEngine ["Cloud Agent Execution & Dataset Experiments (Modal AI + OpenAI)"]
        ModalApp["Modal Serverless App (@app.function)"]
        OpenAIClient["OpenAI API Client (GPT-4o / GPT-4o-mini)"]
        DatasetBatch["Batch Dataset Experiment Runner & Slicer"]
        CloudDemoAgent["Cloud Demographics & Equity Worker"]
        CloudPOIAgent["Cloud POI & Economic Cluster Worker"]
        CloudTransitAgent["Cloud Mobility & Traffic Simulation Worker"]
        CloudFeasAgent["Cloud Environmental Risk Worker"]
    end

    subgraph AgentOrchestrator ["Multi-Agent Intelligence Network (Next.js Route Handlers / Edge)"]
        SegAgent["Agent 0: Dataset Segregator & Schema Classifier"]
        DemoAgent["Agent 1: Demographics & Equity Agent"]
        POIAgent["Agent 2: POI & Economic Corridor Agent"]
        TransitAgent["Agent 3: Mobility & Travel Time Agent"]
        FeasAgent["Agent 4: Ecological & Feasibility Risk Agent"]
        DebriefAgent["Agent 5: Executive Debrief & Synthesis Agent"]
    end

    subgraph DataStore ["Curated Bengaluru Data Store & Cache"]
        MetroGeoJSON["bangalore_metro_phase1_2.geojson"]
        WardsGeoJSON["bbmp_wards_demographics.geojson"]
        POIsGeoJSON["bangalore_pois_categorized.geojson"]
        LakesGeoJSON["bangalore_water_bodies.geojson"]
        DossierCache["Pre-synthesized Fail-Safe Fallbacks"]
    end

    %% Interactions
    CorridorTool -->|Start Station + End Point| BufferGen
    IngestModal -->|Uploaded Files| SegAgent
    SegAgent -->|Tagged Data Slices| DataStore

    BufferGen --> POIIntersect
    BufferGen --> WardIntersect
    BufferGen --> MetricCalc

    DataStore --> POIIntersect
    DataStore --> WardIntersect

    POIIntersect & WardIntersect & MetricCalc -->|Pre-filtered Spatial Payloads| AgentOrchestrator
    POIIntersect & WardIntersect & MetricCalc -.->|Heavy Experiment Dispatch| ModalApp

    ModalApp --> OpenAIClient
    ModalApp --> DatasetBatch
    DatasetBatch --> CloudDemoAgent & CloudPOIAgent & CloudTransitAgent & CloudFeasAgent
    CloudDemoAgent & CloudPOIAgent & CloudTransitAgent & CloudFeasAgent -.->|Cloud Experiment Results| DebriefAgent

    DemoAgent & POIAgent & TransitAgent & FeasAgent -->|Domain Insights & Scores| DebriefAgent
    DebriefAgent -->|Unified Structured JSON Dossier| BriefPanel
    BriefPanel -->|flyTo(coords, pitch, zoom)| Canvas
    Canvas -->|Hover Ward ID| BriefPanel
```

---

## 1. Technology Stack Breakdown

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14/15 (App Router, TypeScript)** | Single full-stack repository. Zero CORS friction between UI and API routes. High-performance SSR and serverless route handlers. |
| **Mapping Engine** | **MapLibre GL JS** | 100% open-source, zero API-key billing risk. Hardware-accelerated WebGL vector tiles, native 3D pitch/bearing manipulation, dynamic neon line gradients, and high-DPI rendering. |
| **Vector Basemap** | **CartoDB Dark Matter / MapLibre Demo Tiles** | Provides the futuristic, dark "urban war room" aesthetic that makes neon metro tracks and colorful POI clusters pop visually. |
| **Spatial Engine** | **Turf.js (`@turf/turf`)** | Robust, client/server-compatible GIS geometry algorithms. Computes corridor buffers, polygon-in-polygon clipping, and geodesic distances in under **15 milliseconds**. |
| **Cloud Agent Execution** | **Modal AI (`modal.com`)** | Serverless Python container execution in the cloud. Runs parallel agent workers, complex corridor permutations, and dataset experiments at massive scale with sub-second container startup. |
| **Styling & UI** | **Tailwind CSS + Framer Motion + Lucide React** | Rapid design of glassmorphic panels, animated radar scanning indicators, micro-interactions, and collapsible drawers within 24 hours. |
| **LLM & Agent SDK** | **OpenAI API (`openai` SDK / GPT-4o, GPT-4o-mini)** | High reasoning capability and structured JSON generation. Used across Modal AI cloud agent functions and local orchestrator routes with dedicated team API key. |

---

## 2. Geospatial Slicing & Calculation Pipeline

When the user selects an existing station $S_{origin}$ and drops a destination pin $P_{terminus}$:

1. **Line Generation:** Turf.js constructs a `Feature<LineString>` representing the proposed extension.
2. **Buffer Generation:**
   ```typescript
   import * as turf from '@turf/turf';

   const corridorLine = turf.lineString([originCoords, terminusCoords]);
   const corridorBuffer = turf.buffer(corridorLine, 2.0, { units: 'kilometers' });
   // Returns a 2km radial catchment polygon surrounding the extension track
   ```
3. **Spatial Intersections:**
   * **Ward Demographics:** Filter BBMP wards where `turf.booleanIntersects(corridorBuffer, wardPolygon)` is true. Calculate proportional population:
     $$\text{Pop}_{\text{catchment}} = \sum (\text{Ward}_{\text{pop}} \times \text{OverlapRatio})$$
   * **POI Density:** Filter tech parks, hospitals, and educational facilities using `turf.pointsWithinPolygon(allPOIs, corridorBuffer)`.
   * **Ecological Friction:** Test intersection against sensitive water bodies (e.g., Bellandur, Varthur, Agara lakes) to flag legal and geotechnical buffers.
4. **Mobility & Congestion Delta Model:**
   * Grounded in **TomTom 2025 Bengaluru Benchmarks**:
     * Rush-hour road speed: $v_{\text{road}} = 13.9 \text{ km/h}$
     * Average Metro speed: $v_{\text{metro}} = 36.0 \text{ km/h}$
     * Trip Distance: $d \text{ km}$
     * Peak Road Time: $T_{\text{road}} = \frac{d}{13.9} \times 60 \text{ mins}$
     * Metro Transit Time: $T_{\text{metro}} = (\frac{d}{36.0} \times 60) + \text{station stops} \times 1.2 \text{ mins}$
     * Time Saved per Commuter Trip: $\Delta T = T_{\text{road}} - T_{\text{metro}}$
     * Annual Commuter Hours Saved (per 50k daily ridership):
       $$\text{Hours Saved} = \frac{50,000 \times \Delta T \times 2 \text{ trips} \times 250 \text{ days}}{60}$$

---

## 3. Multi-Agent System Architecture

Rather than relying on an unpredictable, multi-turn generic chatbot, DYAD deploys **parallel specialized agents** with strict deterministic spatial tool bindings, orchestrated both at the Next.js edge and via **Modal AI serverless containers in the cloud**.

```
                  [User Action: Confirm Corridor]
                                │
                 [Turf.js Spatial Slicing Engine]
                                │
    ┌───────────────────────────┼───────────────────────────┐
    ▼                           ▼                           ▼
[Demographics Agent]     [POI & Economic]           [Mobility Agent]
 - Catchment pop           - Tech parks               - TomTom delta
 - Working class %         - Hospitals & Univs        - Hours saved/yr
 - Equity index            - Economic weight          - CO2 offset
    │                           │                           │
    └───────────────────────────┼───────────────────────────┘
                                ▼
                   [Feasibility & Risk Agent]
                    - Lake buffer overlap
                    - Road width friction
                                │
                                ▼
                  [Executive Debrief Agent]
                    - Synthesize 0-100 Score
                    - Generate Ward tooltips
                    - Structured JSON Dossier
```

### 3.1 Modal AI Cloud Agent Execution & Dataset Experiment Engine

For deep analysis, corridor sensitivity testing, and batch processing across the entire Bengaluru dataset, DYAD leverages **Modal AI** (`modal.com`) serverless compute paired with our team's **OpenAI API Key** (`gpt-4o` / `gpt-4o-mini`).

```python
# modal_app/dyad_experiments.py
import modal
from openai import OpenAI

app = modal.App("dyad-transit-experiments")
image = modal.Image.debian_slim().pip_install(
    "openai", "geopandas", "shapely", "pydantic"
)

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("openai-secret")],
    timeout=60,
)
def run_corridor_agent_experiment(corridor_payload: dict) -> dict:
    """Runs high-concurrency spatial agent evaluations in cloud containers."""
    client = OpenAI()
    
    # 1. Cloud-based vectorized spatial slicing on full datasets
    # 2. Parallel agent evaluations using OpenAI GPT-4o
    # 3. Multi-corridor tradeoff simulations & score synthesis
    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are the DYAD Urban Transit Synthesis Agent..."},
            {"role": "user", "content": str(corridor_payload)}
        ]
    )
    return response.choices[0].message.content
```

* **High Concurrency:** Modal automatically spins up 10–50 parallel worker containers in seconds to test multiple corridor alignment variations simultaneously.
* **OpenAI Integration:** Direct connection using our dedicated `OPENAI_API_KEY`, eliminating local machine compute limits and API throttling bottlenecks.
* **Persistent Dataset Caching:** Geospatial GeoJSON layers (BBMP wards, OSM POIs, NGT water buffers) are loaded once into Modal Network Volumes or container RAM for instant batch queries.

### Agent Roles & System Prompts

#### Agent 0: The Dataset Segregator
* **Input:** Raw unclassified CSV or GeoJSON uploaded by the user.
* **Function:** Samples the first 5 rows and headers. Assigns a category (`mobility`, `census`, `poi`, `environment`), maps latitude/longitude columns to standard GeoJSON, and registers it to the active memory index.

#### Agent 1: Demographics & Equity Agent
* **Toolkit:** `calculateCatchmentPopulation(buffer)`, `getWardSocioEconomicBreakdown(wardIds)`.
* **Objective:** Assess how well this corridor serves the daily commuter and working-class population, ensuring infrastructure serves equitable urban growth rather than just elite pockets.

#### Agent 2: POI & Economic Corridor Agent
* **Toolkit:** `filterPOIsByCategory(buffer)`, `scoreEconomicDensity(pois)`.
* **Objective:** Categorize POIs into Corporate/IT, Healthcare, Higher Education, and Civic/Government. Highlight major employment generators (e.g., Ecospace, ITPL, Manyata).

#### Agent 3: Mobility & Travel Time Agent
* **Toolkit:** `calculateTomTomSpeedDelta(distance)`, `projectDailyRidership(catchment, techParkCount)`.
* **Objective:** Quantify commute friction reduction, annual person-hours saved, and equivalent vehicle trips diverted off congested arterials (Outer Ring Road, Sarjapur Road).

#### Agent 4: Ecological & Feasibility Risk Agent
* **Toolkit:** `scanWaterBodyBuffers(corridorLine, 500m)`, `evaluateRoadRightOfWay(corridorLine)`.
* **Objective:** Identify land acquisition barriers, elevated vs underground necessity, and environmental buffers (National Green Tribunal 75m lake buffer norms).

#### Agent 5: Executive Debrief & Synthesis Agent
* **Input:** Summaries from Agents 1–4.
* **Output:** A strictly typed JSON payload adhering to `AuthorityDossier` containing scores, bulleted executive recommendations, specific coordinates for camera flight navigation, and ward-level impact blurbs.

---

## 4. Strict TypeScript Data Contracts

```typescript
// types/metro.ts

export interface GeoCoordinate {
  lng: number;
  lat: number;
}

export interface MetroStation {
  id: string;
  name: string;
  line: 'purple' | 'green' | 'yellow' | 'blue' | 'pink';
  coordinates: [number, number];
  isInterchange: boolean;
}

export interface ProposedCorridor {
  id: string;
  name: string;
  originStation: MetroStation;
  terminusName: string;
  terminusCoordinates: [number, number];
  lengthKm: number;
  bufferRadiusKm: number;
  waypoints?: [number, number][];
}

export interface POIItem {
  id: string;
  name: string;
  category: 'corporate' | 'healthcare' | 'education' | 'public_transit' | 'civic';
  coordinates: [number, number];
  importance: 'high' | 'medium' | 'low';
}

export interface WardImpact {
  wardId: string;
  wardName: string;
  wardNumber: number;
  population: number;
  workingClassRatio: number;
  impactSummary: string;
}

export interface AuthorityDossier {
  corridorId: string;
  corridorName: string;
  overallScore: number; // 0 - 100
  feasibilityRating: 'Highly Recommended' | 'Recommended with Caveats' | 'High Friction / Review Needed';
  
  pillars: {
    transitEquity: {
      score: number;
      catchmentPopulation: number;
      workingClassServed: number;
      keyInsight: string;
    };
    economicProductivity: {
      score: number;
      techParksConnected: number;
      annualHoursSaved: number;
      economicDividendInrCrores: number;
      keyInsight: string;
    };
    climateImpact: {
      score: number;
      annualCo2OffsetTons: number;
      dailyCarTripsEliminated: number;
      keyInsight: string;
    };
    corridorFriction: {
      score: number;
      lakeBufferWarnings: string[];
      roadWidthConstraints: string[];
      recommendation: string;
    };
  };

  focalPoints: {
    title: string;
    description: string;
    coordinates: [number, number];
    zoomLevel: number;
    pitch: number;
    category: 'poi' | 'ward' | 'bottleneck' | 'station';
  }[];

  wardImpacts: WardImpact[];
  executiveSummaryMarkdown: string;
}
```

---

## 5. Live Pitch Fail-Safe Architecture

Hackathon live demos fail when Wi-Fi chokes, external LLM APIs experience rate limits, or slow network calls cause awkward 20-second pauses on stage.

DYAD incorporates a **Triple-Tier Pitch-Safe Pipeline**:
1. **Tier 1 (Instant Spatial Determinism):** All GIS calculations (Turf.js buffer, POI count, ward population math, TomTom commute delta) run in **under 20ms in the client/server runtime**. The numbers on the screen are 100% real and computed instantaneously.
2. **Tier 2 (Cloud Parallel LLM Synthesis via Modal AI & OpenAI):** The agents run in parallel either through serverless edge routes or via **Modal AI cloud functions** backed by our team's **OpenAI API Key (GPT-4o)**. Real-time telemetry badges light up sequentially:
   `[✓ Demographics Analyzed]` $\rightarrow$ `[✓ POI Clustered]` $\rightarrow$ `[✓ Climate Scored]`.
3. **Tier 3 (Sub-second Cached Fallback):** If an external API fails, takes $>4$ seconds, or is toggled to "Demo / Stage Mode", the system immediately serves pre-verified, high-fidelity synthesis objects for the curated scenarios (*Sarjapur Tech Spine*, *Hoskote Link*, *Electronic City Connector*). 
   *Result:* **Zero stage crashes, zero awkward pauses, guaranteed 60 FPS presentation.**

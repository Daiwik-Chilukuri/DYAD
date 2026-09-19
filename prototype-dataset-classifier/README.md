# Prototype: Dataset Classifier Agent (TypeSafe Jev)

> **Subfolder:** `prototype-dataset-classifier/`  
> **Mission:** Fast, deterministic dataset classification and geospatial coordinate mapping for DYAD using TypeSafe AI's **Jev** (System One decision model).

---

## 1. What is Jev & Why is it Used?

Unlike generative LLMs (System Two) that produce conversational text with high latency (1–4s) and hallucination risks, **Jev** is a **System One decision model** from TypeSafe AI:
* **Response Latency:** **70ms – 250ms** (near instantaneous).
* **Cost:** **$0.042 / million input tokens** (output tokens are 100% free).
* **Primitive Decisions:**
  * `Choice`: Selects 1 domain category from a fixed rubric with calibrated probability distributions.
  * `Noul`: Calibrated yes/no probability (0.0 to 1.0) checking whether coordinate geometry is present.
  * `Score`: Rates data readiness for spatial indexing.

When users drag-and-drop arbitrary CSV or GeoJSON files into DYAD, this agent samples the first 3 rows and column names, classifies the domain (`mobility`, `census`, `poi`, `environmental`), and detects latitude/longitude columns in under **150ms** with zero prompt parsing errors.

---

## 2. Quick Setup

### Step 1: Add Your API Key
Open [`.env`](./.env) in this directory and paste your TypeSafe API key:
```bash
TYPESAFE_API_KEY="ts_live_..."
```

### Step 2: Run the Test Suite & Ping Check
You can run either the Node/TypeScript runner or the Python runner:

**Node / TypeScript (Node 24 native):**
```bash
cd prototype-dataset-classifier
npm test
# Or directly:
node src/test-classifier.ts
```

**Python (Zero dependencies):**
```bash
cd prototype-dataset-classifier
python test_classifier.py
```

---

## 3. What the Test Suite Evaluates

The test runner automatically pings the API (`https://api.typesafe.ai/v1/systemone`) and evaluates 4 realistic Bengaluru transit datasets:

1. **`tomtom_bengaluru_peak_congestion.csv`**
   * Expected Domain: `MOBILITY_TRAFFIC`
   * Coordinates: `NO`
2. **`bbmp_wards_demographics_census.csv`**
   * Expected Domain: `CENSUS_DEMOGRAPHICS`
   * Coordinates: `NO`
3. **`bengaluru_tech_parks_and_hospitals.csv`**
   * Expected Domain: `POI_AMENITIES`
   * Coordinates: `YES` (`lat`, `lon`)
4. **`bengaluru_water_bodies_ngt_buffers.geojson`**
   * Expected Domain: `ENVIRONMENTAL_WATER`
   * Coordinates: `YES` (`latitude`, `longitude`)

---

## 4. Exported Interface for Integration

When integrating into the multi-agent orchestrator, import the clean agent class:

```typescript
import { DatasetClassifierAgent } from './src/dataset-classifier.ts';

const agent = new DatasetClassifierAgent();
const classification = await agent.classify(fileName, headers, sampleRows);

// Output schema:
// {
//   datasetName: "bengaluru_pois.csv",
//   domain: "poi_amenities",
//   confidence: 0.98,
//   hasCoordinates: true,
//   latitudeColumn: "lat",
//   longitudeColumn: "lon",
//   qualityLevel: "2/2",
//   latencyMs: 110
// }
```

---

## 5. Local Documentation Reference
* [`docs/llms.txt`](./docs/llms.txt) — TypeSafe documentation index
* [`docs/api-reference.md`](./docs/api-reference.md) — HTTP API request/response format
* [`.agents/skills/typesafe-ai/`](../.agents/skills/typesafe-ai) — Pre-installed agent skill for TypeSafe AI

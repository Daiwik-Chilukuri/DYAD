# Prototype: Dataset Classifier & Auto-Stager Agent (TypeSafe Jev)

> **Subfolder:** `prototype-dataset-classifier/`  
> **Mission:** Format-agnostic schema sniffing, intelligent category routing, standardized renaming (`<class>-<whats_inside_dataset>.<ext>`), and auto-uploading to Modal Cloud Volumes using TypeSafe AI's **Jev** System One decision model.

---

## 1. The 5-Agent Swarm Topology

When datasets are ingested by DYAD, Jev classifies them to feed a 5-agent system:

1. **Agent 1: Structured Output Spatial Visualizer Agent:** Ingests all spatial datasets (Polygons, Points, LineStrings) to generate renderable GeoJSON for the Map Canvas UI (highlighting corridors, lakes, and demographic heatmaps).
2. **Agent 2: Demographics & Equity Specialist Subagent:** Consumes `demographics-*` datasets (ward census, transit dependency, vulnerable populations).
3. **Agent 3: Economic & Land-Value Specialist Subagent:** Consumes `economic_poi-*` datasets (tech corridors, employment campuses, hospitals, land-value capture).
4. **Agent 4: Mobility & Congestion Specialist Subagent:** Consumes `mobility-*` datasets (TomTom speeds, arterial congestion, feeder bus stops).
5. **Agent 5: Ecological & Wetland Risk Specialist Subagent:** Consumes `ecological-*` datasets (lakes, tanks, rajakaluves, KTFD/NGT buffer compliance).
6. **Unsure / Non-Transit Data:** Classified as `other-*` and held in staging without contaminating the domain models.

---

## 2. Ingestion Pipeline & Architecture

```
[ Raw User Upload: .csv, .geojson, .json, .parquet ]
                         │
                         ▼
          [ 🔍 Format-Agnostic Schema Sniffer ]
          (Extracts format, geometry type, keys, & sample records)
                         │
                         ▼
        [ 📋 Standardized Schema Fingerprint ]
                         │
                         ▼
          [ 🧠 TypeSafe Jev System One Agent ]
          - Classifies: category, subtopic, coordinate columns
          - Flags: visualizer_agent_enabled
                         │
                         ▼
       [ 🏷️ Standardized Renamer & Local Staging ]
       Renames to: <class>-<whats_inside_dataset>.<ext>
       Staged to: prototype-dataset-classifier/staged_datasets/
                         │
                         ▼
       [ ☁️ Modal Cloud Volume Auto-Uploader ]
       Transfers to: modal.Volume('dyad-datasets-volume')
       Mounted at: /data/datasets/ in all cloud containers
```

---

## 3. Supported File Formats

* **CSV / TSV (`.csv`, `.tsv`):** Delimiter sniffing, header extraction, latitude/longitude column detection.
* **GeoJSON (`.geojson`):** Geometry type detection (`Polygon`, `LineString`, `Point`), feature property extraction.
* **JSON (`.json`):** Object lists or key-value dictionaries with spatial key detection.
* **Parquet / GeoParquet (`.parquet`):** Binary schema inspection via PyArrow/Pandas.

---

## 4. Quickstart: Ingesting Any Dataset

### Run via CLI:
```bash
cd prototype-dataset-classifier

# Ingest, classify, rename, and auto-upload to Modal Cloud Volume
python classify_dataset.py <path_to_raw_dataset>

# Example 1: Ingesting a raw CSV
python classify_dataset.py sample_raw_datasets/bengaluru_demographic_wards.csv

# Example 2: Ingesting a raw GeoJSON
python classify_dataset.py sample_raw_datasets/karnataka_wetlands_and_lakes.geojson

# Example 3: Offline mode (skip Modal upload)
python classify_dataset.py <path> --no-modal
```

### Sample Output:
```text
[1] Sniffing schema from: karnataka_wetlands_and_lakes.geojson
    Format:        GeoJSON
    Geometry Type: GeoJSON (Polygon)
    Columns:       ['lake_id', 'lake_name', 'water_spread_area_sqkm', 'ktfd_buffer_meters']
    Has Coords:    True

[2] Awakening TypeSafe Jev Classifier Agent...
    Category:      ECOLOGICAL (Confidence: 100.0%)
    Subtopic:      lakes_and_wetlands
    Standardized:  ecological-lakes_and_wetlands_karnataka_wetlands_and_lakes.geojson
    Primary Agent: Agent 5: Ecological & Wetland Risk Specialist Subagent
    Visualizer:    ENABLED (Agent 1 will render features)
    Jev Latency:   895ms

[3] Staging dataset locally with standardized name...
    Staged to:     staged_datasets/ecological-lakes_and_wetlands_karnataka_wetlands_and_lakes.geojson

[4] Auto-uploading to Modal Cloud Volume ('dyad-datasets-volume')...
    [OK] Uploaded to: /data/datasets/ecological-lakes_and_wetlands_karnataka_wetlands_and_lakes.geojson (1,147 bytes)
```

---

## 5. Directory Structure

```
prototype-dataset-classifier/
├── classify_dataset.py       # Master CLI for end-to-end ingestion & upload
├── README.md                 # System overview & instructions
├── .env                      # Local TypeSafe API Key (gitignored)
├── src/
│   ├── sniffer.py            # Format-agnostic schema extractor (CSV/JSON/GeoJSON/Parquet)
│   ├── classifier.py         # TypeSafe Jev classifier & 5-agent categorizer
│   └── modal_uploader.py     # Local stager & Modal Volume cloud uploader
├── sample_raw_datasets/      # Sample test files in diverse formats
└── staged_datasets/          # Classified & renamed datasets with .meta.json manifests
```

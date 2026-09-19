# DYAD Bengaluru Dataset Collection Prototype

Reproducible, license-aware collection and normalization of the geospatial data
needed by DYAD's metro-corridor feasibility engine. This prototype intentionally
contains no bus routes or bus stops.

## What this prototype provides

- A machine-readable catalog containing source, license, format, provenance,
  temporal coverage, and known limitations for every dataset.
- A downloader that resolves OpenCity CKAN resources by resource ID instead of
  depending on fragile generated download URLs.
- Normalizers for GTFS, ward/census joins, GeoJSON, and KML/KMZ inputs.
- Validation reports covering file presence, GeoJSON structure, Bengaluru
  bounds, feature counts, and ward/census join quality.
- Separate download groups for normal, large, and non-commercial data.

The verified raw downloads, provenance metadata, normalized runtime files, and
validation report are bundled with this prototype so cloud agents and teammate
prototypes can run against the same reproducible snapshot. Local environments
and Python caches remain excluded from Git.

## Dataset policy

The default collection accepts Public Domain/CC0, CC BY, MIT, and ODbL data.
The BMRCL ridership data is CC BY-NC-SA 4.0 and is therefore excluded from the
default run. It is available only through the explicit `restricted` group.

| Dataset | Group | License | Default |
| --- | --- | --- | --- |
| Unofficial BMRCL GTFS | default | ODbL-1.0 | Yes |
| Historical BBMP 198 wards | default | CC-BY-4.0 | Yes |
| Bengaluru Ward Census 2011 | default | Public Domain | Yes |
| Bengaluru road widths | default | Public Domain | Yes |
| ATREE lakes and streams | default | CC Attribution | Yes |
| Bengaluru urban slums | default | Public Domain | Yes |
| OSM Bengaluru planning POIs | default | ODbL-1.0 | Yes |
| Bengaluru mobility indicators 2011 | default | Public Domain | Yes |
| OSM India PBF | large | ODbL-1.0 | No |
| BMRCL station ridership | restricted | CC-BY-NC-SA-4.0 | No |

## Setup

Python 3.11 or newer is recommended.

```bash
cd prototype-datasets-collection
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

## Commands

Validate the catalog without downloading anything:

```bash
python main.py catalog
```

Download the default open-data bundle:

```bash
python main.py download --group default
```

Download or refresh one catalog entry:

```bash
python main.py download --dataset bbmp_wards_198 --force
```

Large OSM download, only when explicitly needed:

```bash
python main.py download --group large
```

Non-commercial BMRCL ridership data, only after accepting its license:

```bash
python main.py download --group restricted --accept-restricted-license
```

Normalize downloaded files:

```bash
python main.py normalize
```

Validate normalized outputs:

```bash
python main.py validate
```

Run the four-agent Silk Board–Sarjapur experiment:

```bash
.venv/bin/python main.py experiment
```

The experiment writes two outputs:

- `experiments/results/sarjapur_corridor.json`: complete analytical output for
  debugging and model evaluation.
- `experiments/results/sarjapur_corridor.ui.json`: stable UI response with
  summary metrics, agent cards, GeoJSON map layers, focus-point references,
  camera hints, coordinate-order metadata, and warnings.

The UI contract is defined by
`schemas/corridor-analysis-response.schema.json`. GeoJSON always uses
`[longitude, latitude]`; focus points also expose named `longitude` and
`latitude` fields to make camera calls unambiguous.

It runs:

- `economic_specialist`: 2 km catchment filtering and 500 m DBSCAN economic-node
  clustering.
- `demographics_specialist`: area-weighted Census 2011 population followed by
  K-means catchment archetypes.
- `ecological_specialist`: projected alignment intersection and configurable
  water-proximity watchpoints.
- `mobility_specialist`: a non-negative Ridge model trained on GTFS schedule
  patterns, BPR road-delay scenario, and road-width friction summary.

Run the unit tests:

```bash
python -m unittest discover -s tests -v
```

## Output layout

```text
raw/                         # Immutable downloads; ignored by Git
normalized/
  metro/stations.geojson
  metro/lines.geojson
  metro/network_edges.csv
  demographics/wards_with_census.geojson
  demographics/underserved_areas.geojson
  poi/pois.geojson
  roads/road_widths.geojson
  environment/lakes_streams.geojson
validation/report.json
```

## Important analytical constraints

- Census 2011 must be joined to the historical 198-ward geometry, not current
  Greater Bengaluru ward boundaries.
- GTFS timings are unofficial estimates. Spatial stops and shapes are useful;
  the feed must not be described as real-time or authoritative telemetry.
- A missing road-width value means `unknown`, never zero or a narrow road.
- Lake/stream geometry and legally derived buffer geometry must remain separate.
- Models receive schemas, samples, and computed summaries. Full raw geometries
  are processed by deterministic geospatial code rather than placed in prompts.

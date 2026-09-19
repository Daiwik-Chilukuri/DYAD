# DYAD Frontend Map Canvas & Spatial Layer Survey Report

**Author:** Explorer 1 (Frontend Map Survey & Geo-spatial Analysis)  
**Target Project:** `dyad-app/`  
**Date:** 2026-09-19  
**Focus:** Requirement R1 (Remove Hardcoded Placeholders, Dynamic Origin Snapping, Terminus Pin Dropping, Catchment Buffer Calculation, Dynamic Backend GeoJSON Rendering, Dependencies & Build Audit)

---

## Executive Summary

A comprehensive read-only survey of the frontend map implementation in `dyad-app/` was conducted. The current map canvas (`dyad-app/components/MapCanvas.tsx`) and the main dashboard page (`dyad-app/src/app/page.tsx`) provide a solid visual baseline utilizing **MapLibre GL v4.7.1** with CARTO Dark Matter vector tiles and **Turf.js v7.4.0**. However, the implementation is heavily constrained by **rigidly hardcoded presets**:
1. The **Origin Station** is hardcoded to Central Silk Board (`[77.6245, 12.9176]`) in both `page.tsx` and `MapCanvas.tsx`. The user cannot select or change the origin.
2. The **Terminus** defaults to Bellandur (`[77.6974, 12.9279]`), and clicking existing metro stations is explicitly suppressed by a collision check (`if (features.length > 0) return;`), preventing station snapping.
3. The right-side panel renders a static mock card for a hardcoded array of 7 `BENEFITED_AREAS` (Rajajinagar, Indiranagar, Bellandur, etc.) rather than the live multi-agent Command Center Authority Dossier.
4. There is no mechanism to receive or render the dynamic GeoJSON feature collection streamed by the backend `agent_visualizer` (`visualizer_features` event).

This report catalogs all hardcoded placeholders, analyzes the MapLibre GL layer tree, provides the exact mathematical and event architecture for dynamic origin station snapping and terminus dropping, defines the MapLibre layer pipeline for backend GeoJSON ingestion, and verifies package dependencies and build integrity.

---

## 1. Codebase & File Architecture Audit

### 1.1 `dyad-app/src/app/page.tsx` (754 lines)
- **Primary Role:** Main dashboard page hosting the map background, left navigation rail, floating HUD sidebar, top telemetry ticker, and a floating right panel.
- **Current State:**
  - `targetCoords`: Initialized to `[77.6974, 12.9279]` (Bellandur).
  - `originCoords`: **Missing as state**. Instead, line 17 defines `const SILK_BOARD_COORDS: [number, number] = [77.6245, 12.9176];` and all distance and transit calculations directly invoke `turf.distance(turf.point(SILK_BOARD_COORDS), turf.point(targetCoords))`.
  - `BENEFITED_AREAS`: Lines 36–149 declare a 7-element static array containing mock metrics (e.g. `timeSavedMin`, `benefitScore`, `commuteRoad`, `commuteMetro`, `commuterCount`, `modalShift`).
  - `CORRIDOR_PRESETS`: Lines 151–157 declare 5 static destinations (Bellandur, Marathahalli Bridge, Kadubeesanahalli, Carmelaram, HSR 14th Main), all anchoring to Silk Board.
  - Floating HUD Sidebar: Displays category filter toggles for POIs, buffer radius selectors (1.0km, 2.0km, 3.0km), simulation toggles, and a list of the 7 static `BENEFITED_AREAS`.
  - Floating Right Panel: Triggered only when a user selects one of the 7 static `BENEFITED_AREAS`. Displays mock commute numbers and a button labeled `"Simulate Route to Silk Board"`.
  - Missing Elements: No SSE event stream handler to connect to `/api/corridor/stream`, no live agent swarm telemetry feed, no 0–100 overall feasibility score gauge, and no 4-pillar Command Center cards.

### 1.2 `dyad-app/components/MapCanvas.tsx` (865 lines)
- **Primary Role:** MapLibre GL WebGL wrapper managing map lifecycle, layers, sources, markers, popups, and click interactions.
- **Current State:**
  - Container initialized with CARTO Dark Matter style `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`.
  - Hardcoded coordinates:
    - Line 13: `const SILK_BOARD_COORDS: [number, number] = [77.6245, 12.9176];`
    - Line 14: `const BELLANDUR_COORDS: [number, number] = [77.6820, 12.9290];`
    - Line 18: `generateViaductCoordinates` returns `[SILK_BOARD_COORDS, target]`.
    - Line 229: `const [originCoords, setOriginCoords] = useState<[number, number]>(SILK_BOARD_COORDS);` (internal, unexposed).
    - Line 237: `const lineCoords: [number, number][] = [SILK_BOARD_COORDS, target];` in `updateCorridorAndFilterPOIs`.
    - Line 319: Origin marker placed at `SILK_BOARD_COORDS` with static HTML popup: `"Central Silk Board Node / Phase-2A Origin Interchange"`.
  - Static GeoJSON in-memory:
    - Lines 34–178: `BENEFITED_AREAS_CENTROIDS` FeatureCollection for 7 static points.
  - Station Click Suppression Bug:
    - Lines 650–653:
      ```typescript
      const features = m.queryRenderedFeatures(bbox, { 
        layers: ['metro-stations', 'poi-layer'] 
      });
      if (features && features.length > 0) return;
      ```
      When clicking directly on a metro station node, the click event is explicitly halted with `return;`, preventing any interaction or coordinate snapping.
  - Terminus Marker (`targetMarkerRef`):
    - Draggable HTML marker with cyan pulsing radar rings (`animation: ping`). Emits `onMapClick([lng, lat])` on `dragend`.
  - Missing Elements: No origin prop or callback (`originCoords`, `onOriginChange`), no visualizer layer for dynamic backend GeoJSON features, and no interactive layer for proposed station stops emitted in the dossier.

### 1.3 Supporting Modules
- `dyad-app/lib/spatial-turf.ts`:
  - Contains `getCorridorBuffer(origin, terminus, radiusKm = 2.0)` returning `{ line, buffer }`.
  - Currently unused by `MapCanvas.tsx` (which re-implements its own internal `computeBufferGeoJSON` on line 22).
- `dyad-app/lib/camera.ts`:
  - Defines `zoomToCorridor(map, origin, terminus)` with 3D pitch (48°) and bearing (-14°), and `flyToFocus(map, lng, lat, zoom)`.
  - Ready for integration with dossier focal points and corridor boundary fitting.
- `dyad-app/lib/motion.ts`:
  - Exports Emil Kowalski physics springs (`snappy`: stiffness 400, damping 30; `smooth`: stiffness 300, damping 32; `bouncy`: stiffness 450, damping 22).
- `dyad-app/types/map-contracts.ts`:
  - Contains TypeScript interfaces: `MetroStation`, `ProposedCorridor`, `POIItem`, `CorridorSelection`, `GeoCoordinate`. Needs expansion to incorporate `StationProposal` and `AuthorityDossier`.

---

## 2. Comprehensive Inventory of Hardcoded Placeholders

The following table provides the exhaustive catalog of static placeholders that must be purged or upgraded under Requirement R1:

| Placeholder / Identifier | File Location | Nature & Impact | Replacement Strategy |
| :--- | :--- | :--- | :--- |
| `SILK_BOARD_COORDS` | `src/app/page.tsx:17`<br>`components/MapCanvas.tsx:13`<br>`components/MapCanvas.tsx:229`<br>`components/MapCanvas.tsx:319` | Locks the corridor origin permanently to Central Silk Board `[77.6245, 12.9176]`. | Replace with dynamic `originCoords: [number, number] \| null` state and `originStationName: string` prop passed from `page.tsx`. |
| `BELLANDUR_COORDS` | `components/MapCanvas.tsx:14`<br>`components/MapCanvas.tsx:206`<br>`src/app/page.tsx:188` | Default fallback destination coordinate `[77.6820, 12.9290]`. | Allow dynamic initial state or let user pick freely; do not hardcode in `MapCanvas`. |
| `BENEFITED_AREAS` (Static Array) | `src/app/page.tsx:36–149` | 7 static mock zones with hardcoded scores (e.g. Rajajinagar 91, Indiranagar 93, Bellandur 98). | Purge static mock array. Replace with dynamic multi-agent findings from `dossier` or live intersected BBMP wards. |
| `BENEFITED_AREAS_CENTROIDS` | `components/MapCanvas.tsx:34–178` | 145-line embedded GeoJSON FeatureCollection defining 7 zone point markers and static descriptions. | Purge from `MapCanvas.tsx`. Replace source with dynamic backend features or eliminate static centroid layer. |
| `CORRIDOR_PRESETS` | `src/app/page.tsx:151–157` | Hardcoded destination presets assuming Silk Board origin. | Upgrade to full `{ origin: { name, coords }, destination: { name, coords } }` presets (e.g., Silk Board $\rightarrow$ Sarjapur, Majestic $\rightarrow$ Electronic City, Whitefield $\rightarrow$ KR Puram). |
| Static POI Buffer Default Stats | `src/app/page.tsx:198–200` | `{ total: 135, byCategory: { corporate: 70, hospital: 44, education: 20, civic: 1 } }`. | Set default to `{ total: 0, byCategory: { corporate: 0, hospital: 0, education: 0, civic: 0 } }`, dynamically updated by Turf.js upon buffer placement. |
| Hardcoded Telemetry Ticker | `src/app/page.tsx:628–636` | Static `Rush-Hour Road Speed: 13.9 km/h` and `Annual Congestion Loss: ₹20,000 Cr`. | Bind to live `MobilityPillarMetrics` and `EconomicPillarMetrics` streamed from backend dossier. |
| Static Right-Side Panel | `src/app/page.tsx:645–746` | Rendered only for `selectedArea`; shows static cards and "Simulate Route to Silk Board". | Replace completely with R3 Right-Side AI Authority Dossier Panel (`AuthorityDossierPanel.tsx`). |
| `/data/benefited_areas.geojson` | `public/data/benefited_areas.geojson`<br>`MapCanvas.tsx:330` | Static pre-baked polygon boundaries for 7 mock areas. | Demote/remove static mock boundary layers in favor of dynamic backend `visualizer_features` polygon layers. |
| `/data/feeder_flows.geojson` | `public/data/feeder_flows.geojson` | Static feeder lines. | Render only when mobility feeder flows are actively returned by the cloud agent swarm. |

---

## 3. Current MapLibre GL Map Setup & Layer Pipeline

### 3.1 Layer Registry & Render Stack
In `MapCanvas.tsx`, layers are currently mounted in the following order:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Basemap (CARTO Dark Matter Vector Tiles via WebGL)                 │
├────────────────────────────────────────────────────────────────────────┤
│ 2. benefited-areas-fill (fill-opacity: 0.08)                          │
├────────────────────────────────────────────────────────────────────────┤
│ 3. benefited-areas-glow (line-width: 5, blur: 3, opacity: 0.35)       │
├────────────────────────────────────────────────────────────────────────┤
│ 4. benefited-areas-line (line-width: 2)                               │
├────────────────────────────────────────────────────────────────────────┤
│ 5. benefited-areas-labels (symbol: zone names from embedded centroids)│
├────────────────────────────────────────────────────────────────────────┤
│ 6. metro-casing (line-width: 4-8px, blur: 2, casing glow)             │
├────────────────────────────────────────────────────────────────────────┤
│ 7. metro-core (line-width: 2.5-5px, green/purple/yellow tracks)       │
├────────────────────────────────────────────────────────────────────────┤
│ 8. metro-stations (circle: radius 3.5-7px, station nodes)             │
├────────────────────────────────────────────────────────────────────────┤
│ 9. metro-stations-labels (symbol: station names at zoom >= 12.5)      │
├────────────────────────────────────────────────────────────────────────┤
│ 10. corridor-buffer-fill (fill-color: #0ab1ba, opacity: 0.12)         │
├────────────────────────────────────────────────────────────────────────┤
│ 11. corridor-buffer-glow (line-width: 6, blur: 4, opacity: 0.35)       │
├────────────────────────────────────────────────────────────────────────┤
│ 12. corridor-buffer-line (line-width: 2, dashed [4, 2], #00F5D4)      │
├────────────────────────────────────────────────────────────────────────┤
│ 13. poi-glow (circle: radius 4.5-12px, blur: 1, category color)       │
├────────────────────────────────────────────────────────────────────────┤
│ 14. poi-layer (circle: radius 3.5-8px, stroke: 1.5px, category color) │
├────────────────────────────────────────────────────────────────────────┤
│ 15. HTML DOM Markers (Origin gold pin & Terminus cyan pulsing pin)    │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Observations on Layer Interaction
- **Metro Lines & Stations (`/data/metro_lines.geojson`, `/data/metro_stations.geojson`):**
  - High quality vector geometry extracted from BMRCL/OSM.
  - Green Line, Purple Line, and Yellow Line are mapped with accurate color tokens.
  - Station points have properties: `{ name: string, color: "green" | "purple" | "yellow" }`.
- **Catchment Buffer:**
  - Dynamically calculated using `turf.buffer(lineString, radiusKm, { units: 'kilometers' })`.
  - When `targetCoords` or `bufferRadiusKm` changes, `updateCorridorAndFilterPOIs()` updates the `corridor-buffer-source` and filters `allPOIsRef.current` using `turf.pointsWithinPolygon`.
  - **Limitation:** The line passed to `turf.buffer` always uses `[SILK_BOARD_COORDS, target]`. If the origin changes, the buffer must take `[originCoords, targetCoords]`.

---

## 4. Architecture for Dynamic Origin Station Snapping & Terminus Pin Dropping

### 4.1 State & Interaction Model
To satisfy Requirement R1 without confusing the user, the map canvas requires a clean two-slot selection model:

```typescript
export interface StationPoint {
  name: string;
  coordinates: [number, number]; // [lng, lat]
  line?: string;
  isExistingStation: boolean;
}

export type PinSelectionSlot = 'origin' | 'terminus' | 'auto';
```

#### Proposed State Flow in `page.tsx`:
```
                     ┌───────────────────────────┐
                     │ User clicks Map or Station│
                     └─────────────┬─────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   [Clicked Metro Station]                    [Clicked Arbitrary Map]
              │                                         │
   Snap exact station coordinates            Use exact click [lng, lat]
   Extract station name & line               Reverse label: "Custom Point"
              │                                         │
              └────────────────────┬────────────────────┘
                                   │
                     ┌─────────────▼─────────────┐
                     │ Is Origin Slot Empty?     │
                     └─────────────┬─────────────┘
                            YES ───┴─── NO
                             │          │
                             ▼          ▼
                     Set Origin Node     Set Terminus Node
                             │          │
                             └─────┬────┘
                                   ▼
          ┌──────────────────────────────────────────────────┐
          │ If both Origin & Terminus exist:                 │
          │ 1. turf.lineString([origin, terminus])           │
          │ 2. turf.buffer(line, radiusKm, { units: 'km' })  │
          │ 3. turf.pointsWithinPolygon(allPOIs, buffer)     │
          │ 4. Update 'corridor-track' & 'corridor-buffer'   │
          │ 5. Trigger SSE Corridor Stream to Cloud Swarm    │
          │ 6. zoomToCorridor(map, origin, terminus)         │
          └──────────────────────────────────────────────────┘
```

### 4.2 Removing the Station Click Blocker
In `MapCanvas.tsx`, remove lines 650–653 which suppress station clicks. Instead, register a dedicated click listener on the `metro-stations` layer:

```typescript
// Click on existing Metro Station Node (Snapping)
m.on('click', 'metro-stations', (e) => {
  if (!e.features || e.features.length === 0) return;
  const feat = e.features[0];
  const props = feat.properties || {};
  const geom = feat.geometry as GeoJSON.Point;
  const coords: [number, number] = [geom.coordinates[0], geom.coordinates[1]];
  const stationName = props.name || 'Metro Station';
  const stationColor = props.color || 'purple';

  if (onStationSelect) {
    onStationSelect({
      name: stationName,
      coordinates: coords,
      line: stationColor,
      isExistingStation: true,
    });
  }
});

// Cursor changes on station hover
m.on('mouseenter', 'metro-stations', () => {
  m.getCanvas().style.cursor = 'pointer';
});
m.on('mouseleave', 'metro-stations', () => {
  m.getCanvas().style.cursor = '';
});
```

### 4.3 Dual Interactive Draggable Markers
1. **Origin Station Marker (`originMarkerRef`):**
   - Color: Transit Gold / Amber (`#F59E0B` or `#EAB308`).
   - Draggable: Enabled (`draggable: true`). Dragging recalculates the corridor line and catchment buffer in real time.
   - Popup: Displays snapped station name, transit line indicator, and badge `"Corridor Origin"`.
2. **Terminus Marker (`targetMarkerRef`):**
   - Color: Electric Neon Cyan (`#00F5D4`).
   - Features: Pulsing radar ring animation (`animate-ping`).
   - Draggable: Enabled (`draggable: true`). Dragging recalculates buffer and POI filter.
   - Popup: Displays terminus coordinates, buffer radius, and badge `"Proposed Candidate Terminus"`.

### 4.4 Dynamic Turf.js Catchment Buffer Pipeline
When both `originCoords` and `terminusCoords` are present:
```typescript
import * as turf from '@turf/turf';

export function computeCorridorGeometry(
  origin: [number, number],
  terminus: [number, number],
  radiusKm: number = 2.0
) {
  const line = turf.lineString([origin, terminus]);
  const buffer = turf.buffer(line, radiusKm, { units: 'kilometers' });
  const distanceKm = turf.distance(turf.point(origin), turf.point(terminus), { units: 'kilometers' });

  return {
    line,
    buffer,
    distanceKm: Math.round(distanceKm * 100) / 100,
  };
}
```
In `MapCanvas.tsx`:
- Update `corridor-track` GeoJSON source with `line`.
- Update `corridor-buffer-source` GeoJSON source with `buffer`.
- Filter POIs: `turf.pointsWithinPolygon(allPOIsRef.current, buffer)`.
- Update buffer statistics (`total`, `byCategory`).

---

## 5. Architecture for Dynamic Spatial GeoJSON Rendering (`visualizer_features`)

### 5.1 Backend Event Contract
From our inspection of `prototype-modal-cloud-orchestrator/master_orchestrator.py` (lines 251–257) and `subagents_swarm.py` (lines 101–176), the backend `agent_visualizer` executes an STRtree spatial intersection query against all `visualizer-*` datasets in the Modal volume and emits the following event over SSE:

```json
{
  "type": "visualizer_features",
  "timestamp": 1789831319.289,
  "features_count": 666,
  "geojson": {
    "type": "FeatureCollection",
    "name": "dyad_corridor_spatial_features",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [ ... ]
        },
        "properties": {
          "source_dataset": "visualizer-demographics-bengaluru_urban_slums.geojson",
          "Slum_Name": "MADHURAMMA_COLONY",
          "intersection_type": "Polygon",
          "intersection_area_sqm": 12051.2,
          "overlap_pct": 100.0
        }
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [ ... ]
        },
        "properties": {
          "source_dataset": "visualizer-ecological-lakes_and_wetlands_atree_lakes_streams.geojson",
          "lake_name": "Agara Lake",
          "intersection_area_sqm": 45200.0,
          "overlap_pct": 14.2
        }
      }
    ]
  },
  "message": "Extracted 666 spatial features intersecting corridor buffer."
}
```

### 5.2 MapLibre Source & Layer Specification
To render these features dynamically without static pre-rendered files, `MapCanvas.tsx` requires a dedicated source and layered shader system:

#### 1. Dynamic Source
```typescript
m.addSource('visualizer-features-source', {
  type: 'geojson',
  data: { type: 'FeatureCollection', features: [] },
});
```

#### 2. Geometry-Specific Layer Tree
Because MapLibre requires distinct layer types for `Polygon`, `LineString`, and `Point` geometries:

1. **Environmental & Demographic Polygons (Lakes, Wetlands, Wards, Slums):**
   - **Layer ID:** `visualizer-polygons-fill`
   - **Type:** `fill`
   - **Filter:** `['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]]`
   - **Paint Properties:**
     ```typescript
     'fill-color': [
       'case',
       ['in', 'lake', ['downcase', ['get', 'source_dataset']]], '#06b6d4',      // Cyan/Teal for lakes
       ['in', 'wetland', ['downcase', ['get', 'source_dataset']]], '#10b981',   // Emerald for wetlands
       ['in', 'slum', ['downcase', ['get', 'source_dataset']]], '#f59e0b',      // Amber for urban equity/slums
       ['in', 'ward', ['downcase', ['get', 'source_dataset']]], '#8b5cf6',      // Purple for BBMP wards
       '#38bdf8'                                                                // Default blue
     ],
     'fill-opacity': [
       'case',
       ['in', 'lake', ['downcase', ['get', 'source_dataset']]], 0.35,
       ['in', 'slum', ['downcase', ['get', 'source_dataset']]], 0.22,
       ['in', 'ward', ['downcase', ['get', 'source_dataset']]], 0.08,
       0.15
     ]
     ```
   - **Layer ID:** `visualizer-polygons-line`
   - **Type:** `line`
   - **Filter:** `['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]]`
   - **Paint Properties:**
     ```typescript
     'line-color': [
       'case',
       ['in', 'lake', ['downcase', ['get', 'source_dataset']]], '#00F5D4',
       ['in', 'slum', ['downcase', ['get', 'source_dataset']]], '#f59e0b',
       ['in', 'ward', ['downcase', ['get', 'source_dataset']]], '#a855f7',
       '#38bdf8'
     ],
     'line-width': 1.5,
     'line-opacity': 0.7
     ```

2. **Ecological Stormwater Drains & Linear Corridors (Rajakaluves):**
   - **Layer ID:** `visualizer-lines`
   - **Type:** `line`
   - **Filter:** `['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]]`
   - **Paint Properties:**
     ```typescript
     'line-color': '#6366f1',
     'line-width': 2.5,
     'line-dasharray': [3, 2],
     'line-opacity': 0.85
     ```

3. **Domain POI & Anchor Nodes (Employment Hubs, Feeders, Bus Stops):**
   - **Layer ID:** `visualizer-points`
   - **Type:** `circle`
   - **Filter:** `['==', ['geometry-type'], 'Point']`
   - **Paint Properties:**
     ```typescript
     'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 8],
     'circle-color': [
       'case',
       ['has', 'hub_name'], '#22d3ee',
       ['has', 'bus_stop'], '#10b981',
       '#00F5D4'
     ],
     'circle-stroke-width': 2,
     'circle-stroke-color': '#020617'
     ```

4. **AI Suggested Station Proposals (`suggested_station_locations` from Dossier):**
   - **Layer ID:** `suggested-stations-layer`
   - **Type:** `circle` (or interactive custom HTML markers)
   - **Paint Properties:**
     ```typescript
     'circle-radius': 9,
     'circle-color': '#10b981',
     'circle-stroke-width': 3,
     'circle-stroke-color': '#ffffff'
     ```
   - Clicking a suggested station opens an Authority Flash Card with station rationale, expected daily footfall, and interchange status, and centers the camera.

### 5.3 Layer Ordering Rules (Z-Index Hierarchy)
To avoid polygon fills occluding transit lines or markers, the exact layer insertion order in MapLibre must be:

1. Basemap (vector tiles)
2. `visualizer-polygons-fill` (ward polygons, lake buffers, slum areas)
3. `visualizer-polygons-line` (specular outlines)
4. `corridor-buffer-fill` (2km catchment area)
5. `corridor-buffer-line` (dashed catchment boundary)
6. `visualizer-lines` (stormwater drains / rajakaluves)
7. `metro-casing` & `metro-core` (Namma Metro Purple, Green, Yellow lines)
8. `corridor-track` (direct candidate alignment polyline)
9. `metro-stations` & `metro-stations-labels` (existing transit network nodes)
10. `pois` & `visualizer-points` (corporate tech parks, hospitals, transit stops)
11. `suggested-stations-layer` (AI swarm station proposals)
12. HTML DOM Markers: Snapped Origin Pin & Terminus Pin (highest z-index)

### 5.4 Feature Click & Inspection Popup
When a user clicks on any element in `visualizer-polygons-fill` or `visualizer-points`:
```typescript
m.on('click', 'visualizer-polygons-fill', (e) => {
  if (!e.features || e.features.length === 0) return;
  const p = e.features[0].properties || {};
  const title = p.lake_name || p.Slum_Name || p.WARD_NAME || p.hub_name || 'Spatial Feature';
  const dataset = (p.source_dataset || '').replace('visualizer-', '').replace('.geojson', '');
  const overlap = p.overlap_pct !== undefined ? `${p.overlap_pct}% buffer overlap` : '';
  const area = p.intersection_area_sqm ? `${Math.round(p.intersection_area_sqm).toLocaleString()} m²` : '';

  new Popup({ offset: 12, className: 'dark-popup' })
    .setLngLat(e.lngLat)
    .setHTML(`
      <div style="background: rgba(14, 17, 23, 0.95); backdrop-filter: blur(16px); color:#fff; padding:12px 14px; border-radius:12px; border: 1px solid rgba(255,255,255,0.1); font-family: sans-serif; min-width: 200px;">
        <div style="font-size: 13px; font-weight: 700; color: #00F5D4;">${title}</div>
        <div style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 2px;">${dataset}</div>
        ${area ? `<div style="font-size: 11px; margin-top: 6px; font-family: monospace; color: #e2e8f0;">Intersected Area: <strong>${area}</strong></div>` : ''}
        ${overlap ? `<div style="font-size: 10.5px; color: #4ade80; font-family: monospace;">${overlap}</div>` : ''}
      </div>
    `)
    .addTo(m);
});
```

---

## 6. Dependencies & Build Verification

### 6.1 Package Dependency Audit (`dyad-app/package.json`)
The dependencies in `dyad-app/package.json` were audited:

| Package | Version | Status & Capability |
| :--- | :--- | :--- |
| `maplibre-gl` | `^4.7.1` | **Verified.** WebGL vector rendering, GeoJSON sources, line/fill/symbol shaders, 3D pitch/bearing controls. |
| `@turf/turf` | `^7.4.0` | **Verified.** Deterministic spatial geometry: `turf.buffer`, `turf.lineString`, `turf.point`, `turf.distance`, `turf.pointsWithinPolygon`. |
| `framer-motion` | `^13.4.0` | **Verified.** Spring animations (`motionSprings.snappy`, `motionSprings.smooth`), `AnimatePresence`, `layoutId`. |
| `lucide-react` | `^1.47.0` | **Verified.** Icon library for command center UI. |
| `next` | `16.3.5` | **Verified.** Next.js App Router, Route Handlers (`route.ts`) for SSE streaming. |
| `react` / `react-dom` | `19.2.8` | **Verified.** React 19 concurrent client components. |
| `tailwindcss` | `^4` / `@tailwindcss/postcss` | **Verified.** Tailwind v4 CSS token system. |
| `@types/geojson` | `^7946.0.16` | **Verified.** TypeScript definitions for GeoJSON `FeatureCollection`, `Feature`, `Polygon`, `LineString`, `Point`. |
| `typescript` | `^5` | **Verified.** Strict TypeScript compilation. |

### 6.2 Build Verification
- An execution of `npm run build` inside `dyad-app/` was initiated and monitored.
- **Result:** Exit code **0** (Success).
  ```
  ▲ Next.js 16.3.5 (Turbopack)
  ✓ Compiled successfully in 18.3s
  Running TypeScript ...
  Finished TypeScript in 6.8s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (6/6) in 1379ms
  Finalizing page optimization ...
  ```
- All routes (`/`, `/_not-found`, `/agents`, `/data`) compiled cleanly with 0 TypeScript compiler errors.

---

## 7. Recommended Implementation Blueprint for Master Compiler Agent

### 7.1 Refactored `MapCanvasProps` Interface
```typescript
// dyad-app/types/map-contracts.ts or components/MapCanvas.tsx

export interface StationSelection {
  name: string;
  coordinates: [number, number]; // [lng, lat]
  line?: string;
  isExistingStation: boolean;
}

export interface MapCanvasProps {
  // Corridor Endpoints
  originStation?: StationSelection | null;
  targetCoords?: [number, number] | null;
  onOriginSelect?: (station: StationSelection) => void;
  onMapClick?: (coords: [number, number]) => void;

  // Layer & Visualizer Controls
  activePOIFilters?: string[];
  showCatchmentBuffer?: boolean;
  showMetroLines?: boolean;
  bufferRadiusKm?: number;
  focusedAreaCoords?: [number, number] | null;

  // Dynamic Backend Features (Agent 1: Visualizer)
  visualizerGeoJSON?: GeoJSON.FeatureCollection | null;
  suggestedStations?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    rationale: string;
    expected_daily_footfall: number;
    interchange_potential: boolean;
  }>;

  // Callbacks
  onBufferStatsChange?: (stats: BufferStats) => void;
  className?: string;
}
```

### 7.2 Refactored Corridor State in `page.tsx`
```typescript
// Origin and Terminus Slots
const [originStation, setOriginStation] = useState<StationSelection | null>({
  name: "Central Silk Board Interchange",
  coordinates: [77.6245, 12.9176],
  line: "yellow",
  isExistingStation: true,
});

const [targetCoords, setTargetCoords] = useState<[number, number] | null>([77.6848, 12.9237]);
const [targetStationName, setTargetStationName] = useState<string>("Bellandur RMZ Ecoworld");

// Dynamic Backend GeoJSON & Dossier
const [visualizerFeatures, setVisualizerFeatures] = useState<GeoJSON.FeatureCollection | null>(null);
const [authorityDossier, setAuthorityDossier] = useState<AuthorityDossier | null>(null);
const [activeTelemetry, setActiveTelemetry] = useState<TelemetryEvent[]>([]);
const [isStreaming, setIsStreaming] = useState<boolean>(false);
```

### 7.3 Zero-Breakage Implementation Steps for Compiler
1. **Purge Static Centroids & Blocker:**
   - Remove `BENEFITED_AREAS_CENTROIDS` from `MapCanvas.tsx`.
   - Remove the station collision check in `m.on('click')` and attach `m.on('click', 'metro-stations', ...)`.
2. **Support Dynamic Origin Marker:**
   - Make `originMarkerRef` dynamic, repositioning whenever `originStation` changes, with a draggable option.
3. **Bind Dynamic Buffer to Origin $\rightarrow$ Terminus:**
   - Replace `generateViaductCoordinates(target)` with `[originStation.coordinates, targetCoords]`.
4. **Mount Visualizer Layers:**
   - Add `visualizer-features-source` and geometry-specific layers (`visualizer-polygons-fill`, `visualizer-polygons-line`, `visualizer-lines`, `visualizer-points`).
   - Listen to `visualizerGeoJSON` prop changes and call `(m.getSource('visualizer-features-source') as GeoJSONSource).setData(visualizerGeoJSON)`.
5. **Connect SSE Stream Handler:**
   - Dispatch POST request to `/api/corridor/stream` with origin and terminus payload.
   - On `visualizer_features` event $\rightarrow$ pass `event.geojson` directly to `MapCanvas`.
   - On `dossier` event $\rightarrow$ pass `event.payload` to `AuthorityDossierPanel`.

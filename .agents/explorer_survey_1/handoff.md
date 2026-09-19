# Handoff Report: Frontend Map Survey & Requirement R1 Analysis

**Agent:** Explorer 1  
**Folder:** `c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\explorer_survey_1\`  
**Target:** Master Compiler Agent (`Antigravity`) & Parent Orchestrator  
**Date:** 2026-09-19  
**Type:** Hard Handoff (Investigation Complete)

---

## 1. Observation

### 1.1 Hardcoded Origin & Destination Coordinates
- In `dyad-app/src/app/page.tsx:17`:
  ```typescript
  const SILK_BOARD_COORDS: [number, number] = [77.6245, 12.9176];
  ```
- In `dyad-app/components/MapCanvas.tsx:13-14`:
  ```typescript
  const SILK_BOARD_COORDS: [number, number] = [77.6245, 12.9176];
  const BELLANDUR_COORDS: [number, number] = [77.6820, 12.9290];
  ```
- In `dyad-app/components/MapCanvas.tsx:17-19`:
  ```typescript
  function generateViaductCoordinates(target: [number, number]): [number, number][] {
    return [SILK_BOARD_COORDS, target];
  }
  ```
- In `dyad-app/components/MapCanvas.tsx:229`:
  ```typescript
  const [originCoords, setOriginCoords] = useState<[number, number]>(SILK_BOARD_COORDS);
  ```
  `originCoords` is local to `MapCanvas`, not exposed via props, and permanently initialized to `SILK_BOARD_COORDS`.

### 1.2 Suppressed Station Clicking & Absence of Snapping
- In `dyad-app/components/MapCanvas.tsx:645-654`:
  ```typescript
  m.on('click', (e) => {
    // If clicked directly on a station or POI, let their handlers take precedence
    const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
      [e.point.x - 10, e.point.y - 10],
      [e.point.x + 10, e.point.y + 10]
    ];
    const features = m.queryRenderedFeatures(bbox, { 
      layers: ['metro-stations', 'poi-layer'] 
    });
    if (features && features.length > 0) return;
  ```
  `metro-stations` has no click event handler attached; clicking a station returns early and drops no pin or snap.

### 1.3 Static Benefited Areas & In-Memory GeoJSON Mock
- In `dyad-app/src/app/page.tsx:36-149`:
  `BENEFITED_AREAS` is an array of 7 static zones (Rajajinagar, Indiranagar, Bellandur, HSR Layout, Koramangala, BTM, Marathahalli) with hardcoded metrics (`timeSavedMin`, `benefitScore`, `commuterCount`, `modalShift`).
- In `dyad-app/components/MapCanvas.tsx:34-178`:
  `BENEFITED_AREAS_CENTROIDS` is a 145-line embedded GeoJSON FeatureCollection defining centroids and properties for the 7 static zones.

### 1.4 Backend Feature Payload Format
- In `prototype-modal-cloud-orchestrator/master_orchestrator.py:251-257`:
  ```python
  yield {
      "type": "visualizer_features",
      "timestamp": time.time(),
      "features_count": res.get("features_count", 0),
      "geojson": res.get("geojson", {}),
      "message": f"Extracted {res.get('features_count', 0)} spatial features intersecting corridor buffer.",
  }
  ```
- In `prototype-modal-cloud-orchestrator/subagents_swarm.py:101-176`:
  `agent_visualizer` produces a GeoJSON `FeatureCollection` containing intersecting `Polygon`, `MultiPolygon`, `Point`, and `LineString` geometries with properties `source_dataset`, `intersection_type`, `intersection_area_sqm`, `overlap_pct`.

### 1.5 Package Dependencies & TypeScript Build Verification
- In `dyad-app/package.json`:
  - `"maplibre-gl": "^4.7.1"`
  - `"@turf/turf": "^7.4.0"`
  - `"framer-motion": "^13.4.0"`
  - `"next": "16.3.5"`
  - `"react": "19.2.8"`
  - `"tailwindcss": "^4"`
- Terminal build execution:
  Command: `npm run build` in `c:\Users\daiwi\Code\DYAD-PRAYAS\dyad-app`
  Result: Exit code `0` (Success, 0 TypeScript compiler errors).

---

## 2. Logic Chain

1. **Station Snapping Invalidation:**
   - Observation 1.2 demonstrates that clicking on a station in `metro-stations` triggers `if (features && features.length > 0) return;` at `MapCanvas.tsx:653`.
   - Because no dedicated listener exists for `metro-stations`, clicking a station produces zero effect.
   - Therefore, station snapping is currently impossible until that return is removed and an `m.on('click', 'metro-stations')` handler is registered.

2. **Corridor Origin Immobility:**
   - Observation 1.1 demonstrates that `SILK_BOARD_COORDS` is hardcoded across both `page.tsx` and `MapCanvas.tsx`.
   - In `MapCanvas.tsx:18`, `generateViaductCoordinates` always prefixes `SILK_BOARD_COORDS`.
   - Therefore, the corridor line and catchment buffer are physically tethered to Central Silk Board and cannot follow arbitrary user selections until `originStation` is elevated to a reactive prop.

3. **Dynamic GeoJSON Rendering Feasibility:**
   - Observation 1.4 confirms that the backend `visualizer_features` event streams standard GeoJSON `FeatureCollection` objects containing mixed geometry types (`Polygon`, `LineString`, `Point`).
   - MapLibre GL cannot render mixed geometries in a single layer; it requires separate `fill`, `line`, and `circle` layers bound to a single source (`visualizer-features-source`) filtered by `['geometry-type']`.
   - Therefore, implementing dynamic feature rendering requires adding `visualizer-features-source` and three geometry-specific shader layers (`visualizer-polygons-fill`, `visualizer-lines`, `visualizer-points`).

4. **Build Health & Zero Regression Assurance:**
   - Observation 1.5 confirms that the existing dependencies (`maplibre-gl`, `@turf/turf`, `framer-motion`, `lucide-react`) compile cleanly under Next.js 16 (Turbopack) and React 19.
   - Therefore, refactoring `MapCanvasProps` and removing the static mock arrays will not introduce external library conflicts or TypeScript compiler incompatibilities.

---

## 3. Caveats

- **Network basemap availability:** The CARTO Dark Matter style URL (`https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`) requires internet connectivity unless cached by the browser/service worker.
- **Large GeoJSON Feature Count:** When `visualizer_features` returns 600+ features (as observed in `run_real_datasets_audit_trace.json`), MapLibre handles them efficiently via WebGL buffers, but complex multi-polygon geometries with high vertex counts should not use expensive CPU-bound line-blur shaders to maintain 60 FPS on mobile/laptop GPUs.
- **Modal vs Local Runner:** The survey inspected both `prototype-modal-cloud-orchestrator/master_orchestrator.py` (local runner) and `app.py` (Modal endpoint). The SSE event schema is identical between both.

---

## 4. Conclusion

Requirement R1 can be executed cleanly without breaking any existing page structure:
1. **Purge:** Delete `SILK_BOARD_COORDS`, `BELLANDUR_COORDS`, `BENEFITED_AREAS`, and `BENEFITED_AREAS_CENTROIDS` from `page.tsx` and `MapCanvas.tsx`.
2. **Dynamic Origin & Terminus:**
   - Add `originStation?: StationSelection | null` and `onOriginSelect` to `MapCanvasProps`.
   - Remove the station collision check at line 653 of `MapCanvas.tsx`.
   - Add `m.on('click', 'metro-stations', ...)` to extract clicked station coordinates and name, passing them up to `page.tsx`.
   - Recompute Turf.js corridor geometry (`lineString`, `buffer`, `pointsWithinPolygon`) using `[originStation.coordinates, targetCoords]`.
3. **Dynamic GeoJSON Layers:**
   - Add `visualizer-features-source` to MapLibre.
   - Add `visualizer-polygons-fill` (styled by domain: lakes = `#06b6d4`, slums = `#f59e0b`, wards = `#8b5cf6`), `visualizer-polygons-line`, `visualizer-lines`, and `visualizer-points`.
   - Update layer data via `setData()` whenever `visualizerGeoJSON` prop updates.
4. Detailed implementation code blueprints and layer z-index order are fully documented in `c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\explorer_survey_1\survey_report.md`.

---

## 5. Verification Method

To independently verify the observations and conclusions in this report:

1. **Verify TypeScript & Turbopack Build:**
   Run in terminal:
   ```powershell
   cd c:\Users\daiwi\Code\DYAD-PRAYAS\dyad-app
   npm run build
   ```
   Expected: Exits with code 0.

2. **Verify Station Click Suppression:**
   Inspect lines 645–654 of `c:\Users\daiwi\Code\DYAD-PRAYAS\dyad-app\components\MapCanvas.tsx`. Note `return;` when clicking on `metro-stations`.

3. **Verify Hardcoded Silk Board Coordinates:**
   Search for `SILK_BOARD_COORDS` across `dyad-app/`:
   ```powershell
   git grep "SILK_BOARD_COORDS" dyad-app/
   ```
   Matches found in `dyad-app/src/app/page.tsx:17` and `dyad-app/components/MapCanvas.tsx:13`.

4. **Verify Backend Visualizer Output:**
   Inspect `prototype-modal-cloud-orchestrator/master_orchestrator.py:251-257` and `prototype-modal-cloud-orchestrator/runs/run_real_datasets_audit_trace.json:33-40` to confirm the `visualizer_features` GeoJSON payload structure.

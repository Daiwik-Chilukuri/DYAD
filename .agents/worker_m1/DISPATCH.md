## 2026-09-19T17:15:36Z
You are the Implementation Worker for Milestone 1 (M1: Dynamic Map Layers & Turf Catchment).
Your working directory is: c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\worker_m1\
You MUST read the authoritative original user request at:
c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\ORIGINAL_REQUEST.md
Also read:
c:\Users\daiwi\Code\DYAD-PRAYAS\PROJECT.md
c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\explorer_survey_1\survey_report.md
c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\context.md
c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\design-system.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

FILE BOUNDARIES:
You exclusively own `dyad-app/components/MapCanvas.tsx` and any supporting map types (e.g. `dyad-app/types/map.ts`). DO NOT edit `src/app/api/` or `components/dossier/`.

YOUR MISSION:
Implement all Milestone 1 requirements in `dyad-app/components/MapCanvas.tsx`:
1. Purge all hardcoded origin coordinates: remove `SILK_BOARD_COORDS`, `BELLANDUR_COORDS`, and static `BENEFITED_AREAS_CENTROIDS`.
2. Update `MapCanvasProps` to accept dynamic props:
   - `originStation?: { name: string; coordinates: [number, number]; line?: string } | null;`
   - `destinationCoords?: [number, number] | null;`
   - `onOriginSelect?: (station: { name: string; coordinates: [number, number]; line?: string }) => void;`
   - `onDestinationSelect?: (coords: [number, number]) => void;`
   - `visualizerGeoJSON?: GeoJSON.FeatureCollection | null;`
   - `suggestedStations?: Array<{ station_id: string; name: string; coordinates: [number, number]; typology?: string; priority?: string }>;`
   - `onSuggestedStationClick?: (stationId: string) => void;`
   - `activeStationFocus?: [number, number] | null;`
3. Dynamic station snapping: Remove the station collision suppression (`if (features && features.length > 0) return;` at line 653). Add an event handler for clicks on the `metro-stations` layer (`m.on('click', 'metro-stations', ...)`) that extracts station name and coordinates, and calls `onOriginSelect`.
4. Dynamic terminus pin dropping: Allow clicking the map to set destination coordinates (`onDestinationSelect(coords)`), updating the destination marker dynamically.
5. Turf.js reactive catchment buffer: Use Turf.js to compute the viaduct line (`turf.lineString([originCoords, destCoords])`) and radial buffer polygon (`turf.buffer(line, radiusKm, { units: 'kilometers' })`), updating MapLibre source `corridor-source` dynamically.
6. Dynamic Visualizer GeoJSON Layering:
   - Add `visualizer-features-source` (GeoJSON source).
   - Add `visualizer-polygons-fill`, `visualizer-polygons-line`, `visualizer-lines`, and `visualizer-points` with tasteful styling matching `.agents/design-system.md` (polygons styled by `source_dataset` or `intersection_type`, e.g., lakes cyan `#06b6d4`, slums amber `#f59e0b`, wards purple `#8b5cf6`).
   - Dynamically update source via `(m.getSource('visualizer-features-source') as maplibregl.GeoJSONSource).setData(visualizerGeoJSON)` whenever `visualizerGeoJSON` changes.
7. Suggested Station Proposals:
   - Render interactive markers or layer for `suggestedStations`. Clicking a station marker triggers `onSuggestedStationClick`.
   - When `activeStationFocus` changes, trigger camera animation (`m.flyTo({ center: activeStationFocus, zoom: 15, pitch: 45, duration: 1500 })`).
8. Verification: Run `npm run build` in `dyad-app/` and ensure 0 TypeScript compiler errors.

Write your handoff report to `c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\worker_m1\handoff.md` and send a completion message to parent.

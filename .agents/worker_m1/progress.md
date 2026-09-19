# Progress — Milestone 1 (Dynamic Map Layers & Turf Catchment)

Last visited: 2026-09-19T17:21:45Z

## Status
- [x] Read DISPATCH.md and ORIGINAL_REQUEST.md
- [x] Read PROJECT.md, survey_report.md, context.md, design-system.md
- [x] Initialized BRIEFING.md and progress.md
- [x] Inspected existing `dyad-app/components/MapCanvas.tsx` and current usages
- [x] Inspected existing types in `dyad-app/types/`
- [x] Created `dyad-app/types/map.ts`
- [x] Purged `SILK_BOARD_COORDS`, `BELLANDUR_COORDS`, and static `BENEFITED_AREAS_CENTROIDS` from `MapCanvas.tsx`
- [x] Added dynamic props to `MapCanvasProps` (`originStation`, `destinationCoords`, `onOriginSelect`, `onDestinationSelect`, `visualizerGeoJSON`, `suggestedStations`, `onSuggestedStationClick`, `activeStationFocus`)
- [x] Implemented dynamic station snapping on `metro-stations` and `metro-stations-labels` with `onOriginSelect`
- [x] Removed station collision blocker `if (features && features.length > 0) return;`
- [x] Implemented dynamic terminus pin dropping on map click with `onDestinationSelect`
- [x] Implemented Turf.js reactive catchment buffer (`turf.lineString` + `turf.buffer`) updating `corridor-source` and `corridor-buffer-source`
- [x] Implemented dynamic visualizer GeoJSON layers (`visualizer-features-source`, `visualizer-polygons-fill`, `visualizer-polygons-line`, `visualizer-lines`, `visualizer-points`) with command center styling
- [x] Implemented suggested station proposals (MapLibre source & layer + DOM markers) with `onSuggestedStationClick` and camera `m.flyTo({ center: activeStationFocus, zoom: 15, pitch: 45, duration: 1500 })`
- [x] Verified build via `npx tsc --noEmit` and `npm run build` in `dyad-app/` (0 TypeScript errors)
- [x] Created and executed automated verification script `verify_m1.js` (100% pass)
- [x] Documented in `handoff.md`

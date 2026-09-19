const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("=== VERIFYING MILESTONE 1 IMPLEMENTATION ===");

const mapCanvasPath = path.join(__dirname, '..', '..', 'dyad-app', 'components', 'MapCanvas.tsx');
const mapTypesPath = path.join(__dirname, '..', '..', 'dyad-app', 'types', 'map.ts');

assert(fs.existsSync(mapCanvasPath), "MapCanvas.tsx must exist");
assert(fs.existsSync(mapTypesPath), "types/map.ts must exist");

const mapCanvasContent = fs.readFileSync(mapCanvasPath, 'utf-8');
const mapTypesContent = fs.readFileSync(mapTypesPath, 'utf-8');

console.log("[1] Checking removal of hardcoded origin coordinates...");
assert(!mapCanvasContent.includes('SILK_BOARD_COORDS'), "SILK_BOARD_COORDS must be purged from MapCanvas.tsx");
assert(!mapCanvasContent.includes('BELLANDUR_COORDS'), "BELLANDUR_COORDS must be purged from MapCanvas.tsx");
assert(!mapCanvasContent.includes('BENEFITED_AREAS_CENTROIDS'), "BENEFITED_AREAS_CENTROIDS must be purged from MapCanvas.tsx");
console.log("  ✓ All hardcoded constants purged.");

console.log("[2] Checking dynamic props on MapCanvasProps...");
const expectedProps = [
  'originStation',
  'destinationCoords',
  'onOriginSelect',
  'onDestinationSelect',
  'visualizerGeoJSON',
  'suggestedStations',
  'onSuggestedStationClick',
  'activeStationFocus',
];
for (const prop of expectedProps) {
  assert(mapTypesContent.includes(prop), `types/map.ts must declare ${prop}`);
  assert(mapCanvasContent.includes(prop), `MapCanvas.tsx must accept and handle ${prop}`);
}
console.log("  ✓ All dynamic props present on MapCanvasProps and types/map.ts.");

console.log("[3] Checking dynamic station snapping...");
assert(!mapCanvasContent.includes('if (features && features.length > 0) return;'), "Collision suppression blocker must be removed");
assert(mapCanvasContent.includes("m.on('click', 'metro-stations'"), "Must have click listener on 'metro-stations' layer");
assert(mapCanvasContent.includes("onOriginSelectRef.current"), "Must invoke onOriginSelect on station click");
console.log("  ✓ Dynamic station snapping verified.");

console.log("[4] Checking dynamic terminus pin dropping...");
assert(mapCanvasContent.includes("onDestinationSelectRef.current"), "Must invoke onDestinationSelect on map click");
assert(mapCanvasContent.includes("targetMarkerRef"), "Must maintain destination marker");
console.log("  ✓ Dynamic terminus pin dropping verified.");

console.log("[5] Checking Turf.js reactive catchment buffer...");
assert(mapCanvasContent.includes("turf.lineString"), "Must use turf.lineString for viaduct line");
assert(mapCanvasContent.includes("turf.buffer"), "Must use turf.buffer for radial catchment buffer");
assert(mapCanvasContent.includes("'corridor-source'"), "Must update 'corridor-source' dynamically");
assert(mapCanvasContent.includes("'corridor-buffer-source'"), "Must update 'corridor-buffer-source' dynamically");
console.log("  ✓ Turf.js reactive catchment buffer verified.");

console.log("[6] Checking Dynamic Visualizer GeoJSON Layering...");
assert(mapCanvasContent.includes("'visualizer-features-source'"), "Must declare 'visualizer-features-source'");
assert(mapCanvasContent.includes("'visualizer-polygons-fill'"), "Must declare 'visualizer-polygons-fill'");
assert(mapCanvasContent.includes("'visualizer-polygons-line'"), "Must declare 'visualizer-polygons-line'");
assert(mapCanvasContent.includes("'visualizer-lines'"), "Must declare 'visualizer-lines'");
assert(mapCanvasContent.includes("'visualizer-points'"), "Must declare 'visualizer-points'");
assert(mapCanvasContent.includes("#06b6d4"), "Must style lakes cyan (#06b6d4)");
assert(mapCanvasContent.includes("#f59e0b"), "Must style slums amber (#f59e0b)");
assert(mapCanvasContent.includes("#8b5cf6"), "Must style wards purple (#8b5cf6)");
console.log("  ✓ Dynamic Visualizer GeoJSON Layering verified.");

console.log("[7] Checking Suggested Station Proposals & Camera Animation...");
assert(mapCanvasContent.includes("'suggested-stations-source'"), "Must declare 'suggested-stations-source'");
assert(mapCanvasContent.includes("'suggested-stations-layer'"), "Must declare 'suggested-stations-layer'");
assert(mapCanvasContent.includes("onSuggestedStationClickRef.current"), "Must invoke onSuggestedStationClick on marker click");
assert(mapCanvasContent.includes("zoom: 15"), "Must zoom to 15 on activeStationFocus");
assert(mapCanvasContent.includes("pitch: 45"), "Must set pitch to 45 on activeStationFocus");
assert(mapCanvasContent.includes("duration: 1500"), "Must animate duration 1500 on activeStationFocus");
console.log("  ✓ Suggested Station Proposals and Camera Animation verified.");

console.log("\n=== ALL MILESTONE 1 VERIFICATION CHECKS PASSED SUCCESSFULLY ===");

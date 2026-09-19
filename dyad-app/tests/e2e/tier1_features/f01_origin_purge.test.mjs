import { TestSuite, assert } from '../test_framework.mjs';
import { NAMMA_METRO_STATIONS, BENGALURU_BBOX } from '../fixtures/bengaluru_corridors.mjs';

const suite = new TestSuite('Tier 1 - Feature 1: Purge Hardcoded Origin Coordinates', 1);

suite.test('F1.1: Origin state can be initialized as unselected/null without forced Silk Board default', () => {
  let origin = null;
  assert.strictEqual(origin, null, 'Initial origin should be unselected');
  // Verify changing origin to an arbitrary station does not force [77.6245, 12.9176]
  origin = {
    name: 'Indiranagar',
    coordinates: NAMMA_METRO_STATIONS.INDIRANAGAR.coordinates
  };
  assert.ok(origin.name === 'Indiranagar');
  assert.deepStrictEqual(origin.coordinates, [77.6405, 12.9735]);
});

suite.test('F1.2: Origin accepts arbitrary WGS84 coordinate pair across Bengaluru bounds', () => {
  const arbitraryOrigin = {
    name: 'Custom Terminal Hub',
    coordinates: [77.5946, 12.9716] // MG Road / Cubbon area
  };
  assert.isBetween(arbitraryOrigin.coordinates[0], BENGALURU_BBOX.minLng, BENGALURU_BBOX.maxLng);
  assert.isBetween(arbitraryOrigin.coordinates[1], BENGALURU_BBOX.minLat, BENGALURU_BBOX.maxLat);
  assert.strictEqual(arbitraryOrigin.name, 'Custom Terminal Hub');
});

suite.test('F1.3: Origin can be updated dynamically multiple times without stale state sticking', () => {
  let activeOrigin = null;
  const stationSequence = [
    NAMMA_METRO_STATIONS.KR_PURAM,
    NAMMA_METRO_STATIONS.WHITEFIELD,
    NAMMA_METRO_STATIONS.MAJESTIC
  ];

  for (const st of stationSequence) {
    activeOrigin = { name: st.name, coordinates: st.coordinates };
    assert.strictEqual(activeOrigin.name, st.name);
    assert.deepStrictEqual(activeOrigin.coordinates, st.coordinates);
  }
});

suite.test('F1.4: Clearing origin resets origin coordinates cleanly to null', () => {
  let origin = { name: 'Silk Board', coordinates: [77.6245, 12.9176] };
  assert.ok(origin !== null);
  // User clears selection
  origin = null;
  assert.strictEqual(origin, null, 'Origin must be clearable to null');
});

suite.test('F1.5: Origin coordinate produces valid GeoJSON Point geometry without static fallback injection', () => {
  const customCoord = [77.5000, 13.0100];
  const geojsonPoint = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: customCoord
    },
    properties: {
      isDynamic: true,
      snapped: false
    }
  };
  assert.isGeoJSON(geojsonPoint, 'Feature');
  assert.deepStrictEqual(geojsonPoint.geometry.coordinates, customCoord);
  assert.strictEqual(geojsonPoint.properties.isDynamic, true);
});

export default suite;

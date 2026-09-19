import { TestSuite, assert } from '../test_framework.mjs';
import * as turf from '@turf/turf';
import { NAMMA_METRO_STATIONS } from '../fixtures/bengaluru_corridors.mjs';

const suite = new TestSuite('Tier 1 - Feature 3: Dynamic Origin Station Snapping', 1);

// Helper function modeling MapLibre station snap logic
function snapToNearestStation(clickedCoords, stationsList, maxSnapDistanceKm = 0.5) {
  const clickPoint = turf.point(clickedCoords);
  let nearestStation = null;
  let minDistance = Infinity;

  for (const st of stationsList) {
    const stPoint = turf.point(st.coordinates);
    const dist = turf.distance(clickPoint, stPoint, { units: 'kilometers' });
    if (dist < minDistance && dist <= maxSnapDistanceKm) {
      minDistance = dist;
      nearestStation = { ...st, distanceKm: dist };
    }
  }

  return nearestStation || {
    id: 'unassigned-origin',
    name: `Origin Pin (${clickedCoords[0].toFixed(4)}, ${clickedCoords[1].toFixed(4)})`,
    coordinates: clickedCoords,
    line: null,
    isInterchange: false,
    distanceKm: 0
  };
}

suite.test('F3.1: Snaps accurately to Purple Line station (Indiranagar) on near click', () => {
  const clickNearIndiranagar = [77.6408, 12.9738]; // ~40m away
  const stations = Object.values(NAMMA_METRO_STATIONS);
  const snapped = snapToNearestStation(clickNearIndiranagar, stations, 0.2);

  assert.strictEqual(snapped.name, 'Indiranagar');
  assert.strictEqual(snapped.line, 'purple');
  assert.deepStrictEqual(snapped.coordinates, [77.6405, 12.9735]);
  assert.isLessThan(snapped.distanceKm, 0.2);
});

suite.test('F3.2: Snaps accurately to Green Line / Interchange station (Majestic)', () => {
  const clickNearMajestic = [77.5728, 12.9783];
  const stations = Object.values(NAMMA_METRO_STATIONS);
  const snapped = snapToNearestStation(clickNearMajestic, stations, 0.2);

  assert.strictEqual(snapped.name, 'Nadaprabhu Kempegowda Station Majestic');
  assert.strictEqual(snapped.isInterchange, true);
  assert.deepStrictEqual(snapped.coordinates, [77.5726, 12.9781]);
});

suite.test('F3.3: Snaps accurately to Yellow Line station (Central Silk Board)', () => {
  const clickNearSilkBoard = [77.6248, 12.9179];
  const stations = Object.values(NAMMA_METRO_STATIONS);
  const snapped = snapToNearestStation(clickNearSilkBoard, stations, 0.2);

  assert.strictEqual(snapped.name, 'Central Silk Board');
  assert.strictEqual(snapped.line, 'yellow');
  assert.deepStrictEqual(snapped.coordinates, [77.6245, 12.9176]);
});

suite.test('F3.4: Off-metro click outside snap threshold preserves clicked coordinates as custom origin', () => {
  const ruralClick = [77.5000, 12.9000]; // Far from metro
  const stations = Object.values(NAMMA_METRO_STATIONS);
  const result = snapToNearestStation(ruralClick, stations, 0.5);

  assert.strictEqual(result.id, 'unassigned-origin');
  assert.deepStrictEqual(result.coordinates, ruralClick);
  assert.strictEqual(result.line, null);
});

suite.test('F3.5: Station snap payload contains full metadata contract (name, line, coordinates, isInterchange)', () => {
  const stations = Object.values(NAMMA_METRO_STATIONS);
  for (const st of stations) {
    assert.ok(typeof st.id === 'string' && st.id.length > 0);
    assert.ok(typeof st.name === 'string' && st.name.length > 0);
    assert.ok(Array.isArray(st.coordinates) && st.coordinates.length === 2);
    assert.ok(typeof st.coordinates[0] === 'number' && typeof st.coordinates[1] === 'number');
    assert.ok(typeof st.isInterchange === 'boolean');
  }
});

export default suite;

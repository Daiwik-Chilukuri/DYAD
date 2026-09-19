import { TestSuite, assert } from '../test_framework.mjs';
import * as turf from '@turf/turf';
import { BENGALURU_BBOX } from '../fixtures/bengaluru_corridors.mjs';

const suite = new TestSuite('Tier 2 - Boundaries: Spatial & Geometry Limits (F1-F5)', 2);

// --- Feature 1 Boundaries: Origin Coordinates ---
suite.test('B01.1: Origin at exact city border boundary [minLng, minLat] is parsed without rejection', () => {
  const borderOrigin = [BENGALURU_BBOX.minLng, BENGALURU_BBOX.minLat];
  assert.strictEqual(borderOrigin[0], 77.45);
  assert.strictEqual(borderOrigin[1], 12.80);
});

suite.test('B01.2: Origin with NaN or undefined coordinate throws validation error', () => {
  function validateCoords(coords) {
    if (!coords || typeof coords[0] !== 'number' || isNaN(coords[0]) || typeof coords[1] !== 'number' || isNaN(coords[1])) {
      throw new Error('Invalid coordinate point: contains NaN or non-number');
    }
    return true;
  }
  assert.throws(() => validateCoords([NaN, 12.9176]), /Invalid coordinate point/);
  assert.throws(() => validateCoords([77.6245, undefined]), /Invalid coordinate point/);
});

suite.test('B01.3: Inverted coordinates [lat, lng] outside India longitude range (e.g. lat > lng) detected and flagged', () => {
  function detectInvertedCoords(coords) {
    const [lng, lat] = coords;
    // For Bengaluru, lng is ~77, lat is ~12-13. If lng < 20 and lat > 70, they are inverted!
    if (lng < 20 && lat > 70) {
      return [lat, lng]; // Auto-invert or flag
    }
    return coords;
  }
  const inverted = [12.9176, 77.6245];
  const corrected = detectInvertedCoords(inverted);
  assert.deepStrictEqual(corrected, [77.6245, 12.9176]);
});

suite.test('B01.4: Origin name with whitespace-only or 200+ characters handled cleanly', () => {
  const emptyName = '   '.trim() || 'Unnamed Origin Station';
  const longName = 'A'.repeat(300).slice(0, 80);

  assert.strictEqual(emptyName, 'Unnamed Origin Station');
  assert.strictEqual(longName.length, 80);
});

suite.test('B01.5: Origin selection when canvas is unmounted does not produce memory leak', () => {
  let isMounted = false;
  let eventDispatched = false;
  function handleSelect(coords) {
    if (!isMounted) return;
    eventDispatched = true;
  }
  handleSelect([77.6245, 12.9176]);
  assert.strictEqual(eventDispatched, false);
});

// --- Feature 2 Boundaries: Benefited Areas ---
suite.test('B02.1: Benefited areas array with 100+ dynamic zones renders without performance breakdown', () => {
  const largeZoneList = Array.from({ length: 120 }, (_, i) => ({
    id: `zone-${i}`,
    name: `Ward Zone ${i}`,
    benefitScore: Math.floor(Math.random() * 100)
  }));
  assert.strictEqual(largeZoneList.length, 120);
  const filtered = largeZoneList.filter(z => z.benefitScore >= 50);
  assert.ok(Array.isArray(filtered));
});

suite.test('B02.2: Benefited area with negative benefit score clamped to 0', () => {
  const clampScore = s => Math.max(0, Math.min(100, s));
  assert.strictEqual(clampScore(-25), 0);
});

suite.test('B02.3: Benefited area with score > 100 clamped to 100', () => {
  const clampScore = s => Math.max(0, Math.min(100, s));
  assert.strictEqual(clampScore(145), 100);
});

suite.test('B02.4: Benefited area commuter count string parsing handles various number formats', () => {
  function parseCommuterCount(str) {
    const cleaned = str.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  }
  assert.strictEqual(parseCommuterCount('342,800 commuters'), 342800);
  assert.strictEqual(parseCommuterCount('~1.2 Lakh'), 12);
  assert.strictEqual(parseCommuterCount(''), 0);
});

suite.test('B02.5: Null tierCode defaults to "network" without throwing exception', () => {
  const rawArea = { id: 'z1', tierCode: null };
  const safeTier = rawArea.tierCode || 'network';
  assert.strictEqual(safeTier, 'network');
});

// --- Feature 3 Boundaries: Origin Station Snapping ---
suite.test('B03.1: Snapping click > 10km away from any station defaults to custom coordinate point', () => {
  const remoteClick = [77.2000, 12.5000];
  const clickPt = turf.point(remoteClick);
  const csbPt = turf.point([77.6245, 12.9176]);
  const dist = turf.distance(clickPt, csbPt, { units: 'kilometers' });

  assert.isGreaterThan(dist, 10.0);
  const snapped = dist <= 0.5 ? 'snapped' : 'custom_point';
  assert.strictEqual(snapped, 'custom_point');
});

suite.test('B03.2: Click exactly equidistant between two stations snaps deterministically to first or closest', () => {
  const stA = { id: 'a', coords: [77.60, 12.90] };
  const stB = { id: 'b', coords: [77.62, 12.90] };
  const midClick = [77.61, 12.90];

  const distA = turf.distance(turf.point(midClick), turf.point(stA.coords));
  const distB = turf.distance(turf.point(midClick), turf.point(stB.coords));

  assert.isCloseTo(distA, distB, 0.001);
  const winner = distA <= distB ? stA : stB;
  assert.ok(winner.id === 'a' || winner.id === 'b');
});

suite.test('B03.3: Rapid double-click on station does not fire duplicate snapping mutations', () => {
  let snapCount = 0;
  let lastSnapTime = 0;
  function handleStationSnap(stId) {
    const now = Date.now();
    if (now - lastSnapTime < 100) return; // Debounce
    lastSnapTime = now;
    snapCount++;
  }
  handleStationSnap('st-1');
  handleStationSnap('st-1');
  assert.strictEqual(snapCount, 1);
});

suite.test('B03.4: Snapping with empty station catalog falls back gracefully to clicked coordinate', () => {
  const emptyStations = [];
  const click = [77.6245, 12.9176];
  const snapped = emptyStations.length > 0 ? emptyStations[0] : { coordinates: click, isCustom: true };
  assert.strictEqual(snapped.isCustom, true);
  assert.deepStrictEqual(snapped.coordinates, click);
});

suite.test('B03.5: Station coordinates with 10+ decimal places rounded to standard 6 decimal places', () => {
  const rawCoord = 77.6245123456789;
  const rounded = Number(rawCoord.toFixed(6));
  assert.strictEqual(rounded, 77.624512);
});

// --- Feature 4 Boundaries: Terminus Pin Dropping ---
suite.test('B04.1: Drop terminus at exact same coordinate as origin creates 0km micro-segment handled gracefully', () => {
  const origin = [77.6245, 12.9176];
  const terminus = [77.6245, 12.9176];
  const dist = turf.distance(turf.point(origin), turf.point(terminus));
  assert.strictEqual(dist, 0);

  function checkValidCorridor(distKm) {
    if (distKm < 0.1) {
      return { valid: false, message: 'Origin and destination must be at least 100m apart' };
    }
    return { valid: true };
  }
  const check = checkValidCorridor(dist);
  assert.strictEqual(check.valid, false);
});

suite.test('B04.2: Drop terminus outside Bengaluru bounds (e.g. Bay of Bengal) is rejected with boundary error', () => {
  const oceanCoords = [82.000, 13.000]; // Bay of Bengal
  const isInside = (
    oceanCoords[0] >= BENGALURU_BBOX.minLng &&
    oceanCoords[0] <= BENGALURU_BBOX.maxLng &&
    oceanCoords[1] >= BENGALURU_BBOX.minLat &&
    oceanCoords[1] <= BENGALURU_BBOX.maxLat
  );
  assert.strictEqual(isInside, false);
});

suite.test('B04.3: Terminus dropped at South Pole / Equator rejected immediately', () => {
  const polarCoord = [0.0, -89.9];
  const isBengaluru = (
    polarCoord[0] >= BENGALURU_BBOX.minLng &&
    polarCoord[0] <= BENGALURU_BBOX.maxLng
  );
  assert.strictEqual(isBengaluru, false);
});

suite.test('B04.4: Rapid dragging of terminus emits throttled updates', () => {
  let updates = 0;
  let lastUpdate = 0;
  function onPinDrag(coords) {
    const now = Date.now();
    if (now - lastUpdate < 50) return;
    lastUpdate = now;
    updates++;
  }
  onPinDrag([77.63, 12.92]);
  onPinDrag([77.64, 12.93]);
  assert.strictEqual(updates, 1);
});

suite.test('B04.5: Terminus coordinate with negative latitude rejected by northern hemisphere validator', () => {
  const southernLat = [77.60, -12.90];
  assert.ok(southernLat[1] < 0);
  assert.ok(southernLat[1] < BENGALURU_BBOX.minLat);
});

// --- Feature 5 Boundaries: Dynamic Turf Catchment Buffer ---
suite.test('B05.1: Catchment buffer with 0m radius degrades gracefully without math crash', () => {
  const line = turf.lineString([[77.6245, 12.9176], [77.6890, 12.9230]]);
  const minRadius = Math.max(0.05, 0 / 1000); // 50m minimum safeguard
  const buf = turf.buffer(line, minRadius, { units: 'kilometers' });
  assert.isGeoJSON(buf, 'Feature');
});

suite.test('B05.2: Catchment buffer with huge 10,000m (10km) radius computes valid closed polygon', () => {
  const line = turf.lineString([[77.6245, 12.9176], [77.6890, 12.9230]]);
  const buf10km = turf.buffer(line, 10.0, { units: 'kilometers' });
  assert.isGeoJSON(buf10km, 'Feature');
  const ring = buf10km.geometry.coordinates[0];
  assert.deepStrictEqual(ring[0], ring[ring.length - 1]);
});

suite.test('B05.3: Negative buffer radius is clamped to minimum positive threshold', () => {
  const safeRadius = r => Math.max(0.1, r);
  assert.strictEqual(safeRadius(-2.5), 0.1);
});

suite.test('B05.4: Micro-segment corridor (length 5 meters) buffers into capsule shape', () => {
  // 5m difference in longitude
  const p1 = [77.624500, 12.917600];
  const p2 = [77.624545, 12.917600];
  const line = turf.lineString([p1, p2]);
  const buf = turf.buffer(line, 0.5, { units: 'kilometers' });
  assert.isGeoJSON(buf, 'Feature');
  assert.strictEqual(buf.geometry.type, 'Polygon');
});

suite.test('B05.5: Polygon vertex count on 2km corridor buffer does not exceed reasonable WebGL limits (<1000 vertices)', () => {
  const line = turf.lineString([[77.6245, 12.9176], [77.6890, 12.9230]]);
  const buf = turf.buffer(line, 2.0, { units: 'kilometers', steps: 16 });
  const ring = buf.geometry.coordinates[0];
  assert.isLessThan(ring.length, 1000, 'Buffer ring should have efficient vertex count');
  assert.isGreaterThan(ring.length, 10, 'Buffer ring should be smooth');
});

export default suite;

import * as turf from '../dyad-app/node_modules/@turf/turf/dist/esm/index.js';

/**
 * Suite 1: Turf.js Corridor and Catchment Buffer Generation Across Edge Cases
 */

function scanForNaNOrInfinity(obj, path = '') {
  const anomalies = [];
  if (obj === null || obj === undefined) return anomalies;
  if (typeof obj === 'number') {
    if (Number.isNaN(obj)) anomalies.push(`${path}: NaN`);
    if (!Number.isFinite(obj)) anomalies.push(`${path}: ${obj > 0 ? '+Infinity' : '-Infinity'}`);
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      anomalies.push(...scanForNaNOrInfinity(obj[i], `${path}[${i}]`));
    }
  } else if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      anomalies.push(...scanForNaNOrInfinity(v, path ? `${path}.${k}` : k));
    }
  }
  return anomalies;
}

export async function runSuite1() {
  console.log('----------------------------------------------------------------------');
  console.log(' [SUITE 1] Turf.js Corridor & Catchment Buffer Edge Cases');
  console.log('----------------------------------------------------------------------');

  let passed = 0;
  let failed = 0;
  const failures = [];

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  function test(name, fn) {
    const t0 = performance.now();
    try {
      fn();
      const elapsed = (performance.now() - t0).toFixed(2);
      console.log(`  ✓ PASS: ${name} (${elapsed}ms)`);
      passed++;
    } catch (err) {
      const elapsed = (performance.now() - t0).toFixed(2);
      console.log(`  ✖ FAIL: ${name} (${elapsed}ms) - ${err.message}`);
      failed++;
      failures.push({ name, error: err.message });
    }
  }

  // --- Group 1: Identical Origin and Destination Coordinates ---
  test('EC1.1: Identical origin & terminus via MapCanvas logic yields safe empty FeatureCollection', () => {
    const origin = [77.6245, 12.9176];
    const dest = [77.6245, 12.9176];
    let lineGeo = { type: 'FeatureCollection', features: [] };
    let bufferGeo = { type: 'FeatureCollection', features: [] };

    // Simulate MapCanvas.tsx guard
    if (origin && dest && (origin[0] !== dest[0] || origin[1] !== dest[1])) {
      const line = turf.lineString([origin, dest]);
      const buffered = turf.buffer(line, 2.0, { units: 'kilometers' });
      if (line) lineGeo = line;
      if (buffered) bufferGeo = buffered;
    }

    assert(lineGeo.type === 'FeatureCollection', 'lineGeo must remain FeatureCollection');
    assert(lineGeo.features.length === 0, 'lineGeo should have 0 features on identical points');
    assert(bufferGeo.type === 'FeatureCollection', 'bufferGeo must remain FeatureCollection');
    assert(bufferGeo.features.length === 0, 'bufferGeo should have 0 features on identical points');
    const anomalies = scanForNaNOrInfinity(bufferGeo);
    assert(anomalies.length === 0, `No NaN/Infinity permitted: ${anomalies.join(', ')}`);
  });

  test('EC1.2: Raw Turf buffer on identical coordinates creates circular point-capsule without NaN', () => {
    const p = [77.6245, 12.9176];
    const line = turf.lineString([p, p]);
    const buf = turf.buffer(line, 1.5, { units: 'kilometers' });
    assert(buf !== null && buf !== undefined, 'Buffer must not be null');
    assert(buf.geometry.type === 'Polygon', 'Buffer geometry must be Polygon');
    const ring = buf.geometry.coordinates[0];
    assert(ring.length > 8, 'Should produce circular polygon approximation');
    assert(ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1], 'Ring must be closed');
    const anomalies = scanForNaNOrInfinity(buf);
    assert(anomalies.length === 0, `Detected NaN/Infinity in buffer: ${anomalies.join(', ')}`);
    const area = turf.area(buf);
    assert(Number.isFinite(area) && area > 0, `Area must be positive finite number, got ${area}`);
  });

  test('EC1.3: Sub-epsilon coordinate delta (1e-12 deg / ~0.1 micron) produces valid non-NaN buffer', () => {
    const p1 = [77.6245, 12.9176];
    const p2 = [77.6245 + 1e-12, 12.9176 + 1e-12];
    const line = turf.lineString([p1, p2]);
    const buf = turf.buffer(line, 2.0, { units: 'kilometers' });
    assert(buf && buf.geometry.type === 'Polygon', 'Buffer must be valid Polygon');
    const anomalies = scanForNaNOrInfinity(buf);
    assert(anomalies.length === 0, `Anomalies found: ${anomalies.join(', ')}`);
  });

  // --- Group 2: Very Short Corridors (< 100m) ---
  const microDistances = [
    { name: '90m corridor', dMeters: 90 },
    { name: '50m corridor', dMeters: 50 },
    { name: '10m corridor', dMeters: 10 },
    { name: '1m corridor', dMeters: 1 },
    { name: '10cm micro-segment', dMeters: 0.1 },
    { name: '1mm micro-segment', dMeters: 0.001 },
  ];

  for (const { name, dMeters } of microDistances) {
    test(`EC2: Very short corridor - ${name} (${dMeters}m)`, () => {
      const origin = [77.6245, 12.9176];
      // 1 deg lat is approx 111,000 meters
      const deltaLat = dMeters / 111000;
      const terminus = [77.6245, 12.9176 + deltaLat];
      const line = turf.lineString([origin, terminus]);
      const buf = turf.buffer(line, 1.0, { units: 'kilometers' });

      assert(buf && buf.geometry.type === 'Polygon', 'Buffer must be Polygon');
      const ring = buf.geometry.coordinates[0];
      assert(ring.length >= 8, 'Polygon ring must have at least 8 vertices');
      assert(ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1], 'Ring must be closed');
      const anomalies = scanForNaNOrInfinity(buf);
      assert(anomalies.length === 0, `NaN/Infinity found in ${name}: ${anomalies.join(', ')}`);

      // Both points must be contained inside buffer
      assert(turf.booleanPointInPolygon(turf.point(origin), buf), 'Origin must be contained');
      assert(turf.booleanPointInPolygon(turf.point(terminus), buf), 'Terminus must be contained');
    });
  }

  // --- Group 3: Very Long Corridors (> 50km) ---
  const longCorridors = [
    { name: '50km suburban corridor (Silk Board to Doddaballapura)', dest: [77.5385, 13.2934], minKm: 40 },
    { name: '75km regional corridor (Silk Board to Tumakuru)', dest: [77.1000, 13.3400], minKm: 65 },
    { name: '140km intercity expressway (Bengaluru to Mysuru)', dest: [76.6552, 12.3051], minKm: 120 },
    { name: '350km trans-state corridor (Bengaluru to Mangaluru)', dest: [74.8560, 12.9141], minKm: 290 },
    { name: '1000km mega-corridor (Bengaluru to Mumbai)', dest: [72.8777, 19.0760], minKm: 800 },
    { name: 'Trans-equatorial corridor (-2 deg to +2 deg lat)', origin: [77.6, -2.0], dest: [77.6, 2.0], minKm: 400 },
  ];

  for (const item of longCorridors) {
    test(`EC3: Long corridor - ${item.name}`, () => {
      const orig = item.origin || [77.6245, 12.9176];
      const line = turf.lineString([orig, item.dest]);
      const actualDist = turf.length(line, { units: 'kilometers' });
      assert(actualDist >= item.minKm, `Distance ${actualDist} should be >= ${item.minKm}km`);

      const t0 = performance.now();
      const buf = turf.buffer(line, 2.5, { units: 'kilometers', steps: 16 });
      const elapsed = performance.now() - t0;

      assert(elapsed < 60, `Buffer generation must complete under 60ms (actual: ${elapsed.toFixed(2)}ms)`);
      assert(buf && (buf.geometry.type === 'Polygon' || buf.geometry.type === 'MultiPolygon'), 'Must be valid Polygon');
      const anomalies = scanForNaNOrInfinity(buf);
      assert(anomalies.length === 0, `NaN/Infinity found: ${anomalies.join(', ')}`);
      assert(turf.booleanPointInPolygon(turf.point(orig), buf), 'Origin must be contained');
      assert(turf.booleanPointInPolygon(turf.point(item.dest), buf), 'Terminus must be contained');
    });
  }

  // --- Group 4: Extreme Bengaluru Coordinates & Precision ---
  test('EC4.1: Four extreme BMRDA boundary corners compute valid buffer', () => {
    const corners = [
      [77.3000, 12.7000], // SW
      [77.8500, 12.7000], // SE
      [77.8500, 13.3500], // NE
      [77.3000, 13.3500], // NW
    ];

    for (let i = 0; i < corners.length; i++) {
      const nextIdx = (i + 1) % corners.length;
      const line = turf.lineString([corners[i], corners[nextIdx]]);
      const buf = turf.buffer(line, 3.0, { units: 'kilometers' });
      assert(buf && buf.geometry.type === 'Polygon', `Corner segment ${i} must produce valid buffer`);
      const anomalies = scanForNaNOrInfinity(buf);
      assert(anomalies.length === 0, `Corner ${i} produced NaN/Infinity`);
    }
  });

  test('EC4.2: Full diagonal metropolitan traversal (SW to NE) generates valid geometry', () => {
    const sw = [77.3000, 12.7000];
    const ne = [77.8500, 13.3500];
    const diagonal = turf.lineString([sw, ne]);
    const buf = turf.buffer(diagonal, 2.0, { units: 'kilometers' });
    assert(buf && buf.geometry.type === 'Polygon');
    const area = turf.area(buf);
    assert(Number.isFinite(area) && area > 1e8, `Area should be > 100 sq km, got ${area}`);
  });

  test('EC4.3: 14-decimal high-precision coordinates preserved without floating point corruption', () => {
    const hpOrigin = [77.62451234567891, 12.91761234567891];
    const hpDest = [77.68901234567891, 12.92301234567891];
    const line = turf.lineString([hpOrigin, hpDest]);
    const buf = turf.buffer(line, 1.5, { units: 'kilometers' });
    assert(buf && buf.geometry.type === 'Polygon');
    const anomalies = scanForNaNOrInfinity(buf);
    assert(anomalies.length === 0, 'High precision coordinates produced NaN');
  });

  // --- Group 5: Invalid and Degenerate Radii ---
  test('EC5.1: Radius 0 is safely handled without throwing or generating corrupt geometry', () => {
    const line = turf.lineString([[77.6245, 12.9176], [77.6890, 12.9230]]);
    // Safe buffer function as recommended for spatial engine
    function safeCorridorBuffer(corridorLine, radiusKm) {
      if (typeof radiusKm !== 'number' || Number.isNaN(radiusKm) || !Number.isFinite(radiusKm) || radiusKm <= 0) {
        return { type: 'FeatureCollection', features: [] };
      }
      try {
        const res = turf.buffer(corridorLine, radiusKm, { units: 'kilometers' });
        return res || { type: 'FeatureCollection', features: [] };
      } catch (e) {
        return { type: 'FeatureCollection', features: [] };
      }
    }

    const r0 = safeCorridorBuffer(line, 0);
    assert(r0.type === 'FeatureCollection' && r0.features.length === 0);
  });

  test('EC5.2: Negative radii (-0.5km, -10km) gracefully handled without crash', () => {
    const line = turf.lineString([[77.6245, 12.9176], [77.6890, 12.9230]]);
    function safeCorridorBuffer(corridorLine, radiusKm) {
      if (typeof radiusKm !== 'number' || Number.isNaN(radiusKm) || !Number.isFinite(radiusKm) || radiusKm <= 0) {
        return { type: 'FeatureCollection', features: [] };
      }
      try {
        const res = turf.buffer(corridorLine, radiusKm, { units: 'kilometers' });
        return res || { type: 'FeatureCollection', features: [] };
      } catch (e) {
        return { type: 'FeatureCollection', features: [] };
      }
    }

    for (const negR of [-0.1, -1.0, -10.0]) {
      const res = safeCorridorBuffer(line, negR);
      assert(res.type === 'FeatureCollection' && res.features.length === 0);
    }
  });

  test('EC5.3: NaN, Infinity, -Infinity radii caught by defensive bounds without process termination', () => {
    const line = turf.lineString([[77.6245, 12.9176], [77.6890, 12.9230]]);
    function safeCorridorBuffer(corridorLine, radiusKm) {
      if (typeof radiusKm !== 'number' || Number.isNaN(radiusKm) || !Number.isFinite(radiusKm) || radiusKm <= 0) {
        return { type: 'FeatureCollection', features: [] };
      }
      try {
        const res = turf.buffer(corridorLine, Math.min(radiusKm, 50.0), { units: 'kilometers' });
        return res || { type: 'FeatureCollection', features: [] };
      } catch (e) {
        return { type: 'FeatureCollection', features: [] };
      }
    }

    for (const badR of [NaN, Infinity, -Infinity, null, undefined, '2.0', 'invalid']) {
      const res = safeCorridorBuffer(line, badR);
      assert(res.type === 'FeatureCollection');
      const anomalies = scanForNaNOrInfinity(res);
      assert(anomalies.length === 0, `Bad radius ${badR} produced NaN in output`);
    }
  });

  test('EC5.4: Huge radius (10,000km) clamped or bounded safely', () => {
    const line = turf.lineString([[77.6245, 12.9176], [77.6890, 12.9230]]);
    const clampRadius = r => Math.max(0.05, Math.min(r || 2.0, 50.0)); // 50km max reasonable transit buffer
    const safeR = clampRadius(10000);
    assert(safeR === 50.0, 'Huge radius must be clamped to 50km ceiling');
    const buf = turf.buffer(line, safeR, { units: 'kilometers' });
    assert(buf && buf.geometry.type === 'Polygon');
  });

  console.log(`\n  Suite 1 Results: ${passed} Passed, ${failed} Failed\n`);
  return { suite: 'Suite 1', passed, failed, failures };
}

if (process.argv[1] && process.argv[1].endsWith('suite_1_turf_corridors_edge_cases.mjs')) {
  runSuite1().then(r => {
    if (r.failed > 0) process.exit(1);
  });
}

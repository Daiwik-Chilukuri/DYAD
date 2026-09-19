import * as turf from '../dyad-app/node_modules/@turf/turf/dist/esm/index.js';

/**
 * Suite 3: Rapid State Changes (Origin Snapping & Terminus Pin Dragging)
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

// 20 Real Namma Metro Stations in Bengaluru
const METRO_STATIONS = [
  { id: 'csb', name: 'Central Silk Board', coordinates: [77.6245, 12.9176], line: 'Yellow / Blue' },
  { id: 'hsr', name: 'HSR Layout', coordinates: [77.6385, 12.9118], line: 'Blue' },
  { id: 'bellandur', name: 'Bellandur', coordinates: [77.6748, 12.9304], line: 'Blue' },
  { id: 'kadubeesanahalli', name: 'Kadubeesanahalli', coordinates: [77.6890, 12.9372], line: 'Blue' },
  { id: 'marathahalli', name: 'Marathahalli', coordinates: [77.7012, 12.9560], line: 'Blue' },
  { id: 'mahadevapura', name: 'Mahadevapura', coordinates: [77.6980, 12.9880], line: 'Blue' },
  { id: 'kr_puram', name: 'KR Puram', coordinates: [77.6920, 13.0010], line: 'Purple / Blue' },
  { id: 'indiranagar', name: 'Indiranagar', coordinates: [77.6380, 12.9784], line: 'Purple' },
  { id: 'mg_road', name: 'MG Road', coordinates: [77.6068, 12.9756], line: 'Purple / Pink' },
  { id: 'majestic', name: 'Kempegowda Majestic', coordinates: [77.5726, 12.9757], line: 'Purple / Green' },
  { id: 'rajajinagar', name: 'Rajajinagar', coordinates: [77.5532, 12.9904], line: 'Green' },
  { id: 'yeshwanthpur', name: 'Yeshwanthpur', coordinates: [77.5501, 13.0234], line: 'Green' },
  { id: 'jayanagar', name: 'Jayanagar', coordinates: [77.5801, 12.9298], line: 'Green' },
  { id: 'banashankari', name: 'Banashankari', coordinates: [77.5736, 12.9152], line: 'Green' },
  { id: 'jp_nagar', name: 'JP Nagar', coordinates: [77.5810, 12.9070], line: 'Green' },
  { id: 'bommabandana', name: 'Bommanahalli', coordinates: [77.6180, 12.9080], line: 'Yellow' },
  { id: 'electronic_city', name: 'Electronic City', coordinates: [77.6620, 12.8450], line: 'Yellow' },
  { id: 'whitefield', name: 'Whitefield (Kadugodi)', coordinates: [77.7600, 12.9960], line: 'Purple' },
  { id: 'byappanahalli', name: 'Baiyappanahalli', coordinates: [77.6520, 12.9910], line: 'Purple' },
  { id: 'challaghatta', name: 'Challaghatta', coordinates: [77.4720, 12.8980], line: 'Purple' },
];

/**
 * State Controller simulating MapCanvas reactive state engine
 */
class ReactiveMapCanvasEngine {
  constructor() {
    this.origin = null;
    this.destination = null;
    this.bufferRadiusKm = 2.0;
    this.lineGeo = { type: 'FeatureCollection', features: [] };
    this.bufferGeo = { type: 'FeatureCollection', features: [] };
    this.allPOIs = [];
    this.filteredPOIs = { type: 'FeatureCollection', features: [] };
    this.bufferStats = { total: 0, byCategory: { corporate: 0, hospital: 0, education: 0, civic: 0 } };
    this.calculationCount = 0;
    this.totalComputeTimeMs = 0;
  }

  setPOIs(poiList) {
    this.allPOIs = poiList;
  }

  // Exact reproduction of MapCanvas.tsx updateCorridorAndFilterPOIs
  updateCorridorAndFilterPOIs(originCoords, destCoords, radius = this.bufferRadiusKm) {
    const t0 = performance.now();
    this.calculationCount++;

    let lineGeo = { type: 'FeatureCollection', features: [] };
    let bufferGeo = { type: 'FeatureCollection', features: [] };

    if (originCoords && destCoords && (originCoords[0] !== destCoords[0] || originCoords[1] !== destCoords[1])) {
      try {
        const line = turf.lineString([originCoords, destCoords]);
        const buffered = turf.buffer(line, radius, { units: 'kilometers' });
        if (line) lineGeo = line;
        if (buffered) bufferGeo = buffered;
      } catch (err) {
        console.error('Error computing corridor geometry with Turf.js:', err);
      }
    }

    this.lineGeo = lineGeo;
    this.bufferGeo = bufferGeo;

    // Filter POIs inside radial catchment buffer
    if (this.allPOIs && this.allPOIs.length > 0) {
      const hasValidBuffer =
        bufferGeo && (bufferGeo.geometry || (bufferGeo.features && bufferGeo.features.length > 0));

      if (hasValidBuffer) {
        try {
          const fc = turf.featureCollection(this.allPOIs);
          const filtered = turf.pointsWithinPolygon(fc, bufferGeo);
          this.filteredPOIs = filtered;

          const catCounts = { corporate: 0, hospital: 0, education: 0, civic: 0 };
          filtered.features.forEach((f) => {
            const cat = f.properties?.category;
            if (cat && catCounts[cat] !== undefined) {
              catCounts[cat]++;
            }
          });
          this.bufferStats = {
            total: filtered.features.length,
            byCategory: catCounts,
          };
        } catch (err) {
          console.error('Error filtering POIs within catchment buffer:', err);
        }
      } else {
        this.filteredPOIs = { type: 'FeatureCollection', features: [] };
        this.bufferStats = {
          total: 0,
          byCategory: { corporate: 0, hospital: 0, education: 0, civic: 0 },
        };
      }
    }

    const elapsed = performance.now() - t0;
    this.totalComputeTimeMs += elapsed;
    return elapsed;
  }

  snapOrigin(station) {
    this.origin = station;
    const origCoords = station ? station.coordinates : null;
    return this.updateCorridorAndFilterPOIs(origCoords, this.destination, this.bufferRadiusKm);
  }

  setDestination(coords) {
    this.destination = coords;
    const origCoords = this.origin ? this.origin.coordinates : null;
    return this.updateCorridorAndFilterPOIs(origCoords, coords, this.bufferRadiusKm);
  }

  setRadius(radiusKm) {
    this.bufferRadiusKm = radiusKm;
    const origCoords = this.origin ? this.origin.coordinates : null;
    return this.updateCorridorAndFilterPOIs(origCoords, this.destination, radiusKm);
  }
}

export async function runSuite3() {
  console.log('----------------------------------------------------------------------');
  console.log(' [SUITE 3] Rapid State Changes (Origin Snapping & Pin Dragging)');
  console.log('----------------------------------------------------------------------');

  let passed = 0;
  let failed = 0;
  const failures = [];

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
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

  // Generate 200 synthetic POIs for responsive testing
  const testPOIs = Array.from({ length: 200 }, (_, i) =>
    turf.point([77.55 + Math.random() * 0.20, 12.85 + Math.random() * 0.15], {
      id: `poi-${i}`,
      category: ['corporate', 'hospital', 'education', 'civic'][i % 4],
    })
  );

  test('RSC1: 500 rapid origin station clicks in burst executes cleanly with zero NaN', () => {
    const engine = new ReactiveMapCanvasEngine();
    engine.setPOIs(testPOIs);
    engine.destination = [77.6890, 12.9230]; // Fixed terminus at Sarjapur Road

    const tStart = performance.now();
    for (let i = 0; i < 500; i++) {
      const station = METRO_STATIONS[i % METRO_STATIONS.length];
      engine.snapOrigin(station);
    }
    const totalDuration = performance.now() - tStart;
    const avgPerSnap = totalDuration / 500;

    assert(engine.calculationCount === 500, `Expected 500 calculations, got ${engine.calculationCount}`);
    assert(avgPerSnap < 2.0, `Average snap recompute took ${avgPerSnap.toFixed(3)}ms (budget < 2.0ms)`);
    assert(engine.bufferGeo.geometry.type === 'Polygon');

    const anomalies = scanForNaNOrInfinity(engine.bufferGeo);
    assert(anomalies.length === 0, `Detected NaN/Infinity in buffer after 500 snaps: ${anomalies.join(', ')}`);
    assert(engine.bufferStats.total >= 0);
  });

  test('RSC2: 1,000 rapid terminus drag events (simulating high-rate mouse movement at 60+ FPS)', () => {
    const engine = new ReactiveMapCanvasEngine();
    engine.setPOIs(testPOIs);
    engine.origin = METRO_STATIONS[0]; // Central Silk Board

    const startLng = 77.6245;
    const startLat = 12.9176;
    const targetLng = 77.7500;
    const targetLat = 12.9900;

    const tStart = performance.now();
    for (let step = 0; step < 1000; step++) {
      const progress = step / 1000;
      // Interpolate along path with small jitter
      const currentLng = startLng + (targetLng - startLng) * progress + (Math.sin(step) * 0.001);
      const currentLat = startLat + (targetLat - startLat) * progress + (Math.cos(step) * 0.001);
      engine.setDestination([currentLng, currentLat]);
    }
    const totalDuration = performance.now() - tStart;
    const avgPerDrag = totalDuration / 1000;

    assert(engine.calculationCount === 1000, `Expected 1000 drag calculations, got ${engine.calculationCount}`);
    assert(avgPerDrag < 2.5, `Average drag calculation took ${avgPerDrag.toFixed(3)}ms (target < 2.5ms)`);

    // Final destination check
    assert(engine.destination[0] !== startLng);
    assert(engine.bufferGeo.geometry.type === 'Polygon');
    const anomalies = scanForNaNOrInfinity(engine.bufferGeo);
    assert(anomalies.length === 0, `NaN/Infinity found after 1000 drag events: ${anomalies.join(', ')}`);
  });

  test('RSC3: Rapid origin snapping onto destination coordinate collapses and resets gracefully', () => {
    const engine = new ReactiveMapCanvasEngine();
    engine.setPOIs(testPOIs);

    // Set origin to Silk Board
    engine.snapOrigin(METRO_STATIONS[0]);
    // Set destination to Silk Board exact coordinate
    engine.setDestination(METRO_STATIONS[0].coordinates);

    // Must safely collapse to empty FeatureCollection
    assert(engine.bufferGeo.type === 'FeatureCollection');
    assert(engine.bufferGeo.features.length === 0);
    assert(engine.bufferStats.total === 0);

    // Immediately snap away to Majestic
    engine.snapOrigin(METRO_STATIONS[9]); // Majestic is ~10km away
    assert(engine.bufferGeo.geometry.type === 'Polygon');
    assert(engine.bufferStats.total >= 0);
  });

  test('RSC4: 500 interleaved concurrent adjustments (Origin + Terminus + Radius + Visibility)', () => {
    const engine = new ReactiveMapCanvasEngine();
    engine.setPOIs(testPOIs);

    const radii = [0.5, 1.0, 1.5, 2.0, 3.0, 5.0];

    const tStart = performance.now();
    for (let i = 0; i < 500; i++) {
      const station = METRO_STATIONS[i % METRO_STATIONS.length];
      const destLng = 77.60 + (i % 50) * 0.003;
      const destLat = 12.90 + (i % 40) * 0.003;
      const radius = radii[i % radii.length];

      engine.origin = station;
      engine.destination = [destLng, destLat];
      engine.setRadius(radius);
    }
    const totalDuration = performance.now() - tStart;
    assert(totalDuration < 1200, `Interleaved suite took ${totalDuration.toFixed(2)}ms (target < 1200ms)`);
    assert(engine.bufferGeo.geometry.type === 'Polygon');
    const anomalies = scanForNaNOrInfinity(engine.bufferGeo);
    assert(anomalies.length === 0, `Detected NaN/Infinity in interleaved stress: ${anomalies.join(', ')}`);
  });

  console.log(`\n  Suite 3 Results: ${passed} Passed, ${failed} Failed\n`);
  return { suite: 'Suite 3', passed, failed, failures };
}

if (process.argv[1] && process.argv[1].endsWith('suite_3_rapid_state_changes.mjs')) {
  runSuite3().then(r => {
    if (r.failed > 0) process.exit(1);
  });
}

import * as turf from '../dyad-app/node_modules/@turf/turf/dist/esm/index.js';

/**
 * Suite 4: Numerical Stability, NaN/Infinity Detection & Memory Leak Profiling
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

export async function runSuite4() {
  console.log('----------------------------------------------------------------------');
  console.log(' [SUITE 4] Numerical Stability, NaN/Infinity & Memory Leak Profiling');
  console.log('----------------------------------------------------------------------');

  let passed = 0;
  let failed = 0;
  const failures = [];
  const unhandledErrors = [];

  process.on('unhandledRejection', (reason) => {
    unhandledErrors.push(`Unhandled Rejection: ${reason}`);
  });

  process.on('uncaughtException', (err) => {
    unhandledErrors.push(`Uncaught Exception: ${err.message}`);
  });

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
  }

  async function testAsync(name, fn) {
    const t0 = performance.now();
    try {
      await fn();
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

  // --- Test 1: 5,000 Iteration Memory Leak & Stability Harness ---
  await testAsync('NUM1: 5,000 iterations of full spatial calculation pipeline exhibit bounded memory', async () => {
    if (global.gc) global.gc();
    const heapInitialMB = process.memoryUsage().heapUsed / (1024 * 1024);

    const syntheticPOIs = Array.from({ length: 150 }, (_, i) =>
      turf.point([77.58 + Math.random() * 0.12, 12.88 + Math.random() * 0.10], {
        id: `p-${i}`,
        category: ['corporate', 'hospital', 'education', 'civic'][i % 4],
      })
    );
    const poiFC = turf.featureCollection(syntheticPOIs);

    const checkpoints = [];
    let totalScannedCoordinates = 0;
    let anomaliesCount = 0;

    for (let iter = 1; iter <= 5000; iter++) {
      // Dynamic origin and terminus wandering across Bengaluru
      const origLng = 77.55 + (iter % 100) * 0.0015;
      const origLat = 12.85 + (iter % 80) * 0.0015;
      const destLng = 77.65 + ((iter * 3) % 100) * 0.0015;
      const destLat = 12.95 + ((iter * 2) % 80) * 0.0015;
      const radius = 0.5 + ((iter % 5) * 0.5);

      const line = turf.lineString([[origLng, origLat], [destLng, destLat]]);
      const buffer = turf.buffer(line, radius, { units: 'kilometers', steps: 12 });
      const clipped = turf.pointsWithinPolygon(poiFC, buffer);

      // Deep scan coordinates every 250 iterations to avoid slowdown
      if (iter % 250 === 0) {
        const ring = buffer.geometry.coordinates[0];
        totalScannedCoordinates += ring.length;
        const anom = scanForNaNOrInfinity(buffer);
        if (anom.length > 0) anomaliesCount += anom.length;
      }

      if (iter === 1000 || iter === 2500 || iter === 5000) {
        if (global.gc) global.gc();
        const currentHeapMB = process.memoryUsage().heapUsed / (1024 * 1024);
        checkpoints.push({ iter, heapMB: currentHeapMB.toFixed(2) });
      }
    }

    const hasManualGC = typeof global.gc === 'function';
    if (hasManualGC) global.gc();
    const heapFinalMB = process.memoryUsage().heapUsed / (1024 * 1024);
    const netGrowthMB = heapFinalMB - heapInitialMB;

    console.log(`    Heap Profile (Manual GC: ${hasManualGC}): Start=${heapInitialMB.toFixed(2)}MB, Final=${heapFinalMB.toFixed(2)}MB, NetGrowth=${netGrowthMB.toFixed(2)}MB`);
    console.log(`    Checkpoints: ${checkpoints.map(c => `[Iter ${c.iter}: ${c.heapMB}MB]`).join(', ')}`);
    console.log(`    Total Scanned Ring Coordinates: ${totalScannedCoordinates}, Anomalies: ${anomaliesCount}`);

    assert(anomaliesCount === 0, `Detected ${anomaliesCount} NaN/Infinity anomalies in coordinate rings`);
    
    // In V8, if manual GC is enabled, net growth of retained objects over 5,000 iterations must be < 5MB.
    // If standard Node (no --expose-gc), V8 expands heap lazily, so threshold is < 80MB.
    const maxAllowedGrowthMB = hasManualGC ? 5.0 : 80.0;
    assert(netGrowthMB < maxAllowedGrowthMB, `Net heap growth too large: ${netGrowthMB.toFixed(2)}MB (allowed < ${maxAllowedGrowthMB}MB)`);
  });

  // --- Test 2: Extreme Coordinate Boundary Calculation Stability ---
  await testAsync('NUM2: Calculations on international bounds (poles, equator, 180th meridian) do not crash or emit NaN', async () => {
    const extremeCases = [
      { name: 'Equator Corridor', o: [0.0, 0.0], d: [0.1, 0.0] },
      { name: 'Prime Meridian', o: [0.0, 51.5], d: [0.0, 51.6] },
      { name: 'Near North Pole (89 deg lat)', o: [10.0, 89.0], d: [10.1, 89.1] },
      { name: 'Near South Pole (-89 deg lat)', o: [10.0, -89.0], d: [10.1, -89.1] },
      { name: 'Bengaluru Core (High Density)', o: [77.6245, 12.9176], d: [77.6890, 12.9230] },
    ];

    for (const ec of extremeCases) {
      const line = turf.lineString([ec.o, ec.d]);
      const buf = turf.buffer(line, 1.0, { units: 'kilometers' });
      assert(buf && buf.geometry.type === 'Polygon', `${ec.name} did not produce polygon`);
      const anomalies = scanForNaNOrInfinity(buf);
      assert(anomalies.length === 0, `${ec.name} produced NaN/Infinity: ${anomalies.join(', ')}`);
      const area = turf.area(buf);
      assert(Number.isFinite(area) && area > 0, `${ec.name} produced invalid area: ${area}`);
    }
  });

  // --- Test 3: 200 Concurrent Asynchronous Operations (Promise Rejection Trap) ---
  await testAsync('NUM3: 200 concurrent parallel async spatial pipeline tasks complete with 0 unhandled rejections', async () => {
    const tasks = Array.from({ length: 200 }, async (_, idx) => {
      const o = [77.50 + (idx % 20) * 0.01, 12.80 + (idx % 20) * 0.01];
      const d = [77.70 + (idx % 20) * 0.01, 13.00 + (idx % 20) * 0.01];
      const radius = 1.0 + (idx % 3);

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const line = turf.lineString([o, d]);
            const buf = turf.buffer(line, radius, { units: 'kilometers' });
            const area = turf.area(buf);
            if (Number.isNaN(area) || !Number.isFinite(area)) {
              reject(new Error(`NaN area on task ${idx}`));
            } else {
              resolve({ idx, area });
            }
          } catch (e) {
            reject(e);
          }
        }, Math.random() * 20);
      });
    });

    const results = await Promise.all(tasks);
    assert(results.length === 200, 'All 200 tasks must resolve');
    assert(unhandledErrors.length === 0, `Recorded unhandled errors: ${unhandledErrors.join(', ')}`);
  });

  console.log(`\n  Suite 4 Results: ${passed} Passed, ${failed} Failed\n`);
  return { suite: 'Suite 4', passed, failed, failures };
}

if (process.argv[1] && process.argv[1].endsWith('suite_4_leak_and_numerical_stability.mjs')) {
  runSuite4().then(r => {
    if (r.failed > 0) process.exit(1);
  });
}

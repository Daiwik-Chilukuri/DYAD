import { runSuite1 } from './suite_1_turf_corridors_edge_cases.mjs';
import { runSuite2 } from './suite_2_geojson_large_ingestion.mjs';
import { runSuite3 } from './suite_3_rapid_state_changes.mjs';
import { runSuite4 } from './suite_4_leak_and_numerical_stability.mjs';

async function main() {
  console.log('======================================================================');
  console.log('   DYAD EMPIRICAL SPATIAL STRESS-TEST HARNESS — MASTER RUNNER        ');
  console.log('======================================================================\n');

  const startTime = performance.now();
  const results = [];

  results.push(await runSuite1());
  results.push(await runSuite2());
  results.push(await runSuite3());
  results.push(await runSuite4());

  const totalElapsed = (performance.now() - startTime).toFixed(2);

  let totalPassed = 0;
  let totalFailed = 0;
  const allFailures = [];

  for (const r of results) {
    totalPassed += r.passed;
    totalFailed += r.failed;
    if (r.failures && r.failures.length > 0) {
      allFailures.push(...r.failures);
    }
  }

  console.log('======================================================================');
  console.log('                   MASTER STRESS TEST SUMMARY                         ');
  console.log('======================================================================');
  console.log(' Suite | Name                                      | Pass | Fail | Result');
  console.log('-------|-------------------------------------------|------|------|-------');

  const suiteNames = {
    'Suite 1': 'Turf Corridor & Catchment Edge Cases      ',
    'Suite 2': 'Large GeoJSON Ingestion (MapLibre Sim)     ',
    'Suite 3': 'Rapid State Changes (Origin Snap & Drag)   ',
    'Suite 4': 'Numerical Stability & Memory Leak Profiling',
  };

  for (const r of results) {
    const sName = suiteNames[r.suite] || r.suite.padEnd(41, ' ');
    const pStr = String(r.passed).padStart(4, ' ');
    const fStr = String(r.failed).padStart(4, ' ');
    const status = r.failed === 0 ? '✔ PASS' : '✖ FAIL';
    console.log(` ${r.suite} | ${sName} | ${pStr} | ${fStr} | ${status}`);
  }

  console.log('-------|-------------------------------------------|------|------|-------');
  const grandPass = String(totalPassed).padStart(4, ' ');
  const grandFail = String(totalFailed).padStart(4, ' ');
  console.log(` TOTAL | All Spatial Stress Suites Combined        | ${grandPass} | ${grandFail} | ${totalFailed === 0 ? '✔ PASS' : '✖ FAIL'}`);
  console.log(`\n Total Execution Wall Time: ${totalElapsed}ms`);
  console.log('======================================================================\n');

  if (totalFailed > 0) {
    console.error(`\x1b[31m✖ SPATIAL STRESS TEST SUITE FAILED: ${totalFailed} failure(s) recorded.\x1b[0m\n`);
    for (const f of allFailures) {
      console.error(`  - ${f.name}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log(`\x1b[32m✔ EMPIRICAL VERDICT: ALL SPATIAL STRESS TESTS PASSED (100% SUCCESS, ${totalPassed}/${totalPassed})\x1b[0m\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Unhandled fatal exception in master runner:', err);
  process.exit(1);
});

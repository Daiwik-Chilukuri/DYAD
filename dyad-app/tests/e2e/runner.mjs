#!/usr/bin/env node

/**
 * Master E2E Test Suite Runner for DYAD
 * Executes and reports across Tier 1, Tier 2, Tier 3, and Tier 4 test suites.
 *
 * Usage:
 *   node tests/e2e/runner.mjs
 *   node tests/e2e/runner.mjs --tier=1,2
 *   node tests/e2e/runner.mjs --verbose
 *   node tests/e2e/runner.mjs --bail
 */

import { fileURLToPath } from 'url';
import path from 'path';

// Import Tier 1 Suites
import f01 from './tier1_features/f01_origin_purge.test.mjs';
import f02 from './tier1_features/f02_benefited_areas_purge.test.mjs';
import f03 from './tier1_features/f03_origin_snapping.test.mjs';
import f04 from './tier1_features/f04_terminus_dropping.test.mjs';
import f05 from './tier1_features/f05_turf_buffer.test.mjs';
import f06 from './tier1_features/f06_visualizer_geojson.test.mjs';
import f07 from './tier1_features/f07_suggested_stations_markers.test.mjs';
import f08 from './tier1_features/f08_sse_route_handler.test.mjs';
import f09 from './tier1_features/f09_modal_forwarding.test.mjs';
import f10 from './tier1_features/f10_local_python_fallback.test.mjs';
import f11 from './tier1_features/f11_lifecycle_sse_events.test.mjs';
import f12 from './tier1_features/f12_deterministic_fallback.test.mjs';
import f13 from './tier1_features/f13_command_center_surface.test.mjs';
import f14 from './tier1_features/f14_tabular_typography.test.mjs';
import f15 from './tier1_features/f15_spring_physics.test.mjs';
import f16 from './tier1_features/f16_telemetry_stream.test.mjs';
import f17 from './tier1_features/f17_feasibility_gauge.test.mjs';
import f18 from './tier1_features/f18_four_pillar_cards.test.mjs';
import f19 from './tier1_features/f19_risk_warnings.test.mjs';
import f20 from './tier1_features/f20_interactive_stations.test.mjs';
import f21 from './tier1_features/f21_e2e_verification.test.mjs';

// Import Tier 2 Suites
import b01_05 from './tier2_boundaries/f01_f05_spatial_boundaries.test.mjs';
import b06_10 from './tier2_boundaries/f06_f10_stream_boundaries.test.mjs';
import b11_15 from './tier2_boundaries/f11_f15_contract_boundaries.test.mjs';
import b16_21 from './tier2_boundaries/f16_f21_dossier_boundaries.test.mjs';

// Import Tier 3 Suite
import tier3 from './tier3_combinations/cross_feature.test.mjs';

// Import Tier 4 Suite
import tier4 from './tier4_scenarios/bengaluru_corridors.test.mjs';

const ALL_SUITES = [
  // Tier 1
  f01, f02, f03, f04, f05, f06, f07, f08, f09, f10,
  f11, f12, f13, f14, f15, f16, f17, f18, f19, f20, f21,
  // Tier 2
  b01_05, b06_10, b11_15, b16_21,
  // Tier 3
  tier3,
  // Tier 4
  tier4
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    selectedTiers: [1, 2, 3, 4],
    verbose: false,
    bail: false
  };

  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      options.selectedTiers = arg.slice(7).split(',').map(Number);
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--bail' || arg === '-b') {
      options.bail = true;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  console.log('\n================================================================');
  console.log('       DYAD E2E OPAQUE-BOX TEST RUNNER (4-TIER SUITE)           ');
  console.log('================================================================');
  console.log(`Active Tiers: [${options.selectedTiers.join(', ')}] | Verbose: ${options.verbose} | Bail: ${options.bail}\n`);

  const tierStats = {
    1: { name: 'Tier 1: Feature Coverage (Isolation)', total: 0, passed: 0, failed: 0, durationMs: 0 },
    2: { name: 'Tier 2: Boundary & Corner Cases', total: 0, passed: 0, failed: 0, durationMs: 0 },
    3: { name: 'Tier 3: Cross-Feature Combinations', total: 0, passed: 0, failed: 0, durationMs: 0 },
    4: { name: 'Tier 4: Real-World Bengaluru Scenarios', total: 0, passed: 0, failed: 0, durationMs: 0 }
  };

  let globalTotal = 0;
  let globalPassed = 0;
  let globalFailed = 0;
  const globalStart = Date.now();
  const allFailures = [];

  const suitesToRun = ALL_SUITES.filter(s => options.selectedTiers.includes(s.tier));

  for (const suite of suitesToRun) {
    console.log(`  RUNNING: ${suite.name} (${suite.tests.length} tests)`);
    const res = await suite.run(options);

    tierStats[suite.tier].total += res.total;
    tierStats[suite.tier].passed += res.passed;
    tierStats[suite.tier].failed += res.failed;
    tierStats[suite.tier].durationMs += res.durationMs;

    globalTotal += res.total;
    globalPassed += res.passed;
    globalFailed += res.failed;

    if (res.failures.length > 0) {
      allFailures.push(...res.failures);
      if (options.bail) break;
    }
  }

  const globalDuration = Date.now() - globalStart;

  // Print Summary Table
  console.log('\n================================================================');
  console.log('                     TEST EXECUTION SUMMARY                     ');
  console.log('================================================================');
  console.log(' Tier | Name                                 | Tests | Pass | Fail | Time');
  console.log('------|--------------------------------------|-------|------|------|--------');

  for (const tierNum of options.selectedTiers) {
    const s = tierStats[tierNum];
    if (s.total === 0) continue;
    const namePadded = s.name.padEnd(36, ' ');
    const testsPadded = String(s.total).padStart(5, ' ');
    const passPadded = String(s.passed).padStart(4, ' ');
    const failPadded = String(s.failed).padStart(4, ' ');
    const timePadded = `${s.durationMs}ms`.padStart(6, ' ');
    console.log(`  T${tierNum}  | ${namePadded} | ${testsPadded} | ${passPadded} | ${failPadded} | ${timePadded}`);
  }

  console.log('------|--------------------------------------|-------|------|------|--------');
  const grandTotal = String(globalTotal).padStart(5, ' ');
  const grandPass = String(globalPassed).padStart(4, ' ');
  const grandFail = String(globalFailed).padStart(4, ' ');
  const grandTime = `${globalDuration}ms`.padStart(6, ' ');
  console.log(` TOTAL| All Active Tiers Combined             | ${grandTotal} | ${grandPass} | ${grandFail} | ${grandTime}`);
  console.log('================================================================\n');

  if (globalFailed > 0) {
    console.error(`\x1b[31m✖ TEST SUITE FAILED: ${globalFailed} failure(s) recorded.\x1b[0m\n`);
    for (const f of allFailures) {
      console.error(`  - ${f.testName}: ${f.error.message}`);
    }
    process.exit(1);
  } else {
    console.log(`\x1b[32m✔ TEST SUITE PASSED: 100% (${globalPassed}/${globalTotal}) tests successful!\x1b[0m\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Unhandled test runner error:', err);
  process.exit(1);
});

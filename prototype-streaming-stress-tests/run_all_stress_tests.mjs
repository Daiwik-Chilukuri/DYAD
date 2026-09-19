#!/usr/bin/env node
/**
 * Master Empirical Stress-Testing Harness for Challenger 2
 * Runs:
 * 1. Payload stress suite (empty coordinates, missing fields, zero budget, unicode strings, rapid requests)
 * 2. SSE wire format & UTF-8 compliance suite (chunk boundaries, ₹, Kannada, delimiters)
 * 3. AuthorityDossier schema & range validation suite (0-100 scores, >=0 population, etc.)
 * 4. Route handler timeout, abortion & deterministic fallback recovery suite
 */

import { runPayloadStressSuite } from './harness_payload_stress.mjs';
import { runSSEWireComplianceSuite } from './harness_sse_wire.mjs';
import { runDossierRangesSuite } from './harness_dossier_ranges.mjs';
import { runAbortionTimeoutSuite } from './harness_abortion_timeout.mjs';

async function main() {
  console.log('================================================================');
  console.log('       CHALLENGER 2: EMPIRICAL BACKEND STREAMING STRESS HARNESS ');
  console.log('================================================================\n');

  const startTime = Date.now();
  const summary = {
    totalSuites: 4,
    passedSuites: 0,
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    failures: [],
  };

  try {
    // Suite 1
    const res1 = await runPayloadStressSuite();
    summary.totalChecks += res1.total;
    summary.passedChecks += res1.passed;
    summary.failedChecks += (res1.total - res1.passed);
    if (res1.passed === res1.total) summary.passedSuites++;
    for (const r of res1.results) {
      if (!r.pass) summary.failures.push({ suite: 'Payload Stress', test: r.name });
    }

    // Suite 2
    const res2 = await runSSEWireComplianceSuite();
    summary.totalChecks += res2.total;
    summary.passedChecks += res2.passed;
    summary.failedChecks += (res2.total - res2.passed);
    if (res2.passed === res2.total) summary.passedSuites++;
    for (const r of res2.results) {
      if (!r.pass) summary.failures.push({ suite: 'SSE Wire & UTF-8', test: r.name });
    }

    // Suite 3
    const res3 = await runDossierRangesSuite();
    summary.totalChecks += res3.total;
    summary.passedChecks += res3.passed;
    summary.failedChecks += (res3.total - res3.passed);
    if (res3.passed === res3.total) summary.passedSuites++;
    for (const r of res3.results) {
      if (!r.pass) summary.failures.push({ suite: 'Dossier Schema & Ranges', test: r.name });
    }

    // Suite 4
    const res4 = await runAbortionTimeoutSuite();
    summary.totalChecks += res4.total;
    summary.passedChecks += res4.passed;
    summary.failedChecks += (res4.total - res4.passed);
    if (res4.passed === res4.total) summary.passedSuites++;
    for (const r of res4.results) {
      if (!r.pass) summary.failures.push({ suite: 'Abortion & Fallback', test: r.name });
    }

    const elapsedTotal = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('================================================================');
    console.log('                   MASTER EMPIRICAL SCORECARD                   ');
    console.log('================================================================');
    console.log(` Suites Passed: ${summary.passedSuites} / ${summary.totalSuites}`);
    console.log(` Total Checks:  ${summary.totalChecks}`);
    console.log(` Passed Checks: ${summary.passedChecks}`);
    console.log(` Failed Checks: ${summary.failedChecks}`);
    console.log(` Total Time:    ${elapsedTotal}s`);
    console.log('================================================================\n');

    if (summary.failedChecks > 0) {
      console.error('FAILURES RECORDED:');
      for (const f of summary.failures) {
        console.error(`  - [${f.suite}] ${f.test}`);
      }
      process.exit(1);
    } else {
      console.log('ALL EMPIRICAL STRESS TESTS PASSED WITH 100% INTEGRITY.');
      process.exit(0);
    }
  } catch (err) {
    console.error('Unexpected harness failure:', err);
    process.exit(1);
  }
}

main();

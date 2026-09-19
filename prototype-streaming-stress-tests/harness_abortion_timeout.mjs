/**
 * Stress-Test Harness 4: Route Handler Timeout & Abortion Handling
 * Tests:
 * - Abortion handling: When client aborts request via AbortSignal, verifies child process terminates cleanly
 * - Process cleanup on Windows: Verifies no orphaned python.exe bridge processes left running
 * - Graceful deterministic fallback recovery under network / API failures
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUNNER_SCRIPT = path.resolve(__dirname, '../prototype-modal-cloud-orchestrator/run_stream_bridge.py');

/**
 * Checks if a PID is currently alive on Windows
 */
function isPidAlive(pid) {
  try {
    // On Windows, process.kill(pid, 0) checks existence
    return process.kill(pid, 0);
  } catch (e) {
    return e.code === 'EPERM'; // If EPERM, process exists but we lack permission; ESRCH means dead
  }
}

export async function testAbortionHandling() {
  console.log('Test 4.1: Empirical Client AbortSignal & Child Process Termination');

  const payload = {
    origin: { name: 'Silk Board', coordinates: [77.6245, 12.9176] },
    destination: { name: 'Bellandur', coordinates: [77.6890, 12.9230] },
    catchment_radius_meters: 1500,
  };

  const child = spawn('python', ['-u', RUNNER_SCRIPT], {
    cwd: path.dirname(RUNNER_SCRIPT),
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      PYTHONIOENCODING: 'utf-8',
      OPENAI_API_KEY: 'sk-test-fallback',
    },
  });

  const pid = child.pid;
  console.log(`  Spawned child python process PID: ${pid}`);

  child.stdin.write(JSON.stringify(payload));
  child.stdin.end();

  let firstEventReceived = false;
  let receivedData = '';

  await new Promise((resolve) => {
    child.stdout.on('data', (d) => {
      receivedData += d.toString('utf-8');
      if (receivedData.includes('event:') && !firstEventReceived) {
        firstEventReceived = true;
        console.log('  First SSE event detected on stdout. Simulating client abort signal now...');
        // Emulate route handler abort listener: child.kill('SIGTERM')
        try {
          child.kill('SIGTERM');
        } catch (e) {
          console.error('  child.kill error:', e);
        }
        resolve();
      }
    });

    child.on('close', () => resolve());
    child.on('error', () => resolve());
  });

  // Give Windows 1.5 seconds to clean up the process
  await new Promise((r) => setTimeout(r, 1500));

  const isStillAlive = isPidAlive(pid);
  const pass = !isStillAlive;
  console.log(`  Child PID ${pid} alive after abort kill: ${isStillAlive} -> ${pass ? 'PASS (Clean Termination)' : 'FAIL (Process Leaked)'}`);

  return { pass, pid, isStillAlive };
}

export async function testDeterministicFallbackRecovery() {
  console.log('\nTest 4.2: Graceful Recovery via Deterministic Fallback under Error Conditions');

  const payload = {
    origin: { name: 'Majestic Metro', coordinates: [77.5713, 12.9756] },
    destination: { name: 'Electronic City Phase 1', coordinates: [77.6698, 12.8452] },
    catchment_radius_meters: 2000,
  };

  // Run with deliberately broken API key and invalid modal token
  const t0 = Date.now();
  const child = spawn('python', ['-u', RUNNER_SCRIPT], {
    cwd: path.dirname(RUNNER_SCRIPT),
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      PYTHONIOENCODING: 'utf-8',
      OPENAI_API_KEY: 'sk-completely-invalid-key-for-stress-test',
      MODAL_TOKEN_ID: 'invalid_modal_token',
      MODAL_TOKEN_SECRET: 'invalid_modal_secret',
    },
  });

  let rawStdout = '';
  let rawStderr = '';

  child.stdin.write(JSON.stringify(payload));
  child.stdin.end();

  child.stdout.on('data', (d) => { rawStdout += d.toString('utf-8'); });
  child.stderr.on('data', (d) => { rawStderr += d.toString('utf-8'); });

  const exitCode = await new Promise((resolve) => {
    child.on('close', (c) => resolve(c));
    child.on('error', () => resolve(-1));
  });

  const durationMs = Date.now() - t0;
  console.log(`  Child exited with code ${exitCode} in ${durationMs}ms`);

  const events = [];
  const blocks = rawStdout.split(/\r?\n\r?\n/);
  for (const block of blocks) {
    if (!block.trim()) continue;
    const lines = block.split(/\r?\n/);
    let type = '';
    let data = null;
    for (const l of lines) {
      if (l.startsWith('event:')) type = l.slice(6).trim();
      if (l.startsWith('data:')) {
        try { data = JSON.parse(l.slice(5).trim()); } catch {}
      }
    }
    if (type && data) events.push({ type, data });
  }

  const types = events.map(e => e.type);
  console.log(`  Emitted lifecycle events: [${types.join(', ')}]`);

  const hasPlan = types.includes('plan_initiated');
  const hasTelemetry = types.includes('telemetry');
  const hasSubagents = types.includes('subagents_spawned');
  const hasVisualizer = types.includes('visualizer_features');
  const hasDossier = types.includes('dossier');
  const hasDone = types.includes('done');

  let dossierValid = false;
  const dossierEv = events.find(e => e.type === 'dossier');
  if (dossierEv && dossierEv.data) {
    const payload = dossierEv.data.payload || dossierEv.data.dossier;
    if (payload && payload.overall_viability_score >= 0 && payload.overall_viability_score <= 100) {
      dossierValid = true;
      console.log(`  Fallback Viability Score: ${payload.overall_viability_score}/100`);
      console.log(`  Fallback Demographic Pop: ${payload.demographics?.catchment_population_500m?.toLocaleString()}`);
    }
  }

  const pass = exitCode === 0 && hasPlan && hasTelemetry && hasSubagents && hasVisualizer && hasDossier && hasDone && dossierValid;
  console.log(`  Deterministic Fallback Recovery: ${pass ? 'PASS' : 'FAIL'}`);

  return { pass, exitCode, durationMs, types, dossierValid };
}

export async function runAbortionTimeoutSuite() {
  console.log('=== SUITE 4: ROUTE HANDLER ABORTION & DETERMINISTIC FALLBACK ===\n');
  const results = [];

  const abortRes = await testAbortionHandling();
  results.push({ name: 'Client AbortSignal child process clean termination', pass: abortRes.pass });

  const fallbackRes = await testDeterministicFallbackRecovery();
  results.push({ name: 'Deterministic fallback recovery under API/Modal failure', pass: fallbackRes.pass });

  console.log('\n--- ABORTION & FALLBACK SUITE SUMMARY ---');
  let passCount = 0;
  for (const r of results) {
    if (r.pass) passCount++;
    console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.name}`);
  }
  console.log(`Total: ${passCount}/${results.length} passed.\n`);
  return { results, total: results.length, passed: passCount };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAbortionTimeoutSuite().catch(console.error);
}

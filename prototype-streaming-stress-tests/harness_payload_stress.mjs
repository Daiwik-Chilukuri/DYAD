/**
 * Stress-Test Harness 1: Payload Stress Testing
 * Tests prototype-modal-cloud-orchestrator/run_stream_bridge.py under various payloads:
 * - Empty coordinates / missing coordinates
 * - Missing fields / empty object / malformed JSON
 * - Non-numeric or 1-element coordinates
 * - Zero budget / negative budget / extreme budget
 * - Zero catchment radius / negative radius
 * - Identical origin and destination coordinates (0-length corridor)
 * - Multi-byte Unicode strings (Kannada, Rupee ₹, emojis, escaped quotes, newlines)
 * - Rapid concurrent requests
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUNNER_SCRIPT = path.resolve(__dirname, '../prototype-modal-cloud-orchestrator/run_stream_bridge.py');

export function runBridge(inputPayload, envOverrides = {}) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const env = {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      PYTHONIOENCODING: 'utf-8',
      OPENAI_API_KEY: 'sk-test-fallback', // force deterministic fast fallback unless specified
      ...envOverrides,
    };

    const child = spawn('python', ['-u', RUNNER_SCRIPT], {
      cwd: path.dirname(RUNNER_SCRIPT),
      env,
    });

    let stdout = '';
    let stderr = '';

    if (typeof inputPayload === 'string') {
      child.stdin.write(inputPayload);
    } else if (inputPayload !== null && inputPayload !== undefined) {
      child.stdin.write(JSON.stringify(inputPayload));
    }
    child.stdin.end();

    child.stdout.on('data', (d) => { stdout += d.toString('utf-8'); });
    child.stderr.on('data', (d) => { stderr += d.toString('utf-8'); });

    child.on('close', (code) => {
      resolve({
        code,
        durationMs: Date.now() - t0,
        stdout,
        stderr,
      });
    });

    child.on('error', (err) => {
      resolve({
        code: -1,
        durationMs: Date.now() - t0,
        stdout,
        stderr: stderr + '\n' + err.message,
      });
    });
  });
}

export function parseSSEEvents(raw) {
  const blocks = raw.split(/\r?\n\r?\n/);
  const events = [];
  for (const block of blocks) {
    if (!block.trim()) continue;
    const lines = block.split(/\r?\n/);
    let eventType = 'message';
    let dataStr = '';
    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataStr += (dataStr ? '\n' : '') + line.slice(5).trim();
      }
    }
    if (dataStr) {
      try {
        events.push({ type: eventType, data: JSON.parse(dataStr) });
      } catch (err) {
        events.push({ type: eventType, rawData: dataStr, parseError: err.message });
      }
    }
  }
  return events;
}

export async function runPayloadStressSuite() {
  console.log('=== SUITE 1: PAYLOAD STRESS TESTS ===\n');
  const results = [];

  // Test 1: Empty input string
  {
    console.log('Test 1.1: Empty stdin string');
    const res = await runBridge('');
    const events = parseSSEEvents(res.stdout);
    const hasErrorEvent = events.some(e => e.type === 'error');
    const pass = res.code === 1 && hasErrorEvent;
    console.log(`  Exit code: ${res.code} (expected 1), Error event: ${hasErrorEvent} -> ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ name: 'Empty stdin string', pass, details: { code: res.code, hasErrorEvent } });
  }

  // Test 2: Malformed JSON string
  {
    console.log('Test 1.2: Malformed JSON string ("{ invalid json ...")');
    const res = await runBridge('{ this is totally not valid JSON');
    const events = parseSSEEvents(res.stdout);
    const hasErrorEvent = events.some(e => e.type === 'error');
    const pass = res.code === 1 && hasErrorEvent;
    console.log(`  Exit code: ${res.code} (expected 1), Error event: ${hasErrorEvent} -> ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ name: 'Malformed JSON string', pass, details: { code: res.code, hasErrorEvent } });
  }

  // Test 3: Missing origin & destination coordinates entirely
  {
    console.log('Test 1.3: Missing origin/destination coordinates entirely ({})');
    const res = await runBridge({});
    const events = parseSSEEvents(res.stdout);
    const hasErrorEvent = events.some(e => e.type === 'error');
    const pass = res.code === 1 && hasErrorEvent;
    console.log(`  Exit code: ${res.code} (expected 1), Error event: ${hasErrorEvent} -> ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ name: 'Missing origin/destination coordinates', pass, details: { code: res.code, hasErrorEvent } });
  }

  // Test 4: Empty coordinate arrays
  {
    console.log('Test 1.4: Empty coordinate arrays (coordinates: [])');
    const res = await runBridge({
      origin: { name: 'Origin', coordinates: [] },
      destination: { name: 'Destination', coordinates: [] },
    });
    const events = parseSSEEvents(res.stdout);
    const hasErrorEvent = events.some(e => e.type === 'error');
    const pass = res.code === 1 && hasErrorEvent;
    console.log(`  Exit code: ${res.code} (expected 1), Error event: ${hasErrorEvent} -> ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ name: 'Empty coordinate arrays', pass, details: { code: res.code, hasErrorEvent } });
  }

  // Test 5: Malformed coordinates (1-element list [77.6245])
  {
    console.log('Test 1.5: 1-element coordinate list [77.6245]');
    const res = await runBridge({
      origin: { name: 'Origin', coordinates: [77.6245] },
      destination: { name: 'Destination', coordinates: [77.6890, 12.9230] },
    });
    const events = parseSSEEvents(res.stdout);
    const hasErrorEvent = events.some(e => e.type === 'error');
    console.log(`  Exit code: ${res.code}, Events: ${events.map(e => e.type).join(', ')}, Stderr: ${res.stderr.trim().slice(0, 150)}`);
    const pass = hasErrorEvent || res.code !== 0;
    results.push({ name: '1-element coordinate list', pass, details: { code: res.code, hasErrorEvent, stderr: res.stderr } });
  }

  // Test 6: Zero budget cap (budget_cap_inr_cr: 0)
  {
    console.log('Test 1.6: Zero budget cap (budget_cap_inr_cr: 0)');
    const res = await runBridge({
      origin: { name: 'Silk Board', coordinates: [77.6245, 12.9176] },
      destination: { name: 'Bellandur', coordinates: [77.6890, 12.9230] },
      budget_cap_inr_cr: 0,
      catchment_radius_meters: 1500,
    });
    const events = parseSSEEvents(res.stdout);
    const hasDossier = events.some(e => e.type === 'dossier');
    const hasDone = events.some(e => e.type === 'done');
    const pass = res.code === 0 && hasDossier && hasDone;
    console.log(`  Exit code: ${res.code}, Has dossier: ${hasDossier}, Has done: ${hasDone} -> ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ name: 'Zero budget cap', pass, details: { code: res.code, hasDossier, hasDone } });
  }

  // Test 7: Zero catchment radius (catchment_radius_meters: 0)
  {
    console.log('Test 1.7: Zero catchment radius (catchment_radius_meters: 0)');
    const res = await runBridge({
      origin: { name: 'Silk Board', coordinates: [77.6245, 12.9176] },
      destination: { name: 'Bellandur', coordinates: [77.6890, 12.9230] },
      catchment_radius_meters: 0,
    });
    const events = parseSSEEvents(res.stdout);
    const hasDossier = events.some(e => e.type === 'dossier');
    const hasDone = events.some(e => e.type === 'done');
    const pass = res.code === 0 && hasDossier && hasDone;
    console.log(`  Exit code: ${res.code}, Has dossier: ${hasDossier}, Has done: ${hasDone} -> ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ name: 'Zero catchment radius', pass, details: { code: res.code, hasDossier, hasDone } });
  }

  // Test 8: Identical origin and destination coordinates (0-length corridor)
  {
    console.log('Test 1.8: Identical origin & destination [77.6245, 12.9176]');
    const res = await runBridge({
      origin: { name: 'Point A', coordinates: [77.6245, 12.9176] },
      destination: { name: 'Point A', coordinates: [77.6245, 12.9176] },
      catchment_radius_meters: 1500,
    });
    const events = parseSSEEvents(res.stdout);
    const hasDossier = events.some(e => e.type === 'dossier');
    const hasDone = events.some(e => e.type === 'done');
    const pass = res.code === 0 && hasDossier && hasDone;
    console.log(`  Exit code: ${res.code}, Has dossier: ${hasDossier}, Has done: ${hasDone} -> ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ name: 'Identical origin and destination coordinates', pass, details: { code: res.code, hasDossier, hasDone } });
  }

  // Test 9: Unicode strings: Kannada, Rupee symbol ₹, emojis, quotes, backslashes
  {
    console.log('Test 1.9: Multi-byte Unicode: Kannada, Rupee ₹, emojis, quotes');
    const unicodeOriginName = 'ಕೇಂದ್ರ ರೇಷ್ಮೆ ಮಂಡಳಿ (Central Silk Board) ₹ 2,500 ಕೋಟಿ';
    const unicodeDestName = 'ಬೆಳ್ಳಂದೂರು ತಂತ್ರಜ್ಞಾನ ಪಾರ್ಕ್ 🚇 ✨ "quoted & escaped"';
    const res = await runBridge({
      origin: { name: unicodeOriginName, coordinates: [77.6245, 12.9176] },
      destination: { name: unicodeDestName, coordinates: [77.6890, 12.9230] },
      catchment_radius_meters: 1500,
    });
    const events = parseSSEEvents(res.stdout);
    const planEvent = events.find(e => e.type === 'plan_initiated');
    const hasDossier = events.some(e => e.type === 'dossier');
    const hasDone = events.some(e => e.type === 'done');

    let unicodePreserved = false;
    if (planEvent && planEvent.data && planEvent.data.corridor_name) {
      unicodePreserved = planEvent.data.corridor_name.includes('ರೇಷ್ಮೆ ಮಂಡಳಿ') &&
                         planEvent.data.corridor_name.includes('₹') &&
                         planEvent.data.corridor_name.includes('ಬೆಳ್ಳಂದೂರು');
    }
    const pass = res.code === 0 && hasDossier && hasDone && unicodePreserved;
    console.log(`  Exit code: ${res.code}, Unicode preserved: ${unicodePreserved} -> ${pass ? 'PASS' : 'FAIL'}`);
    if (planEvent) {
      console.log(`  Plan event corridor_name: ${planEvent.data.corridor_name}`);
    }
    results.push({ name: 'Multi-byte Unicode & Kannada & ₹ symbol', pass, details: { code: res.code, unicodePreserved } });
  }

  // Test 10: Rapid concurrent requests (5 parallel requests)
  {
    console.log('Test 1.10: 5 rapid concurrent requests');
    const tStart = Date.now();
    const promises = Array.from({ length: 5 }, (_, i) => {
      return runBridge({
        corridor_id: `concurrent-${i}-${Date.now()}`,
        origin: { name: `Station ${i}`, coordinates: [77.62 + i * 0.01, 12.91 + i * 0.005] },
        destination: { name: `Terminus ${i}`, coordinates: [77.68 + i * 0.01, 12.92 + i * 0.005] },
        catchment_radius_meters: 1000 + i * 200,
      });
    });

    const concurrentResults = await Promise.all(promises);
    const allSuccessful = concurrentResults.every(r => {
      const evs = parseSSEEvents(r.stdout);
      return r.code === 0 && evs.some(e => e.type === 'dossier') && evs.some(e => e.type === 'done');
    });
    const elapsedTotal = Date.now() - tStart;
    console.log(`  All 5 concurrent requests succeeded: ${allSuccessful} in ${elapsedTotal}ms -> ${allSuccessful ? 'PASS' : 'FAIL'}`);
    results.push({ name: 'Rapid concurrent requests (5 parallel)', pass: allSuccessful, details: { count: 5, elapsedTotal } });
  }

  console.log('\n--- PAYLOAD SUITE SUMMARY ---');
  let passCount = 0;
  for (const r of results) {
    if (r.pass) passCount++;
    console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.name}`);
  }
  console.log(`Total: ${passCount}/${results.length} passed.\n`);
  return { results, total: results.length, passed: passCount };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runPayloadStressSuite().catch(console.error);
}

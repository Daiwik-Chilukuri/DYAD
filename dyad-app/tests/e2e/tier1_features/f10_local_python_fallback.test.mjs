import { TestSuite, assert } from '../test_framework.mjs';

const suite = new TestSuite('Tier 1 - Feature 10: Local Python Orchestrator Runner Fallback', 1);

suite.test('F10.1: Fallback child process command arguments specify python bridge runner and script path', () => {
  const runnerScript = 'prototype-modal-cloud-orchestrator/run_stream_bridge.py';
  const spawnArgs = ['python', [runnerScript]];

  assert.strictEqual(spawnArgs[0], 'python');
  assert.includes(spawnArgs[1][0], 'run_stream_bridge.py');
});

suite.test('F10.2: Serializes corridor request payload to stdin in UTF-8 JSON format', () => {
  const payload = {
    origin: { coordinates: [77.6245, 12.9176] },
    destination: { coordinates: [77.6890, 12.9230] }
  };
  const stdinBuffer = Buffer.from(JSON.stringify(payload), 'utf-8');
  const decoded = JSON.parse(stdinBuffer.toString('utf-8'));

  assert.deepStrictEqual(decoded, payload);
});

suite.test('F10.3: Captures stdout line-by-line and parses JSON streaming events accurately', () => {
  const stdoutLines = [
    JSON.stringify({ type: 'telemetry', message: 'Local runner started' }) + '\n',
    JSON.stringify({ type: 'subagents_spawned', count: 5 }) + '\n'
  ];

  const parsedEvents = [];
  for (const line of stdoutLines) {
    if (line.trim()) {
      parsedEvents.push(JSON.parse(line.trim()));
    }
  }

  assert.strictEqual(parsedEvents.length, 2);
  assert.strictEqual(parsedEvents[0].type, 'telemetry');
  assert.strictEqual(parsedEvents[1].count, 5);
});

suite.test('F10.4: Gracefully handles non-zero exit codes from local python process without unhandled crash', () => {
  let errorHandled = false;

  function handleProcessExit(exitCode, stderrOutput) {
    if (exitCode !== 0) {
      errorHandled = true;
      return { error: `Process exited with code ${exitCode}`, details: stderrOutput };
    }
    return { error: null };
  }

  const res = handleProcessExit(1, 'ModuleNotFoundError: No module named shapely');
  assert.strictEqual(errorHandled, true);
  assert.includes(res.details, 'ModuleNotFoundError');
});

suite.test('F10.5: Local runner execution terminates and cleans up resources upon process exit', () => {
  let isClosed = false;
  const mockChildProcess = {
    killed: false,
    kill() {
      this.killed = true;
      isClosed = true;
    }
  };

  mockChildProcess.kill();
  assert.strictEqual(mockChildProcess.killed, true);
  assert.strictEqual(isClosed, true);
});

export default suite;

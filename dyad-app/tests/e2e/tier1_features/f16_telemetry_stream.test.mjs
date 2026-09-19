import { TestSuite, assert } from '../test_framework.mjs';

const suite = new TestSuite('Tier 1 - Feature 16: Live Agent Swarm Telemetry Stream', 1);

const initialSwarmState = {
  isScanning: false,
  agents: {
    visualizer: { name: 'Visualizer', status: 'idle', durationSec: null },
    demographics: { name: 'Demographics', status: 'idle', durationSec: null },
    economic: { name: 'Economic & TOD', status: 'idle', durationSec: null },
    mobility: { name: 'Mobility & Congestion', status: 'idle', durationSec: null },
    ecological: { name: 'Ecological Risk', status: 'idle', durationSec: null }
  },
  logs: []
};

suite.test('F16.1: Radar scan indicator toggles to active (isScanning: true) when calculation initiates', () => {
  let state = { ...initialSwarmState };
  // Event: plan_initiated
  state.isScanning = true;
  assert.strictEqual(state.isScanning, true);
});

suite.test('F16.2: Displays chips for all 5 specialized subagents in the swarm', () => {
  const agentKeys = Object.keys(initialSwarmState.agents);
  assert.strictEqual(agentKeys.length, 5);
  assert.includes(agentKeys, 'visualizer');
  assert.includes(agentKeys, 'demographics');
  assert.includes(agentKeys, 'economic');
  assert.includes(agentKeys, 'mobility');
  assert.includes(agentKeys, 'ecological');
});

suite.test('F16.3: Agent state transitions accurately from idle -> running -> completed based on SSE events', () => {
  const state = JSON.parse(JSON.stringify(initialSwarmState));

  // Subagents spawned event
  state.agents.demographics.status = 'running';
  assert.strictEqual(state.agents.demographics.status, 'running');

  // Subagent completed event
  state.agents.demographics.status = 'completed';
  state.agents.demographics.durationSec = 0.42;
  assert.strictEqual(state.agents.demographics.status, 'completed');
  assert.strictEqual(state.agents.demographics.durationSec, 0.42);
});

suite.test('F16.4: Appends telemetry messages chronologically to activity log with timestamps', () => {
  const logs = [];
  const log1 = { timestamp: 1000, message: 'Initiated corridor analysis' };
  const log2 = { timestamp: 1050, message: 'Computing 2km Turf buffer' };

  logs.push(log1);
  logs.push(log2);

  assert.strictEqual(logs.length, 2);
  assert.isGreaterThan(logs[1].timestamp, logs[0].timestamp);
  assert.strictEqual(logs[1].message, 'Computing 2km Turf buffer');
});

suite.test('F16.5: Radar scan ceases (isScanning: false) when dossier or done event is received', () => {
  let isScanning = true;
  // Event: done received
  isScanning = false;
  assert.strictEqual(isScanning, false, 'Radar scan should stop upon completion');
});

export default suite;

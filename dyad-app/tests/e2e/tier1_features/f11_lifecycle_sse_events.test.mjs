import { TestSuite, assert } from '../test_framework.mjs';
import { generateStandardCorridorLifecycleEvents, parseSSEText, createMockSSEStream } from '../fixtures/sse_mock_stream.mjs';

const suite = new TestSuite('Tier 1 - Feature 11: Lifecycle SSE Event Streaming', 1);

const expectedEventTypes = [
  'plan_initiated',
  'telemetry',
  'subagents_spawned',
  'visualizer_features',
  'subagent_completed',
  'dossier',
  'done'
];

suite.test('F11.1: Emits all 7 canonical SSE lifecycle event types in complete corridor evaluation run', () => {
  const events = generateStandardCorridorLifecycleEvents();
  const eventTypes = events.map(e => e.type);

  for (const exp of expectedEventTypes) {
    assert.includes(eventTypes, exp, `Missing lifecycle event type: ${exp}`);
  }
});

suite.test('F11.2: Validates plan_initiated event contract (corridor_id, corridor_name, timestamp)', () => {
  const events = generateStandardCorridorLifecycleEvents('test-id', 'Bellandur Spur');
  const planInit = events.find(e => e.type === 'plan_initiated');

  assert.ok(planInit);
  assert.strictEqual(planInit.corridor_id, 'test-id');
  assert.strictEqual(planInit.corridor_name, 'Bellandur Spur');
  assert.isGreaterThan(planInit.timestamp, 0);
});

suite.test('F11.3: Validates subagents_spawned event lists all 5 domain specialists', () => {
  const events = generateStandardCorridorLifecycleEvents();
  const subagentsEvent = events.find(e => e.type === 'subagents_spawned');

  assert.ok(subagentsEvent);
  assert.strictEqual(subagentsEvent.count, 5);
  assert.ok(subagentsEvent.subagents.some(s => s.toLowerCase().includes('visualizer')));
  assert.ok(subagentsEvent.subagents.some(s => s.toLowerCase().includes('demographics')));
  assert.ok(subagentsEvent.subagents.some(s => s.toLowerCase().includes('economic')));
  assert.ok(subagentsEvent.subagents.some(s => s.toLowerCase().includes('mobility')));
  assert.ok(subagentsEvent.subagents.some(s => s.toLowerCase().includes('ecological')));
});

suite.test('F11.4: Validates visualizer_features event carries valid GeoJSON FeatureCollection', () => {
  const events = generateStandardCorridorLifecycleEvents();
  const visEvent = events.find(e => e.type === 'visualizer_features');

  assert.ok(visEvent);
  assert.isGeoJSON(visEvent.geojson, 'FeatureCollection');
  assert.isGreaterThan(visEvent.features_count, 0);
});

suite.test('F11.5: Validates round-trip SSE chunking, serialization and deserialization fidelity', () => {
  const originalEvents = generateStandardCorridorLifecycleEvents();
  const rawSSE = createMockSSEStream(originalEvents);
  const parsed = parseSSEText(rawSSE);

  assert.strictEqual(parsed.length, originalEvents.length);
  for (let i = 0; i < originalEvents.length; i++) {
    assert.strictEqual(parsed[i].type, originalEvents[i].type);
  }
});

export default suite;

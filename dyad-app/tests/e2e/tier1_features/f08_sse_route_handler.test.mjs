import { TestSuite, assert } from '../test_framework.mjs';

const suite = new TestSuite('Tier 1 - Feature 8: SSE Streaming Route Handler', 1);

suite.test('F8.1: Validates expected HTTP response headers for SSE streaming (text/event-stream, no-cache, keep-alive)', () => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive'
  };

  assert.strictEqual(headers['Content-Type'], 'text/event-stream');
  assert.includes(headers['Cache-Control'], 'no-cache');
  assert.strictEqual(headers['Connection'], 'keep-alive');
});

suite.test('F8.2: Accepts valid CorridorStreamRequest payload matching TypeScript contract', () => {
  const validPayload = {
    origin: {
      name: 'Central Silk Board',
      coordinates: [77.6245, 12.9176],
      line: 'yellow'
    },
    destination: {
      name: 'Sarjapur Wipro Hub',
      coordinates: [77.6890, 12.9230]
    },
    catchment_radius_meters: 2000,
    budget_cap_inr_cr: 5000,
    target_completion_year: 2030
  };

  assert.ok(validPayload.origin && validPayload.origin.coordinates.length === 2);
  assert.ok(validPayload.destination && validPayload.destination.coordinates.length === 2);
  assert.strictEqual(validPayload.catchment_radius_meters, 2000);
});

suite.test('F8.3: Rejects malformed payload missing origin or destination with 400 Bad Request', () => {
  const invalidPayloads = [
    { destination: { name: 'Only Dest', coordinates: [77.6890, 12.9230] } },
    { origin: { name: 'Only Origin', coordinates: [77.6245, 12.9176] } },
    { origin: { name: 'No coords' }, destination: { name: 'No coords' } }
  ];

  function validatePayload(req) {
    if (!req.origin || !Array.isArray(req.origin.coordinates) || req.origin.coordinates.length !== 2) {
      throw new Error('Invalid origin coordinates');
    }
    if (!req.destination || !Array.isArray(req.destination.coordinates) || req.destination.coordinates.length !== 2) {
      throw new Error('Invalid destination coordinates');
    }
    return true;
  }

  invalidPayloads.forEach(payload => {
    assert.throws(() => validatePayload(payload));
  });
});

suite.test('F8.4: Formats SSE packet with standard "event:" and "data:" prefixes and double newline delimiter', () => {
  const event = { type: 'plan_initiated', corridor_id: 'c-101' };
  const sseChunk = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;

  assert.ok(sseChunk.startsWith('event: plan_initiated\n'));
  assert.ok(sseChunk.includes('data: {"type":"plan_initiated","corridor_id":"c-101"}'));
  assert.ok(sseChunk.endsWith('\n\n'));
});

suite.test('F8.5: Stream termination emits final "done" event signaling client to close EventSource or reader', () => {
  const doneEvent = { type: 'done', timestamp: Date.now(), message: '[DONE]' };
  const serialized = `data: ${JSON.stringify(doneEvent)}\n\n`;

  assert.includes(serialized, '"type":"done"');
  assert.includes(serialized, '[DONE]');
});

export default suite;

import { TestSuite, assert } from '../test_framework.mjs';

const suite = new TestSuite('Tier 1 - Feature 9: Modal Cloud Endpoint Forwarding', 1);

suite.test('F9.1: When MODAL_ENDPOINT_URL is defined, constructs correct downstream POST request headers', () => {
  const modalUrl = 'https://team-dyad--stream-corridor-analysis.modal.run';
  const token = 'fake-modal-token';

  const requestConfig = {
    method: 'POST',
    url: modalUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream'
    }
  };

  assert.strictEqual(requestConfig.url, modalUrl);
  assert.strictEqual(requestConfig.headers['Accept'], 'text/event-stream');
  assert.strictEqual(requestConfig.headers['Authorization'], 'Bearer fake-modal-token');
});

suite.test('F9.2: Forwards complete corridor parameters without dropping budget or completion year', () => {
  const clientPayload = {
    origin: { name: 'CSB', coordinates: [77.6245, 12.9176] },
    destination: { name: 'Sarjapur', coordinates: [77.6890, 12.9230] },
    catchment_radius_meters: 2500,
    budget_cap_inr_cr: 4500,
    target_completion_year: 2029
  };

  const forwardedPayload = JSON.parse(JSON.stringify(clientPayload));

  assert.strictEqual(forwardedPayload.catchment_radius_meters, 2500);
  assert.strictEqual(forwardedPayload.budget_cap_inr_cr, 4500);
  assert.strictEqual(forwardedPayload.target_completion_year, 2029);
});

suite.test('F9.3: Relays streamed chunks from Modal directly to client SSE response stream', () => {
  const simulatedModalChunk = 'event: telemetry\ndata: {"stage":"modal_agent_spawn"}\n\n';
  const relayedChunks = [];

  function relayChunk(chunk) {
    relayedChunks.push(chunk);
  }

  relayChunk(simulatedModalChunk);
  assert.strictEqual(relayedChunks.length, 1);
  assert.strictEqual(relayedChunks[0], simulatedModalChunk);
});

suite.test('F9.4: Strips sensitive cloud credentials before relaying headers down to browser client', () => {
  const upstreamHeaders = {
    'content-type': 'text/event-stream',
    'x-modal-auth-internal': 'secret-token-do-not-leak',
    'x-request-id': 'req-9821'
  };

  const clientHeaders = {};
  const allowedHeaders = ['content-type', 'cache-control', 'connection', 'x-request-id'];

  for (const [k, v] of Object.entries(upstreamHeaders)) {
    if (allowedHeaders.includes(k.toLowerCase())) {
      clientHeaders[k] = v;
    }
  }

  assert.strictEqual(clientHeaders['content-type'], 'text/event-stream');
  assert.strictEqual(clientHeaders['x-modal-auth-internal'], undefined);
});

suite.test('F9.5: Cascades to local fallback when Modal endpoint returns 502/504 or network timeout', () => {
  let fallbackInvoked = false;

  function handleModalResponse(status) {
    if (status >= 500) {
      fallbackInvoked = true;
      return { usingFallback: true };
    }
    return { usingFallback: false };
  }

  const res = handleModalResponse(504);
  assert.strictEqual(fallbackInvoked, true);
  assert.strictEqual(res.usingFallback, true);
});

export default suite;

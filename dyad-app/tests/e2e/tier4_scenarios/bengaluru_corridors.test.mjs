import { TestSuite, assert } from '../test_framework.mjs';
import * as turf from '@turf/turf';
import { REAL_WORLD_CORRIDORS } from '../fixtures/bengaluru_corridors.mjs';
import { generateStandardCorridorLifecycleEvents, createMockSSEStream, parseSSEText } from '../fixtures/sse_mock_stream.mjs';

const suite = new TestSuite('Tier 4 - Real-World Application Scenarios: Bengaluru Corridors', 4);

// Scenario 1: Silk Board -> Sarjapur Road Corridor
suite.test('S1: Silk Board to Sarjapur Corridor evaluation end-to-end', () => {
  const c = REAL_WORLD_CORRIDORS.SILK_BOARD_SARJAPUR;
  const line = turf.lineString([c.origin.coordinates, c.destination.coordinates]);
  const lengthKm = turf.length(line, { units: 'kilometers' });

  assert.isBetween(lengthKm, c.expectedLengthKmRange[0], c.expectedLengthKmRange[1]);

  const buffer = turf.buffer(line, c.defaultCatchmentMeters / 1000, { units: 'kilometers' });
  assert.isGeoJSON(buffer, 'Feature');

  // Simulate complete lifecycle stream
  const rawSSE = createMockSSEStream(generateStandardCorridorLifecycleEvents(c.id, c.name));
  const parsed = parseSSEText(rawSSE);
  const dossier = parsed.find(e => e.type === 'dossier').dossier;

  assert.strictEqual(dossier.corridor_id, c.id);
  assert.isGreaterThan(dossier.demographics.catchment_population_500m, c.expectedPillars.demographics.minPop500m);
  assert.isGreaterThan(dossier.economic.tech_parks_within_1km, 1);
  assert.isGreaterThan(dossier.mobility.peak_hour_travel_time_saved_minutes, 20);
  assert.strictEqual(dossier.ecological.ktfd_compliance_status, 'FLAGGED');
});

// Scenario 2: KR Puram -> Whitefield Extension
suite.test('S2: KR Puram to Whitefield Kadugodi Corridor evaluation end-to-end', () => {
  const c = REAL_WORLD_CORRIDORS.KR_PURAM_WHITEFIELD;
  const line = turf.lineString([c.origin.coordinates, c.destination.coordinates]);
  const lengthKm = turf.length(line, { units: 'kilometers' });

  assert.isBetween(lengthKm, c.expectedLengthKmRange[0], c.expectedLengthKmRange[1]);

  const buffer = turf.buffer(line, c.defaultCatchmentMeters / 1000, { units: 'kilometers' });
  assert.isGeoJSON(buffer, 'Feature');

  // Verify high tech park density along Whitefield
  const rawSSE = createMockSSEStream(generateStandardCorridorLifecycleEvents(c.id, c.name));
  const parsed = parseSSEText(rawSSE);
  const dossier = parsed.find(e => e.type === 'dossier').dossier;

  assert.isGreaterThan(dossier.economic.tech_parks_within_1km, 2);
  assert.isBetween(dossier.overall_viability_score, 70, 95);
});

// Scenario 3: Electronic City Phase 1 -> Bannerghatta Road Link
suite.test('S3: Electronic City to Bannerghatta Road Corridor evaluation end-to-end', () => {
  const c = REAL_WORLD_CORRIDORS.ECITY_BANNERGHATTA;
  const line = turf.lineString([c.origin.coordinates, c.destination.coordinates]);
  const lengthKm = turf.length(line, { units: 'kilometers' });

  assert.isBetween(lengthKm, c.expectedLengthKmRange[0], c.expectedLengthKmRange[1]);

  const buffer = turf.buffer(line, c.defaultCatchmentMeters / 1000, { units: 'kilometers' });
  assert.isGeoJSON(buffer, 'Feature');

  const rawSSE = createMockSSEStream(generateStandardCorridorLifecycleEvents(c.id, c.name));
  const parsed = parseSSEText(rawSSE);
  const dossier = parsed.find(e => e.type === 'dossier').dossier;

  assert.isGreaterThan(dossier.mobility.peak_hour_travel_time_saved_minutes, 20);
  assert.isGreaterThan(dossier.demographics.catchment_population_1500m, 40000);
});

// Scenario 4: Majestic -> Hebbal Flyover Core Spine
suite.test('S4: Majestic to Hebbal Flyover North Corridor evaluation end-to-end', () => {
  const c = REAL_WORLD_CORRIDORS.MAJESTIC_HEBBAL;
  const line = turf.lineString([c.origin.coordinates, c.destination.coordinates]);
  const lengthKm = turf.length(line, { units: 'kilometers' });

  assert.isBetween(lengthKm, c.expectedLengthKmRange[0], c.expectedLengthKmRange[1]);

  const buffer = turf.buffer(line, c.defaultCatchmentMeters / 1000, { units: 'kilometers' });
  assert.isGeoJSON(buffer, 'Feature');

  const rawSSE = createMockSSEStream(generateStandardCorridorLifecycleEvents(c.id, c.name));
  const parsed = parseSSEText(rawSSE);
  const dossier = parsed.find(e => e.type === 'dossier').dossier;

  // High central city density
  assert.isGreaterThan(dossier.demographics.catchment_population_1500m, 50000);
  assert.isGreaterThan(dossier.mobility.peak_hour_travel_time_saved_minutes, 20);
});

// Scenario 5: Outer Ring Road Line 3 (Bellandur -> Mahadevapura)
suite.test('S5: Outer Ring Road Line 3 (Bellandur to Mahadevapura) Corridor evaluation end-to-end', () => {
  const c = REAL_WORLD_CORRIDORS.ORR_LINE3_BELLANDUR_MAHADEVAPURA;
  const line = turf.lineString([c.origin.coordinates, c.destination.coordinates]);
  const lengthKm = turf.length(line, { units: 'kilometers' });

  assert.isBetween(lengthKm, c.expectedLengthKmRange[0], c.expectedLengthKmRange[1]);

  const buffer = turf.buffer(line, c.defaultCatchmentMeters / 1000, { units: 'kilometers' });
  assert.isGeoJSON(buffer, 'Feature');

  const rawSSE = createMockSSEStream(generateStandardCorridorLifecycleEvents(c.id, c.name));
  const parsed = parseSSEText(rawSSE);
  const dossier = parsed.find(e => e.type === 'dossier').dossier;

  // Highest tech park and transit demand corridor in Bengaluru
  assert.isGreaterThan(dossier.economic.tech_parks_within_1km, 2);
  assert.isGreaterThan(dossier.mobility.arterial_congestion_reduction_pct, 20);
  assert.isGreaterThan(dossier.overall_viability_score, 75);
});

export default suite;

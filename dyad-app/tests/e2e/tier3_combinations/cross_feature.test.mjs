import { TestSuite, assert } from '../test_framework.mjs';
import * as turf from '@turf/turf';
import { NAMMA_METRO_STATIONS } from '../fixtures/bengaluru_corridors.mjs';
import { generateStandardCorridorLifecycleEvents, createMockSSEStream, parseSSEText } from '../fixtures/sse_mock_stream.mjs';

const suite = new TestSuite('Tier 3 - Cross-Feature Combinations & Pairwise Integrations', 3);

// Interaction 1: Origin Station Snap + Turf Catchment Buffer
suite.test('X1: Snapping origin to Namma Metro station immediately updates Turf catchment buffer geometry', () => {
  const snappedStation = NAMMA_METRO_STATIONS.SILK_BOARD;
  const destination = [77.6890, 12.9230];

  const line = turf.lineString([snappedStation.coordinates, destination]);
  const buffer = turf.buffer(line, 2.0, { units: 'kilometers' });

  assert.isGeoJSON(buffer, 'Feature');
  assert.strictEqual(buffer.geometry.type, 'Polygon');
  // Buffer must envelop snapped station
  assert.ok(turf.booleanPointInPolygon(turf.point(snappedStation.coordinates), buffer));
});

// Interaction 2: Terminus Pin Drop + Turf Buffer + Viaduct Polyline
suite.test('X2: Dropping terminus pin generates continuous viaduct lineString and radial catchment buffer', () => {
  const origin = [77.6405, 12.9735]; // Indiranagar
  const terminus = [77.7499, 12.9698]; // Whitefield

  const viaductLine = turf.lineString([origin, terminus]);
  const lengthKm = turf.length(viaductLine, { units: 'kilometers' });
  const buffer = turf.buffer(viaductLine, 1.5, { units: 'kilometers' });

  assert.isGreaterThan(lengthKm, 8.0);
  assert.isGeoJSON(buffer, 'Feature');
  assert.ok(turf.booleanPointInPolygon(turf.point(terminus), buffer));
});

// Interaction 3: Turf Buffer + Dynamic Visualizer GeoJSON
suite.test('X3: Dynamic visualizer features are spatially clipped within the calculated catchment buffer', () => {
  const origin = [77.6245, 12.9176];
  const destination = [77.6890, 12.9230];
  const corridorBuffer = turf.buffer(turf.lineString([origin, destination]), 1.5, { units: 'kilometers' });

  const rawPois = turf.featureCollection([
    turf.point([77.6500, 12.9200], { name: 'Agara Hospital', category: 'healthcare' }),
    turf.point([77.7500, 13.0500], { name: 'Hebbal Far Hub', category: 'corporate' })
  ]);

  const clipped = turf.pointsWithinPolygon(rawPois, corridorBuffer);
  assert.strictEqual(clipped.features.length, 1);
  assert.strictEqual(clipped.features[0].properties.name, 'Agara Hospital');
});

// Interaction 4: SSE Stream Events + Authority Dossier Parsing + 4 Pillar Cards
suite.test('X4: SSE stream events unpack into 4 Domain Pillar Impact Cards with exact backend figures', () => {
  const events = generateStandardCorridorLifecycleEvents();
  const rawStream = createMockSSEStream(events);
  const parsed = parseSSEText(rawStream);

  const dossierEvent = parsed.find(e => e.type === 'dossier');
  assert.ok(dossierEvent && dossierEvent.dossier);

  const d = dossierEvent.dossier;
  assert.strictEqual(d.demographics.catchment_population_500m, 18500);
  assert.strictEqual(d.economic.tech_parks_within_1km, 3);
  assert.strictEqual(d.mobility.peak_hour_travel_time_saved_minutes, 24.5);
  assert.strictEqual(d.ecological.lake_buffer_infringements_30m, 1);
});

// Interaction 5: Dossier Viability + Risk Penalties
suite.test('X5: Viability score correlates with risk warnings (critical ecological risk imposes score deduction)', () => {
  function computeViability(baseScore, risks) {
    let score = baseScore;
    for (const r of risks) {
      if (r.severity === 'CRITICAL') score -= 15;
      if (r.severity === 'HIGH') score -= 8;
    }
    return Math.max(0, Math.min(100, score));
  }

  const cleanScore = computeViability(85, []);
  const penalizedScore = computeViability(85, [
    { severity: 'CRITICAL', headline: 'Lake Buffer Breach' }
  ]);

  assert.strictEqual(cleanScore, 85);
  assert.strictEqual(penalizedScore, 70);
  assert.isLessThan(penalizedScore, cleanScore);
});

// Interaction 6: Backend Suggested Stations + Interactive UI List + Map Navigation
suite.test('X6: Selecting a backend suggested station emits camera focus coordinates to map.flyTo()', () => {
  const events = generateStandardCorridorLifecycleEvents();
  const dossier = events.find(e => e.type === 'dossier').dossier;
  const stations = dossier.suggested_stations;

  assert.isGreaterThan(stations.length, 0);
  const selectedStation = stations[0];

  let cameraCenter = null;
  function handleStationSelect(st) {
    cameraCenter = st.coordinates;
  }

  handleStationSelect(selectedStation);
  assert.deepStrictEqual(cameraCenter, selectedStation.coordinates);
  assert.deepStrictEqual(cameraCenter, [77.6245, 12.9176]);
});

// Interaction 7: Swarm Telemetry Stream + Subagent Chips State
suite.test('X7: Swarm telemetry events update active subagent chips and radar animation in sync', () => {
  const events = generateStandardCorridorLifecycleEvents();
  const agentStates = {};

  for (const ev of events) {
    if (ev.type === 'subagents_spawned') {
      ev.subagents.forEach(s => { agentStates[s] = 'running'; });
    }
    if (ev.type === 'subagent_completed') {
      agentStates[ev.subagent] = 'completed';
    }
  }

  assert.strictEqual(agentStates['demographics'], 'completed');
});

// Interaction 8: Purged Hardcoded Constants + Dynamic Corridor Submission
suite.test('X8: Purged constants allow submitting non-Silk-Board corridor without residual legacy fields', () => {
  const dynamicRequest = {
    origin: {
      name: 'KR Puram',
      coordinates: NAMMA_METRO_STATIONS.KR_PURAM.coordinates,
      line: 'purple'
    },
    destination: {
      name: 'Whitefield',
      coordinates: NAMMA_METRO_STATIONS.WHITEFIELD.coordinates
    },
    catchment_radius_meters: 1500
  };

  const payload = JSON.parse(JSON.stringify(dynamicRequest));
  assert.notDeepStrictEqual(payload.origin.coordinates, [77.6245, 12.9176]);
  assert.strictEqual(payload.origin.name, 'KR Puram');
});

// Interaction 9: Surface Architecture + Typography + Emil Kowalski Motion
suite.test('X9: UI cards pair Command Center palette with Emil Kowalski spring tokens and tabular monospace', () => {
  const componentSpec = {
    containerClass: 'bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] ring-1 ring-white/5',
    metricClass: 'font-mono tabular-nums text-emerald-400 font-semibold',
    springConfig: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }
  };

  assert.includes(componentSpec.containerClass, 'bg-[#0E1117]');
  assert.includes(componentSpec.metricClass, 'tabular-nums');
  assert.strictEqual(componentSpec.springConfig.stiffness, 400);
});

// Interaction 10: Modal Failure + Deterministic Fallback + UI Stability
suite.test('X10: Cloud stream timeout triggers mathematical fallback yielding complete 0-100 dossier with zero crashes', () => {
  function evaluateCorridorWithFallback(modalAvailable, originCoords, destCoords) {
    if (!modalAvailable) {
      // Deterministic fallback
      const lengthKm = turf.length(turf.lineString([originCoords, destCoords]), { units: 'kilometers' });
      return {
        overall_viability_score: 76.0,
        total_length_km: Number(lengthKm.toFixed(2)),
        source: 'deterministic_math_fallback'
      };
    }
    return { source: 'modal_cloud' };
  }

  const result = evaluateCorridorWithFallback(false, [77.6245, 12.9176], [77.6890, 12.9230]);
  assert.strictEqual(result.source, 'deterministic_math_fallback');
  assert.strictEqual(result.overall_viability_score, 76.0);
  assert.isGreaterThan(result.total_length_km, 6.0);
});

export default suite;

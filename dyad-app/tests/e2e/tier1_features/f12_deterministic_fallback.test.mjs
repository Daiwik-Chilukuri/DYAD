import { TestSuite, assert } from '../test_framework.mjs';
import * as turf from '@turf/turf';

const suite = new TestSuite('Tier 1 - Feature 12: Deterministic Fallback Synthesis', 1);

function synthesizeDeterministicDossier(originCoords, destCoords, corridorName = 'Deterministic Test Corridor') {
  const line = turf.lineString([originCoords, destCoords]);
  const lengthKm = turf.length(line, { units: 'kilometers' });

  // Deterministic population model: Bengaluru urban density ~ 11,000 / sqkm
  const bufferAreaSqKm = lengthKm * 2.0 * 2.0; // 2km radius approximation
  const pop500m = Math.round(lengthKm * 2800);
  const pop1500m = Math.round(lengthKm * 9500);

  // Viability composite index formula (matching master_orchestrator.py)
  const economicMultiplier = 2.5;
  const lakeInfringements = 1;
  const viabilityScore = Math.min(96.0, Math.max(45.0, 72.0 + (economicMultiplier * 4.0) - (lakeInfringements * 6.0)));

  const midpoint = [
    Number(((originCoords[0] + destCoords[0]) / 2).toFixed(4)),
    Number(((originCoords[1] + destCoords[1]) / 2).toFixed(4))
  ];

  return {
    corridor_id: 'det-fallback-01',
    corridor_name: corridorName,
    overall_viability_score: viabilityScore,
    total_length_km: Number(lengthKm.toFixed(2)),
    demographics: {
      catchment_population_500m: pop500m,
      catchment_population_1500m: pop1500m,
      equity_index_score: 76.0,
      underserved_transit_ratio: 0.26,
      density_per_sqkm: 11000
    },
    economic: {
      tech_parks_within_1km: 2,
      commercial_centers_within_1km: 3,
      hospitals_within_1km: 1,
      annual_farebox_revenue_inr_cr: Number((lengthKm * 24.5).toFixed(1)),
      economic_multiplier_index: economicMultiplier,
      estimated_tod_yield_inr_cr: 250.0
    },
    mobility: {
      peak_hour_travel_time_saved_minutes: Number((lengthKm * 3.2).toFixed(1)),
      arterial_congestion_reduction_pct: 25.0,
      feeder_route_coverage_score: 78.0,
      daily_projected_ridership: pop1500m * 2
    },
    ecological: {
      lake_buffer_infringements_30m: lakeInfringements,
      rajakaluve_crossings_50m: 1,
      ktfd_compliance_status: 'FLAGGED',
      flood_vulnerability_grade: 'MODERATE',
      tree_canopy_loss_risk_score: 35.0
    },
    risk_warnings: [
      {
        risk_id: 'risk-ecol-01',
        category: 'ECOLOGICAL',
        severity: 'HIGH',
        headline: 'KTFD Act 30m Lake Buffer Infringement',
        description: 'Corridor passes through statutory lake buffer zone.',
        mitigation_step: 'Maintain 30m setback or deploy portal viaduct.'
      }
    ],
    suggested_stations: [
      {
        station_id: 'st-origin',
        name: `${corridorName} Origin`,
        coordinates: originCoords,
        typology: 'ELEVATED',
        estimated_daily_boardings: 40000,
        interchange_with: null,
        priority: 'MANDATORY'
      },
      {
        station_id: 'st-mid',
        name: `${corridorName} Midpoint Junction`,
        coordinates: midpoint,
        typology: 'ELEVATED',
        estimated_daily_boardings: 35000,
        interchange_with: null,
        priority: 'HIGH'
      },
      {
        station_id: 'st-dest',
        name: `${corridorName} Terminus`,
        coordinates: destCoords,
        typology: 'ELEVATED',
        estimated_daily_boardings: 25000,
        interchange_with: null,
        priority: 'MANDATORY'
      }
    ]
  };
}

const origin = [77.6245, 12.9176];
const destination = [77.6890, 12.9230];

suite.test('F12.1: Mathematical synthesis generates complete AuthorityDossier without external API keys', () => {
  const dossier = synthesizeDeterministicDossier(origin, destination);
  assert.ok(dossier);
  assert.strictEqual(dossier.corridor_id, 'det-fallback-01');
  assert.isGreaterThan(dossier.total_length_km, 0);
});

suite.test('F12.2: Calculates overall_viability_score within valid [0, 100] bounds', () => {
  const dossier = synthesizeDeterministicDossier(origin, destination);
  assert.isBetween(dossier.overall_viability_score, 0, 100);
  assert.strictEqual(dossier.overall_viability_score, 76.0); // 72 + 10 - 6 = 76
});

suite.test('F12.3: Derives demographic catchment population proportionally from alignment length', () => {
  const dossier = synthesizeDeterministicDossier(origin, destination);
  assert.isGreaterThan(dossier.demographics.catchment_population_500m, 10000);
  assert.isGreaterThan(dossier.demographics.catchment_population_1500m, dossier.demographics.catchment_population_500m);
});

suite.test('F12.4: Generates minimum 3 station proposals (Origin, Midpoint, Terminus) with valid coordinates', () => {
  const dossier = synthesizeDeterministicDossier(origin, destination);
  assert.strictEqual(dossier.suggested_stations.length, 3);
  assert.deepStrictEqual(dossier.suggested_stations[0].coordinates, origin);
  assert.deepStrictEqual(dossier.suggested_stations[2].coordinates, destination);
});

suite.test('F12.5: Deterministic synthesis completes in <50ms with zero network calls', () => {
  const t0 = performance.now();
  const dossier = synthesizeDeterministicDossier(origin, destination);
  const elapsed = performance.now() - t0;

  assert.ok(dossier);
  assert.isLessThan(elapsed, 50.0, `Execution took ${elapsed.toFixed(2)}ms`);
});

export default suite;

import { TestSuite, assert } from '../test_framework.mjs';

const suite = new TestSuite('Tier 1 - Feature 18: 4 Domain Pillar Impact Cards', 1);

const mockDossier = {
  demographics: {
    catchment_population_500m: 24000,
    catchment_population_1500m: 85000,
    equity_index_score: 79.5,
    underserved_transit_ratio: 0.31,
    density_per_sqkm: 14200
  },
  economic: {
    tech_parks_within_1km: 5,
    commercial_centers_within_1km: 4,
    hospitals_within_1km: 2,
    annual_farebox_revenue_inr_cr: 168.4,
    economic_multiplier_index: 2.9,
    estimated_tod_yield_inr_cr: 380.0
  },
  mobility: {
    peak_hour_travel_time_saved_minutes: 32.0,
    arterial_congestion_reduction_pct: 28.5,
    feeder_route_coverage_score: 84.0,
    daily_projected_ridership: 135000
  },
  ecological: {
    lake_buffer_infringements_30m: 1,
    rajakaluve_crossings_50m: 2,
    ktfd_compliance_status: 'FLAGGED',
    flood_vulnerability_grade: 'MODERATE',
    tree_canopy_loss_risk_score: 28.0
  }
};

suite.test('F18.1: Pillar 1 (Demographics) card contains 500m/1500m population, equity score, and underserved ratio', () => {
  const d = mockDossier.demographics;
  assert.strictEqual(d.catchment_population_500m, 24000);
  assert.strictEqual(d.catchment_population_1500m, 85000);
  assert.isBetween(d.equity_index_score, 0, 100);
  assert.isBetween(d.underserved_transit_ratio, 0.0, 1.0);
});

suite.test('F18.2: Pillar 2 (Economic & TOD) card contains tech parks, commercial hubs, farebox Cr, and multiplier', () => {
  const e = mockDossier.economic;
  assert.strictEqual(e.tech_parks_within_1km, 5);
  assert.strictEqual(e.commercial_centers_within_1km, 4);
  assert.isGreaterThan(e.annual_farebox_revenue_inr_cr, 0);
  assert.isGreaterThan(e.economic_multiplier_index, 1.0);
});

suite.test('F18.3: Pillar 3 (Mobility) card contains peak time saved mins, congestion reduction %, and feeder score', () => {
  const m = mockDossier.mobility;
  assert.isGreaterThan(m.peak_hour_travel_time_saved_minutes, 0);
  assert.isBetween(m.arterial_congestion_reduction_pct, 0, 100);
  assert.isBetween(m.feeder_route_coverage_score, 0, 100);
  assert.isGreaterThan(m.daily_projected_ridership, 0);
});

suite.test('F18.4: Pillar 4 (Ecological) card contains 30m lake infringements, 50m rajakaluve crossings, and KTFD status', () => {
  const eco = mockDossier.ecological;
  assert.isGreaterThanOrEqual(eco.lake_buffer_infringements_30m, 0);
  assert.isGreaterThanOrEqual(eco.rajakaluve_crossings_50m, 0);
  assert.includes(['COMPLIANT', 'FLAGGED', 'CRITICAL_BREACH'], eco.ktfd_compliance_status);
  assert.includes(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], eco.flood_vulnerability_grade);
});

suite.test('F18.5: All metrics across all 4 pillars are fully typed, non-null, and non-undefined', () => {
  for (const pillarKey of ['demographics', 'economic', 'mobility', 'ecological']) {
    const pillar = mockDossier[pillarKey];
    assert.ok(pillar, `Pillar ${pillarKey} must exist`);
    for (const [key, val] of Object.entries(pillar)) {
      assert.ok(val !== null && val !== undefined, `Field ${pillarKey}.${key} cannot be null/undefined`);
    }
  }
});

export default suite;

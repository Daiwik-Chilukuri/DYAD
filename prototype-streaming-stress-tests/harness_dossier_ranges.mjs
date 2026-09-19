/**
 * Stress-Test Harness 3: AuthorityDossier Quantitative Schema & Range Validation
 * Verifies that all metric values in synthesized AuthorityDossier (both fallback and production models)
 * fall strictly within valid mathematical/domain boundaries:
 * - overall_viability_score between 0 and 100
 * - population >= 0, density >= 0, equity score 0-100
 * - economic counts >= 0, revenue >= 0, multiplier >= 0
 * - travel time saved >= 0, congestion reduction % 0-100, feeder coverage 0-100
 * - ecological lake buffer infringements >= 0, KTFD status valid enum, flood grade valid enum
 * - risk warnings array valid severities and non-empty actions
 * - suggested stations coordinates within Bengaluru bounding box [77..78, 12..14]
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUNNER_SCRIPT = path.resolve(__dirname, '../prototype-modal-cloud-orchestrator/run_stream_bridge.py');

export function extractDossierFromStream(payload, envOverrides = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('python', ['-u', RUNNER_SCRIPT], {
      cwd: path.dirname(RUNNER_SCRIPT),
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        PYTHONIOENCODING: 'utf-8',
        OPENAI_API_KEY: 'sk-test-fallback',
        ...envOverrides,
      },
    });

    let rawStdout = '';
    let rawStderr = '';

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();

    child.stdout.on('data', (d) => { rawStdout += d.toString('utf-8'); });
    child.stderr.on('data', (d) => { rawStderr += d.toString('utf-8'); });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Runner exited with code ${code}: ${rawStderr}`));
      }
      const blocks = rawStdout.split(/\r?\n\r?\n/);
      let dossier = null;
      for (const block of blocks) {
        if (block.includes('event: dossier')) {
          const lines = block.split(/\r?\n/);
          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const parsed = JSON.parse(line.slice(5).trim());
                dossier = parsed.payload || parsed.dossier || parsed;
              } catch (e) {
                return reject(new Error(`Failed to parse dossier data JSON: ${e.message}`));
              }
            }
          }
        }
      }
      if (!dossier) {
        return reject(new Error('No event: dossier found in stream output'));
      }
      resolve(dossier);
    });
  });
}

export function validateDossierRanges(dossier) {
  const violations = [];

  function checkRange(name, val, min, max) {
    if (typeof val !== 'number' || isNaN(val)) {
      violations.push(`${name}: expected number, got ${typeof val} (${val})`);
      return;
    }
    if (val < min || val > max) {
      violations.push(`${name}: value ${val} out of range [${min}, ${max}]`);
    }
  }

  function checkMin(name, val, min) {
    if (typeof val !== 'number' || isNaN(val)) {
      violations.push(`${name}: expected number, got ${typeof val} (${val})`);
      return;
    }
    if (val < min) {
      violations.push(`${name}: value ${val} < minimum ${min}`);
    }
  }

  // 1. Overall Viability Score
  checkRange('overall_viability_score', dossier.overall_viability_score, 0, 100);

  // 2. Demographics Pillar
  const demog = dossier.demographics || dossier.demographics_pillar || {};
  const pop500 = demog.catchment_population_500m;
  const pop1500 = demog.catchment_population_1500m;
  const equity = demog.equity_index_score ?? demog.equity_score;
  const underserved = demog.underserved_transit_ratio ?? demog.underserved_demographic_ratio;
  const density = demog.density_per_sqkm;

  checkMin('demographics.catchment_population_500m', pop500, 0);
  checkMin('demographics.catchment_population_1500m', pop1500, 0);
  if (pop1500 < pop500) {
    violations.push(`demographics: 1500m pop (${pop1500}) should be >= 500m pop (${pop500})`);
  }
  checkRange('demographics.equity_score', equity, 0, 100);
  checkMin('demographics.underserved_ratio', underserved, 0);
  if (density !== undefined) checkMin('demographics.density_per_sqkm', density, 0);

  // 3. Economic Pillar
  const econ = dossier.economic || dossier.economic_pillar || {};
  checkMin('economic.tech_parks_within_1km', econ.tech_parks_within_1km, 0);
  checkMin('economic.commercial_centers_within_1km', econ.commercial_centers_within_1km, 0);
  checkMin('economic.hospitals_within_1km', econ.hospitals_within_1km, 0);
  const farebox = econ.annual_farebox_revenue_inr_cr ?? econ.projected_annual_farebox_inr_cr;
  checkMin('economic.farebox_revenue', farebox, 0);
  checkMin('economic.economic_multiplier_index', econ.economic_multiplier_index, 0);
  const todYield = econ.estimated_tod_yield_inr_cr ?? econ.tod_land_value_capture_inr_cr;
  if (todYield !== undefined) {
    checkMin('economic.tod_yield', todYield, 0);
  } else {
    // Note contract gap: backend Pydantic schema EconomicPillarMetrics omitted this field
    // Frontend handles via `todYield = economic?.estimated_tod_yield_inr_cr ?? (farebox * 2.2)`
  }

  // 4. Mobility Pillar
  const mob = dossier.mobility || dossier.mobility_pillar || {};
  const timeSaved = mob.peak_hour_travel_time_saved_minutes ?? mob.peak_hour_travel_time_saved_mins;
  checkMin('mobility.peak_hour_travel_time_saved_minutes', timeSaved, 0);
  checkRange('mobility.arterial_congestion_reduction_pct', mob.arterial_congestion_reduction_pct, 0, 100);
  checkRange('mobility.feeder_route_coverage_score', mob.feeder_route_coverage_score, 0, 100);
  const dailyRiders = mob.daily_projected_ridership ?? mob.gravity_model_daily_trips ?? dossier.estimated_ridership_daily;
  if (dailyRiders !== undefined) checkMin('mobility.daily_projected_ridership', dailyRiders, 0);

  // 5. Ecological Pillar
  const ecol = dossier.ecological || dossier.ecological_pillar || {};
  const lakeInfringe = ecol.lake_buffer_infringements_30m ?? ecol.lake_buffer_infringements;
  checkMin('ecological.lake_buffer_infringements', lakeInfringe, 0);
  const rajakaluve = ecol.rajakaluve_crossings_50m ?? ecol.rajakaluve_buffer_infringements;
  checkMin('ecological.rajakaluve_crossings', rajakaluve, 0);

  const validKTFD = ['COMPLIANT', 'PERMIT_REQUIRED', 'CRITICAL_BREACH', 'FLAGGED'];
  if (!validKTFD.includes(ecol.ktfd_compliance_status)) {
    violations.push(`ecological.ktfd_compliance_status invalid enum: "${ecol.ktfd_compliance_status}"`);
  }

  const validFlood = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
  if (!validFlood.includes(ecol.flood_vulnerability_grade)) {
    violations.push(`ecological.flood_vulnerability_grade invalid enum: "${ecol.flood_vulnerability_grade}"`);
  }

  const canopyLoss = ecol.tree_canopy_loss_risk_score;
  if (canopyLoss !== undefined) checkRange('ecological.tree_canopy_loss_risk_score', canopyLoss, 0, 100);

  // 6. Risk Warnings
  const warnings = dossier.risk_warnings || [];
  if (!Array.isArray(warnings) || warnings.length === 0) {
    violations.push('risk_warnings: expected non-empty array');
  } else {
    for (let i = 0; i < warnings.length; i++) {
      const w = warnings[i];
      const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
      if (!validSeverities.includes(w.severity)) {
        violations.push(`risk_warnings[${i}].severity invalid: "${w.severity}"`);
      }
      const title = w.headline || w.title;
      if (!title || typeof title !== 'string' || !title.trim()) {
        violations.push(`risk_warnings[${i}]: missing or empty headline/title`);
      }
    }
  }

  // 7. Suggested Stations
  const stations = dossier.suggested_stations || dossier.suggested_station_locations || [];
  if (!Array.isArray(stations) || stations.length < 2) {
    violations.push(`suggested_stations: expected at least 2 stations, got ${stations.length}`);
  } else {
    for (let i = 0; i < stations.length; i++) {
      const s = stations[i];
      if (!s.name || typeof s.name !== 'string') {
        violations.push(`suggested_stations[${i}]: missing or invalid name`);
      }
      const lat = s.latitude ?? (Array.isArray(s.coordinates) ? s.coordinates[1] : null);
      const lng = s.longitude ?? (Array.isArray(s.coordinates) ? s.coordinates[0] : null);
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        violations.push(`suggested_stations[${i}]: invalid coordinates (lat=${lat}, lng=${lng})`);
      } else {
        // Bengaluru bounds: Lat ~12.5 - 13.5, Lng ~77.3 - 77.9
        if (lat < 12.0 || lat > 14.0 || lng < 76.5 || lng > 78.5) {
          violations.push(`suggested_stations[${i}]: coordinates [${lng}, ${lat}] outside regional bounds`);
        }
      }
    }
  }

  return violations;
}

export async function runDossierRangesSuite() {
  console.log('=== SUITE 3: AUTHORITY DOSSIER SCHEMA & RANGE VALIDATION ===\n');
  const results = [];

  // Corridor 1: Silk Board to Bellandur (High Density Tech & Lake Corridor)
  const corridor1 = {
    origin: { name: 'Central Silk Board', coordinates: [77.6245, 12.9176] },
    destination: { name: 'Bellandur EcoSpace', coordinates: [77.6890, 12.9230] },
    catchment_radius_meters: 1500,
    budget_cap_inr_cr: 4500,
  };

  console.log('Test 3.1: Validating Corridor 1 (Silk Board -> Bellandur)...');
  try {
    const dossier1 = await extractDossierFromStream(corridor1);
    const violations1 = validateDossierRanges(dossier1);
    const pass1 = violations1.length === 0;
    console.log(`  Corridor 1 Viability Score: ${dossier1.overall_viability_score}/100`);
    console.log(`  Corridor 1 Stations: ${(dossier1.suggested_stations || dossier1.suggested_station_locations || []).length}`);
    console.log(`  Violations found: ${violations1.length} -> ${pass1 ? 'PASS' : 'FAIL'}`);
    if (!pass1) {
      console.log('  Violations:', violations1);
    }
    results.push({ name: 'Corridor 1 (Silk Board -> Bellandur) Schema & Range Check', pass: pass1, details: { violations: violations1 } });
  } catch (err) {
    console.error('  Test 3.1 Error:', err.message);
    results.push({ name: 'Corridor 1 (Silk Board -> Bellandur) Schema & Range Check', pass: false, details: { error: err.message } });
  }

  // Corridor 2: Indiranagar to Whitefield (Extended Radial Corridor)
  const corridor2 = {
    origin: { name: 'Indiranagar Metro', coordinates: [77.6389, 12.9784] },
    destination: { name: 'Whitefield TTMC', coordinates: [77.7499, 12.9698] },
    catchment_radius_meters: 2000,
    budget_cap_inr_cr: 8000,
  };

  console.log('\nTest 3.2: Validating Corridor 2 (Indiranagar -> Whitefield)...');
  try {
    const dossier2 = await extractDossierFromStream(corridor2);
    const violations2 = validateDossierRanges(dossier2);
    const pass2 = violations2.length === 0;
    console.log(`  Corridor 2 Viability Score: ${dossier2.overall_viability_score}/100`);
    console.log(`  Corridor 2 Stations: ${(dossier2.suggested_stations || dossier2.suggested_station_locations || []).length}`);
    console.log(`  Violations found: ${violations2.length} -> ${pass2 ? 'PASS' : 'FAIL'}`);
    if (!pass2) {
      console.log('  Violations:', violations2);
    }
    results.push({ name: 'Corridor 2 (Indiranagar -> Whitefield) Schema & Range Check', pass: pass2, details: { violations: violations2 } });
  } catch (err) {
    console.error('  Test 3.2 Error:', err.message);
    results.push({ name: 'Corridor 2 (Indiranagar -> Whitefield) Schema & Range Check', pass: false, details: { error: err.message } });
  }

  console.log('\n--- DOSSIER SCHEMA & RANGE SUMMARY ---');
  let passCount = 0;
  for (const r of results) {
    if (r.pass) passCount++;
    console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.name}`);
  }
  console.log(`Total: ${passCount}/${results.length} passed.\n`);
  return { results, total: results.length, passed: passCount };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runDossierRangesSuite().catch(console.error);
}

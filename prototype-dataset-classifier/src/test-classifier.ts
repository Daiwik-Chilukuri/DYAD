/**
 * Test Suite & Ping Runner for TypeSafe Jev Dataset Classifier
 */

import { TypeSafeClient } from './typesafe-client.ts';
import { DatasetClassifierAgent } from './dataset-classifier.ts';

// Realistic Curated Bengaluru Datasets for Testing
const TEST_DATASETS = [
  {
    name: 'tomtom_bengaluru_peak_congestion.csv',
    headers: ['corridor_segment', 'rush_hour_speed_kmh', 'free_flow_speed_kmh', 'delay_index', 'avg_commute_minutes'],
    sampleRows: [
      { corridor_segment: 'Silk Board to Agara Junction', rush_hour_speed_kmh: 11.2, free_flow_speed_kmh: 32.0, delay_index: 2.85, avg_commute_minutes: 42 },
      { corridor_segment: 'Marathahalli to Tin Factory', rush_hour_speed_kmh: 12.8, free_flow_speed_kmh: 35.0, delay_index: 2.73, avg_commute_minutes: 38 },
      { corridor_segment: 'Whitefield to ITPL Main Gate', rush_hour_speed_kmh: 14.1, free_flow_speed_kmh: 28.0, delay_index: 1.98, avg_commute_minutes: 25 },
    ],
  },
  {
    name: 'bbmp_wards_demographics_census.csv',
    headers: ['ward_no', 'ward_name', 'total_population', 'working_class_pct', 'literacy_rate', 'transit_dependency_score'],
    sampleRows: [
      { ward_no: 150, ward_name: 'Bellandur', total_population: 80180, working_class_pct: 0.58, literacy_rate: 0.89, transit_dependency_score: 0.74 },
      { ward_no: 174, ward_name: 'HSR Layout', total_population: 64200, working_class_pct: 0.45, literacy_rate: 0.94, transit_dependency_score: 0.62 },
      { ward_no: 85, ward_name: 'Dodda Nekkundi', total_population: 52140, working_class_pct: 0.68, literacy_rate: 0.82, transit_dependency_score: 0.81 },
    ],
  },
  {
    name: 'bengaluru_tech_parks_and_hospitals.csv',
    headers: ['facility_name', 'facility_type', 'lat', 'lon', 'employee_capacity', 'address'],
    sampleRows: [
      { facility_name: 'RMZ Ecospace', facility_type: 'corporate_tech_park', lat: 12.926, lon: 77.6833, employee_capacity: 45000, address: 'Outer Ring Road, Bellandur' },
      { facility_name: 'Manipal Hospital Sarjapur', facility_type: 'healthcare', lat: 12.9158, lon: 77.6654, employee_capacity: 1200, address: 'Sarjapur Main Road' },
      { facility_name: 'International Tech Park (ITPL)', facility_type: 'corporate_tech_park', lat: 12.9863, lon: 77.7289, employee_capacity: 55000, address: 'Whitefield' },
    ],
  },
  {
    name: 'bengaluru_water_bodies_ngt_buffers.geojson',
    headers: ['lake_id', 'lake_name', 'water_spread_area_sqm', 'ngt_statutory_buffer_meters', 'latitude', 'longitude'],
    sampleRows: [
      { lake_id: 'LAK_001', lake_name: 'Bellandur Lake', water_spread_area_sqm: 3610000, ngt_statutory_buffer_meters: 75, latitude: 12.9344, longitude: 77.6685 },
      { lake_id: 'LAK_002', lake_name: 'Agara Lake', water_spread_area_sqm: 570000, ngt_statutory_buffer_meters: 75, latitude: 12.9231, longitude: 77.6472 },
      { lake_id: 'LAK_003', lake_name: 'Varthur Lake', water_spread_area_sqm: 1800000, ngt_statutory_buffer_meters: 75, latitude: 12.9422, longitude: 77.7188 },
    ],
  },
];

async function main() {
  console.log('='.repeat(70));
  console.log('   DYAD: TypeSafe AI (Jev) Dataset Classifier Test Runner');
  console.log('='.repeat(70));

  const client = new TypeSafeClient();

  if (!client.hasApiKey()) {
    console.log('\n[NOTICE] No API key detected in prototype-dataset-classifier/.env');
    console.log('Please add your key:');
    console.log('  TYPESAFE_API_KEY="ts_live_your_key_here"\n');
    console.log('Displaying dry-run test cases ready for execution:\n');

    TEST_DATASETS.forEach((ds, i) => {
      console.log(`Test Case ${i + 1}: ${ds.name}`);
      console.log(`  Headers: ${ds.headers.join(', ')}`);
      console.log(`  Sample: ${JSON.stringify(ds.sampleRows[0])}\n`);
    });
    return;
  }

  console.log('\n[Step 1] Pinging TypeSafe Jev API endpoint...');
  const pingResult = await client.ping();
  if (!pingResult.ok) {
    console.error(`[ERROR] Ping failed: ${pingResult.message}`);
    return;
  }
  console.log(`[SUCCESS] ${pingResult.message}`);

  console.log('\n[Step 2] Executing Urban Dataset Classifier Agent on 4 datasets:\n');
  const agent = new DatasetClassifierAgent(client);

  for (const ds of TEST_DATASETS) {
    console.log(`--- Evaluating: ${ds.name} ---`);
    try {
      const result = await agent.classify(ds.name, ds.headers, ds.sampleRows);
      console.log(`  Domain:          ${result.domain.toUpperCase()} (Confidence: ${(result.confidence * 100).toFixed(1)}%)`);
      console.log(`  Has Coordinates: ${result.hasCoordinates ? 'YES' : 'NO'} (Prob: ${(result.coordinateProbability * 100).toFixed(1)}%)`);
      console.log(`  Lat/Lng Columns: Lat='${result.latitudeColumn || 'None'}', Lng='${result.longitudeColumn || 'None'}'`);
      console.log(`  Readiness Score: ${result.qualityLevel}`);
      console.log(`  Latency:         ${result.latencyMs}ms | Tokens: in=${result.tokensUsed.input}, out=${result.tokensUsed.output}\n`);
    } catch (err: any) {
      console.error(`  [ERROR] Evaluation failed: ${err.message}\n`);
    }
  }

  console.log('='.repeat(70));
  console.log('   Evaluation Complete!');
  console.log('='.repeat(70));
}

main().catch(console.error);

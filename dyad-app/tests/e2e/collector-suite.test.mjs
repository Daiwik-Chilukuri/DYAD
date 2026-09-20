import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

console.log('================================================================');
console.log('       DYAD COLLECTOR STUDIO TEST SUITE                         ');
console.log('================================================================');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ✖ [FAIL] ${name}`);
    console.error(err);
  }
}

// 1. Sidebar Rail Integration
test('SidebarRail has COLLECT navigation item with Compass icon', () => {
  const sidebarFile = path.join(rootDir, 'components/navigation/SidebarRail.tsx');
  assert.ok(fs.existsSync(sidebarFile), 'SidebarRail.tsx must exist');
  const content = fs.readFileSync(sidebarFile, 'utf-8');
  assert.ok(content.includes('href="/collector"'), 'SidebarRail must contain href="/collector"');
  assert.ok(content.includes('Compass'), 'SidebarRail must import and use Compass icon');
  assert.ok(content.includes('COLLECT'), 'SidebarRail must render COLLECT label');
  assert.ok(content.includes('isCollectorActive'), 'SidebarRail must track isCollectorActive');
});

// 2. Collector Page Component
test('Collector page exists with City Profiles and 5-Pillar Prompt Builder', () => {
  const pageFile = path.join(rootDir, 'src/app/collector/page.tsx');
  assert.ok(fs.existsSync(pageFile), 'collector/page.tsx must exist');
  const content = fs.readFileSync(pageFile, 'utf-8');
  assert.ok(content.includes('PRESET_CITIES'), 'Must define preset cities');
  assert.ok(content.includes('Hyderabad'), 'Must include Hyderabad');
  assert.ok(content.includes('Bengaluru'), 'Must include Bengaluru');
  assert.ok(content.includes('Pune'), 'Must include Pune');
  assert.ok(content.includes('Chennai'), 'Must include Chennai');
  assert.ok(content.includes('Mumbai'), 'Must include Mumbai');
  assert.ok(content.includes('Delhi-NCR'), 'Must include Delhi-NCR');
  assert.ok(content.includes('buildParametricPrompt'), 'Must contain prompt builder');
  assert.ok(content.includes('startDatasetCollection'), 'Must have start collection handler');
  assert.ok(content.includes('stageDatasetIntoPipeline'), 'Must have stage dataset handler');
});

// 3. Staged Hyderabad Datasets
test('Harvested Hyderabad datasets are staged in public/data/hyderabad', () => {
  const hydDir = path.join(rootDir, 'public/data/hyderabad');
  assert.ok(fs.existsSync(hydDir), 'public/data/hyderabad must exist');
  const files = fs.readdirSync(hydDir);
  assert.ok(files.includes('ghmc_boundary.geojson'), 'ghmc_boundary.geojson must exist');
  assert.ok(files.includes('hyderabad_census_2011.csv'), 'hyderabad_census_2011.csv must exist');
  assert.ok(files.includes('hyderabad_metro_stations_routes.geojson'), 'metro routes must exist');
  assert.ok(files.includes('hyderabad_office_pois.geojson'), 'office pois must exist');
  assert.ok(files.includes('hyderabad_tomtom_traffic_2025.json'), 'tomtom traffic must exist');
  assert.ok(files.includes('hyderabad_waterbodies_hydraa_ftl.geojson'), 'hydraa waterbodies must exist');
});

// 4. Collector Datasets API Route
test('Collector datasets API route handles listing and staging', () => {
  const apiFile = path.join(rootDir, 'src/app/api/collector/datasets/route.ts');
  assert.ok(fs.existsSync(apiFile), 'api/collector/datasets/route.ts must exist');
  const content = fs.readFileSync(apiFile, 'utf-8');
  assert.ok(content.includes('export async function GET'), 'Must export GET handler');
  assert.ok(content.includes('export async function POST'), 'Must export POST handler');
  assert.ok(content.includes('inferPillar'), 'Must infer pillar for datasets');
});

// 5. Collector Stream API Route
test('Collector stream API route implements 5-pillar SSE pipeline', () => {
  const streamFile = path.join(rootDir, 'src/app/api/collector/stream/route.ts');
  assert.ok(fs.existsSync(streamFile), 'api/collector/stream/route.ts must exist');
  const content = fs.readFileSync(streamFile, 'utf-8');
  assert.ok(content.includes('text/event-stream'), 'Must set SSE header');
  assert.ok(content.includes('CITY_PROFILES'), 'Must have city profiles');
  assert.ok(content.includes('DeepSeek V4.1 Flash Vision'), 'Must reference DeepSeek vision model');
  assert.ok(content.includes('HYDRAA'), 'Must reference regulatory body');
  assert.ok(content.includes('KTFD'), 'Must reference KTFD');
});

console.log('================================================================');
console.log(` Collector Test Suite Result: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================');

if (passed !== total) {
  process.exit(1);
}

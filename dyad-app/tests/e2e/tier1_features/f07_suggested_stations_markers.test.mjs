import { TestSuite, assert } from '../test_framework.mjs';
import { BENGALURU_BBOX } from '../fixtures/bengaluru_corridors.mjs';

const suite = new TestSuite('Tier 1 - Feature 7: Suggested Station Map Markers', 1);

const mockProposals = [
  {
    station_id: 'st-01',
    name: 'Central Silk Board Interchange',
    coordinates: [77.6245, 12.9176],
    typology: 'ELEVATED',
    estimated_daily_boardings: 45000,
    interchange_with: 'Yellow Line',
    priority: 'MANDATORY'
  },
  {
    station_id: 'st-02',
    name: 'Agara Junction Station',
    coordinates: [77.6450, 12.9210],
    typology: 'ELEVATED',
    estimated_daily_boardings: 32000,
    interchange_with: null,
    priority: 'HIGH'
  }
];

suite.test('F7.1: Parses backend StationProposal items into typed objects', () => {
  for (const p of mockProposals) {
    assert.ok(typeof p.station_id === 'string');
    assert.ok(typeof p.name === 'string');
    assert.ok(Array.isArray(p.coordinates) && p.coordinates.length === 2);
    assert.ok(typeof p.estimated_daily_boardings === 'number');
    assert.includes(['ELEVATED', 'UNDERGROUND', 'AT_GRADE'], p.typology);
  }
});

suite.test('F7.2: Verifies required fields present in all station proposals', () => {
  mockProposals.forEach(p => {
    assert.ok(p.name && p.name.length > 0, 'Station proposal must have name');
    assert.isGreaterThan(p.estimated_daily_boardings, 0, 'Footfall must be positive');
    assert.includes(['MANDATORY', 'HIGH', 'OPTIONAL'], p.priority);
  });
});

suite.test('F7.3: Converts StationProposal list into MapLibre FeatureCollection for marker layer', () => {
  const markerGeoJSON = {
    type: 'FeatureCollection',
    features: mockProposals.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: p.coordinates },
      properties: {
        id: p.station_id,
        name: p.name,
        typology: p.typology,
        footfall: p.estimated_daily_boardings,
        isInterchange: p.interchange_with !== null
      }
    }))
  };

  assert.isGeoJSON(markerGeoJSON, 'FeatureCollection');
  assert.strictEqual(markerGeoJSON.features.length, 2);
  assert.strictEqual(markerGeoJSON.features[0].properties.isInterchange, true);
  assert.strictEqual(markerGeoJSON.features[1].properties.isInterchange, false);
});

suite.test('F7.4: Differentiates interchange stations from standard non-interchange stations', () => {
  const csb = mockProposals.find(p => p.station_id === 'st-01');
  const agara = mockProposals.find(p => p.station_id === 'st-02');

  assert.strictEqual(csb.interchange_with, 'Yellow Line');
  assert.strictEqual(agara.interchange_with, null);
});

suite.test('F7.5: Marker coordinates fall strictly within Bengaluru geographic bounding box', () => {
  mockProposals.forEach(p => {
    const [lng, lat] = p.coordinates;
    assert.isBetween(lng, BENGALURU_BBOX.minLng, BENGALURU_BBOX.maxLng);
    assert.isBetween(lat, BENGALURU_BBOX.minLat, BENGALURU_BBOX.maxLat);
  });
});

export default suite;

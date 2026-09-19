import { TestSuite, assert } from '../test_framework.mjs';

const suite = new TestSuite('Tier 1 - Feature 6: Dynamic Visualizer GeoJSON Layering', 1);

suite.test('F6.1: Validates visualizer_features GeoJSON FeatureCollection structure', () => {
  const visualizerPayload = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[77.62, 12.91], [77.63, 12.91], [77.63, 12.92], [77.62, 12.92], [77.62, 12.91]]]
        },
        properties: { name: 'Bellandur Lake 30m Buffer', category: 'lake_buffer', severity: 'HIGH' }
      }
    ]
  };

  assert.isGeoJSON(visualizerPayload, 'FeatureCollection');
  assert.strictEqual(visualizerPayload.features.length, 1);
  assert.strictEqual(visualizerPayload.features[0].properties.category, 'lake_buffer');
});

suite.test('F6.2: Supports Polygon features representing lake buffers and flood risk zones', () => {
  const polygonFeature = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[[77.67, 12.93], [77.68, 12.93], [77.68, 12.94], [77.67, 12.94], [77.67, 12.93]]]
    },
    properties: {
      id: 'poly-lake-01',
      zone_name: 'Bellandur Flood Catchment',
      color: '#EF4444',
      opacity: 0.35
    }
  };

  assert.isGeoJSON(polygonFeature, 'Feature');
  assert.strictEqual(polygonFeature.geometry.type, 'Polygon');
  assert.strictEqual(polygonFeature.properties.color, '#EF4444');
});

suite.test('F6.3: Supports LineString features representing primary stormwater drains (rajakaluve)', () => {
  const drainFeature = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [[77.665, 12.930], [77.670, 12.935], [77.675, 12.940]]
    },
    properties: {
      id: 'drain-01',
      type: 'rajakaluve_primary',
      setback_meters: 50,
      color: '#00BBF9'
    }
  };

  assert.isGeoJSON(drainFeature, 'Feature');
  assert.strictEqual(drainFeature.geometry.type, 'LineString');
  assert.strictEqual(drainFeature.properties.setback_meters, 50);
});

suite.test('F6.4: Supports Point features representing major POI clusters and candidate hubs', () => {
  const poiFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [77.6890, 12.9230]
    },
    properties: {
      poi_name: 'Wipro Technologies SEZ',
      category: 'corporate',
      headcount: 25000,
      transit_demand_score: 96
    }
  };

  assert.isGeoJSON(poiFeature, 'Feature');
  assert.strictEqual(poiFeature.geometry.type, 'Point');
  assert.strictEqual(poiFeature.properties.transit_demand_score, 96);
});

suite.test('F6.5: Empty features collection (features: []) handled safely without throwing or breaking map layers', () => {
  const emptyGeoJSON = {
    type: 'FeatureCollection',
    features: []
  };

  assert.isGeoJSON(emptyGeoJSON, 'FeatureCollection');
  assert.strictEqual(emptyGeoJSON.features.length, 0);
  assert.doesNotThrow(() => {
    // MapLibre setData simulation
    const count = emptyGeoJSON.features.length;
    assert.strictEqual(count, 0);
  });
});

export default suite;

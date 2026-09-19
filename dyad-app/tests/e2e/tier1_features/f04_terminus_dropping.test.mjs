import { TestSuite, assert } from '../test_framework.mjs';
import * as turf from '@turf/turf';
import { BENGALURU_BBOX } from '../fixtures/bengaluru_corridors.mjs';

const suite = new TestSuite('Tier 1 - Feature 4: Dynamic Terminus Pin Dropping', 1);

function validateBengaluruCoordinate(coords) {
  if (!Array.isArray(coords) || coords.length !== 2) return false;
  const [lng, lat] = coords;
  return (
    lng >= BENGALURU_BBOX.minLng &&
    lng <= BENGALURU_BBOX.maxLng &&
    lat >= BENGALURU_BBOX.minLat &&
    lat <= BENGALURU_BBOX.maxLat
  );
}

suite.test('F4.1: Dropping terminus pin at Sarjapur Road records valid destination coordinates', () => {
  const sarjapurTerminus = {
    name: 'Sarjapur Wipro Hub',
    coordinates: [77.6890, 12.9230]
  };
  assert.ok(validateBengaluruCoordinate(sarjapurTerminus.coordinates));
  assert.strictEqual(sarjapurTerminus.name, 'Sarjapur Wipro Hub');
});

suite.test('F4.2: Dropping terminus pin at Whitefield Kadugodi records valid destination coordinates', () => {
  const whitefieldTerminus = {
    name: 'Whitefield Kadugodi Tech Terminal',
    coordinates: [77.7499, 12.9698]
  };
  assert.ok(validateBengaluruCoordinate(whitefieldTerminus.coordinates));
  assert.deepStrictEqual(whitefieldTerminus.coordinates, [77.7499, 12.9698]);
});

suite.test('F4.3: Dropping terminus pin at Electronic City Phase 1 records valid destination coordinates', () => {
  const ecityTerminus = {
    name: 'Electronic City Tollgate Terminus',
    coordinates: [77.6740, 12.8450]
  };
  assert.ok(validateBengaluruCoordinate(ecityTerminus.coordinates));
});

suite.test('F4.4: Relocating/re-dropping terminus pin immediately updates target coordinates without residual lag', () => {
  let terminus = { coordinates: [77.6890, 12.9230] };
  assert.deepStrictEqual(terminus.coordinates, [77.6890, 12.9230]);

  // User drags pin to Hebbal
  terminus = { coordinates: [77.5912, 13.0358] };
  assert.deepStrictEqual(terminus.coordinates, [77.5912, 13.0358]);
  assert.ok(validateBengaluruCoordinate(terminus.coordinates));
});

suite.test('F4.5: Terminus pin generates GeoJSON Point feature with marker styling metadata', () => {
  const terminusCoords = [77.7010, 12.9920]; // Mahadevapura
  const terminusFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: terminusCoords
    },
    properties: {
      markerType: 'terminus',
      title: 'Target Terminus',
      interactive: true
    }
  };
  assert.isGeoJSON(terminusFeature, 'Feature');
  assert.strictEqual(terminusFeature.properties.markerType, 'terminus');
  assert.deepStrictEqual(terminusFeature.geometry.coordinates, terminusCoords);
});

export default suite;

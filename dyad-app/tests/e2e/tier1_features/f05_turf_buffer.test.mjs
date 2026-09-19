import { TestSuite, assert } from '../test_framework.mjs';
import * as turf from '@turf/turf';

const suite = new TestSuite('Tier 1 - Feature 5: Turf.js Dynamic Catchment Buffer', 1);

const origin = [77.6245, 12.9176]; // Silk Board
const destination = [77.6890, 12.9230]; // Sarjapur

suite.test('F5.1: 500m buffer generation produces valid GeoJSON Polygon with closed coordinates ring', () => {
  const line = turf.lineString([origin, destination]);
  const buf500m = turf.buffer(line, 0.5, { units: 'kilometers' });

  assert.isGeoJSON(buf500m, 'Feature');
  assert.strictEqual(buf500m.geometry.type, 'Polygon');
  const ring = buf500m.geometry.coordinates[0];
  assert.isGreaterThan(ring.length, 4, 'Buffer ring should have multiple vertices');
  // First and last coordinate must be identical (closed ring)
  assert.deepStrictEqual(ring[0], ring[ring.length - 1], 'Polygon ring must be closed');
});

suite.test('F5.2: 1500m buffer area is strictly larger than 500m buffer area', () => {
  const line = turf.lineString([origin, destination]);
  const buf500m = turf.buffer(line, 0.5, { units: 'kilometers' });
  const buf1500m = turf.buffer(line, 1.5, { units: 'kilometers' });

  const area500 = turf.area(buf500m);
  const area1500 = turf.area(buf1500m);

  assert.isGreaterThan(area1500, area500);
  assert.isGreaterThan(area1500, area500 * 2.5); // 1.5km buffer has significantly wider footprint
});

suite.test('F5.3: 2000m corridor buffer envelops both origin and destination points with margin', () => {
  const line = turf.lineString([origin, destination]);
  const buf2000m = turf.buffer(line, 2.0, { units: 'kilometers' });

  const originPt = turf.point(origin);
  const destPt = turf.point(destination);

  assert.ok(turf.booleanPointInPolygon(originPt, buf2000m), 'Buffer must contain origin');
  assert.ok(turf.booleanPointInPolygon(destPt, buf2000m), 'Buffer must contain destination');
});

suite.test('F5.4: Spatial points-within-polygon correctly segregates POIs inside vs outside catchment', () => {
  const line = turf.lineString([origin, destination]);
  const buf1000m = turf.buffer(line, 1.0, { units: 'kilometers' });

  const insidePoi = turf.point([77.6500, 12.9200], { name: 'Agara Market' }); // Midpoint, right along corridor
  const outsidePoi = turf.point([77.7500, 13.0500], { name: 'Hebbal Far North' }); // Far away

  const poiCollection = turf.featureCollection([insidePoi, outsidePoi]);
  const clipped = turf.pointsWithinPolygon(poiCollection, buf1000m);

  assert.strictEqual(clipped.features.length, 1);
  assert.strictEqual(clipped.features[0].properties.name, 'Agara Market');
});

suite.test('F5.5: Turf.js corridor buffer calculation completes well within the 20ms performance budget', () => {
  const line = turf.lineString([origin, destination]);
  const t0 = performance.now();
  const buffer = turf.buffer(line, 2.0, { units: 'kilometers' });
  const elapsed = performance.now() - t0;

  assert.ok(buffer);
  assert.isLessThan(elapsed, 20.0, `Buffer compute took ${elapsed.toFixed(2)}ms, exceeding 20ms budget`);
});

export default suite;

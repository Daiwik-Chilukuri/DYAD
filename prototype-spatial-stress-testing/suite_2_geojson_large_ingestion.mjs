import * as turf from '../dyad-app/node_modules/@turf/turf/dist/esm/index.js';

/**
 * Suite 2: Ingestion of Large GeoJSON Feature Collections into Simulated MapLibre Source Structures
 */

function scanForNaNOrInfinity(obj, path = '') {
  const anomalies = [];
  if (obj === null || obj === undefined) return anomalies;
  if (typeof obj === 'number') {
    if (Number.isNaN(obj)) anomalies.push(`${path}: NaN`);
    if (!Number.isFinite(obj)) anomalies.push(`${path}: ${obj > 0 ? '+Infinity' : '-Infinity'}`);
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      anomalies.push(...scanForNaNOrInfinity(obj[i], `${path}[${i}]`));
    }
  } else if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      anomalies.push(...scanForNaNOrInfinity(v, path ? `${path}.${k}` : k));
    }
  }
  return anomalies;
}

// Helper to generate synthetic Bengaluru GeoJSON features
function generateSyntheticBengaluruFeatures(count) {
  const features = [];
  const minLng = 77.45;
  const maxLng = 77.78;
  const minLat = 12.82;
  const maxLat = 13.10;

  const randLng = () => minLng + Math.random() * (maxLng - minLng);
  const randLat = () => minLat + Math.random() * (maxLat - minLat);

  for (let i = 0; i < count; i++) {
    const featureType = i % 3; // 0: Polygon, 1: LineString, 2: Point
    const id = `feat-${i}`;

    if (featureType === 0) {
      // Polygon (Lake, Slum, or Ward)
      const centerLng = randLng();
      const centerLat = randLat();
      const radiusKm = 0.2 + Math.random() * 0.8;
      const poly = turf.circle([centerLng, centerLat], radiusKm, {
        steps: 8 + (i % 16),
        units: 'kilometers',
        properties: {
          id,
          source_dataset: i % 4 === 0 ? 'visualizer-lakes.geojson' : i % 4 === 1 ? 'visualizer-slums.geojson' : i % 4 === 2 ? 'visualizer-wards.geojson' : 'visualizer-wetlands.geojson',
          lake_name: i % 4 === 0 ? `Bellandur Sector ${i}` : undefined,
          Slum_Name: i % 4 === 1 ? `Ejipura Settlement ${i}` : undefined,
          WARD_NAME: i % 4 === 2 ? `Ward ${150 + (i % 50)}` : undefined,
          intersection_area_sqm: Math.round(15000 + Math.random() * 85000),
          overlap_pct: Math.round(Math.random() * 100),
        },
      });
      features.push(poly);
    } else if (featureType === 1) {
      // LineString (Rajakaluve storm drain or transit viaduct)
      const startLng = randLng();
      const startLat = randLat();
      const numVerts = 4 + (i % 20);
      const coords = [[startLng, startLat]];
      for (let v = 1; v < numVerts; v++) {
        const prev = coords[v - 1];
        coords.push([prev[0] + (Math.random() - 0.5) * 0.01, prev[1] + (Math.random() - 0.5) * 0.01]);
      }
      features.push({
        type: 'Feature',
        id,
        properties: {
          id,
          source_dataset: 'visualizer-rajakaluves.geojson',
          name: `Storm Channel Drain #${i}`,
          length_m: Math.round(500 + Math.random() * 4000),
          risk_level: i % 3 === 0 ? 'HIGH' : 'MEDIUM',
        },
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      });
    } else {
      // Point (POI, Bus Stop, Anchor Hub)
      features.push({
        type: 'Feature',
        id,
        properties: {
          id,
          name: `Anchor Point ${i}`,
          category: ['corporate', 'hospital', 'education', 'civic'][i % 4],
          hub_name: i % 2 === 0 ? `Metro Interchange Node ${i}` : undefined,
          bus_stop: i % 3 === 0 ? `BMTC Stop ${i}` : undefined,
          footfall_daily: Math.round(1000 + Math.random() * 25000),
        },
        geometry: {
          type: 'Point',
          coordinates: [randLng(), randLat()],
        },
      });
    }
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Simulated MapLibre GeoJSONSource with layer-specific filter dispatch
 */
class SimulatedMapLibreSource {
  constructor(id) {
    this.id = id;
    this.data = { type: 'FeatureCollection', features: [] };
    this.layers = new Map();
    this.history = [];
  }

  registerLayer(layerId, filterFn, propertyExtractor) {
    this.layers.set(layerId, { filterFn, propertyExtractor, renderedItems: [] });
  }

  setData(geoJson) {
    if (!geoJson || geoJson.type !== 'FeatureCollection') {
      throw new Error(`Invalid GeoJSON: expected FeatureCollection, got ${geoJson?.type}`);
    }
    this.data = geoJson;
    const features = geoJson.features || [];

    // Dispatch to registered layer filters
    for (const [layerId, layer] of this.layers.entries()) {
      layer.renderedItems = [];
      for (const feat of features) {
        if (layer.filterFn(feat)) {
          const props = layer.propertyExtractor ? layer.propertyExtractor(feat) : feat.properties;
          layer.renderedItems.push({
            id: feat.id,
            geometryType: feat.geometry?.type,
            properties: props,
          });
        }
      }
    }
  }

  getLayerItemCount(layerId) {
    return this.layers.get(layerId)?.renderedItems.length || 0;
  }
}

export async function runSuite2() {
  console.log('----------------------------------------------------------------------');
  console.log(' [SUITE 2] Large GeoJSON Feature Collection Ingestion (MapLibre Sim)');
  console.log('----------------------------------------------------------------------');

  let passed = 0;
  let failed = 0;
  const failures = [];

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
  }

  function test(name, fn) {
    const t0 = performance.now();
    try {
      fn();
      const elapsed = (performance.now() - t0).toFixed(2);
      console.log(`  ✓ PASS: ${name} (${elapsed}ms)`);
      passed++;
    } catch (err) {
      const elapsed = (performance.now() - t0).toFixed(2);
      console.log(`  ✖ FAIL: ${name} (${elapsed}ms) - ${err.message}`);
      failed++;
      failures.push({ name, error: err.message });
    }
  }

  // Setup simulated source with MapCanvas.tsx exact layer filters
  function createVisualizerSource() {
    const source = new SimulatedMapLibreSource('visualizer-features-source');

    // Layer: visualizer-polygons-fill
    source.registerLayer(
      'visualizer-polygons-fill',
      f => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'),
      f => ({
        lake: (f.properties?.source_dataset || '').includes('lake'),
        wetland: (f.properties?.source_dataset || '').includes('wetland'),
        slum: (f.properties?.source_dataset || '').includes('slum'),
        ward: (f.properties?.source_dataset || '').includes('ward'),
      })
    );

    // Layer: visualizer-lines
    source.registerLayer(
      'visualizer-lines',
      f => f.geometry && (f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'),
      f => ({ name: f.properties?.name })
    );

    // Layer: visualizer-points
    source.registerLayer(
      'visualizer-points',
      f => f.geometry && f.geometry.type === 'Point',
      f => ({ hub: !!f.properties?.hub_name, bus: !!f.properties?.bus_stop })
    );

    return source;
  }

  test('LG1: Ingest 1,000 mixed features into simulated MapLibre source in <100ms', () => {
    const fc1000 = generateSyntheticBengaluruFeatures(1000);
    assert(fc1000.features.length === 1000, 'Must have 1000 features');

    const source = createVisualizerSource();
    const t0 = performance.now();
    source.setData(fc1000);
    const elapsed = performance.now() - t0;

    assert(elapsed < 100, `Ingestion took ${elapsed.toFixed(2)}ms, exceeding 100ms limit`);
    const polyCount = source.getLayerItemCount('visualizer-polygons-fill');
    const lineCount = source.getLayerItemCount('visualizer-lines');
    const pointCount = source.getLayerItemCount('visualizer-points');

    assert(polyCount > 300, `Expected >300 polygons, got ${polyCount}`);
    assert(lineCount > 300, `Expected >300 lines, got ${lineCount}`);
    assert(pointCount > 300, `Expected >300 points, got ${pointCount}`);
    assert(polyCount + lineCount + pointCount === 1000, 'All features must be categorized');
    const anomalies = scanForNaNOrInfinity(source.data);
    assert(anomalies.length === 0, `NaN/Infinity found: ${anomalies.join(', ')}`);
  });

  test('LG2: Ingest 2,500 mixed features under load in <200ms', () => {
    const fc2500 = generateSyntheticBengaluruFeatures(2500);
    const source = createVisualizerSource();
    const t0 = performance.now();
    source.setData(fc2500);
    const elapsed = performance.now() - t0;

    assert(elapsed < 200, `2500 features took ${elapsed.toFixed(2)}ms (target < 200ms)`);
    assert(source.data.features.length === 2500);
    const anomalies = scanForNaNOrInfinity(source.data);
    assert(anomalies.length === 0, `Detected NaN/Infinity in 2500 features: ${anomalies.join(', ')}`);
  });

  test('LG3: Stress-test 5,000 mixed features ingestion with full layer dispatch in <400ms', () => {
    const fc5000 = generateSyntheticBengaluruFeatures(5000);
    const source = createVisualizerSource();
    const t0 = performance.now();
    source.setData(fc5000);
    const elapsed = performance.now() - t0;

    assert(elapsed < 400, `5000 features took ${elapsed.toFixed(2)}ms (target < 400ms)`);
    const polyCount = source.getLayerItemCount('visualizer-polygons-fill');
    const lineCount = source.getLayerItemCount('visualizer-lines');
    const pointCount = source.getLayerItemCount('visualizer-points');
    assert(polyCount + lineCount + pointCount === 5000);
  });

  test('LG4: Spatial Turf.js pointsWithinPolygon clipping against 1,000 POIs inside 2km buffer completes in <50ms', () => {
    const corridorOrigin = [77.6245, 12.9176];
    const corridorDest = [77.6890, 12.9230];
    const corridorLine = turf.lineString([corridorOrigin, corridorDest]);
    const buffer = turf.buffer(corridorLine, 2.0, { units: 'kilometers' });

    // Generate 1,000 synthetic POI points around Bengaluru
    const poiPoints = [];
    for (let i = 0; i < 1000; i++) {
      const lng = 77.58 + Math.random() * 0.15;
      const lat = 12.88 + Math.random() * 0.10;
      poiPoints.push(turf.point([lng, lat], {
        id: `poi-${i}`,
        name: `Facility ${i}`,
        category: ['corporate', 'hospital', 'education', 'civic'][i % 4],
      }));
    }
    const poiFC = turf.featureCollection(poiPoints);

    const t0 = performance.now();
    const clipped = turf.pointsWithinPolygon(poiFC, buffer);
    const elapsed = performance.now() - t0;

    assert(elapsed < 50, `Turf pointsWithinPolygon clipping took ${elapsed.toFixed(2)}ms (>50ms budget)`);
    assert(clipped && clipped.type === 'FeatureCollection');
    assert(clipped.features.length >= 0);

    // Verify category aggregation matching MapCanvas.tsx logic
    const catCounts = { corporate: 0, hospital: 0, education: 0, civic: 0 };
    clipped.features.forEach(f => {
      const cat = f.properties?.category;
      if (cat && catCounts[cat] !== undefined) catCounts[cat]++;
    });

    const totalFromCats = catCounts.corporate + catCounts.hospital + catCounts.education + catCounts.civic;
    assert(totalFromCats === clipped.features.length, 'Category sum must equal total clipped POIs');
    const anomalies = scanForNaNOrInfinity(catCounts);
    assert(anomalies.length === 0, `NaN/Infinity found in stats: ${anomalies.join(', ')}`);
  });

  test('LG5: Degenerate GeoJSON features (null properties, empty coords, missing geometry) handled cleanly', () => {
    const source = createVisualizerSource();
    const degenerateFeatures = [
      { type: 'Feature', properties: null, geometry: { type: 'Point', coordinates: [77.62, 12.91] } },
      { type: 'Feature', properties: undefined, geometry: { type: 'LineString', coordinates: [[77.62, 12.91], [77.63, 12.92]] } },
      { type: 'Feature', properties: { name: 'No geom' }, geometry: null },
      { type: 'Feature', properties: { name: 'Undefined geom' }, geometry: undefined },
      {
        type: 'Feature',
        properties: { name: 'MultiPolygon with hole' },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [[
            [[77.60, 12.90], [77.62, 12.90], [77.62, 12.92], [77.60, 12.92], [77.60, 12.90]],
            [[77.605, 12.905], [77.615, 12.905], [77.615, 12.915], [77.605, 12.915], [77.605, 12.905]],
          ]],
        },
      },
    ];

    const fc = { type: 'FeatureCollection', features: degenerateFeatures };
    source.setData(fc);

    const polyCount = source.getLayerItemCount('visualizer-polygons-fill');
    const lineCount = source.getLayerItemCount('visualizer-lines');
    const pointCount = source.getLayerItemCount('visualizer-points');

    assert(pointCount === 1, 'Valid point must be indexed despite null properties');
    assert(lineCount === 1, 'Valid line must be indexed despite undefined properties');
    assert(polyCount === 1, 'Valid MultiPolygon must be indexed');
    assert(source.data.features.length === 5);
  });

  test('LG6: 50 consecutive re-ingestions simulate streaming updates without unbounded memory accumulation', () => {
    const source = createVisualizerSource();
    const heapBefore = process.memoryUsage().heapUsed;

    for (let round = 0; round < 50; round++) {
      const fc = generateSyntheticBengaluruFeatures(500);
      source.setData(fc);
    }

    const heapAfter = process.memoryUsage().heapUsed;
    const deltaMB = (heapAfter - heapBefore) / (1024 * 1024);
    // Delta should be modest (under 40MB for 50 x 500 features before garbage collection)
    assert(deltaMB < 40, `Memory delta is too high: ${deltaMB.toFixed(2)}MB`);
  });

  console.log(`\n  Suite 2 Results: ${passed} Passed, ${failed} Failed\n`);
  return { suite: 'Suite 2', passed, failed, failures };
}

if (process.argv[1] && process.argv[1].endsWith('suite_2_geojson_large_ingestion.mjs')) {
  runSuite2().then(r => {
    if (r.failed > 0) process.exit(1);
  });
}

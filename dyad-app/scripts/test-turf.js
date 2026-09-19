const turf = require('@turf/turf');
const fs = require('fs');
const fullPois = JSON.parse(fs.readFileSync('../public/data/bangalore_pois.geojson', 'utf8'));

const origin = [77.6245, 12.9176]; // Silk board
const terminus = [77.6974, 12.9279]; // Ecospace

const line = turf.lineString([origin, terminus]);
const buffer = turf.buffer(line, 2.0, { units: 'kilometers' });

const poisInside = turf.pointsWithinPolygon(fullPois, buffer);
console.log("Total POIs: " + fullPois.features.length);
console.log("POIs inside buffer: " + poisInside.features.length);

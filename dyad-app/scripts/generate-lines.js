const fs = require('fs');
const path = require('path');

// 1. Read bmrcl.geojson for green and purple
const bmrcl = JSON.parse(fs.readFileSync(path.join(__dirname, 'bmrcl.geojson'), 'utf8'));

// 2. Read metro_stations.geojson to get exact coordinates of all Yellow line stations
const stations = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/metro_stations.geojson'), 'utf8'));
const yellowStations = stations.features.filter(f => f.properties.color === 'yellow');
const yellowCoords = yellowStations.map(f => f.geometry.coordinates);

const features = [];

// Add Green & Purple Lines from bmrcl
for (const f of bmrcl.features) {
  if (f.properties.colour === 'green') {
    features.push({
      type: 'Feature',
      geometry: f.geometry,
      properties: { name: 'Green Line', colour: 'green' }
    });
  } else if (f.properties.colour === 'purple') {
    features.push({
      type: 'Feature',
      geometry: f.geometry,
      properties: { name: 'Purple Line', colour: 'purple' }
    });
  }
}

// Add Yellow Line connecting all yellow stations
features.push({
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: yellowCoords
  },
  properties: {
    name: 'Yellow Line',
    colour: 'yellow'
  }
});

const outGeoJSON = {
  type: 'FeatureCollection',
  features: features
};

const outPath = path.join(__dirname, '../public/data/metro_lines.geojson');
fs.writeFileSync(outPath, JSON.stringify(outGeoJSON, null, 2));

console.log(`Generated ${outPath} with ${features.length} metro lines:`);
features.forEach(f => console.log(`- ${f.properties.name}: ${f.geometry.coordinates.length} vertices`));

const fs = require('fs');
const path = require('path');

const inPath = path.join(__dirname, 'bmrcl.geojson');
const rawData = fs.readFileSync(inPath, 'utf8');
const geojson = JSON.parse(rawData);

// Check if Yellow line already exists
if (!geojson.features.some(f => f.properties.colour === 'yellow')) {
  const yellowLineCoords = [
    [77.5802, 12.9213], // RV Road
    [77.5855, 12.9174], // Jayadeva
    [77.6245, 12.9176], // Silk Board
    [77.6385, 12.8906], // HSR
    [77.6534, 12.8616], // Electronic City
    [77.6713, 12.8354], // Huskur
    [77.6836, 12.8159]  // Bommasandra
  ];
  
  geojson.features.push({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: yellowLineCoords },
    properties: { colour: 'yellow', name: 'Yellow Line' }
  });
  
  fs.writeFileSync(inPath, JSON.stringify(geojson));
  console.log("Added synthetic Yellow Line.");
} else {
  console.log("Yellow Line already exists.");
}

// Regenerate stations to include Yellow line stations!
const generateStations = require('child_process').execSync('node generate-stations.js', { cwd: __dirname });
console.log(generateStations.toString());

const fs = require('fs');
const path = require('path');

const BBOX = '12.80,77.45,13.15,77.80';
const query = `
[out:json][timeout:90];
(
  node["railway"="station"]["network"="Namma Metro"](${BBOX});
  way["railway"="station"]["network"="Namma Metro"](${BBOX});
);
out center;
`;

const MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter'
];

async function fetchStations() {
  console.log('Fetching Stations from Overpass...');
  
  let data = null;
  for (const mirror of MIRRORS) {
    try {
      console.log(`Trying mirror: ${mirror}`);
      const res = await fetch(mirror, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'PrayasPrototype/1.0 (contact@prayas.app)'
        },
        body: 'data=' + encodeURIComponent(query),
        signal: AbortSignal.timeout(60000)
      });
      const text = await res.text();
      if (!res.ok) {
        console.log(`Mirror ${mirror} failed with status ${res.status}`);
        continue;
      }
      data = JSON.parse(text);
      console.log(`Successfully fetched from ${mirror}`);
      break;
    } catch (err) {
      console.log(`Mirror ${mirror} error:`, err.message);
    }
  }
  
  if (!data || !data.elements) {
    console.error("Failed to fetch data.");
    return;
  }
  
  const features = [];
  for (const el of data.elements) {
    if (!el.tags || !el.tags.name) continue;
    
    const lat = el.lat || el.center?.lat;
    const lon = el.lon || el.center?.lon;
    
    let color = 'white';
    const name = el.tags.name.toLowerCase();
    if (name.includes('green') || (el.tags.line && el.tags.line.toLowerCase().includes('green'))) color = 'green';
    if (name.includes('purple') || (el.tags.line && el.tags.line.toLowerCase().includes('purple'))) color = 'purple';
    
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        name: el.tags.name,
        color: color
      }
    });
  }
  
  const featureCollection = {
    type: 'FeatureCollection',
    features: features
  };
  
  const outPath = path.join(__dirname, '../public/data/metro_stations.geojson');
  fs.writeFileSync(outPath, JSON.stringify(featureCollection));
  console.log(`Saved ${features.length} stations to ${outPath}`);
}

fetchStations();

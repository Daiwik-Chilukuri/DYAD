const fs = require('fs');
const path = require('path');
const osmtogeojson = require('osmtogeojson');

const query = `
[out:json][timeout:90];
(
  relation["network"="Namma Metro"];
  way["railway"="subway"]["network"="Namma Metro"];
  way["railway"="light_rail"]["network"="Namma Metro"];
  way["railway"="monorail"]["network"="Namma Metro"];
  way["railway"="train"]["network"="Namma Metro"];
  // Sometimes mapped just as railway=construction + network=Namma Metro
  way["railway"="construction"]["network"="Namma Metro"];
);
out body;
>;
out skel qt;
`;

const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter'
];

async function fetchLines() {
  console.log('Fetching Namma Metro Lines from Overpass...');
  
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
  
  if (!data) {
    console.error("Failed to fetch data.");
    return;
  }

  // Use osmtogeojson if available, or just map ways
  let geojson;
  try {
    const convert = require('osmtogeojson');
    geojson = convert(data);
  } catch (e) {
    console.log("osmtogeojson not installed, doing manual conversion...");
    // Very naive fallback if osmtogeojson not installed
    const nodes = {};
    data.elements.forEach(el => { if (el.type === 'node') nodes[el.id] = [el.lon, el.lat]; });
    const features = [];
    data.elements.forEach(el => {
      if (el.type === 'way') {
        const coords = el.nodes.map(n => nodes[n]).filter(Boolean);
        if (coords.length > 1) {
           let color = 'gray';
           const tagsStr = JSON.stringify(el.tags || {}).toLowerCase();
           if (tagsStr.includes('green')) color = 'green';
           else if (tagsStr.includes('purple')) color = 'purple';
           else if (tagsStr.includes('yellow')) color = 'yellow';
           else if (tagsStr.includes('pink')) color = 'pink';
           else if (tagsStr.includes('blue')) color = 'blue';

           features.push({
             type: 'Feature',
             geometry: { type: 'LineString', coordinates: coords },
             properties: { color: color, ...el.tags }
           });
        }
      }
    });
    geojson = { type: 'FeatureCollection', features };
  }
  
  // We need to parse colors from the relation if using osmtogeojson
  geojson.features.forEach(f => {
    let color = f.properties.color || f.properties.colour;
    if (!color) {
      const tagsStr = JSON.stringify(f.properties).toLowerCase();
      if (tagsStr.includes('green')) color = 'green';
      else if (tagsStr.includes('purple')) color = 'purple';
      else if (tagsStr.includes('yellow')) color = '#eab308';
      else if (tagsStr.includes('pink')) color = 'pink';
      else if (tagsStr.includes('blue')) color = '#38bdf8';
      else color = 'gray';
    }
    f.properties.colour = color;
  });

  const outPath = path.join(__dirname, '../public/data/all_metro_lines.geojson');
  fs.writeFileSync(outPath, JSON.stringify(geojson));
  console.log(`Saved ${geojson.features.length} lines to ${outPath}`);
}

fetchLines();

const fs = require('fs');
const path = require('path');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const BBOX = '12.80,77.45,13.15,77.80';

const query = `
[out:json][timeout:90];
(
  // Major Corporate / Tech Parks only
  node["office"="it"](${BBOX});
  way["office"="it"](${BBOX});
  way["landuse"="commercial"]["name"](${BBOX});
  
  // Major Hospitals only (exclude small clinics)
  node["amenity"="hospital"](${BBOX});
  way["amenity"="hospital"](${BBOX});
  
  // Universities & Colleges
  node["amenity"="college"](${BBOX});
  way["amenity"="college"](${BBOX});
  node["amenity"="university"](${BBOX});
  way["amenity"="university"](${BBOX});
  
  // Civic & Government
  node["office"="government"](${BBOX});
  way["office"="government"](${BBOX});
  node["amenity"="courthouse"](${BBOX});
  way["amenity"="courthouse"](${BBOX});
);
out center;
`;

const MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter'
];

async function fetchPOIs() {
  console.log('Fetching POIs from Overpass...');
  
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
    console.error("Failed to fetch data from all Overpass mirrors.");
    return;
  }
    
    const features = [];
    
    for (const el of data.elements) {
      if (!el.tags || !el.tags.name) continue;
      
      let category = 'civic';
      if (el.tags.office === 'it' || el.tags.landuse === 'commercial') category = 'corporate';
      else if (el.tags.amenity === 'hospital') category = 'hospital';
      else if (el.tags.amenity === 'college' || el.tags.amenity === 'university' || el.tags.amenity === 'school') category = 'education';
      
      const lat = el.lat || el.center?.lat;
      const lon = el.lon || el.center?.lon;
      
      if (!lat || !lon) continue;
      
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {
          name: el.tags.name,
          category: category,
          agent: `Auto-ingested ${category} facility mapped from OpenStreetMap.`
        }
      });
    }
    
    // De-duplicate features near the same location with same name
    const uniqueFeatures = [];
    const seen = new Set();
    for (const f of features) {
      const key = `${f.properties.name.toLowerCase().trim()}-${f.properties.category}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueFeatures.push(f);
      }
    }
    
    const featureCollection = {
      type: 'FeatureCollection',
      features: uniqueFeatures
    };
    
    const outPath = path.join(__dirname, '../public/data/bangalore_pois.geojson');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(featureCollection));
    
    console.log(`Saved ${uniqueFeatures.length} unique POIs to ${outPath}`);
}

fetchPOIs();

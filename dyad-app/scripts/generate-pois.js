const fs = require('fs');
const path = require('path');

const bounds = {
  minLng: 77.53,
  maxLng: 77.75,
  minLat: 12.85,
  maxLat: 13.05
};

const prefixes = {
  corporate: ['Tech', 'Cyber', 'Innovate', 'Global', 'Prime', 'Apex', 'Matrix', 'Nexus'],
  suffixes_corporate: ['Park', 'Hub', 'City', 'Tower', 'Plaza', 'Center'],
  
  hospital: ['City', 'Narayana', 'Manipal', 'Apollo', 'Aster', 'Fortis', 'Care'],
  suffixes_hospital: ['Hospital', 'Medical Center', 'Health City', 'Clinic', 'Institute'],
  
  education: ['Institute of', 'Academy of', 'Global', 'National', 'State'],
  suffixes_education: ['University', 'College', 'School', 'Technology', 'Sciences'],
  
  civic: ['District', 'City', 'State', 'Central'],
  suffixes_civic: ['Court', 'Townhall', 'HQ', 'Office', 'Registry', 'Authority']
};

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePOIs(count) {
  const features = [];
  const categories = ['corporate', 'hospital', 'education', 'civic'];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    let name = '';
    if (category === 'corporate') name = `${randomItem(prefixes.corporate)} ${randomItem(prefixes.suffixes_corporate)}`;
    if (category === 'hospital') name = `${randomItem(prefixes.hospital)} ${randomItem(prefixes.suffixes_hospital)}`;
    if (category === 'education') name = `${randomItem(prefixes.education)} ${randomItem(prefixes.suffixes_education)}`;
    if (category === 'civic') name = `${randomItem(prefixes.civic)} ${randomItem(prefixes.suffixes_civic)}`;
    
    // Add some random string to make it unique
    name += ` ${Math.floor(Math.random() * 100)}`;
    
    const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
    const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
    
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        name: name,
        category: category,
        agent: `Auto-ingested ${category} facility. High-frequency transit node mapped from spatial intelligence.`
      }
    });
  }
  
  // Add our known specific ones
  features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [77.6974, 12.9279] }, properties: { name: 'Ecospace Business Park', category: 'corporate', agent: 'High-density corporate cluster. Diverts massive peak-hour vehicular volume.' } });
  features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [77.6833, 12.9863] }, properties: { name: 'Bagmane Tech Park', category: 'corporate', agent: 'Secondary tech corridor anchor.' } });
  features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [77.6205, 12.9345] }, properties: { name: 'St. John’s Medical College', category: 'hospital', agent: 'Critical healthcare access node.' } });
  features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [77.5671, 13.0219] }, properties: { name: 'Indian Institute of Science (IISc)', category: 'education', agent: 'Premier research institute catchment.' } });
  features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [77.6046, 12.9784] }, properties: { name: 'Vidhana Soudha / High Court', category: 'civic', agent: 'Primary government and administrative hub.' } });
  features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [77.7289, 12.9868] }, properties: { name: 'ITPB / International Tech Park Whitefield', category: 'corporate', agent: 'Major eastern tech employment node.' } });
  
  return {
    type: 'FeatureCollection',
    features: features
  };
}

const geojson = generatePOIs(400); // 400 random POIs
const outPath = path.join(__dirname, '../public/data/bangalore_pois.geojson');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(geojson));

console.log(`Saved ${geojson.features.length} POIs to ${outPath}`);

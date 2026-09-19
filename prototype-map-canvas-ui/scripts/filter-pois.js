const fs = require('fs');
const path = require('path');

const inPath = path.join(__dirname, '../public/data/bangalore_pois.geojson');
const rawData = fs.readFileSync(inPath, 'utf8');
const geojson = JSON.parse(rawData);

// Filter keywords for "Major" POIs
const keywords = {
  corporate: ['park', 'tech', 'hub', 'campus', 'tower', 'itpb', 'infosys', 'wipro', 'tcs', 'accenture', 'business', 'sez', 'city'],
  hospital: ['hospital', 'medical', 'institute', 'health city'],
  education: ['university', 'institute', 'college', 'school', 'academy'],
  civic: ['court', 'government', 'bbmp', 'police', 'hq', 'station', 'bhavan', 'vidhana', 'soudha']
};

function isMajor(name, category) {
  if (!name) return false;
  const n = name.toLowerCase();
  
  // Specific exclusions
  if (n.includes('tea stall') || n.includes('bakery') || n.includes('grocery') || n.includes('pg') || n.includes('hostel')) {
    return false;
  }
  
  if (category === 'corporate') {
    return keywords.corporate.some(k => n.includes(k));
  }
  if (category === 'hospital') {
    return keywords.hospital.some(k => n.includes(k));
  }
  if (category === 'education') {
    return keywords.education.some(k => n.includes(k));
  }
  if (category === 'civic') {
    return keywords.civic.some(k => n.includes(k));
  }
  
  return true;
}

const originalCount = geojson.features.length;

// Ensure we always keep our hardcoded top 6
const top6Names = [
  'Ecospace Business Park',
  'Bagmane Tech Park',
  'St. John’s Medical College',
  'Indian Institute of Science (IISc)',
  'Vidhana Soudha / High Court',
  'ITPB / International Tech Park Whitefield'
];

geojson.features = geojson.features.filter(f => {
  if (top6Names.includes(f.properties.name)) return true;
  return isMajor(f.properties.name, f.properties.category);
});

const finalCount = geojson.features.length;

fs.writeFileSync(inPath, JSON.stringify(geojson));

console.log(`Filtered dataset from ${originalCount} down to ${finalCount} major POIs.`);

const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

const inPath = path.join(__dirname, 'bmrcl.geojson');
const rawData = fs.readFileSync(inPath, 'utf8');
const linesGeojson = JSON.parse(rawData);

const stationNames = {
  purple: [
    'Whitefield', 'Hopefarm Channasandra', 'Kadugodi', 'Pattandur Agrahara', 'Sri Sathya Sai Hospital', 'Nallurhalli', 'Kundalahalli', 'Seetharamapalya', 'Hoodi', 'Garudacharapalya', 'Mahadevapura', 'KR Puram', 'Benniganahalli', 'Baiyappanahalli', 'Swami Vivekananda Road', 'Indiranagar', 'Halasuru', 'Trinity', 'MG Road', 'Cubbon Park', 'Vidhana Soudha', 'Sir M Visvesvaraya', 'Majestic', 'City Railway Station', 'Magadi Road', 'Hosahalli', 'Vijayanagar', 'Attiguppe', 'Deepanjali Nagar', 'Mysuru Road', 'Nayandahalli', 'Rajarajeshwari Nagar', 'Jnanabharathi', 'Pattanagere', 'Kengeri Bus Terminal', 'Kengeri', 'Challaghatta'
  ],
  green: [
    'Nagasandra', 'Dasarahalli', 'Jalahalli', 'Peenya Industry', 'Peenya', 'Goraguntepalya', 'Yeshwanthpur', 'Sandal Soap Factory', 'Mahalakshmi', 'Rajajinagar', 'Kuvempu Road', 'Srirampura', 'Mantri Square', 'Majestic', 'Chickpete', 'KR Market', 'National College', 'Lalbagh', 'South End Circle', 'Jayanagar', 'RV Road', 'Banashankari', 'JP Nagar', 'Yelachenahalli', 'Konanakunte Cross', 'Doddakallasandra', 'Vajarahalli', 'Thalaghattapura', 'Silk Institute'
  ],
  yellow: [
    'RV Road', 'Ragigudda', 'Jayadeva', 'BTM Layout', 'Central Silk Board', 'Bommanahalli', 'Hongasandra', 'Kudlu Gate', 'Singasandra', 'Hosa Road', 'Beratena Agrahara', 'Electronic City', 'Infosys Foundation', 'Huskur Road', 'Hebbagodi', 'Bommasandra'
  ]
};

const stations = [];

linesGeojson.features.forEach((feature, index) => {
  if (feature.geometry.type === 'LineString') {
    const line = feature;
    let color = feature.properties.colour || (index === 0 ? 'purple' : 'green');
    const length = turf.length(line, { units: 'kilometers' });
    
    let names = stationNames[color] || [];
    const interval = length / Math.max(1, names.length - 1);
    
    let distance = 0;
    for (let i = 0; i < names.length; i++) {
      const point = turf.along(line, distance, { units: 'kilometers' });
      point.properties = {
        name: names[i],
        color: color
      };
      stations.push(point);
      distance += interval;
    }
  }
});

const featureCollection = {
  type: 'FeatureCollection',
  features: stations
};

const outPath = path.join(__dirname, '../public/data/metro_stations.geojson');
fs.writeFileSync(outPath, JSON.stringify(featureCollection));
console.log(`Synthesized ${stations.length} metro stations with REAL labels.`);

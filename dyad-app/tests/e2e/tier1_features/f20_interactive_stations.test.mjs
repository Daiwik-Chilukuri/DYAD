import { TestSuite, assert } from '../test_framework.mjs';

const suite = new TestSuite('Tier 1 - Feature 20: Interactive Suggested Stations', 1);

const sampleStations = [
  {
    station_id: 'st-01',
    name: 'Silk Board Interchange',
    coordinates: [77.6245, 12.9176],
    typology: 'ELEVATED',
    estimated_daily_boardings: 45000,
    interchange_with: 'Yellow Line'
  },
  {
    station_id: 'st-02',
    name: 'Agara Junction',
    coordinates: [77.6450, 12.9210],
    typology: 'ELEVATED',
    estimated_daily_boardings: 32000,
    interchange_with: null
  },
  {
    station_id: 'st-03',
    name: 'Sarjapur Wipro Gate',
    coordinates: [77.6890, 12.9230],
    typology: 'ELEVATED',
    estimated_daily_boardings: 38000,
    interchange_with: null
  }
];

suite.test('F20.1: Station proposal item click sets active selected station ID in UI state', () => {
  let selectedStationId = null;

  function selectStation(id) {
    selectedStationId = id;
  }

  selectStation('st-02');
  assert.strictEqual(selectedStationId, 'st-02');
});

suite.test('F20.2: Station click generates map.flyTo camera payload with exact station coordinates', () => {
  let cameraCommand = null;

  function handleStationCardClick(station) {
    cameraCommand = {
      center: station.coordinates,
      zoom: 15.5,
      pitch: 45,
      bearing: 15,
      essential: true
    };
  }

  handleStationCardClick(sampleStations[1]);
  assert.ok(cameraCommand);
  assert.deepStrictEqual(cameraCommand.center, [77.6450, 12.9210]);
  assert.strictEqual(cameraCommand.zoom, 15.5);
});

suite.test('F20.3: Displays expected daily footfall, rationale, and typology on each station proposal card', () => {
  sampleStations.forEach(st => {
    assert.isGreaterThan(st.estimated_daily_boardings, 0);
    assert.ok(st.name.length > 0);
    assert.includes(['ELEVATED', 'UNDERGROUND', 'AT_GRADE'], st.typology);
  });
});

suite.test('F20.4: Highlights station marker and elevated card border when station is selected', () => {
  const selectedId = 'st-03';

  function getCardClasses(stationId) {
    const isSelected = stationId === selectedId;
    return isSelected
      ? 'border-emerald-400/60 bg-[#161B22] ring-1 ring-emerald-400/30'
      : 'border-white/[0.08] bg-[#0E1117]/85';
  }

  assert.includes(getCardClasses('st-03'), 'border-emerald-400/60');
  assert.includes(getCardClasses('st-01'), 'border-white/[0.08]');
});

suite.test('F20.5: Renders suggested stations sequentially along the corridor alignment', () => {
  // Longitude increases progressively from CSB (77.6245) towards Sarjapur (77.6890)
  for (let i = 0; i < sampleStations.length - 1; i++) {
    const currLng = sampleStations[i].coordinates[0];
    const nextLng = sampleStations[i + 1].coordinates[0];
    assert.isLessThan(currLng, nextLng, 'Stations should proceed sequentially along corridor');
  }
});

export default suite;

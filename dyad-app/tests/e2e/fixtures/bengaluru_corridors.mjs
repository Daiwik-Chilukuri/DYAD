/**
 * Curated Bengaluru corridor fixtures, station locations, and reference properties
 * for DYAD E2E opaque-box testing.
 */

export const BENGALURU_BBOX = {
  minLng: 77.45,
  minLat: 12.80,
  maxLng: 77.78,
  maxLat: 13.10
};

export const NAMMA_METRO_STATIONS = {
  SILK_BOARD: {
    id: 'csb-yellow',
    name: 'Central Silk Board',
    line: 'yellow',
    coordinates: [77.6245, 12.9176],
    isInterchange: true
  },
  INDIRANAGAR: {
    id: 'indiranagar-purple',
    name: 'Indiranagar',
    line: 'purple',
    coordinates: [77.6405, 12.9735],
    isInterchange: false
  },
  MAJESTIC: {
    id: 'majestic-interchange',
    name: 'Nadaprabhu Kempegowda Station Majestic',
    line: 'green',
    coordinates: [77.5726, 12.9781],
    isInterchange: true
  },
  KR_PURAM: {
    id: 'kr-puram-purple',
    name: 'KR Puram',
    line: 'purple',
    coordinates: [77.6974, 13.0003],
    isInterchange: true
  },
  WHITEFIELD: {
    id: 'whitefield-purple',
    name: 'Whitefield Kadugodi',
    line: 'purple',
    coordinates: [77.7499, 12.9698],
    isInterchange: false
  },
  ELECTRONIC_CITY: {
    id: 'ecity-yellow',
    name: 'Electronic City Phase 1',
    line: 'yellow',
    coordinates: [77.6740, 12.8450],
    isInterchange: false
  },
  RV_ROAD: {
    id: 'rv-road-green',
    name: 'RV Road',
    line: 'green',
    coordinates: [77.5801, 12.9176],
    isInterchange: true
  },
  BELLANDUR: {
    id: 'bellandur-blue',
    name: 'Bellandur',
    line: 'blue',
    coordinates: [77.6750, 12.9360],
    isInterchange: false
  }
};

export const REAL_WORLD_CORRIDORS = {
  SILK_BOARD_SARJAPUR: {
    id: 'corridor-sb-sarjapur',
    name: 'Silk Board to Sarjapur Corridor',
    origin: {
      name: 'Central Silk Board',
      coordinates: [77.6245, 12.9176],
      line: 'yellow'
    },
    destination: {
      name: 'Sarjapur Wipro Campus',
      coordinates: [77.6890, 12.9230]
    },
    expectedLengthKmRange: [6.5, 8.5],
    defaultCatchmentMeters: 2000,
    expectedPillars: {
      demographics: { minPop500m: 15000, minPop1500m: 60000, minEquity: 60 },
      economic: { minTechParks: 2, minFareboxCr: 80 },
      mobility: { minTimeSavedMins: 20, minCongestionDropPct: 18 },
      ecological: { minLakeInfringements: 1, ktfdStatus: 'FLAGGED' }
    }
  },

  KR_PURAM_WHITEFIELD: {
    id: 'corridor-krp-whitefield',
    name: 'KR Puram to Whitefield Extension',
    origin: {
      name: 'KR Puram',
      coordinates: [77.6974, 13.0003],
      line: 'purple'
    },
    destination: {
      name: 'Whitefield Kadugodi',
      coordinates: [77.7583, 12.9961]
    },
    expectedLengthKmRange: [6.0, 8.0],
    defaultCatchmentMeters: 1500,
    expectedPillars: {
      demographics: { minPop500m: 20000, minPop1500m: 80000, minEquity: 70 },
      economic: { minTechParks: 4, minFareboxCr: 120 },
      mobility: { minTimeSavedMins: 25, minCongestionDropPct: 22 },
      ecological: { minLakeInfringements: 0, ktfdStatus: 'COMPLIANT' }
    }
  },

  ECITY_BANNERGHATTA: {
    id: 'corridor-ecity-bannerghatta',
    name: 'Electronic City to Bannerghatta Link',
    origin: {
      name: 'Electronic City Phase 1',
      coordinates: [77.6740, 12.8450],
      line: 'yellow'
    },
    destination: {
      name: 'Bannerghatta Hulimavu',
      coordinates: [77.5990, 12.8750]
    },
    expectedLengthKmRange: [8.5, 11.5],
    defaultCatchmentMeters: 2000,
    expectedPillars: {
      demographics: { minPop500m: 10000, minPop1500m: 45000, minEquity: 65 },
      economic: { minTechParks: 3, minFareboxCr: 90 },
      mobility: { minTimeSavedMins: 28, minCongestionDropPct: 20 },
      ecological: { minLakeInfringements: 1, ktfdStatus: 'FLAGGED' }
    }
  },

  MAJESTIC_HEBBAL: {
    id: 'corridor-majestic-hebbal',
    name: 'Majestic to Hebbal Flyover Core Spine',
    origin: {
      name: 'Nadaprabhu Kempegowda Station Majestic',
      coordinates: [77.5726, 12.9781],
      line: 'green'
    },
    destination: {
      name: 'Hebbal Junction',
      coordinates: [77.5912, 13.0358]
    },
    expectedLengthKmRange: [6.5, 8.5],
    defaultCatchmentMeters: 1500,
    expectedPillars: {
      demographics: { minPop500m: 35000, minPop1500m: 120000, minEquity: 75 },
      economic: { minTechParks: 1, minFareboxCr: 140 },
      mobility: { minTimeSavedMins: 30, minCongestionDropPct: 30 },
      ecological: { minLakeInfringements: 1, ktfdStatus: 'FLAGGED' }
    }
  },

  ORR_LINE3_BELLANDUR_MAHADEVAPURA: {
    id: 'corridor-orr-line3',
    name: 'Outer Ring Road Line 3 (Bellandur to Mahadevapura)',
    origin: {
      name: 'Bellandur Station',
      coordinates: [77.6750, 12.9360],
      line: 'blue'
    },
    destination: {
      name: 'Mahadevapura',
      coordinates: [77.7010, 12.9920]
    },
    expectedLengthKmRange: [6.0, 8.5],
    defaultCatchmentMeters: 2000,
    expectedPillars: {
      demographics: { minPop500m: 25000, minPop1500m: 90000, minEquity: 72 },
      economic: { minTechParks: 6, minFareboxCr: 210 },
      mobility: { minTimeSavedMins: 35, minCongestionDropPct: 32 },
      ecological: { minLakeInfringements: 2, ktfdStatus: 'CRITICAL_BREACH' }
    }
  }
};

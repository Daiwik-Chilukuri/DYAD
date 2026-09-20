export interface CityConfig {
  id: 'india' | 'bengaluru' | 'delhi' | 'hyderabad';
  name: string;
  stateOrCountry: string;
  badge: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
  intelHeadline: string;
  intelSubtext: string;
  buttonText: string;
  metrics: {
    peakSpeed: string;
    speedDelta: string;
    annualLoss: string;
    corridorPressure: string;
    pphpd: string;
    metroLines: string;
  };
  highlightCorridors: {
    name: string;
    coords: [number, number][];
    color: string;
    status: 'Operational' | 'Phase 2/3' | 'Feasibility';
  }[];
}

export const CITIES_CONFIG: Record<string, CityConfig> = {
  india: {
    id: 'india',
    name: 'India',
    stateOrCountry: 'National Network',
    badge: 'Country Overview',
    center: [78.9629, 21.2],
    zoom: 4.3,
    pitch: 20,
    bearing: 0,
    intelHeadline: 'New Delhi was the 4th most congested city in India',
    intelSubtext: 'Over ₹1.2 Lakh Crore in transit capital projects currently undergoing feasibility assessment. Dyad compresses reconnaissance from 24 months to under 4 seconds.',
    buttonText: 'Explore India',
    metrics: {
      peakSpeed: '16.4 km/h',
      speedDelta: '-2.8% YoY',
      annualLoss: '₹1,20,000 Cr',
      corridorPressure: 'High National',
      pphpd: '42,000 max',
      metroLines: '16 Cities Active'
    },
    highlightCorridors: [
      {
        name: 'Delhi-NCR RRTS Delhi-Meerut',
        coords: [[77.2167, 28.6270], [77.7064, 28.9845]],
        color: '#f72585',
        status: 'Operational'
      },
      {
        name: 'Bengaluru Silk Board - Airport (Phase 2A/2B)',
        coords: [[77.6245, 12.9176], [77.6974, 12.9279], [77.7050, 13.1986]],
        color: '#0ab1ba',
        status: 'Phase 2/3'
      },
      {
        name: 'Hyderabad Airport Express Corridor',
        coords: [[78.3750, 17.4450], [78.4300, 17.2400]],
        color: '#00f5d4',
        status: 'Feasibility'
      }
    ]
  },
  bengaluru: {
    id: 'bengaluru',
    name: 'Bengaluru',
    stateOrCountry: 'Karnataka',
    badge: 'Target City • Primary Focus',
    center: [77.6200, 12.9750],
    zoom: 9.9,
    pitch: 54,
    bearing: -22,
    intelHeadline: 'Compared to 2024, Bengaluru saw a 4.2 percentage point increase in average congestion in 2025',
    intelSubtext: 'Silk Board to Bellandur ORR corridor faces severe choke points with 18,450 PPHPD peak pressure. Commuters lose 44 mins each way during rush hours.',
    buttonText: 'Explore Bengaluru',
    metrics: {
      peakSpeed: '13.9 km/h',
      speedDelta: '+4.2% Congestion',
      annualLoss: '₹20,000 Cr',
      corridorPressure: 'Critical Peak',
      pphpd: '18,450 PPHPD',
      metroLines: 'Namma Metro (5 Lines)'
    },
    highlightCorridors: [
      {
        name: 'Purple Line (Challaghatta → Majestic → Whitefield)',
        coords: [
          [77.4607, 12.8968],
          [77.4830, 12.9103],
          [77.5026, 12.9277],
          [77.5258, 12.9426],
          [77.5354, 12.9658],
          [77.5522, 12.9749],
          [77.5728, 12.9757],
          [77.6090, 12.9749],
          [77.6289, 12.9784],
          [77.6407, 12.9835],
          [77.6641, 12.9953],
          [77.6855, 13.0003],
          [77.7124, 12.9894],
          [77.7274, 12.9786],
          [77.7581, 12.9962]
        ],
        color: '#c084fc',
        status: 'Operational'
      },
      {
        name: 'Green Line (Madavara → Majestic → Silk Institute)',
        coords: [
          [77.4696, 13.0582],
          [77.5013, 13.0475],
          [77.5214, 13.0385],
          [77.5411, 13.0283],
          [77.5536, 13.0129],
          [77.5719, 12.9881],
          [77.5746, 12.9668],
          [77.5775, 12.9482],
          [77.5802, 12.9285],
          [77.5801, 12.9176],
          [77.5730, 12.9089],
          [77.5672, 12.8930],
          [77.5478, 12.8833],
          [77.5345, 12.8665],
          [77.5277, 12.8580]
        ],
        color: '#22c55e',
        status: 'Operational'
      },
      {
        name: 'Yellow Line (RV Road → Silk Board → Bommasandra)',
        coords: [
          [77.5802, 12.9213],
          [77.5899, 12.9174],
          [77.6009, 12.9174],
          [77.6120, 12.9175],
          [77.6230, 12.9175],
          [77.6288, 12.9092],
          [77.6338, 12.8996],
          [77.6387, 12.8900],
          [77.6437, 12.8803],
          [77.6486, 12.8707],
          [77.6536, 12.8611],
          [77.6598, 12.8522],
          [77.6659, 12.8432],
          [77.6720, 12.8342],
          [77.6778, 12.8250],
          [77.6836, 12.8159]
        ],
        color: '#eab308',
        status: 'Operational'
      }
    ]
  },
  delhi: {
    id: 'delhi',
    name: 'Delhi-NCR',
    stateOrCountry: 'National Capital Region',
    badge: 'High-Density Metro Hub',
    center: [77.1600, 28.6300],
    zoom: 9.3,
    pitch: 54,
    bearing: -20,
    intelHeadline: 'Compared to 2024, New Delhi saw a 3.5 percentage point increase in average congestion in 2025',
    intelSubtext: 'The 392km DMRC network carries over 6.2 million daily trips. Regional rapid transit lines (RRTS) expand suburban catchment into Uttar Pradesh & Haryana.',
    buttonText: 'Explore New Delhi',
    metrics: {
      peakSpeed: '15.2 km/h',
      speedDelta: '+3.5% Congestion',
      annualLoss: '₹34,000 Cr',
      corridorPressure: 'Severe Arterial',
      pphpd: '26,500 PPHPD',
      metroLines: 'DMRC (12 Lines + RRTS)'
    },
    highlightCorridors: [
      {
        name: 'Yellow Line (Samaypur Badli → Millennium City Centre Gurugram)',
        coords: [
          [77.1350, 28.7450],
          [77.2167, 28.6270],
          [77.0800, 28.4600]
        ],
        color: '#ffd166',
        status: 'Operational'
      },
      {
        name: 'Delhi-Meerut RRTS RapidX Spine',
        coords: [
          [77.2500, 28.5900],
          [77.3400, 28.6500],
          [77.4400, 28.7300],
          [77.7064, 28.9845]
        ],
        color: '#f72585',
        status: 'Phase 2/3'
      }
    ]
  },
  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad',
    stateOrCountry: 'Telangana',
    badge: 'IT & Bio-Pharma Corridor',
    center: [78.4500, 17.4000],
    zoom: 9.9,
    pitch: 54,
    bearing: -20,
    intelHeadline: 'Hyderabad saw significant traffic friction across HITEC City and the Financial District',
    intelSubtext: 'Phase-2 expansion targets high-density IT corridors from Raidurg to Rajiv Gandhi International Airport (RGIA) with 70% projected modal shift from personal cars.',
    buttonText: 'Simulate Hyderabad Corridors',
    metrics: {
      peakSpeed: '18.1 km/h',
      speedDelta: '+2.9% Congestion',
      annualLoss: '₹14,500 Cr',
      corridorPressure: 'High Tech Belt',
      pphpd: '14,200 PPHPD',
      metroLines: 'Hyderabad Metro (3 Lines)'
    },
    highlightCorridors: [
      {
        name: 'Airport Express Metro (Raidurg → Shamshabad RGIA)',
        coords: [
          [78.3750, 17.4450],
          [78.3650, 17.3900],
          [78.4100, 17.2900],
          [78.4300, 17.2400]
        ],
        color: '#00bbf9',
        status: 'Phase 2/3'
      },
      {
        name: 'Red Line (Miyapur → LB Nagar)',
        coords: [
          [78.3580, 17.4950],
          [78.4800, 17.4000],
          [78.5520, 17.3500]
        ],
        color: '#ef4444',
        status: 'Operational'
      }
    ]
  }
};

// Official Metropolitan Administrative Boundaries for City View Highlights

export interface CityBoundaryFeature {
  type: 'Feature';
  properties: {
    id: string;
    cityName: string;
    areaSqKm: number;
    color: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][][];
  };
}

export const CITY_BOUNDARIES: Record<string, CityBoundaryFeature> = {
  // 1. BENGALURU (BBMP Metropolitan Boundary ~800 sq km perimeter)
  bengaluru: {
    type: 'Feature',
    properties: {
      id: 'boundary-bengaluru',
      cityName: 'Bengaluru (BBMP Metropolitan Zone)',
      areaSqKm: 840,
      color: '#0ab1ba',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [77.5300, 13.1400],
        [77.5800, 13.1500],
        [77.6400, 13.1350],
        [77.6900, 13.1000],
        [77.7450, 13.0600],
        [77.7800, 13.0100],
        [77.7950, 12.9600],
        [77.7750, 12.9100],
        [77.7300, 12.8700],
        [77.6800, 12.8350],
        [77.6300, 12.8200],
        [77.5800, 12.8300],
        [77.5200, 12.8600],
        [77.4700, 12.9000],
        [77.4500, 12.9500],
        [77.4600, 13.0100],
        [77.4900, 13.0800],
        [77.5300, 13.1400],
      ]],
    },
  },

  // 2. DELHI-NCR (NCT Boundary ~1484 sq km)
  delhi: {
    type: 'Feature',
    properties: {
      id: 'boundary-delhi',
      cityName: 'Delhi-NCR (National Capital Territory)',
      areaSqKm: 1484,
      color: '#0ab1ba',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [77.1000, 28.8800],
        [77.2000, 28.8700],
        [77.2800, 28.8100],
        [77.3400, 28.7200],
        [77.3500, 28.6200],
        [77.3300, 28.5300],
        [77.2700, 28.4500],
        [77.1800, 28.4100],
        [77.0800, 28.4300],
        [76.9500, 28.5200],
        [76.9100, 28.6200],
        [76.9300, 28.7400],
        [77.0200, 28.8400],
        [77.1000, 28.8800],
      ]],
    },
  },

  // 3. HYDERABAD (GHMC Outer Ring Road Perimeter ~650 sq km)
  hyderabad: {
    type: 'Feature',
    properties: {
      id: 'boundary-hyderabad',
      cityName: 'Hyderabad (GHMC Metropolitan Area)',
      areaSqKm: 650,
      color: '#0ab1ba',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [78.4300, 17.5800],
        [78.5300, 17.5500],
        [78.6100, 17.4800],
        [78.6300, 17.4000],
        [78.5900, 17.3200],
        [78.5200, 17.2600],
        [78.4200, 17.2400],
        [78.3300, 17.2800],
        [78.2700, 17.3600],
        [78.2800, 17.4600],
        [78.3500, 17.5400],
        [78.4300, 17.5800],
      ]],
    },
  },

  // 4. INDIA (National Boundary Convex Envelope)
  india: {
    type: 'Feature',
    properties: {
      id: 'boundary-india',
      cityName: 'India (National Network)',
      areaSqKm: 3287000,
      color: '#0ab1ba',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [74.5000, 35.5000],
        [78.5000, 34.5000],
        [80.0000, 30.5000],
        [88.5000, 27.5000],
        [94.5000, 28.0000],
        [96.5000, 26.5000],
        [93.0000, 22.5000],
        [88.5000, 21.5000],
        [84.5000, 18.5000],
        [80.5000, 13.0000],
        [79.5000, 9.5000],
        [77.5000, 8.2000],
        [76.0000, 10.0000],
        [73.5000, 15.5000],
        [72.5000, 19.0000],
        [69.0000, 23.0000],
        [70.5000, 26.5000],
        [74.0000, 31.0000],
        [74.5000, 35.5000],
      ]],
    },
  },
};

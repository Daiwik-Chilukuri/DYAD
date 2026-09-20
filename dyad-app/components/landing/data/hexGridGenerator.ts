// Generates 3D hexagonal mesh GeoJSON matching TomTom Traffic Index reference images

export interface HexFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][][];
  };
  properties: {
    id: string;
    congestionScore: number;
    elevation: number;
    color: string;
    cityName: string;
    speedKmh: number;
  };
}

export interface HexFeatureCollection {
  type: 'FeatureCollection';
  features: HexFeature[];
}

// Generate single regular hexagon polygon vertices
function createHexagon(center: [number, number], radiusKm: number): [number, number][] {
  const [lng, lat] = center;
  // Approximation for degree offsets based on latitude
  const latOffset = radiusKm / 111.0;
  const lngOffset = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));
  
  const coords: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + (Math.PI / 6); // Flat-topped or pointy orientation
    const dx = Math.cos(angle) * lngOffset;
    const dy = Math.sin(angle) * latOffset;
    coords.push([Number((lng + dx).toFixed(5)), Number((lat + dy).toFixed(5))]);
  }
  coords.push(coords[0]); // Close polygon
  return coords;
}

// Map congestion score (0-100) to TomTom color ramp
function getCongestionColor(score: number): string {
  if (score >= 82) return '#ef4444'; // Extreme congestion (TomTom red)
  if (score >= 70) return '#ea580c'; // Deep orange-red
  if (score >= 58) return '#f97316'; // Vibrant orange
  if (score >= 45) return '#f59e0b'; // Amber
  if (score >= 32) return '#eab308'; // Warm yellow
  if (score >= 20) return '#10b981'; // Flowing emerald
  return '#0ab1ba'; // Free-flow teal/cyan (Dyad brand)
}

// Procedurally generate city-wide hexagonal congestion mesh
export function generateCityHexGrid(
  cityKey: 'bengaluru' | 'delhi' | 'hyderabad',
  center: [number, number],
  gridRadiusKm: number = 9.0,
  hexRadiusKm: number = 0.55
): HexFeatureCollection {
  const features: HexFeature[] = [];
  const [cLng, cLat] = center;
  
  // Grid bounds in km steps
  const stepX = hexRadiusKm * 1.732;
  const stepY = hexRadiusKm * 1.5;
  const stepsCount = Math.ceil(gridRadiusKm / hexRadiusKm);

  let idCounter = 0;

  for (let q = -stepsCount; q <= stepsCount; q++) {
    for (let r = -stepsCount; r <= stepsCount; r++) {
      const distFromCenter = Math.sqrt(q * q + r * r) * hexRadiusKm;
      if (distFromCenter > gridRadiusKm) continue;

      // Hex stagger
      const xOffsetKm = q * stepX + (Math.abs(r) % 2 === 1 ? stepX * 0.5 : 0);
      const yOffsetKm = r * stepY;

      const hexLat = cLat + yOffsetKm / 111.0;
      const hexLng = cLng + xOffsetKm / (111.0 * Math.cos((cLat * Math.PI) / 180));

      // Compute pseudo-realistic congestion score with hot spots along key corridors
      let congestion = 35 + (1 - distFromCenter / gridRadiusKm) * 45;
      
      // Seed city-specific hotspots
      if (cityKey === 'bengaluru') {
        // Hotspots around Silk Board, Bellandur, Marathahalli, Hebbal
        const distToSilkBoard = Math.hypot(hexLng - 77.6245, hexLat - 12.9176);
        const distToBellandur = Math.hypot(hexLng - 77.6820, hexLat - 12.9290);
        if (distToSilkBoard < 0.04 || distToBellandur < 0.04) {
          congestion = Math.min(98, congestion + 28);
        }
      } else if (cityKey === 'delhi') {
        // Hotspots around Connaught Place, ITO, Gurugram border
        const distToCP = Math.hypot(hexLng - 77.2167, hexLat - 28.6270);
        if (distToCP < 0.04) {
          congestion = Math.min(96, congestion + 24);
        }
      } else if (cityKey === 'hyderabad') {
        // Hotspots around HITEC City, Gachibowli, Begumpet
        const distToHitec = Math.hypot(hexLng - 78.3750, hexLat - 17.4450);
        if (distToHitec < 0.04) {
          congestion = Math.min(94, congestion + 25);
        }
      }

      // Add slight organic noise
      const pseudoRandom = Math.sin(q * 12.9898 + r * 78.233) * 0.5 + 0.5;
      congestion = Math.max(15, Math.min(99, congestion + (pseudoRandom - 0.5) * 16));

      const elevation = Math.round(congestion * 32); // Height in meters for 3D extrusion
      const color = getCongestionColor(congestion);
      const speedKmh = Math.round(Math.max(9, 48 - (congestion / 100) * 36));

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [createHexagon([hexLng, hexLat], hexRadiusKm * 0.94)]
        },
        properties: {
          id: `hex-${cityKey}-${idCounter++}`,
          congestionScore: Math.round(congestion),
          elevation,
          color,
          cityName: cityKey,
          speedKmh
        }
      });
    }
  }

  return {
    type: 'FeatureCollection',
    features
  };
}

// Generate country-wide clusters for India overview
export function generateIndiaHexGrid(): HexFeatureCollection {
  const hubCenters: { name: string; center: [number, number]; radiusKm: number; baseScore: number }[] = [
    { name: 'bengaluru', center: [77.6350, 12.9350], radiusKm: 28, baseScore: 88 },
    { name: 'delhi', center: [77.2167, 28.6270], radiusKm: 34, baseScore: 92 },
    { name: 'hyderabad', center: [78.4600, 17.3950], radiusKm: 24, baseScore: 78 },
    { name: 'mumbai', center: [72.8777, 19.0760], radiusKm: 32, baseScore: 95 },
    { name: 'chennai', center: [80.2707, 13.0827], radiusKm: 22, baseScore: 72 },
    { name: 'kolkata', center: [88.3639, 22.5726], radiusKm: 24, baseScore: 84 },
    { name: 'pune', center: [73.8567, 18.5204], radiusKm: 20, baseScore: 76 },
    { name: 'ahmedabad', center: [72.5714, 23.0225], radiusKm: 20, baseScore: 68 }
  ];

  const allFeatures: HexFeature[] = [];
  hubCenters.forEach(hub => {
    const hubGrid = generateCityHexGrid(
      hub.name as any,
      hub.center,
      hub.radiusKm,
      hub.radiusKm > 25 ? 4.5 : 3.5
    );
    allFeatures.push(...hubGrid.features);
  });

  return {
    type: 'FeatureCollection',
    features: allFeatures
  };
}

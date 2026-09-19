import * as turf from '@turf/turf';

export function getCorridorBuffer(origin: [number, number], terminus: [number, number], radiusKm: number = 2.0) {
  // Create a line string between origin and terminus
  const line = turf.lineString([origin, terminus]);
  
  // Create a buffer around the line
  const buffer = turf.buffer(line, radiusKm, { units: 'kilometers' });
  
  return {
    line,
    buffer
  };
}

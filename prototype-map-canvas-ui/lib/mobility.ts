// Mobility & congestion delta model, grounded in TomTom 2025 Bengaluru benchmarks.
export const ROAD_SPEED_KMH = 13.9; // rush-hour arterial average
export const METRO_SPEED_KMH = 36.0; // average Namma Metro line-haul
export const STATION_DWELL_MINS = 1.2; // per intermediate stop
export const DAILY_RIDERSHIP = 50_000;
export const WORKING_DAYS = 250;

export interface MobilityResult {
  peakRoadMins: number;
  metroMins: number;
  timeSavedMins: number;
  timeSavedPct: number;
  annualHoursSaved: number;
  dailyCarTripsEliminated: number;
  annualCo2OffsetTons: number;
}

export function computeMobility(distanceKm: number, stops: number): MobilityResult {
  const peakRoadMins = (distanceKm / ROAD_SPEED_KMH) * 60;
  const metroMins = (distanceKm / METRO_SPEED_KMH) * 60 + stops * STATION_DWELL_MINS;
  const timeSavedMins = peakRoadMins - metroMins;
  const timeSavedPct = peakRoadMins > 0 ? (timeSavedMins / peakRoadMins) * 100 : 0;

  // Two trips/day, WORKING_DAYS/year, converted to hours.
  const annualHoursSaved =
    (DAILY_RIDERSHIP * timeSavedMins * 2 * WORKING_DAYS) / 60;

  // Assume ~35% of catchment ridership diverted from private vehicles.
  const dailyCarTripsEliminated = Math.round(DAILY_RIDERSHIP * 0.35);

  // ~0.12 kg CO2 per km per diverted car trip (round trip), annualized to tons.
  const annualCo2OffsetTons =
    (dailyCarTripsEliminated * distanceKm * 2 * 0.12 * WORKING_DAYS) / 1000;

  return {
    peakRoadMins,
    metroMins,
    timeSavedMins,
    timeSavedPct,
    annualHoursSaved,
    dailyCarTripsEliminated,
    annualCo2OffsetTons,
  };
}

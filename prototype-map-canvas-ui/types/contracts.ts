export type LngLat = [number, number];

export type MetroLineId = "purple" | "green" | "yellow" | "blue";

export interface MetroLine {
  id: MetroLineId;
  name: string;
  core: string;
  glow: string;
  path: LngLat[];
}

export interface MetroStation {
  id: string;
  name: string;
  line: MetroLineId;
  coordinates: LngLat;
  isInterchange: boolean;
}

export type POICategory =
  | "corporate"
  | "healthcare"
  | "education"
  | "transit"
  | "civic";

export interface POIItem {
  id: string;
  name: string;
  category: POICategory;
  coordinates: LngLat;
}

export interface PresetCorridor {
  id: string;
  name: string;
  originStationId: string;
  terminusName: string;
  terminusCoordinates: LngLat;
}

export interface CorridorMetrics {
  distanceKm: number;
  catchmentPopulation: number;
  techParksConnected: number;
  poisInCatchment: POIItem[];
  peakRoadMins: number;
  metroMins: number;
  timeSavedMins: number;
  timeSavedPct: number;
  annualHoursSaved: number;
  dailyCarTripsEliminated: number;
  annualCo2OffsetTons: number;
  lakeWarnings: string[];
  overallScore: number;
  feasibilityRating: string;
}

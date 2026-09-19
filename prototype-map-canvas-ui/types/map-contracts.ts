export interface GeoCoordinate {
  lng: number;
  lat: number;
}

export interface MetroStation {
  id: string;
  name: string;
  line: 'purple' | 'green' | 'yellow' | 'blue' | 'pink';
  coordinates: [number, number];
  isInterchange: boolean;
}

export interface ProposedCorridor {
  id: string;
  name: string;
  originStation: MetroStation;
  terminusName: string;
  terminusCoordinates: [number, number];
  lengthKm: number;
  bufferRadiusKm: number;
  waypoints?: [number, number][];
}

export interface POIItem {
  id: string;
  name: string;
  category: 'corporate' | 'healthcare' | 'education' | 'transit' | 'civic';
  coordinates: [number, number]; // [lng, lat]
  roadCommuteMins: number;
  metroCommuteMins: number;
  timeSavedMins: number;
  accessibilityHighlights: string[];
  agentBrief: string;
}

export interface CorridorSelection {
  originStationName: string;
  originCoords: [number, number];
  terminusCoords: [number, number];
  distanceKm: number;
}

import type * as GeoJSON from 'geojson';

export interface OriginStation {
  name: string;
  coordinates: [number, number]; // [lng, lat]
  line?: string;
}

export interface SuggestedStation {
  station_id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  typology?: string;
  priority?: string;
  estimated_daily_boardings?: number;
  interchange_with?: string | null;
  latitude?: number;
  longitude?: number;
}

export interface BufferStats {
  total: number;
  byCategory: {
    corporate: number;
    hospital: number;
    education: number;
    civic: number;
  };
}

export interface MapCanvasProps {
  // Origin Station Props
  originStation?: OriginStation | null;
  onOriginSelect?: (station: OriginStation) => void;

  // Destination / Terminus Props
  destinationCoords?: [number, number] | null;
  targetCoords?: [number, number] | null; // Backward compatibility
  onDestinationSelect?: (coords: [number, number]) => void;
  onMapClick?: (coords: [number, number]) => void; // Backward compatibility

  // Dynamic Visualizer GeoJSON Layering (Agent 1: Visualizer)
  visualizerGeoJSON?: GeoJSON.FeatureCollection | null;

  // Suggested Station Proposals (From AI Dossier)
  suggestedStations?: Array<{
    station_id: string;
    name: string;
    coordinates: [number, number];
    typology?: string;
    priority?: string;
  }>;
  onSuggestedStationClick?: (stationId: string) => void;
  activeStationFocus?: [number, number] | null;

  // Layer Visibility & Configuration
  activePOIFilters?: string[];
  showBenefitedAreas?: boolean;
  showCatchmentBuffer?: boolean;
  showMetroLines?: boolean;
  showAreaLabels?: boolean;
  bufferRadiusKm?: number;
  focusedAreaCoords?: [number, number] | null;
  onAreaSelect?: (area: any) => void;
  onBufferStatsChange?: (stats: BufferStats) => void;
  isDossierOpen?: boolean;
  className?: string;
}

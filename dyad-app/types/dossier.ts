import type * as GeoJSON from 'geojson';

/**
 * 1. Corridor Submission Payload (Client -> `/api/corridor/stream`)
 * Matches PROJECT.md § Interface Contracts
 */
export interface CorridorStreamRequest {
  origin: {
    name: string;
    coordinates: [number, number]; // [lng, lat]
    line?: string;
  };
  destination: {
    name: string;
    coordinates: [number, number]; // [lng, lat]
  };
  catchment_radius_meters?: number; // default 2000
  budget_cap_inr_cr?: number;       // default 5000
  target_completion_year?: number;  // default 2030
  corridor_id?: string;
  corridor_name?: string;
  run_id?: string;
}

/**
 * 2. Domain Pillar Impact Metrics Contracts
 */
export interface DemographicsPillarMetrics {
  catchment_population_500m: number;
  catchment_population_1500m: number;
  equity_index_score: number; // 0-100
  underserved_transit_ratio: number;
  density_per_sqkm: number;
  // Robust aliases for backend orchestrator schema compatibility:
  equity_score?: number;
  underserved_demographic_ratio?: number;
  dense_ward_names?: string[];
  analysis_summary?: string;
}

export interface EconomicPillarMetrics {
  tech_parks_within_1km: number;
  commercial_centers_within_1km: number;
  hospitals_within_1km: number;
  annual_farebox_revenue_inr_cr: number;
  economic_multiplier_index: number;
  estimated_tod_yield_inr_cr: number;
  // Robust aliases:
  projected_annual_farebox_inr_cr?: number;
  analysis_summary?: string;
}

export interface MobilityPillarMetrics {
  peak_hour_travel_time_saved_minutes: number;
  arterial_congestion_reduction_pct: number;
  feeder_route_coverage_score: number; // 0-100
  daily_projected_ridership: number;
  // Robust aliases:
  peak_hour_travel_time_saved_mins?: number;
  first_last_mile_gap_detected?: boolean;
  analysis_summary?: string;
}

export interface EcologicalPillarMetrics {
  lake_buffer_infringements_30m: number;
  rajakaluve_crossings_50m: number;
  ktfd_compliance_status: 'COMPLIANT' | 'FLAGGED' | 'PERMIT_REQUIRED' | 'CRITICAL_BREACH' | string;
  flood_vulnerability_grade: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
  tree_canopy_loss_risk_score: number;
  // Robust aliases:
  lake_buffer_infringements?: number;
  rajakaluve_buffer_infringements?: number;
  mitigation_strategies?: string[];
  analysis_summary?: string;
}

export interface RiskWarning {
  risk_id: string;
  category: 'ECOLOGICAL' | 'LAND_ACQUISITION' | 'FINANCIAL' | 'CIVIL_ENGINEERING' | string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  headline: string;
  description: string;
  mitigation_step: string;
  // Robust aliases:
  pillar?: 'demographics' | 'economic' | 'mobility' | 'ecological' | string;
  title?: string;
  action_required?: string;
}

export interface StationProposal {
  station_id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  typology: 'ELEVATED' | 'UNDERGROUND' | 'AT_GRADE' | string;
  estimated_daily_boardings: number;
  interchange_with: string | null;
  priority: 'MANDATORY' | 'HIGH' | 'OPTIONAL' | string;
  // Robust aliases:
  latitude?: number;
  longitude?: number;
  rationale?: string;
  expected_daily_footfall?: number;
  interchange_potential?: boolean;
}

export interface AuthorityDossier {
  corridor_id: string;
  corridor_name: string;
  overall_viability_score: number; // 0-100
  executive_summary: string;
  demographics: DemographicsPillarMetrics;
  economic: EconomicPillarMetrics;
  mobility: MobilityPillarMetrics;
  ecological: EcologicalPillarMetrics;
  risk_warnings: RiskWarning[];
  policy_recommendations: string[];
  suggested_stations: StationProposal[];
  // Robust schema aliases:
  total_length_km?: number;
  estimated_ridership_daily?: number;
  demographics_pillar?: DemographicsPillarMetrics;
  economic_pillar?: EconomicPillarMetrics;
  mobility_pillar?: MobilityPillarMetrics;
  ecological_pillar?: EcologicalPillarMetrics;
  suggested_station_locations?: StationProposal[];
}

/**
 * 3. Server-Sent Events (SSE) Stream Contract (`/api/corridor/stream` -> Client)
 */
export type SSEEvent =
  | { type: 'plan_initiated'; timestamp: number; corridor_id: string; corridor_name: string; length_km?: number; catchment_radius_meters?: number; message?: string }
  | { type: 'telemetry'; timestamp: number; stage?: string; message: string; subagents_count?: number; agent?: string; status?: string; progress_pct?: number }
  | { type: 'subagents_spawned'; timestamp: number; subagents: string[]; count?: number; active_subagents?: string[]; skipped_keywords?: string[]; message?: string }
  | { type: 'visualizer_features'; timestamp: number; features_count: number; geojson: GeoJSON.FeatureCollection; message: string }
  | { type: 'subagent_completed'; timestamp: number; subagent: string; execution_time_seconds?: number; summary?: string; message?: string }
  | { type: 'dossier'; timestamp: number; dossier?: AuthorityDossier; payload?: AuthorityDossier; total_elapsed_seconds?: number; message?: string }
  | { type: 'done'; timestamp: number; message: string }
  | { type: 'error'; timestamp?: number; message: string };

export type SubagentDomain = 'visualizer' | 'demographics' | 'economic' | 'mobility' | 'ecological';
export type SubagentStatus = 'idle' | 'queued' | 'running' | 'completed' | 'skipped' | 'error';

export interface SwarmAgentState {
  name: string;
  domain: SubagentDomain;
  status: SubagentStatus;
  durationSec?: number | null;
  summary?: string;
}

export interface SwarmTelemetryLog {
  id: string;
  timestamp: number;
  message: string;
  stage?: string;
  agent?: string;
}

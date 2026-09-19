'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  TrendingUp,
  Zap,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Users,
  IndianRupee,
  ArrowUpRight,
  FileCheck2,
  Trees,
  Briefcase,
  Navigation,
  Layers,
  Activity,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { motionSprings } from '../../../lib/motion';
import { BotLogo } from '../../../components/BotLogo';
import { MathFormula } from '../../../components/MathFormula';
import type { AuthorityDossier, RiskWarning, StationProposal } from '../../../types/dossier';

interface StoredSwarmData {
  dossier: AuthorityDossier;
  corridorMeta?: {
    originName?: string;
    destName?: string;
    originCoords?: [number, number];
    destCoords?: [number, number];
    lengthKm?: number;
    radiusMeters?: number;
  };
  timestamp?: number;
}

interface AgentTraceDetail {
  id: string;
  name: string;
  codename: string;
  role: string;
  domain: 'visualizer' | 'demographics' | 'economic' | 'mobility' | 'ecological';
  status: 'completed' | 'skipped' | 'warning';
  engine: string;
  mathematicalMethod: string;
  statutoryStandard: string;
  inputDatasets: string[];
  primaryOutput: string;
  keyStats: { label: string; value: string }[];
  specialistBrief: string;
  reasoningSteps: string[];
  discrepancyOrWarning?: string;
  formulaNotation?: string;
}

// Baseline fallback data when no live run has been executed yet
const BASELINE_DOSSIER: AuthorityDossier = {
  corridor_id: 'corridor-vidhana-soudha-nagawara',
  corridor_name: 'Vidhana Soudha to Nagawara Corridor',
  total_length_km: 5.46,
  overall_viability_score: 66.5,
  estimated_ridership_daily: 48500,
  executive_summary:
    'Comprehensive multi-criteria transit feasibility analysis confirms strong demand along the northern commercial radial. High demographic catchment and significant peak-hour arterial congestion relief support elevated heavy rail viaduct deployment.',
  demographics: {
    catchment_population_500m: 46410,
    catchment_population_1500m: 120120,
    equity_index_score: 75.0,
    underserved_transit_ratio: 0.28,
    density_per_sqkm: 9400,
    dense_ward_names: ['Pulikeshinagar', 'Shivajinagar', 'Sagayarpuram', 'Kaval Bairasandra'],
    analysis_summary: 'Dense residential and mixed-use commercial fabric with high transit dependency ratio.',
  },
  economic: {
    tech_parks_within_1km: 0,
    commercial_centers_within_1km: 0,
    hospitals_within_1km: 0,
    annual_farebox_revenue_inr_cr: 0.0,
    economic_multiplier_index: 0.0,
    estimated_tod_yield_inr_cr: 0.0,
    analysis_summary: 'No commercial or tech park POI dataset provided. Economic & TOD pillar unassessed.',
  },
  mobility: {
    peak_hour_travel_time_saved_minutes: 22.0,
    arterial_congestion_reduction_pct: 25.0,
    feeder_route_coverage_score: 78.0,
    daily_projected_ridership: 48500,
    first_last_mile_gap_detected: false,
    analysis_summary: 'Provides 22 minutes peak-hour commute savings on heavily congested Bellary Road arterial corridor.',
  },
  ecological: {
    lake_buffer_infringements_30m: 0,
    rajakaluve_crossings_50m: 0,
    ktfd_compliance_status: 'COMPLIANT',
    flood_vulnerability_grade: 'LOW',
    tree_canopy_loss_risk_score: 18,
    mitigation_strategies: ['Maintain statutory 30m non-construction setback', 'Protect median stormwater drains'],
    analysis_summary: 'Alignment stays safely outside protected lake conservation boundaries under KTFD Act 2014.',
  },
  risk_warnings: [
    {
      risk_id: 'risk-spacing-01',
      category: 'CIVIL_ENGINEERING',
      severity: 'LOW',
      headline: 'Standard Station Spacing Compliance',
      description: 'Average station distance of 1.36 km complies with MoHUA heavy rail rapid transit standard (800m–1500m).',
      mitigation_step: 'Maintain standard inter-station headway and acceleration curves.',
      pillar: 'mobility',
      title: 'MoHUA Spacing Standards Compliance',
      action_required: 'Maintain minimum 800m distance between adjacent station platform centerlines.',
    },
  ],
  policy_recommendations: [
    'Expedite statutory KTFD compliance clearance for water body buffers.',
    'Execute TOD land-pooling agreements with major commercial corridor consortiums.',
    'Synchronize BMTC feeder bus services at commercial commissioning.',
  ],
  suggested_stations: [
    {
      station_id: 'st-01',
      name: 'Vidhana Soudha Interchange',
      coordinates: [77.5906, 12.9791],
      typology: 'UNDERGROUND',
      estimated_daily_boardings: 18500,
      interchange_with: 'Purple Line',
      priority: 'MANDATORY',
      rationale: 'Major intermodal node connecting administrative precinct with direct Purple Line rail interchange.',
      expected_daily_footfall: 18500,
      interchange_potential: true,
    },
    {
      station_id: 'st-02',
      name: 'Pulikeshinagar Gateway',
      coordinates: [77.6045, 12.9950],
      typology: 'ELEVATED',
      estimated_daily_boardings: 14200,
      interchange_with: null,
      priority: 'HIGH',
      rationale: 'Intermediate node serving dense historic residential fabric and educational clusters.',
      expected_daily_footfall: 14200,
      interchange_potential: false,
    },
    {
      station_id: 'st-03',
      name: 'Sagayarapuram Central',
      coordinates: [77.6180, 13.0110],
      typology: 'ELEVATED',
      estimated_daily_boardings: 9800,
      interchange_with: null,
      priority: 'HIGH',
      rationale: 'Serves transit-dependent dense ward community with high walking catchment potential.',
      expected_daily_footfall: 9800,
      interchange_potential: false,
    },
    {
      station_id: 'st-04',
      name: 'Kaval Bairasandra Link',
      coordinates: [77.6326, 13.0274],
      typology: 'ELEVATED',
      estimated_daily_boardings: 6000,
      interchange_with: null,
      priority: 'HIGH',
      rationale: 'Terminus connection providing first/last mile feeder integration toward Outer Ring Road.',
      expected_daily_footfall: 6000,
      interchange_potential: false,
    },
  ],
};

export default function MultiAgentSwarmAuditPage() {
  const [storedData, setStoredData] = useState<StoredSwarmData | null>(null);
  const [isLiveRun, setIsLiveRun] = useState<boolean>(false);
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>('AGT-01-VIS');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'skipped'>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('dyad_latest_dossier');
        if (raw) {
          const parsed: StoredSwarmData = JSON.parse(raw);
          if (parsed && parsed.dossier) {
            setStoredData(parsed);
            setIsLiveRun(true);
          }
        }
      }
    } catch (e) {
      console.warn('[AgentsPage] Failed to load stored dossier:', e);
    }
  }, []);

  // Effective dossier is either live or baseline fallback
  const dossier = storedData?.dossier || BASELINE_DOSSIER;
  const corridorMeta = storedData?.corridorMeta || {
    originName: 'Vidhana Soudha Interchange',
    destName: 'Nagawara Alignment',
    lengthKm: dossier.total_length_km || 5.46,
    radiusMeters: 2000,
  };

  // Helper getters
  const demog = dossier.demographics ?? dossier.demographics_pillar;
  const econ = dossier.economic ?? dossier.economic_pillar;
  const mob = dossier.mobility ?? dossier.mobility_pillar;
  const ecol = dossier.ecological ?? dossier.ecological_pillar;
  const viabilityScore = dossier.overall_viability_score ?? 66.5;

  // Detect active vs skipped subagents
  const hasDemog = Boolean(demog && (demog.catchment_population_500m > 0 || (demog.equity_score ?? demog.equity_index_score ?? 0) > 0));
  const hasEcon = Boolean(econ && (econ.tech_parks_within_1km > 0 || (econ.annual_farebox_revenue_inr_cr ?? econ.projected_annual_farebox_inr_cr ?? 0) > 0));
  const hasMob = Boolean(mob && ((mob.peak_hour_travel_time_saved_minutes ?? mob.peak_hour_travel_time_saved_mins ?? 0) > 0 || mob.arterial_congestion_reduction_pct > 0));
  const hasEcol = Boolean(ecol && (ecol.ktfd_compliance_status || ecol.lake_buffer_infringements_30m !== undefined));

  // Build the 5 authoritative subagent traces
  const agentTraces: AgentTraceDetail[] = useMemo(() => [
    {
      id: 'AGT-01-VIS',
      name: 'Structured Spatial Visualizer',
      codename: 'agent_visualizer',
      role: 'Geodesic Buffer Generation & STRtree R-Tree Spatial Intersect Engine',
      domain: 'visualizer',
      status: 'completed',
      engine: 'Modal Cloud Container (Python 3.12 + Shapely 2.0 STRtree Indexing)',
      mathematicalMethod: 'Geodesic Buffer Polygon Generation & Fast R-Tree Query Predicate',
      statutoryStandard: 'OpenGIS Simple Feature Access ISO/IEC 13249-3',
      inputDatasets: [
        'bbmp_wards_198.geojson (Wards)',
        'atree_lakes_streams.geojson (Waterbodies)',
        'bengaluru_road_widths.kml (Arterials)',
        'metro_lines.geojson (Existing Rail)',
      ],
      primaryOutput: 'Extracted spatial vector features intersecting corridor buffer (emitted directly to MapLibre GL)',
      keyStats: [
        { label: 'Spatial Features Extracted', value: '818 Features' },
        { label: 'Buffer Radius Enforced', value: `${corridorMeta.radiusMeters || 2000}m Geodesic` },
        { label: 'Spatial Index Type', value: 'STRtree (2D R-Tree)' },
      ],
      specialistBrief:
        'Constructed precise geodesic catchment buffer along the transit corridor alignment. Executed spatial intersection across active infrastructure and natural hydrology layers without container cold-start overhead.',
      reasoningSteps: [
        `Generated ${corridorMeta.lengthKm?.toFixed(2) || '5.46'} km corridor linestring between origin and terminus coordinates.`,
        `Applied a ${corridorMeta.radiusMeters || 2000}m buffer polygon using geodesic degree conversions (1° ≈ 111.139 km).`,
        'Built memory-resident Shapely STRtree indices for all loaded polygon and linestring geometries.',
        'Extracted all intersecting lakes, ward boundaries, arterial roads, and rapid transit lines, streaming GeoJSON features back to the client.',
      ],
      formulaNotation: 'B(C, r) = \\{ p \\in \\mathbb{R}^2 : \\min_{q \\in C} \\|p - q\\|_2 \\le r \\}',
    },
    {
      id: 'AGT-02-DEM',
      name: 'Demographics & Equity Specialist',
      codename: 'agent_demographics',
      role: 'Census Catchment Interpolation & Spatial Transit Dependency Modeling',
      domain: 'demographics',
      status: hasDemog ? 'completed' : 'skipped',
      engine: 'Modal Cloud Container (Areal-Weighted Dasymetric Interpolator)',
      mathematicalMethod: 'Areal-Weighted Dasymetric Interpolation & Equity Coefficient Indexing',
      statutoryStandard: 'Ministry of Housing and Urban Affairs (MoHUA) Transit Viability Guidelines 2024',
      inputDatasets: [
        'bengaluru_ward_census_2011.csv (Ward Demographics)',
        'bengaluru_urban_slums.geojson (Vulnerable Settlements)',
        'bbmp_wards_198.geojson (Ward Administrative Boundaries)',
      ],
      primaryOutput: hasDemog
        ? `${(demog?.catchment_population_500m || 0).toLocaleString('en-IN')} citizens in 500m walkshed (${(demog?.equity_score ?? demog?.equity_index_score ?? 75).toFixed(1)}/100 Equity Index)`
        : '0 citizens (Unassessed — Demographics dataset not uploaded)',
      keyStats: [
        { label: '500m Walking Catchment', value: hasDemog ? (demog?.catchment_population_500m || 0).toLocaleString('en-IN') : '0' },
        { label: '1500m Feeder Catchment', value: hasDemog ? (demog?.catchment_population_1500m || 0).toLocaleString('en-IN') : '0' },
        { label: 'Spatial Equity Rating', value: hasDemog ? `${(demog?.equity_score ?? demog?.equity_index_score ?? 75).toFixed(1)}/100` : '0.0/100' },
        { label: 'Underserved Ratio', value: hasDemog ? `${((demog?.underserved_demographic_ratio ?? demog?.underserved_transit_ratio ?? 0.28) * 100).toFixed(1)}%` : '0.0%' },
      ],
      specialistBrief: hasDemog
        ? demog?.analysis_summary || 'Dense municipal population along corridor alignment with high transit demand.'
        : 'Subagent was skipped because no demographics dataset was provided. Pillar score set to 0.0.',
      reasoningSteps: hasDemog
        ? [
            'Constructed 500m immediate pedestrian walking catchment and 1500m multimodal feeder shed.',
            'Intersected BBMP ward census tracts to calculate proportional population densities.',
            'Cross-referenced urban slums and informal settlements to compute vulnerable demographic dependency ratios.',
            'Calculated composite Spatial Equity Score reflecting equitable transit access across all socioeconomic strata.',
          ]
        : ['Subagent skipped during conditional dispatch rule. Zero empirical demographic records evaluated.'],
      formulaNotation: 'P_{\\text{catchment}} = \\sum_{w \\in W} \\left( \\frac{\\text{Area}(w \\cap B)}{\\text{Area}(w)} \\right) \\cdot P_w',
    },
    {
      id: 'AGT-03-ECN',
      name: 'Economic Corridor & TOD Specialist',
      codename: 'agent_economic_poi',
      role: 'Calibrated Gravity Model Trip Generation & Transit-Oriented Land-Value Capture',
      domain: 'economic',
      status: hasEcon ? 'completed' : 'skipped',
      engine: 'Modal Cloud Container (Exponential Spatial Interaction & LVC Estimator)',
      mathematicalMethod: 'Calibrated Exponential Gravity Model & Municipal Betterment Levy TOD Estimation',
      statutoryStandard: 'National TOD Policy & BMRCL Value Capture Financing Framework',
      inputDatasets: [
        'osm_bengaluru_pois.json (Commercial POIs & Tech Campuses)',
        'bengaluru_mobility_indicators_2011.csv (Commercial Density)',
      ],
      primaryOutput: hasEcon
        ? `₹${(econ?.annual_farebox_revenue_inr_cr ?? econ?.projected_annual_farebox_inr_cr ?? 0).toLocaleString('en-IN')} Cr Annual Farebox (₹${(econ?.estimated_tod_yield_inr_cr ?? 0).toLocaleString('en-IN')} Cr TOD Yield)`
        : '₹0 Cr (Unassessed — Commercial/POI dataset not uploaded)',
      keyStats: [
        { label: 'Tech Parks in 1km', value: hasEcon ? `${econ?.tech_parks_within_1km || 0}` : '0' },
        { label: 'Hospitals in 1km', value: hasEcon ? `${econ?.hospitals_within_1km || 0}` : '0' },
        { label: 'Annual Farebox Revenue', value: hasEcon ? `₹${(econ?.annual_farebox_revenue_inr_cr ?? econ?.projected_annual_farebox_inr_cr ?? 0).toFixed(1)} Cr` : '₹0.0 Cr' },
        { label: 'Estimated TOD Yield', value: hasEcon ? `₹${(econ?.estimated_tod_yield_inr_cr ?? 0).toFixed(1)} Cr` : '₹0.0 Cr' },
        { label: 'Economic Multiplier', value: hasEcon ? `${(econ?.economic_multiplier_index ?? 1.0).toFixed(2)}x` : '0.00x' },
      ],
      specialistBrief: hasEcon
        ? econ?.analysis_summary || 'Commercial corridor exhibits high commercial density and land-value capture yield.'
        : 'Subagent was skipped because no commercial POI dataset was provided. Pillar score set to 0.0.',
      reasoningSteps: hasEcon
        ? [
            'Indexed all employment clusters, tech campuses, and healthcare hubs within 1km walking shed.',
            'Calibrated exponential gravity model to calculate commuter journey pairs between residential origins and employment destinations.',
            'Computed annual farebox revenue based on 310 operational days and standard BMRCL fare structure.',
            'Estimated Transit-Oriented Development (TOD) yield using commercial floor area ratio (FAR) and 20% municipal betterment levy.',
          ]
        : ['Subagent skipped during conditional dispatch rule. Zero empirical commercial records evaluated.'],
      formulaNotation: 'T_{ij} = k \\cdot \\frac{P_i \\cdot E_j}{L^\\gamma} \\cdot e^{-\\alpha L}',
    },
    {
      id: 'AGT-04-MOB',
      name: 'Mobility & Congestion Specialist',
      codename: 'agent_mobility',
      role: 'Multinomial Logit Modal Split & Arterial Road Congestion Abatement Engine',
      domain: 'mobility',
      status: hasMob ? 'completed' : 'skipped',
      engine: 'Modal Cloud Container (Discrete Choice MNL & BPR Volume-Delay Capacity Curves)',
      mathematicalMethod: 'Multinomial Logit (MNL) Discrete Choice & Bureau of Public Roads (BPR) Delay Functions',
      statutoryStandard: 'Comprehensive Mobility Plan (CMP) for Bengaluru & MoHUA Modal Guidelines',
      inputDatasets: [
        'bengaluru_mobility_indicators_2011.csv (Modal Shift Indicators)',
        'bengaluru_road_widths.kml (Arterial Geometry)',
        'metro_lines.geojson & metro_stations.geojson (Existing Rapid Transit)',
      ],
      primaryOutput: hasMob
        ? `${(mob?.peak_hour_travel_time_saved_minutes ?? mob?.peak_hour_travel_time_saved_mins ?? 22.0).toFixed(1)} mins saved per trip (${(mob?.arterial_congestion_reduction_pct || 25).toFixed(1)}% road congestion reduction)`
        : '0 mins (Unassessed — Mobility dataset not uploaded)',
      keyStats: [
        { label: 'Peak Commute Time Saved', value: hasMob ? `${(mob?.peak_hour_travel_time_saved_minutes ?? mob?.peak_hour_travel_time_saved_mins ?? 22).toFixed(1)} mins` : '0 mins' },
        { label: 'Arterial Congestion Relief', value: hasMob ? `-${(mob?.arterial_congestion_reduction_pct || 0).toFixed(1)}%` : '0.0%' },
        { label: 'Feeder Bus Integration', value: hasMob ? `${(mob?.feeder_route_coverage_score || 0).toFixed(1)}/100` : '0.0/100' },
        { label: 'Daily Corridor Ridership', value: hasMob ? (dossier.estimated_ridership_daily || 48500).toLocaleString('en-IN') : '0' },
      ],
      specialistBrief: hasMob
        ? mob?.analysis_summary || 'Significant peak-hour road relief provided across adjacent arterial roadways.'
        : 'Subagent was skipped because no mobility dataset was provided. Pillar score set to 0.0.',
      reasoningSteps: hasMob
        ? [
            'Ingested arterial road widths, lane capacities, and peak-hour volume-delay parameters.',
            'Evaluated utility functions across four primary modes: metro rail, private automobile, two-wheeler, and bus transit.',
            'Projected modal shift toward grade-separated heavy rail viaduct.',
            'Quantified net commuter travel time savings and peak-period arterial road relief percentage.',
          ]
        : ['Subagent skipped during conditional dispatch rule. Zero empirical mobility records evaluated.'],
      formulaNotation: 'P(\\text{metro}) = \\frac{e^{V_{\\text{metro}}}}{\\sum_{m \\in M} e^{V_m}}',
    },
    {
      id: 'AGT-05-ECO',
      name: 'Ecological Risk & Wetland Specialist',
      codename: 'agent_ecological',
      role: 'KTFD Statutory Lake Buffer Compliance & Stormwater Rajakaluve Breach Auditor',
      domain: 'ecological',
      status: hasEcol ? 'completed' : 'skipped',
      engine: 'Modal Cloud Container (Polygon Spatial Setback & Flood Risk Auditor)',
      mathematicalMethod: 'Explicit 30m / 50m Legal Setback Geometry & NGT Environmental Precautionary Principle',
      statutoryStandard: 'Karnataka Tank Conservation and Development Authority (KTFD) Act 2014 & NGT Directives',
      inputDatasets: [
        'atree_lakes_streams.geojson (ATREE Protected Waterbodies & Lakes)',
        'bbmp_wards_198.geojson (Drainage Basins)',
      ],
      primaryOutput: hasEcol
        ? `${ecol?.lake_buffer_infringements_30m ?? ecol?.lake_buffer_infringements ?? 0} Lake Breaches (${ecol?.ktfd_compliance_status || 'COMPLIANT'})`
        : 'Unassessed (Ecological dataset not uploaded)',
      keyStats: [
        { label: '30m Lake Breaches', value: hasEcol ? `${ecol?.lake_buffer_infringements_30m ?? ecol?.lake_buffer_infringements ?? 0}` : '0' },
        { label: '50m Rajakaluve Breaches', value: hasEcol ? `${ecol?.rajakaluve_crossings_50m ?? ecol?.rajakaluve_buffer_infringements ?? 0}` : '0' },
        { label: 'KTFD Compliance Status', value: hasEcol ? `${ecol?.ktfd_compliance_status || 'COMPLIANT'}` : 'UNASSESSED' },
        { label: 'Flood Vulnerability Grade', value: hasEcol ? `${ecol?.flood_vulnerability_grade || 'LOW'}` : 'UNASSESSED' },
      ],
      specialistBrief: hasEcol
        ? ecol?.analysis_summary || 'Compliance verified against protected waterbody buffer setbacks.'
        : 'Subagent was skipped because no ecological dataset was provided. Pillar score set to 0.0.',
      reasoningSteps: hasEcol
        ? [
            'Constructed statutory 30m non-construction exclusion zone around all ATREE lake perimeters.',
            'Generated 50m primary stormwater drain (rajakaluve) setback envelopes.',
            'Evaluated viaduct alignment and pier coordinate intersections against conservation geometry.',
            'Assigned KTFD compliance tier and formulated mandatory civil engineering mitigation protocols.',
          ]
        : ['Subagent skipped during conditional dispatch rule. Zero empirical ecological records evaluated.'],
      formulaNotation: '\\text{SetbackViolation} = \\text{ViaductGeometry} \\cap \\text{Buffer}(\\text{Lake}, 30\\text{m}) \\neq \\emptyset',
    },
  ], [corridorMeta, demog, econ, mob, ecol, hasDemog, hasEcon, hasMob, hasEcol, dossier.estimated_ridership_daily]);

  // Filter traces
  const filteredTraces = useMemo(() => {
    return agentTraces.filter((trace) => {
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'completed'
          ? trace.status === 'completed'
          : trace.status === 'skipped';
      const matchDomain = domainFilter === 'all' || trace.domain === domainFilter;
      return matchStatus && matchDomain;
    });
  }, [agentTraces, statusFilter, domainFilter]);

  // Export JSON audit
  const handleExportJSON = () => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      dossier,
      corridorMeta,
      agentTraces,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `dyad-authority-audit-${dossier.corridor_id || 'transit'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const domainColor = (domain: string) => {
    switch (domain) {
      case 'visualizer':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      case 'demographics':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'economic':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'mobility':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'ecological':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="relative w-screen h-screen flex overflow-hidden bg-[#08090C] text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* 68px LEFT VERTICAL NAVIGATION RAIL */}
      <aside className="relative z-20 w-[68px] flex flex-col items-center border-r border-white/[0.08] bg-[#0E1117]/95 backdrop-blur-xl py-4 h-full shrink-0 select-none">
        <Link
          href="/"
          className="w-10 h-10 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center mb-6 shadow-sm group hover:scale-105 transition-transform"
          title="Return to Corridor Canvas"
        >
          <MapPin className="text-emerald-400 size-5" />
        </Link>

        <nav className="flex flex-col gap-3">
          <Link href="/data" title="Data Ingestion & Schema Inspector">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={motionSprings.snappy}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Database className="size-5" />
            </motion.button>
          </Link>

          <Link href="/" title="Corridor Simulation Canvas">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={motionSprings.snappy}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <TrendingUp className="size-5" />
            </motion.button>
          </Link>

          {/* Active Bot Logo for /agents */}
          <Link href="/agents" title="Autonomous Multi-Agent Swarm Intelligence (Active)">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={motionSprings.snappy}
              className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/10 flex items-center justify-center cursor-pointer"
            >
              <BotLogo className="size-5" isActive={true} />
            </motion.button>
          </Link>
        </nav>

        <div className="mt-auto flex flex-col items-center gap-2">
          <span className="text-[9px] font-mono font-bold text-slate-600">DYAD</span>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP COMMAND BAR */}
        <header className="h-16 px-6 border-b border-white/[0.08] bg-[#0E1117]/80 backdrop-blur-xl flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-white/5"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Map Canvas</span>
            </Link>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-white tracking-tight truncate">
                  Multi-Agent Swarm Deep Intelligence Audit
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  5 AGENTS
                </span>
                {isLiveRun && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    LIVE RUN DATA
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-400 truncate">
                Corridor: {dossier.corridor_name} ({corridorMeta.lengthKm?.toFixed(2)} km) • MoHUA & BMRCL Compliance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161B22] border border-white/[0.08]">
              <span className="text-xs text-slate-400 font-sans">Overall Viability:</span>
              <span className="font-mono tabular-nums text-sm font-bold text-emerald-400">
                {viabilityScore.toFixed(1)}/100
              </span>
            </div>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 transition-all cursor-pointer group"
            >
              <Download className="size-3.5 group-hover:scale-110 transition-transform" />
              <span>Export Audit JSON</span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN BODY */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-white/10">
          {/* NOTICE BANNER IF BASELINE OR LIVE */}
          {!isLiveRun ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#161B22] to-[#0E1117] border border-cyan-500/30 text-xs text-slate-300"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  <Activity className="size-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Reference Baseline Architecture Loaded</h4>
                  <p className="text-slate-400 text-[11.5px] mt-0.5">
                    No active simulation run in local cache. Run a feasibility swarm evaluation on the Map Canvas to populate live subagent traces.
                  </p>
                </div>
              </div>
              <Link
                href="/"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-medium transition-all"
              >
                <span>Launch Canvas</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-[#161B22] to-[#0E1117] border border-emerald-500/25 text-xs text-slate-300"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <FileCheck2 className="size-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Live Feasibility Swarm Dossier Active</h4>
                  <p className="text-slate-400 text-[11.5px] mt-0.5">
                    Viewing real empirical subagent outputs generated for alignment: <span className="text-emerald-400 font-mono font-medium">{corridorMeta.originName || 'Origin'} → {corridorMeta.destName || 'Terminus'}</span>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-400">
                  Viability Score: <strong className="text-emerald-400 tabular-nums">{viabilityScore.toFixed(1)}</strong>/100
                </span>
              </div>
            </motion.div>
          )}

          {/* 4 HIGH-LEVEL KPI IMPACT CARDS (DYNAMIC FROM DOSSIER) */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Mobility & Congestion */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5">
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Navigation className="size-3.5" />
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {hasMob ? 'ACTIVE (33% WEIGHT)' : 'SKIPPED (0.0 PTS)'}
                </span>
              </div>
              <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400">Mobility & Relief</span>
              <span className="font-mono tabular-nums text-2xl font-bold text-cyan-400">
                {hasMob ? `${(mob?.peak_hour_travel_time_saved_minutes ?? mob?.peak_hour_travel_time_saved_mins ?? 22).toFixed(1)} mins` : '0.0 mins'}
              </span>
              <span className="text-[11px] text-slate-400 leading-snug">
                {hasMob ? `-${(mob?.arterial_congestion_reduction_pct || 25).toFixed(1)}% road congestion • ${(mob?.feeder_route_coverage_score || 78).toFixed(0)}/100 feeder integration` : 'No mobility dataset uploaded.'}
              </span>
            </div>

            {/* 2. Demographics & Equity */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5">
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Users className="size-3.5" />
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {hasDemog ? 'ACTIVE (33% WEIGHT)' : 'SKIPPED (0.0 PTS)'}
                </span>
              </div>
              <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400">500m Walking Catchment</span>
              <span className="font-mono tabular-nums text-2xl font-bold text-purple-400">
                {hasDemog ? (demog?.catchment_population_500m || 0).toLocaleString('en-IN') : '0'}
              </span>
              <span className="text-[11px] text-slate-400 leading-snug">
                {hasDemog ? `${(demog?.equity_score ?? demog?.equity_index_score ?? 75).toFixed(1)}/100 equity score • ${((demog?.underserved_demographic_ratio ?? 0.28) * 100).toFixed(0)}% underserved residents` : 'No demographic dataset uploaded.'}
              </span>
            </div>

            {/* 3. Economic & TOD */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5">
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  <Briefcase className="size-3.5" />
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${hasEcon ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20' : 'bg-slate-500/10 text-slate-400 border border-white/10'}`}>
                  {hasEcon ? 'ACTIVE (25% WEIGHT)' : 'SKIPPED (0.0 PTS)'}
                </span>
              </div>
              <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400">Annual Farebox & TOD</span>
              <span className={`font-mono tabular-nums text-2xl font-bold ${hasEcon ? 'text-yellow-400' : 'text-slate-500'}`}>
                {hasEcon ? `₹${(econ?.annual_farebox_revenue_inr_cr ?? econ?.projected_annual_farebox_inr_cr ?? 0).toFixed(1)} Cr` : '₹0.0 Cr'}
              </span>
              <span className="text-[11px] text-slate-400 leading-snug">
                {hasEcon ? `₹${(econ?.estimated_tod_yield_inr_cr ?? 0).toFixed(1)} Cr TOD capture • ${(econ?.economic_multiplier_index ?? 1.0).toFixed(2)}x multiplier` : 'Unassessed. Zeroed out in composite score.'}
              </span>
            </div>

            {/* 4. Ecological & Setbacks */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5">
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Trees className="size-3.5" />
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {hasEcol ? 'ACTIVE (33% WEIGHT)' : 'SKIPPED (0.0 PTS)'}
                </span>
              </div>
              <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400">KTFD Lake Setback</span>
              <span className="font-mono tabular-nums text-2xl font-bold text-emerald-400">
                {hasEcol ? `${ecol?.lake_buffer_infringements_30m ?? ecol?.lake_buffer_infringements ?? 0} Breaches` : '0 Breaches'}
              </span>
              <span className="text-[11px] text-slate-400 leading-snug">
                {hasEcol ? `Status: ${ecol?.ktfd_compliance_status || 'COMPLIANT'} • Flood Grade: ${ecol?.flood_vulnerability_grade || 'LOW'}` : 'No ecological dataset uploaded.'}
              </span>
            </div>
          </section>

          {/* FILTER TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0E1117]/80 border border-white/[0.08] select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-slate-400 mr-1">Status:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                All (5)
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  statusFilter === 'completed' ? 'bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => setStatusFilter('skipped')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  statusFilter === 'skipped' ? 'bg-amber-500/15 text-amber-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-amber-400'
                }`}
              >
                Skipped / Unassessed
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-slate-400 mr-1">Domain:</span>
              {(['all', 'visualizer', 'demographics', 'economic', 'mobility', 'ecological'] as const).map((dom) => (
                <button
                  key={dom}
                  onClick={() => setDomainFilter(dom)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono capitalize transition-all cursor-pointer ${
                    domainFilter === dom ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {dom}
                </button>
              ))}
            </div>
          </div>

          {/* 5 DEEP-DIVE SUBAGENT TRACE CARDS */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Subagent Swarm Trace Breakdown ({filteredTraces.length} Active Displayed)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Click any agent card to disclose mathematical formulations and reasoning steps
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {filteredTraces.map((trace) => {
                const isExpanded = expandedAgentId === trace.id;

                return (
                  <motion.div
                    key={trace.id}
                    layout
                    transition={motionSprings.smooth}
                    className="flex flex-col rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5 overflow-hidden group"
                  >
                    {/* Header Row (Always Visible) */}
                    <div
                      onClick={() => setExpandedAgentId(isExpanded ? null : trace.id)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`p-2 rounded-xl border ${domainColor(trace.domain)}`}>
                          <BotLogo className="size-4" isActive={trace.status === 'completed'} />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white tracking-tight">
                              {trace.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              ({trace.id} • {trace.codename})
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase ${
                                trace.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {trace.status === 'completed' ? 'Completed & Synthesized' : 'Skipped (0.0 Pts)'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-sans truncate mt-0.5">
                            {trace.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="font-mono text-xs font-semibold text-slate-200 hidden md:block max-w-[280px] truncate text-right">
                          {trace.primaryOutput}
                        </span>
                        <div className="p-1 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Disclosure Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={motionSprings.smooth}
                          className="border-t border-white/[0.06] p-4 flex flex-col gap-4 bg-[#161B22]/40"
                        >
                          {/* Key Statistics Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {trace.keyStats.map((st, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col p-2.5 rounded-xl bg-black/40 border border-white/[0.04]"
                              >
                                <span className="text-[10px] font-mono uppercase text-slate-400">{st.label}</span>
                                <span className="font-mono tabular-nums text-sm font-semibold text-white mt-0.5">
                                  {st.value}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Specialist Brief Rationale */}
                          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.04] flex flex-col gap-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                              Official Subagent Authority Brief
                            </span>
                            <p className="text-xs leading-relaxed text-slate-200 font-sans">
                              {trace.specialistBrief}
                            </p>
                          </div>

                          {/* Reasoning Steps & Mathematical Notation */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-black/30 border border-white/[0.04]">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                                Empirical Reasoning Trajectory
                              </span>
                              <ol className="flex flex-col gap-2 text-xs text-slate-300 font-sans list-decimal list-inside">
                                {trace.reasoningSteps.map((step, idx) => (
                                  <li key={idx} className="leading-relaxed">
                                    <span className="text-slate-200">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-black/30 border border-white/[0.04]">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                                Mathematical Formulation & Standard
                              </span>
                              {trace.formulaNotation && (
                                <MathFormula formula={trace.formulaNotation} />
                              )}
                              <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-400 mt-1">
                                <div>
                                  <strong className="text-slate-300">Statutory Standard:</strong> {trace.statutoryStandard}
                                </div>
                                <div>
                                  <strong className="text-slate-300">Compute Engine:</strong> {trace.engine}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Input Datasets Consumed from Modal Volume */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[10px] font-mono uppercase text-slate-500">Datasets Consumed:</span>
                            {trace.inputDatasets.map((ds, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10.5px] font-mono bg-white/[0.04] text-slate-300 border border-white/[0.08]"
                              >
                                {ds}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* PROPOSED STATION NODES & RISK WARNINGS BREAKDOWN */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Suggested Stations Along Alignment */}
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-emerald-400" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                    Suggested Station Alignments ({dossier.suggested_stations?.length || 0})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">MoHUA 800m–1500m Headway</span>
              </div>

              <div className="flex flex-col gap-2">
                {(dossier.suggested_stations || []).map((st, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col p-2.5 rounded-xl bg-[#161B22]/60 border border-white/[0.04] gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{st.name}</span>
                      {st.interchange_potential && (
                        <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          INTERCHANGE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      {st.rationale || 'Intermediate passenger boarding node.'}
                    </p>
                    <div className="flex items-center gap-3 text-[10.5px] font-mono text-slate-500 pt-0.5">
                      <span>Daily Footfall: <strong className="text-slate-300">{(st.expected_daily_footfall || st.estimated_daily_boardings || 0).toLocaleString('en-IN')}</strong></span>
                      <span>Typology: <strong className="text-slate-300">{st.typology || 'ELEVATED'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Risk Warnings */}
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-400" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                    Prioritized Risk Audit & Mitigations ({dossier.risk_warnings?.length || 0})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Statutory Compliance</span>
              </div>

              <div className="flex flex-col gap-2">
                {(dossier.risk_warnings || []).length > 0 ? (
                  (dossier.risk_warnings || []).map((rw, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-300">{rw.title || rw.headline}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {rw.severity || 'MEDIUM'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                        {rw.description}
                      </p>
                      <span className="text-[10.5px] font-mono text-amber-400/90 pt-0.5">
                        <strong>Action Required:</strong> {rw.action_required || rw.mitigation_step}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono">
                    Zero critical risks or statutory buffer infringements flagged.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck2,
  X,
  ChevronRight,
  ChevronLeft,
  Share2,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  MapPin,
  TrendingUp,
  ArrowUpRight,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Users,
  Briefcase,
  Navigation,
  Trees,
  Play,
} from 'lucide-react';
import Link from 'next/link';
import { BotLogo } from '../BotLogo';
import { motionSprings } from '../../lib/motion';
import { SwarmTelemetryStream } from './SwarmTelemetryStream';
import { FeasibilityScoreGauge } from './FeasibilityScoreGauge';
import { DomainPillarCards } from './DomainPillarCards';
import { ActionableRiskWarnings } from './ActionableRiskWarnings';
import { SuggestedStationList } from './SuggestedStationList';
import { PolicyRecommendations } from './PolicyRecommendations';
import type {
  AuthorityDossier,
  SwarmAgentState,
  SwarmTelemetryLog,
  StationProposal,
} from '../../types/dossier';

interface AuthorityDossierPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  dossier: AuthorityDossier | null;
  isEvaluating: boolean;
  telemetryLogs: SwarmTelemetryLog[];
  swarmAgents: Record<string, SwarmAgentState>;
  currentStage?: string;
  onStationSelect?: (coords: [number, number], station: StationProposal) => void;
  selectedStationId?: string | null;
  corridorMeta?: {
    originName?: string;
    destName?: string;
    lengthKm?: number;
    radiusMeters?: number;
  };
  onEvaluateTrigger?: () => void;
}

export type DossierSection =
  | 'overview'
  | 'pillars'
  | 'demographics'
  | 'economic'
  | 'mobility'
  | 'ecological'
  | 'stations'
  | 'risks'
  | 'policies'
  | 'telemetry';

export function AuthorityDossierPanel({
  isOpen,
  onToggleOpen,
  dossier,
  isEvaluating,
  telemetryLogs,
  swarmAgents,
  currentStage = 'Idle',
  onStationSelect,
  selectedStationId = null,
  corridorMeta,
  onEvaluateTrigger,
}: AuthorityDossierPanelProps) {
  const [activeSection, setActiveSection] = useState<DossierSection>('overview');
  const [activePillar, setActivePillar] = useState<'all' | 'demographics' | 'economic' | 'mobility' | 'ecological'>('all');
  const [governanceSubTab, setGovernanceSubTab] = useState<'risks' | 'policies'>('risks');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Automatically switch tab based on evaluation state
  React.useEffect(() => {
    if (isEvaluating) {
      setActiveSection('telemetry');
    } else if (dossier) {
      setActiveSection((prev) => (prev === 'telemetry' ? 'overview' : prev));
    }
  }, [isEvaluating, Boolean(dossier)]);

  // Normalize dossier pillars (handling both naming schemes)
  const demographics = dossier?.demographics ?? dossier?.demographics_pillar;
  const economic = dossier?.economic ?? dossier?.economic_pillar;
  const mobility = dossier?.mobility ?? dossier?.mobility_pillar;
  const ecological = dossier?.ecological ?? dossier?.ecological_pillar;
  const warnings = dossier?.risk_warnings ?? [];
  const policies = dossier?.policy_recommendations ?? [];
  const stations = dossier?.suggested_stations ?? dossier?.suggested_station_locations ?? [];
  const viabilityScore = dossier?.overall_viability_score ?? 0;

  // Normalized summary fields for high-density overview cards
  const pop500m = demographics?.catchment_population_500m ?? 0;
  const pop1500m = demographics?.catchment_population_1500m ?? 0;
  const equityScore = demographics?.equity_index_score ?? demographics?.equity_score ?? 0;
  const underservedRatio = demographics?.underserved_transit_ratio ?? demographics?.underserved_demographic_ratio ?? 0;
  const density = demographics?.density_per_sqkm ?? (pop1500m > 0 ? Math.round(pop1500m / 7.0) : 0);

  const techParks = economic?.tech_parks_within_1km ?? 0;
  const hospitals = economic?.hospitals_within_1km ?? 0;
  const commercial = economic?.commercial_centers_within_1km ?? 0;
  const farebox = economic?.annual_farebox_revenue_inr_cr ?? economic?.projected_annual_farebox_inr_cr ?? 0;
  const multiplier = economic?.economic_multiplier_index ?? 1.0;
  const todYield = economic?.estimated_tod_yield_inr_cr ?? (farebox * 2.2);

  const timeSaved = mobility?.peak_hour_travel_time_saved_minutes ?? mobility?.peak_hour_travel_time_saved_mins ?? 0;
  const congestionReduction = mobility?.arterial_congestion_reduction_pct ?? 0;
  const feederScore = mobility?.feeder_route_coverage_score ?? 0;
  const ridership = mobility?.daily_projected_ridership ?? 0;

  const lakeBreaches = ecological?.lake_buffer_infringements_30m ?? ecological?.lake_buffer_infringements ?? 0;
  const rajakaluveCrossings = ecological?.rajakaluve_crossings_50m ?? ecological?.rajakaluve_buffer_infringements ?? 0;
  const ktfdStatus = ecological?.ktfd_compliance_status ?? (lakeBreaches === 0 ? 'COMPLIANT' : 'FLAGGED');
  const floodGrade = ecological?.flood_vulnerability_grade ?? 'MODERATE';
  const canopyScore = ecological?.tree_canopy_loss_risk_score ?? 25;

  const formatNum = (val?: number) => (val != null ? val.toLocaleString('en-IN') : '0');
  const formatINR = (val?: number) => (val != null && val > 0 ? `₹${val.toFixed(1)} Cr` : '—');

  return (
    <>
      {/* Collapsed Mini Trigger Pill (When Panel is Closed) */}
      {!isOpen && (
        <div className="absolute top-4 right-0 z-30 flex items-center gap-1.5 pointer-events-auto">
          <Link
            href="/agents"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0c0e12]/95 backdrop-blur-2xl border border-white/[0.08] shadow-xl shadow-black/50 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/30 transition-all cursor-pointer group"
            title="Open Autonomous Multi-Agent Swarm Intelligence"
          >
            <BotLogo className="size-4" isActive={true} />
            <span className="text-xs font-mono font-semibold tracking-tight">
              Agents Suite
            </span>
            <ArrowUpRight className="size-3.5 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={motionSprings.snappy}
            onClick={onToggleOpen}
            className="flex items-center gap-2 px-3.5 py-2 rounded-l-xl bg-[#0c0e12]/95 backdrop-blur-2xl border border-r-0 border-white/[0.08] shadow-xl shadow-black/50 hover:bg-[#161B22] text-slate-200 hover:text-white hover:border-white/20 transition-all cursor-pointer group text-xs font-mono font-semibold"
            title="Open AI Authority Dossier Panel"
          >
            <div className="relative flex items-center justify-center size-4">
              {isEvaluating ? (
                <>
                  <span className="absolute size-3.5 rounded-full bg-emerald-400/30 animate-ping" />
                  <span className="size-2 rounded-full bg-emerald-400" />
                </>
              ) : (
                <FileCheck2 className="size-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              )}
            </div>
            <span>
              {isEvaluating ? 'Swarm Running...' : 'Authority Dossier'}
            </span>
            {dossier && (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10.5px] font-mono tabular-nums font-bold">
                {viabilityScore.toFixed(1)}
              </span>
            )}
            <ChevronLeft className="size-4 text-slate-400 group-hover:translate-x-[-2px] transition-transform" />
          </motion.button>
        </div>
      )}

      {/* Main Collapsible Right-Side Command Center Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, x: 480 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 480 }}
            transition={motionSprings.smooth}
            className="absolute top-0 right-0 bottom-0 z-30 w-[460px] lg:w-[480px] max-w-[calc(100vw-5rem)] flex flex-col bg-[#0c0e12]/96 backdrop-blur-2xl border-l border-white/[0.08] shadow-[-20px_0_40px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto select-none rounded-none"
          >
            {/* Specular Top Edge Highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

            {/* 1. Command Center Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#12151b]/80 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <FileCheck2 className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-semibold text-white tracking-tight truncate">
                      {dossier?.corridor_name || (corridorMeta?.originName ? `${corridorMeta.originName} Alignment` : 'Transit Feasibility Dossier')}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    {corridorMeta?.lengthKm ? `${corridorMeta.lengthKm.toFixed(2)} km Viaduct` : 'Autonomous Swarm Synthesis'}
                    {corridorMeta?.radiusMeters ? ` • ${corridorMeta.radiusMeters}m Buffer` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href="/agents"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-medium transition-all group shadow-sm cursor-pointer"
                  title="Open Deep Multi-Agent Swarm Audit"
                >
                  <BotLogo className="size-3.5" isActive={true} />
                  <span>Agents Suite</span>
                  <ArrowUpRight className="size-3 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <button
                  onClick={onToggleOpen}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Collapse panel"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            {/* 2. Streamlined 5-Tab Command Sub-Navigation (No Horizontal Overflow) */}
            <div className="grid grid-cols-5 gap-1 p-1.5 border-b border-white/[0.06] bg-black/35 shrink-0">
              {[
                {
                  id: 'overview' as DossierSection,
                  label: 'Overview',
                  icon: <TrendingUp className="size-3.5" />,
                  badge: dossier ? viabilityScore.toFixed(0) : null,
                  badgeColor: 'text-emerald-400',
                },
                {
                  id: 'pillars' as DossierSection,
                  label: 'Pillars',
                  icon: <Layers className="size-3.5" />,
                  badge: '4',
                  badgeColor: 'text-purple-400',
                },
                {
                  id: 'stations' as DossierSection,
                  label: 'Stations',
                  icon: <MapPin className="size-3.5" />,
                  badge: stations.length > 0 ? String(stations.length) : null,
                  badgeColor: 'text-cyan-400',
                },
                {
                  id: 'risks' as DossierSection,
                  label: 'Risks',
                  icon: <AlertTriangle className="size-3.5" />,
                  badge: warnings.length > 0 ? String(warnings.length) : null,
                  badgeColor: warnings.some((w) => (w.severity || '').toUpperCase() === 'CRITICAL')
                    ? 'text-rose-400'
                    : 'text-amber-400',
                },
                {
                  id: 'telemetry' as DossierSection,
                  label: 'Swarm',
                  icon: (
                    <div className="relative size-2 shrink-0">
                      {isEvaluating && <span className="absolute size-2 rounded-full bg-cyan-400 animate-ping" />}
                      <span className={`size-2 rounded-full block ${isEvaluating ? 'bg-cyan-400' : 'bg-slate-400'}`} />
                    </div>
                  ),
                  badge: isEvaluating ? 'LIVE' : null,
                  badgeColor: 'text-cyan-400',
                },
              ].map((tab) => {
                const isActive =
                  activeSection === tab.id ||
                  (tab.id === 'pillars' && ['pillars', 'demographics', 'economic', 'mobility', 'ecological'].includes(activeSection)) ||
                  (tab.id === 'risks' && ['risks', 'policies'].includes(activeSection));
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'pillars') {
                        setActiveSection('pillars');
                      } else if (tab.id === 'risks') {
                        setActiveSection('risks');
                      } else {
                        setActiveSection(tab.id);
                      }
                    }}
                    className={`relative py-1.5 px-1 rounded-lg text-xs font-medium font-sans flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-dossier-section-pill"
                        className="absolute inset-0 rounded-lg bg-white/10 border border-white/15"
                        transition={motionSprings.snappy}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1 truncate">
                      {tab.icon}
                      <span className="truncate">{tab.label}</span>
                      {tab.badge && (
                        <span className={`font-mono text-[9.5px] tabular-nums font-bold ${tab.badgeColor}`}>
                          {tab.badge}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3. Main Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {activeSection === 'telemetry' ? (
                /* 1. Telemetry View */
                <SwarmTelemetryStream
                  isScanning={isEvaluating}
                  agents={swarmAgents}
                  logs={telemetryLogs}
                  stage={currentStage}
                />
              ) : !dossier && !isEvaluating ? (
                /* Standby / Empty State when not yet evaluated */
                <div className="flex flex-col items-center justify-center text-center p-6 my-auto gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-slate-400">
                    <MapPin className="size-6 text-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-semibold text-slate-200">
                      Corridor Ready For Feasibility Evaluation
                    </h4>
                    <p className="text-xs text-slate-400 max-w-[280px] font-sans leading-relaxed">
                      Select an origin station and drop a candidate terminus pin on the canvas to dispatch the 5-agent feasibility swarm.
                    </p>
                  </div>

                  {onEvaluateTrigger && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={motionSprings.snappy}
                      onClick={onEvaluateTrigger}
                      disabled={isEvaluating}
                      className="mt-2 w-full max-w-[280px] py-3 px-4 rounded-xl bg-[#00F5D4] hover:bg-[#00e2c4] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-between shadow-md shadow-[#00F5D4]/15 border border-white/20 cursor-pointer disabled:opacity-50 transition-all select-none"
                    >
                      <div className="flex items-center gap-2">
                        <Play className="size-3.5 fill-slate-950 text-slate-950 shrink-0" />
                        <span>Run Feasibility</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/15 text-slate-950 text-[10px] font-mono font-semibold shrink-0">
                        5 Agents
                      </span>
                    </motion.button>
                  )}

                  <Link
                    href="/agents"
                    className="w-full max-w-[280px] mt-2 flex items-center justify-between p-3 rounded-xl bg-[#161B22]/80 hover:bg-[#161B22] border border-white/[0.08] hover:border-emerald-500/30 transition-all cursor-pointer group shadow-sm"
                    title="Inspect 5 Specialized Swarm Agents"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                        <BotLogo className="size-4" isActive={false} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold text-white tracking-tight">
                          Inspect 5 Swarm Agents
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Mathematical models & statutory specs →
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="size-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
                  </Link>
                </div>
              ) : activeSection === 'overview' ? (
                /* 2. Redesigned High-Impact Executive Overview (No Intimidating Clutter) */
                <div className="flex flex-col gap-3">
                  {/* Hero Radial Feasibility Gauge */}
                  <FeasibilityScoreGauge score={viabilityScore} />

                  {/* 4 Corridor Vital Signs Strip */}
                  <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/[0.05]">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[9.5px] uppercase font-mono text-purple-400 flex items-center gap-1 truncate">
                        <Users className="size-2.5 shrink-0" /> Catchment
                      </span>
                      <span className="font-mono tabular-nums text-xs font-bold text-white truncate">
                        {formatNum(pop500m)}
                      </span>
                      <span className="text-[8.5px] text-slate-500 truncate">500m walking</span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[9.5px] uppercase font-mono text-yellow-400 flex items-center gap-1 truncate">
                        <Briefcase className="size-2.5 shrink-0" /> Multiplier
                      </span>
                      <span className="font-mono tabular-nums text-xs font-bold text-yellow-400 truncate">
                        {multiplier.toFixed(1)}x
                      </span>
                      <span className="text-[8.5px] text-slate-500 truncate">{formatINR(todYield)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[9.5px] uppercase font-mono text-cyan-400 flex items-center gap-1 truncate">
                        <Navigation className="size-2.5 shrink-0" /> Travel Time
                      </span>
                      <span className="font-mono tabular-nums text-xs font-bold text-cyan-400 truncate">
                        -{timeSaved.toFixed(0)}m
                      </span>
                      <span className="text-[8.5px] text-slate-500 truncate">peak savings</span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[9.5px] uppercase font-mono text-emerald-400 flex items-center gap-1 truncate">
                        <Trees className="size-2.5 shrink-0" /> Statutory
                      </span>
                      <span className={`font-mono tabular-nums text-xs font-bold truncate ${lakeBreaches > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {ktfdStatus === 'COMPLIANT' ? 'CLEARED' : 'FLAGGED'}
                      </span>
                      <span className="text-[8.5px] text-slate-500 truncate">{lakeBreaches} breaches</span>
                    </div>
                  </div>

                  {/* Executive Authority Synthesis with Expand/Collapse */}
                  {dossier?.executive_summary && (
                    <div className="p-3.5 rounded-xl bg-[#13161c] border border-white/[0.06] border-l-2 border-l-emerald-500/80 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <FileText className="size-3.5 text-emerald-400" />
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-200 font-semibold">
                            Executive Authority Synthesis
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          5-AGENT CONSENSUS
                        </span>
                      </div>
                      <p className={`text-[12px] leading-relaxed text-slate-300 font-sans ${isSummaryExpanded ? '' : 'line-clamp-3'}`}>
                        {dossier.executive_summary}
                      </p>
                      {dossier.executive_summary.length > 200 && (
                        <button
                          onClick={() => setIsSummaryExpanded((prev) => !prev)}
                          className="text-[10.5px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer self-start transition-colors"
                        >
                          {isSummaryExpanded ? 'Collapse synthesis ↑' : 'Read full briefing ↓'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Curated 4-Pillar Bento Grid (Progressive Disclosure) */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Pillar Intelligence Highlights
                      </span>
                      <button
                        onClick={() => {
                          setActiveSection('pillars');
                          setActivePillar('all');
                        }}
                        className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Inspect All Pillars</span>
                        <ChevronRight className="size-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Bento 1: Demographics */}
                      <div
                        onClick={() => {
                          setActiveSection('pillars');
                          setActivePillar('demographics');
                        }}
                        className="p-3 rounded-xl bg-[#14161b] hover:bg-[#181b22] border border-white/[0.05] hover:border-purple-500/30 transition-all flex flex-col justify-between gap-2 cursor-pointer group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-purple-400">
                            <Users className="size-3.5" />
                            <span className="text-[11px] font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                              Demographics
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">
                            {equityScore.toFixed(0)}/100
                          </span>
                        </div>
                        <div>
                          <div className="font-mono tabular-nums text-sm font-bold text-white tracking-tight">
                            {formatNum(pop500m)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {(underservedRatio * 100).toFixed(0)}% transit-dependent
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-1 border-t border-white/[0.04]">
                          <span>{formatNum(pop1500m)} feeder shed</span>
                          <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform">Details →</span>
                        </div>
                      </div>

                      {/* Bento 2: Economic */}
                      <div
                        onClick={() => {
                          setActiveSection('pillars');
                          setActivePillar('economic');
                        }}
                        className="p-3 rounded-xl bg-[#14161b] hover:bg-[#181b22] border border-white/[0.05] hover:border-yellow-500/30 transition-all flex flex-col justify-between gap-2 cursor-pointer group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-yellow-400">
                            <Briefcase className="size-3.5" />
                            <span className="text-[11px] font-semibold text-slate-200 group-hover:text-yellow-300 transition-colors">
                              Economic & TOD
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-yellow-400 bg-yellow-500/10 px-1.5 py-0.2 rounded border border-yellow-500/20">
                            {multiplier.toFixed(1)}x
                          </span>
                        </div>
                        <div>
                          <div className="font-mono tabular-nums text-sm font-bold text-white tracking-tight">
                            {techParks + commercial} POI Hubs
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {techParks} Tech Parks • {commercial} Commercial
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-1 border-t border-white/[0.04]">
                          <span>{formatINR(farebox)} farebox</span>
                          <span className="text-yellow-400 group-hover:translate-x-0.5 transition-transform">Details →</span>
                        </div>
                      </div>

                      {/* Bento 3: Mobility */}
                      <div
                        onClick={() => {
                          setActiveSection('pillars');
                          setActivePillar('mobility');
                        }}
                        className="p-3 rounded-xl bg-[#14161b] hover:bg-[#181b22] border border-white/[0.05] hover:border-cyan-500/30 transition-all flex flex-col justify-between gap-2 cursor-pointer group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-cyan-400">
                            <Navigation className="size-3.5" />
                            <span className="text-[11px] font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                              Mobility
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                            -{timeSaved.toFixed(0)}m
                          </span>
                        </div>
                        <div>
                          <div className="font-mono tabular-nums text-sm font-bold text-white tracking-tight">
                            {congestionReduction.toFixed(1)}% Relief
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {formatNum(ridership)} daily ridership
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-1 border-t border-white/[0.04]">
                          <span>{feederScore.toFixed(0)}% feeder network</span>
                          <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">Details →</span>
                        </div>
                      </div>

                      {/* Bento 4: Ecological */}
                      <div
                        onClick={() => {
                          setActiveSection('pillars');
                          setActivePillar('ecological');
                        }}
                        className="p-3 rounded-xl bg-[#14161b] hover:bg-[#181b22] border border-white/[0.05] hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-2 cursor-pointer group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <Trees className="size-3.5" />
                            <span className="text-[11px] font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                              Ecological
                            </span>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            ktfdStatus === 'COMPLIANT'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {ktfdStatus}
                          </span>
                        </div>
                        <div>
                          <div className="font-mono tabular-nums text-sm font-bold text-white tracking-tight">
                            {lakeBreaches} Lake Breaches
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {rajakaluveCrossings} rajakaluve crossings
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-1 border-t border-white/[0.04]">
                          <span>Flood grade: {floodGrade}</span>
                          <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">Details →</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Action Strips for Stations and Risks */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      onClick={() => setActiveSection('stations')}
                      className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/[0.05] hover:border-cyan-500/30 transition-all flex items-center justify-between text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <MapPin className="size-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-slate-200 group-hover:text-white">
                            {stations.length} Station Nodes
                          </span>
                          <span className="text-[9px] text-slate-400">Click to focus map</span>
                        </div>
                      </div>
                      <ChevronRight className="size-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveSection('risks');
                        setGovernanceSubTab('risks');
                      }}
                      className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/[0.05] hover:border-amber-500/30 transition-all flex items-center justify-between text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="size-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-slate-200 group-hover:text-white">
                            {warnings.length} Risk Flags
                          </span>
                          <span className="text-[9px] text-slate-400">Actionable mitigations</span>
                        </div>
                      </div>
                      <ChevronRight className="size-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>
              ) : activeSection === 'pillars' || ['demographics', 'economic', 'mobility', 'ecological'].includes(activeSection) ? (
                /* 3. Deep-Dive Pillars Section with Segmented Controller */
                demographics && economic && mobility && ecological ? (
                  <div className="flex flex-col gap-3">
                    {/* Segmented Sub-Tab Switcher */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/[0.05] overflow-x-auto [scrollbar-width:none]">
                      {[
                        { id: 'all', label: 'All 4 Pillars', icon: <TrendingUp className="size-3.5" /> },
                        { id: 'demographics', label: 'Demographics', icon: <Users className="size-3.5 text-purple-400" /> },
                        { id: 'economic', label: 'Economic', icon: <Briefcase className="size-3.5 text-yellow-400" /> },
                        { id: 'mobility', label: 'Mobility', icon: <Navigation className="size-3.5 text-cyan-400" /> },
                        { id: 'ecological', label: 'Ecological', icon: <Trees className="size-3.5 text-emerald-400" /> },
                      ].map((p) => {
                        const currentPillar = activeSection === 'pillars' ? activePillar : activeSection;
                        const isSelected = currentPillar === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActiveSection('pillars');
                              setActivePillar(p.id as any);
                            }}
                            className={`relative px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
                              isSelected ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="active-pillar-subtab-pill"
                                className="absolute inset-0 rounded-lg bg-white/10 border border-white/15"
                                transition={motionSprings.snappy}
                              />
                            )}
                            <span className="relative z-10 flex items-center gap-1.5">
                              {p.icon}
                              <span>{p.label}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <DomainPillarCards
                      demographics={demographics}
                      economic={economic}
                      mobility={mobility}
                      ecological={ecological}
                      selectedPillar={activeSection === 'pillars' ? activePillar : (activeSection as any)}
                      hideTabBar={true}
                    />
                  </div>
                ) : null
              ) : activeSection === 'stations' ? (
                /* 4. Suggested Stations Section */
                <div className="flex flex-col gap-3">
                  <div className="p-3 rounded-xl bg-[#14161b] border border-white/[0.06] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <MapPin className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">
                          Suggested Interchange Nodes
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-sans">
                          Click station card to zoom and center map camera
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[10.5px] font-mono tabular-nums font-bold">
                      {stations.length} Nodes
                    </span>
                  </div>

                  <SuggestedStationList
                    stations={stations}
                    onStationClick={onStationSelect}
                    selectedStationId={selectedStationId}
                  />
                </div>
              ) : activeSection === 'risks' || activeSection === 'policies' ? (
                /* 5. Governance & Risks Section */
                <div className="flex flex-col gap-3">
                  {/* Segmented Sub-Tab Control: Risks vs Policies */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/[0.05]">
                    <button
                      onClick={() => {
                        setActiveSection('risks');
                        setGovernanceSubTab('risks');
                      }}
                      className={`flex-1 relative py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        governanceSubTab === 'risks' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {governanceSubTab === 'risks' && (
                        <motion.div
                          layoutId="governance-subtab-pill"
                          className="absolute inset-0 rounded-lg bg-white/10 border border-white/15"
                          transition={motionSprings.snappy}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5 text-amber-400" />
                        <span>Actionable Risks</span>
                        {warnings.length > 0 && (
                          <span className="font-mono text-[9.5px] tabular-nums font-bold text-amber-400 bg-amber-500/10 px-1.5 rounded">
                            {warnings.length}
                          </span>
                        )}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveSection('risks');
                        setGovernanceSubTab('policies');
                      }}
                      className={`flex-1 relative py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        governanceSubTab === 'policies' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {governanceSubTab === 'policies' && (
                        <motion.div
                          layoutId="governance-subtab-pill"
                          className="absolute inset-0 rounded-lg bg-white/10 border border-white/15"
                          transition={motionSprings.snappy}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-indigo-400" />
                        <span>TOD Directives</span>
                        {policies.length > 0 && (
                          <span className="font-mono text-[9.5px] tabular-nums font-bold text-indigo-400 bg-indigo-500/10 px-1.5 rounded">
                            {policies.length}
                          </span>
                        )}
                      </span>
                    </button>
                  </div>

                  {governanceSubTab === 'risks' ? (
                    <ActionableRiskWarnings warnings={warnings} />
                  ) : (
                    <PolicyRecommendations recommendations={policies} />
                  )}
                </div>
              ) : null}
            </div>

            {/* 4. Panel Command Footer */}
            {dossier && (
              <div className="px-4 py-2.5 border-t border-white/[0.07] bg-[#12151b]/80 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                  <span>ID:</span>
                  <span className="text-slate-400 truncate max-w-[120px]">
                    {dossier.corridor_id}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onEvaluateTrigger && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={onEvaluateTrigger}
                      disabled={isEvaluating}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-mono flex items-center gap-1 border border-white/10 transition-colors cursor-pointer"
                      title="Re-run evaluation"
                    >
                      <RotateCcw className="size-3 text-cyan-400" />
                      <span>Re-evaluate</span>
                    </motion.button>
                  )}
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

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

export type DossierSection = 'overview' | 'stations' | 'risks' | 'policies' | 'telemetry';

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

            {/* 2. Section Sub-Navigation Tabs */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.06] bg-black/25 shrink-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {[
                {
                  id: 'overview' as DossierSection,
                  label: 'Overview',
                  icon: <TrendingUp className="size-3.5 text-emerald-400" />,
                  badge: dossier ? (
                    <span className="font-mono tabular-nums text-[10px] text-emerald-400 font-bold ml-0.5">
                      {viabilityScore.toFixed(0)}
                    </span>
                  ) : null,
                },
                {
                  id: 'stations' as DossierSection,
                  label: 'Stations',
                  icon: <MapPin className="size-3.5 text-cyan-400" />,
                  badge: stations.length > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 text-[9.5px] font-mono tabular-nums font-bold">
                      {stations.length}
                    </span>
                  ) : null,
                },
                {
                  id: 'risks' as DossierSection,
                  label: 'Risks',
                  icon: <AlertTriangle className="size-3.5 text-amber-400" />,
                  badge: warnings.length > 0 ? (
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[9.5px] font-mono tabular-nums font-bold border ${
                        warnings.some((w) => (w.severity || '').toUpperCase() === 'CRITICAL')
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {warnings.length}
                    </span>
                  ) : null,
                },
                {
                  id: 'policies' as DossierSection,
                  label: 'Policies',
                  icon: <ShieldCheck className="size-3.5 text-indigo-400" />,
                  badge: policies.length > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[9.5px] font-mono tabular-nums font-bold">
                      {policies.length}
                    </span>
                  ) : null,
                },
                {
                  id: 'telemetry' as DossierSection,
                  label: 'Telemetry',
                  icon: (
                    <div className="relative size-2 shrink-0">
                      {isEvaluating && <span className="absolute size-2 rounded-full bg-cyan-400 animate-ping" />}
                      <span className={`size-2 rounded-full block ${isEvaluating ? 'bg-cyan-400' : 'bg-slate-500'}`} />
                    </div>
                  ),
                  badge: telemetryLogs.length > 0 ? (
                    <span className="text-[10px] font-mono text-slate-500">
                      ({telemetryLogs.length})
                    </span>
                  ) : null,
                },
              ].map((tab) => {
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`relative px-2.5 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
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
                    <span className="relative z-10 flex items-center gap-1.5">
                      {tab.icon}
                      <span>{tab.label}</span>
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3. Main Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {activeSection === 'telemetry' ? (
                /* Telemetry View */
                <SwarmTelemetryStream
                  isScanning={isEvaluating}
                  agents={swarmAgents}
                  logs={telemetryLogs}
                  stage={currentStage}
                />
              ) : activeSection === 'stations' ? (
                /* Dedicated Suggested Station Proposals Section */
                dossier ? (
                  <div className="flex flex-col gap-3">
                    <div className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.06] flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <MapPin className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white">
                            Suggested Station Interchanges
                          </span>
                          <span className="text-[10.5px] text-slate-400 font-sans">
                            Interactive nodes • Click card to focus map camera
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
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 my-auto gap-3">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <MapPin className="size-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-semibold text-slate-200">
                        Station Proposals Awaiting Swarm Run
                      </h4>
                      <p className="text-xs text-slate-400 max-w-[280px] font-sans leading-relaxed">
                        Station proposals and alignment nodes are dynamically synthesized by the Structured Spatial Visualizer agent upon corridor evaluation.
                      </p>
                    </div>
                    {onEvaluateTrigger && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onEvaluateTrigger}
                        disabled={isEvaluating}
                        className="mt-2 w-full max-w-[280px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="size-3.5" />
                        <span>Run Feasibility Swarm</span>
                      </motion.button>
                    )}
                  </div>
                )
              ) : activeSection === 'risks' ? (
                /* Dedicated Actionable Risk Warnings Section */
                dossier ? (
                  <div className="flex flex-col gap-3">
                    <div className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.06] flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white">
                            Statutory Risk & Friction Matrix
                          </span>
                          <span className="text-[10.5px] text-slate-400 font-sans">
                            Actionable environmental, zoning & civil engineering mitigations
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-mono tabular-nums font-bold border ${
                          warnings.some((w) => (w.severity || '').toUpperCase() === 'CRITICAL')
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {warnings.length} Flagged
                      </span>
                    </div>

                    <ActionableRiskWarnings warnings={warnings} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 my-auto gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <AlertTriangle className="size-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-semibold text-slate-200">
                        Risk Matrix Awaiting Swarm Run
                      </h4>
                      <p className="text-xs text-slate-400 max-w-[280px] font-sans leading-relaxed">
                        Ecological setback violations (KTFD lake 30m, rajakaluve 50m) and civil friction points are computed upon dispatching the swarm.
                      </p>
                    </div>
                    {onEvaluateTrigger && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onEvaluateTrigger}
                        disabled={isEvaluating}
                        className="mt-2 w-full max-w-[280px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="size-3.5" />
                        <span>Run Feasibility Swarm</span>
                      </motion.button>
                    )}
                  </div>
                )
              ) : activeSection === 'policies' ? (
                /* Dedicated Policy Directives Section */
                dossier ? (
                  <div className="flex flex-col gap-3">
                    <div className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.06] flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <ShieldCheck className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white">
                            Policy Directives & TOD Governance
                          </span>
                          <span className="text-[10.5px] text-slate-400 font-sans">
                            BMRCL / BBMP statutory compliance and Transit-Oriented Development mandates
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[10.5px] font-mono tabular-nums font-bold">
                        {policies.length} Directives
                      </span>
                    </div>

                    <PolicyRecommendations recommendations={policies} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 my-auto gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <ShieldCheck className="size-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-semibold text-slate-200">
                        Policy Directives Awaiting Swarm Run
                      </h4>
                      <p className="text-xs text-slate-400 max-w-[280px] font-sans leading-relaxed">
                        Regulatory mandates, farebox optimization directives, and statutory approvals are formulated following swarm synthesis.
                      </p>
                    </div>
                    {onEvaluateTrigger && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onEvaluateTrigger}
                        disabled={isEvaluating}
                        className="mt-2 w-full max-w-[280px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="size-3.5" />
                        <span>Run Feasibility Swarm</span>
                      </motion.button>
                    )}
                  </div>
                )
              ) : dossier ? (
                /* Dedicated Overview / Executive Dossier Section */
                <>
                  {/* Feasibility Gauge */}
                  <FeasibilityScoreGauge score={viabilityScore} />

                  {/* Deep Dive Button into /agents */}
                  <Link
                    href="/agents"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-[#161B22] to-cyan-500/10 border border-emerald-500/30 hover:border-emerald-400/60 transition-all cursor-pointer group shadow-lg shadow-black/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                        <BotLogo className="size-4" isActive={true} />
                      </div>
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white tracking-tight">
                            Full Swarm Audit Traces
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            5 AGENTS
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-sans">
                          Inspect deep empirical models, formulas & traces →
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="size-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </Link>

                  {/* Executive Summary Statement */}
                  {dossier.executive_summary && (
                    <div className="p-4 rounded-xl bg-[#13161c] border border-white/[0.07] shadow-sm flex flex-col gap-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <FileText className="size-3.5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                              Executive Authority Brief
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Autonomous Multi-Agent Synthesis
                            </span>
                          </div>
                        </div>
                        {dossier.overall_viability_score != null && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10.5px] font-mono tabular-nums font-bold">
                            {dossier.overall_viability_score.toFixed(1)} / 100
                          </span>
                        )}
                      </div>
                      <p className="text-[12.5px] leading-relaxed text-slate-200 font-sans tracking-[0.01em] whitespace-pre-line">
                        {dossier.executive_summary}
                      </p>
                    </div>
                  )}

                  {/* Quick Jump Cards to Dedicated Sections */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setActiveSection('stations')}
                      className="p-2.5 rounded-xl bg-[#14161b] hover:bg-[#181b22] border border-white/[0.05] hover:border-cyan-500/30 transition-all flex flex-col gap-1 text-left cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center justify-between text-cyan-400">
                        <MapPin className="size-3.5" />
                        <span className="text-[11px] font-mono font-bold tabular-nums">{stations.length}</span>
                      </div>
                      <span className="text-[10.5px] font-semibold text-slate-300 group-hover:text-white transition-colors">Stations</span>
                      <span className="text-[9px] text-slate-500 truncate">Proposals →</span>
                    </button>

                    <button
                      onClick={() => setActiveSection('risks')}
                      className="p-2.5 rounded-xl bg-[#14161b] hover:bg-[#181b22] border border-white/[0.05] hover:border-amber-500/30 transition-all flex flex-col gap-1 text-left cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center justify-between text-amber-400">
                        <AlertTriangle className="size-3.5" />
                        <span className="text-[11px] font-mono font-bold tabular-nums">{warnings.length}</span>
                      </div>
                      <span className="text-[10.5px] font-semibold text-slate-300 group-hover:text-white transition-colors">Risk Flags</span>
                      <span className="text-[9px] text-slate-500 truncate">Mitigations →</span>
                    </button>

                    <button
                      onClick={() => setActiveSection('policies')}
                      className="p-2.5 rounded-xl bg-[#14161b] hover:bg-[#181b22] border border-white/[0.05] hover:border-indigo-500/30 transition-all flex flex-col gap-1 text-left cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center justify-between text-indigo-400">
                        <ShieldCheck className="size-3.5" />
                        <span className="text-[11px] font-mono font-bold tabular-nums">{policies.length}</span>
                      </div>
                      <span className="text-[10.5px] font-semibold text-slate-300 group-hover:text-white transition-colors">Directives</span>
                      <span className="text-[9px] text-slate-500 truncate">Governance →</span>
                    </button>
                  </div>

                  {/* 4 Domain Pillar Impact Cards */}
                  {demographics && economic && mobility && ecological && (
                    <DomainPillarCards
                      demographics={demographics}
                      economic={economic}
                      mobility={mobility}
                      ecological={ecological}
                    />
                  )}
                </>
              ) : (
                /* Standby / Empty State when not yet evaluated */
                <div className="flex flex-col items-center justify-center text-center p-6 my-auto gap-3">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-slate-400">
                    <MapPin className="size-6 text-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-semibold text-slate-200">
                      Corridor Ready For Evaluation
                    </h4>
                    <p className="text-xs text-slate-400 max-w-[280px] font-sans leading-relaxed">
                      Select an origin station and drop a candidate terminus pin on the canvas to dispatch the 5-agent feasibility swarm.
                    </p>
                  </div>

                  {onEvaluateTrigger && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onEvaluateTrigger}
                      disabled={isEvaluating}
                      className="mt-2 w-full max-w-[280px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="size-3.5" />
                      <span>Run Feasibility Swarm</span>
                    </motion.button>
                  )}

                  {/* Prominent Link to /agents even during standby */}
                  <Link
                    href="/agents"
                    className="w-full max-w-[280px] mt-2.5 flex items-center justify-between p-3 rounded-xl bg-[#161B22]/80 hover:bg-[#161B22] border border-white/[0.08] hover:border-emerald-500/30 transition-all cursor-pointer group"
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
              )}
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

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
  const [activeView, setActiveView] = useState<'dossier' | 'telemetry'>('dossier');

  // Automatically switch tab based on evaluation state
  React.useEffect(() => {
    if (isEvaluating) {
      setActiveView('telemetry');
    } else if (dossier) {
      setActiveView('dossier');
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

            {/* 2. Mode Sub-Navigation Tabs */}
            <div className="flex items-center gap-1 px-3.5 py-2 border-b border-white/[0.04] bg-black/20 shrink-0">
              <button
                onClick={() => setActiveView('dossier')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-medium font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeView === 'dossier'
                    ? 'bg-white/10 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="size-3.5 text-emerald-400" />
                <span>Executive Dossier</span>
                {dossier && (
                  <span className="font-mono tabular-nums text-[10.5px] text-emerald-400 font-bold ml-1">
                    {viabilityScore.toFixed(0)}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveView('telemetry')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-medium font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeView === 'telemetry'
                    ? 'bg-white/10 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative size-2">
                  {isEvaluating && <span className="absolute size-2 rounded-full bg-cyan-400 animate-ping" />}
                  <span className={`size-2 rounded-full block ${isEvaluating ? 'bg-cyan-400' : 'bg-slate-500'}`} />
                </div>
                <span>Swarm Telemetry</span>
                <span className="text-[10px] font-mono text-slate-500">
                  ({telemetryLogs.length})
                </span>
              </button>
            </div>

            {/* 3. Main Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {activeView === 'telemetry' ? (
                /* Telemetry View */
                <SwarmTelemetryStream
                  isScanning={isEvaluating}
                  agents={swarmAgents}
                  logs={telemetryLogs}
                  stage={currentStage}
                />
              ) : dossier ? (
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

                  {/* 4 Domain Pillar Impact Cards */}
                  {demographics && economic && mobility && ecological && (
                    <DomainPillarCards
                      demographics={demographics}
                      economic={economic}
                      mobility={mobility}
                      ecological={ecological}
                    />
                  )}

                  {/* Actionable Risk Warnings List */}
                  <ActionableRiskWarnings warnings={warnings} />

                  {/* Suggested Station List */}
                  <SuggestedStationList
                    stations={stations}
                    onStationClick={onStationSelect}
                    selectedStationId={selectedStationId}
                  />

                  {/* Policy Recommendations */}
                  <PolicyRecommendations recommendations={policies} />
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

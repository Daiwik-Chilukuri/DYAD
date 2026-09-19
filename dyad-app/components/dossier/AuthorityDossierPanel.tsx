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
} from 'lucide-react';
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
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={motionSprings.snappy}
          onClick={onToggleOpen}
          className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5 text-slate-200 hover:text-white hover:border-white/20 transition-all pointer-events-auto cursor-pointer group"
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
          <span className="text-xs font-mono font-semibold tracking-tight">
            {isEvaluating ? 'Swarm Running...' : 'Authority Dossier'}
          </span>
          {dossier && (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10.5px] font-mono tabular-nums font-bold">
              {viabilityScore.toFixed(1)}
            </span>
          )}
          <ChevronLeft className="size-4 text-slate-400 group-hover:translate-x-[-2px] transition-transform" />
        </motion.button>
      )}

      {/* Main Collapsible Right-Side Command Center Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, x: 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.98 }}
            transition={motionSprings.smooth}
            className="absolute top-4 right-4 bottom-4 z-30 w-[420px] max-w-[calc(100vw-5rem)] flex flex-col bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5 rounded-2xl overflow-hidden pointer-events-auto select-none"
          >
            {/* Specular Top Edge Highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

            {/* 1. Command Center Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-white/[0.06] bg-[#161B22]/40 shrink-0">
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

              <div className="flex items-center gap-1 shrink-0">
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
            <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10">
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

                  {/* Executive Summary Statement */}
                  {dossier.executive_summary && (
                    <div className="p-3 rounded-xl bg-[#161B22]/50 border border-white/[0.04] text-[11.5px] leading-relaxed text-slate-300 font-sans">
                      <p className="line-clamp-4">{dossier.executive_summary}</p>
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
                      className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="size-3.5" />
                      <span>Run Feasibility Swarm</span>
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* 4. Panel Command Footer */}
            {dossier && (
              <div className="p-3 border-t border-white/[0.06] bg-[#161B22]/50 flex items-center justify-between gap-2 shrink-0">
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

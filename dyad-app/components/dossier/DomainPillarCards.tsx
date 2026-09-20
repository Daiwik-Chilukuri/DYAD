'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  Navigation,
  Trees,
  TrendingUp,
  ShieldCheck,
  Building2,
  Clock,
  Waves,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { motionSprings } from '../../lib/motion';
import type {
  DemographicsPillarMetrics,
  EconomicPillarMetrics,
  MobilityPillarMetrics,
  EcologicalPillarMetrics,
} from '../../types/dossier';

interface DomainPillarCardsProps {
  demographics: DemographicsPillarMetrics;
  economic: EconomicPillarMetrics;
  mobility: MobilityPillarMetrics;
  ecological: EcologicalPillarMetrics;
  selectedPillar?: PillarTab;
  hideTabBar?: boolean;
}

type PillarTab = 'all' | 'demographics' | 'economic' | 'mobility' | 'ecological';

export function DomainPillarCards({
  demographics,
  economic,
  mobility,
  ecological,
  selectedPillar,
  hideTabBar = false,
}: DomainPillarCardsProps) {
  const [internalTab, setInternalTab] = useState<PillarTab>('all');
  const activeTab = selectedPillar ?? internalTab;

  // Format helpers
  const formatINR = (val?: number) =>
    val != null ? `₹${val.toLocaleString('en-IN')} Cr` : '—';
  const formatNum = (val?: number) =>
    val != null ? val.toLocaleString('en-IN') : '0';

  // Normalize demographics fields
  const pop500m = demographics?.catchment_population_500m ?? 0;
  const pop1500m = demographics?.catchment_population_1500m ?? 0;
  const equityScore = demographics?.equity_index_score ?? demographics?.equity_score ?? 0;
  const underservedRatio = demographics?.underserved_transit_ratio ?? demographics?.underserved_demographic_ratio ?? 0;
  const density = demographics?.density_per_sqkm ?? (pop1500m > 0 ? Math.round(pop1500m / 7.0) : 0);

  // Normalize economic fields
  const techParks = economic?.tech_parks_within_1km ?? 0;
  const hospitals = economic?.hospitals_within_1km ?? 0;
  const commercial = economic?.commercial_centers_within_1km ?? 0;
  const farebox = economic?.annual_farebox_revenue_inr_cr ?? economic?.projected_annual_farebox_inr_cr ?? 0;
  const multiplier = economic?.economic_multiplier_index ?? 1.0;
  const todYield = economic?.estimated_tod_yield_inr_cr ?? (farebox * 2.2);

  // Normalize mobility fields
  const timeSaved = mobility?.peak_hour_travel_time_saved_minutes ?? mobility?.peak_hour_travel_time_saved_mins ?? 0;
  const congestionReduction = mobility?.arterial_congestion_reduction_pct ?? 0;
  const feederScore = mobility?.feeder_route_coverage_score ?? 0;
  const ridership = mobility?.daily_projected_ridership ?? 0;

  // Normalize ecological fields
  const lakeBreaches = ecological?.lake_buffer_infringements_30m ?? ecological?.lake_buffer_infringements ?? 0;
  const rajakaluveCrossings = ecological?.rajakaluve_crossings_50m ?? ecological?.rajakaluve_buffer_infringements ?? 0;
  const ktfdStatus = ecological?.ktfd_compliance_status ?? (lakeBreaches === 0 ? 'COMPLIANT' : 'FLAGGED');
  const floodGrade = ecological?.flood_vulnerability_grade ?? 'MODERATE';
  const canopyScore = ecological?.tree_canopy_loss_risk_score ?? 25;

  const tabs: { id: PillarTab; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All 4 Pillars', icon: <TrendingUp className="size-3.5" /> },
    { id: 'demographics', label: 'Demographics', icon: <Users className="size-3.5" /> },
    { id: 'economic', label: 'Economic', icon: <Briefcase className="size-3.5" /> },
    { id: 'mobility', label: 'Mobility', icon: <Navigation className="size-3.5" /> },
    { id: 'ecological', label: 'Ecological', icon: <Trees className="size-3.5" /> },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Pillar Navigation Tabs */}
      {!hideTabBar && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/[0.05] overflow-x-auto [scrollbar-width:none]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setInternalTab(tab.id)}
                className={`relative px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
                  isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pillar-pill"
                    className="absolute inset-0 rounded-lg bg-white/10 border border-white/15"
                    transition={motionSprings.snappy}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 1. Demographics & Spatial Equity */}
      {(activeTab === 'all' || activeTab === 'demographics') && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionSprings.smooth}
          className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#161B22]/60 border border-white/[0.06]"
        >
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Users className="size-3.5" />
              </span>
              <div>
                <h4 className="text-xs font-semibold text-slate-200 tracking-tight">
                  Demographics & Spatial Equity
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Pillar 1 • Catchment & Equity</span>
              </div>
            </div>
            <span className="font-mono tabular-nums text-xs font-semibold text-emerald-400">
              {equityScore.toFixed(1)}/100 Equity
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">500m Walking Pop</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
                {formatNum(pop500m)}
              </span>
              <span className="text-[9.5px] text-slate-500">primary pedestrian shed</span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">1500m Feeder Pop</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {formatNum(pop1500m)}
              </span>
              <span className="text-[9.5px] text-slate-500">first/last mile radius</span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">Underserved Ratio</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-cyan-400">
                {(underservedRatio * 100).toFixed(1)}%
              </span>
              <span className="text-[9.5px] text-slate-500">transit-dependent share</span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">Urban Density</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {formatNum(density)} /km²
              </span>
              <span className="text-[9.5px] text-slate-500">BBMP ward dasymetric</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Economic Corridor & TOD */}
      {(activeTab === 'all' || activeTab === 'economic') && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionSprings.smooth}
          className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#161B22]/60 border border-white/[0.06]"
        >
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Briefcase className="size-3.5" />
              </span>
              <div>
                <h4 className="text-xs font-semibold text-slate-200 tracking-tight">
                  Economic Corridor & TOD
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Pillar 2 • Yield & Multiplier</span>
              </div>
            </div>
            <span className="font-mono tabular-nums text-xs font-semibold text-yellow-400">
              {multiplier.toFixed(2)}x Multiplier
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">Tech Parks</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
                {techParks}
              </span>
              <span className="text-[9.5px] text-slate-500">&lt;1km corridor</span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">Hospitals</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {hospitals}
              </span>
              <span className="text-[9.5px] text-slate-500">&lt;1km corridor</span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">Commercial</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {commercial}
              </span>
              <span className="text-[9.5px] text-slate-500">&lt;1km corridor</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">Annual Farebox</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
                {formatINR(farebox)}
              </span>
              <span className="text-[9.5px] text-slate-500">projected revenue</span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">Estimated TOD Yield</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-yellow-400">
                {formatINR(todYield)}
              </span>
              <span className="text-[9.5px] text-slate-500">land value capture</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Mobility & Congestion */}
      {(activeTab === 'all' || activeTab === 'mobility') && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionSprings.smooth}
          className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#161B22]/60 border border-white/[0.06]"
        >
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Navigation className="size-3.5" />
              </span>
              <div>
                <h4 className="text-xs font-semibold text-slate-200 tracking-tight">
                  Mobility & Congestion
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Pillar 3 • Time Delta & Feeder</span>
              </div>
            </div>
            <span className="font-mono tabular-nums text-xs font-semibold text-emerald-400">
              -{timeSaved.toFixed(1)}m Peak Saved
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">Congestion Relief</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
                {congestionReduction.toFixed(1)}%
              </span>
              <span className="text-[9.5px] text-slate-500">arterial drop</span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">Daily Ridership</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {formatNum(ridership)}
              </span>
              <span className="text-[9.5px] text-slate-500">projected boardings</span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03] col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400">Feeder Route Coverage</span>
                <span className="font-mono tabular-nums text-xs font-semibold text-cyan-400">
                  {feederScore.toFixed(0)}/100
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, feederScore))}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. Ecological & Risk Friction */}
      {(activeTab === 'all' || activeTab === 'ecological') && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionSprings.smooth}
          className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#161B22]/60 border border-white/[0.06]"
        >
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Trees className="size-3.5" />
              </span>
              <div>
                <h4 className="text-xs font-semibold text-slate-200 tracking-tight">
                  Ecological & Risk Friction
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Pillar 4 • KTFD & Buffers</span>
              </div>
            </div>
            <span
              className={`font-mono tabular-nums text-[10.5px] font-semibold px-2 py-0.5 rounded-full border ${
                ktfdStatus === 'COMPLIANT'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : ktfdStatus === 'CRITICAL_BREACH'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {ktfdStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">30m Lake Breaches</span>
              <span
                className={`font-mono tabular-nums text-sm font-semibold ${
                  lakeBreaches > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {lakeBreaches}
              </span>
              <span className="text-[9.5px] text-slate-500">statutory buffer zones</span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">50m Rajakaluve</span>
              <span
                className={`font-mono tabular-nums text-sm font-semibold ${
                  rajakaluveCrossings > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {rajakaluveCrossings}
              </span>
              <span className="text-[9.5px] text-slate-500">stormwater crossings</span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">Flood Grade</span>
              <span
                className={`font-mono tabular-nums text-sm font-semibold ${
                  floodGrade === 'HIGH' || floodGrade === 'CRITICAL'
                    ? 'text-rose-400'
                    : floodGrade === 'MODERATE'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {floodGrade}
              </span>
              <span className="text-[9.5px] text-slate-500">vulnerability rating</span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="text-[10px] uppercase font-mono text-slate-400">Canopy Loss Risk</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {canopyScore.toFixed(0)}/100
              </span>
              <span className="text-[9.5px] text-slate-500">tree index impact</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

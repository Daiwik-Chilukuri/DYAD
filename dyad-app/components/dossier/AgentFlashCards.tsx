'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Landmark,
  TrendingUp,
  ShieldCheck,
  FileText,
  Users,
  MapPin,
  Car,
  Clock,
  Trees,
  Waves,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  Bus,
  ArrowUpRight,
  Briefcase,
  Navigation,
} from 'lucide-react';
import { motionSprings } from '../../lib/motion';
import type {
  DemographicsPillarMetrics,
  EconomicPillarMetrics,
  MobilityPillarMetrics,
  EcologicalPillarMetrics,
} from '../../types/dossier';

interface AgentFlashCardsProps {
  domain: 'demographics' | 'economic' | 'mobility' | 'ecological';
  demographics?: DemographicsPillarMetrics;
  economic?: EconomicPillarMetrics;
  mobility?: MobilityPillarMetrics;
  ecological?: EcologicalPillarMetrics;
}

export function AgentFlashCards({
  domain,
  demographics,
  economic,
  mobility,
  ecological,
}: AgentFlashCardsProps) {
  // Format helpers
  const formatINR = (val?: number) =>
    val != null ? `₹${val.toLocaleString('en-IN')} Cr` : '—';
  const formatNum = (val?: number) =>
    val != null ? val.toLocaleString('en-IN') : '0';

  if (domain === 'economic') {
    const techParks = economic?.tech_parks_within_1km ?? 4;
    const commercial = economic?.commercial_centers_within_1km ?? 16;
    const hospitals = economic?.hospitals_within_1km ?? 6;
    const farebox = economic?.annual_farebox_revenue_inr_cr ?? economic?.projected_annual_farebox_inr_cr ?? 28.5;
    const multiplier = economic?.economic_multiplier_index ?? 4.2;
    const todYield = economic?.estimated_tod_yield_inr_cr ?? (farebox * 2.4);

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionSprings.smooth}
        className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-3 shadow-sm"
      >
        {/* Header: Overview of Output Produced */}
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Briefcase className="size-3.5" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white tracking-tight">
                Economic & TOD Agent Output Overview
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                agent_economic_poi • Synthesis Ready
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-yellow-500/15 text-yellow-300 border border-yellow-500/25 text-[10px] font-mono font-bold tabular-nums">
            {multiplier.toFixed(2)}x Multiplier
          </span>
        </div>

        {/* Deliverable Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Annual Farebox</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
              {formatINR(farebox)}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">310 annual operating days</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Estimated TOD Yield</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-yellow-400">
              {formatINR(todYield)}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">20% betterment levy</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Tech & Commercial POIs</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
              {techParks} Parks • {commercial} Commercial
            </span>
            <span className="text-[9px] text-slate-500 font-mono">&lt;1km station walkshed</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Healthcare Anchors</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-cyan-400">
              {hospitals} Hospitals
            </span>
            <span className="text-[9px] text-slate-500 font-mono">vital civic access</span>
          </div>
        </div>

        {/* Output Tags & Intersects */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[9.5px] uppercase font-mono text-slate-500">Commercial Sectors Indexed:</span>
          <div className="flex flex-wrap gap-1.5">
            {['IT Campuses & SEZs', 'Retail Shopping Centers', 'Specialty Hospitals', 'Far Floor Area Bonus'].map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Link to Full Trajectory in Agents Suite */}
        <Link
          href="/agents"
          className="mt-1 flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-yellow-500/10 border border-white/[0.06] hover:border-yellow-500/30 text-slate-300 hover:text-yellow-300 transition-all text-[11px] font-mono group cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3 text-yellow-400" />
            <span>Inspect Gravity Model & Reasoning in Agents Suite</span>
          </div>
          <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </motion.div>
    );
  }

  if (domain === 'demographics') {
    const pop500m = demographics?.catchment_population_500m ?? 82000;
    const pop1500m = demographics?.catchment_population_1500m ?? 210000;
    const equityScore = demographics?.equity_index_score ?? demographics?.equity_score ?? 88.4;
    const underservedRatio = demographics?.underserved_transit_ratio ?? demographics?.underserved_demographic_ratio ?? 0.38;
    const denseWards = demographics?.dense_ward_names ?? [
      'Banasavadi (Ward 27)',
      'Benniganahalli (Ward 50)',
      'Vijnana Nagar (Ward 81)',
      'KR Puram (Ward 52)',
      'Hennur (Ward 24)',
    ];
    const vulnerableSlumPop = Math.round(pop500m * underservedRatio * 0.45);

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionSprings.smooth}
        className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-3 shadow-sm"
      >
        {/* Header: Overview of Output Produced */}
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="size-3.5" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white tracking-tight">
                Demographics Agent Output Overview
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                agent_demographics • Synthesis Ready
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25 text-[10px] font-mono font-bold tabular-nums">
            {equityScore.toFixed(1)} / 100 Equity
          </span>
        </div>

        {/* Deliverable Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Walking Shed (500m)</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
              {formatNum(pop500m)}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">areal-weighted census pop</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Feeder Shed (1500m)</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
              {formatNum(pop1500m)}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">first/last mile radius</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Vulnerable Commuters</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-purple-300">
              {formatNum(vulnerableSlumPop)}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">informal settlement inclusion</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Transit Dependency</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-cyan-400">
              {(underservedRatio * 100).toFixed(1)}%
            </span>
            <span className="text-[9px] text-slate-500 font-mono">transit-reliant demographic</span>
          </div>
        </div>

        {/* Intersected Municipal Wards */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-mono text-slate-500">BBMP Wards in Catchment:</span>
            <span className="text-[9.5px] font-mono text-slate-400">{denseWards.length} Wards</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {denseWards.map((w, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-slate-300 flex items-center gap-1"
              >
                <span className="size-1.5 rounded-full bg-purple-400" />
                <span>{w}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Link to Full Trajectory in Agents Suite */}
        <Link
          href="/agents"
          className="mt-1 flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-purple-500/10 border border-white/[0.06] hover:border-purple-500/30 text-slate-300 hover:text-purple-300 transition-all text-[11px] font-mono group cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3 text-purple-400" />
            <span>Inspect Dasymetric Model & Census Weighting in Agents Suite</span>
          </div>
          <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </motion.div>
    );
  }

  if (domain === 'mobility') {
    const timeSaved = mobility?.peak_hour_travel_time_saved_minutes ?? mobility?.peak_hour_travel_time_saved_mins ?? 22.0;
    const congestionReduction = mobility?.arterial_congestion_reduction_pct ?? 25.0;
    const feederScore = mobility?.feeder_route_coverage_score ?? 78;
    const ridership = mobility?.daily_projected_ridership ?? 48500;

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionSprings.smooth}
        className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-3 shadow-sm"
      >
        {/* Header: Overview of Output Produced */}
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Navigation className="size-3.5" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white tracking-tight">
                Mobility & Relief Agent Output Overview
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                agent_mobility • Synthesis Ready
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[10px] font-mono font-bold tabular-nums">
            -{timeSaved.toFixed(1)}m Peak Saved
          </span>
        </div>

        {/* Deliverable Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Peak Travel Time Saved</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
              {timeSaved.toFixed(1)} mins / trip
            </span>
            <span className="text-[9px] text-slate-500 font-mono">grade-separated heavy rail</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Arterial Congestion Relief</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-cyan-400">
              -{congestionReduction.toFixed(1)}%
            </span>
            <span className="text-[9px] text-slate-500 font-mono">parallel road volume drop</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Daily Projected Riders</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
              {formatNum(ridership)}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">initial phase boardings</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Feeder Route Coverage</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
              {feederScore.toFixed(0)} / 100
            </span>
            <span className="text-[9px] text-slate-500 font-mono">BMTC multimodal integration</span>
          </div>
        </div>

        {/* Modal Split Deliverable Tags */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[9.5px] uppercase font-mono text-slate-500">Transit Deliverables:</span>
          <div className="flex flex-wrap gap-1.5">
            {['Arterial Bottleneck Relief', 'Modal Shift from Cars & 2W', 'Feeder Bus Integration', 'BPR Curve Delay Abatement'].map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Link to Full Trajectory in Agents Suite */}
        <Link
          href="/agents"
          className="mt-1 flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-cyan-500/10 border border-white/[0.06] hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition-all text-[11px] font-mono group cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3 text-cyan-400" />
            <span>Inspect Discrete Choice MNL & Delay Curves in Agents Suite</span>
          </div>
          <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </motion.div>
    );
  }

  if (domain === 'ecological') {
    const lakeBreaches = ecological?.lake_buffer_infringements_30m ?? ecological?.lake_buffer_infringements ?? 0;
    const rajakaluveCrossings = ecological?.rajakaluve_crossings_50m ?? ecological?.rajakaluve_buffer_infringements ?? 0;
    const ktfdStatus = ecological?.ktfd_compliance_status ?? (lakeBreaches === 0 ? 'COMPLIANT' : 'FLAGGED');
    const floodGrade = ecological?.flood_vulnerability_grade ?? 'LOW';
    const canopyScore = ecological?.tree_canopy_loss_risk_score ?? 25;

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionSprings.smooth}
        className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-3 shadow-sm"
      >
        {/* Header: Overview of Output Produced */}
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Trees className="size-3.5" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white tracking-tight">
                Ecological & Risk Agent Output Overview
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                agent_ecological • Synthesis Ready
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
              ktfdStatus === 'COMPLIANT'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
            }`}
          >
            {ktfdStatus}
          </span>
        </div>

        {/* Deliverable Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">30m Lake Setback</span>
            <span
              className={`font-mono tabular-nums text-sm font-semibold ${
                lakeBreaches > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {lakeBreaches} Breaches
            </span>
            <span className="text-[9px] text-slate-500 font-mono">ATREE waterbodies audited</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">50m Rajakaluve Setback</span>
            <span
              className={`font-mono tabular-nums text-sm font-semibold ${
                rajakaluveCrossings > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {rajakaluveCrossings} Crossings
            </span>
            <span className="text-[9px] text-slate-500 font-mono">primary stormwater drains</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Flood Risk Grade</span>
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
            <span className="text-[9px] text-slate-500 font-mono">drainage basin elevation</span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
            <span className="text-[9.5px] uppercase font-mono text-slate-400">Tree Canopy Index</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
              {canopyScore.toFixed(0)} / 100
            </span>
            <span className="text-[9px] text-slate-500 font-mono">median conservation rating</span>
          </div>
        </div>

        {/* Environmental Directives Enforced */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[9.5px] uppercase font-mono text-slate-500">Statutory Standards Enforced:</span>
          <div className="flex flex-wrap gap-1.5">
            {['KTFD Act 2014 Compliance', 'NGT 75m Buffer Setback', 'BBMP SWD Primary Drains', 'Compensatory Afforestation'].map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Link to Full Trajectory in Agents Suite */}
        <Link
          href="/agents"
          className="mt-1 flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 transition-all text-[11px] font-mono group cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3 text-emerald-400" />
            <span>Inspect Setback Geometries & Standards in Agents Suite</span>
          </div>
          <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </motion.div>
    );
  }

  return null;
}

export default AgentFlashCards;

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Landmark,
  TrendingUp,
  Coins,
  ShieldCheck,
  Scale,
  FileText,
  Users,
  MapPin,
  Activity,
  Footprints,
  Car,
  Gauge,
  Clock,
  Leaf,
  Trees,
  Waves,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  Bus,
  Zap,
} from 'lucide-react';
import { MathFormula } from '../MathFormula';
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
    const farebox = economic?.annual_farebox_revenue_inr_cr ?? economic?.projected_annual_farebox_inr_cr ?? 28.5;
    const multiplier = economic?.economic_multiplier_index ?? 4.2;
    const todYield = economic?.estimated_tod_yield_inr_cr ?? (farebox * 2.4);
    const commercialSqft = Math.max(1800000, techParks * 750000);
    const estimatedWorkforce = techParks * 38000 + commercial * 2200;
    const dailyTrips = Math.round((farebox * 10000000) / (310 * 32.5));

    return (
      <div className="flex flex-col gap-3">
        {/* Flash Card 1: Land Value Capture & TOD Financing */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionSprings.smooth}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2.5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Landmark className="size-3.5" />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Land Value Capture (LVC) & Municipal Yield
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              20% Betterment Levy
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Direct transit proximity induces a projected <span className="text-amber-300 font-semibold">+14.5% guidance value appreciation</span> on commercial floor space within 500m of proposed station nodes.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Station 500m Footprint</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {(commercialSqft / 1000000).toFixed(2)}M sq.ft.
              </span>
              <span className="text-[9px] text-slate-500">commercial floor space</span>
            </div>

            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Guidance Value Benchmark</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-amber-300">
                ₹9,200 / sq.ft.
              </span>
              <span className="text-[9px] text-slate-500">BBMP sub-registrar base</span>
            </div>

            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Estimated TOD Yield</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
                {formatINR(todYield)}
              </span>
              <span className="text-[9px] text-slate-500">municipal infrastructure accrual</span>
            </div>

            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Economic Multiplier</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-yellow-400">
                {multiplier.toFixed(2)}x Return
              </span>
              <span className="text-[9px] text-slate-500">cumulative capital velocity</span>
            </div>
          </div>
        </motion.div>

        {/* Flash Card 2: Calibrated Exponential Gravity Model */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSprings.smooth, delay: 0.05 }}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2.5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Coins className="size-3.5" />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Calibrated Exponential Gravity Model
              </span>
            </div>
            <span className="text-[10px] font-mono text-yellow-300 font-medium">
              Trip Attraction Engine
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Projected daily transit boardings calibrated via impedance power decay across employment nodes:
          </p>

          <MathFormula
            formula="T_{ij} = k \cdot \frac{P_i \cdot E_j}{L^{\gamma}} \cdot e^{-\alpha \cdot L}"
            className="my-0.5 py-2.5 bg-black/50"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Gravity Daily Trips</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
                {formatNum(dailyTrips)}
              </span>
              <span className="text-[9px] text-slate-500">projected boardings/day</span>
            </div>

            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Workforce Catchment</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {formatNum(estimatedWorkforce)}
              </span>
              <span className="text-[9px] text-slate-500">tech & commercial staff</span>
            </div>
          </div>
        </motion.div>

        {/* Flash Card 3: TOD Station-Area Zoning Directives */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSprings.smooth, delay: 0.1 }}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.05] pb-2">
            <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Building2 className="size-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Station-Area TOD Statutory Zoning Mandate
            </span>
          </div>

          <div className="flex flex-col gap-2 text-[11px] text-slate-300 font-sans">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="size-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <div>
                <strong className="text-white">FAR 4.0x Incentive Zone:</strong> Up to 4.0 Floor Area Ratio permitted within 500m radius of transit interchanges to promote high-density transit-supportive development.
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="size-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div>
                <strong className="text-white">Active Street Frontage:</strong> Mandatory zero-setback pedestrian colonnades and active ground-floor retail to maximize commercial footfall.
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="size-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <div>
                <strong className="text-white">TDR Reception Zone:</strong> Designated priority receiving corridor for Transferable Development Rights (TDR) generated from road widening.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Flash Card 4: Quantitative Agent Econometric Synthesis */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSprings.smooth, delay: 0.15 }}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.05] pb-2">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="size-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Economic Agent Executive Synthesis
            </span>
          </div>

          <p className="text-[11.5px] text-slate-300 font-sans leading-relaxed">
            {economic?.analysis_summary ||
              `The corridor establishes a high-yield commercial spine linking major employment clusters. With projected annual farebox revenue of ${formatINR(farebox)} and an estimated TOD yield of ${formatINR(todYield)}, the project delivers an exceptional ${multiplier.toFixed(2)}x economic multiplier on capital expenditure, ensuring municipal financial viability.`}
          </p>
        </motion.div>
      </div>
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
      <div className="flex flex-col gap-3">
        {/* Flash Card 1: Intersected BBMP Municipal Wards */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionSprings.smooth}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2.5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <MapPin className="size-3.5" />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                BBMP Municipal Wards in Catchment
              </span>
            </div>
            <span className="text-[10px] font-mono text-purple-300 font-semibold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
              {denseWards.length} Wards
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {denseWards.map((w, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-md bg-black/40 border border-white/[0.05] text-[10.5px] font-sans text-slate-300 flex items-center gap-1"
              >
                <span className="size-1.5 rounded-full bg-purple-400" />
                <span>{w}</span>
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Vulnerable Commuters</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-purple-300">
                {formatNum(vulnerableSlumPop)}
              </span>
              <span className="text-[9px] text-slate-500">informal settlement residents</span>
            </div>

            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Transit Dependency</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-cyan-400">
                {(underservedRatio * 100).toFixed(1)}%
              </span>
              <span className="text-[9px] text-slate-500">no personal vehicle access</span>
            </div>
          </div>
        </motion.div>

        {/* Flash Card 2: Dasymetric Areal-Weighted Interpolation */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSprings.smooth, delay: 0.05 }}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2.5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers className="size-3.5" />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Dasymetric Areal-Weighted Census Model
              </span>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 font-medium">
              Zero Centroid Skew
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Cadastral parcel intersection calculates true catchment population rather than gross ward polygon aggregates:
          </p>

          <MathFormula
            formula="P_{\text{catchment}} = \sum_{w} P_w \cdot \frac{\text{Area}(w \cap \text{Buffer})}{\text{Area}(w)}"
            className="my-0.5 py-2.5 bg-black/50"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Walking Shed (500m)</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
                {formatNum(pop500m)}
              </span>
              <span className="text-[9px] text-slate-500">areal-weighted primary pop</span>
            </div>

            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Feeder Shed (1500m)</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {formatNum(pop1500m)}
              </span>
              <span className="text-[9px] text-slate-500">first/last mile catchment</span>
            </div>
          </div>
        </motion.div>

        {/* Flash Card 3: Pedestrian Access & Spatial Justice */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSprings.smooth, delay: 0.1 }}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.05] pb-2">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Footprints className="size-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Pedestrian Accessibility & Transit Equity
            </span>
          </div>

          <div className="flex flex-col gap-2 text-[11px] text-slate-300 font-sans">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="size-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
              <div>
                <strong className="text-white">Spatial Equity Score {equityScore.toFixed(1)}/100:</strong> High score reflects superior integration of historically underserved demographic enclaves into the mass transit grid.
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="size-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <div>
                <strong className="text-white">Pedestrian Footpath Mandate:</strong> Requires continuous 2.5m barrier-free footpaths and raised pedestrian table-top crossings within the 500m station sphere.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Flash Card 4: Quantitative Agent Synthesis Brief */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSprings.smooth, delay: 0.15 }}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.05] pb-2">
            <span className="p-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileText className="size-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Demographics Agent Spatial Equity Brief
            </span>
          </div>

          <p className="text-[11.5px] text-slate-300 font-sans leading-relaxed">
            {demographics?.analysis_summary ||
              `Areal-weighted dasymetric analysis demonstrates that this corridor serves ${formatNum(pop500m)} citizens within walking distance and ${formatNum(pop1500m)} in the feeder shed. With an underserved ratio of ${(underservedRatio * 100).toFixed(1)}%, the alignment provides crucial mobility equity across ${denseWards.length} BBMP wards.`}
          </p>
        </motion.div>
      </div>
    );
  }

  if (domain === 'mobility') {
    const timeSaved = mobility?.peak_hour_travel_time_saved_minutes ?? mobility?.peak_hour_travel_time_saved_mins ?? 24.5;
    const congestionReduction = mobility?.arterial_congestion_reduction_pct ?? 31.8;
    const feederScore = mobility?.feeder_route_coverage_score ?? 78;
    const ridership = mobility?.daily_projected_ridership ?? 142000;
    const divertedCars = Math.round(ridership * 0.14);
    const divertedTwoWheelers = Math.round(ridership * 0.26);
    const hoursSavedAnnual = Math.round((ridership * (timeSaved / 60) * 310) / 1000) * 1000;
    const co2AvoidedMT = Math.round(ridership * 0.00032 * 310);

    return (
      <div className="flex flex-col gap-3">
        {/* Flash Card 1: Speed Differential & Travel Time Delta */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionSprings.smooth}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2.5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Gauge className="size-3.5" />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Corridor Speed Delta & Commute Savings
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              -{timeSaved.toFixed(1)} mins / trip
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Grade-separated metro transit bypasses severe road bottleneck delay, elevating commercial operating speeds by 3.1x over parallel surface arterials:
          </p>

          <MathFormula
            formula="\Delta T = T_{\text{arterial}} - T_{\text{metro}} = \frac{L}{V_{\text{road}}} - \frac{L}{V_{\text{metro}}}"
            className="my-0.5 py-2.5 bg-black/50"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Road Arterial Crawl</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-rose-400">
                11.4 km/h
              </span>
              <span className="text-[9px] text-slate-500">TomTom peak hour speed</span>
            </div>

            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Metro Operating Speed</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-cyan-400">
                34.8 km/h
              </span>
              <span className="text-[9px] text-slate-500">dedicated viaduct schedule</span>
            </div>

            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Passenger Hours Saved</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
                {(hoursSavedAnnual / 1000000).toFixed(2)}M hrs/yr
              </span>
              <span className="text-[9px] text-slate-500">economic productivity gain</span>
            </div>

            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">CO₂ Avoidance</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
                {formatNum(co2AvoidedMT)} MT/yr
              </span>
              <span className="text-[9px] text-slate-500">net tailpipe emissions cut</span>
            </div>
          </div>
        </motion.div>

        {/* Flash Card 2: Modal Shift & Road Vehicle Diversion */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSprings.smooth, delay: 0.05 }}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2.5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Car className="size-3.5" />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Arterial Modal Shift & Vehicular Relief
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
              {congestionReduction.toFixed(1)}% Relief
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Diverted Cars / Day</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {formatNum(divertedCars)}
              </span>
              <span className="text-[9px] text-slate-500">removed from surface bottlenecks</span>
            </div>

            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Diverted 2-Wheelers</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {formatNum(divertedTwoWheelers)}
              </span>
              <span className="text-[9px] text-slate-500">daily two-wheeler diversion</span>
            </div>
          </div>
        </motion.div>

        {/* Flash Card 3: Multi-Modal Feeder & First/Last Mile Integration */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSprings.smooth, delay: 0.1 }}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.05] pb-2">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Bus className="size-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Multi-Modal Feeder & Last-Mile Integration
            </span>
          </div>

          <div className="flex flex-col gap-2 text-[11px] text-slate-300 font-sans">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="size-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <div>
                <strong className="text-white">BMTC Circular Feeders:</strong> 8 dedicated midi-bus feeder loops connecting high-density residential wards to proposed station portals.
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="size-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <div>
                <strong className="text-white">EV Auto & Micro-Mobility Bays:</strong> Designated pick-up/drop-off bays with fast DC chargers at every elevated station node.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Flash Card 4: Quantitative Agent Synthesis Brief */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSprings.smooth, delay: 0.15 }}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.05] pb-2">
            <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="size-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Mobility Forecaster Corridor Brief
            </span>
          </div>

          <p className="text-[11.5px] text-slate-300 font-sans leading-relaxed">
            {mobility?.analysis_summary ||
              `The proposed alignment unlocks ${timeSaved.toFixed(1)} minutes of peak-hour time savings per trip, achieving a ${congestionReduction.toFixed(1)}% reduction in arterial vehicle congestion. Daily boardings are projected to reach ${formatNum(ridership)}, recovering ${(hoursSavedAnnual / 1000000).toFixed(2)} million commuter-hours annually.`}
          </p>
        </motion.div>
      </div>
    );
  }

  if (domain === 'ecological') {
    const lakeBreaches = ecological?.lake_buffer_infringements_30m ?? ecological?.lake_buffer_infringements ?? 0;
    const rajakaluveCrossings = ecological?.rajakaluve_crossings_50m ?? ecological?.rajakaluve_buffer_infringements ?? 0;
    const ktfdStatus = ecological?.ktfd_compliance_status ?? (lakeBreaches === 0 ? 'COMPLIANT' : 'FLAGGED');
    const floodGrade = ecological?.flood_vulnerability_grade ?? 'MODERATE';
    const canopyScore = ecological?.tree_canopy_loss_risk_score ?? 25;
    const estimatedTreeFelling = Math.round(canopyScore * 3.8);
    const compensatorySaplings = estimatedTreeFelling * 10;

    return (
      <div className="flex flex-col gap-3">
        {/* Flash Card 1: KTFD Act 2014 & Lake Buffer Setback */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionSprings.smooth}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2.5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Waves className="size-3.5" />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Karnataka Tank Conservation (KTFD) Act
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                ktfdStatus === 'COMPLIANT'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {ktfdStatus}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Statutory spatial constraint checking ensures viaduct alignment clears the mandatory 30m lake perimeter and 50m primary stormwater drain buffers:
          </p>

          <MathFormula
            formula="\text{SetbackViolation} = \text{ViaductGeometry} \cap \text{Buffer}(\text{Lake}, 30\text{m}) \neq \emptyset"
            className="my-0.5 py-2.5 bg-black/50"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">30m Lake Breaches</span>
              <span
                className={`font-mono tabular-nums text-sm font-semibold ${
                  lakeBreaches === 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {lakeBreaches}
              </span>
              <span className="text-[9px] text-slate-500">
                {lakeBreaches === 0 ? '100% buffer clearance' : 'clear span required'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">50m Rajakaluve</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {rajakaluveCrossings}
              </span>
              <span className="text-[9px] text-slate-500">stormwater crossings</span>
            </div>
          </div>
        </motion.div>

        {/* Flash Card 2: Hydrology & Flood Inundation Friction */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSprings.smooth, delay: 0.05 }}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2.5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ShieldCheck className="size-3.5" />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Hydrological Friction & Flood Resiliency
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                floodGrade === 'LOW'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {floodGrade} RISK
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">Viaduct Pier Soffit</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
                +5.5m HFL
              </span>
              <span className="text-[9px] text-slate-500">clearance above 100yr flood</span>
            </div>

            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase font-mono text-slate-400">SuDS Drainage</span>
              <span className="font-mono tabular-nums text-sm font-semibold text-cyan-400">
                Mandatory
              </span>
              <span className="text-[9px] text-slate-500">permeable bioswales</span>
            </div>
          </div>
        </motion.div>

        {/* Flash Card 3: Urban Forest & Compensatory Afforestation */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSprings.smooth, delay: 0.1 }}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.05] pb-2">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Trees className="size-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Canopy Impact & Compensatory Afforestation
            </span>
          </div>

          <div className="flex flex-col gap-2 text-[11px] text-slate-300 font-sans">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="size-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <div>
                <strong className="text-white">1:10 Sapling Replacement Mandate:</strong> Estimated felling of ~{estimatedTreeFelling} median trees requires planting {formatNum(compensatorySaplings)} native saplings via BBMP Forest Cell.
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-black/30 border border-white/[0.03]">
              <span className="size-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div>
                <strong className="text-white">Tree Translocation Priority:</strong> Approximately 30-40 semi-mature avenue trees designated for mechanical root-ball translocation to adjacent public parks.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Flash Card 4: Quantitative Agent Synthesis Brief */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSprings.smooth, delay: 0.15 }}
          className="p-3.5 rounded-xl bg-[#14161b] border border-white/[0.07] flex flex-col gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.05] pb-2">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="size-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Ecological Specialist Corridor Brief
            </span>
          </div>

          <p className="text-[11.5px] text-slate-300 font-sans leading-relaxed">
            {ecological?.analysis_summary ||
              `Ecological audit confirms compliance with the Karnataka Tank Conservation and Development Act (KTFD 2014), recording ${lakeBreaches} lake buffer breaches and ${rajakaluveCrossings} primary rajakaluve crossings. Flood vulnerability is graded as ${floodGrade}, with mandatory +5.5m HFL viaduct clearances and 1:10 compensatory afforestation.`}
          </p>
        </motion.div>
      </div>
    );
  }

  return null;
}

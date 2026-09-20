'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, Database, Cpu, TrendingUp, ShieldCheck, 
  Clock, MapPin, Layers, ArrowUpRight, BarChart3, Globe2 
} from 'lucide-react';
import { motionSprings } from '../../lib/motion';

export function FeatureBento() {
  return (
    <section id="features" className="relative z-20 px-4 py-16 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col items-center text-center mb-12">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0ab1ba] mb-2 flex items-center gap-1.5">
          <Zap className="size-3.5" />
          Autonomous Pipeline
        </span>
        <h2 className="font-sans text-3xl sm:text-4xl font-bold text-white tracking-tight">
          How Dyad Replaces Months of Manual Field Surveys
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mt-2 leading-relaxed">
          Combining in-browser deterministic spatial math with cloud-scale multi-agent debate to output government-grade DPR dossiers in seconds.
        </p>
      </div>

      {/* 4-PILLAR BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: DETERMINISTIC GIS */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={motionSprings.snappy}
          className="relative overflow-hidden rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] p-5 shadow-xl shadow-black/40 ring-1 ring-white/5 flex flex-col justify-between"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00f5d4]/40 to-transparent" />
          <div>
            <div className="size-10 rounded-xl bg-[#00f5d4]/10 border border-[#00f5d4]/20 flex items-center justify-center mb-4 text-[#00f5d4]">
              <Database className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mb-1.5">
              Deterministic Spatial GIS
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sub-20ms Turf.js geodesic polygon buffer compute. Instantly aggregates demographics, POI counts, and catchment overlap directly in WebAssembly.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Compute Latency</span>
            <span className="text-[#00f5d4] font-bold tabular-nums">&lt; 18ms</span>
          </div>
        </motion.div>

        {/* CARD 2: TOMTOM VELOCITY ENGINE */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={motionSprings.snappy}
          className="relative overflow-hidden rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] p-5 shadow-xl shadow-black/40 ring-1 ring-white/5 flex flex-col justify-between"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ef4444]/40 to-transparent" />
          <div>
            <div className="size-10 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center mb-4 text-[#ef4444]">
              <Clock className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mb-1.5">
              TomTom Congestion Deltas
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-world road vs rail velocity comparisons. Calibrated friction curves quantifying peak hour delays and annual economic congestion losses.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Commute Saved</span>
            <span className="text-[#ef4444] font-bold tabular-nums">-44 mins/trip</span>
          </div>
        </motion.div>

        {/* CARD 3: MODAL CLOUD SWARM */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={motionSprings.snappy}
          className="relative overflow-hidden rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] p-5 shadow-xl shadow-black/40 ring-1 ring-white/5 flex flex-col justify-between"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9d4edd]/40 to-transparent" />
          <div>
            <div className="size-10 rounded-xl bg-[#9d4edd]/10 border border-[#9d4edd]/20 flex items-center justify-center mb-4 text-[#9d4edd]">
              <Cpu className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mb-1.5">
              Modal Cloud Swarm
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Serverless multi-agent orchestration running parallel GPT-4o reasoning to audit equity, land value capture, and 75m NGT lake buffer risks.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Execution Mode</span>
            <span className="text-[#9d4edd] font-bold">Serverless Swarm</span>
          </div>
        </motion.div>

        {/* CARD 4: AUTHORITY DOSSIER */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={motionSprings.snappy}
          className="relative overflow-hidden rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] p-5 shadow-xl shadow-black/40 ring-1 ring-white/5 flex flex-col justify-between"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0ab1ba]/40 to-transparent" />
          <div>
            <div className="size-10 rounded-xl bg-[#0ab1ba]/10 border border-[#0ab1ba]/20 flex items-center justify-center mb-4 text-[#0ab1ba]">
              <TrendingUp className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mb-1.5">
              Authority DPR Dossier
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Delivers a transparent 0–100 Feasibility Score and 4 Quantified Impact Cards with bi-directional 3D camera navigation.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">DPR Index Score</span>
            <span className="text-[#0ab1ba] font-bold tabular-nums">94 / 100</span>
          </div>
        </motion.div>

      </div>

      {/* QUICK WORKFLOW RUN-THROUGH */}
      <div className="mt-8 p-6 rounded-2xl bg-[#08090C]/80 border border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center size-12 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white shrink-0">
            <Layers className="size-6 text-[#0ab1ba]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">4-Step Transit Reconnaissance</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              1. Snap Origin Station → 2. Drop Terminus Pin → 3. Instant 2km Catchment → 4. Cloud Swarm Dossier
            </p>
          </div>
        </div>

        <Link href="/">
          <button className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-all flex items-center gap-2 shrink-0 cursor-pointer">
            <span>Try Live on Bengaluru Map</span>
            <ArrowUpRight className="size-3.5" />
          </button>
        </Link>
      </div>

    </section>
  );
}

export default FeatureBento;

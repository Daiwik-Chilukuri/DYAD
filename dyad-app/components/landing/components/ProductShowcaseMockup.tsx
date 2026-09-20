'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Zap, Database, ArrowRight, ArrowUpRight, 
  MapPin, CheckCircle2, Sliders, ShieldCheck, 
  Sparkles, ExternalLink, Terminal, AlertTriangle,
  TrendingUp, Clock, ChevronRight
} from 'lucide-react';
import { motionSprings } from '../../../lib/motion';

type ShowcaseTab = 'war-room' | 'catchment' | 'swarm-dossier' | 'commute-delta';

export function ProductShowcaseMockup() {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('war-room');

  return (
    <section id="showcase" className="relative z-20 px-4 py-20 max-w-6xl mx-auto select-none">
      
      {/* SECTION HEADER WITH ICONIC TURQUOISE ACCENT DOT */}
      <div className="flex flex-col items-center text-center mb-10 select-none">
        <div className="flex items-baseline gap-2 mb-2">
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-white tracking-tight">
            The authority interface
          </h2>
          <span className="size-2 sm:size-2.5 rounded-xs bg-[#0ab1ba] inline-block shadow-[0_0_12px_#0ab1ba]" />
        </div>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mt-1 leading-relaxed">
          Inspired by mission-critical aerospace consoles and high-frequency dispatch tools. Built with zero AI slop and deterministic geometry.
        </p>
      </div>

      {/* FLOATING BROWSER/APP WINDOW CONTAINER - SUBTLE BLACK SHADOW EXPERIENCE */}
      <div className="relative overflow-hidden rounded-2xl bg-[#060608] border border-white/[0.06] shadow-[0_40px_100px_rgba(0,0,0,1),0_10px_30px_rgba(0,0,0,0.9)] select-none">
        
        {/* TOP WINDOW TITLE BAR & TABS */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#030304] border-b border-white/[0.05] select-none">
          
          {/* WINDOW DOT CONTROLS */}
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-zinc-700" />
            <span className="size-2.5 rounded-full bg-zinc-800" />
            <span className="size-2.5 rounded-full bg-zinc-800" />
            
            <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-white/[0.06] text-xs text-zinc-500 font-mono">
              <span className="text-zinc-400">dyad://war-room</span>
              <span>•</span>
              <span>Silk Board → Bellandur (Phase-2A)</span>
            </div>
          </div>

          {/* INTERACTIVE WORKSPACE TABS - DARK SHADOW */}
          <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-xl border border-white/[0.05]">
            {[
              { id: 'war-room', label: 'Map War Room', icon: MapPin },
              { id: 'catchment', label: '2km Catchment', icon: Database },
              { id: 'swarm-dossier', label: 'Swarm Dossier', icon: TrendingUp },
              { id: 'commute-delta', label: 'Velocity Delta', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ShowcaseTab)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="showcase-tab-pill"
                      className="absolute inset-0 bg-white/10 rounded-lg border border-white/20 shadow-sm"
                      transition={motionSprings.snappy}
                    />
                  )}
                  <Icon className={`size-3.5 relative z-10 ${isActive ? 'text-white' : ''}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* LAUNCH FULLSCREEN CTA */}
          <Link href="/">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer">
              <span>Open Live</span>
              <ArrowUpRight className="size-3 text-zinc-400" />
            </button>
          </Link>
        </div>

        {/* WINDOW INNER CANVAS */}
        <div className="relative p-6 min-h-[460px] flex flex-col justify-between bg-gradient-to-b from-[#060608] to-[#020203]">
          
          <AnimatePresence mode="wait">
            {activeTab === 'war-room' && (
              <motion.div
                key="war-room"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={motionSprings.smooth}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
              >
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-zinc-300 border border-white/10">
                      LIVE CANVASES
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      Silk Board Hub [77.6245, 12.9176]
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Instant Vector Station Snapping &amp; Target Viaduct Alignment
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Urban planners click any coordinate across Bengaluru. Dyad instantly calculates straight-line and road-network alignment, snapping to verified Namma Metro stations with sub-pixel WebGL accuracy.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="px-3.5 py-2 rounded-xl bg-[#09090b] border border-white/[0.06] text-xs">
                      <span className="text-zinc-500 block text-[10px] font-mono uppercase">Origin Station</span>
                      <span className="font-semibold text-white">Silk Board Interchange</span>
                    </div>
                    <div className="px-3.5 py-2 rounded-xl bg-[#09090b] border border-white/[0.06] text-xs">
                      <span className="text-zinc-500 block text-[10px] font-mono uppercase">Terminus Drop</span>
                      <span className="font-semibold text-white">Bellandur Ecospace (Phase-2A)</span>
                    </div>
                    <div className="px-3.5 py-2 rounded-xl bg-[#09090b] border border-white/[0.06] text-xs">
                      <span className="text-zinc-500 block text-[10px] font-mono uppercase">Alignment Length</span>
                      <span className="font-mono font-semibold text-white">8.2 km viaduct</span>
                    </div>
                  </div>
                </div>

                {/* VISUAL MINI HUD CARD */}
                <div className="p-4 rounded-xl bg-[#09090b] border border-white/[0.06] space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-2">
                    <span className="text-zinc-500 font-mono">Telemetry Status</span>
                    <span className="text-zinc-300 font-mono font-semibold">Active Snapped</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Peak Pressure:</span>
                      <span className="font-mono font-bold text-white">18,450 PPHPD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Corridor Relieved:</span>
                      <span className="font-mono text-zinc-300">Outer Ring Road (ORR)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tech Parks Served:</span>
                      <span className="font-mono text-white font-bold">84 Corporate SEZs</span>
                    </div>
                  </div>
                  <Link href="/">
                    <button className="w-full mt-2 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-white/5">
                      <span>Simulate on Map</span>
                      <ArrowUpRight className="size-3" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}

            {activeTab === 'catchment' && (
              <motion.div
                key="catchment"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={motionSprings.smooth}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
              >
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-zinc-300 border border-white/10">
                      TURF.JS DETERMINISM
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      Catchment Radius: 2.0 km
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Sub-20ms Geodesic Catchment Buffer & POI Aggregation
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Unlike heavy server-side GIS pipelines, Dyad calculates geometric polygon buffers and spatial intersections natively in client memory using WebAssembly and Turf.js.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="p-3 rounded-xl bg-[#09090b] border border-white/[0.06]">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">Total POIs</span>
                      <span className="font-mono text-xl font-bold text-white">412</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#09090b] border border-white/[0.06]">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">Tech Parks</span>
                      <span className="font-mono text-xl font-bold text-white">84</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#09090b] border border-white/[0.06]">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">Hospitals</span>
                      <span className="font-mono text-xl font-bold text-white">32</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#09090b] border border-white/[0.06]">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">Colleges</span>
                      <span className="font-mono text-xl font-bold text-white">48</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#09090b] border border-white/[0.06] space-y-3">
                  <span className="text-xs font-mono text-zinc-500 block">BBMP Ward Demographics</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Ward Population:</span>
                      <span className="font-mono font-bold text-white">684,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Employment Density:</span>
                      <span className="font-mono text-white">14,200 jobs/km²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Lake Buffer Compliance:</span>
                      <span className="font-mono text-white">100% NGT Safe</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'swarm-dossier' && (
              <motion.div
                key="swarm-dossier"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={motionSprings.smooth}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
              >
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-zinc-300 border border-white/10">
                      MODAL CLOUD ORCHESTRATOR
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      Parallel Multi-Agent Reasoning (GPT-4o)
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Serverless Swarm Evaluating Equity, CapEx & Environmental Risks
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Modal AI containers execute in parallel to compile an official pre-feasibility dossier. Specialized agents debate land acquisition bottlenecks, environmental lake buffers, and transit equity.
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl font-extrabold text-white tabular-nums">94/100</span>
                      <span className="text-xs text-zinc-500 uppercase font-mono">Feasibility Index</span>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl font-extrabold text-white tabular-nums">₹4,250 Cr</span>
                      <span className="text-xs text-zinc-500 uppercase font-mono">Est. CapEx</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#09090b] border border-white/[0.06] space-y-2 text-xs">
                  <span className="font-mono text-[11px] text-zinc-400 font-semibold block">Swarm Agent Telemetry:</span>
                  <div className="p-2 rounded-lg bg-[#030304] font-mono text-[10px] text-zinc-400 space-y-1">
                    <p className="text-white">✓ DemographicAgent: 342k riders verified</p>
                    <p className="text-white">✓ MobilityAgent: 44m commute delta confirmed</p>
                    <p className="text-white">✓ EcologyAgent: Bellandur lake 75m buffer clear</p>
                    <p className="text-white">✓ FinancialAgent: EIRR 16.8% calculated</p>
                  </div>
                  <Link href="/agents">
                    <button className="w-full mt-2 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer">
                      Inspect Swarm Logs
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}

            {activeTab === 'commute-delta' && (
              <motion.div
                key="commute-delta"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={motionSprings.smooth}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
              >
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-zinc-300 border border-white/10">
                      TOMTOM VELOCITY ENGINE
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      Road Congestion vs Rail Velocity
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Comparing Road Gridlock Against Automated Rail Right-of-Way
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    By ingesting real-world TomTom speed profiles, Dyad proves the exact economic ROI of shifting commuters away from private cars and cabs onto high-capacity grade-separated viaducts.
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-[#09090b] border border-white/[0.06] text-center">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">Peak Road</span>
                      <span className="font-mono text-xl font-bold text-white">58 mins</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#09090b] border border-white/[0.06] text-center">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">Via Metro</span>
                      <span className="font-mono text-xl font-bold text-white">14 mins</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#09090b] border border-white/[0.06] text-center">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">Time Saved</span>
                      <span className="font-mono text-xl font-bold text-white">-44 mins</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#09090b] border border-white/[0.06] space-y-3">
                  <span className="text-xs font-mono text-zinc-500 block">Modal Shift Projection</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Modal Shift away from cars:</span>
                      <span className="font-mono font-bold text-white">52.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Annual Fuel Saved:</span>
                      <span className="font-mono text-white">4.8M Liters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">CO2 Abatement:</span>
                      <span className="font-mono text-white">11,200 Tons/yr</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BOTTOM INTERACTION BAR */}
          <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
            <span className="font-mono text-[11px]">
              Platform: Dyad • React 19 + Tailwind v4 + MapLibre GL 3D
            </span>
            <Link href="/" className="text-zinc-300 hover:text-white flex items-center gap-1 font-medium transition-colors">
              <span>Open live interactive dashboard</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </section>
  );
}

export default ProductShowcaseMockup;

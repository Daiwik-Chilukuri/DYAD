'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function MissionOverviewSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 select-none">
      
      {/* =========================================================================
          HEROIC SCALE PURPOSE HEADER
          - Massive scale, metallic vertical gradient
          - "Automate the grunt work." with Dyad's iconic signature turquoise square period
          ========================================================================= */}
      <div className="mb-16 sm:mb-20">
        
        {/* MONUMENTAL TYPOGRAPHY */}
        <h2 className="font-sans font-black tracking-tight leading-[0.95] text-white">
          <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white">
            Automate
          </span>
          <span className="flex items-baseline gap-2 sm:gap-4 md:gap-6 text-5xl sm:text-7xl md:text-8xl lg:text-9xl">
            <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              the grunt work
            </span>
            <span className="inline-block size-3.5 sm:size-5 md:size-7 lg:size-8 bg-[#0ab1ba] rounded-xs shadow-[0_0_20px_#0ab1ba] shrink-0" />
          </span>
        </h2>

        {/* CLEAN, SIMPLE PURPOSE STATEMENT */}
        <div className="mt-8 sm:mt-10 max-w-3xl">
          <p className="text-zinc-400 text-base sm:text-lg md:text-xl font-normal leading-relaxed">
            Early corridor screening often means reconciling{' '}
            <strong className="text-white font-semibold">fragmented maps, historical census tables, schedules, and environmental layers</strong>{' '}
            before planners can compare alternatives.
          </p>
          <p className="mt-4 text-zinc-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed">
            Dyad turns those inputs into a{' '}
            <span className="text-white font-semibold">repeatable, explainable pre-feasibility workflow</span>{' '}
            using deterministic spatial geometry and specialist agents.
          </p>
        </div>

      </div>

      {/* =========================================================================
          3 CORE PILLARS - DARK SHADOW EXPERIENCE
          - Deep matte black cards (#08080a) with hairline borders
          - Deep ambient shadow elevation
          - Crisp metallic silver/zinc typography
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PILLAR 1: SPEED & PRECISION */}
        <Link href="/" className="group block">
          <div className="h-full rounded-2xl bg-[#08080a] hover:bg-[#0c0c0e] border border-white/[0.05] hover:border-white/20 p-7 sm:p-8 transition-all duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.98)] hover:shadow-[0_35px_80px_rgba(0,0,0,1)] hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-zinc-500" />
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    01 / Speed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-500">Reproducible</span>
                  <ArrowUpRight className="size-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3 group-hover:text-white transition-colors">
                Screen Corridors Earlier
              </h3>
              
              <p className="text-sm text-zinc-400 leading-relaxed">
                Planners define a candidate alignment on the map. Deterministic geometry builds catchments, measures nearby features, and prepares traceable inputs for specialist review.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.05] flex items-center justify-end text-xs font-mono text-zinc-500">
              <span className="text-zinc-400">Deterministic</span>
            </div>
          </div>
        </Link>

        {/* PILLAR 2: AUTOMATE GRUNT WORK */}
        <Link href="/" className="group block">
          <div className="h-full rounded-2xl bg-[#08080a] hover:bg-[#0c0c0e] border border-white/[0.05] hover:border-white/20 p-7 sm:p-8 transition-all duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.98)] hover:shadow-[0_35px_80px_rgba(0,0,0,1)] hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-zinc-500" />
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    02 / Synthesis
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-500">Open Data Inputs</span>
                  <ArrowUpRight className="size-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3 group-hover:text-white transition-colors">
                Unify Spatial Evidence
              </h3>
              
              <p className="text-sm text-zinc-400 leading-relaxed">
                Dyad combines historical ward census data, metro geometry, mapped road widths, waterbodies, and planning-relevant POIs in one inspectable canvas.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span className="text-zinc-400 font-medium">8,213 POIs • 198 wards</span>
              <span className="text-zinc-400">Source-Tracked</span>
            </div>
          </div>
        </Link>

        {/* PILLAR 3: DE-RISK DECISIONS */}
        <Link href="/" className="group block">
          <div className="h-full rounded-2xl bg-[#08080a] hover:bg-[#0c0c0e] border border-white/[0.05] hover:border-white/20 p-7 sm:p-8 transition-all duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.98)] hover:shadow-[0_35px_80px_rgba(0,0,0,1)] hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-zinc-500" />
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    03 / De-Risking
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-500">Decision Support</span>
                  <ArrowUpRight className="size-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3 group-hover:text-white transition-colors">
                Surface Risks Before Design
              </h3>
              
              <p className="text-sm text-zinc-400 leading-relaxed">
                Specialist agents compare mobility scenarios, catchment demographics, economic activity and waterbody proximity while preserving every assumption and limitation.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span className="text-zinc-400 font-medium">Structured Pre-Feasibility</span>
              <span className="text-zinc-400">Review Required</span>
            </div>
          </div>
        </Link>

      </div>

    </section>
  );
}

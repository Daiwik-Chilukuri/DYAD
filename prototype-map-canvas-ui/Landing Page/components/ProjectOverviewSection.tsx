'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { MultiAgentPipelineTimeline } from './MultiAgentPipelineTimeline';
import { InsightPhoneMockup } from './InsightPhoneMockup';

export function ProjectOverviewSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16 select-none">
      
      {/* =========================================================================
          PLATFORM INSIGHTS SECTION (4 DETERMINISTIC INTELLIGENCE LAYERS)
          - 2x2 grid with dark preview containers and right-hand details
          - Subtle black shadow experience + iconic turquoise brand accents
          ========================================================================= */}
      <div id="insights" className="mb-28 scroll-mt-20">
        
        {/* SECTION TITLE WITH ICONIC TURQUOISE ACCENT DOT */}
        <div className="flex items-baseline gap-2.5 sm:gap-3.5 mb-4">
          <h2 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight">
            Platform insights
          </h2>
          <span className="size-3 sm:size-4 lg:size-5 rounded-xs bg-[#0ab1ba] inline-block shadow-[0_0_16px_#0ab1ba]" />
        </div>
        <p className="text-zinc-400 text-base sm:text-lg lg:text-xl max-w-3xl mb-12 leading-relaxed">
          Four mission-critical deterministic intelligence layers delivered to transit authorities and urban planners in under 4 seconds.
        </p>

        {/* 2X2 CARDS GRID SHOWCASING REAL TRANSIT PLANNER INSIGHTS WITH DEVICE MOCKUPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* INSIGHT 1: RIDERSHIP DEMAND & PPHPD PRESSURE */}
          <Link href="/" className="group block">
            <div className="h-full rounded-2xl bg-[#08080a] hover:bg-[#0c0c0e] border border-white/[0.05] hover:border-white/20 p-5 sm:p-6 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.98)] hover:shadow-[0_30px_70px_rgba(0,0,0,1)] hover:-translate-y-1 relative overflow-hidden flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              
              {/* LEFT: AUTHENTIC PHONE SCREEN MOCKUP */}
              <InsightPhoneMockup type="ridership" />

              {/* RIGHT: DETAILS & DIAGONAL ARROW */}
              <div className="flex-1 flex flex-col justify-between h-full w-full py-1">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">
                      Ridership Demand &amp; PPHPD Calibration
                    </h3>
                    <ArrowUpRight className="size-4.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 leading-relaxed">
                    Projects peak-hour passenger volume per direction across candidate alignments. Immediately validates heavy metro vs light rail viability against official MoHUA benchmarks.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                  <span className="text-zinc-400">18,450 PPHPD</span>
                  <span>•</span>
                  <span className="text-zinc-500">Origin-Destination Matrix</span>
                </div>
              </div>

            </div>
          </Link>

          {/* INSIGHT 2: TRAVEL TIME DELTA & CONGESTION RELIEF */}
          <Link href="/" className="group block">
            <div className="h-full rounded-2xl bg-[#08080a] hover:bg-[#0c0c0e] border border-white/[0.05] hover:border-white/20 p-5 sm:p-6 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.98)] hover:shadow-[0_30px_70px_rgba(0,0,0,1)] hover:-translate-y-1 relative overflow-hidden flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              
              {/* LEFT: AUTHENTIC PHONE SCREEN MOCKUP */}
              <InsightPhoneMockup type="travel-time" />

              {/* RIGHT: DETAILS & DIAGONAL ARROW */}
              <div className="flex-1 flex flex-col justify-between h-full w-full py-1">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">
                      Travel Time Delta &amp; Congestion Relief
                    </h3>
                    <ArrowUpRight className="size-4.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 leading-relaxed">
                    Benchmarks real-world arterial vehicle delay against automated grade-separated rail. Quantifies commuter travel time saved (44 mins/trip) and private car diversion.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                  <span className="text-zinc-400">14m Rail vs 58m Road</span>
                  <span>•</span>
                  <span className="text-zinc-500">52.8% Car Drop</span>
                </div>
              </div>

            </div>
          </Link>

          {/* INSIGHT 3: WALKSHED DEMOGRAPHICS & CATCHMENT ANALYTICS */}
          <Link href="/" className="group block">
            <div className="h-full rounded-2xl bg-[#08080a] hover:bg-[#0c0c0e] border border-white/[0.05] hover:border-white/20 p-5 sm:p-6 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.98)] hover:shadow-[0_30px_70px_rgba(0,0,0,1)] hover:-translate-y-1 relative overflow-hidden flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              
              {/* LEFT: AUTHENTIC PHONE SCREEN MOCKUP */}
              <InsightPhoneMockup type="walkshed" />

              {/* RIGHT: DETAILS & DIAGONAL ARROW */}
              <div className="flex-1 flex flex-col justify-between h-full w-full py-1">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">
                      2.0 km Walksheds &amp; TOD Density
                    </h3>
                    <ArrowUpRight className="size-4.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 leading-relaxed">
                    Calculates geodesic pedestrian catchment polygons around candidate stations, auditing census ward boundaries for employment hubs, tech parks, and residential density.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                  <span className="text-zinc-400">342k Walk-in Catchment</span>
                  <span>•</span>
                  <span className="text-zinc-500">84 Corporate SEZs</span>
                </div>
              </div>

            </div>
          </Link>

          {/* INSIGHT 4: CIVIL CLEARANCES & ECOLOGICAL COMPLIANCE */}
          <Link href="/" className="group block">
            <div className="h-full rounded-2xl bg-[#08080a] hover:bg-[#0c0c0e] border border-white/[0.05] hover:border-white/20 p-5 sm:p-6 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.98)] hover:shadow-[0_30px_70px_rgba(0,0,0,1)] hover:-translate-y-1 relative overflow-hidden flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              
              {/* LEFT: AUTHENTIC PHONE SCREEN MOCKUP */}
              <InsightPhoneMockup type="compliance" />

              {/* RIGHT: DETAILS & DIAGONAL ARROW */}
              <div className="flex-1 flex flex-col justify-between h-full w-full py-1">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">
                      Right-of-Way &amp; NGT Clearances
                    </h3>
                    <ArrowUpRight className="size-4.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 leading-relaxed">
                    Audits viaduct alignment against National Green Tribunal (NGT) 75m lake setbacks, municipal water bodies, and subsurface utilities to safeguard against legal stays.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                  <span className="text-zinc-400">112m Setback (0 Flags)</span>
                  <span>•</span>
                  <span className="text-zinc-500">14.62% Fiscal EIRR</span>
                </div>
              </div>

            </div>
          </Link>

        </div>
      </div>

      {/* =========================================================================
          2. MULTI-AGENT SWARM PROGRESSIVE VERTICAL TIMELINE PIPELINE
          - Central illuminated progress spine inspired by reference design
          - Distinctive bot logo nodes on spine
          - Alternating left/right cards with directional notch arrows
          - Clear explanation of what bot does + contribution to final DPR brief
          - Subtle black shadow experience + iconic turquoise brand accents
          ========================================================================= */}
      <div id="swarm" className="scroll-mt-20">
        <MultiAgentPipelineTimeline />
      </div>

    </section>
  );
}

export default ProjectOverviewSection;

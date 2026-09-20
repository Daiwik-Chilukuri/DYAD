'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, MapPin, GitBranch, IndianRupee, 
  ShieldCheck, Layers, ChevronLeft, ChevronRight,
  ArrowUpRight, CheckCircle2
} from 'lucide-react';

interface AgentCardData {
  id: string;
  code: string;
  name: string;
  domain: string;
  icon: React.ElementType;
  whatItDoes: string;
  briefContribution: string;
  outputMetric: string;
  metricLabel: string;
  standard: string;
  latency: string;
}

const AGENTS: AgentCardData[] = [
  {
    id: 'mob-01',
    code: 'AGT-MOB-01',
    name: 'Mobility & Congestion Engine',
    domain: 'Traffic & Passenger Demand',
    icon: TrendingUp,
    whatItDoes: 'Scans 1.24M trip records and live road congestion delays to map where commuters get stuck and where transit is desperately needed.',
    briefContribution: 'Computes peak passenger volume (18,450 PPHPD) and proves the corridor saves commuters 44 minutes daily, clearing the official threshold for heavy rail.',
    outputMetric: '18,450 PPHPD',
    metricLabel: 'Peak Hour Demand',
    standard: 'MoHUA Viability 2024',
    latency: '< 120 ms'
  },
  {
    id: 'geo-02',
    code: 'AGT-GEO-02',
    name: 'Geospatial Catchment Agent',
    domain: 'Walksheds & Demographics',
    icon: MapPin,
    whatItDoes: 'Draws 2.0 km walking buffers around candidate stations and scans municipal census wards for residential density and corporate campuses.',
    briefContribution: 'Identifies 342,800 residents and 84 tech parks (420,000 workers) within direct walking distance, optimizing station stops to maximize walk-in boardings without feeder buses.',
    outputMetric: '342,800',
    metricLabel: 'Walkshed Population',
    standard: 'TOD Walkshed Standard',
    latency: '< 85 ms'
  },
  {
    id: 'eng-03',
    code: 'AGT-ENG-03',
    name: 'Civil Engineering Watchdog',
    domain: 'Viaduct Alignment & Utilities',
    icon: GitBranch,
    whatItDoes: 'Audits 3D LiDAR terrain elevations, viaduct turning curves, ruling track slopes, and underground municipal utility networks.',
    briefContribution: 'Verifies structural viability (2.85% ruling gradient) and flags subsurface conflicts (e.g. Pier 48 BESCOM power lines) so relocation costs are budgeted before construction tenders.',
    outputMetric: '2.85% Slope',
    metricLabel: 'Ruling Gradient (145m Rad)',
    standard: 'BMRCL Structural Code v4.2',
    latency: '< 140 ms'
  },
  {
    id: 'fin-04',
    code: 'AGT-FIN-04',
    name: 'CapEx & Fiscal Arbiter',
    domain: 'Lifecycle Economics & Funding',
    icon: IndianRupee,
    whatItDoes: 'Runs 30-year lifecycle discounted cash flows, benchmarks viaduct costs at ₹254 Cr/km, and models Land Value Capture (LVC) around stations.',
    briefContribution: 'Delivers the formal Economic Internal Rate of Return (14.62% EIRR vs 14% benchmark) and calculates ₹4,120 Cr CapEx required to secure central government capital grants.',
    outputMetric: '14.62% EIRR',
    metricLabel: 'Surpasses 14% Hurdle',
    standard: 'DEA PPP Framework',
    latency: '< 190 ms'
  },
  {
    id: 'eco-05',
    code: 'AGT-ECO-05',
    name: 'Ecological Compliance Watchdog',
    domain: 'Environmental & NGT Setbacks',
    icon: ShieldCheck,
    whatItDoes: 'Projects the alignment against National Green Tribunal (NGT) 75m lake buffers, forest reserves, flood lines, and municipal tree inventories.',
    briefContribution: 'Guarantees 100% environmental compliance (112m lake setback), budgets tree translocations, and calculates carbon offsets to protect the project from legal stay orders.',
    outputMetric: '100% NGT',
    metricLabel: '112m Lake Setback Verified',
    standard: 'NGT Principal Bench Rule',
    latency: '< 95 ms'
  },
  {
    id: 'syn-06',
    code: 'AGT-SYN-06',
    name: 'DPR Synthesis Arbiter',
    domain: 'Swarm Consensus & Dossier',
    icon: Layers,
    whatItDoes: 'Resolves technical debates between engineering, financial, and ecological agents into a unified, reconciled transit corridor model.',
    briefContribution: 'Compiles all agent calculations, GIS vector layers, and financial tables into a Ministry-grade Pre-Feasibility DPR Dossier ready for executive sign-off in under 4 seconds.',
    outputMetric: '< 4.0s',
    metricLabel: 'DPR Dossier Synthesis',
    standard: 'MoHUA DPR Blueprint',
    latency: '< 320 ms'
  }
];

export function MultiAgentSwarmReel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update button visibility & active index on scroll
  const updateScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 20);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 20);

    const cardApproxWidth = 390;
    const index = Math.round(container.scrollLeft / cardApproxWidth);
    setActiveIndex(Math.min(Math.max(index, 0), AGENTS.length - 1));
  };

  // Convert vertical mouse wheel into smooth card-by-card horizontal scroll when hovering over the container
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isStepping = false;

    const handleWheel = (e: WheelEvent) => {
      // Check if vertical scroll delta dominates
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        const isAtStart = container.scrollLeft <= 10 && e.deltaY < 0;
        const isAtEnd = container.scrollLeft >= maxScroll - 10 && e.deltaY > 0;

        // If not at the boundary, intercept and step to the next/prev flashcard
        if (!isAtStart && !isAtEnd) {
          e.preventDefault();
          if (!isStepping) {
            isStepping = true;
            const direction = e.deltaY > 0 ? 1 : -1;
            const cardApproxWidth = 390;
            container.scrollBy({
              left: direction * cardApproxWidth,
              behavior: 'smooth'
            });
            setTimeout(() => {
              isStepping = false;
            }, 320);
          }
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleScrollTo = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 390;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleScrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const cardApproxWidth = 390;
    scrollContainerRef.current.scrollTo({
      left: index * cardApproxWidth,
      behavior: 'smooth'
    });
  };

  return (
    <div className="w-full mb-28 select-none">
      
      {/* =========================================================================
          HEADER WITH TITLE, SIGNATURE TURQUOISE SQUARE, SUBTEXT & SLIDER CONTROLS
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-5">
        
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-zinc-400 mb-3">
            <span className="size-1.5 rounded-full bg-zinc-400" />
            <span>Autonomous Intelligence Swarm</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <h2 className="font-sans text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Multi-agent system &amp; pipeline
            </h2>
            <span className="size-2 sm:size-2.5 rounded-xs bg-[#0ab1ba] inline-block shadow-[0_0_12px_#0ab1ba]" />
          </div>

          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Six specialized serverless microVM agents debate CapEx, engineering viability, walkshed footfall, and environmental clearance before generating the final pre-feasibility brief.
          </p>
        </div>

        {/* CONTROLS: PREV / NEXT BUTTONS & HOVER-SCROLL INDICATOR - DARK SHADOW */}
        <div className="flex items-center gap-3 self-start md:self-end shrink-0">
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-zinc-400">
            <span className="text-zinc-400">⇄</span>
            <span>Hover &amp; scroll to browse</span>
          </div>

          <button
            onClick={() => handleScrollTo('left')}
            disabled={!canScrollLeft}
            aria-label="Previous Agent"
            className="size-9 rounded-full bg-[#08080a] border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:border-white/[0.08] disabled:hover:text-zinc-400 flex items-center justify-center transition-all shadow-[0_4px_15px_rgba(0,0,0,0.8)] cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
            onClick={() => handleScrollTo('right')}
            disabled={!canScrollRight}
            aria-label="Next Agent"
            className="size-9 rounded-full bg-[#08080a] border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:border-white/[0.08] disabled:hover:text-zinc-400 flex items-center justify-center transition-all shadow-[0_4px_15px_rgba(0,0,0,0.8)] cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="size-4" />
          </button>

        </div>

      </div>

      {/* =========================================================================
          HORIZONTAL SCROLL REEL OF FLASHCARDS - DARK SHADOW EXPERIENCE
          - Smooth scroll snap
          - Discrete hover card stepping
          - Deep matte black depth (#08080a, shadow-[0_25px_60px_rgba(0,0,0,0.98)])
          - Sleek metallic silver/zinc typography
          ========================================================================= */}
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollState}
        className="flex items-stretch gap-5 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {AGENTS.map((agent, index) => {
          const Icon = agent.icon;
          const isCurrent = activeIndex === index;

          return (
            <div
              key={agent.id}
              className={`w-[310px] sm:w-[370px] md:w-[390px] shrink-0 snap-start rounded-2xl bg-[#08080a] hover:bg-[#0c0c0e] border transition-all duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.98)] hover:shadow-[0_35px_80px_rgba(0,0,0,1)] hover:-translate-y-1 p-6 flex flex-col justify-between relative group ${
                isCurrent ? 'border-white/20' : 'border-white/[0.06] hover:border-white/15'
              }`}
            >
              
              {/* TOP: AGENT TELEMETRY & DOMAIN */}
              <div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-zinc-500" />
                    <span className="text-[11px] font-mono text-zinc-400 font-semibold tracking-wider uppercase">
                      {agent.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.05]">
                      {agent.latency}
                    </span>
                    <Link href="/agents" className="text-zinc-500 hover:text-white transition-colors">
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </div>

                {/* AGENT TITLE & ICON */}
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="size-10 rounded-xl bg-[#040406] border border-white/[0.08] flex items-center justify-center shrink-0 text-zinc-300 shadow-inner group-hover:text-white group-hover:border-white/20 transition-colors">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover:text-white transition-colors">
                      {agent.name}
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-400 tracking-tight">
                      {agent.domain}
                    </span>
                  </div>
                </div>

                {/* WHAT THE AGENT DOES (SIMPLE & CONCISE) */}
                <div className="mb-5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                    What this agent does
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {agent.whatItDoes}
                  </p>
                </div>

                {/* CONTRIBUTION TO FINAL BRIEF (HIGHLIGHTED CALLOUT - DARK SHADOW) */}
                <div className="rounded-xl bg-[#030304] border border-white/[0.05] p-3.5 mb-5 relative overflow-hidden group-hover:border-white/15 transition-colors">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="size-1.5 rounded-xs bg-zinc-400" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                      Contribution to Brief
                    </span>
                  </div>
                  <p className="text-[11.5px] text-zinc-300 leading-relaxed font-sans">
                    {agent.briefContribution}
                  </p>
                </div>

              </div>

              {/* BOTTOM: OUTPUT METRIC & REGULATORY STANDARD */}
              <div className="pt-4 border-t border-white/[0.05]">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-mono text-sm sm:text-base font-bold text-white tracking-tight">
                    {agent.outputMetric}
                  </span>
                  <span className="text-[10.5px] font-mono text-zinc-400">
                    {agent.metricLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>{agent.standard}</span>
                  <span className="text-zinc-400 flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-zinc-500" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* =========================================================================
          PAGINATION PILLS / DOTS - DARK SHADOW EXPERIENCE
          ========================================================================= */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {AGENTS.map((agent, i) => (
          <button
            key={agent.id}
            onClick={() => handleScrollToIndex(i)}
            aria-label={`Jump to ${agent.name}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              activeIndex === i 
                ? 'w-8 bg-zinc-200 shadow-[0_0_8px_rgba(255,255,255,0.3)]' 
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

    </div>
  );
}

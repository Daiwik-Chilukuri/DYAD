'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, MapPin, GitBranch, IndianRupee, 
  ShieldCheck, Layers, ArrowUpRight, Sparkles
} from 'lucide-react';
import { BotLogo } from '../../components/BotLogo';

interface PipelineAgent {
  id: string;
  code: string;
  name: string;
  shortName: string;
  role: string;
  domain: string;
  badgeBg: string;
  badgeBorder: string;
  accentColor: string;
  icon: React.ElementType;
  whatItDoes: string;
  briefContribution: string;
  regulatoryStandard: string;
  keyMetric: string;
  latency: string;
}

const PIPELINE_AGENTS: PipelineAgent[] = [
  {
    id: 'mob-01',
    code: 'AGT-MOB-01',
    name: 'Mobility & Congestion Engine',
    shortName: 'Mobility Engine',
    role: 'Lead Traffic & Passenger Demand Analyst',
    domain: 'Traffic & Flow Reconnaissance',
    badgeBg: 'bg-gradient-to-br from-[#0c1e28] to-[#04080c]',
    badgeBorder: 'border-[#0ab1ba]/60',
    accentColor: '#0ab1ba',
    icon: TrendingUp,
    whatItDoes: 'Scans 1.24M commuter trip records and live road telemetry to locate congestion bottlenecks and demand hotspots.',
    briefContribution: 'Computes peak passenger ridership (18,450 PPHPD) proving the corridor saves commuters 44 minutes daily.',
    regulatoryStandard: 'MoHUA 2024 Heavy Rail Viability Threshold',
    keyMetric: '18,450 PPHPD Peak Viability',
    latency: '< 120 ms'
  },
  {
    id: 'geo-02',
    code: 'AGT-GEO-02',
    name: 'Geospatial Catchment Agent',
    shortName: 'Catchment Watchdog',
    role: 'Spatial Walkshed & Demographic Auditor',
    domain: 'Walksheds & Urban Land Use',
    badgeBg: 'bg-gradient-to-br from-[#0a2320] to-[#030a08]',
    badgeBorder: 'border-[#00f5d4]/60',
    accentColor: '#00f5d4',
    icon: MapPin,
    whatItDoes: 'Draws 2.0 km geodesic walking buffers around candidate station stops and audits municipal census blocks for density.',
    briefContribution: 'Maps 342,800 residents and 84 tech parks within direct walk-in distance, eliminating reliance on feeder bus links.',
    regulatoryStandard: 'TOD High-Density Walkshed Guidelines',
    keyMetric: '342,800 Walk-In Population',
    latency: '< 85 ms'
  },
  {
    id: 'eng-03',
    code: 'AGT-ENG-03',
    name: 'Civil Engineering Watchdog',
    shortName: 'Civil Watchdog',
    role: 'Geometric Alignment & Utility Arbiter',
    domain: '3D LiDAR Terrain & Right-of-Way',
    badgeBg: 'bg-gradient-to-br from-[#1b152d] to-[#07050d]',
    badgeBorder: 'border-[#9d4edd]/60',
    accentColor: '#9d4edd',
    icon: GitBranch,
    whatItDoes: 'Audits 3D LiDAR terrain elevations, viaduct turning radii (145m min), ruling gradients, and subterranean utilities.',
    briefContribution: 'Certifies structural feasibility (2.85% ruling slope) and flags subsurface electrical conflicts for pre-tender budgeting.',
    regulatoryStandard: 'BMRCL Structural Code v4.2 Compliance',
    keyMetric: '2.85% Ruling Gradient (145m Rad)',
    latency: '< 140 ms'
  },
  {
    id: 'fin-04',
    code: 'AGT-FIN-04',
    name: 'CapEx & Fiscal Arbiter',
    shortName: 'Fiscal Arbiter',
    role: 'Capital Expenditure & Cash Flow Modeler',
    domain: 'Lifecycle Economics & Funding',
    badgeBg: 'bg-gradient-to-br from-[#2a1d08] to-[#0d0903]',
    badgeBorder: 'border-[#ffd166]/60',
    accentColor: '#ffd166',
    icon: IndianRupee,
    whatItDoes: 'Simulates 30-year lifecycle discounted cash flows and benchmarks elevated viaduct construction at ₹254 Cr/km.',
    briefContribution: 'Delivers the formal Economic Internal Rate of Return (14.62% EIRR vs 14% benchmark) to unlock central capital grants.',
    regulatoryStandard: 'DEA PPP Capital Grant Framework',
    keyMetric: '14.62% EIRR (Surpasses Benchmark)',
    latency: '< 190 ms'
  },
  {
    id: 'eco-05',
    code: 'AGT-ECO-05',
    name: 'Ecological Compliance Watchdog',
    shortName: 'Ecological Watchdog',
    role: 'Environmental & NGT Setback Auditor',
    domain: 'Environmental & Water Body Protection',
    badgeBg: 'bg-gradient-to-br from-[#0c2a1a] to-[#030c07]',
    badgeBorder: 'border-[#06d6a0]/60',
    accentColor: '#06d6a0',
    icon: ShieldCheck,
    whatItDoes: 'Checks alignment vectors against National Green Tribunal (NGT) 75m lake buffers, flood lines, and protected forest bounds.',
    briefContribution: 'Guarantees 100% environmental compliance (112m lake setback) and budgets tree translocations to prevent legal injunctions.',
    regulatoryStandard: 'NGT Principal Bench Rule (0 Stay Risk)',
    keyMetric: '100% NGT Compliant Setback',
    latency: '< 95 ms'
  },
  {
    id: 'syn-06',
    code: 'AGT-SYN-06',
    name: 'DPR Synthesis Arbiter',
    shortName: 'DPR Arbiter',
    role: 'Chief Swarm Consensus & Brief Compiler',
    domain: 'Autonomous Dossier Compilation',
    badgeBg: 'bg-gradient-to-br from-[#22222c] to-[#08080a]',
    badgeBorder: 'border-white/50',
    accentColor: '#ffffff',
    icon: Layers,
    whatItDoes: 'Resolves technical debates between mobility, civil engineering, fiscal, and ecological agents into a reconciled route.',
    briefContribution: 'Compiles all agent calculations, GIS vector shapefiles, and financial schedules into an executive DPR brief in under 4 seconds.',
    regulatoryStandard: 'Ministry-Ready DPR Dossier Standard',
    keyMetric: '< 4.0s Autonomous Synthesis',
    latency: '< 4.0s'
  }
];

export function MultiAgentPipelineTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track the advancing vertical white line height (in pixels from timeline container top)
  const [lineHeight, setLineHeight] = useState<number>(0);
  // Map of which agents have been reached by the guiding line
  const [reachedMap, setReachedMap] = useState<boolean[]>(new Array(PIPELINE_AGENTS.length).fill(false));

  useEffect(() => {
    const updateScroll = () => {
      if (!timelineRef.current) return;
      const timelineRect = timelineRef.current.getBoundingClientRect();
      const triggerY = window.innerHeight * 0.65; // Trigger scanline at 65% of viewport (guides smoothly ahead of user)

      // Height of white line from timeline container top (starting at top-8 = 32px) down to trigger line
      const rawY = triggerY - (timelineRect.top + 32);
      const maxLineHeight = Math.max(0, timelineRect.height - 64);
      const clampedY = Math.max(0, Math.min(maxLineHeight, rawY));
      setLineHeight(clampedY);

      // Exact position of the leading edge of the tracker bead inside the timeline container
      // Track starts at top: 32px; bead center is at 32 + clampedY; bottom edge is + 8px
      const lineTipInsideTimeline = 32 + clampedY + 8;

      // Check which nodes the guiding white line has touched
      const nextReached = PIPELINE_AGENTS.map((_, idx) => {
        const nodeEl = nodeRefs.current[idx];
        if (!nodeEl) return false;
        const nodeRect = nodeEl.getBoundingClientRect();
        // Top edge of the agent icon badge relative to the timeline container
        const nodeTopInsideTimeline = nodeRect.top - timelineRect.top;
        // Agent reveals the exact instant the white line tip touches the top edge of the icon!
        return lineTipInsideTimeline >= nodeTopInsideTimeline - 2;
      });

      setReachedMap(prev => {
        const hasChanged = nextReached.some((val, i) => val !== prev[i]);
        return hasChanged ? nextReached : prev;
      });
    };

    // Run immediately on mount
    updateScroll();

    // Re-run after short delays so dynamically loaded sections/fonts/MapLibre layout shifts are tracked
    const t1 = setTimeout(updateScroll, 100);
    const t2 = setTimeout(updateScroll, 500);
    const t3 = setTimeout(updateScroll, 1200);

    // 1. Direct attachment to the landing scroll container
    const scrollContainer = document.getElementById('landing-scroll-container') 
      || document.querySelector('.overflow-y-auto')
      || timelineRef.current?.closest('.overflow-y-auto');

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateScroll, { passive: true });
    }

    // 2. Global capture listeners on window and document (catches ALL scroll events across any element)
    window.addEventListener('scroll', updateScroll, { capture: true, passive: true });
    document.addEventListener('scroll', updateScroll, { capture: true, passive: true });

    // 3. User interaction fallbacks (wheel, touchmove, resize)
    window.addEventListener('wheel', updateScroll, { passive: true });
    window.addEventListener('touchmove', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updateScroll);
      }
      window.removeEventListener('scroll', updateScroll, { capture: true });
      document.removeEventListener('scroll', updateScroll, { capture: true });
      window.removeEventListener('wheel', updateScroll);
      window.removeEventListener('touchmove', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  const handleNodeClick = (index: number) => {
    const nodeEl = nodeRefs.current[index];
    if (!nodeEl) return;
    nodeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section className="w-full select-none py-12">
      
      {/* SECTION HEADER */}
      <div className="mb-24">
        <div className="flex items-baseline gap-2.5 sm:gap-3.5 mb-4">
          <h2 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight">
            Multi-Agent Pipeline
          </h2>
          <span className="size-3 sm:size-4 lg:size-5 rounded-xs bg-[#0ab1ba] inline-block shadow-[0_0_16px_#0ab1ba]" />
        </div>
        <p className="text-zinc-400 text-base sm:text-lg lg:text-xl max-w-3xl leading-relaxed font-normal">
          Autonomous transit reconnaissance pipeline. A synchronized intelligence signal passes sequentially through all six agents, resolving constraints and compiling the ministry-ready pre-feasibility DPR brief.
        </p>
      </div>

      {/* TIMELINE CONTAINER WITH CENTRAL SPINE */}
      <div ref={timelineRef} className="relative max-w-5xl mx-auto pt-6 pb-12">

        {/* 1. BASE VERTICAL SPINE TRACK (PITCH DARK GUIDE LINE) */}
        <div className="absolute top-8 bottom-8 left-6 md:left-1/2 -translate-x-1/2 w-[2px] bg-white/[0.08]" />

        {/* 2. ADVANCING GUIDING WHITE LINE (TRAVELS DOWN AS USER SCROLLS) */}
        <div 
          style={{ height: `${lineHeight}px` }}
          className="absolute top-8 left-6 md:left-1/2 -translate-x-1/2 w-[2.5px] bg-white shadow-[0_0_12px_#ffffff,0_0_24px_rgba(10,177,186,0.6)] z-10 transition-[height] duration-75 ease-out pointer-events-none"
        />

        {/* 3. RADIANT TRACKER HEAD (PULSING BEAD AT ADVANCING TIP OF WHITE LINE) */}
        {lineHeight > 0 && (
          <div 
            style={{ top: `${lineHeight + 32}px` }}
            className="absolute left-6 md:left-1/2 -translate-x-1/2 size-4 rounded-full bg-white shadow-[0_0_18px_#ffffff,0_0_35px_#0ab1ba] border-2 border-[#0ab1ba] -translate-y-1/2 z-30 pointer-events-none transition-[top] duration-75 ease-out flex items-center justify-center"
          >
            <div className="size-1.5 rounded-full bg-[#0ab1ba] animate-ping" />
          </div>
        )}

        {/* TOP INCEPTION BADGE */}
        <div className="flex items-center justify-start md:justify-center mb-16 pl-14 md:pl-0">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#09090c] border border-white/10 text-[10px] font-mono text-zinc-400 shadow-md">
            <span className="size-1.5 rounded-full bg-white animate-pulse" />
            <span className="tracking-wider uppercase">Pipeline Ingestion Start</span>
          </div>
        </div>

        {/* 4. PIPELINE NODES (GUIDED PASSING ANIMATION) */}
        <div className="space-y-24 sm:space-y-32 relative z-20">
          {PIPELINE_AGENTS.map((agent, index) => {
            const isEven = index % 2 === 1; // index 0, 2, 4 = card on right; index 1, 3, 5 = card on left
            const AgentIcon = agent.icon;
            const isReached = reachedMap[index];

            return (
              <div 
                key={agent.id}
                className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0"
              >

                {/* =========================================================
                    LEFT SIDE: (EITHER AGENT LABEL OR ELEVATED CARD)
                    ========================================================= */}
                <div className={`w-full md:w-[42%] pl-16 md:pl-0 ${isEven ? 'order-2 md:order-1' : 'order-1 md:order-1'}`}>
                  {isEven ? (
                    /* EVEN: ELEVATED CARD ON LEFT (POINTING RIGHT TO NODE) */
                    <div
                      className={`relative rounded-2xl bg-[#060608] border transition-all duration-300 ease-out group ${
                        isReached 
                          ? 'opacity-100 translate-x-0 border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.98),0_10px_25px_rgba(0,0,0,0.9)]' 
                          : 'opacity-20 -translate-x-3 border-white/[0.04] pointer-events-none'
                      } p-6`}
                    >
                      {/* TRIANGULAR NOTCH ARROW POINTING RIGHT TOWARD CENTER NODE */}
                      <div className={`hidden md:block absolute top-7 -right-2 size-4 bg-[#060608] border-r border-t transition-colors duration-300 ease-out rotate-45 ${
                        isReached ? 'border-white/[0.12] group-hover:border-white/30' : 'border-white/[0.04]'
                      }`} />

                      {/* CARD CONTENT */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-base sm:text-lg font-bold tracking-tight transition-colors duration-300 ease-out ${
                            isReached ? 'text-white' : 'text-zinc-500'
                          }`}>
                            {agent.role}
                          </h3>
                          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border transition-colors duration-300 ease-out ${
                            isReached 
                              ? 'bg-white/[0.06] border-white/15 text-zinc-300' 
                              : 'bg-white/[0.02] border-white/5 text-zinc-600'
                          }`}>
                            {agent.latency}
                          </span>
                        </div>

                        {/* BULLET POINTS WITH SQUARE BULLET ▪ */}
                        <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed pt-1">
                          <li className="flex items-start gap-2.5">
                            <span className={`shrink-0 text-xs mt-0.5 transition-colors duration-300 ease-out ${
                              isReached ? 'text-white' : 'text-zinc-700'
                            }`}>▪</span>
                            <span className={isReached ? 'text-zinc-300' : 'text-zinc-600'}>{agent.whatItDoes}</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className={`shrink-0 text-xs mt-0.5 transition-colors duration-300 ease-out ${
                              isReached ? 'text-[#0ab1ba]' : 'text-zinc-700'
                            }`}>▪</span>
                            <span className={isReached ? 'text-white font-medium' : 'text-zinc-600'}>{agent.briefContribution}</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-[11px] font-mono">
                            <span className={`shrink-0 text-xs transition-colors duration-300 ease-out ${
                              isReached ? 'text-zinc-500' : 'text-zinc-700'
                            }`}>▪</span>
                            <span className={isReached ? 'text-zinc-400' : 'text-zinc-600'}>{agent.regulatoryStandard}</span>
                          </li>
                        </ul>

                        {/* BOTTOM TELEMETRY LINK */}
                        <div className={`pt-3 border-t transition-colors duration-300 ease-out flex items-center justify-between text-xs font-mono ${
                          isReached ? 'border-white/[0.06] text-zinc-300' : 'border-white/[0.02] text-zinc-700'
                        }`}>
                          <span className="flex items-center gap-1.5 group-hover:text-white transition-colors">
                            <span>{agent.keyMetric}</span>
                            <ArrowUpRight className={`size-3.5 transition-colors duration-300 ease-out ${
                              isReached ? 'text-[#0ab1ba]' : 'text-zinc-700'
                            }`} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ODD: AGENT META / LABEL ON LEFT (RIGHT-ALIGNED TOWARDS NODE) */
                    <div className={`md:text-right space-y-1.5 transition-all duration-300 ease-out ${
                      isReached ? 'opacity-100 translate-x-0' : 'opacity-20 -translate-x-3'
                    }`}>
                      <div className="flex md:justify-end items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                        <span className={isReached ? 'text-zinc-400' : 'text-zinc-700'}>{agent.code}</span>
                        <span>•</span>
                        <span className={isReached ? 'text-white font-semibold' : 'text-zinc-700'}>{agent.latency}</span>
                      </div>
                      <h3 className={`text-lg sm:text-xl font-extrabold tracking-tight transition-colors duration-300 ease-out ${
                        isReached ? 'text-white' : 'text-zinc-600'
                      }`}>
                        {agent.shortName}
                      </h3>
                      <p className={`text-xs font-mono transition-colors duration-300 ease-out ${
                        isReached ? 'text-zinc-400' : 'text-zinc-700'
                      }`}>
                        {agent.domain}
                      </p>
                    </div>
                  )}
                </div>

                {/* =========================================================
                    CENTER: BOT LOGO SQUARE BADGE (MOUNTED ON SPINE)
                    ========================================================= */}
                <div 
                  ref={el => { nodeRefs.current[index] = el; }}
                  className="absolute left-6 md:left-1/2 -translate-x-1/2 top-4 md:top-auto z-30"
                >
                  <div
                    onClick={() => handleNodeClick(index)}
                    className={`size-12 sm:size-13 rounded-2xl ${agent.badgeBg} border flex items-center justify-center transition-all duration-300 ease-out relative group cursor-pointer ${
                      isReached 
                        ? `${agent.badgeBorder} scale-100 opacity-100 shadow-[0_0_30px_rgba(255,255,255,0.2),0_10px_25px_rgba(0,0,0,0.95)] hover:scale-110` 
                        : 'border-white/10 scale-90 opacity-25 grayscale hover:opacity-50'
                    }`}
                  >
                    {/* AMBIENT GLOW WHEN ACTIVE */}
                    <div 
                      className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ease-out blur-md ${
                        isReached ? 'opacity-50' : 'opacity-0'
                      }`}
                      style={{ backgroundColor: agent.accentColor }}
                    />

                    {/* BOT LOGO / GLYPH */}
                    <div className="relative z-10 flex items-center justify-center">
                      {agent.id === 'syn-06' ? (
                        <BotLogo className={`size-6.5 transition-colors duration-300 ease-out ${
                          isReached ? 'text-white' : 'text-zinc-600'
                        }`} isActive={isReached} />
                      ) : (
                        <AgentIcon className={`size-6 transition-colors duration-300 ease-out ${
                          isReached ? 'text-white' : 'text-zinc-600'
                        }`} />
                      )}
                    </div>

                    {/* STEP INDEX NUMBER CHIP */}
                    <div className={`absolute -bottom-2.5 px-1.5 py-0.2 rounded-full text-[8.5px] font-mono border transition-all duration-300 ease-out ${
                      isReached 
                        ? 'bg-black border-white/30 text-white font-bold' 
                        : 'bg-black/60 border-white/5 text-zinc-700'
                    }`}>
                      0{index + 1}
                    </div>
                  </div>
                </div>

                {/* =========================================================
                    RIGHT SIDE: (EITHER ELEVATED CARD OR AGENT LABEL)
                    ========================================================= */}
                <div className={`w-full md:w-[42%] pl-16 md:pl-0 ${isEven ? 'order-3 md:order-2' : 'order-2 md:order-2'}`}>
                  {isEven ? (
                    /* EVEN: AGENT META / LABEL ON RIGHT (LEFT-ALIGNED TOWARDS NODE) */
                    <div className={`space-y-1.5 transition-all duration-300 ease-out ${
                      isReached ? 'opacity-100 translate-x-0' : 'opacity-20 translate-x-3'
                    }`}>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                        <span className={isReached ? 'text-zinc-400' : 'text-zinc-700'}>{agent.code}</span>
                        <span>•</span>
                        <span className={isReached ? 'text-white font-semibold' : 'text-zinc-700'}>{agent.latency}</span>
                      </div>
                      <h3 className={`text-lg sm:text-xl font-extrabold tracking-tight transition-colors duration-300 ease-out ${
                        isReached ? 'text-white' : 'text-zinc-600'
                      }`}>
                        {agent.shortName}
                      </h3>
                      <p className={`text-xs font-mono transition-colors duration-300 ease-out ${
                        isReached ? 'text-zinc-400' : 'text-zinc-700'
                      }`}>
                        {agent.domain}
                      </p>
                    </div>
                  ) : (
                    /* ODD: ELEVATED CARD ON RIGHT (POINTING LEFT TO NODE) */
                    <div
                      className={`relative rounded-2xl bg-[#060608] border transition-all duration-300 ease-out group ${
                        isReached 
                          ? 'opacity-100 translate-x-0 border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.98),0_10px_25px_rgba(0,0,0,0.9)]' 
                          : 'opacity-20 translate-x-3 border-white/[0.04] pointer-events-none'
                      } p-6`}
                    >
                      {/* TRIANGULAR NOTCH ARROW POINTING LEFT TOWARD CENTER NODE */}
                      <div className={`hidden md:block absolute top-7 -left-2 size-4 bg-[#060608] border-l border-b transition-colors duration-300 ease-out rotate-45 ${
                        isReached ? 'border-white/[0.12] group-hover:border-white/30' : 'border-white/[0.04]'
                      }`} />

                      {/* CARD CONTENT */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-base sm:text-lg font-bold tracking-tight transition-colors duration-300 ease-out ${
                            isReached ? 'text-white' : 'text-zinc-500'
                          }`}>
                            {agent.role}
                          </h3>
                          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border transition-colors duration-300 ease-out ${
                            isReached 
                              ? 'bg-white/[0.06] border-white/15 text-zinc-300' 
                              : 'bg-white/[0.02] border-white/5 text-zinc-600'
                          }`}>
                            {agent.latency}
                          </span>
                        </div>

                        {/* BULLET POINTS WITH SQUARE BULLET ▪ */}
                        <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed pt-1">
                          <li className="flex items-start gap-2.5">
                            <span className={`shrink-0 text-xs mt-0.5 transition-colors duration-300 ease-out ${
                              isReached ? 'text-white' : 'text-zinc-700'
                            }`}>▪</span>
                            <span className={isReached ? 'text-zinc-300' : 'text-zinc-600'}>{agent.whatItDoes}</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className={`shrink-0 text-xs mt-0.5 transition-colors duration-300 ease-out ${
                              isReached ? 'text-[#0ab1ba]' : 'text-zinc-700'
                            }`}>▪</span>
                            <span className={isReached ? 'text-white font-medium' : 'text-zinc-600'}>{agent.briefContribution}</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-[11px] font-mono">
                            <span className={`shrink-0 text-xs transition-colors duration-300 ease-out ${
                              isReached ? 'text-zinc-500' : 'text-zinc-700'
                            }`}>▪</span>
                            <span className={isReached ? 'text-zinc-400' : 'text-zinc-600'}>{agent.regulatoryStandard}</span>
                          </li>
                        </ul>

                        {/* BOTTOM TELEMETRY LINK */}
                        <div className={`pt-3 border-t transition-colors duration-300 ease-out flex items-center justify-between text-xs font-mono ${
                          isReached ? 'border-white/[0.06] text-zinc-300' : 'border-white/[0.02] text-zinc-700'
                        }`}>
                          <span className="flex items-center gap-1.5 group-hover:text-white transition-colors">
                            <span>{agent.keyMetric}</span>
                            <ArrowUpRight className={`size-3.5 transition-colors duration-300 ease-out ${
                              isReached ? 'text-[#0ab1ba]' : 'text-zinc-700'
                            }`} />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
}

export default MultiAgentPipelineTimeline;

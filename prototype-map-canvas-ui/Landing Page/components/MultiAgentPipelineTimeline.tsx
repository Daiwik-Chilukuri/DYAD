'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Globe2, UsersRound, Timer, MapPinned, Leaf,
  Layers, ArrowUpRight
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
    id: 'browser-01',
    code: 'AGT-DATA-01',
    name: 'Browser Dataset Agent',
    shortName: 'Browser Dataset Agent',
    role: 'Source Discovery & Acquisition',
    domain: 'Public Data Collection',
    badgeBg: 'bg-gradient-to-br from-[#082338] to-[#03090d]',
    badgeBorder: 'border-[#00bbf9]/60',
    accentColor: '#00bbf9',
    icon: Globe2,
    whatItDoes: 'Navigates configured public-data sources, downloads candidate municipal and spatial datasets, and records source and licensing metadata.',
    briefContribution: 'Routes each candidate dataset into a validation step before it can become an analysis input.',
    regulatoryStandard: 'Source, licence and retrieval metadata preserved',
    keyMetric: 'Traceable acquisition record',
    latency: 'DATA ACQUISITION'
  },
  {
    id: 'demographic-02',
    code: 'AGT-DEM-02',
    name: 'Demographic Agent',
    shortName: 'Demographic Agent',
    role: 'Catchment & Equity Baselines',
    domain: 'Ward Census & Spatial Equity',
    badgeBg: 'bg-gradient-to-br from-[#0a2320] to-[#030a08]',
    badgeBorder: 'border-[#00f5d4]/60',
    accentColor: '#00f5d4',
    icon: UsersRound,
    whatItDoes: 'Intersects corridor catchments with historical ward-level Census data to estimate population reached, population density, and available equity indicators.',
    briefContribution: 'Makes neighbourhood coverage visible while keeping the reference year and spatial assumptions attached to every estimate.',
    regulatoryStandard: 'Historical baseline • Uniform-within-ward assumption',
    keyMetric: 'Area-weighted population & equity signals',
    latency: 'CENSUS 2011 BASELINE'
  },
  {
    id: 'mobility-03',
    code: 'AGT-MOB-03',
    name: 'Mobility Agent',
    shortName: 'Mobility Agent',
    role: 'Travel-Time Scenario Modelling',
    domain: 'GTFS, Roads & Historical Mobility',
    badgeBg: 'bg-gradient-to-br from-[#0c1e28] to-[#04080c]',
    badgeBorder: 'border-[#0ab1ba]/60',
    accentColor: '#0ab1ba',
    icon: Timer,
    whatItDoes: 'Estimates scheduled metro travel time from GTFS data and compares it with configurable road-congestion scenarios, mapped road widths, and historical mobility indicators.',
    briefContribution: 'Produces a transparent scenario comparison without presenting modelled road conditions as observed live traffic.',
    regulatoryStandard: 'Unofficial GTFS • Assumed road V/C • Not live traffic',
    keyMetric: 'Schedule vs road-scenario comparison',
    latency: 'MODELLED • NOT LIVE'
  },
  {
    id: 'poi-04',
    code: 'AGT-POI-04',
    name: 'POI Agent',
    shortName: 'POI Agent',
    role: 'Accessibility & Activity Clustering',
    domain: 'Planning-Relevant POI Analysis',
    badgeBg: 'bg-gradient-to-br from-[#2a1d08] to-[#0d0903]',
    badgeBorder: 'border-[#ffd166]/60',
    accentColor: '#ffd166',
    icon: MapPinned,
    whatItDoes: 'Identifies, categorizes, and clusters nearby hospitals, educational institutions, corporate locations, commercial centres, civic facilities, and public-transport POIs.',
    briefContribution: 'Returns category counts and spatial clusters inside a configurable corridor catchment for accessibility analysis.',
    regulatoryStandard: 'OpenStreetMap snapshot • Contributor coverage varies',
    keyMetric: 'Categorised counts + spatial clusters',
    latency: 'OSM SNAPSHOT'
  },
  {
    id: 'eco-05',
    code: 'AGT-ECO-05',
    name: 'Ecological Risk Agent',
    shortName: 'Ecological Risk Agent',
    role: 'Environmental & Restricted-Area Screening',
    domain: 'Verified Environmental Constraint Layers',
    badgeBg: 'bg-gradient-to-br from-[#0c2a1a] to-[#030c07]',
    badgeBorder: 'border-[#06d6a0]/60',
    accentColor: '#06d6a0',
    icon: Leaf,
    whatItDoes: 'Checks corridor proximity and intersection against every verified environmental or restricted-area layer supplied to the analysis.',
    briefContribution: 'Water layers are active; forest, protected-area, flood-risk and other restricted-zone checks activate only when their verified datasets are available.',
    regulatoryStandard: 'Available-layer screen • Not statutory or legal clearance',
    keyMetric: 'Coverage gaps remain visible',
    latency: 'RISK SCREEN'
  }
];

export function MultiAgentPipelineTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const orchestratorRef = useRef<HTMLDivElement>(null);

  // Track the advancing vertical white line height (in pixels from timeline container top)
  const [lineHeight, setLineHeight] = useState<number>(0);
  // Map of which agents have been reached by the guiding line
  const [reachedMap, setReachedMap] = useState<boolean[]>(new Array(PIPELINE_AGENTS.length).fill(false));
  // The orchestrator is the final destination of the same guiding line.
  const [orchestratorReached, setOrchestratorReached] = useState(false);

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

      const orchestratorEl = orchestratorRef.current;
      if (orchestratorEl) {
        const orchestratorTopInsideTimeline = orchestratorEl.getBoundingClientRect().top - timelineRect.top;
        const nextOrchestratorReached = lineTipInsideTimeline >= orchestratorTopInsideTimeline - 2;
        setOrchestratorReached(prev => prev === nextOrchestratorReached ? prev : nextOrchestratorReached);
      }
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
            The Engine — Five Specialized Agents
          </h2>
          <span className="size-3 sm:size-4 lg:size-5 rounded-xs bg-[#0ab1ba] inline-block shadow-[0_0_16px_#0ab1ba]" />
        </div>
        <p className="text-zinc-400 text-base sm:text-lg lg:text-xl max-w-3xl leading-relaxed font-normal">
          Five focused agents support dataset acquisition and corridor analysis. Every result preserves its source, assumptions, reference period, and limitations.
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
            <span className="tracking-wider uppercase">Dataset Acquisition Start</span>
          </div>
        </div>

        {/* 4. PIPELINE NODES (GUIDED PASSING ANIMATION) */}
        <div className="space-y-24 sm:space-y-32 relative z-20">
          {PIPELINE_AGENTS.map((agent, index) => {
            const isEven = index % 2 === 1; // Alternate detail cards around the central spine.
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

                    {/* AGENT GLYPH */}
                    <div className="relative z-10 flex items-center justify-center">
                      <AgentIcon
                        aria-hidden="true"
                        className={`size-6 transition-colors duration-300 ease-out ${
                          isReached ? 'text-white' : 'text-zinc-600'
                        }`}
                      />
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

        {/* FINAL HANDOFF NODE + ORCHESTRATOR OUTPUT */}
        <div className="relative z-20 mt-24 sm:mt-32">
          <div className="relative mb-8 h-14">
            <div
              ref={orchestratorRef}
              className="absolute left-6 md:left-1/2 -translate-x-1/2 top-0 z-30"
            >
              <div className={`relative flex size-12 sm:size-13 items-center justify-center rounded-2xl border bg-gradient-to-br from-[#22222c] to-[#08080a] transition-[opacity,transform,border-color,box-shadow] duration-[250ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:scale-100 ${
                orchestratorReached
                  ? 'scale-100 opacity-100 border-[#0ab1ba]/70 shadow-[0_0_32px_rgba(10,177,186,0.5),0_10px_25px_rgba(0,0,0,0.95)]'
                  : 'scale-90 opacity-25 border-white/10 shadow-none grayscale'
              }`}>
                <div className={`absolute inset-0 rounded-2xl bg-[#0ab1ba] blur-md transition-opacity duration-[250ms] ${
                  orchestratorReached ? 'opacity-35' : 'opacity-0'
                }`} />
                <BotLogo
                  className={`relative z-10 size-6.5 transition-colors duration-[250ms] ${
                    orchestratorReached ? 'text-white' : 'text-zinc-600'
                  }`}
                  isActive={orchestratorReached}
                />
                <div className={`absolute -bottom-2.5 rounded-full border px-1.5 py-0.2 font-mono text-[8.5px] transition-[color,background-color,border-color] duration-[250ms] ${
                  orchestratorReached
                    ? 'border-[#0ab1ba]/60 bg-black text-white font-bold'
                    : 'border-white/5 bg-black/60 text-zinc-700'
                }`}>
                  06
                </div>
              </div>
            </div>
          </div>

          <div
          className={`ml-14 md:ml-0 rounded-2xl border bg-[#060608] p-5 sm:p-6 transition-[opacity,transform,border-color,box-shadow] delay-[60ms] duration-[250ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:translate-y-0 motion-reduce:transition-[opacity,border-color,box-shadow] ${
            orchestratorReached
              ? 'translate-y-0 opacity-100 border-white/[0.16] shadow-[0_28px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(10,177,186,0.08)]'
              : 'translate-y-4 opacity-10 border-white/[0.05] shadow-none'
          }`}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br from-[#22222c] to-[#08080a] transition-[transform,border-color,box-shadow] duration-[250ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:scale-100 ${
              orchestratorReached
                ? 'scale-100 border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.65),0_0_22px_rgba(10,177,186,0.22)]'
                : 'scale-95 border-white/10 shadow-none'
            }`}>
              <BotLogo
                className={`size-6.5 transition-colors duration-[250ms] ${
                  orchestratorReached ? 'text-white' : 'text-zinc-600'
                }`}
                isActive={orchestratorReached}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2.5">
                <h3 className={`text-lg font-extrabold tracking-tight transition-colors duration-[250ms] ${
                  orchestratorReached ? 'text-white' : 'text-zinc-600'
                }`}>Master Orchestrator</h3>
                <span className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest transition-colors duration-[250ms] ${
                  orchestratorReached
                    ? 'border-white/15 bg-white/[0.06] text-zinc-300'
                    : 'border-white/5 bg-white/[0.02] text-zinc-700'
                }`}>
                  {orchestratorReached ? 'Structured output' : 'Awaiting agents'}
                </span>
              </div>
              <p className={`max-w-3xl text-sm leading-relaxed transition-colors duration-[250ms] ${
                orchestratorReached ? 'text-zinc-400' : 'text-zinc-700'
              }`}>
                Combines the five agent outputs into structured JSON and GeoJSON containing metrics, map features, data provenance, limitations, risk warnings, and recommended follow-up work.
              </p>
            </div>
            <div className={`flex items-center gap-2 font-mono text-xs transition-colors duration-[250ms] ${
              orchestratorReached ? 'text-zinc-300' : 'text-zinc-700'
            }`}>
              <Layers aria-hidden="true" className={`size-4 transition-colors duration-[250ms] ${
                orchestratorReached ? 'text-[#0ab1ba]' : 'text-zinc-700'
              }`} />
              JSON + GeoJSON
            </div>
          </div>
        </div>
        </div>

      </div>

    </section>
  );
}

export default MultiAgentPipelineTimeline;

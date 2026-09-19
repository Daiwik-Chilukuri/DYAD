'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, TrendingUp, Zap, GitBranch, MapPin, 
  ArrowLeft, CheckCircle2, AlertTriangle, 
  SlidersHorizontal, Download, ChevronDown, Loader2,
  Sparkles, ShieldCheck, Users, IndianRupee, ArrowUpRight
} from 'lucide-react';
import { motionSprings } from '../../../lib/motion';
import { BotLogo } from '../../../components/BotLogo';

interface AgentTrace {
  id: string;
  name: string;
  status: 'processing' | 'completed' | 'exception';
  inputChips: string[];
  inputGiven: string;
  domain: string;
  domainCategory: 'mobility' | 'demographics' | 'civil' | 'finance' | 'ecology';
  primaryOutput: string;
  reasoning: string[];
  discrepancy?: string;
  standard: string;
}

interface Flashcard {
  id: string;
  agentId: string;
  title: string;
  metric: string;
  unit?: string;
  badge: { label: string; type: 'teal' | 'sky' | 'purple' | 'amber' };
  insight: string;
  footer: string;
  icon: 'demand' | 'catchment' | 'capex' | 'safety';
}

const FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    agentId: 'AGT-MOB-01',
    title: 'Commuter Velocity & Demand',
    metric: '18,450',
    unit: 'PPHPD',
    badge: { label: '123% of Rail Threshold', type: 'teal' },
    insight: 'Peak hour travel time cut by 44 mins per commuter on Central Silk Board viaduct.',
    footer: '312k daily passenger-hours saved · 42.4% modal shift',
    icon: 'demand'
  },
  {
    id: 'fc-2',
    agentId: 'AGT-GEO-02',
    title: 'Catchment & Employment POIs',
    metric: '342,800',
    unit: 'Residents',
    badge: { label: '82/100 Walkshed Score', type: 'sky' },
    insight: '2.0km geodesic buffer intersects 84 tech parks including Ecospace, Cessna & Prestige.',
    footer: '420,000 employees in direct walkshed · 18 hospitals',
    icon: 'catchment'
  },
  {
    id: 'fc-3',
    agentId: 'AGT-FIN-04',
    title: 'Fiscal Feasibility & EIRR',
    metric: '₹4,120 Cr',
    unit: '(₹254 Cr/km)',
    badge: { label: '14.62% EIRR (Pass)', type: 'purple' },
    insight: 'Economic internal rate of return comfortably surpasses MoHUA 14.0% benchmark.',
    footer: '1.38x Farebox Operating Ratio · ₹620 Cr TOD capture',
    icon: 'capex'
  },
  {
    id: 'fc-4',
    agentId: 'AGT-ENG-03',
    title: 'Civil Clearances & Ecology',
    metric: '0 Flags',
    unit: '(112m Buffer)',
    badge: { label: 'Action: Pier 48', type: 'amber' },
    insight: '112m Agara Lake setback clears NGT rule. Utility relocation required at Pier 48.',
    footer: '₹8.2 Cr BESCOM 66kV transmission line tender window',
    icon: 'safety'
  }
];

const AGENTS: AgentTrace[] = [
  {
    id: 'AGT-MOB-01',
    name: 'Mobility & Congestion Engine',
    status: 'completed',
    inputChips: ['1.24M Traffic Sensors', 'BPR Delay Curves', 'Peak OD Matrix'],
    inputGiven: '1.24M ORR traffic sensor events, Bureau of Public Roads (BPR) volume-delay curves & peak-hour OD travel times',
    domain: 'Mobility & Transit',
    domainCategory: 'mobility',
    primaryOutput: '18,450 PPHPD peak demand, 44 mins travel time saved per commuter (312k passenger-hours saved daily)',
    reasoning: [
      'Ingested 1.24M trip events along Central Silk Board and Bellandur junctions.',
      'Peak period demand reaches 18,450 PPHPD, clearing the 15,000 heavy rail viability threshold.',
      'Predictive mode-choice logit model projects 42.4% shift from private vehicles and cabs to metro viaduct.'
    ],
    standard: 'MoHUA Transit Viability Standard 2024'
  },
  {
    id: 'AGT-GEO-02',
    name: 'Geospatial Catchment Agent',
    status: 'completed',
    inputChips: ['2.0km Isochrones', '1,472 Bangalore POIs', 'BBMP Ward Census'],
    inputGiven: '2.0km geodesic station walkshed isochrones, 1,472 Bangalore POIs GeoJSON & BBMP ward census density',
    domain: 'Demographics & Catchment',
    domainCategory: 'demographics',
    primaryOutput: '342,800 Catchment Population, 84 Tech Parks, 18 Healthcare Anchors (82/100 Walkability Index)',
    reasoning: [
      'Constructed 2.0km geodesic buffer around proposed Silk Board → Bellandur corridor alignment.',
      'Spatial points-in-polygon queries mapped 420,000 tech employees across Ecospace, EcoWorld, and Cessna.',
      'BBMP ward census intersection projects 62,000 daily walk-in boardings without feeder bus reliance.'
    ],
    standard: 'Transit-Oriented Development (TOD) Guidelines'
  },
  {
    id: 'AGT-ENG-03',
    name: 'Civil Engineering Alignment Watchdog',
    status: 'exception',
    inputChips: ['Phase-2A DPR CAD', 'LiDAR Terrain Model', 'BESCOM 66kV Grid'],
    inputGiven: 'BMRCL Phase-2A alignment DPR CAD, LiDAR elevation terrain model & BESCOM 66kV transmission power grid',
    domain: 'Civil Engineering',
    domainCategory: 'civil',
    primaryOutput: '2.85% Ruling Gradient, 145m Turning Radius (Utility Conflict detected at Pier 48)',
    reasoning: [
      'Turning radius at Central Silk Board ramp curve measures 145m, safely exceeding the 120m sharp curvature limit.',
      'Ruling gradient across Agara flyover separation computed at 2.85% (well below the 3.20% maximum).',
      'Utility conflict flagged: Pier 48 directly conflicts with 66kV BESCOM underground power transmission feeder at Iblur junction.'
    ],
    discrepancy: 'Advance Action: Pier 48 requires utility shifting tender (₹8.2 Cr budget with 45-day relocation window prior to piling).',
    standard: 'BMRCL Structural & Alignment Code v4.2'
  },
  {
    id: 'AGT-FIN-04',
    name: 'CapEx & Economic Feasibility Arbiter',
    status: 'completed',
    inputChips: ['MoHUA CapEx Index', '₹254 Cr/km Benchmark', '30-Yr DCF Cashflows'],
    inputGiven: 'MoHUA CapEx indexer (2025 standard), ₹254 Cr/km viaduct benchmark & 30-year lifecycle DCF cash flows',
    domain: 'Economics & Finance',
    domainCategory: 'finance',
    primaryOutput: '₹4,120 Cr CapEx, 14.62% EIRR (Exceeds 14% hurdle rate), 1.38x Farebox Operating Ratio',
    reasoning: [
      'Executed discounted cash flow (DCF) model across 30-year economic lifecycle for 16.2 km double-track elevated viaduct.',
      'Elevated viaduct benchmarked at ₹254 Cr/km including rolling stock, traction power, and 8 standard stations.',
      'Station property development and Transit-Oriented Development (TOD) yields ₹620 Cr non-fare commercial value capture.'
    ],
    standard: 'Department of Economic Affairs (DEA) PPP Framework'
  },
  {
    id: 'AGT-ECO-05',
    name: 'Ecological Compliance Watchdog',
    status: 'completed',
    inputChips: ['NGT 75m Lake Buffer', 'Karnataka Forest GIS', 'BBMP Tree Census'],
    inputGiven: 'National Green Tribunal (NGT) 75m lake buffer boundary vectors, Karnataka Forest GIS & BBMP tree census',
    domain: 'Ecology & Regulatory',
    domainCategory: 'ecology',
    primaryOutput: '0 Buffer Violations (112m Setback vs 75m NGT Rule), 142 Median Trees Translocation Protocol',
    reasoning: [
      'Spatial boolean intersection against Agara Lake and Bellandur wetland buffer geometries confirms 112m setback.',
      'Candidate viaduct path safely surpasses the mandatory 75m National Green Tribunal exclusion setback.',
      'Compensatory afforestation budget of ₹1.8 Cr cleared for 142 affected median trees; abates 48,200 tons CO2 annually.'
    ],
    standard: 'National Green Tribunal (NGT) Principal Bench Mandate'
  }
];

export default function MultiAgentOutputPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCardAgentId, setActiveCardAgentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'exception'>('all');
  const [items] = useState<AgentTrace[]>(AGENTS);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `metropulse-corridor-feasibility-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCardClick = (agentId: string) => {
    if (activeCardAgentId === agentId) {
      setActiveCardAgentId(null);
      setExpandedId(null);
    } else {
      setActiveCardAgentId(agentId);
      setExpandedId(agentId);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCard = !activeCardAgentId || item.id === activeCardAgentId;
      return matchesStatus && matchesCard;
    });
  }, [items, statusFilter, activeCardAgentId]);

  const renderDomainBadge = (domain: string, category: string) => {
    switch (category) {
      case 'mobility':
        return <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-medium inline-block">{domain}</span>;
      case 'demographics':
        return <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-full text-xs font-medium inline-block">{domain}</span>;
      case 'civil':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-medium inline-block">{domain}</span>;
      case 'finance':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-medium inline-block">{domain}</span>;
      case 'ecology':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium inline-block">{domain}</span>;
      default:
        return <span className="bg-secondary text-foreground border border-border px-3 py-1 rounded-full text-xs font-medium inline-block">{domain}</span>;
    }
  };

  const renderCardIcon = (type: Flashcard['icon']) => {
    switch (type) {
      case 'demand':
        return <TrendingUp className="size-4 text-primary" />;
      case 'catchment':
        return <Users className="size-4 text-sky-400" />;
      case 'capex':
        return <IndianRupee className="size-4 text-purple-400" />;
      case 'safety':
        return <ShieldCheck className="size-4 text-amber-400" />;
    }
  };

  const renderCardBadge = (badge: Flashcard['badge']) => {
    switch (badge.type) {
      case 'teal':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">{badge.label}</span>;
      case 'sky':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">{badge.label}</span>;
      case 'purple':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">{badge.label}</span>;
      case 'amber':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">{badge.label}</span>;
    }
  };

  return (
    <div className="relative w-screen h-screen flex overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
      
      {/* 68px LEFT VERTICAL RAIL (STANDARDIZED ACROSS ALL ROUTES) */}
      <aside className="relative z-20 w-17 flex flex-col items-center border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl py-4 h-full shrink-0">
        <Link href="/" className="w-10 h-10 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center mb-6 shadow-sm group">
          <MapPin className="text-primary size-5 group-hover:scale-105 transition-transform" />
        </Link>
        <nav className="flex flex-col gap-4">
          <Link href="/data" title="Data Ingestion & Schema Inspector">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.94 }} 
              transition={motionSprings.snappy} 
              className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Database className="size-5" />
            </motion.button>
          </Link>

          <Link href="/" title="Corridor Simulation Canvas">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.94 }} 
              transition={motionSprings.snappy} 
              className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <TrendingUp className="size-5" />
            </motion.button>
          </Link>

          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.94 }} 
            transition={motionSprings.snappy} 
            className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Zap className="size-5" />
          </motion.button>

          {/* ACTIVE BOT ICON */}
          <Link href="/agents" title="Autonomous Multi-Agent Swarm Intelligence">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.94 }} 
              transition={motionSprings.snappy} 
              className="p-2 rounded-lg bg-primary/10 border border-primary/20 shadow-sm flex items-center justify-center transition-all group"
            >
              <BotLogo className="size-5.5" isActive={true} />
            </motion.button>
          </Link>

          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.94 }} 
            transition={motionSprings.snappy} 
            className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <GitBranch className="size-5" />
          </motion.button>
        </nav>
      </aside>

      {/* MAIN BODY AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* STREAMLINED TOP NAVBAR */}
        <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <BotLogo className="size-4" isActive />
            <span className="text-foreground font-medium text-sm tracking-tight">Swarm Deliberation</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-muted-foreground text-xs font-mono">Silk Board → Bellandur Phase-2A</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-emerald-400 text-xs font-mono">88.4% Viable</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Swarm</span>
            </div>

            <div className="h-3.5 w-px bg-border/60" />

            <Link href="/">
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="size-3 text-primary" />
                <span>Map Canvas</span>
              </motion.button>
            </Link>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            
            {/* SUBHEADER WITH STATUS & ACTIONS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold text-foreground tracking-tight">
                  Autonomous Agent Deliberation
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Multi-agent consensus telemetry for Phase-2A alignment, catchment, and engineering feasibility.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {activeCardAgentId && (
                  <button 
                    onClick={() => {
                      setActiveCardAgentId(null);
                      setExpandedId(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-xs font-mono text-primary transition-colors flex items-center gap-1"
                  >
                    <span>Reset Focus</span>
                    <span className="text-muted-foreground">×</span>
                  </button>
                )}

                <motion.button 
                  onClick={() => {
                    const cycle: ('all' | 'completed' | 'exception')[] = ['all', 'completed', 'exception'];
                    const next = cycle[(cycle.indexOf(statusFilter) + 1) % cycle.length];
                    setStatusFilter(next);
                  }}
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-colors ${
                    statusFilter !== 'all' 
                      ? 'bg-primary/10 text-primary border-primary/30' 
                      : 'bg-secondary/40 hover:bg-secondary/70 border-border/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <SlidersHorizontal className="size-3" />
                  <span>Filter {statusFilter !== 'all' ? `(${statusFilter})` : ''}</span>
                </motion.button>

                <motion.button 
                  onClick={handleExport}
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="px-3.5 py-1.5 rounded-lg bg-secondary/40 hover:bg-secondary/70 border border-border/60 text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-2 transition-colors"
                >
                  <Download className="size-3" />
                  <span>Export</span>
                </motion.button>
              </div>
            </div>

            {/* 4 DYNAMIC FLASHCARDS SHOWING DIFFERENT ASPECTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {FLASHCARDS.map(card => {
                const isSelected = activeCardAgentId === card.agentId;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.agentId)}
                    className={`rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between gap-3 group relative overflow-hidden ${
                      isSelected 
                        ? 'bg-secondary/80 border-primary/60 shadow-[0_0_20px_rgba(10,177,186,0.15)] ring-1 ring-primary/40' 
                        : 'bg-card/40 hover:bg-secondary/40 border-border/50 hover:border-border'
                    }`}
                  >
                    {/* TOP ACCENT LINE */}
                    <div className={`absolute top-0 left-0 right-0 h-0.5 transition-opacity ${
                      isSelected ? 'bg-primary opacity-100' : 'bg-primary/40 opacity-0 group-hover:opacity-100'
                    }`} />

                    <div className="flex flex-col gap-2">
                      {/* CARD HEADER: ICON + BADGE */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center border border-border/40">
                            {renderCardIcon(card.icon)}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground font-sans truncate">
                            {card.title}
                          </span>
                        </div>
                        {renderCardBadge(card.badge)}
                      </div>

                      {/* BIG NUMBER METRIC */}
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                          {card.metric}
                        </span>
                        {card.unit && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {card.unit}
                          </span>
                        )}
                      </div>

                      {/* 1-LINE CONTEXTUAL INSIGHT */}
                      <p className="text-xs text-foreground/85 font-sans leading-relaxed">
                        {card.insight}
                      </p>
                    </div>

                    {/* CARD FOOTER STAT */}
                    <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground/80 font-mono">
                      <span className="truncate">{card.footer}</span>
                      <ArrowUpRight className={`size-3 shrink-0 transition-transform ${isSelected ? 'text-primary rotate-45' : 'opacity-0 group-hover:opacity-100'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SPACIOUS TABLE (STRICT 3 COLUMNS: Agent Name, Input Given, Domain) */}
            <div className="w-full pt-1">
              <table className="w-full text-left border-collapse">
                
                {/* AIRY TABLE HEADER */}
                <thead>
                  <tr className="border-b border-border/40 text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80">
                    <th className="py-3.5 px-3 font-normal w-72">Agent Name</th>
                    <th className="py-3.5 px-6 font-normal">Input Given</th>
                    <th className="py-3.5 px-6 font-normal w-56">Domain</th>
                    <th className="py-3.5 px-3 font-normal w-12 text-right"></th>
                  </tr>
                </thead>

                {/* AIRY TABLE BODY */}
                <tbody className="divide-y divide-border/30">
                  {filteredItems.map(item => {
                    const isExpanded = expandedId === item.id;
                    const isCardSelected = activeCardAgentId === item.id;

                    return (
                      <tr 
                        key={item.id}
                        className={`group transition-colors ${
                          isCardSelected ? 'bg-secondary/30' : 'hover:bg-secondary/20'
                        }`}
                      >
                        <td colSpan={4} className="p-0">
                          
                          {/* ROW MAIN LINE */}
                          <div 
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className="flex items-center py-4.5 px-3 text-xs w-full gap-6 cursor-pointer"
                          >
                            {/* 1. AGENT NAME & STATUS */}
                            <div className="w-72 shrink-0 flex items-center gap-3.5">
                              <div className="shrink-0">
                                {item.status === 'processing' && (
                                  <Loader2 className="size-4 text-primary animate-spin" />
                                )}
                                {item.status === 'completed' && (
                                  <CheckCircle2 className="size-4 text-emerald-400/90" />
                                )}
                                {item.status === 'exception' && (
                                  <AlertTriangle className="size-4 text-amber-400/90" />
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`font-medium text-sm truncate transition-colors ${
                                  isCardSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                                }`}>
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                  {item.id}
                                </span>
                              </div>
                            </div>

                            {/* 2. INPUT GIVEN - BREATHABLE PILL CHIPS */}
                            <div className="flex-1 min-w-[200px] flex items-center flex-wrap gap-2 px-3">
                              {item.inputChips.map((chip, idx) => (
                                <span 
                                  key={idx}
                                  className="px-3 py-1 rounded-full text-xs bg-secondary/50 border border-border/50 text-foreground/80 font-mono tracking-tight hover:border-primary/40 hover:text-foreground transition-colors"
                                >
                                  {chip}
                                </span>
                              ))}
                            </div>

                            {/* 3. DOMAIN PILL */}
                            <div className="w-56 shrink-0 px-3">
                              {renderDomainBadge(item.domain, item.domainCategory)}
                            </div>

                            {/* EXPAND ACTION */}
                            <div className="w-12 shrink-0 flex items-center justify-end">
                              <ChevronDown className={`size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:text-foreground ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                            </div>
                          </div>

                          {/* SPACIOUS PROGRESSIVE INSPECTION PANEL */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="my-2 mx-3 p-6 rounded-xl bg-card/40 border border-border/40 flex flex-col gap-4 text-xs"
                              >
                                {/* PRIMARY FINDING */}
                                <div className="flex items-start gap-3">
                                  <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-medium">Evaluated Feasibility Finding:</span>
                                    <span className="text-foreground text-sm font-medium leading-relaxed">{item.primaryOutput}</span>
                                  </div>
                                </div>

                                {/* FULL INPUT DATASET CONTEXT */}
                                <div className="text-muted-foreground text-xs leading-relaxed pl-7">
                                  <span className="text-foreground/80 font-mono text-[11px]">Ingested Data: </span>
                                  {item.inputGiven}
                                </div>

                                {/* REASONING BULLETS */}
                                <div className="pl-7 flex flex-col gap-2 pt-2 border-t border-border/30">
                                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                                    Deliberation Trace:
                                  </span>
                                  <div className="space-y-1.5">
                                    {item.reasoning.map((step, idx) => (
                                      <div key={idx} className="flex items-start gap-2.5 text-muted-foreground text-xs leading-relaxed">
                                        <span className="size-1.5 rounded-full bg-primary/70 shrink-0 mt-1.5" />
                                        <span>{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* ALERT IF APPLICABLE */}
                                {item.discrepancy && (
                                  <div className="ml-7 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2.5">
                                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                                    <span>{item.discrepancy}</span>
                                  </div>
                                )}

                                {/* FOOTER */}
                                <div className="ml-7 pt-2 border-t border-border/30 flex items-center justify-between text-muted-foreground text-[11px] font-mono">
                                  <span className="flex items-center gap-1.5">
                                    <ShieldCheck className="size-3.5 text-emerald-400" />
                                    Benchmark: <strong className="text-foreground font-normal">{item.standard}</strong>
                                  </span>
                                  <span className="text-emerald-400">Clearance Verified</span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

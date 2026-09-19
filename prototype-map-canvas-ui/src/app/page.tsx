'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import * as turf from '@turf/turf';
import { MapCanvas } from '../../components/MapCanvas';
import { BotLogo } from '../../components/BotLogo';
import { 
  Database, Zap, TrendingUp, GitBranch, MapPin, 
  Navigation, Sparkles, X, Layers, ArrowUpRight, CheckCircle2,
  Clock, Users, ShieldCheck, SlidersHorizontal, ChevronLeft, ChevronRight,
  RotateCcw, Search, Check, Eye, EyeOff, Sliders, Activity
} from 'lucide-react';
import { motionSprings } from '../../lib/motion';

const SILK_BOARD_COORDS: [number, number] = [77.6245, 12.9176];

interface BenefitedAreaInfo {
  id: string;
  name: string;
  coords: [number, number];
  tier: string;
  tierCode: 'direct' | 'interchange' | 'network';
  color: string;
  benefitScore: number;
  timeSavedMin: number;
  commuteRoad: string;
  commuteMetro: string;
  commuterCount: string;
  modalShift: string;
  networkLink: string;
  description: string;
}

const BENEFITED_AREAS: BenefitedAreaInfo[] = [
  {
    id: 'zone-rajajinagar',
    name: 'Rajajinagar',
    coords: [77.5535, 12.9975],
    tier: 'Network Beneficiary',
    tierCode: 'network',
    color: '#c084fc',
    benefitScore: 91,
    timeSavedMin: 42,
    commuteRoad: '68 mins',
    commuteMetro: '26 mins',
    commuterCount: '118,000',
    modalShift: '39.2%',
    networkLink: 'Green Line Interchange via RV Road / Silk Board',
    description: 'Green Line interchange via RV Road connects directly to Silk Board viaduct, bypassing severe central city gridlock and saving 42 mins each way to the tech corridor.'
  },
  {
    id: 'zone-indiranagar',
    name: 'Indiranagar',
    coords: [77.6405, 12.9735],
    tier: 'Interchange Beneficiary',
    tierCode: 'interchange',
    color: '#38bdf8',
    benefitScore: 93,
    timeSavedMin: 38,
    commuteRoad: '54 mins',
    commuteMetro: '16 mins',
    commuterCount: '145,000',
    modalShift: '44.5%',
    networkLink: 'Purple Line ↔ Phase-2A Viaduct Interchange',
    description: 'Direct interchange from Purple Line via KR Puram / Silk Board feeder, eliminating the choke points along Old Airport Road and 100 Feet Road.'
  },
  {
    id: 'zone-bellandur',
    name: 'Bellandur & ORR',
    coords: [77.6815, 12.9295],
    tier: 'Direct Corridor Catchment',
    tierCode: 'direct',
    color: '#0ab1ba',
    benefitScore: 98,
    timeSavedMin: 44,
    commuteRoad: '58 mins',
    commuteMetro: '14 mins',
    commuterCount: '342,800',
    modalShift: '52.8%',
    networkLink: 'Phase-2A Elevated Spine (Silk Board → KR Puram)',
    description: 'Primary high-demand viaduct corridor relieving 18,450 PPHPD congestion across RMZ Ecospace, Cessna Business Park, and Prestige Tech Park.'
  },
  {
    id: 'zone-hsr',
    name: 'HSR Layout',
    coords: [77.6435, 12.9115],
    tier: 'Surrounding Area',
    tierCode: 'direct',
    color: '#0ab1ba',
    benefitScore: 96,
    timeSavedMin: 32,
    commuteRoad: '42 mins',
    commuteMetro: '10 mins',
    commuterCount: '195,000',
    modalShift: '48.0%',
    networkLink: 'Phase-2A Sector-1 / 14th Main Stations',
    description: 'Located immediately in the surrounding catchment of the viaduct; residents get walkable access to 14th Main & Agara stations, slashing private vehicle use by 48%.'
  },
  {
    id: 'zone-koramangala',
    name: 'Koramangala',
    coords: [77.6225, 12.9340],
    tier: 'Surrounding Area',
    tierCode: 'interchange',
    color: '#38bdf8',
    benefitScore: 92,
    timeSavedMin: 30,
    commuteRoad: '46 mins',
    commuteMetro: '16 mins',
    commuterCount: '168,000',
    modalShift: '41.6%',
    networkLink: 'Silk Board & St. John\'s Feeder Access',
    description: 'Surrounding area immediately adjacent to Silk Board; traffic that previously choked Sony World signal transfers to metro viaduct, saving 30 mins.'
  },
  {
    id: 'zone-btm',
    name: 'BTM & Jayanagar',
    coords: [77.6050, 12.9160],
    tier: 'Surrounding Area',
    tierCode: 'interchange',
    color: '#38bdf8',
    benefitScore: 90,
    timeSavedMin: 34,
    commuteRoad: '48 mins',
    commuteMetro: '14 mins',
    commuterCount: '172,000',
    modalShift: '46.2%',
    networkLink: 'Green / Yellow Line Interchange at Jayadeva & Silk Board',
    description: 'Connects directly at the Central Silk Board multimodal interchange, linking Green and Yellow line commuters to the eastern tech parks.'
  },
  {
    id: 'zone-marathahalli',
    name: 'Marathahalli',
    coords: [77.6980, 12.9550],
    tier: 'Surrounding Area',
    tierCode: 'network',
    color: '#c084fc',
    benefitScore: 89,
    timeSavedMin: 36,
    commuteRoad: '58 mins',
    commuteMetro: '22 mins',
    commuterCount: '220,000',
    modalShift: '43.0%',
    networkLink: 'Outer Ring Road North Corridor Integration',
    description: 'Located just north of the Bellandur terminus; resolves the notorious Marathahalli flyover crawl and integrates commuters heading towards Whitefield.'
  }
];

const CORRIDOR_PRESETS = [
  { name: 'Bellandur (Phase-2A)', coords: [77.6974, 12.9279] as [number, number], tag: 'Tech Spine' },
  { name: 'Marathahalli Bridge', coords: [77.6980, 12.9550] as [number, number], tag: 'East Hub' },
  { name: 'Kadubeesanahalli', coords: [77.6910, 12.9360] as [number, number], tag: 'Cessna Park' },
  { name: 'Carmelaram / Sarjapur', coords: [77.7120, 12.9080] as [number, number], tag: 'Wipro SEZ' },
  { name: 'HSR 14th Main', coords: [77.6435, 12.9115] as [number, number], tag: 'Sector-1' },
];

const BUFFER_PRESETS = [
  { radius: 1.0, label: '1.0 km', desc: 'Walkable' },
  { radius: 1.5, label: '1.5 km', desc: 'Feeder' },
  { radius: 2.0, label: '2.0 km', desc: 'Standard' },
  { radius: 3.0, label: '3.0 km', desc: 'Extended' },
];

function CyanToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`w-8 h-4.5 rounded-full p-0.5 cursor-pointer transition-colors duration-200 flex items-center shrink-0 ${
        checked ? 'bg-[#00f5d4]' : 'bg-[#21252e]'
      }`}
    >
      <div 
        className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-3.5' : 'translate-x-0'
        }`}
      />
    </div>
  );
}

export default function Dashboard() {
  // Placement coordinates
  const [targetCoords, setTargetCoords] = useState<[number, number] | null>([77.6974, 12.9279]);
  const [inputLat, setInputLat] = useState('12.9279');
  const [inputLng, setInputLng] = useState('77.6974');
  const [activeFilters, setActiveFilters] = useState<string[]>(['corporate', 'hospital', 'education', 'civic']);
  
  // Real-time POI stats inside the catchment buffer
  const [bufferStats, setBufferStats] = useState<{
    total: number;
    byCategory: { corporate: number; hospital: number; education: number; civic: number };
  }>({
    total: 135,
    byCategory: { corporate: 70, hospital: 44, education: 20, civic: 1 }
  });

  // Layer Visibility Toggle Keys (Personalize & Optimize)
  const [showBenefitedAreas, setShowBenefitedAreas] = useState<boolean>(true);
  const [showCatchmentBuffer, setShowCatchmentBuffer] = useState<boolean>(true);
  const [showMetroLines, setShowMetroLines] = useState<boolean>(true);
  const [showAreaLabels, setShowAreaLabels] = useState<boolean>(true);
  const [bufferRadiusKm, setBufferRadiusKm] = useState<number>(2.0);

  // Simulation & Demand Options
  const [showCongestion, setShowCongestion] = useState<boolean>(true);
  const [showModalShift, setShowModalShift] = useState<boolean>(true);
  const [showLiveTelemetry, setShowLiveTelemetry] = useState<boolean>(true);

  // Benefited Areas States
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [focusedAreaCoords, setFocusedAreaCoords] = useState<[number, number] | null>(null);
  const [areaSortBy, setAreaSortBy] = useState<'timeSaved' | 'relief' | 'commuters'>('timeSaved');

  // Sidebar Controls
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tools' | 'areas' | 'pois' | 'optimize'>('tools');
  const [poiSearchQuery, setPoiSearchQuery] = useState<string>('');

  const selectedArea = BENEFITED_AREAS.find(a => a.id === selectedAreaId) || null;

  // Live Corridor Analytics via Turf
  const corridorDistanceKm = useMemo(() => {
    if (!targetCoords) return 0;
    try {
      return turf.distance(turf.point(SILK_BOARD_COORDS), turf.point(targetCoords), { units: 'kilometers' });
    } catch {
      return 0;
    }
  }, [targetCoords]);

  const estTransitTimeMin = useMemo(() => {
    if (corridorDistanceKm <= 0) return 0;
    return Math.max(1, Math.round((corridorDistanceKm / 35) * 60));
  }, [corridorDistanceKm]);

  const estRoadCommuteMin = useMemo(() => {
    if (corridorDistanceKm <= 0) return 0;
    return Math.round(estTransitTimeMin * 3.4);
  }, [estTransitTimeMin, corridorDistanceKm]);

  const sortedAreas = useMemo(() => {
    const list = [...BENEFITED_AREAS];
    if (areaSortBy === 'timeSaved') {
      return list.sort((a, b) => b.timeSavedMin - a.timeSavedMin);
    }
    if (areaSortBy === 'relief') {
      return list.sort((a, b) => b.benefitScore - a.benefitScore);
    }
    if (areaSortBy === 'commuters') {
      return list.sort((a, b) => parseInt(b.commuterCount.replace(/,/g, '')) - parseInt(a.commuterCount.replace(/,/g, '')));
    }
    return list;
  }, [areaSortBy]);

  const handlePlotClick = () => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setTargetCoords([lng, lat]);
    }
  };

  const handleMapClick = (coords: [number, number]) => {
    setInputLng(coords[0].toFixed(4));
    setInputLat(coords[1].toFixed(4));
    setTargetCoords(coords);
  };

  const toggleFilter = (cat: string) => {
    setActiveFilters(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleSelectArea = (area: BenefitedAreaInfo) => {
    if (selectedAreaId === area.id) {
      setSelectedAreaId(null);
      setFocusedAreaCoords(null);
    } else {
      setSelectedAreaId(area.id);
      setFocusedAreaCoords(area.coords);
    }
  };

  const handleSimulateToArea = (area: BenefitedAreaInfo) => {
    setTargetCoords(area.coords);
    setInputLat(area.coords[1].toFixed(4));
    setInputLng(area.coords[0].toFixed(4));
  };

  const handlePresetSelect = (preset: typeof CORRIDOR_PRESETS[0]) => {
    setTargetCoords(preset.coords);
    setInputLng(preset.coords[0].toFixed(4));
    setInputLat(preset.coords[1].toFixed(4));
  };

  const handleResetDefaults = () => {
    setTargetCoords([77.6974, 12.9279]);
    setInputLat('12.9279');
    setInputLng('77.6974');
    setBufferRadiusKm(2.0);
    setShowBenefitedAreas(true);
    setShowCatchmentBuffer(true);
    setShowMetroLines(true);
    setShowAreaLabels(true);
    setActiveFilters(['corporate', 'hospital', 'education', 'civic']);
    setSelectedAreaId(null);
    setFocusedAreaCoords(null);
  };

  const handleResetView = () => {
    setSelectedAreaId(null);
    // Use exact BENGALURU_OVERVIEW_CENTER so flyTo isOverview check matches
    setFocusedAreaCoords([77.6500, 12.9350]);
  };

  return (
    <div className="relative w-screen h-screen flex overflow-hidden bg-background select-none">
      
      {/* BACKGROUND MAP */}
      <div className="absolute inset-0 z-0">
        <MapCanvas 
          targetCoords={targetCoords} 
          onMapClick={handleMapClick} 
          activePOIFilters={activeFilters}
          showBenefitedAreas={showBenefitedAreas}
          showCatchmentBuffer={showCatchmentBuffer}
          showMetroLines={showMetroLines}
          showAreaLabels={showAreaLabels}
          bufferRadiusKm={bufferRadiusKm}
          focusedAreaCoords={focusedAreaCoords}
          onBufferStatsChange={setBufferStats}
          onAreaSelect={(props) => {
            const match = BENEFITED_AREAS.find(a => a.name.toLowerCase() === props.name?.toLowerCase());
            if (match) {
              setSelectedAreaId(match.id);
            }
          }}
        />
      </div>

      {/* 68px LEFT VERTICAL RAIL (STANDARDIZED) */}
      <aside className="relative z-30 w-17 flex flex-col items-center border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl py-4 h-full shrink-0">
        <div className="w-10 h-10 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center mb-6 shadow-sm">
          <MapPin className="text-primary size-5" />
        </div>
        <nav className="flex flex-col gap-4">
          <Link href="/data" title="Data Ingestion & Synthesis Studio">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={motionSprings.snappy} className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Database className="size-5" />
            </motion.button>
          </Link>
          
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={motionSprings.snappy} className="p-2.5 rounded-lg text-primary bg-primary/10 transition-colors border border-primary/20">
            <TrendingUp className="size-5" />
          </motion.button>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={motionSprings.snappy} className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Zap className="size-5" />
          </motion.button>

          <Link href="/agents" title="Autonomous Multi-Agent Swarm Intelligence">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.94 }} 
              transition={motionSprings.snappy} 
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center group"
            >
              <BotLogo className="size-5.5" isActive={false} />
            </motion.button>
          </Link>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={motionSprings.snappy} className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <GitBranch className="size-5" />
          </motion.button>
        </nav>
      </aside>

      {/* FLOATING HUD CONTROL SIDEBAR (MATCHING USER REFERENCE) */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.aside
            initial={{ opacity: 0, x: -16, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.96 }}
            transition={motionSprings.smooth}
            className="absolute top-4 left-[84px] bottom-4 z-20 w-[280px] max-h-[calc(100vh-2rem)] flex flex-col bg-[#0c0e12]/96 backdrop-blur-2xl border border-white/[0.05] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-3.5 gap-2 pointer-events-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none"
          >
            {/* 1. HEADER (VOLTAGE LEVELS STYLE) */}
            <div className="flex items-center justify-between px-1.5 pt-0.5 shrink-0">
              <span className="text-[12.5px] font-medium text-[#d9dee8] tracking-wide">
                Infrastructure POIs
              </span>
              <button 
                onClick={() => setSidebarCollapsed(true)} 
                className="p-1 rounded-lg text-[#6e7687] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronLeft className="size-4" />
              </button>
            </div>

            {/* 2. POI CATEGORY PILLS (6 ITEMS) */}
            <div className="flex flex-col gap-1 shrink-0">
              {[
                { id: 'corporate', label: 'Tech Parks & SEZ', dotBg: 'bg-[#22d3ee]', isChecked: activeFilters.includes('corporate'), toggle: () => toggleFilter('corporate') },
                { id: 'metro', label: 'Metro Stations & Hubs', dotBg: 'bg-[#10b981]', isChecked: showMetroLines, toggle: () => setShowMetroLines(prev => !prev) },
                { id: 'hospital', label: 'Healthcare & Hosps', dotBg: 'bg-[#ef4444]', isChecked: activeFilters.includes('hospital'), toggle: () => toggleFilter('hospital') },
                { id: 'education', label: 'Higher Education', dotBg: 'bg-[#f59e0b]', isChecked: activeFilters.includes('education'), toggle: () => toggleFilter('education') },
                { id: 'civic', label: 'Civic & Public Admin', dotBg: 'bg-[#6366f1]', isChecked: activeFilters.includes('civic'), toggle: () => toggleFilter('civic') },
                { id: 'labels', label: 'Centroid Zone Labels', dotBg: 'bg-[#c084fc]', isChecked: showAreaLabels, toggle: () => setShowAreaLabels(prev => !prev) },
              ].map(cat => (
                <div
                  key={cat.id}
                  onClick={cat.toggle}
                  className="bg-[#14161b] hover:bg-[#181b22] border border-white/[0.025] rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${cat.dotBg} ${cat.isChecked ? 'opacity-100 shadow-[0_0_6px_currentColor]' : 'opacity-30'} shrink-0 transition-opacity`} />
                    <span className={`text-[11.5px] truncate transition-colors ${cat.isChecked ? 'text-[#c4cad6] font-medium' : 'text-[#5d6575]'}`}>{cat.label}</span>
                  </div>
                  <CyanToggleSwitch checked={cat.isChecked} onChange={cat.toggle} />
                </div>
              ))}
            </div>

            {/* 3. OPTION SECTION */}
            <div className="pt-1.5 px-1.5 shrink-0">
              <span className="text-[10.5px] font-medium text-[#6e7687] lowercase tracking-wider">option</span>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              <div
                onClick={() => setShowCatchmentBuffer(prev => !prev)}
                className="bg-[#14161b] hover:bg-[#181b22] border border-white/[0.025] rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="text-[11.5px] text-[#c4cad6] font-medium">Show Buffer Zone</span>
                <CyanToggleSwitch checked={showCatchmentBuffer} onChange={() => setShowCatchmentBuffer(prev => !prev)} />
              </div>

              <div
                onClick={() => setShowBenefitedAreas(prev => !prev)}
                className="bg-[#14161b] hover:bg-[#181b22] border border-white/[0.025] rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="text-[11.5px] text-[#c4cad6] font-medium">Show Benefited Areas</span>
                <CyanToggleSwitch checked={showBenefitedAreas} onChange={() => setShowBenefitedAreas(prev => !prev)} />
              </div>
            </div>

            {/* 4. CORRIDOR MODEL (BUFFER RADIUS EVALUATION) */}
            <div className="pt-1.5 px-1.5 shrink-0">
              <span className="text-[10.5px] font-medium text-[#6e7687] lowercase tracking-wider">corridor model</span>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              {[
                { radius: 1.0, label: '1.0km Walkshed Reach' },
                { radius: 2.0, label: '2.0km Transit Catchment' },
                { radius: 3.0, label: '3.0km Regional Feeder' },
              ].map(item => {
                const isActive = bufferRadiusKm === item.radius;
                return (
                  <div
                    key={item.radius}
                    onClick={() => setBufferRadiusKm(item.radius)}
                    className="bg-[#14161b] hover:bg-[#181b22] border border-white/[0.025] rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span className={`text-[11.5px] truncate transition-colors ${isActive ? 'text-[#c4cad6] font-medium' : 'text-[#6e7687]'}`}>
                      {item.label}
                    </span>
                    <CyanToggleSwitch checked={isActive} onChange={() => setBufferRadiusKm(item.radius)} />
                  </div>
                );
              })}
            </div>

            {/* 5. SIMULATION & DEMAND SECTION */}
            <div className="pt-1.5 px-1.5 shrink-0">
              <span className="text-[10.5px] font-medium text-[#6e7687] lowercase tracking-wider">simulation & demand</span>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              <div
                onClick={() => setShowCongestion(prev => !prev)}
                className="bg-[#14161b] hover:bg-[#181b22] border border-white/[0.025] rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="text-[11.5px] text-[#c4cad6] font-medium">Peak Road Congestion</span>
                <CyanToggleSwitch checked={showCongestion} onChange={() => setShowCongestion(prev => !prev)} />
              </div>

              <div
                onClick={() => setShowModalShift(prev => !prev)}
                className="bg-[#14161b] hover:bg-[#181b22] border border-white/[0.025] rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="text-[11.5px] text-[#c4cad6] font-medium">Modal Shift Relief (48%)</span>
                <CyanToggleSwitch checked={showModalShift} onChange={() => setShowModalShift(prev => !prev)} />
              </div>

              <div
                onClick={() => setShowLiveTelemetry(prev => !prev)}
                className="bg-[#14161b] hover:bg-[#181b22] border border-white/[0.025] rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="text-[11.5px] text-[#c4cad6] font-medium">Live Corridor Telemetry</span>
                <CyanToggleSwitch checked={showLiveTelemetry} onChange={() => setShowLiveTelemetry(prev => !prev)} />
              </div>
            </div>

            {/* 6. GRID REGIONS SECTION */}
            <div className="pt-1.5 px-1.5 shrink-0">
              <span className="text-[10.5px] font-medium text-[#6e7687] lowercase tracking-wider">Grid Regions</span>
            </div>

            <div className="flex flex-col gap-0.5 shrink-0">
              {BENEFITED_AREAS.map(area => {
                const isSelected = selectedAreaId === area.id;
                if (isSelected) {
                  return (
                    <div
                      key={area.id}
                      onClick={() => handleSelectArea(area)}
                      className="bg-[#09221f] border border-[#00f5d4]/25 rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-[#00f5d4] shrink-0 shadow-[0_0_6px_#00f5d4]" />
                        <span className="text-[11.5px] font-medium text-[#00f5d4] truncate">{area.name}</span>
                      </div>
                      <span className="text-[10.5px] font-medium text-[#00f5d4] tracking-wide shrink-0">Loaded</span>
                    </div>
                  );
                }
                return (
                  <div
                    key={area.id}
                    onClick={() => handleSelectArea(area)}
                    className="hover:bg-[#14161b] rounded-xl px-3 py-1.5 flex items-center gap-2.5 cursor-pointer transition-colors group"
                  >
                    <span 
                      className="w-2 h-2 rounded-full shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" 
                      style={{ backgroundColor: area.color }}
                    />
                    <span className="text-[11.5px] text-[#7e8798] group-hover:text-[#c4cad6] transition-colors truncate">{area.name}</span>
                  </div>
                );
              })}

              {/* Reset View Button */}
              <button
                onClick={handleResetView}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-[#6e7687] hover:text-[#c4cad6] transition-colors cursor-pointer w-fit mt-1"
              >
                <MapPin className="size-3.5 text-[#6e7687]" />
                <span>Reset view</span>
              </button>
            </div>

            {/* 7. SUMMARY FOOTER (LOADED) */}
            <div className="border-t border-white/[0.04] my-1 shrink-0" />

            <div className="px-1.5 flex flex-col gap-0.5 pb-1 shrink-0">
              <span className="text-[11.5px] font-medium text-[#c4cad6]">Loaded</span>
              <span className="text-[11px] text-[#7a8294] font-sans truncate">
                {targetCoords && Math.abs(targetCoords[0] - 77.6974) < 0.01 ? 'Silk Board → Bellandur Alignment' : `${corridorDistanceKm.toFixed(1)} km Candidate Alignment`}
              </span>
              <span className="text-[11px] text-[#00f5d4] font-medium">
                {bufferStats.total} mapped on map
              </span>
              <span className="text-[10px] text-[#555d6e] font-mono">
                Location DB: 7 Transit Zones
              </span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* FLOATING EXPAND BUTTON (WHEN SIDEBAR IS COLLAPSED) */}
      {sidebarCollapsed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setSidebarCollapsed(false)}
          className="absolute top-4 left-[84px] z-30 bg-[#0c0e12]/95 backdrop-blur-xl border border-white/[0.06] px-3 py-2 rounded-2xl shadow-2xl hover:bg-[#14161b] text-[#00f5d4] transition-colors flex items-center gap-2 text-xs font-semibold pointer-events-auto cursor-pointer"
        >
          <ChevronRight className="size-4" />
          <span>POIs & Options</span>
        </motion.button>
      )}

      {/* MAIN CONTENT OVERLAYS */}
      <main className="relative z-10 flex-1 flex flex-col pointer-events-none">
        
        {/* TOP TELEMETRY NAVBAR */}
        <header className="h-14 border-b border-border bg-background/85 backdrop-blur-xl flex items-center justify-between px-6 pointer-events-auto">
          <div className="flex items-center gap-3">
            {/* CAPSULE BUTTONS MATCHING SCREENSHOT: [ BROWSE ] [ MAP ] [ GRAPH ] */}
            <div className="flex items-center gap-1.5 bg-[#0e1116] p-1 rounded-full border border-white/[0.08]">
              <Link href="/data">
                <button className="px-3 py-1 rounded-full text-xs font-medium text-[#8e95a5] hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer">
                  <Database className="size-3.5" />
                  <span>Browse</span>
                </button>
              </Link>
              <button className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00f5d4]/15 text-[#00f5d4] border border-[#00f5d4]/30 flex items-center gap-1.5 shadow-sm cursor-pointer">
                <MapPin className="size-3.5" />
                <span>Map</span>
              </button>
              <Link href="/agents">
                <button className="px-3 py-1 rounded-full text-xs font-medium text-[#8e95a5] hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer">
                  <GitBranch className="size-3.5" />
                  <span>Graph</span>
                </button>
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs ml-3 font-mono">
              <span className="text-muted-foreground">Silk Board → {targetCoords && Math.abs(targetCoords[0] - 77.6974) < 0.01 ? 'Bellandur (Phase-2A)' : 'Custom Terminus'}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-[#00f5d4] font-semibold">{bufferRadiusKm.toFixed(1)}km Buffer: {bufferStats.total} POIs</span>
            </div>
          </div>

          {showLiveTelemetry && (
            <div className="flex items-center gap-6 font-mono tabular-nums text-xs">
              {showCongestion && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  Rush-Hour Road Speed: <span className="text-destructive font-bold">13.9 km/h</span>
                </div>
              )}
              {showModalShift && (
                <div className="text-muted-foreground hidden md:block">
                  Annual Congestion Loss: <span className="text-amber-400 font-bold">₹20,000 Cr</span>
                </div>
              )}
            </div>
          )}
        </header>

        {/* WORKSPACE & DOSSIER OVERLAYS */}
        <div className="flex-1 relative flex overflow-hidden">
          
          {/* FLOATING RIGHT PANEL: SELECTED BENEFITED AREA DOSSIER (WHEN AN AREA IS SELECTED) */}
          <AnimatePresence>
            {selectedArea && (
              <motion.div
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 40, opacity: 0 }}
                transition={motionSprings.smooth}
                className="absolute top-6 right-6 w-96 bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-2xl pointer-events-auto z-20 flex flex-col gap-4"
              >
                {/* DOSSIER HEADER */}
                <div className="flex items-start justify-between border-b border-border pb-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground font-sans">{selectedArea.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-primary/10 text-primary border border-primary/20">
                        {selectedArea.tier}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono mt-0.5">
                      Transit Impact Score: <strong className="text-primary">{selectedArea.benefitScore}/100</strong>
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedAreaId(null);
                      setFocusedAreaCoords(null);
                    }}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* COMMUTE DELTA GRID */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3 text-primary" /> Commute Velocity Comparison
                  </span>
                  <div className="grid grid-cols-3 gap-2 bg-secondary/40 p-3 rounded-xl border border-border/60 text-center">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-sans block">Peak Road</span>
                      <span className="text-sm font-bold font-mono text-rose-400">{selectedArea.commuteRoad}</span>
                    </div>
                    <div className="border-x border-border/60">
                      <span className="text-[10px] text-muted-foreground font-sans block">Via Metro</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">{selectedArea.commuteMetro}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-sans block">Time Saved</span>
                      <span className="text-sm font-bold font-mono text-primary">-{selectedArea.timeSavedMin}m</span>
                    </div>
                  </div>
                </div>

                {/* CATCHMENT & MODAL SHIFT */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/40 flex flex-col">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Users className="size-3 text-sky-400" /> Beneficiaries
                    </span>
                    <span className="text-sm font-bold font-mono text-foreground mt-0.5">
                      {selectedArea.commuterCount}
                    </span>
                    <span className="text-[10px] text-muted-foreground">daily commuters</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/40 flex flex-col">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="size-3 text-emerald-400" /> Modal Shift
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                      {selectedArea.modalShift}
                    </span>
                    <span className="text-[10px] text-muted-foreground">away from cars/cabs</span>
                  </div>
                </div>

                {/* NETWORK LINK */}
                <div className="text-xs bg-background/50 p-3 rounded-xl border border-border/60 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Network Feeder Integration:</span>
                  <span className="font-medium text-foreground text-xs leading-snug">{selectedArea.networkLink}</span>
                </div>

                {/* DESCRIPTION */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedArea.description}
                </p>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2 pt-1 border-t border-border">
                  <button
                    onClick={() => handleSimulateToArea(selectedArea)}
                    className="flex-1 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <span>Simulate Route to Silk Board</span>
                    <ArrowUpRight className="size-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

    </div>
  );
}

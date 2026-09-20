'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Play,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ExternalLink,
  Copy,
  Check,
  Search,
  Database,
  Terminal,
  Building2,
  Train,
  ShieldAlert,
  MapPin,
  RefreshCw,
  FolderDown,
  ChevronRight,
  Code2,
  Monitor,
  Radio,
  Activity,
  Cpu,
  Sparkles,
  Coins,
  CheckCheck,
  SplitSquareVertical,
} from 'lucide-react';
import { SidebarRail } from '../../../components/navigation/SidebarRail';
import { motionSprings } from '../../../lib/motion';
import { cn } from '../../../lib/utils';
import { HarvestedDatasetItem } from '../api/collector/datasets/route';

interface CityProfile {
  name: string;
  slug: string;
  state: string;
  municipalBody: string;
  metroAgency: string;
  techCorridors: string;
  regulator: string;
  bufferRules: string;
  keyWaterbodies: string;
  recommendedPortals: string;
  bbox: string;
  defaultCorridor: string;
}

const PRESET_CITIES: CityProfile[] = [
  {
    name: 'Hyderabad',
    slug: 'hyderabad',
    state: 'Telangana',
    municipalBody: 'Greater Hyderabad Municipal Corporation (GHMC / HMDA)',
    metroAgency: 'Hyderabad Metro Rail (HMR / HMRL)',
    techCorridors: 'Cyberabad, Hitec City, Gachibowli, Financial District, Kokapet Neopolis, Mindspace',
    regulator: 'HYDRAA (Hyderabad Disaster Response and Asset Protection Agency)',
    bufferRules: 'Mandatory 30m Full Tank Level (FTL) lake setbacks & 50m Musi river corridor',
    keyWaterbodies: 'Durgam Cheruvu, Khajaguda Lake, Malkam Cheruvu, Kokapet Cheruvu, Osmansagar',
    recommendedPortals: 'OpenCity.in (https://opencity.in/category/hyderabad), data.telangana.gov.in',
    bbox: '[17.34, 78.30, 17.52, 78.55]',
    defaultCorridor: 'Raidurg to Kokapet Neopolis via Financial District',
  },
  {
    name: 'Bengaluru',
    slug: 'bengaluru',
    state: 'Karnataka',
    municipalBody: 'Bruhat Bengaluru Mahanagara Palike (BBMP / BDA)',
    metroAgency: 'Namma Metro (BMRCL Phase 1, 2A/2B, 3)',
    techCorridors: 'Outer Ring Road (ORR), Whitefield, Electronic City, Manyata Tech Park, Bellandur Ecoworld',
    regulator: 'KTFD (Karnataka Tank Conservation & Development Authority)',
    bufferRules: 'Statutory 30m lake setbacks and 50m Rajakaluve primary stormwater drain buffers',
    keyWaterbodies: 'Bellandur Lake, Varthur Lake, Agara Lake, Hebbal Lake, Ulsoor Lake',
    recommendedPortals: 'OpenCity.in (https://opencity.in/category/bengaluru), karnataka.data.gov.in',
    bbox: '[12.82, 77.48, 13.12, 77.78]',
    defaultCorridor: 'Silk Board to Sarjapur Road via Agara & Bellandur',
  },
  {
    name: 'Pune',
    slug: 'pune',
    state: 'Maharashtra',
    municipalBody: 'Pune Municipal Corporation (PMC / PCMC / PMRDA)',
    metroAgency: 'MahaMetro Pune & PMRDA Line 3',
    techCorridors: 'Hinjawadi Rajiv Gandhi Infotech Park (Phases 1-3), Kharadi EON Free Zone, Magarpatta Cybercity',
    regulator: 'Maharashtra Irrigation Department (Water Resources)',
    bufferRules: 'Mula-Mutha River Blue & Red flood-line statutory prohibited development zones',
    keyWaterbodies: 'Mula River, Mutha River, Pashan Lake, Katraj Lake, Khadakwasla Dam catchment',
    recommendedPortals: 'opendata.punecorporation.org, opencity.in/category/pune',
    bbox: '[18.42, 73.72, 18.66, 73.98]',
    defaultCorridor: 'Hinjawadi Infotech Park to Shivajinagar Junction',
  },
  {
    name: 'Chennai',
    slug: 'chennai',
    state: 'Tamil Nadu',
    municipalBody: 'Greater Chennai Corporation (GCC / CMDA)',
    metroAgency: 'Chennai Metro Rail Limited (CMRL Phase 1 & Phase 2)',
    techCorridors: 'Old Mahabalipuram Road (OMR IT Expressway), Tidel Park, Siruseri SIPCOT, Porur DLF',
    regulator: 'Coastal Regulation Zone (CRZ) Authority & Tamil Nadu Wetland Authority',
    bufferRules: '500m CRZ coastal boundary & Pallikaranai Marshland strict conservation buffer',
    keyWaterbodies: 'Pallikaranai Marsh, Buckingham Canal, Adyar River, Cooum River, Porur Lake',
    recommendedPortals: 'opencity.in/category/chennai, data.gov.in',
    bbox: '[12.88, 80.12, 13.20, 80.32]',
    defaultCorridor: 'OMR IT Expressway (Tidel Park to Siruseri SIPCOT)',
  },
  {
    name: 'Mumbai',
    slug: 'mumbai',
    state: 'Maharashtra',
    municipalBody: 'Brihanmumbai Municipal Corporation (BMC / MMRDA)',
    metroAgency: 'Maha Mumbai Metro (Lines 1 to 14)',
    techCorridors: 'Bandra-Kurla Complex (BKC), Powai Hiranandani, Lower Parel, Mindspace Malad, Airoli',
    regulator: 'Maharashtra Coastal Zone Management Authority (MCZMA)',
    bufferRules: 'CRZ intertidal protection zones & Sanjay Gandhi National Park 1km Eco-Sensitive Zone',
    keyWaterbodies: 'Mithi River, Powai Lake, Vihar Lake, Thane Creek Flamingo Sanctuary',
    recommendedPortals: 'opendata.mcgm.gov.in, opencity.in/category/mumbai',
    bbox: '[18.90, 72.78, 19.30, 73.05]',
    defaultCorridor: 'BKC to Thane/Navi Mumbai via Eastern Freeway',
  },
  {
    name: 'Delhi-NCR',
    slug: 'delhi',
    state: 'Delhi / Haryana',
    municipalBody: 'Municipal Corporation of Delhi (MCD / DDA / GMDA)',
    metroAgency: 'Delhi Metro Rail Corporation (DMRC Lines 1-10 + Rapid Metro)',
    techCorridors: 'Gurugram CyberCity, Golf Course Road, Noida Sector 62/125, Okhla Industrial Area',
    regulator: 'Yamuna River Waterfront & National Green Tribunal (NGT)',
    bufferRules: '300m active Yamuna riverbed floodway prohibition & Aravalli Biodiversity Ridge setback',
    keyWaterbodies: 'Yamuna River, Najafgarh Drain, Bhalswa Lake, Hauz Khas Lake',
    recommendedPortals: 'delhi.gov.in open data, opencity.in',
    bbox: '[28.40, 76.90, 28.88, 77.35]',
    defaultCorridor: 'Gurugram CyberCity to Noida Electronic City via Yellow & Blue Lines',
  },
];

function buildParametricPrompt(profile: CityProfile, customCorridor?: string): string {
  const corridor = customCorridor || profile.defaultCorridor;
  return `You are the Autonomous Geospatial Dataset Collector Cloud Agent for DYAD (Urban Transit Evaluation Platform).

MISSION:
Your task is to autonomously search, locate, download, and verify real geospatial datasets for the city: '${profile.name}'.
Focus particularly on the corridor/region: '${corridor}'.
All downloaded files must be saved directly into the workspace files.

----------------------------------------------------------------------
TARGET CITY CONTEXT:
----------------------------------------------------------------------
- City Name: ${profile.name} (${profile.state})
- Municipal Authority: ${profile.municipalBody}
- Key Employment Nodes: ${profile.techCorridors}
- Mass Transit Agency: ${profile.metroAgency}
- Key Water Bodies: ${profile.keyWaterbodies}
- Environmental Regulations: ${profile.regulator} (${profile.bufferRules})
- Recommended Search Portals: ${profile.recommendedPortals}
- Spatial Query Bounding Box: ${profile.bbox}

----------------------------------------------------------------------
MANDATORY 5-PILLAR COLLECTION DIRECTIVES:
----------------------------------------------------------------------
Acquire at least 1 verified dataset for each of the 5 pillars below:

1. PILLAR 1: DEMOGRAPHICS & SPATIAL EQUITY
   - Search: "${profile.name} municipal ward boundary geojson", "${profile.name} ward census population", "${profile.name} urban slums geojson".
   - Sources: OpenCity.in, Municipal GIS portals, State open data repository.
   - Format: .geojson or .csv with ward names and population numbers.

2. PILLAR 2: ECONOMIC & EMPLOYMENT HUBS (WORKFORCE POIs)
   - Search: Major tech parks, SEZs, corporate offices, and commercial hubs in ${profile.name}.
   - Query Overpass Turbo (https://overpass-turbo.eu/) for ${profile.name} bounding box:
     node["office"]; way["office"]; (Export as GeoJSON).
   - Format: .geojson containing name, workforce/capacity, lat, lon.

3. PILLAR 3: MOBILITY & CONGESTION
   - Search: ${profile.metroAgency} existing and proposed station coordinates and route shapefiles.
   - Search TomTom Traffic Index for ${profile.name} (https://www.tomtom.com/traffic-index/) to extract peak-hour arterial road commute speeds.
   - Format: .geojson, .csv, or structured .json.

4. PILLAR 4: ECOLOGICAL RISK & STATUTORY WATERBODY BUFFERS
   - Search: Cadastral lake boundaries, tanks, river floodplains, and stormwater drains in ${profile.name}.
   - Key Regulatory Requirement: Map water bodies subject to ${profile.bufferRules}.
   - Format: .geojson with polygon boundaries.

5. PILLAR 5: MAP CANVAS BASELINE VISUALIZER
   - Search: Clean boundary GeoJSON of ${profile.name} municipal limits.
   - Format: .geojson.

----------------------------------------------------------------------
BROWSER EXECUTION & VERIFICATION RULES:
----------------------------------------------------------------------
1. Autonomous Discovery: Use search engines or direct portal navigation (OpenCity, Overpass Turbo, GitHub repos) to locate direct download links.
2. Formats: Accept only .geojson, .csv, or .json.
3. Metadata Companion: For each downloaded dataset, record companion metadata with city, pillar, source URL, geometry type, and timestamp.
4. Completion: Conclude once all 5 pillars have verified datasets in workspace.`;
}

interface StreamEvent {
  id: string;
  type: 'status' | 'reasoning' | 'action' | 'harvest' | 'insight' | 'complete' | 'telemetry' | 'error';
  timestamp: string;
  data: any;
}

interface ThoughtState {
  thought: string;
  pillar: string;
  step: number;
  timestamp: string;
}

interface ActionState {
  tool: string;
  verb: string;
  detail: string;
  code?: string;
  output?: string;
  timestamp: string;
}

export default function CollectorStudioPage() {
  // 1. City selection
  const [selectedCity, setSelectedCity] = useState<CityProfile>(PRESET_CITIES[0]);
  const [focusCorridor, setFocusCorridor] = useState<string>(PRESET_CITIES[0].defaultCorridor);
  const [promptText, setPromptText] = useState<string>(() => buildParametricPrompt(PRESET_CITIES[0]));
  const [isPromptModified, setIsPromptModified] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // 2. Execution & Live Telemetry State
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [agentPhase, setAgentPhase] = useState<string>('IDLE');
  const [runId, setRunId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [liveViewUrl, setLiveViewUrl] = useState<string | null>(null);

  // View Layout Modes: 'split' | 'video' | 'stream' | 'docs'
  const [activeTab, setActiveTab] = useState<'split' | 'video' | 'stream' | 'docs'>('split');
  const [telemetryFilter, setTelemetryFilter] = useState<'all' | 'reasoning' | 'action' | 'harvest'>('all');

  // Real-time Agent HUD Trackers
  const [latestThought, setLatestThought] = useState<ThoughtState | null>(null);
  const [thoughtChain, setThoughtChain] = useState<ThoughtState[]>([]);
  const [showAllThoughts, setShowAllThoughts] = useState<boolean>(false);
  const [latestAction, setLatestAction] = useState<ActionState | null>(null);
  const [sessionMetrics, setSessionMetrics] = useState({
    totalCostUsd: '$0.00',
    totalTokens: 0,
    stepsCount: 0,
    activeModel: 'Browser Use Cloud V4 / GPT-5.6 Luna',
  });
  const [recentHarvestedFiles, setRecentHarvestedFiles] = useState<string[]>([]);

  // 3. Harvested Datasets State
  const [datasets, setDatasets] = useState<HarvestedDatasetItem[]>([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState<boolean>(true);
  const [activePillarFilter, setActivePillarFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stagingFile, setStagingFile] = useState<string | null>(null);
  const [stagedSuccess, setStagedSuccess] = useState<string | null>(null);

  // Terminal scroll container ref - ONLY scrolls internal terminal, NEVER window/page
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelCollection = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsCollecting(false);
    setAgentPhase('CANCELLED');
    setStreamEvents((prev) => [
      ...prev,
      {
        id: `cancel-${Date.now()}`,
        type: 'status',
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        data: { message: 'Cloud Agent session stopped by operator.' },
      },
    ]);
  };

  // Load datasets when city changes
  useEffect(() => {
    fetchDatasets(selectedCity.slug);
  }, [selectedCity]);

  // Scroll ONLY the internal terminal container, NEVER the window or page
  useEffect(() => {
    if (terminalContainerRef.current) {
      const el = terminalContainerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [streamEvents]);

  const handleCityChange = (city: CityProfile) => {
    setSelectedCity(city);
    setFocusCorridor(city.defaultCorridor);
    const newPrompt = buildParametricPrompt(city, city.defaultCorridor);
    setPromptText(newPrompt);
    setIsPromptModified(false);
  };

  const handleCorridorChange = (corridor: string) => {
    setFocusCorridor(corridor);
    const newPrompt = buildParametricPrompt(selectedCity, corridor);
    setPromptText(newPrompt);
    setIsPromptModified(true);
  };

  const resetPrompt = () => {
    const defaultP = buildParametricPrompt(selectedCity, focusCorridor);
    setPromptText(defaultP);
    setIsPromptModified(false);
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const fetchDatasets = async (citySlug: string) => {
    setIsLoadingDatasets(true);
    try {
      const res = await fetch(`/api/collector/datasets?city=${citySlug}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.datasets)) {
        setDatasets(data.datasets);
      }
    } catch (err) {
      console.error('Failed to fetch datasets:', err);
    } finally {
      setIsLoadingDatasets(false);
    }
  };

  const startDatasetCollection = async () => {
    if (isCollecting) return;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsCollecting(true);
    setStreamEvents([]);
    setAgentPhase('CONNECTING');
    setRunId(null);
    setPreviewUrl(null);
    setLiveViewUrl(null);
    setLatestThought(null);
    setThoughtChain([]);
    setShowAllThoughts(false);
    setLatestAction(null);
    setRecentHarvestedFiles([]);
    setSessionMetrics({
      totalCostUsd: '$0.00',
      totalTokens: 0,
      stepsCount: 0,
      activeModel: 'Browser Use Cloud V4 / GPT-5.6 Luna',
    });

    try {
      const response = await fetch('/api/collector/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: selectedCity.name,
          corridor: focusCorridor,
          prompt: promptText,
        }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = 'message';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            const rawData = line.replace('data:', '').trim();
            if (!rawData) continue;
            try {
              const parsed = JSON.parse(rawData);
              const eventItem: StreamEvent = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: currentEvent as any,
                timestamp: parsed.timestamp || new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                data: parsed,
              };

              setStreamEvents((prev) => [...prev, eventItem]);

              // Update Live Video preview
              if (parsed.liveViewUrl) {
                setLiveViewUrl(parsed.liveViewUrl);
              }
              if (parsed.previewUrl) setPreviewUrl(parsed.previewUrl);
              if (parsed.runId) setRunId(parsed.runId);

              // Update Phase
              if (currentEvent === 'status' && parsed.phase) {
                setAgentPhase(parsed.phase);
              }

              // Update Reasoning Trace & append to full Chain of Thought
              if (currentEvent === 'reasoning') {
                const thoughtObj: ThoughtState = {
                  thought: parsed.thought || '',
                  pillar: parsed.pillar || 'demographics',
                  step: parsed.step || 1,
                  timestamp: eventItem.timestamp,
                };
                setLatestThought(thoughtObj);
                setThoughtChain((prev) => [...prev, thoughtObj]);
                setSessionMetrics((prev) => ({
                  ...prev,
                  stepsCount: Math.max(prev.stepsCount, parsed.step || 1),
                }));
              }

              // Update Action Trace
              if (currentEvent === 'action') {
                setLatestAction({
                  tool: parsed.tool || 'action',
                  verb: parsed.verb || 'EXECUTE',
                  detail: parsed.detail || '',
                  code: parsed.code,
                  output: parsed.output,
                  timestamp: eventItem.timestamp,
                });
              }

              // Update Telemetry & Metrics
              if (currentEvent === 'telemetry') {
                if (parsed.type === 'LLM_METRICS') {
                  setSessionMetrics((prev) => ({
                    ...prev,
                    totalCostUsd: parsed.costUsd || prev.totalCostUsd,
                    totalTokens: prev.totalTokens + (parsed.outputTokens || 0) + (parsed.inputTokens || 0),
                    activeModel: parsed.model || prev.activeModel,
                  }));
                }
              }

              // Update Harvested Files & trigger live refresh
              if (currentEvent === 'harvest') {
                if (parsed.filename) {
                  setRecentHarvestedFiles((prev) => Array.from(new Set([...prev, parsed.filename])));
                }
                fetchDatasets(selectedCity.slug);
              }

              // Complete Event
              if (currentEvent === 'complete') {
                setAgentPhase('COMPLETED');
                fetchDatasets(selectedCity.slug);
              }
            } catch (e) {
              console.error('Error parsing SSE data line:', e);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        setAgentPhase('CANCELLED');
        return;
      }
      console.error('Collection run error:', err);
      setAgentPhase('ERROR');
      setStreamEvents((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: 'error',
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          data: { message: err.message || 'Stream connection terminated unexpectedly.' },
        },
      ]);
    } finally {
      setIsCollecting(false);
      abortControllerRef.current = null;
      fetchDatasets(selectedCity.slug);
    }
  };

  const stageDatasetIntoPipeline = async (dataset: HarvestedDatasetItem) => {
    setStagingFile(dataset.name);
    try {
      const res = await fetch('/api/collector/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citySlug: dataset.citySlug,
          filename: dataset.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStagedSuccess(dataset.name);
        setTimeout(() => setStagedSuccess(null), 3000);
      }
    } catch (e) {
      console.error('Error staging file:', e);
    } finally {
      setStagingFile(null);
    }
  };

  // Filter datasets
  const filteredDatasets = datasets.filter((item) => {
    const matchesPillar = activePillarFilter === 'all' || item.pillar === activePillarFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pillarLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPillar && matchesSearch;
  });

  // Filter telemetry events
  const filteredEvents = streamEvents.filter((evt) => {
    if (telemetryFilter === 'all') return true;
    if (telemetryFilter === 'reasoning') return evt.type === 'reasoning';
    if (telemetryFilter === 'action') return evt.type === 'action';
    if (telemetryFilter === 'harvest') return evt.type === 'harvest';
    return true;
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0E1117] text-slate-100 font-sans antialiased select-none">
      {/* 1. UNIFIED VERTICAL NAVIGATION RAIL */}
      <SidebarRail />

      {/* 2. MAIN COLLECTOR STUDIO CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#0E1117] [scrollbar-width:thin] [scrollbar-color:#1E2633_transparent]">
        {/* HEADER BAR */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-[#0E1117]/95 backdrop-blur-md border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Compass className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] font-bold tracking-tight text-white uppercase">
                  DYAD Autonomous Dataset Collector
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  BROWSER USE CLOUD V4
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                  DEEPSEEK V4.1 FLASH VISION
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                City-parametric geospatial discovery, web navigation, regulatory setback harvesting & verification
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'docs' ? 'split' : 'docs')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-all cursor-pointer shadow-sm',
                activeTab === 'docs'
                  ? 'bg-white/15 border-white/30 text-white font-semibold'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              )}
            >
              <Code2 className="size-3.5" />
              <span>{activeTab === 'docs' ? 'Return to Console' : 'Cloud Architecture'}</span>
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-[11px] font-mono transition-all cursor-pointer group"
            >
              <span>Map Visualizer</span>
              <ChevronRight className="size-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <div className="p-6 flex flex-col gap-6 max-w-[1680px] w-full mx-auto">
          {/* TIER 1: ORCHESTRATION & PARAMETRIC PROMPT CONSOLE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT COLUMN: CITY SELECTOR & SPATIAL DOSSIER (5 COLS) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* City Selection Pills */}
              <div className="p-4 rounded-xl bg-[#161B22] border border-white/[0.08] flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-emerald-400" />
                    <span className="font-mono text-[12px] font-semibold tracking-wide text-slate-200 uppercase">
                      Select Target Metropolis
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {PRESET_CITIES.length} Available Regions
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {PRESET_CITIES.map((city) => {
                    const isSelected = selectedCity.slug === city.slug;
                    return (
                      <motion.button
                        key={city.slug}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={motionSprings.snappy}
                        onClick={() => handleCityChange(city)}
                        className={cn(
                          'flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer',
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-sm shadow-emerald-500/10'
                            : 'bg-black/30 border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={cn('text-[12px] font-semibold', isSelected ? 'text-emerald-300' : 'text-slate-200')}>
                            {city.name}
                          </span>
                          {isSelected && <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        </div>
                        <span className="text-[9.5px] font-mono text-slate-500 truncate w-full mt-0.5">
                          {city.state}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Focus Corridor Input */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.06]">
                  <label className="text-[10.5px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Priority Transit Corridor</span>
                    <span className="text-[9px] text-emerald-400">Parametric Directive</span>
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] focus-within:border-emerald-500/50 transition-all">
                    <MapPin className="size-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={focusCorridor}
                      onChange={(e) => handleCorridorChange(e.target.value)}
                      placeholder="e.g. Raidurg to Kokapet Neopolis via Financial District"
                      className="w-full bg-transparent text-[11px] font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* City Spatial Knowledge Card */}
              <div className="p-4 rounded-xl bg-[#161B22] border border-white/[0.08] flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-cyan-400" />
                    <span className="font-mono text-[12px] font-semibold tracking-wide text-slate-200 uppercase">
                      {selectedCity.name} Spatial Baseline
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    BBOX: {selectedCity.bbox}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-[11px]">
                  {/* Municipal */}
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.04] flex flex-col gap-0.5">
                    <span className="font-mono text-[9.5px] text-slate-500 uppercase">Municipal Authority</span>
                    <span className="font-medium text-slate-200">{selectedCity.municipalBody}</span>
                  </div>

                  {/* Transit */}
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.04] flex flex-col gap-0.5">
                    <span className="font-mono text-[9.5px] text-slate-500 uppercase flex items-center gap-1.5">
                      <Train className="size-3 text-emerald-400" />
                      Rapid Transit Agency
                    </span>
                    <span className="font-medium text-slate-200">{selectedCity.metroAgency}</span>
                  </div>

                  {/* Environmental */}
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.04] flex flex-col gap-0.5">
                    <span className="font-mono text-[9.5px] text-slate-500 uppercase flex items-center gap-1.5">
                      <ShieldAlert className="size-3 text-amber-400" />
                      Statutory Waterbody Setback Rule
                    </span>
                    <span className="text-amber-300 font-medium">{selectedCity.bufferRules}</span>
                  </div>

                  {/* Employment POIs */}
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.04] flex flex-col gap-0.5">
                    <span className="font-mono text-[9.5px] text-slate-500 uppercase">Key Tech Corridors</span>
                    <span className="text-slate-300 line-clamp-2">{selectedCity.techCorridors}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: PROMPT INSPECTOR & ACTION DOCK (7 COLS) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Prompt Editor Card */}
              <div className="p-4 rounded-xl bg-[#161B22] border border-white/[0.08] flex flex-col gap-3 shadow-sm flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-4 text-emerald-400" />
                    <span className="font-mono text-[12px] font-semibold tracking-wide text-slate-200 uppercase">
                      5-Pillar Cloud Agent Directive
                    </span>
                    {isPromptModified && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Customized
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPromptModified && (
                      <button
                        onClick={resetPrompt}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                        title="Reset to default city prompt"
                      >
                        <RotateCcw className="size-3" />
                        <span>Reset</span>
                      </button>
                    )}
                    <button
                      onClick={copyPromptToClipboard}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-colors cursor-pointer"
                    >
                      {copiedPrompt ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Prompt Textarea */}
                <div className="relative rounded-lg bg-black/50 border border-white/[0.06] overflow-hidden focus-within:border-emerald-500/40 transition-all flex-1 min-h-[220px]">
                  <textarea
                    value={promptText}
                    onChange={(e) => {
                      setPromptText(e.target.value);
                      setIsPromptModified(true);
                    }}
                    className="w-full h-full min-h-[220px] p-3 font-mono text-[11px] leading-relaxed text-emerald-300/90 bg-transparent resize-y focus:outline-none [scrollbar-width:thin] [scrollbar-color:#1E2633_transparent]"
                    spellCheck={false}
                  />
                </div>

                {/* Command Dock & Launch CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] gap-3">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      Target Workspace: <strong className="text-slate-200">dyad-{selectedCity.slug}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCollecting && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={motionSprings.snappy}
                        onClick={cancelCollection}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                        title="Cancel active Cloud Agent execution"
                      >
                        <AlertTriangle className="size-3.5 text-rose-400" />
                        <span>Cancel Run</span>
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={motionSprings.snappy}
                      onClick={startDatasetCollection}
                      disabled={isCollecting}
                      className={cn(
                        'flex items-center gap-2 px-5 py-2 rounded-lg font-mono text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md',
                        isCollecting
                          ? 'bg-slate-800 text-slate-400 border border-white/[0.06] cursor-not-allowed'
                          : 'bg-[#00F5D4] hover:bg-[#00e2c4] text-slate-950 shadow-[#00F5D4]/20'
                      )}
                    >
                      {isCollecting ? (
                        <>
                          <RefreshCw className="size-4 animate-spin text-slate-400" />
                          <span>Collecting... ({agentPhase})</span>
                        </>
                      ) : (
                        <>
                          <Play className="size-4 fill-slate-950" />
                          <span>Start Dataset Collection</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TIER 2: SPLIT COMMAND CENTER — LIVE VIDEO & TELEMETRY STREAMING */}
          <AnimatePresence>
            {(isCollecting || streamEvents.length > 0 || liveViewUrl || previewUrl || activeTab === 'docs') && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={motionSprings.smooth}
                className="p-4 rounded-xl bg-[#161B22] border border-white/[0.08] flex flex-col gap-3 shadow-xl"
              >
                {/* 1. Header Bar: Session Status & Telemetry Metrics */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  {/* Left: Session Indicators */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center size-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        <Radio className={cn('size-3.5 text-emerald-300', isCollecting && 'animate-pulse')} />
                      </div>
                      <span className="font-mono text-[12px] font-semibold text-white tracking-wide uppercase">
                        Browser Use Cloud Live Session
                      </span>
                    </div>

                    {agentPhase !== 'IDLE' && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider',
                          agentPhase === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : agentPhase === 'ERROR'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
                        )}
                      >
                        {agentPhase}
                      </span>
                    )}

                    {/* Live Telemetry Ticker Metrics */}
                    <div className="hidden sm:flex items-center gap-3 px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.04] text-[10.5px] font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Activity className="size-3 text-cyan-400" />
                        <span>Steps:</span>
                        <strong className="text-white tabular-nums">{sessionMetrics.stepsCount}</strong>
                      </div>
                      <span className="text-slate-700">|</span>
                      <div className="flex items-center gap-1.5">
                        <Cpu className="size-3 text-purple-400" />
                        <span>Tokens:</span>
                        <strong className="text-white tabular-nums">{sessionMetrics.totalTokens.toLocaleString()}</strong>
                      </div>
                      <span className="text-slate-700">|</span>
                      <div className="flex items-center gap-1.5">
                        <Coins className="size-3 text-amber-400" />
                        <span>Cost:</span>
                        <strong className="text-amber-300 tabular-nums">{sessionMetrics.totalCostUsd}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right: View Mode Toggles & Cloud Console Link */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-white/[0.06]">
                      <button
                        onClick={() => setActiveTab('split')}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded text-[10.5px] font-mono transition-all cursor-pointer',
                          activeTab === 'split'
                            ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        )}
                      >
                        <SplitSquareVertical className="size-3" />
                        <span>Split Command</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('video')}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded text-[10.5px] font-mono transition-all cursor-pointer',
                          activeTab === 'video'
                            ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        )}
                      >
                        <Monitor className="size-3" />
                        <span>Full Video</span>
                        {liveViewUrl && <span className="size-1.5 rounded-full bg-red-500 animate-ping" />}
                      </button>

                      <button
                        onClick={() => setActiveTab('stream')}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded text-[10.5px] font-mono transition-all cursor-pointer',
                          activeTab === 'stream'
                            ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        )}
                      >
                        <Terminal className="size-3" />
                        <span>Telemetry ({streamEvents.length})</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('docs')}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded text-[10.5px] font-mono transition-all cursor-pointer',
                          activeTab === 'docs'
                            ? 'bg-white/20 text-white font-semibold border border-white/30 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        )}
                      >
                        <Code2 className="size-3" />
                        <span>Docs</span>
                      </button>
                    </div>

                    {previewUrl && (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-cyan-300 hover:text-cyan-200 text-[10.5px] font-mono transition-all"
                        title="Open interactive Browser Use Cloud run console"
                      >
                        <span>Cloud Console</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* 2. Main Content Grid (Split vs Full) */}
                {activeTab === 'docs' ? (
                  /* Cloud Architecture Documentation */
                  <div className="p-4 rounded-lg bg-black/50 border border-white/[0.04] text-[11px] font-mono leading-relaxed text-slate-300 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Code2 className="size-4" />
                      <span>Browser Use Cloud V4 Architecture Reference</span>
                    </div>
                    <p className="text-slate-400">
                      Browser Use Cloud Agent connects to Browser Use Cloud via <code>browser-use-sdk.v4</code>, spins up a dedicated persistent cloud workspace (e.g. <code>dyad-{selectedCity.slug}</code>) on isolated microVMs, executes autonomous browser navigation using <strong>DeepSeek V4.1 Flash Vision</strong>, searches municipal portals, and downloads raw GeoJSON/CSV datasets directly into workspace files.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded bg-black/40 border border-white/[0.04]">
                        <span className="text-slate-200 font-semibold">Autonomous Spatial Verification:</span>
                        <ul className="list-disc list-inside mt-1 text-slate-400 space-y-1">
                          <li>Detects EPSG:4326 Coordinate Reference System</li>
                          <li>Generates companion <code>.meta.json</code> metadata</li>
                          <li>Validates feature counts and bounding box enclosure</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded bg-black/40 border border-white/[0.04]">
                        <span className="text-slate-200 font-semibold">5-Pillar Spatial Standards:</span>
                        <ul className="list-disc list-inside mt-1 text-slate-400 space-y-1">
                          <li>Pillar 1: Demographics & Census Wards</li>
                          <li>Pillar 2: Overpass Turbo Tech Hubs POIs</li>
                          <li>Pillar 3: TomTom Arterial Congestion Speeds</li>
                          <li>Pillar 4: Statutory Waterbody Setback Buffers</li>
                          <li>Pillar 5: Metropolitan Base Boundary GeoJSON</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* LEFT SECTION: LIVE VIDEO & AGENT ACTIVITY HUD */}
                    {(activeTab === 'split' || activeTab === 'video') && (
                      <div className={cn(
                        'flex flex-col gap-3',
                        activeTab === 'video' ? 'lg:col-span-12' : 'lg:col-span-7'
                      )}>
                        {/* Video Viewport Header */}
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.04] text-[10.5px] font-mono text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-red-400 font-semibold">
                              <span className="size-1.5 rounded-full bg-red-500 animate-ping" />
                              <span>LIVE CDP VIDEO</span>
                            </span>
                            <span className="text-slate-600">|</span>
                            <span>MicroVM: <strong className="text-slate-200">Chromium 124 Headless</strong></span>
                            <span className="text-slate-600">|</span>
                            <span>Workspace: <strong className="text-emerald-400">dyad-{selectedCity.slug}</strong></span>
                          </div>
                          {runId && (
                            <div className="flex items-center gap-1.5">
                              <span>Run:</span>
                              <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 font-mono text-[9.5px]">
                                {runId.slice(0, 8)}
                              </code>
                            </div>
                          )}
                        </div>

                        {/* Video Viewport Container */}
                        <div className="relative w-full rounded-xl overflow-hidden border border-white/[0.08] bg-black aspect-video shadow-2xl flex items-center justify-center min-h-[300px] max-h-[460px]">
                          {liveViewUrl ? (
                            <iframe
                              src={liveViewUrl}
                              className="w-full h-full border-0"
                              title="Browser Use Cloud Live Session"
                              allow="camera; microphone; clipboard-read; clipboard-write;"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                              <div className="size-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                <Monitor className="size-6" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="font-mono text-[13px] font-semibold text-slate-200">
                                  {isCollecting ? 'Connecting to Cloud MicroVM Video Socket...' : 'Browser Use Cloud Live Video Standby'}
                                </span>
                                <span className="text-[11px] text-slate-400 max-w-md">
                                  {previewUrl ? (
                                    <>Autonomous run active on Browser Use Cloud. Video stream establishing.</>
                                  ) : (
                                    <>Click 'Start Dataset Collection' above to dispatch a real cloud agent session.</>
                                  )}
                                </span>
                              </div>
                              {previewUrl && (
                                <a
                                  href={previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00F5D4] hover:bg-[#00e2c4] text-slate-950 font-mono text-[11px] font-bold uppercase tracking-wider transition-all shadow-md"
                                >
                                  <span>Open Cloud Interactive Console</span>
                                  <ExternalLink className="size-3.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {/* LIVE AGENT ACTIVITY HUD (UNDER VIDEO) */}
                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col gap-2.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="size-3.5 text-purple-400" />
                              <span className="font-mono text-[11px] font-bold uppercase text-slate-200 tracking-wide">
                                Real-Time Agent Activity & Chain-of-Thought
                              </span>
                            </div>
                            {latestThought && (
                              <span className="text-[10px] font-mono text-slate-500">
                                Step #{latestThought.step} • {latestThought.timestamp}
                              </span>
                            )}
                          </div>

                          {/* Active Thought Box & Chain of Thought Trace */}
                          <div className="p-2.5 rounded-lg bg-[#161B22]/90 border border-purple-500/20 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                                  {latestThought?.pillar || 'ORCHESTRATION'}
                                </span>
                                <span className="text-[10.5px] font-mono text-slate-400 font-medium">
                                  Active Reasoning Vector
                                </span>
                              </div>
                              {thoughtChain.length > 1 && (
                                <button
                                  onClick={() => setShowAllThoughts(!showAllThoughts)}
                                  className="flex items-center gap-1 text-[10px] font-mono text-purple-300 hover:text-purple-200 underline decoration-purple-500/40 cursor-pointer"
                                >
                                  <span>{showAllThoughts ? 'Show Latest Only' : `Full Chain (${thoughtChain.length} steps)`}</span>
                                </button>
                              )}
                            </div>

                            {showAllThoughts ? (
                              <div className="max-h-[220px] overflow-y-auto flex flex-col gap-2 pt-1 pr-1 [scrollbar-width:thin] [scrollbar-color:#9D4EDD_transparent]">
                                {thoughtChain.map((item, idx) => (
                                  <div key={idx} className="p-2 rounded bg-black/40 border border-purple-500/15 flex flex-col gap-0.5">
                                    <div className="flex items-center justify-between text-[9.5px] font-mono text-purple-300/80">
                                      <span>Step #{item.step} [{item.pillar.toUpperCase()}]</span>
                                      <span className="text-slate-500">{item.timestamp}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                                      {item.thought}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11.5px] text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                                {latestThought?.thought || (
                                  <span className="text-slate-500 italic">
                                    {isCollecting ? 'Agent formulating search & navigation strategy...' : 'Idle. Start a collection run to stream real-time thoughts.'}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>

                          {/* Active Action / Tool Box */}
                          {latestAction && (
                            <div className="p-2.5 rounded-lg bg-black/50 border border-cyan-500/20 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                                    {latestAction.verb}
                                  </span>
                                  <span className="text-[10.5px] font-mono text-cyan-200">
                                    {latestAction.detail}
                                  </span>
                                </div>
                                <span className="text-[9.5px] font-mono text-slate-500">
                                  {latestAction.timestamp}
                                </span>
                              </div>
                              {latestAction.code && (
                                <div className="mt-1 p-2 rounded bg-black/80 border border-white/[0.04] text-[10px] font-mono text-emerald-300/90 overflow-x-auto truncate">
                                  <code>{latestAction.code}</code>
                                </div>
                              )}
                              {latestAction.output && (
                                <div className="mt-0.5 p-1.5 rounded bg-black/60 text-[9.5px] font-mono text-slate-400 line-clamp-2">
                                  <span>Output: {latestAction.output}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* RIGHT SECTION: LIVE STREAMING TELEMETRY & REASONING LOG TERMINAL */}
                    {(activeTab === 'split' || activeTab === 'stream') && (
                      <div className={cn(
                        'flex flex-col gap-2',
                        activeTab === 'stream' ? 'lg:col-span-12' : 'lg:col-span-5'
                      )}>
                        {/* Terminal Filter Controls */}
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.04] text-[10.5px] font-mono">
                          <div className="flex items-center gap-2">
                            <Terminal className="size-3.5 text-emerald-400" />
                            <span className="font-semibold text-slate-200 uppercase">Telemetry Stream</span>
                            <span className="px-1.5 py-0.2 rounded bg-white/[0.08] text-slate-300 text-[9.5px] tabular-nums">
                              {streamEvents.length}
                            </span>
                          </div>

                          {/* Event Filters */}
                          <div className="flex items-center gap-1">
                            {[
                              { id: 'all', label: 'All' },
                              { id: 'reasoning', label: 'Thoughts' },
                              { id: 'action', label: 'Tools' },
                              { id: 'harvest', label: 'Harvests' },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setTelemetryFilter(tab.id as any)}
                                className={cn(
                                  'px-2 py-0.5 rounded text-[9.5px] font-mono transition-all cursor-pointer',
                                  telemetryFilter === tab.id
                                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                                )}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Terminal Event List */}
                        <div
                          ref={terminalContainerRef}
                          className="p-3 rounded-xl bg-black/70 border border-white/[0.06] h-[520px] overflow-y-auto flex flex-col gap-2.5 font-mono text-[11px] [scrollbar-width:thin] [scrollbar-color:#1E2633_transparent] shadow-inner"
                        >
                          {filteredEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                              <Terminal className="size-5 text-slate-600" />
                              <span className="text-center max-w-xs">
                                {isCollecting
                                  ? 'Listening for live Cloud Agent telemetry...'
                                  : 'Agent telemetry standby. Click "Start Dataset Collection" to launch.'}
                              </span>
                            </div>
                          ) : (
                            filteredEvents.map((evt) => (
                              <div
                                key={evt.id}
                                className={cn(
                                  'flex flex-col gap-1 p-2.5 rounded-lg border transition-all',
                                  evt.type === 'reasoning' ? 'bg-purple-950/20 border-purple-500/25 text-purple-100' :
                                  evt.type === 'action' ? 'bg-cyan-950/20 border-cyan-500/25 text-cyan-100' :
                                  evt.type === 'harvest' ? 'bg-emerald-950/25 border-emerald-500/35 text-emerald-100' :
                                  evt.type === 'error' ? 'bg-rose-950/25 border-rose-500/35 text-rose-200' :
                                  'bg-white/[0.02] border-white/[0.04] text-slate-300'
                                )}
                              >
                                {/* Event Header */}
                                <div className="flex items-center justify-between text-[10px]">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        'px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wide',
                                        evt.type === 'reasoning' ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' :
                                        evt.type === 'action' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' :
                                        evt.type === 'harvest' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' :
                                        evt.type === 'error' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' :
                                        'bg-slate-700 text-slate-300'
                                      )}
                                    >
                                      {evt.type === 'reasoning' ? `THOUGHT (STEP ${evt.data.step || 1})` :
                                       evt.type === 'action' ? (evt.data.verb || 'TOOL_EXECUTION') :
                                       evt.type}
                                    </span>
                                    {evt.data.pillar && (
                                      <span className="text-slate-400 uppercase text-[9px]">
                                        [{evt.data.pillar}]
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-slate-500 tabular-nums">{evt.timestamp}</span>
                                </div>

                                {/* Event Body */}
                                <div className="text-[11px] leading-relaxed pt-0.5">
                                  {evt.type === 'reasoning' && (
                                    <p className="font-sans text-slate-200 whitespace-pre-line text-[11px]">
                                      {evt.data.thought}
                                    </p>
                                  )}

                                  {evt.type === 'action' && (
                                    <div className="flex flex-col gap-1">
                                      <span className="text-cyan-200 font-medium">
                                        {evt.data.detail}
                                      </span>
                                      {evt.data.code && (
                                        <pre className="p-1.5 rounded bg-black/60 border border-white/[0.04] text-[10px] text-emerald-300 overflow-x-auto">
                                          <code>{evt.data.code}</code>
                                        </pre>
                                      )}
                                      {evt.data.output && (
                                        <div className="text-[9.5px] text-slate-400 line-clamp-2">
                                          ↳ {evt.data.output}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {evt.type === 'harvest' && (
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                                        <CheckCheck className="size-3.5 text-emerald-400" />
                                        <span>{evt.data.filename}</span>
                                        <span className="text-emerald-400/70 font-normal">
                                          ({evt.data.records} records, {evt.data.geometry})
                                        </span>
                                      </div>
                                      <span className="text-[9.5px] text-emerald-400/80">
                                        {Math.round(evt.data.sizeBytes / 1024)} KB
                                      </span>
                                    </div>
                                  )}

                                  {evt.type === 'telemetry' && (
                                    <div className="text-slate-400">
                                      {evt.data.type === 'AGENT_COMMENTARY' ? (
                                        <p className="border-l-2 border-emerald-500/40 pl-2 text-emerald-200/90 font-sans italic">
                                          "{evt.data.message}"
                                        </p>
                                      ) : evt.data.type === 'LLM_METRICS' ? (
                                        <div className="flex items-center gap-3 text-slate-300">
                                          <span>Cost: <strong className="text-amber-300">{evt.data.costUsd}</strong></span>
                                          <span>Tokens: <strong className="text-white">{evt.data.outputTokens}</strong></span>
                                          <span>Reasoning: <strong className="text-purple-300">{evt.data.reasoningTokens}</strong></span>
                                        </div>
                                      ) : (
                                        <span>{evt.data.message}</span>
                                      )}
                                    </div>
                                  )}

                                  {evt.type === 'status' && (
                                    <span className="text-slate-300">{evt.data.message}</span>
                                  )}

                                  {evt.type === 'insight' && (
                                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200">
                                      <span className="font-semibold block mb-0.5">Synthesis Insight ({evt.data.city}):</span>
                                      <span>{evt.data.summary}</span>
                                    </div>
                                  )}

                                  {evt.type === 'complete' && (
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                      <CheckCircle2 className="size-4" />
                                      <span>Autonomous mission complete. Harvested {evt.data.downloadCount} spatial datasets for {evt.data.city}.</span>
                                    </div>
                                  )}

                                  {evt.type === 'error' && (
                                    <span className="text-rose-400 font-semibold">{evt.data.message}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* TIER 3: HARVESTED DATASETS REPOSITORY & DIRECT DOWNLOADS */}
          <div className="flex flex-col gap-4">
            {/* Repository Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[#161B22] border border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Database className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-mono text-[13px] font-bold text-white uppercase tracking-tight">
                      Acquired Spatial Datasets ({selectedCity.name})
                    </h2>
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {filteredDatasets.length} Available
                    </span>
                    <button
                      onClick={() => fetchDatasets(selectedCity.slug)}
                      className="text-slate-500 hover:text-emerald-400 transition-colors p-1 cursor-pointer"
                      title="Refresh local storage files"
                    >
                      <RefreshCw className={cn('size-3', isLoadingDatasets && 'animate-spin')} />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Harvested and verified by Browser Use Cloud Agent across the 5 transit pillars
                  </span>
                </div>
              </div>

              {/* Pillar Tabs & Search */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-[11px]">
                  <Search className="size-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter datasets..."
                    className="bg-transparent text-slate-200 placeholder:text-slate-600 focus:outline-none w-28 font-mono"
                  />
                </div>

                {/* Pillar Filter Pills */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/[0.06]">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'demographics', label: 'Demographics' },
                    { id: 'economic', label: 'Economic POIs' },
                    { id: 'mobility', label: 'Mobility' },
                    { id: 'ecological', label: 'Ecological' },
                    { id: 'boundary', label: 'Boundary' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePillarFilter(tab.id)}
                      className={cn(
                        'px-2.5 py-1 rounded text-[10.5px] font-mono transition-all cursor-pointer',
                        activePillarFilter === tab.id
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Datasets Grid */}
            {isLoadingDatasets ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500 bg-[#161B22]/50 rounded-xl border border-white/[0.06]">
                <RefreshCw className="size-5 animate-spin text-emerald-400" />
                <span className="font-mono text-[11px]">Loading harvested spatial repository...</span>
              </div>
            ) : datasets.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-center bg-[#161B22]/40 rounded-xl border border-white/[0.06] shadow-sm w-full">
                <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Compass className="size-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-mono text-[13px] font-bold text-white uppercase">
                    No Datasets Harvested Yet for {selectedCity.name}
                  </h3>
                  <p className="text-[11.5px] text-slate-400 max-w-lg leading-relaxed">
                    The autonomous cloud agent has not been dispatched for {selectedCity.name} yet. Click <strong className="text-emerald-300">Start Dataset Collection</strong> above to launch the Browser Use Cloud agent to search open portals, Overpass API, and transit feeds across the 5 pillars.
                  </p>
                </div>
                <button
                  onClick={startDatasetCollection}
                  disabled={isCollecting}
                  className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00F5D4] hover:bg-[#00e2c4] text-slate-950 font-mono text-[11px] font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  <Play className="size-3.5 fill-slate-950" />
                  <span>Harvest {selectedCity.name} Datasets</span>
                </button>
              </div>
            ) : filteredDatasets.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-500 bg-[#161B22]/50 rounded-xl border border-white/[0.06] w-full">
                <AlertTriangle className="size-6 text-amber-400" />
                <span className="font-mono text-[12px] text-slate-300 font-semibold">No datasets matching filter</span>
                <span className="text-[11px] text-slate-500">Clear search or switch pillar filter to view all {datasets.length} available {selectedCity.name} datasets.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDatasets.map((dataset) => {
                  const isNewlyHarvested = recentHarvestedFiles.includes(dataset.name);
                  return (
                    <motion.div
                      key={dataset.id}
                      whileHover={{ scale: 1.01 }}
                      transition={motionSprings.snappy}
                      className={cn(
                        'p-4 rounded-xl bg-[#161B22] border transition-all flex flex-col justify-between gap-3 shadow-sm group',
                        isNewlyHarvested
                          ? 'border-emerald-400/60 ring-1 ring-emerald-400/30 bg-emerald-950/10'
                          : 'border-white/[0.08] hover:border-emerald-500/40'
                      )}
                    >
                      {/* Top: Pillar & Format */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-[9.5px] font-mono font-bold tracking-wide uppercase',
                                dataset.pillar === 'demographics' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25' :
                                dataset.pillar === 'economic' ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/25' :
                                dataset.pillar === 'mobility' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25' :
                                dataset.pillar === 'ecological' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' :
                                'bg-slate-500/15 text-slate-300 border border-slate-500/25'
                              )}
                            >
                              {dataset.pillarLabel}
                            </span>
                            {isNewlyHarvested && (
                              <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40 animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/[0.06] text-slate-300 uppercase font-bold">
                              {dataset.format}
                            </span>
                            <span className="text-slate-400">{dataset.sizeFormatted}</span>
                          </div>
                        </div>

                        <h3 className="font-mono text-[12.5px] font-semibold text-white group-hover:text-emerald-300 transition-colors">
                          {dataset.title}
                        </h3>
                        <span className="font-mono text-[10px] text-slate-500 truncate" title={dataset.name}>
                          {dataset.name}
                        </span>
                      </div>

                      {/* Middle: Spatial Metadata */}
                      <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.04] grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                        <div>
                          <span className="text-slate-500 block text-[9px]">Features / Records</span>
                          <span className="text-slate-200 font-semibold">{dataset.featureCount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">Geometry</span>
                          <span className="text-slate-200">{dataset.geometryType}</span>
                        </div>
                      </div>

                      {/* Bottom Actions: Download & Stage */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] gap-2">
                        <button
                          onClick={() => stageDatasetIntoPipeline(dataset)}
                          disabled={stagingFile === dataset.name}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer',
                            stagedSuccess === dataset.name
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08]'
                          )}
                          title="Stage into active feasibility dashboard pipeline"
                        >
                          {stagedSuccess === dataset.name ? (
                            <>
                              <CheckCircle2 className="size-3 text-emerald-400" />
                              <span>Staged</span>
                            </>
                          ) : stagingFile === dataset.name ? (
                            <>
                              <RefreshCw className="size-3 animate-spin" />
                              <span>Staging...</span>
                            </>
                          ) : (
                            <>
                              <FolderDown className="size-3" />
                              <span>Stage Pipeline</span>
                            </>
                          )}
                        </button>

                        <a
                          href={dataset.downloadUrl}
                          download={dataset.name}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-medium transition-all group/dl cursor-pointer shadow-sm"
                        >
                          <Download className="size-3.5 group-hover/dl:translate-y-0.5 transition-transform" />
                          <span>Download</span>
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

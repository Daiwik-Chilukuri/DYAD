'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import * as turf from '@turf/turf';
import type * as GeoJSON from 'geojson';
import { MapCanvas, OriginStation, BufferStats } from '../../../components/MapCanvas';
import { BotLogo } from '../../../components/BotLogo';
import { SidebarRail } from '../../../components/navigation/SidebarRail';
import {
  Database,
  TrendingUp,
  MapPin,
  Navigation,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  Activity,
  Play,
  Layers,
  Radio,
  ArrowUpRight,
  Home,
  LocateFixed,
  CircleUser,
  Building2,
  Train,
  HeartPulse,
  GraduationCap,
  Landmark,
  Compass,
  Ruler,
  CircleDot,
  ArrowDown,
  AlertCircle,
} from 'lucide-react';
import { motionSprings } from '../../../lib/motion';
import { AuthorityDossierPanel } from '../../../components/dossier';
import type {
  AuthorityDossier,
  CorridorStreamRequest,
  SwarmAgentState,
  SwarmTelemetryLog,
  StationProposal,
} from '../../../types/dossier';

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

const INITIAL_SWARM_AGENTS: Record<string, SwarmAgentState> = {
  visualizer: { name: 'Visualizer', domain: 'visualizer', status: 'idle', durationSec: null },
  demographics: { name: 'Demographics', domain: 'demographics', status: 'idle', durationSec: null },
  economic: { name: 'Economic & TOD', domain: 'economic', status: 'idle', durationSec: null },
  mobility: { name: 'Mobility & Congestion', domain: 'mobility', status: 'idle', durationSec: null },
  ecological: { name: 'Ecological Risk', domain: 'ecological', status: 'idle', durationSec: null },
};

const CORRIDOR_PRESETS = [
  {
    name: 'Silk Board → Sarjapur',
    short: 'Silk Board - Sarjapur',
    origin: { name: 'Central Silk Board Interchange', coordinates: [77.6245, 12.9176] as [number, number], line: 'Yellow Line' },
    destination: [77.6890, 12.9230] as [number, number],
    dist: '9.2 km',
  },
  {
    name: 'Hebbal → Whitefield',
    short: 'Hebbal - Whitefield',
    origin: { name: 'Hebbal Interchange', coordinates: [77.5970, 13.0358] as [number, number], line: 'Blue Line' },
    destination: [77.7499, 12.9698] as [number, number],
    dist: '18.1 km',
  },
  {
    name: 'Majestic → Electronic City',
    short: 'Majestic - E-City',
    origin: { name: 'Nadaprabhu Kempegowda Stn (Majestic)', coordinates: [77.5726, 12.9767] as [number, number], line: 'Purple Line' },
    destination: [77.6775, 12.8452] as [number, number],
    dist: '17.4 km',
  },
];


export default function Dashboard() {
  // 1. Dynamic Origin and Destination State (no hardcoded Central Silk Board fallback forced on user)
  const [originStation, setOriginStation] = useState<OriginStation | null>({
    name: 'Central Silk Board Interchange',
    coordinates: [77.6245, 12.9176],
    line: 'Yellow Line',
  });
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>([77.6890, 12.9230]); // Sarjapur Rd candidate terminus

  // 2. Spatial Layers & Buffer Configuration
  const [bufferRadiusKm, setBufferRadiusKm] = useState<number>(2.0);
  const [showCatchmentBuffer, setShowCatchmentBuffer] = useState<boolean>(true);
  const [showMetroLines, setShowMetroLines] = useState<boolean>(true);
  const [activeFilters, setActiveFilters] = useState<string[]>(['corporate', 'hospital', 'education', 'civic']);
  const [bufferStats, setBufferStats] = useState<BufferStats>({
    total: 0,
    byCategory: { corporate: 0, hospital: 0, education: 0, civic: 0 },
  });

  // 3. Dynamic Visualizer GeoJSON Layer (populated on visualizer_features event)
  const [visualizerGeoJSON, setVisualizerGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);

  // 4. AI Authority Dossier & Swarm Telemetry State
  const [dossier, setDossier] = useState<AuthorityDossier | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(true);
  const [currentStage, setCurrentStage] = useState<string>('Standby');
  const [telemetryLogs, setTelemetryLogs] = useState<SwarmTelemetryLog[]>([]);
  const [swarmAgents, setSwarmAgents] = useState<Record<string, SwarmAgentState>>(INITIAL_SWARM_AGENTS);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [activeStationFocus, setActiveStationFocus] = useState<[number, number] | null>(null);

  // 5. UI Controls
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 6. Hydrate full session & dossier from localStorage on client mount (prevents state loss on navigation)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const rawSession = localStorage.getItem('dyad_active_session_state');
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed.originStation) setOriginStation(parsed.originStation);
        if (parsed.destinationCoords) setDestinationCoords(parsed.destinationCoords);
        if (typeof parsed.bufferRadiusKm === 'number') setBufferRadiusKm(parsed.bufferRadiusKm);
        if (parsed.dossier) setDossier(parsed.dossier);
        if (parsed.visualizerGeoJSON) setVisualizerGeoJSON(parsed.visualizerGeoJSON);
        if (Array.isArray(parsed.telemetryLogs) && parsed.telemetryLogs.length > 0) setTelemetryLogs(parsed.telemetryLogs);
        if (parsed.swarmAgents) setSwarmAgents(parsed.swarmAgents);
        if (parsed.currentStage) setCurrentStage(parsed.currentStage);
      } else {
        const rawDossier = localStorage.getItem('dyad_latest_dossier');
        if (rawDossier) {
          const parsed = JSON.parse(rawDossier);
          if (parsed?.dossier) {
            setDossier(parsed.dossier);
            if (parsed.corridorMeta?.originCoords) {
              setOriginStation({
                name: parsed.corridorMeta.originName || 'Origin Station',
                coordinates: parsed.corridorMeta.originCoords,
              });
            }
            if (parsed.corridorMeta?.destCoords) {
              setDestinationCoords(parsed.corridorMeta.destCoords);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Session] Could not hydrate session state:', e);
    }
  }, []);

  // 7. Auto-persist active session state to localStorage on changes
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const sessionState = {
        originStation,
        destinationCoords,
        bufferRadiusKm,
        dossier,
        visualizerGeoJSON,
        telemetryLogs,
        swarmAgents,
        currentStage: isEvaluating ? currentStage : (dossier ? 'Completed' : 'Standby'),
        lastUpdated: Date.now(),
      };
      try {
        localStorage.setItem('dyad_active_session_state', JSON.stringify(sessionState));
      } catch {
        // Fallback if geojson is too large for storage quota
        const trimmed = { ...sessionState, visualizerGeoJSON: null };
        localStorage.setItem('dyad_active_session_state', JSON.stringify(trimmed));
      }
    } catch (e) {
      console.warn('[Session] Failed to persist session state:', e);
    }
  }, [originStation, destinationCoords, bufferRadiusKm, dossier, visualizerGeoJSON, telemetryLogs, swarmAgents, currentStage, isEvaluating]);

  // Dynamic Corridor Metrics via Turf.js
  const corridorDistanceKm = useMemo(() => {
    if (!originStation || !destinationCoords) return 0;
    try {
      const from = turf.point(originStation.coordinates);
      const to = turf.point(destinationCoords);
      return Number(turf.distance(from, to, { units: 'kilometers' }).toFixed(2));
    } catch {
      return 0;
    }
  }, [originStation, destinationCoords]);

  const estTransitTimeMin = useMemo(() => {
    if (corridorDistanceKm <= 0) return 0;
    return Math.max(1, Math.round((corridorDistanceKm / 35) * 60));
  }, [corridorDistanceKm]);

  const mobility = dossier?.mobility ?? dossier?.mobility_pillar;
  const peakTimeSavedMin = mobility?.peak_hour_travel_time_saved_minutes ?? mobility?.peak_hour_travel_time_saved_mins;

  const estRoadCommuteMin = useMemo(() => {
    if (corridorDistanceKm <= 0) return 0;
    if (peakTimeSavedMin && peakTimeSavedMin > 0) {
      return estTransitTimeMin + Math.round(peakTimeSavedMin);
    }
    return Math.round(estTransitTimeMin * 3.2);
  }, [estTransitTimeMin, peakTimeSavedMin, corridorDistanceKm]);

  // Suggested stations formatted for MapCanvas
  const suggestedStationsForMap = useMemo(() => {
    const list = dossier?.suggested_stations || dossier?.suggested_station_locations || [];
    return list.map((st) => ({
      station_id: st.station_id,
      name: st.name,
      coordinates: (st.coordinates && Array.isArray(st.coordinates)
        ? st.coordinates
        : [st.longitude ?? 77.6245, st.latitude ?? 12.9176]) as [number, number],
      typology: st.typology,
      priority: st.priority,
    }));
  }, [dossier]);

  // Append telemetry log helper
  const addTelemetryLog = useCallback((message: string, stage?: string, agent?: string) => {
    const newLog: SwarmTelemetryLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      message,
      stage,
      agent,
    };
    setTelemetryLogs((prev) => [...prev, newLog]);
  }, []);

  // Update a specific agent's status
  const updateAgentState = useCallback(
    (domain: string, status: SwarmAgentState['status'], durationSec?: number | null, summary?: string) => {
      setSwarmAgents((prev) => {
        const current = prev[domain] || { name: domain, domain: domain as any, status: 'idle' };
        return {
          ...prev,
          [domain]: {
            ...current,
            status,
            durationSec: durationSec !== undefined ? durationSec : current.durationSec,
            summary: summary || current.summary,
          },
        };
      });
    },
    []
  );

  // SSE Event Processing Engine
  const handleSSEEvent = useCallback(
    (event: any) => {
      const type = event.type;
      const timestamp = event.timestamp || Date.now();

      switch (type) {
        case 'plan_initiated':
          setCurrentStage('Plan Initiated');
          addTelemetryLog(
            event.message || `Planned corridor: ${event.corridor_name} (${event.length_km || corridorDistanceKm} km)`,
            'Planning'
          );
          break;

        case 'telemetry': {
          const stage = event.stage || event.status;
          if (stage) setCurrentStage(stage);
          if (event.message) addTelemetryLog(event.message, stage, event.agent);
          break;
        }

        case 'dataset_sync':
          setCurrentStage('Datasets Synced');
          addTelemetryLog(
            event.message || `Synchronized ${event.count || 0} active dataset(s) into swarm runtime.`,
            'Storage Sync'
          );
          break;

        case 'subagents_spawned':
          setCurrentStage('Swarm Executing');
          setSwarmAgents((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((k) => {
              next[k] = { ...next[k], status: 'running' };
            });
            return next;
          });
          addTelemetryLog(
            event.message || 'Spawned 5 specialized domain subagents in parallel.',
            'Executing'
          );
          break;

        case 'visualizer_features':
          if (event.geojson) {
            setVisualizerGeoJSON(event.geojson);
          }
          updateAgentState('visualizer', 'completed', 0.25, event.message);
          addTelemetryLog(
            event.message || `Ingested ${event.features_count || 0} visualizer GIS features into vector canvas.`,
            'Spatial Layers',
            'visualizer'
          );
          break;

        case 'subagent_completed': {
          const subagentName = (event.subagent || event.agent || '').toLowerCase();
          let matchedDomain: string | null = null;

          if (subagentName.includes('demograph')) matchedDomain = 'demographics';
          else if (subagentName.includes('econ')) matchedDomain = 'economic';
          else if (subagentName.includes('mobil')) matchedDomain = 'mobility';
          else if (subagentName.includes('ecol')) matchedDomain = 'ecological';
          else if (subagentName.includes('vis')) matchedDomain = 'visualizer';

          if (matchedDomain) {
            updateAgentState(matchedDomain, 'completed', event.execution_time_seconds, event.summary || event.message);
          }
          addTelemetryLog(
            event.summary || event.message || `${event.subagent || event.agent} analysis completed successfully.`,
            'Subagent Result',
            matchedDomain || event.subagent || event.agent
          );
          break;
        }

        case 'dossier': {
          const extractedDossier: AuthorityDossier = event.dossier || event.payload || event;
          if (extractedDossier) {
            setDossier(extractedDossier);
            // Persist to localStorage for detailed inspection in /agents
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem(
                  'dyad_latest_dossier',
                  JSON.stringify({
                    dossier: extractedDossier,
                    corridorMeta: {
                      originName: originStation?.name,
                      destName: destinationCoords ? 'Terminus' : undefined,
                      originCoords: originStation?.coordinates,
                      destCoords: destinationCoords,
                      lengthKm: corridorDistanceKm,
                      radiusMeters: bufferRadiusKm * 1000,
                    },
                    timestamp: Date.now(),
                  })
                );
              }
            } catch (err) {
              console.warn('[Storage] Could not persist dossier:', err);
            }

            // Mark all remaining subagents completed
            setSwarmAgents((prev) => {
              const next = { ...prev };
              Object.keys(next).forEach((k) => {
                if (next[k].status !== 'completed') {
                  next[k] = { ...next[k], status: 'completed', durationSec: next[k].durationSec || 0.45 };
                }
              });
              return next;
            });
            addTelemetryLog(
              event.message ||
                `Authority Dossier synthesized (Viability Score: ${extractedDossier.overall_viability_score}/100).`,
              'Dossier Synthesized'
            );
          }
          break;
        }

        case 'done':
          setIsEvaluating(false);
          setCurrentStage('Completed');
          addTelemetryLog('Corridor evaluation completed successfully.', 'Done');
          break;

        case 'error':
          setIsEvaluating(false);
          setCurrentStage('Error');
          addTelemetryLog(`Swarm error: ${event.message || 'Stream connection issue.'}`, 'Error');
          break;

        default:
          if (event.message) {
            addTelemetryLog(event.message, event.type);
          }
          break;
      }
    },
    [addTelemetryLog, updateAgentState, corridorDistanceKm]
  );

  // Trigger Feasibility Swarm Evaluation via SSE POST
  const handleEvaluateCorridor = useCallback(async () => {
    if (!originStation?.coordinates || !destinationCoords) {
      addTelemetryLog('Please select an origin station and terminus on the map first.', 'Warning');
      return;
    }

    if (isEvaluating && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Reset swarm evaluation state
    setIsEvaluating(true);
    setIsDossierOpen(true);
    setCurrentStage('Initiating Swarm');
    setTelemetryLogs([]);
    setSwarmAgents({ ...INITIAL_SWARM_AGENTS });
    setVisualizerGeoJSON(null);

    const payload: CorridorStreamRequest = {
      origin: {
        name: originStation.name,
        coordinates: originStation.coordinates,
        line: originStation.line,
      },
      destination: {
        name: 'Candidate Terminus',
        coordinates: destinationCoords,
      },
      catchment_radius_meters: bufferRadiusKm * 1000,
      budget_cap_inr_cr: 5000,
      target_completion_year: 2030,
      corridor_id: `corridor-${Date.now()}`,
      corridor_name: `${originStation.name} to Candidate Terminus`,
    };

    addTelemetryLog(
      `Dispatching corridor payload: ${payload.origin.name} → [${destinationCoords[0].toFixed(4)}, ${destinationCoords[1].toFixed(4)}]`,
      'Request Sent'
    );

    try {
      const response = await fetch('/api/corridor/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE stream HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      const parseSSEPacket = (packet: string) => {
        if (!packet.trim()) return;

        let eventType = 'message';
        let dataContent = '';

        for (const line of packet.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (trimmed.startsWith('event:')) {
            eventType = trimmed.slice(6).trim();
          } else if (trimmed.startsWith('data:')) {
            const dataPiece = trimmed.slice(5).trim();
            dataContent = dataContent ? `${dataContent}\n${dataPiece}` : dataPiece;
          }
        }

        if (dataContent) {
          if (eventType === 'done' || dataContent === '[DONE]') {
            handleSSEEvent({ type: 'done', message: 'Completed' });
          } else {
            try {
              const parsed = JSON.parse(dataContent);
              handleSSEEvent({ ...parsed, type: parsed.type || eventType });
            } catch (err) {
              console.warn('[Dashboard/SSE] Non-JSON SSE data chunk:', dataContent);
            }
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n\r?\n/);
        buffer = lines.pop() || '';

        for (const packet of lines) {
          parseSSEPacket(packet);
        }
      }

      // Flush trailing buffer packet when stream closes
      if (buffer.trim()) {
        parseSSEPacket(buffer);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        addTelemetryLog('Corridor evaluation cancelled by user.', 'Cancelled');
      } else {
        console.error('[Dashboard/SSE] Evaluation error:', err);
        addTelemetryLog(`Evaluation connection failed: ${err.message}`, 'Error');
      }
    } finally {
      setIsEvaluating(false);
      setCurrentStage((prev) => (prev === 'Initiating Swarm' || prev === 'Swarm Executing' || prev === 'Datasets Synced' ? 'Completed' : prev));
    }
  }, [originStation, destinationCoords, bufferRadiusKm, isEvaluating, addTelemetryLog, handleSSEEvent]);

  // Handle map click: updates terminus pin dynamically
  const handleMapClick = useCallback((coords: [number, number]) => {
    setDestinationCoords(coords);
  }, []);

  // Handle metro station snapping from map
  const handleOriginSelect = useCallback((station: OriginStation) => {
    setOriginStation(station);
    addTelemetryLog(`Origin snapped to station: ${station.name}`, 'Origin Selection');
  }, [addTelemetryLog]);

  // Handle suggested station selection in dossier
  const handleStationClick = useCallback((coords: [number, number], station: StationProposal) => {
    setActiveStationFocus(coords);
    setSelectedStationId(station.station_id);
    addTelemetryLog(`Focusing camera on proposed station: ${station.name}`, 'Camera Navigation');
  }, [addTelemetryLog]);

  const toggleFilter = (cat: string) => {
    setActiveFilters((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  return (
    <div className="relative w-screen h-screen flex overflow-hidden bg-background select-none">
      {/* 1. BACKGROUND MAP (MAPLIBRE GL CANVAS) */}
      <div className="absolute inset-0 z-0">
        <MapCanvas
          originStation={originStation}
          destinationCoords={destinationCoords}
          onOriginSelect={handleOriginSelect}
          onDestinationSelect={handleMapClick}
          onMapClick={handleMapClick}
          visualizerGeoJSON={visualizerGeoJSON}
          suggestedStations={suggestedStationsForMap}
          onSuggestedStationClick={(id) => {
            const st = (dossier?.suggested_stations || dossier?.suggested_station_locations || []).find(
              (s) => s.station_id === id
            );
            if (st) {
              const coords: [number, number] = st.coordinates || [st.longitude ?? 77.6245, st.latitude ?? 12.9176];
              handleStationClick(coords, st);
            }
          }}
          activeStationFocus={activeStationFocus}
          activePOIFilters={activeFilters}
          showCatchmentBuffer={showCatchmentBuffer}
          showMetroLines={showMetroLines}
          bufferRadiusKm={bufferRadiusKm}
          onBufferStatsChange={setBufferStats}
          isDossierOpen={isDossierOpen}
        />
      </div>

      {/* 2. STANDARDIZED 68px LEFT VERTICAL NAVIGATION RAIL */}
      <SidebarRail onAlignClick={() => setSidebarCollapsed(false)} />

      {/* 3. DOCKED LEFT CORRIDOR ENGINE CONTROL SIDEBAR */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.aside
            initial={{ opacity: 0, x: -360 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -360 }}
            transition={motionSprings.smooth}
            className="absolute top-14 left-[68px] bottom-0 z-20 w-[360px] flex flex-col bg-[#0c0e12]/96 backdrop-blur-2xl border-r border-white/[0.08] shadow-[20px_0_40px_rgba(0,0,0,0.6)] p-3.5 gap-3 pointer-events-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none"
          >
            {/* Header: Studio Status */}
            <div className="flex items-center justify-between px-1 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Compass className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white tracking-tight">
                    Corridor Engine
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Spatial Alignment Studio
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-medium border ${
                  originStation && destinationCoords
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}>
                  {originStation && destinationCoords ? 'ALIGNED' : 'STANDBY'}
                </span>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="size-4" />
                </button>
              </div>
            </div>

            {/* Quick Corridor Benchmark Presets */}
            <div className="flex flex-col gap-1 pb-0.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[9.5px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                  Corridor Presets
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-semibold">1-Click Load</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {CORRIDOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setOriginStation(preset.origin);
                      setDestinationCoords(preset.destination);
                      setVisualizerGeoJSON(null);
                      setDossier(null);
                      addTelemetryLog(`Loaded preset corridor: ${preset.name}`, 'Preset Selection');
                    }}
                    className="px-1.5 py-1 rounded-lg bg-black/40 hover:bg-[#181d26] border border-white/[0.06] hover:border-emerald-500/30 text-[9.5px] font-mono text-slate-300 hover:text-emerald-300 truncate transition-all cursor-pointer text-center"
                    title={`${preset.name} (${preset.dist})`}
                  >
                    {preset.short}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Alignment Geometry & Distinguishable Coordinate Inputs (Node A -> Node B) */}
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#12151b] border border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.05]">
                <span className="text-[10.5px] font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                  <Ruler className="size-3.5 text-cyan-400" />
                  Corridor Coordinates
                </span>
                {corridorDistanceKm > 0 ? (
                  <span className="font-mono tabular-nums text-[10.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                    {corridorDistanceKm.toFixed(2)} km Viaduct
                  </span>
                ) : (
                  <span className="text-[9.5px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    Awaiting Terminus
                  </span>
                )}
              </div>

              {/* Node A (Origin Hub) Input Card - Distinct Emerald Theme */}
              <div className="rounded-xl border border-emerald-500/30 bg-[#0d1419]/90 border-l-[3px] border-l-emerald-400 p-2.5 flex flex-col gap-2 shadow-xs transition-all hover:border-emerald-500/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="size-4.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center justify-center">
                      A
                    </span>
                    <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Origin Hub
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {originStation ? (
                      <>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          SNAPPED
                        </span>
                        <button
                          onClick={() => {
                            setOriginStation(null);
                            setVisualizerGeoJSON(null);
                            setDossier(null);
                          }}
                          className="text-[9px] font-mono text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </>
                    ) : (
                      <span className="text-[9px] font-mono text-amber-400 animate-pulse">
                        Click Station
                      </span>
                    )}
                  </div>
                </div>

                {/* Station Identification Field */}
                <div className="p-2 rounded-lg bg-black/60 border border-white/[0.08] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Train className="size-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-100 truncate">
                      {originStation?.name || 'Click a metro station on canvas'}
                    </span>
                  </div>
                  {originStation?.line && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10 shrink-0">
                      {originStation.line}
                    </span>
                  )}
                </div>

                {/* Numerical Coordinate Inputs for Node A */}
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10.5px]">
                  <div className="flex items-center gap-1.5 bg-black/50 border border-emerald-500/20 rounded-md px-2 py-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500">LON</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={originStation ? originStation.coordinates[0] : ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setOriginStation((prev) => ({
                            name: prev?.name || 'Custom Origin Hub',
                            coordinates: [val, prev ? prev.coordinates[1] : 12.9176],
                            line: prev?.line,
                          }));
                        }
                      }}
                      placeholder="77.6245"
                      className="w-full bg-transparent text-emerald-300 tabular-nums focus:outline-none focus:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/50 border border-emerald-500/20 rounded-md px-2 py-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500">LAT</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={originStation ? originStation.coordinates[1] : ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setOriginStation((prev) => ({
                            name: prev?.name || 'Custom Origin Hub',
                            coordinates: [prev ? prev.coordinates[0] : 77.6245, val],
                            line: prev?.line,
                          }));
                        }
                      }}
                      placeholder="12.9176"
                      className="w-full bg-transparent text-emerald-300 tabular-nums focus:outline-none focus:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Conduit Alignment Flow Indicator */}
              <div className="flex items-center justify-center gap-2 py-0.5">
                <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/30 to-transparent" />
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[9.5px] font-mono text-slate-400">
                  <ArrowDown className="size-2.5 text-cyan-400" />
                  <span className="text-cyan-300 font-bold tabular-nums">
                    {corridorDistanceKm > 0 ? `${corridorDistanceKm.toFixed(1)} km` : 'Direct'}
                  </span>
                  <span className="text-slate-500">Alignment</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/20 via-cyan-500/30 to-transparent" />
              </div>

              {/* Node B (Candidate Terminus) Input Card - Distinct Cyan Theme */}
              <div className="rounded-xl border border-cyan-500/30 bg-[#09151f]/90 border-l-[3px] border-l-cyan-400 p-2.5 flex flex-col gap-2 shadow-xs transition-all hover:border-cyan-500/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="size-4.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold flex items-center justify-center">
                      B
                    </span>
                    <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                      Candidate Terminus
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {destinationCoords ? (
                      <>
                        <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                          LOCKED
                        </span>
                        <button
                          onClick={() => {
                            setDestinationCoords(null);
                            setVisualizerGeoJSON(null);
                            setDossier(null);
                          }}
                          className="text-[9px] font-mono text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </>
                    ) : (
                      <span className="text-[9px] font-mono text-amber-400 animate-pulse">
                        Click Map
                      </span>
                    )}
                  </div>
                </div>

                {/* Terminus Identification Field */}
                <div className="p-2 rounded-lg bg-black/60 border border-white/[0.08] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="size-3.5 text-cyan-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-100 truncate">
                      {destinationCoords ? 'Candidate Terminus Pin Dropped' : 'Click map canvas to drop pin'}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10 shrink-0">
                    {destinationCoords ? 'GIS Pin' : 'Awaiting'}
                  </span>
                </div>

                {/* Numerical Coordinate Inputs for Node B */}
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10.5px]">
                  <div className="flex items-center gap-1.5 bg-black/50 border border-cyan-500/20 rounded-md px-2 py-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500">LON</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={destinationCoords ? destinationCoords[0] : ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setDestinationCoords([val, destinationCoords ? destinationCoords[1] : 12.9230]);
                        }
                      }}
                      placeholder="77.6890"
                      className="w-full bg-transparent text-cyan-300 tabular-nums focus:outline-none focus:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/50 border border-cyan-500/20 rounded-md px-2 py-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500">LAT</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={destinationCoords ? destinationCoords[1] : ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setDestinationCoords([destinationCoords ? destinationCoords[0] : 77.6890, val]);
                        }
                      }}
                      placeholder="12.9230"
                      className="w-full bg-transparent text-cyan-300 tabular-nums focus:outline-none focus:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Divider: Environmental Overlays & Filters */}
            <div className="flex items-center gap-2 py-0.5 my-0.5">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Context & POI Layers
              </span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>

            {/* 3. Infrastructure POI Filters (With Semantic Icons & Live Counts) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Layers className="size-3 text-cyan-400" />
                  Infrastructure POI Overlays
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                  {bufferStats.total} detected
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {[
                  {
                    id: 'corporate',
                    label: 'Tech Parks & SEZ',
                    sub: 'IT Corridors & Clusters',
                    icon: <Building2 className="size-3.5 text-cyan-400" />,
                    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
                    count: bufferStats.byCategory.corporate || 0,
                    isChecked: activeFilters.includes('corporate'),
                    toggle: () => toggleFilter('corporate'),
                  },
                  {
                    id: 'metro',
                    label: 'Metro Stations & Hubs',
                    sub: 'BMRCL Transit Network',
                    icon: <Train className="size-3.5 text-emerald-400" />,
                    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
                    count: null,
                    isChecked: showMetroLines,
                    toggle: () => setShowMetroLines((prev) => !prev),
                  },
                  {
                    id: 'hospital',
                    label: 'Healthcare & Hospitals',
                    sub: 'Multi-Specialty & Care',
                    icon: <HeartPulse className="size-3.5 text-rose-400" />,
                    iconBg: 'bg-rose-500/10 border-rose-500/20',
                    count: bufferStats.byCategory.hospital || 0,
                    isChecked: activeFilters.includes('hospital'),
                    toggle: () => toggleFilter('hospital'),
                  },
                  {
                    id: 'education',
                    label: 'Higher Education',
                    sub: 'Universities & Colleges',
                    icon: <GraduationCap className="size-3.5 text-amber-400" />,
                    iconBg: 'bg-amber-500/10 border-amber-500/20',
                    count: bufferStats.byCategory.education || 0,
                    isChecked: activeFilters.includes('education'),
                    toggle: () => toggleFilter('education'),
                  },
                  {
                    id: 'civic',
                    label: 'Civic & Public Admin',
                    sub: 'Courts, Utilities & Offices',
                    icon: <Landmark className="size-3.5 text-indigo-400" />,
                    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
                    count: bufferStats.byCategory.civic || 0,
                    isChecked: activeFilters.includes('civic'),
                    toggle: () => toggleFilter('civic'),
                  },
                ].map((cat) => (
                  <div
                    key={cat.id}
                    onClick={cat.toggle}
                    className="bg-[#14161b] hover:bg-[#181b22] border border-white/[0.04] hover:border-white/[0.08] rounded-xl p-2 px-2.5 flex items-center justify-between cursor-pointer transition-all group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg border ${cat.iconBg} shrink-0`}>
                        {cat.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11.5px] truncate font-medium transition-colors ${cat.isChecked ? 'text-slate-100 font-semibold' : 'text-slate-400'}`}>
                            {cat.label}
                          </span>
                          {cat.count != null && cat.count > 0 && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono tabular-nums font-bold bg-white/5 text-slate-300 border border-white/10">
                              {cat.count}
                            </span>
                          )}
                        </div>
                        <span className="text-[9.5px] text-slate-500 truncate">
                          {cat.sub}
                        </span>
                      </div>
                    </div>
                    <CyanToggleSwitch checked={cat.isChecked} onChange={cat.toggle} />
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Catchment Buffer Radius (Visual 3-Pill Segmented Selector) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Ruler className="size-3 text-emerald-400" />
                  Catchment Buffer Radius
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {bufferRadiusKm} km
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { radius: 1.0, label: '1.0 km', sub: 'Walkshed' },
                  { radius: 2.0, label: '2.0 km', sub: 'Standard' },
                  { radius: 3.0, label: '3.0 km', sub: 'Feeder' },
                ].map((item) => {
                  const isActive = bufferRadiusKm === item.radius;
                  return (
                    <button
                      key={item.radius}
                      onClick={() => setBufferRadiusKm(item.radius)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10'
                          : 'bg-[#14161b] hover:bg-[#181b22] border-white/[0.04] text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className={`font-mono text-xs font-bold tabular-nums ${isActive ? 'text-emerald-300' : 'text-slate-200'}`}>
                        {item.label}
                      </span>
                      <span className="text-[9.5px] text-slate-500">
                        {item.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. PRIMARY FEASIBILITY COMMAND DOCK (STICKY BOTTOM) */}
            <div className="sticky bottom-0 z-20 -mx-3.5 -mb-3.5 p-3.5 pt-3 bg-[#0E1117] border-t border-white/[0.08] shadow-[0_-8px_24px_rgba(0,0,0,0.5)] flex flex-col gap-2.5">
              {/* Readiness Status Sub-Bar */}
              <div className="flex items-center justify-between px-1 text-[10px] font-mono">
                {isEvaluating ? (
                  <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                    <Radio className="size-3 text-cyan-400 animate-spin" />
                    Evaluating Feasibility...
                  </span>
                ) : originStation && destinationCoords ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    Corridor Ready for Dispatch
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <span className="size-1.5 rounded-full bg-amber-400" />
                    {!originStation ? 'Select origin station' : 'Drop terminus pin'}
                  </span>
                )}

                <span className="text-slate-400 tabular-nums">
                  {corridorDistanceKm > 0 ? `${corridorDistanceKm.toFixed(2)} km alignment` : 'Awaiting nodes'}
                </span>
              </div>

              {/* Main Execution Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={motionSprings.snappy}
                onClick={() => {
                  if (!originStation || !destinationCoords) {
                    const preset = CORRIDOR_PRESETS[1]; // Silk Board -> Sarjapur
                    setOriginStation(preset.origin);
                    setDestinationCoords(preset.destination);
                    setVisualizerGeoJSON(null);
                    setDossier(null);
                    addTelemetryLog(`Loaded preset corridor: ${preset.name}`, 'Preset Selection');
                  } else {
                    handleEvaluateCorridor();
                  }
                }}
                disabled={isEvaluating}
                className={`w-full py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-between transition-all select-none ${
                  isEvaluating
                    ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-xs cursor-wait'
                    : !originStation || !destinationCoords
                    ? 'bg-[#161B22] hover:bg-[#1C2128] text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.16] shadow-xs cursor-pointer'
                    : 'bg-[#00F5D4] hover:bg-[#00e2c4] text-slate-950 shadow-md shadow-[#00F5D4]/15 border border-white/20 cursor-pointer'
                }`}
              >
                {isEvaluating ? (
                  <>
                    <div className="flex items-center gap-2 min-w-0">
                      <Radio className="size-3.5 text-cyan-400 animate-spin shrink-0" />
                      <span className="truncate">{currentStage || 'Evaluating...'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-mono shrink-0">
                      Running
                    </span>
                  </>
                ) : !originStation || !destinationCoords ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Play className="size-3.5 text-slate-400 shrink-0" />
                      <span>{!originStation ? 'Select Origin Station' : 'Drop Terminus Pin'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px] font-mono shrink-0">
                      Load Preset
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Play className="size-3.5 fill-slate-950 text-slate-950 shrink-0" />
                      <span>Run Feasibility</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-950/15 text-slate-950 text-[10px] font-semibold shrink-0">
                      5 Agents
                    </span>
                  </>
                )}
              </motion.button>

              {/* Integrated Mini Telemetry Strip */}
              <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-black/50 border border-white/[0.06]">
                <div className="flex flex-col items-center text-center">
                  <span className="text-[8.5px] uppercase font-mono text-slate-500 font-medium">Length</span>
                  <span className="font-mono tabular-nums text-[11px] font-bold text-slate-200">
                    {corridorDistanceKm > 0 ? `${corridorDistanceKm.toFixed(1)} km` : '—'}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center border-x border-white/[0.06]">
                  <span className="text-[8.5px] uppercase font-mono text-slate-500 font-medium">Buffer</span>
                  <span className="font-mono tabular-nums text-[11px] font-bold text-emerald-400">
                    {bufferRadiusKm} km
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-[8.5px] uppercase font-mono text-slate-500 font-medium">Amenities</span>
                  <span className="font-mono tabular-nums text-[11px] font-bold text-cyan-400">
                    {bufferStats.total}
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Docked Expand Button (When Sidebar is Collapsed) */}
      {sidebarCollapsed && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={motionSprings.snappy}
          onClick={() => setSidebarCollapsed(false)}
          className="absolute top-16 left-[68px] z-30 bg-[#0E1117]/90 backdrop-blur-xl border border-l-0 border-white/[0.08] px-3.5 py-2 rounded-r-xl shadow-xl shadow-black/50 hover:bg-[#161B22] text-[#00f5d4] transition-all flex items-center gap-2 text-xs font-mono font-semibold pointer-events-auto cursor-pointer"
        >
          <ChevronRight className="size-4" />
          <span>Corridor Controls</span>
        </motion.button>
      )}

      {/* 4. MAIN CONTENT OVERLAY */}
      <main className="relative z-10 flex-1 flex flex-col pointer-events-none">
        {/* Top Telemetry Header Bar */}
        <header className="h-14 border-b border-white/[0.08] bg-[#0c0e12]/90 backdrop-blur-xl flex items-center justify-between px-6 pointer-events-auto">
          <div className="flex items-center gap-3">
            {/* Dynamic Alignment Metadata */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-200 font-medium">
                {originStation?.name || 'Origin Snap'} →{' '}
                {destinationCoords ? 'Candidate Terminus' : 'Click Map to set Terminus'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[#00f5d4] font-semibold tabular-nums">
                {corridorDistanceKm.toFixed(2)} km Viaduct
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 tabular-nums">
                {bufferRadiusKm.toFixed(1)} km Catchment
              </span>
            </div>
          </div>

          {/* Real-Time Commute Velocity Readout */}
          <div className="flex items-center gap-6 font-mono tabular-nums text-xs">
            {corridorDistanceKm > 0 && (
              <>
                <div className="hidden sm:flex items-center gap-2 text-slate-400">
                  <Clock className="size-3.5 text-cyan-400" />
                  <span>Metro Time:</span>
                  <span className="font-semibold text-emerald-400">~{estTransitTimeMin} mins</span>
                </div>
                <div className="hidden md:flex items-center gap-2 text-slate-400">
                  <span>Peak Road:</span>
                  <span className="font-semibold text-rose-400">~{estRoadCommuteMin} mins</span>
                  {peakTimeSavedMin && peakTimeSavedMin > 0 ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      -{Math.round(peakTimeSavedMin)}m saved (TomTom)
                    </span>
                  ) : (
                    <span className="text-[9.5px] text-slate-500 font-mono">
                      (est.)
                    </span>
                  )}
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  isEvaluating ? 'bg-cyan-400 animate-ping' : dossier ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              <span className="text-slate-300 font-medium">{currentStage}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <div className="flex-1 relative overflow-hidden pointer-events-none">
          {/* 5. RIGHT-SIDE AI AUTHORITY DOSSIER PANEL */}
          <AuthorityDossierPanel
            isOpen={isDossierOpen}
            onToggleOpen={() => setIsDossierOpen((prev) => !prev)}
            dossier={dossier}
            isEvaluating={isEvaluating}
            telemetryLogs={telemetryLogs}
            swarmAgents={swarmAgents}
            currentStage={currentStage}
            onStationSelect={handleStationClick}
            selectedStationId={selectedStationId}
            corridorMeta={{
              originName: originStation?.name,
              destName: destinationCoords ? 'Terminus' : undefined,
              lengthKm: corridorDistanceKm,
              radiusMeters: bufferRadiusKm * 1000,
            }}
            onEvaluateTrigger={handleEvaluateCorridor}
          />
        </div>
      </main>
    </div>
  );
}

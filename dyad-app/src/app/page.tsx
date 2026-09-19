'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import * as turf from '@turf/turf';
import type * as GeoJSON from 'geojson';
import { MapCanvas, OriginStation, BufferStats } from '../../components/MapCanvas';
import { BotLogo } from '../../components/BotLogo';
import {
  Database,
  Zap,
  TrendingUp,
  GitBranch,
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
} from 'lucide-react';
import { motionSprings } from '../../lib/motion';
import { AuthorityDossierPanel } from '../../components/dossier';
import type {
  AuthorityDossier,
  CorridorStreamRequest,
  SwarmAgentState,
  SwarmTelemetryLog,
  StationProposal,
} from '../../types/dossier';

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

      {/* 2. 68px LEFT VERTICAL NAVIGATION RAIL */}
      <aside className="relative z-30 w-17 flex flex-col items-center border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl py-4 h-full shrink-0">
        <div className="w-10 h-10 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center mb-6 shadow-sm">
          <MapPin className="text-primary size-5" />
        </div>
        <nav className="flex flex-col gap-4">
          <Link href="/data" title="Data Ingestion & Synthesis Studio">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={motionSprings.snappy}
              className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Database className="size-5" />
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={motionSprings.snappy}
            className="p-2.5 rounded-lg text-primary bg-primary/10 transition-colors border border-primary/20"
          >
            <TrendingUp className="size-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={motionSprings.snappy}
            className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
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

      {/* 3. FLOATING LEFT HUD CONTROL SIDEBAR */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.aside
            initial={{ opacity: 0, x: -16, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.96 }}
            transition={motionSprings.smooth}
            className="absolute top-[72px] left-[84px] bottom-4 z-20 w-[280px] max-h-[calc(100vh-5.5rem)] flex flex-col bg-[#0c0e12]/96 backdrop-blur-2xl border border-white/[0.05] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-3.5 gap-2 pointer-events-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-1.5 pt-0.5 shrink-0">
              <span className="text-[12.5px] font-medium text-[#d9dee8] tracking-wide">
                Corridor Engine
              </span>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 rounded-lg text-[#6e7687] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronLeft className="size-4" />
              </button>
            </div>

            {/* Alignment Origin & Terminus Controls */}
            <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-black/30 border border-white/[0.04]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400">Origin Station</span>
                {originStation && (
                  <button
                    onClick={() => {
                      setOriginStation(null);
                      setVisualizerGeoJSON(null);
                      setDossier(null);
                    }}
                    className="text-[9.5px] font-mono text-cyan-400 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {originStation ? originStation.name : 'Click metro station on map'}
              </div>

              <div className="border-t border-white/[0.04] pt-1 mt-0.5 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400">Candidate Terminus</span>
                {destinationCoords && (
                  <button
                    onClick={() => {
                      setDestinationCoords(null);
                      setVisualizerGeoJSON(null);
                      setDossier(null);
                    }}
                    className="text-[9.5px] font-mono text-cyan-400 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-300 truncate">
                {destinationCoords
                  ? `[${destinationCoords[0].toFixed(4)}, ${destinationCoords[1].toFixed(4)}]`
                  : 'Click map to drop terminus pin'}
              </div>
            </div>

            {/* Evaluate CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEvaluateCorridor}
              disabled={isEvaluating || !originStation || !destinationCoords}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isEvaluating
                  ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 cursor-wait'
                  : !originStation || !destinationCoords
                  ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
              }`}
            >
              {isEvaluating ? (
                <>
                  <Radio className="size-3.5 text-cyan-400 animate-spin" />
                  <span>Evaluating Swarm...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Run Feasibility Swarm</span>
                </>
              )}
            </motion.button>

            {/* POI Category Filter Pills */}
            <div className="pt-1 px-1.5 shrink-0">
              <span className="text-[10.5px] font-medium text-[#6e7687] lowercase tracking-wider">
                infrastructure pois
              </span>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              {[
                { id: 'corporate', label: 'Tech Parks & SEZ', dotBg: 'bg-[#22d3ee]', isChecked: activeFilters.includes('corporate'), toggle: () => toggleFilter('corporate') },
                { id: 'metro', label: 'Metro Stations & Hubs', dotBg: 'bg-[#10b981]', isChecked: showMetroLines, toggle: () => setShowMetroLines((prev) => !prev) },
                { id: 'hospital', label: 'Healthcare & Hosps', dotBg: 'bg-[#ef4444]', isChecked: activeFilters.includes('hospital'), toggle: () => toggleFilter('hospital') },
                { id: 'education', label: 'Higher Education', dotBg: 'bg-[#f59e0b]', isChecked: activeFilters.includes('education'), toggle: () => toggleFilter('education') },
                { id: 'civic', label: 'Civic & Public Admin', dotBg: 'bg-[#6366f1]', isChecked: activeFilters.includes('civic'), toggle: () => toggleFilter('civic') },
              ].map((cat) => (
                <div
                  key={cat.id}
                  onClick={cat.toggle}
                  className="bg-[#14161b] hover:bg-[#181b22] border border-white/[0.025] rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full ${cat.dotBg} ${cat.isChecked ? 'opacity-100 shadow-[0_0_6px_currentColor]' : 'opacity-30'} shrink-0 transition-opacity`}
                    />
                    <span
                      className={`text-[11.5px] truncate transition-colors ${cat.isChecked ? 'text-[#c4cad6] font-medium' : 'text-[#5d6575]'}`}
                    >
                      {cat.label}
                    </span>
                  </div>
                  <CyanToggleSwitch checked={cat.isChecked} onChange={cat.toggle} />
                </div>
              ))}
            </div>

            {/* Buffer Radius Selector */}
            <div className="pt-1 px-1.5 shrink-0">
              <span className="text-[10.5px] font-medium text-[#6e7687] lowercase tracking-wider">
                catchment buffer
              </span>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              {[
                { radius: 1.0, label: '1.0km Walkshed' },
                { radius: 2.0, label: '2.0km Standard Catchment' },
                { radius: 3.0, label: '3.0km Regional Feeder' },
              ].map((item) => {
                const isActive = bufferRadiusKm === item.radius;
                return (
                  <div
                    key={item.radius}
                    onClick={() => setBufferRadiusKm(item.radius)}
                    className="bg-[#14161b] hover:bg-[#181b22] border border-white/[0.025] rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span
                      className={`text-[11.5px] truncate transition-colors ${isActive ? 'text-[#c4cad6] font-medium' : 'text-[#6e7687]'}`}
                    >
                      {item.label}
                    </span>
                    <CyanToggleSwitch checked={isActive} onChange={() => setBufferRadiusKm(item.radius)} />
                  </div>
                );
              })}
            </div>

            {/* Summary Footer */}
            <div className="border-t border-white/[0.04] my-1 shrink-0" />
            <div className="px-1.5 flex flex-col gap-0.5 pb-1 shrink-0">
              <span className="text-[11.5px] font-medium text-[#c4cad6]">Active Alignment</span>
              <span className="text-[11px] text-[#7a8294] font-mono truncate">
                {corridorDistanceKm > 0 ? `${corridorDistanceKm.toFixed(2)} km Polyline` : 'Awaiting 2 Coordinates'}
              </span>
              <span className="text-[11px] text-[#00f5d4] font-medium">
                {bufferStats.total} amenities in {bufferRadiusKm}km catchment
              </span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Floating Expand Button (When Sidebar is Collapsed) */}
      {sidebarCollapsed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={motionSprings.snappy}
          onClick={() => setSidebarCollapsed(false)}
          className="absolute top-[72px] left-[84px] z-30 bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] px-3.5 py-2.5 rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/5 hover:bg-[#161B22] text-[#00f5d4] transition-all flex items-center gap-2 text-xs font-mono font-semibold pointer-events-auto cursor-pointer"
        >
          <ChevronRight className="size-4" />
          <span>Corridor Controls</span>
        </motion.button>
      )}

      {/* 4. MAIN CONTENT OVERLAY */}
      <main className="relative z-10 flex-1 flex flex-col pointer-events-none">
        {/* Top Telemetry Header Bar */}
        <header className="h-14 border-b border-border bg-background/85 backdrop-blur-xl flex items-center justify-between px-6 pointer-events-auto">
          <div className="flex items-center gap-3">
            {/* Capsule View Buttons */}
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
                  <span>Swarm</span>
                </button>
              </Link>
            </div>

            {/* Dynamic Alignment Metadata */}
            <div className="hidden lg:flex items-center gap-2 text-xs ml-3 font-mono">
              <span className="text-slate-300 font-medium">
                {originStation?.name || 'Origin Snap'} →{' '}
                {destinationCoords ? 'Candidate Terminus' : 'Click Map'}
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

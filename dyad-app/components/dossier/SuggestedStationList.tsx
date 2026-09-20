'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, GitFork, Users } from 'lucide-react';
import { motionSprings } from '../../lib/motion';
import type { StationProposal } from '../../types/dossier';

interface SuggestedStationListProps {
  stations: StationProposal[];
  onStationClick?: (coords: [number, number], station: StationProposal) => void;
  selectedStationId?: string | null;
}

export function SuggestedStationList({
  stations = [],
  onStationClick,
  selectedStationId: externalSelectedId = null,
}: SuggestedStationListProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const activeId = externalSelectedId ?? internalSelectedId;

  if (!stations || stations.length === 0) {
    return (
      <div className="p-3.5 rounded-xl bg-[#161B22]/40 border border-white/[0.06] text-center text-slate-500 text-xs italic font-sans">
        No suggested station nodes generated yet.
      </div>
    );
  }

  // Handle duplicate names with numbered suffixes
  const nameCounts: Record<string, number> = {};
  const processedStations = stations.map((st, idx) => {
    const rawName = st.name || `Station ${idx + 1}`;
    nameCounts[rawName] = (nameCounts[rawName] || 0) + 1;
    const displayName = nameCounts[rawName] > 1 ? `${rawName} ${nameCounts[rawName]}` : rawName;

    const coords: [number, number] =
      st.coordinates && Array.isArray(st.coordinates)
        ? st.coordinates
        : [st.longitude ?? 77.6245, st.latitude ?? 12.9176];

    const id = st.station_id || `st-${idx}`;
    return { ...st, station_id: id, displayName, coordinates: coords };
  });

  const handleSelect = (station: typeof processedStations[0]) => {
    setInternalSelectedId(station.station_id);

    const [lng, lat] = station.coordinates;
    if (isNaN(lng) || isNaN(lat)) {
      return;
    }

    if (onStationClick) {
      onStationClick([lng, lat], station);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
          Suggested Station Proposals
        </span>
        <span className="font-mono tabular-nums text-[11px] text-emerald-400 font-semibold">
          {processedStations.length} Nodes
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {processedStations.map((st) => {
          const isSelected = st.station_id === activeId;
          const boardings = st.estimated_daily_boardings ?? st.expected_daily_footfall ?? 25000;
          const typology = st.typology || 'ELEVATED';
          const priority = st.priority || 'HIGH';
          const interchange = st.interchange_with || (st.interchange_potential ? 'Transit Interchange' : null);

          // Card class adhering strictly to test F20.4
          const cardClasses = isSelected
            ? 'border-emerald-400/60 bg-[#161B22] ring-1 ring-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
            : 'border-white/[0.08] bg-[#0E1117]/85 hover:bg-[#161B22] hover:border-white/[0.15]';

          return (
            <motion.div
              key={st.station_id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(st)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${cardClasses}`}
            >
              {/* Top Row: Name + Badges */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`p-1 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
                    <MapPin className="size-3.5" />
                  </span>
                  <h5 className="text-xs font-semibold text-white truncate">
                    {st.displayName}
                  </h5>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-medium bg-white/5 border border-white/10 text-slate-300">
                    {typology}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9.5px] font-mono font-semibold border ${
                      priority === 'MANDATORY'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}
                  >
                    {priority}
                  </span>
                </div>
              </div>

              {/* Middle Row: Rationale if present */}
              {st.rationale && (
                <p className="text-[11px] text-slate-400 font-sans leading-snug line-clamp-2">
                  {st.rationale}
                </p>
              )}

              {/* Bottom Row: Footfall + Interchange + Coordinates */}
              <div className="flex items-center justify-between text-[10.5px] font-mono pt-1 border-t border-white/[0.04] text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="size-3 text-emerald-400" />
                  <span className="tabular-nums font-semibold text-emerald-400">
                    {boardings.toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-500">daily</span>
                </div>

                {interchange ? (
                  <div className="flex items-center gap-1 text-cyan-400">
                    <GitFork className="size-3" />
                    <span className="truncate max-w-[130px]">{interchange}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-600">
                    [{st.coordinates[0].toFixed(3)}, {st.coordinates[1].toFixed(3)}]
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { 
  TrendingUp, Navigation, MapPin, ShieldCheck,
  Clock, Train, AlertTriangle, Building2, GraduationCap,
  Hospital, ShoppingBag, Trees, Waves, ShieldAlert
} from 'lucide-react';

interface InsightPhoneMockupProps {
  type: 'ridership' | 'travel-time' | 'walkshed' | 'poi' | 'compliance';
}

export function InsightPhoneMockup({ type }: InsightPhoneMockupProps) {
  return (
    <div className="w-36 sm:w-44 h-52 sm:h-56 rounded-[28px] sm:rounded-[32px] bg-[#000000] border-[3px] border-zinc-700/80 shadow-[0_20px_45px_rgba(0,0,0,0.98),0_4px_15px_rgba(0,0,0,0.8)] overflow-hidden shrink-0 relative flex flex-col select-none group-hover:border-zinc-500/90 transition-colors">
      
      {/* DYNAMIC ISLAND / SPEAKER PILL AT TOP */}
      <div className="w-12 sm:w-14 h-2.5 sm:h-3 bg-zinc-900 border border-white/10 rounded-full mx-auto mt-1.5 z-20 shrink-0" />

      {/* PHONE SCREEN AREA */}
      <div className="flex-1 bg-[#050508] relative overflow-hidden flex flex-col p-2 pt-1 font-sans">
        
        {/* ===================================================================
            TYPE 1: RIDERSHIP DEMAND & PPHPD THERMAL DENSITY
            =================================================================== */}
        {type === 'ridership' && (
          <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
            {/* MINI STATUS & SEARCH BAR */}
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 px-1 pt-0.5">
              <span className="text-zinc-400 font-semibold">09:41</span>
              <span className="flex items-center gap-1 text-[7.5px] text-[#0ab1ba]">
                <span className="size-1 rounded-full bg-[#0ab1ba] animate-ping" />
                Indexed
              </span>
            </div>

            {/* HEATMAP CORRIDOR MAP GRAPHIC */}
            <div className="relative my-auto h-28 w-full rounded-lg bg-[#0a0a0f] border border-white/[0.06] overflow-hidden flex items-center justify-center">
              {/* GRID TEXTURE */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:10px_10px]" />
              
              {/* INTENSE HEATMAP GRADIENT GLOW WASH */}
              <div className="absolute inset-x-2 top-6 h-12 bg-gradient-to-r from-[#0ab1ba]/30 via-[#f72585]/60 to-[#ffd166]/40 blur-md rounded-full rotate-12" />
              
              {/* TRANSIT CORRIDOR SPINE VECTOR */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 140 100" fill="none">
                {/* Arterial glow */}
                <path d="M 15 80 Q 70 50 125 20" stroke="#f72585" strokeWidth="6" strokeOpacity="0.4" strokeLinecap="round" />
                <path d="M 15 80 Q 70 50 125 20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                {/* Station nodes */}
                <circle cx="20" cy="78" r="3.5" fill="#0ab1ba" stroke="#ffffff" strokeWidth="1" />
                <circle cx="68" cy="51" r="4.5" fill="#f72585" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="120" cy="23" r="3.5" fill="#ffd166" stroke="#ffffff" strokeWidth="1" />
              </svg>

              {/* FLOATING DATASET COUNT TAG */}
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-[#f72585]/40 text-[8px] font-mono font-bold text-white shadow-lg">
                8,213 <span className="text-[6.5px] text-zinc-400 font-normal">POIs</span>
              </div>
            </div>

            {/* BOTTOM SHEET MINI STAT */}
            <div className="rounded-md bg-white/[0.04] border border-white/[0.06] p-1.5 flex items-center justify-between text-[8px] font-mono">
              <span className="text-zinc-400 flex items-center gap-1">
                <TrendingUp className="size-2.5 text-[#0ab1ba]" />
                Data Index
              </span>
              <span className="text-emerald-400 font-bold">Open Sources</span>
            </div>
          </div>
        )}

        {/* ===================================================================
            TYPE 2: TRAVEL TIME DELTA & CONGESTION RELIEF (RAPPI MAP STYLE)
            =================================================================== */}
        {type === 'travel-time' && (
          <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
            {/* MINI STATUS & SEARCH BAR */}
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 px-1 pt-0.5">
              <span className="text-zinc-400 font-semibold">09:41</span>
              <span className="text-zinc-400 flex items-center gap-0.5 text-[7.5px]">
                <Navigation className="size-2 text-[#0ab1ba]" />
                Silk Board ➔ ORR
              </span>
            </div>

            {/* REAL GPS MAP NAVIGATION VIEW (RED ROAD VS CYAN METRO) */}
            <div className="relative my-auto h-28 w-full rounded-lg bg-[#09090d] border border-white/[0.06] overflow-hidden">
              {/* MAP GRID TILES */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:12px_12px]" />
              
              {/* STREET MAP VECTORS */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 140 100" fill="none">
                {/* Secondary street grid */}
                <path d="M 0 35 H 140 M 0 65 H 140 M 35 0 V 100 M 105 0 V 100" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.08" />

                {/* RED ROAD GRIDLOCK ROUTE */}
                <path d="M 20 80 Q 40 85 60 65 T 100 40 T 120 20" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.85" />
                
                {/* CYAN AUTOMATED RAIL VIADUCT (STRAIGHT RAPID CHORD) */}
                <path d="M 20 80 L 120 20" stroke="#00f5d4" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 2" />

                {/* ORIGIN & DESTINATION PINS */}
                <circle cx="20" cy="80" r="3" fill="#ffffff" />
                <circle cx="120" cy="20" r="3.5" fill="#0ab1ba" stroke="#ffffff" strokeWidth="1" />
              </svg>

              {/* FLOATING ETA COMPARISON CARDS */}
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/90 border border-emerald-500/50 shadow-md flex items-center gap-1 text-[7.5px] font-mono text-emerald-400 font-bold">
                <Train className="size-2" />
                <span>12.1 min</span>
              </div>

              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/90 border border-red-500/50 shadow-md flex items-center gap-1 text-[7.5px] font-mono text-red-400">
                <AlertTriangle className="size-2" />
                <span>33.9 min</span>
              </div>
            </div>

            {/* BOTTOM SHEET MINI STAT */}
            <div className="rounded-md bg-white/[0.04] border border-white/[0.06] p-1.5 flex items-center justify-between text-[8px] font-mono">
              <span className="text-zinc-400 flex items-center gap-1">
                <Clock className="size-2.5 text-zinc-400" />
                Time Saved
              </span>
              <span className="text-white font-bold">21.8 Min Estimate</span>
            </div>
          </div>
        )}

        {/* ===================================================================
            TYPE 3: 2.0 KM WALKSHED & TOD STATION CATCHMENT
            =================================================================== */}
        {type === 'walkshed' && (
          <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
            {/* MINI STATUS & SEARCH BAR */}
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 px-1 pt-0.5">
              <span className="text-zinc-400 font-semibold">09:41</span>
              <span className="text-zinc-400 text-[7.5px]">1.5 km Catchment</span>
            </div>

            {/* 3D SPATIAL BUFFER MAP VIEW */}
            <div className="relative my-auto h-28 w-full rounded-lg bg-[#07070b] border border-white/[0.06] overflow-hidden flex items-center justify-center">
              {/* RADIAL ISOCHRONE WALKING CIRCLE */}
              <div className="size-22 rounded-full border border-dashed border-[#0ab1ba]/60 bg-[#0ab1ba]/10 flex items-center justify-center relative">
                {/* Inner 1km ring */}
                <div className="size-13 rounded-full border border-white/20 bg-white/[0.04] flex items-center justify-center">
                  <div className="size-3.5 rounded-full bg-[#0ab1ba] border border-white flex items-center justify-center shadow-[0_0_10px_#0ab1ba]">
                    <div className="size-1 rounded-full bg-white" />
                  </div>
                </div>

                {/* Corporate campus 3D building blocks */}
                <div className="absolute top-2 left-4 size-2.5 rounded-xs bg-zinc-300 border border-white/40 shadow-sm" />
                <div className="absolute bottom-3 right-5 size-3 rounded-xs bg-zinc-400 border border-white/40 shadow-sm" />
                <div className="absolute top-8 right-2 size-2 rounded-xs bg-zinc-300 border border-white/40 shadow-sm" />
                <div className="absolute bottom-5 left-3 size-2.5 rounded-xs bg-zinc-400 border border-white/40 shadow-sm" />
              </div>

              {/* FLOATING CATCHMENT COUNT BADGE */}
              <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/85 border border-white/10 text-[7.5px] font-mono text-white shadow-md">
                <span className="text-[#0ab1ba] font-bold">170,880</span> Residents
              </div>
              <div className="absolute top-1.5 right-2 px-1.5 py-0.5 rounded bg-black/85 border border-white/10 text-[7.5px] font-mono text-zinc-300 shadow-md">
                <span className="text-white font-bold">8</span> Wards
              </div>
            </div>

            {/* BOTTOM SHEET MINI STAT */}
            <div className="rounded-md bg-white/[0.04] border border-white/[0.06] p-1.5 flex items-center justify-between text-[8px] font-mono">
              <span className="text-zinc-400 flex items-center gap-1">
                <MapPin className="size-2.5 text-[#00f5d4]" />
                Census Baseline
              </span>
              <span className="text-zinc-200 font-bold">2011</span>
            </div>
          </div>
        )}

        {/* ===================================================================
            TYPE 4: POI ACCESSIBILITY & ACTIVITY CLUSTERS
            =================================================================== */}
        {type === 'poi' && (
          <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 px-1 pt-0.5">
              <span className="text-zinc-400 font-semibold">09:41</span>
              <span className="text-[#ffd166] font-semibold text-[7.5px]">OSM snapshot</span>
            </div>

            <div className="relative my-auto h-28 w-full overflow-hidden rounded-lg border border-white/[0.06] bg-[#08080c] p-2">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:12px_12px]" />
              <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 140 100" fill="none">
                <path d="M 12 82 Q 52 63 74 51 T 128 17" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.75" strokeLinecap="round" />
                <path d="M 12 82 Q 52 63 74 51 T 128 17" stroke="#0ab1ba" strokeWidth="7" strokeOpacity="0.12" strokeLinecap="round" />
                <circle cx="30" cy="74" r="11" fill="#f43f5e" fillOpacity="0.12" stroke="#f43f5e" strokeOpacity="0.45" />
                <circle cx="76" cy="49" r="15" fill="#ffd166" fillOpacity="0.1" stroke="#ffd166" strokeOpacity="0.45" />
                <circle cx="111" cy="28" r="9" fill="#00f5d4" fillOpacity="0.1" stroke="#00f5d4" strokeOpacity="0.45" />
              </svg>

              <div className="absolute left-3 top-4 flex size-5 items-center justify-center rounded-md border border-rose-400/40 bg-black/80 text-rose-300">
                <Hospital aria-hidden="true" className="size-3" />
              </div>
              <div className="absolute left-[43%] top-[43%] flex size-5 items-center justify-center rounded-md border border-[#ffd166]/40 bg-black/80 text-[#ffd166]">
                <Building2 aria-hidden="true" className="size-3" />
              </div>
              <div className="absolute right-4 top-3 flex size-5 items-center justify-center rounded-md border border-emerald-300/40 bg-black/80 text-emerald-300">
                <GraduationCap aria-hidden="true" className="size-3" />
              </div>
              <div className="absolute bottom-2 right-7 flex size-5 items-center justify-center rounded-md border border-sky-300/40 bg-black/80 text-sky-300">
                <ShoppingBag aria-hidden="true" className="size-3" />
              </div>
            </div>

            <div className="rounded-md bg-white/[0.04] border border-white/[0.06] p-1.5 flex items-center justify-between text-[8px] font-mono">
              <span className="text-zinc-400 flex items-center gap-1">
                <MapPin className="size-2.5 text-[#ffd166]" />
                Categorised
              </span>
              <span className="text-zinc-200 font-bold">8,213 POIs</span>
            </div>
          </div>
        )}

        {/* ===================================================================
            TYPE 5: ENVIRONMENTAL & RESTRICTED-AREA LAYER COVERAGE
            =================================================================== */}
        {type === 'compliance' && (
          <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 px-1 pt-0.5">
              <span className="text-zinc-400 font-semibold">09:41</span>
              <span className="text-amber-300 font-bold flex items-center gap-0.5 text-[7.5px]">
                <AlertTriangle className="size-2 text-amber-300" />
                Layer Coverage
              </span>
            </div>

            <div className="relative my-auto h-28 w-full rounded-lg bg-[#06080a] border border-white/[0.06] overflow-hidden p-2">
              <div className="space-y-1.5 font-mono text-[7px]">
                <div className="flex items-center justify-between rounded-md border border-sky-300/15 bg-sky-300/[0.05] px-1.5 py-1">
                  <span className="flex items-center gap-1 text-sky-300">
                    <Waves aria-hidden="true" className="size-2.5" />
                    Lakes &amp; streams
                  </span>
                  <span className="text-emerald-300">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-1.5 py-1">
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Trees aria-hidden="true" className="size-2.5" />
                    Forest / protected
                  </span>
                  <span className="text-zinc-500">DATA REQUIRED</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-1.5 py-1">
                  <span className="flex items-center gap-1 text-zinc-300">
                    <ShieldAlert aria-hidden="true" className="size-2.5" />
                    Restricted zones
                  </span>
                  <span className="text-zinc-500">DATA REQUIRED</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-1.5 py-1">
                  <span className="flex items-center gap-1 text-zinc-300">
                    <AlertTriangle aria-hidden="true" className="size-2.5" />
                    Flood-risk zones
                  </span>
                  <span className="text-zinc-500">DATA REQUIRED</span>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-white/[0.04] border border-white/[0.06] p-1.5 flex items-center justify-between text-[8px] font-mono">
              <span className="text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="size-2.5 text-amber-300" />
                Screen Status
              </span>
              <span className="text-white font-bold">Not Certified</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default InsightPhoneMockup;

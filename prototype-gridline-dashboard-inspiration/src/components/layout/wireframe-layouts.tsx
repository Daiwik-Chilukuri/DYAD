import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Command,
  Database,
  Eye,
  FileText,
  GitBranch,
  House,
  Layers,
  MapPin,
  Radio,
  Search,
  SlidersHorizontal,
  TrendingUp,
  UsersRound,
  Zap,
} from "lucide-react";

/**
 * Visual wireframe blueprint components illustrating the spatial layout
 * patterns and placement architecture of the Gridline Dashboard for DYAD.
 */

export function WireframeRailSidebar() {
  return (
    <div className="flex flex-col items-center justify-between w-16 h-96 border border-white/10 bg-slate-950/80 rounded-xl p-3 text-slate-400">
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Logo Slot */}
        <div className="size-8 rounded-lg bg-[#0ab1ba]/20 border border-[#0ab1ba]/40 grid place-items-center text-[#0ab1ba] text-xs font-bold font-mono">
          DY
        </div>
        {/* Navigation Rail Icons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10 w-full items-center">
          <div className="size-8 rounded-lg bg-white/10 grid place-items-center text-white"><House className="size-4" /></div>
          <div className="size-8 rounded-lg hover:bg-white/5 grid place-items-center"><Database className="size-4" /></div>
          <div className="size-8 rounded-lg hover:bg-white/5 grid place-items-center"><Zap className="size-4" /></div>
          <div className="size-8 rounded-lg hover:bg-white/5 grid place-items-center"><TrendingUp className="size-4" /></div>
          <div className="size-8 rounded-lg hover:bg-white/5 grid place-items-center"><Radio className="size-4" /></div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-white/10 w-full">
        <div className="size-8 rounded-lg hover:bg-white/5 grid place-items-center"><FileText className="size-4" /></div>
        <div className="size-7 rounded-full bg-slate-800 border border-white/20 grid place-items-center text-[10px] text-slate-300 font-mono">AD</div>
      </div>
    </div>
  );
}

export function WireframeTopNavbar() {
  return (
    <div className="flex items-center justify-between w-full border border-white/10 bg-slate-950/80 rounded-xl px-4 py-2.5 text-xs font-mono">
      <div className="flex items-center gap-3">
        <span className="text-slate-400">Namma Metro</span>
        <span className="text-slate-600">/</span>
        <span className="text-white font-semibold">Silk Board → Sarjapur</span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
          Feasible (84/100)
        </span>
      </div>
      <div className="flex items-center gap-3 text-slate-400">
        <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300">
          Model v2.4 (2026 Transit Plan)
        </span>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 text-[11px]">
          <span>Theme</span>
          <span className="size-2 rounded-full bg-[#0ab1ba]" />
        </div>
      </div>
    </div>
  );
}

export function WireframeBentoWorkspace() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {[
        { title: "System Modelling & Ward Census", icon: Database, points: ["Validate BBMP 198 Ward Census", "Catchment polygon topology check"] },
        { title: "Corridor Catchment & Buffer", icon: Zap, points: ["2km radial buffer computation", "TomTom road vs rail travel delta"] },
        { title: "CapEx & Feasibility Scoring", icon: TrendingUp, points: ["Estimated ₹4,850 Cr DPR budget", "Equity & environmental buffer risks"] },
      ].map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-900/60 p-4 hover:border-[#0ab1ba]/40 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="grid size-8 place-items-center rounded-lg bg-white/5 text-[#0ab1ba]">
                <Icon className="size-4" />
              </div>
              <ArrowUpRight className="size-4 text-slate-400" />
            </div>
            <div className="pt-3 space-y-2">
              <h4 className="text-sm font-semibold text-white">{card.title}</h4>
              <ul className="text-xs text-slate-400 space-y-1 font-mono">
                {card.points.map((p, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-[#0ab1ba]">›</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WireframeSplitInspector() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full h-80 border border-white/10 bg-slate-950/70 rounded-xl p-3 font-mono text-xs">
      {/* Left List Panel: 5 cols */}
      <div className="md:col-span-5 flex flex-col gap-2 border-r border-white/10 pr-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-slate-300 font-semibold">
          <span>Corridor Stations (14)</span>
          <span className="text-[10px] text-[#0ab1ba] bg-[#0ab1ba]/10 px-1.5 py-0.5 rounded">Verified</span>
        </div>
        <div className="flex flex-col gap-1.5 overflow-y-auto">
          {["Silk Board Jn (Interchange)", "HSR Layout 14th Main", "Agara Lake Terminus", "Ibbalur / Bellandur Gate", "Sarjapur Fire Station"].map((s, idx) => (
            <div key={idx} className={`p-2 rounded-lg border text-left flex items-center justify-between ${idx === 0 ? "border-[#0ab1ba] bg-[#0ab1ba]/10 text-white" : "border-white/5 bg-white/5 text-slate-400"}`}>
              <span>{s}</span>
              <span className="text-[10px] text-slate-400">{idx === 0 ? "33/11kV" : "11kV"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Canvas/Inspector Panel: 7 cols */}
      <div className="md:col-span-7 flex flex-col justify-between pl-2">
        <div className="h-44 rounded-lg border border-white/10 bg-slate-900/80 relative overflow-hidden grid place-items-center text-slate-400">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0ab1ba_1px,transparent_1px)] [background-size:16px_16px]" />
          <span className="z-10 text-[11px] flex items-center gap-1 text-[#0ab1ba]">
            <MapPin className="size-3.5" /> MapLibre Vector Canvas / Coordinate Overlay
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-slate-300">
          <div>
            <span className="text-slate-400 text-[10px] block">CATCHMENT POPULATION</span>
            <span className="font-bold text-white text-sm">342,800 Citizens</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">ESTIMATED TRIPS/DAY</span>
            <span className="font-bold text-emerald-400 text-sm">84,200 Tripmakers</span>
          </div>
          <button className="px-3 py-1 rounded bg-[#0ab1ba] text-slate-950 font-bold hover:bg-[#0ab1ba]/90">
            FlyTo 3D
          </button>
        </div>
      </div>
    </div>
  );
}

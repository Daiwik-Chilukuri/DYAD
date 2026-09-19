import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Command,
  Database,
  Eye,
  FileText,
  Filter,
  GitBranch,
  House,
  Layers,
  LogOut,
  MapPin,
  MoonStar,
  Radio,
  Search,
  Settings,
  SlidersHorizontal,
  SunDim,
  TrendingUp,
  UserRound,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { SidebarToggleIcon, WorkspacesIcon } from "./icons";
import { Logo } from "./logo";

export type IconInspirationItem = {
  name: string;
  category: "Navigation & Rail" | "Infrastructure & Modeling" | "Status & Telemetry" | "Controls & Utilities";
  component: React.ComponentType<{ className?: string }>;
  originalGridlineUse: string;
  dyadTransitMapping: string;
  recommendedTokens: string;
};

export const ICON_INSPIRATION_ITEMS: IconInspirationItem[] = [
  // 1. Navigation & Rail
  {
    name: "House",
    category: "Navigation & Rail",
    component: House,
    originalGridlineUse: "Root overview dashboard rail button",
    dyadTransitMapping: "Main Transit Command Center / City-wide corridor overview",
    recommendedTokens: "size-5 text-slate-400 hover:text-white transition-colors",
  },
  {
    name: "Database",
    category: "Navigation & Rail",
    component: Database,
    originalGridlineUse: "System modelling and network data pack",
    dyadTransitMapping: "BBMP Ward Demographics, 2011/2026 Census & GeoJSON Ingestion Index",
    recommendedTokens: "size-5 text-indigo-400",
  },
  {
    name: "Zap",
    category: "Navigation & Rail",
    component: Zap,
    originalGridlineUse: "Flexibility & load balancing tab",
    dyadTransitMapping: "Electric Traction Substations & Metro Energy Grid Feasibility",
    recommendedTokens: "size-5 text-amber-400",
  },
  {
    name: "TrendingUp",
    category: "Navigation & Rail",
    component: TrendingUp,
    originalGridlineUse: "Planning and capital investment forecasting",
    dyadTransitMapping: "Feasibility Score (0-100), Ridership Density & CapEx Forecast",
    recommendedTokens: "size-5 text-emerald-400",
  },
  {
    name: "Radio",
    category: "Navigation & Rail",
    component: Radio,
    originalGridlineUse: "Operations interface / outage links",
    dyadTransitMapping: "Real-time TomTom Congestion Telemetry & BMTC Bus Feeder GPS Feed",
    recommendedTokens: "size-5 text-cyan-400",
  },
  {
    name: "UsersRound",
    category: "Navigation & Rail",
    component: UsersRound,
    originalGridlineUse: "Stakeholder engagement & public consultation packs",
    dyadTransitMapping: "Commuter Catchment Demographics & Transit Equity Distribution",
    recommendedTokens: "size-5 text-pink-400",
  },
  {
    name: "GitBranch",
    category: "Navigation & Rail",
    component: GitBranch,
    originalGridlineUse: "Connection requests & queue management",
    dyadTransitMapping: "Namma Metro Line Interchanges & Multi-Modal Hub Routing",
    recommendedTokens: "size-5 text-purple-400",
  },
  {
    name: "WorkspacesIcon (Custom SVG)",
    category: "Navigation & Rail",
    component: WorkspacesIcon,
    originalGridlineUse: "Workspace section header / bento module header",
    dyadTransitMapping: "Corridor Study Workspaces & DPR Assessment Projects",
    recommendedTokens: "size-5 text-white/80",
  },
  {
    name: "SidebarToggleIcon (Custom SVG)",
    category: "Navigation & Rail",
    component: SidebarToggleIcon,
    originalGridlineUse: "Mobile drawer toggle / sidebar rail expander",
    dyadTransitMapping: "Mobile GIS drawer toggle & side-panel collapse trigger",
    recommendedTokens: "size-5 text-white/90",
  },

  // 2. Infrastructure & Modeling
  {
    name: "Layers",
    category: "Infrastructure & Modeling",
    component: Layers,
    originalGridlineUse: "Map layer stack toggles",
    dyadTransitMapping: "MapLibre Vector Layers: Operational vs Planned Lines, 2km Buffer, Lake Buffers",
    recommendedTokens: "size-4 text-slate-300",
  },
  {
    name: "MapPin",
    category: "Infrastructure & Modeling",
    component: MapPin,
    originalGridlineUse: "Substation coordinate marker on map",
    dyadTransitMapping: "Station Snap Coordinate & Terminus Pin (e.g. Silk Board -> Sarjapur)",
    recommendedTokens: "size-4 text-emerald-400",
  },
  {
    name: "Eye",
    category: "Infrastructure & Modeling",
    component: Eye,
    originalGridlineUse: "ClearView asset inspection and reinforcement data",
    dyadTransitMapping: "Bi-directional 3D camera flyTo() viewport preview",
    recommendedTokens: "size-4 text-cyan-400",
  },

  // 3. Status & Telemetry
  {
    name: "Clock3",
    category: "Status & Telemetry",
    component: Clock3,
    originalGridlineUse: "Recent activity ticker and timestamp audit",
    dyadTransitMapping: "Modal AI Parallel Simulation Compute Duration (<4s reconnaissance)",
    recommendedTokens: "size-4 font-mono text-slate-400",
  },
  {
    name: "CalendarDays",
    category: "Status & Telemetry",
    component: CalendarDays,
    originalGridlineUse: "Header dataset freshness / model release date",
    dyadTransitMapping: "Bengaluru Master Plan 2031 & DPR Assessment Timestamp",
    recommendedTokens: "size-4.5 text-slate-400 font-mono",
  },
  {
    name: "ArrowUpRight",
    category: "Status & Telemetry",
    component: ArrowUpRight,
    originalGridlineUse: "Bento workspace card external launch indicator",
    dyadTransitMapping: "Open Corridor Deep-Dive Dossier or Export Detailed PDF DPR",
    recommendedTokens: "size-5 text-slate-400 group-hover:text-white transition-transform",
  },

  // 4. Controls & Utilities
  {
    name: "Search",
    category: "Controls & Utilities",
    component: Search,
    originalGridlineUse: "Global model search with keyboard shortcut",
    dyadTransitMapping: "Station Auto-complete & BBMP Ward Fast Fuzzy Filter",
    recommendedTokens: "size-4.5 text-slate-400",
  },
  {
    name: "Command",
    category: "Controls & Utilities",
    component: Command,
    originalGridlineUse: "Cmd+K keyboard navigation hint badge",
    dyadTransitMapping: "Quick Corridor Switcher & Command Palette shortcut",
    recommendedTokens: "size-3 text-slate-400 font-mono",
  },
  {
    name: "SlidersHorizontal",
    category: "Controls & Utilities",
    component: SlidersHorizontal,
    originalGridlineUse: "Substation voltage filters (132kV, 33kV, 11kV)",
    dyadTransitMapping: "Radial Catchment Radius Slider (0.5km - 3.0km buffer) & Friction Weighting",
    recommendedTokens: "size-4 text-slate-300",
  },
  {
    name: "MoonStar / SunDim",
    category: "Controls & Utilities",
    component: MoonStar,
    originalGridlineUse: "High-contrast dark / light mode toggle",
    dyadTransitMapping: "CARTO Dark Matter vs CARTO Positron vector basemap switcher",
    recommendedTokens: "size-4 text-amber-300",
  },
  {
    name: "FileText",
    category: "Controls & Utilities",
    component: FileText,
    originalGridlineUse: "Sidebar documents drawer",
    dyadTransitMapping: "DPR Executive Summary Dossier & NGT Lake Clearance Compliance",
    recommendedTokens: "size-6 text-slate-400",
  },
];

export function IconCatalogGrid() {
  const categories = Array.from(new Set(ICON_INSPIRATION_ITEMS.map((item) => item.category)));

  return (
    <div className="space-y-8 p-6 text-slate-100">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Watermelon Gridline Iconography Inspiration</h2>
        <p className="text-sm text-slate-400 font-mono mt-1">
          Cataloged for DYAD: Urban transit command center mapping, token styles, and placements.
        </p>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-[#0ab1ba] font-mono font-semibold">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ICON_INSPIRATION_ITEMS.filter((item) => item.category === category).map((item) => {
              const Icon = item.component;
              return (
                <div
                  key={item.name}
                  className="flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md hover:border-[#0ab1ba]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-9 place-items-center rounded-lg bg-white/5 border border-white/10 text-white">
                        <Icon className="size-5" />
                      </div>
                      <span className="font-mono text-sm font-semibold text-white">{item.name}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400">
                      <span className="font-semibold text-slate-300">Original:</span> {item.originalGridlineUse}
                    </p>
                    <p className="text-cyan-300/90">
                      <span className="font-semibold text-cyan-200">DYAD Mapping:</span> {item.dyadTransitMapping}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500 pt-1">
                      <code>{item.recommendedTokens}</code>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

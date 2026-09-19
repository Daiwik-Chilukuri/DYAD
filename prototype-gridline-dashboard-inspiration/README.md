# Prototype: Gridline Dashboard UI Inspiration

> **Purpose:** Dedicated UI & UX design reference extracted from the Watermelon UI `gridline-dashboard` component block (`https://registry.watermelon.sh/r/gridline-dashboard.json`).  
> **Key Focus:** Curated for its **icons**, **spatial placements**, and **command-center dashboard style** to inspire DYAD's urban transit pre-feasibility war room.

---

## 🌟 What This Prototype Contains

```
prototype-gridline-dashboard-inspiration/
├── INSPIRATION_GUIDE.md             # Complete architectural breakdown (Icons, Placements, Styles)
├── README.md                        # Quick directory reference
├── index.ts                         # Main export module (icons, wireframes, views)
├── package.json                     # Isolated package metadata
├── registry.json                    # Upstream Watermelon shadcn-compatible schema
└── src/
    ├── assets/
    │   ├── icons.tsx                # Custom SVGs (WorkspacesIcon, SidebarToggleIcon)
    │   ├── logo.tsx                 # Responsive faceted logo mark
    │   └── icon-catalog.tsx         # Full icon gallery mapped to DYAD transit concepts
    ├── components/
    │   ├── layout/
    │   │   ├── app-sidebar.tsx      # 68px (w-17) vertical command rail with tooltips
    │   │   ├── top-navbar.tsx       # Breadcrumb telemetry topbar with status chips
    │   │   ├── dashboard-shell.tsx  # Master responsive layout shell
    │   │   ├── sidebar-navigation-item.tsx # Tactile rail buttons
    │   │   └── wireframe-layouts.tsx# Visual wireframe blueprints for DYAD planners
    │   ├── dashboard/
    │   │   ├── dashboard-content.tsx# 3-column bento workspace cards & Cmd+K search
    │   │   ├── flexibility-dashboard.tsx # Split-view asset list & inspector layout
    │   │   └── modelling-dashboard.tsx   # Model action cards & status tables
    │   ├── shared/
    │   │   └── profile-menu.tsx     # Clean user menu dropdown
    │   └── ui/                      # Self-contained primitives (button, card, input, etc.)
    ├── styles/
    │   └── dashboard.css            # OKLCH color system, teal (#0ab1ba) accent tokens
    ├── dashboardView.tsx            # View switcher orchestrator
    ├── data.ts                      # Sample data structures & contracts
    └── demo.tsx                     # Standalone demo entry
```

---

## 🎯 The Three Core Pillars We Care About

### 1. Icons (`src/assets/icon-catalog.tsx`)
- **Custom SVGs:**
  - `WorkspacesIcon`: Clean geometric module glyph for transit corridor studies and DPR packs.
  - `SidebarToggleIcon`: Minimalist split window frame for collapsing map inspector drawers.
  - `Logo`: Modern high-density faceted polygon mark.
- **Lucide Transit Mappings:**
  - `Database` $\rightarrow$ BBMP Ward Census & Demographics Data
  - `Zap` $\rightarrow$ Electric Traction Substations & Power Grid
  - `TrendingUp` $\rightarrow$ 0–100 Feasibility Score & ₹ Cr CapEx Forecast
  - `Radio` $\rightarrow$ TomTom Live Congestion & BMTC Feeder Feeds
  - `GitBranch` $\rightarrow$ Namma Metro Line Interchanges & Snapping
  - `MapPin` $\rightarrow$ Station Snap Origin & Terminus Pin

### 2. Spatial Placements (`src/components/layout/wireframe-layouts.tsx`)
- **68px Left Rail (`w-17`):** Narrow icon-only column with top logo, tooltip-hover buttons, and bottom profile menu. Zero horizontal waste on 14" laptops.
- **Top Telemetry Header:** Breadcrumbs + live status pill (`Published` / `Feasible`) + version badge (`Model v2.4`) + theme toggle.
- **Bento Workspace Grid:** 3-column responsive card grid featuring top-left category glyphs and top-right external launch triggers.
- **Split-Screen Map Inspector:** 40% scrollable station/node list on left, 60% interactive coordinate canvas & deep-dive telemetry drawer on right.

### 3. Dashboard Style (`src/styles/dashboard.css`)
- **OKLCH Dark Command Palette:** High-contrast, non-muddy dark background (`oklch(0.145 0 0)`), elevated surfaces (`oklch(0.205 0 0)`), and hairline specular borders (`oklch(1 0 0 / 10%)`).
- **Signature Infrastructure Accent:** `#0ab1ba` (Teal/Cyan) focus rings and active states.
- **Tabular Monospace Typography:** `font-mono tabular-nums` for all metrics, versions, and coordinates to prevent layout jitter.

---

## 📖 In-Depth Guide
For the full architectural breakdown and copy-paste guidelines, see **[`INSPIRATION_GUIDE.md`](./INSPIRATION_GUIDE.md)**.

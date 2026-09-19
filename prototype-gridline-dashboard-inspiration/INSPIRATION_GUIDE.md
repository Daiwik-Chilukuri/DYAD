# Watermelon UI Gridline Dashboard: UI Inspiration & Architecture Guide

> **Prototype Focus:** This folder isolates the UI inspiration from the Watermelon UI Gridline Dashboard. As noted in the project directive, although the original component deals with electrical gridlines and utility data, **DYAD** draws direct architectural inspiration from its **iconography**, **spatial placements**, and **command-center dashboard style**.

---

## 1. Iconography Architecture

The Gridline Dashboard relies on a balanced combination of **custom SVG glyphs** and curated **Lucide React stroke icons** to achieve an industrial, authoritative aesthetic.

### 1.1 Custom SVG Glyphs (`src/assets/icons.tsx`)
1. **`WorkspacesIcon` (`viewBox="0 0 20 20"`):**
   - **Visual Metaphor:** A geometric blueprint/partition icon representing grouped spatial modules.
   - **DYAD Application:** Section headers for candidate metro corridors, DPR pre-feasibility study packs, and BBMP ward batches.
2. **`SidebarToggleIcon` (`viewBox="0 0 48 48"`):**
   - **Visual Metaphor:** A bifurcated rectangular window frame indicating collapsible side-rail navigation.
   - **DYAD Application:** Expanding/collapsing the station GIS drawer on mobile or compact laptop screens.
3. **`Logo` (`src/assets/logo.tsx`):**
   - **Visual Metaphor:** High-density faceted polygon mark that remains razor-sharp from `size-8` (32px) to `size-10` (40px).
   - **DYAD Application:** Brand icon slot in the top-left rail anchor.

### 1.2 Icon Sizing & Token Hierarchy
| Surface / Context | Icon Size Token | Recommended Stroke | Color / Opacity Token |
| :--- | :--- | :--- | :--- |
| **Rail Navigation Buttons** | `size-5` or `size-6` (20-24px) | `strokeWidth={1.6}` | `text-slate-400 hover:text-white` |
| **Card Category Headers** | `size-5` (20px) | `strokeWidth={1.6}` | Primary accent (`#0ab1ba` or neon line color) |
| **Card Launch Triggers** | `size-5` or `size-6` (20-24px) | `strokeWidth={1.5}` | `text-muted-foreground group-hover:text-white` |
| **Search / Filter Inputs** | `size-4.5` or `size-5` (18-20px)| `strokeWidth={1.5}` | `text-muted-foreground` |
| **Inline Metadata / Chips** | `size-3.5` or `size-4` (14-16px)| `strokeWidth={1.5}` | `text-slate-400` |
| **Empty State Illustrations**| `size-7` (28px) in `size-14` box | `strokeWidth={1.5}` | Muted foreground on elevated background |

### 1.3 Domain Mapping: Gridline $\rightarrow$ DYAD Transit
| Original Gridline Feature | Gridline Icon | DYAD Urban Transit Equivalent |
| :--- | :--- | :--- |
| **System Modelling & Data** | `Database` | **BBMP Ward Demographics & 2011/2026 Census** |
| **Flexibility & Load** | `Zap` | **Electric Traction Substation & Energy Feasibility** |
| **Planning & Investment** | `TrendingUp` | **0–100 Feasibility Score & ₹ Cr CapEx Forecast** |
| **Operations Interface** | `Radio` | **TomTom Live Congestion & BMTC Feeder GPS Ticker** |
| **Stakeholders & Public** | `UsersRound` | **Commuter Catchment Demographics & Transit Equity** |
| **Connections & Queue** | `GitBranch` | **Namma Metro Line Interchanges (Phase 1/2/3)** |
| **Substation Coordinates** | `MapPin` | **Station Snap Origin & Terminus Drop Pin** |
| **Model Version Pack** | `CalendarDays` | **DPR Assessment Timestamp & Master Plan 2031** |

---

## 2. Spatial Placements & Layout Anatomy

The Gridline Dashboard achieves high information density without clutter through a strict four-layer spatial hierarchy.

```
┌──────┬────────────────────────────────────────────────────────────────────────┐
│ [DY] │ Top Navbar: Breadcrumbs / Active Corridor / Status Badge / Theme Switch│
│      ├────────────────────────────────────────────────────────────────────────┤
│ (⌂)  │ Header: Corridor Title (e.g. Silk Board → Sarjapur) + Search [⌘K]       │
│      ├────────────────────────────────────────────────────────────────────────┤
│ (⛁)  │ Recents Shelf: Minimalist horizontal recent corridor studies            │
│      ├────────────────────────────────────────────────────────────────────────┤
│ (⚡)  │ 3-Column Bento Workspace Cards:                                        │
│      │ ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐      │
│ (↗)  │ │ Demographics (DB) │ │ Catchment (Zap)   │ │ CapEx (Trending)  │      │
│      │ │ • 340k pop        │ │ • 2km buffer      │ │ • ₹4,850 Cr       │      │
│ (⎋)  │ └───────────────────┘ └───────────────────┘ └───────────────────┘      │
│      ├────────────────────────────────────────────────────────────────────────┤
│ [AD] │ Split-View Inspector (Modelling / Flexibility):                        │
│      │ ┌───────────────────────┬────────────────────────────────────────────┐ │
│      │ │ Station List & Filters│ Map Canvas / 3D Telemetry Dossier          │ │
│      │ └───────────────────────┴────────────────────────────────────────────┘ │
└──────┴────────────────────────────────────────────────────────────────────────┘
  68px                  Fluid Main Canvas (max-w-screen-2xl)
  Rail
```

### 2.1 The 68px Vertical Command Rail (`w-17`)
- **Placement:** Positioned fixed/absolute on the left edge (`inset-y-0 left-0 hidden md:flex w-17`).
- **Composition:**
  1. **Top Anchor:** Brand logo in a centered square frame with a subtle divider below (`border-b border-sidebar-border pb-4`).
  2. **Middle Stack:** Vertical icon column (`gap-4`) wrapped in Shadcn tooltips (`side="right"`), providing zero-latency navigation without text clutter.
  3. **Bottom Anchor:** Documentation launcher (`FileText`) + user profile menu avatar.
- **Mobile Responsive Pattern:** Transforms into an origin-aware slide-out drawer (`Sheet` with `side="left"` and `w-4/5 sm:max-w-xs`), triggered by the custom `SidebarToggleIcon`.

### 2.2 Telemetry Top Navbar (`src/components/layout/top-navbar.tsx`)
- **Placement:** Spans the top header of the canvas above the content view.
- **Key Placements:**
  - **Breadcrumbs:** Low-contrast root entity name (`text-muted-foreground`), forward slash delimiter, high-contrast active view name (`font-semibold`).
  - **Status Pill:** Semantic badge (e.g. `Published` in green, `Validation` in yellow) with `text-xs font-mono`.
  - **Model Version Pill:** Monospace pill (`Model v2.4.2`) indicating dataset vintage.
  - **Quick Controls:** Dark/Light switch + user avatar.

### 2.3 Search & Filter Command Bar
- **Placement:** Header right-side on desktop (`sm:max-w-md`), spanning full width on mobile.
- **Interaction Placement:**
  - Left icon: `Search` icon positioned at `left-4 top-1/2 -translate-y-1/2`.
  - Right keyboard hint: `<kbd>` element styled with `Command` icon + `K` (`bg-background px-2 py-1 font-mono text-xs text-muted-foreground`).
  - Global hotkey listener: `window.addEventListener("keydown", ...)` bound to `(ctrlKey || metaKey) && key === 'k'`.

### 2.4 Three-Column Bento Workspace Grid
- **Placement:** Container grid with `grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6`.
- **Card Placement Internals:**
  - **Top Row:** Left: Category icon housed inside an elevated square backdrop (`grid size-10 place-items-center rounded-lg bg-background`). Right: Launch arrow (`ArrowUpRight`).
  - **Body:** Large semibold title (`CardTitle`).
  - **Details:** Bullet points rendered with `font-mono text-xs text-muted-foreground`, using subtle character bullets (`›` or geometric dots).

### 2.5 Split-Screen Asset & Inspector Layout (`src/components/dashboard/flexibility-dashboard.tsx`)
- **Placement:** Multi-column view for spatial asset auditing.
- **Left Column:** Search input, multi-attribute filter chips (voltage levels / line categories), and scrollable card list of stations/nodes.
- **Right Column:** Large visual canvas (interactive coordinate map overlay), telemetry badges, and deep inspection action drawers.

---

## 3. Dashboard Style & Design Tokens

### 3.1 Color System & OKLCH Theme Architecture (`src/styles/dashboard.css`)
The Gridline Dashboard uses CSS variables mapped to OKLCH perceptual color spaces, ensuring zero muddy grays:

```css
/* Dark Command Center Values */
--background: oklch(0.145 0 0);          /* Deep charcoal black */
--foreground: oklch(0.985 0 0);          /* Clean specular white */
--card: oklch(0.205 0 0);                /* Elevated card surface */
--secondary: oklch(0.269 0 0);           /* Interactive hover surface */
--border: oklch(1 0 0 / 10%);            /* Hairline 10% specular white */
--input: oklch(1 0 0 / 15%);             /* Form input border */
--primary: #0ab1ba;                      /* Signature Teal/Cyan accent */
--ring: #0ab1ba;                         /* Focus ring */
--radius: 0.625rem;                      /* 10px rounded corner standard */
```

### 3.2 Hairline Specular Borders
- In dark mode, solid gray borders look cheap. Gridline uses semi-transparent white: `border: oklch(1 0 0 / 10%)` or `border-white/10`.
- In DYAD, we extend this with the top specular gradient: `bg-gradient-to-r from-transparent via-white/15 to-transparent`.

### 3.3 Strict Tabular Monospace Metrics
- Every numerical value, date, version identifier, and coordinate string uses:
  ```html
  <span class="font-mono tabular-nums text-white font-semibold">
    50.5544, -4.1608
  </span>
  ```
- This completely prevents layout jitter during live telemetry updates or corridor re-computations.

---

## 4. How to Adapt in DYAD

1. **Borrow the 68px Icon Rail:**
   - Integrate `src/components/layout/app-sidebar.tsx` into `prototype-map-canvas-ui` as the primary left anchor beside the MapLibre canvas.
2. **Borrow the Custom SVGs:**
   - Import `WorkspacesIcon` and `SidebarToggleIcon` from `src/assets/icons.tsx` for drawer toggling and study folder groupings.
3. **Borrow the Split-View Layout:**
   - Use the two-column master-detail layout from `src/components/dashboard/flexibility-dashboard.tsx` for the **Station Catchment Inspector** (Station List on left, Catchment Buffer + POI Telemetry on right).
4. **Use `#0ab1ba` Alongside Transit Accents:**
   - Pair the signature teal `#0ab1ba` with Namma Metro's line colors (`#9D4EDD` Purple, `#00F5D4` Green, `#FFD166` Yellow, `#00BBF9` Blue).

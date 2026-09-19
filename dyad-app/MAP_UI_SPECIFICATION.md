# UI/UX & Map Implementation Specification
## Project Prayas (MetroPulse AI) — "Google Maps on Steroids"

> **Purpose:** This specification defines the complete UI architecture, visual design system, map rendering pipeline, and interactive behavior for the **Prayas Spatial Intelligence Dashboard**. Any frontend engineer or AI coding agent can follow this document to build the user interface without design ambiguity.

---

## 1. System Vision & User Experience Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 TOP TELEMETRY TICKER                                   │
│  🚦 Rush-Hour Avg: 13.9 km/h  │  ⏱️ Time Lost: 168 hrs/yr  │  💰 Congestion: ₹20,000 Cr│
├──────────────────────────────────────────────────────┬─────────────────────────────────┤
│                                                      │                                 │
│               MAPLIBRE GL CANVAS (Dark Theme)         │     AUTHORITY DOSSIER           │
│                                                      │       (Right Panel)             │
│  [Station Snapping: Silk Board]                     │                                 │
│             │                                        │  🏆 Overall Score: 86 / 100     │
│             ▼                                        │                                 │
│  [Dynamic 2km Buffer Polygon (Neon Glow)]            │  📊 4 Pillar Cards:             │
│             │                                        │     • Transit Equity            │
│             ▼                                        │     • Economic Productivity     │
│  [Proposed Terminus Pin Drop: Sarjapur]              │     • Climate & Decarbonization │
│                                                      │     • Corridor Friction         │
│  ┌────────────────────────────────────────┐          │                                 │
│  │ 🏢 Interactive Flash Card (On Click)    │          │  📍 Focal Points (FlyTo):       │
│  │   • Peak Road: 48m  │ Metro: 14m       │          │     • [Fly to Ecospace]         │
│  │   • Unlocks: Bellandur, Agara Corridor │          │     • [Fly to Silk Board]       │
│  │   • Agent: High equity & ridership     │          │                                 │
│  └────────────────────────────────────────┘          │  📁 Dataset Ingestion Drawer    │
│                                                      │                                 │
└──────────────────────────────────────────────────────┴─────────────────────────────────┘
```

### The 4-Step User Journey:
1. **Explore Bengaluru Baseline:** User views Bengaluru on a high-contrast dark vector basemap with accurate Namma Metro tracks (Green, Purple, Yellow, Blue lines) and categorized POI hubs.
2. **Define Proposed Corridor:** 
   * User clicks an existing metro station (or types/pastes Lat/Lng coordinates).
   * User drops a pin at the proposed extension terminus (or clicks on map).
   * Map executes a **cinematic 3D glide & zoom** between the two points, auto-generating a **2km catchment buffer outline**.
3. **Multi-Agent Synthesis:** Parallel agents analyze demographics, economic impact, travel time deltas, and ecological risks.
4. **Interactive Map Exploration:** 
   * **Flash Cards** pop up on map elements (stations, tech parks, hospitals) detailing commute time savings and accessibility.
   * Clicking items in the right-side dossier commands the map to **fly to and inspect** that exact location in 3D.

---

## 2. Open-Source Map Engine & Basemap Specification

* **Mapping Engine:** [MapLibre GL JS](https://maplibre.org/) (`maplibre-gl` v4.x).
* **Basemap Style:** CARTO Dark Matter Vector Tiles
  * URL: `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`
  * Rationale: Roads and non-essential labels are muted dark grey (`#0f172a`), allowing neon transit lines, glowing buffers, and colored POIs to stand out with extreme contrast.
* **Instant Load & Offline Caching:**
  * **Service Worker (`public/sw.js`):** Intercepts tile requests and caches them in CacheStorage so reopening the app loads the map in `<100ms` without re-downloading.
  * **Local GeoJSON Bundling:** All metro lines, stations, and curated POIs are served directly from `/public/data/` on `localhost` (1ms response time).
  * **Memory Cache:** `maxTileCacheSize: 200` ensures all tiles across Bengaluru remain in GPU memory during the session.

---

## 3. Map Layers & Visual Styling Rules

### 3.1 Namma Metro Lines (Accurate Track Alignments)
* **Data Source:** `public/data/bangalore_metro.geojson` (Digitized from OpenStreetMap / BMRCL).
* **Layer 1: Ambient Track Glow (Casing):**
  * `type: 'line'`
  * `line-width: interpolate [zoom: 10 -> 4px, zoom: 15 -> 8px]`
  * `line-opacity: 0.4`
  * `line-blur: 2px`
* **Layer 2: Sharp Track Core:**
  * `type: 'line'`
  * `line-width: interpolate [zoom: 10 -> 2.5px, zoom: 15 -> 5px]`
  * Color mapping:
    * **Purple Line:** `#c084fc` (core) / `#9333ea` (glow)
    * **Green Line:** `#22c55e` (core) / `#16a34a` (glow)
    * **Yellow Line:** `#facc15` (core) / `#ca8a04` (glow)
    * **Blue Line:** `#38bdf8` (core) / `#0284c7` (glow)

### 3.2 Points of Interest (POIs) & Hubs
* **Data Source:** Curated Bengaluru OSM extraction (`public/data/bangalore_pois.geojson`).
* **Visual Representation:** Dual-layer WebGL Circle (Outer glow halo + Inner solid dot with border).
* **Color Palette by Category:**
  * **Corporate / Tech Parks:** `#22d3ee` (Cyan) — *Ecospace, Manyata, Bagmane, ITPB*
  * **Healthcare & Hospitals:** `#ef4444` (Red) — *Manipal, Narayana Health, St. John's*
  * **Higher Education:** `#f59e0b` (Amber) — *IISc, RV College, PES University*
  * **Transit Hubs:** `#a855f7` (Purple) — *Majestic, Yeshwantpur, Cantonment*
  * **Civic / Government:** `#64748b` (Slate) — *Vidhana Soudha, High Court*

### 3.3 Proposed Extension Corridor & 2km Buffer
* **Corridor Line:** Animated dashed line or glowing rose gradient (`#f43f5e`, width: 4px).
* **Turf.js Catchment Buffer:**
  * `turf.buffer(corridorLine, 2.0, { units: 'kilometers' })`
  * Fill layer: `fill-color: #38bdf8`, `fill-opacity: 0.12`
  * Outline layer: `line-color: #38bdf8`, `line-width: 2px`, `line-dasharray: [2, 2]`

---

## 4. Interactive Embedded Flash Cards Specification

When any station, POI, or corridor segment is clicked, the map auto-centers and displays a rich **Intelligence Flash Card** anchored directly over the element.

### 4.1 Card Anatomy & Sections:

```
┌──────────────────────────────────────────────────────────────┐
│ [Icon] [Element Name]                    [Category Badge]    │
├──────────────────────────────────────────────────────────────┤
│ ⏱️ COMMUTE TIME DELTA (vs Silk Board / Origin)               │
│  ┌─────────────────┬─────────────────┬─────────────────┐     │
│  │   Peak Road     │   Via Metro     │   Time Saved    │     │
│  │      48m        │      14m        │   -34 mins/trip │     │
│  │   (TomTom avg)  │  (36.0 km/h)    │   (71% faster)  │     │
│  └─────────────────┴─────────────────┴─────────────────┘     │
├──────────────────────────────────────────────────────────────┤
│ 🌐 ACCESSIBILITY & CONNECTIVITY HUBS                         │
│  • Primary Arterial Unlocked: Outer Ring Road ↔ Sarjapur Rd  │
│  • Feeder Catchment: 42,000 corporate employees daily        │
│  • Car & 2W Trips Diverted: ~11,500 daily trips              │
├──────────────────────────────────────────────────────────────┤
│ 🤖 AGENT BRIEF                                               │
│  "Economic Agent: High-density corporate cluster. Diverts    │
│   massive peak-hour vehicular volume off congested chokepoints."│
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Behavior & Animation Rules:
* **Camera Ease:** Calling `map.easeTo({ center: coords, offset: [0, -60], duration: 600 })` prevents the card from rendering off-screen.
* **Entrance Transition:** CSS keyframe animation:
  * `transform: scale(0.92) translateY(8px)` $\rightarrow$ `transform: scale(1.0) translateY(0)`
  * `duration: 0.22s`, `timing: cubic-bezier(0.16, 1, 0.3, 1)`
* **Glassmorphic Theme:** `background: rgba(15, 23, 42, 0.94)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(56, 189, 248, 0.3)`.

---

## 5. Camera & Dynamic Zoom Logic

### 5.1 Dynamic Zoom Between Two Chosen Points
When the user picks an Origin Station $S$ and sets a Terminus Pin $P$:

```typescript
import maplibregl from 'maplibre-gl';

export function zoomToCorridor(
  map: maplibregl.Map,
  origin: [number, number],
  terminus: [number, number]
) {
  const bounds = new maplibregl.LngLatBounds();
  bounds.extend(origin);
  bounds.extend(terminus);

  map.fitBounds(bounds, {
    padding: { top: 120, bottom: 120, left: 100, right: 460 }, // Leaves room for the right Dossier
    pitch: 48,       // 3D perspective angle
    bearing: -14,     // Subtle cinematic rotation
    duration: 2200,   // Smooth 2.2s glide
    maxZoom: 14.5,
    essential: true
  });
}
```

### 5.2 "Fly to Coordinate" from Right Panel
Every card in the right-side dossier has a `[View on Map]` button:
```typescript
map.flyTo({
  center: [lng, lat],
  zoom: 15.0,
  pitch: 52,
  bearing: 20,
  speed: 1.2,
  curve: 1.4,
  essential: true
});
```

---

## 6. Component Architecture & Props Contract

To prevent merge conflicts with other teammates' coding agents, all map logic is isolated inside `prototype-map-canvas-ui/`:

```
DYAD/prototype-map-canvas-ui/
├── components/
│   ├── MapCanvas.tsx            # Main WebGL canvas wrapper
│   ├── MetroLinesLayer.tsx      # Namma Metro LineStrings
│   ├── POILayer.tsx             # Curated POIs + hover handlers
│   ├── CorridorBufferLayer.tsx  # Turf.js 2km buffer polygon
│   ├── FlashCardPopup.tsx       # Rich interactive popup component
│   └── CoordinateInputCard.tsx  # Floating Lat/Lng picker
├── lib/
│   ├── spatial-turf.ts          # Turf.js buffer & intersection logic
│   └── camera.ts                # flyTo & fitBounds utilities
├── types/
│   └── map-contracts.ts         # Shared TypeScript interfaces
└── index.ts                     # Barrel export
```

### TypeScript Data Contract:
```typescript
export interface POIItem {
  id: string;
  name: string;
  category: 'corporate' | 'healthcare' | 'education' | 'transit' | 'civic';
  coordinates: [number, number]; // [lng, lat]
  roadCommuteMins: number;
  metroCommuteMins: number;
  timeSavedMins: number;
  accessibilityHighlights: string[];
  agentBrief: string;
}

export interface CorridorSelection {
  originStationName: string;
  originCoords: [number, number];
  terminusCoords: [number, number];
  distanceKm: number;
}
```

---

## 7. UI Design Tokens & Color Palette

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `#020617` | Deep space obsidian base |
| **Panel Surface** | `rgba(15, 23, 42, 0.92)` | Glassmorphic floating drawers & cards |
| **Panel Border** | `rgba(51, 65, 85, 0.8)` | Subtle slate separator |
| **Accent Primary** | `#38bdf8` (Cyan 400) | Primary metrics, active states, buffer lines |
| **Accent Pin / Alert**| `#f43f5e` (Rose 500) | Selected terminus pin, chokepoints |
| **Purple Metro** | `#c084fc` / `#9333ea` | Namma Metro Purple Line track |
| **Green Metro** | `#22c55e` / `#16a34a` | Namma Metro Green Line track |
| **Positive Metric** | `#4ade80` (Green 400) | Commute time saved, CO2 reduced |
| **Negative / Warning**| `#f87171` (Red 400) | Road delay, lake buffer encroachment |

---

## 8. 1-Click Verification Prototype

A standalone, zero-dependency HTML test file demonstrating every single item in this specification is available at:
* **[`test_map.html`](file:///d:/Plaksha/sem%205/PRAYAS%20Hackathon/test_map.html)**

Double-click to open in any web browser to see the live MapLibre dark canvas, accurate Namma Metro tracks, POI glow effects, dynamic Lat/Lng input with 3D camera zoom, and clickable interactive Flash Cards.

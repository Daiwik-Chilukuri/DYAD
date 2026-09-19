# prototype-map-canvas-ui

MapLibre GL "war room" canvas for **DYAD** — the interactive spatial-intelligence surface
described in [`MAP_UI_SPECIFICATION.md`](./MAP_UI_SPECIFICATION.md) and
[`../.agents/context.md`](../.agents/context.md).

This is a self-contained Next.js app that runs **fully offline of any paid API** (no OpenAI /
Modal keys required). It demonstrates Tier-1 deterministic spatial compute: everything on
screen is computed live in the browser with Turf.js.

## What it does

1. **Dark vector war room** — CARTO Dark Matter basemap with neon Namma Metro lines
   (Purple / Green / Yellow / Blue), glowing POIs, and interchange stations.
2. **Station-snap + terminus pin** — click a glowing station to snap an origin, then click
   anywhere to drop a terminus. Preset corridors (e.g. *Sarjapur Tech Spine*) are one click.
3. **Instant 2km catchment** — `turf.buffer(corridor, 2.0km)` projects a catchment polygon and
   `turf.booleanPointInPolygon` counts POIs inside it in <20ms.
4. **Authority Dossier** — an 0–100 feasibility score with four pillar cards (Transit Equity,
   Economic Productivity, Climate & Decarbonization, Corridor Friction) built from the
   TomTom 2025 commute-delta model in [`lib/mobility.ts`](./lib/mobility.ts).
5. **Bi-directional camera** — focal-point buttons drive `map.flyTo()` to inspect each hub in 3D.

## Tech stack

- Next.js 15 (App Router, TypeScript) + React 19
- MapLibre GL JS 4 (WebGL vector rendering)
- Turf.js 7 (`@turf/turf`) for all spatial math
- Tailwind CSS v4 + Framer Motion (Emil Kowalski spring physics) + Lucide icons

Design strictly follows [`../.agents/design-system.md`](../.agents/design-system.md).

## Run it

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

Other scripts: `pnpm build` (production build), `pnpm start` (serve build), `pnpm lint`.

## Structure

```
prototype-map-canvas-ui/
├── app/                  # Next.js App Router (layout, page, globals.css)
├── components/           # MapCanvas, AuthorityDossier, TelemetryTicker
├── lib/                  # spatial.ts (Turf), mobility.ts (TomTom model), motion.ts (springs)
├── data/                 # network.ts — metro lines, stations, POIs, preset corridors
└── types/                # contracts.ts — shared TypeScript interfaces
```

All spatial helpers are exported as pure functions (`computeCorridorMetrics`, `computeMobility`,
`buildCorridorBuffer`) so the end-of-sprint integration session can lift them into the unified app.

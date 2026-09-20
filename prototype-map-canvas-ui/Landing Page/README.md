# Dyad Landing Page Module (`Landing Page/`)

> **Autonomous Transit Feasibility Platform**
> Google Maps on Steroids for Urban Transit Planners

This folder contains the complete, self-contained landing page for **Dyad**. It is strictly isolated from the existing dashboard design and datasets to prevent merge conflicts.

---

## 1. Architectural Highlights

1. **MapLibre GL JS 3D Dynamic Background Canvas:**
   - Replaces the static sky background from the "Aside" inspiration image with an animated, full-screen CARTO Dark Matter vector basemap (`MapBackgroundCanvas.tsx`).
   - Supports 3D extruded hexagon congestion mesh (`fill-extrusion`) styled after the TomTom Traffic Index reference images.
   - Live interactive hex tooltips displaying local road speed, congestion index, and flow status.

2. **Cinematic Country $\rightarrow$ City Camera Flight:**
   - On page load, the camera begins at an elevated perspective over India (`center: [78.9629, 21.2]`, `zoom: 4.8`, `pitch: 30°`).
   - Automatically transitions via `map.flyTo` (with 52° pitch and -18° bearing) down to Bengaluru (`[77.6350, 12.9350]`), cross-fading into localized transit corridors and 3D congestion heat hexes.

3. **Top Navigation & City Switcher:**
   - Floating pill navigation (`LandingHeader.tsx`) switching between **Country (India)**, **Bengaluru**, **Delhi-NCR**, and **Hyderabad**.
   - Powered by Framer Motion `layoutId` pill gliding and Emil Kowalski spring micro-interactions (`whileTap: { scale: 0.96 }`).
   - Includes the official Dyad `BotLogo` and quick action buttons.

4. **Contextual TomTom Traffic Intel Card:**
   - Dynamic floating bottom-left card (`TomTomIntelCard.tsx`) reproducing the TomTom UI reference card.
   - Live telemetry updates for peak road speed, annual congestion loss, and PPHPD corridor demand for each city.

5. **"Aside"-Inspired Command Center Showcase:**
   - Floating browser window preview (`ProductShowcaseMockup.tsx`) with interactive workspace tabs:
     - *Map War Room* (station snapping & viaduct alignment)
     - *2km Catchment* (Turf.js deterministic buffer & demographic overlap)
     - *Swarm Dossier* (Modal AI parallel agent synthesis & 0-100 score)
     - *Velocity Delta* (TomTom road vs rail travel times)

6. **4-Pillar Autonomous Pipeline Bento:**
   - Bento grid (`FeatureBento.tsx`) explaining Dyad's 4-second reconnaissance speed vs 24-month manual DPRs.

---

## 2. Integration with Main App

To mount this landing page inside any Next.js route or page:

```tsx
import { LandingPage } from '../Landing Page';

export default function Page() {
  return <LandingPage />;
}
```

# DYAD Design System & UI Craft Specification
## Unified Guidelines: Taste + Impeccable + Emil Kowalski + Watermelon UI

> **CRITICAL DIRECTIVE FOR ALL FRONTEND & UI AGENTS:**
> Every visual component, layout, and micro-interaction in **DYAD** must adhere to this document. We do not generate generic "AI-slop" UI. All UI work builds upon **Watermelon UI** primitives and applies the **Tri-Layer Design Stack**:
> 1. **Taste** (Aesthetic Intent, Restraint & Atmosphere)
> 2. **Impeccable** (Structural Precision, Spacing Tokens & Alignment)
> 3. **Emil Kowalski** (Spring Physics, Origin-Aware Motion & Tactile Feedback)

---

## 1. The Tri-Layer Design Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. TASTE SKILL (Atmosphere & Direction)                                │
│    - High-density urban command center aesthetic (not generic SaaS)    │
│    - Deep dark-mode canvas with high-contrast neon transit accents     │
│    - Extreme typographic discipline (tabular metrics, tight tracking)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 2. IMPECCABLE (Structural Precision & Tokens)                          │
│    - Strict 4px/8px mathematical spacing rhythm (zero arbitrary px)    │
│    - Single-level cards (no nested card-in-card recursion)             │
│    - Hairline specular borders: border-white/[0.08] & ring-1           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 3. EMIL KOWALSKI CRAFT (Kinetic Physics & Micro-Interactions)          │
│    - Calibrated spring physics over static CSS transitions             │
│    - Origin-aware transforms: components scale from trigger coordinate │
│    - Layout continuity using Motion layoutId (no jarring layout snaps) │
│    - Quiet, tactile micro-interactions (whileTap scale: 0.98)          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Tokens & Visual Palette

### 2.1 Color Architecture (Dark Command Center)
DYAD is an authority-grade pre-feasibility war room. Avoid muddy grays; use elevated, semi-transparent surfaces with crisp hairline borders:

```typescript
// tailwind.config.ts / tokens
export const colors = {
  canvas: {
    base: '#08090C',       // Deepest background (under map / base screen)
    surface: '#0E1117',    // Primary card & sidebar background
    elevated: '#161B22',   // Hovered rows, popovers, dropdown menus
    overlay: '#1F242C',    // Modal dialogs, floating command palette
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',  // Standard container border
    active: 'rgba(255, 255, 255, 0.18)',  // Focused or active borders
    highlight: 'rgba(255, 255, 255, 0.3)',// Specular edge highlights
  },
  transit: {
    purple: '#9D4EDD',     // Namma Metro Purple Line
    green: '#00F5D4',      // Namma Metro Green Line
    yellow: '#FFD166',     // Namma Metro Yellow Line
    blue: '#00BBF9',       // Namma Metro Airport/Blue Line
    pink: '#F72585',       // Planned Pink Line
  },
  sentiment: {
    optimal: '#10B981',    // Prime feasibility / High ROI
    warning: '#F59E0B',    // Ecological buffer friction / Caveat
    critical: '#EF4444',   // High friction / NGT violation
    neutral: '#94A3B8',    // Standard supporting telemetry
  }
};
```

### 2.2 Dark Mode Surface Elevation Formula
Every elevated surface (dossier, popover, drawer) must use:
```css
/* Glassmorphic Command Surface */
background: rgba(14, 17, 23, 0.85);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
```
Tailwind utility shorthand:
```html
<div class="bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5">
```

### 2.3 Typography & Metrics Rules
1. **Headings:** Tight letter-spacing (`tracking-tight` or `-0.02em`), semi-bold/bold.
2. **Body Text:** Muted high-legibility slate (`text-slate-300`, `text-slate-400`).
3. **Data Telemetry & Numbers:**
   * **MANDATORY:** Always use monospace with tabular figures (`font-mono tabular-nums`).
   * Prevents layout jitter when stats live-update.
   * Example: `<span class="font-mono tabular-nums text-emerald-400 font-semibold">1,840,000 hrs</span>`

### 2.4 Spacing & Geometry (Impeccable Precision)
* **Spacing Scale:** Multiples of 4px/8px exclusively: `gap-1.5` (6px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `p-4` (16px), `p-6` (24px).
* **Radii Hierarchy:**
  * Containers & Dossier Panels: `rounded-2xl` (16px)
  * Metric Cards & Popovers: `rounded-xl` (12px)
  * Badges, Chips & Buttons: `rounded-lg` (8px) or `rounded-full`

---

## 3. Emil Kowalski Motion & Micro-Interaction Standards

Motion must feel **physical, earned, and purposeful**. Never use generic `transition: all 0.3s ease`.

### 3.1 Physics Spring Configurations
Use Motion (Framer Motion) with calibrated springs:

```typescript
// lib/motion.ts
export const motionSprings = {
  // Snappy for buttons, icons, chips, and small feedback
  snappy: {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },
  // Smooth for large drawers, sliding dossier panel, dialog entries
  smooth: {
    type: "spring",
    stiffness: 300,
    damping: 32,
    mass: 1.0,
  },
  // Bouncy for success checkmarks, radar pings, highlight pulses
  bouncy: {
    type: "spring",
    stiffness: 450,
    damping: 22,
  },
  // Interactive gesture drag
  interactive: {
    type: "spring",
    stiffness: 500,
    damping: 35,
  }
};
```

### 3.2 Origin-Aware Transforms
* Drawers, tooltips, and station detail cards **must scale out from the origin of click**, not pop blindly from the center of the viewport.
* Use `style={{ transformOrigin: "bottom center" }}` or capture interaction click coordinates:
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.94, y: 8 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.96, y: 4 }}
  transition={motionSprings.snappy}
  style={{ transformOrigin: "top left" }}
>
```

### 3.3 Layout Continuity (`layoutId`)
* When switching between tabs (e.g., *Overview*, *Demographics*, *Mobility*, *Ecology*), the active indicator pill must glide smoothly:
```tsx
{isActive && (
  <motion.div
    layoutId="active-tab-pill"
    className="absolute inset-0 bg-white/10 rounded-lg border border-white/15"
    transition={motionSprings.snappy}
  />
)}
```

### 3.4 Tactile Press States
Buttons and interactive list items must provide physical resistance:
```tsx
<motion.button
  whileHover={{ scale: 1.01 }}
  whileTap={{ scale: 0.98 }}
  transition={motionSprings.snappy}
  className="..."
>
```

### 3.5 Accessibility & Motion Sensitivity
Always honor `prefers-reduced-motion`:
```tsx
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();
const transition = shouldReduceMotion ? { duration: 0 } : motionSprings.smooth;
```

---

## 4. Watermelon UI Integration & Modification Rules

We use **Watermelon UI** (`ui.watermelon.sh`) as our studio-grade component catalog (React 19 + Tailwind v4 + Motion).

When adopting or modifying Watermelon UI components:
1. **Preserve Clean Architecture:** Maintain component modularity, props interfaces, and accessible ARIA attributes.
2. **Skin to DYAD Command Center:**
   * Replace plain neutral backgrounds with `bg-[#0E1117]/85` + backdrop blur.
   * Replace standard borders with hairline `border-white/[0.08]` and inner specular highlights.
   * Accent interactive elements with the neon transit palette (`purple`, `green`, `yellow`, `blue`).
3. **Upgrade Motion to Emil Kowalski Springs:**
   * If a Watermelon UI component uses linear CSS `@keyframes`, replace them with Framer Motion spring curves.
   * Add `whileTap={{ scale: 0.98 }}` for tactile feedback.
4. **No Visual Contradictions:** Modified components must look identical in elevation, border weight, and radius to native DYAD components.

---

## 5. The "Anti-AI-Slop" Verification Checklist

Before any agent marks a UI task as complete, it must verify this checklist:

| Anti-Pattern to Reject ❌ | Professional DYAD Standard ✅ |
| :--- | :--- |
| Huge, fuzzy purple glow blobs floating aimlessly | Crisp, purposeful neon vector polylines on a dark vector map |
| Nested card hell (card inside a card with redundant borders) | Single clean surface with subtle dividing lines (`divide-white/5`) |
| Arbitrary CSS values like `mt-[17px]` or `p-[21px]` | Strict 4px/8px rhythm (`mt-4`, `p-5`, `gap-3`) |
| Jittery live stats during data updates | Monospace font with tabular numerals (`font-mono tabular-nums`) |
| Generic centered SaaS hero with stock illustration | High-impact interactive map canvas with live macro telemetry ticker |
| Jarring CSS transitions like `transition: all 0.3s ease` | Natural physics springs (`stiffness: 300, damping: 32`) |
| Unclickable, static dossier metrics | Bi-directional interactive cards that trigger 3D camera `map.flyTo()` |
| Over-saturated rainbow UI with no visual hierarchy | Deep dark canvas with high-contrast, deliberate focal accents |

---

## 6. Quick Copy-Paste Reference for Agents

```tsx
// Standard DYAD Card Primitive
export function DyadCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5 p-5 ${className}`}>
      {/* Specular top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </div>
  );
}

// Standard DYAD Telemetry Metric Display
export function DyadMetric({ label, value, unit, sentiment = "neutral" }: MetricProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold tabular-nums text-white">{value}</span>
        {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
      </div>
    </div>
  );
}
```

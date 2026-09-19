"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Crosshair,
  Leaf,
  MapPin,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrainFront,
  Users,
} from "lucide-react";
import { motionSprings } from "@/lib/motion";
import type {
  CorridorMetrics,
  LngLat,
  POICategory,
  PresetCorridor,
} from "@/types/contracts";

interface DossierProps {
  metrics: CorridorMetrics | null;
  originName: string | null;
  terminusName: string | null;
  presets: PresetCorridor[];
  onSelectPreset: (preset: PresetCorridor) => void;
  onReset: () => void;
  onFlyTo: (target: {
    coordinates: LngLat;
    zoom: number;
    pitch: number;
    bearing?: number;
  }) => void;
}

const nf = new Intl.NumberFormat("en-IN");

function fmt(n: number) {
  return nf.format(Math.round(n));
}

function ratingColor(rating: string) {
  if (rating.startsWith("Highly")) return "text-emerald-400";
  if (rating.startsWith("Recommended")) return "text-amber-400";
  return "text-red-400";
}

const poiIcon: Record<POICategory, string> = {
  corporate: "#22D3EE",
  healthcare: "#EF4444",
  education: "#F59E0B",
  transit: "#A855F7",
  civic: "#94A3B8",
};

function ScoreRing({ score }: { score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const tone =
    score >= 78 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <motion.circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * score) / 100 }}
          transition={motionSprings.smooth}
          style={{ filter: `drop-shadow(0 0 6px ${tone})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-bold tabular-nums text-white">
          {score}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          / 100
        </span>
      </div>
    </div>
  );
}

function PillarCard({
  icon: Icon,
  title,
  accent,
  score,
  children,
}: {
  icon: typeof Users;
  title: string;
  accent: string;
  score: number;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" strokeWidth={2} style={{ color: accent }} />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {title}
          </span>
        </div>
        <span className="font-mono text-xs font-semibold tabular-nums text-slate-400">
          {score}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  tone = "text-white",
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className="flex items-baseline gap-1">
        <span className={`font-mono text-sm font-semibold tabular-nums ${tone}`}>
          {value}
        </span>
        {unit && <span className="text-[10px] text-slate-500">{unit}</span>}
      </span>
    </div>
  );
}

export function AuthorityDossier({
  metrics,
  originName,
  terminusName,
  presets,
  onSelectPreset,
  onReset,
  onFlyTo,
}: DossierProps) {
  return (
    <aside className="pointer-events-auto absolute right-4 top-4 bottom-4 z-20 flex w-[420px] max-w-[calc(100vw-2rem)] flex-col">
      <div className="dyad-glass flex h-full flex-col overflow-hidden rounded-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 ring-1 ring-sky-400/30">
              <Crosshair className="h-4 w-4 text-sky-400" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white">
                DYAD
              </h1>
              <p className="text-[11px] text-slate-400">
                Authority Feasibility Dossier
              </p>
            </div>
          </div>
          {metrics && (
            <motion.button
              onClick={onReset}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={motionSprings.snappy}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-white/[0.06]"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </motion.button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <AnimatePresence mode="wait">
            {!metrics ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={motionSprings.smooth}
                className="space-y-5"
              >
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <p className="text-sm leading-relaxed text-slate-300">
                    Assess a candidate metro corridor in{" "}
                    <span className="font-semibold text-white">under 4 seconds</span>.
                  </p>
                  <ol className="mt-3 space-y-2 text-[13px] text-slate-400">
                    <li className="flex gap-2">
                      <span className="font-mono text-sky-400">1.</span>
                      Click a glowing metro station to snap an{" "}
                      <span className="text-sky-300">origin</span>.
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono text-sky-400">2.</span>
                      Click anywhere to drop a{" "}
                      <span className="text-rose-300">terminus pin</span>.
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono text-sky-400">3.</span>
                      Turf.js projects a 2km catchment and scores it instantly.
                    </li>
                  </ol>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <Sparkles className="h-3.5 w-3.5 text-sky-400" /> Preset
                    Corridors
                  </p>
                  <div className="space-y-2">
                    {presets.map((p) => (
                      <motion.button
                        key={p.id}
                        onClick={() => onSelectPreset(p)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        transition={motionSprings.snappy}
                        className="flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 text-left hover:bg-white/[0.06]"
                      >
                        <span className="text-[13px] font-medium text-slate-200">
                          {p.name}
                        </span>
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="dossier"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={motionSprings.smooth}
                className="space-y-4"
              >
                {/* Corridor header + score */}
                <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <ScoreRing score={metrics.overallScore} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {originName} → {terminusName}
                    </p>
                    <p
                      className={`mt-0.5 text-xs font-semibold ${ratingColor(metrics.feasibilityRating)}`}
                    >
                      {metrics.feasibilityRating}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="font-mono tabular-nums text-slate-200">
                        {metrics.distanceKm.toFixed(1)} km
                      </span>
                      <span>·</span>
                      <span className="font-mono tabular-nums text-slate-200">
                        2.0 km catchment
                      </span>
                    </div>
                  </div>
                </div>

                {/* Commute delta highlight */}
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      Peak Road
                    </span>
                    <span className="font-mono text-lg font-bold tabular-nums text-red-400">
                      {Math.round(metrics.peakRoadMins)}m
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      Via Metro
                    </span>
                    <span className="font-mono text-lg font-bold tabular-nums text-sky-400">
                      {Math.round(metrics.metroMins)}m
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      Saved
                    </span>
                    <span className="font-mono text-lg font-bold tabular-nums text-emerald-400">
                      {Math.round(metrics.timeSavedPct)}%
                    </span>
                  </div>
                </div>

                {/* Four pillars */}
                <div className="grid grid-cols-1 gap-3">
                  <PillarCard
                    icon={Users}
                    title="Transit Equity"
                    accent="#38BDF8"
                    score={Math.min(100, Math.round(metrics.catchmentPopulation / 4000))}
                  >
                    <Stat label="Catchment population" value={fmt(metrics.catchmentPopulation)} />
                    <Stat label="POIs served" value={fmt(metrics.poisInCatchment.length)} />
                  </PillarCard>

                  <PillarCard
                    icon={Building2}
                    title="Economic Productivity"
                    accent="#22D3EE"
                    score={Math.min(100, 40 + metrics.techParksConnected * 18)}
                  >
                    <Stat label="Tech parks connected" value={fmt(metrics.techParksConnected)} />
                    <Stat
                      label="Annual hours saved"
                      value={fmt(metrics.annualHoursSaved)}
                      unit="hrs"
                      tone="text-emerald-400"
                    />
                  </PillarCard>

                  <PillarCard
                    icon={Leaf}
                    title="Climate & Decarbonization"
                    accent="#10B981"
                    score={Math.min(100, Math.round(metrics.annualCo2OffsetTons / 200))}
                  >
                    <Stat
                      label="Car trips eliminated / day"
                      value={fmt(metrics.dailyCarTripsEliminated)}
                    />
                    <Stat
                      label="Annual CO₂ offset"
                      value={fmt(metrics.annualCo2OffsetTons)}
                      unit="tons"
                      tone="text-emerald-400"
                    />
                  </PillarCard>

                  <PillarCard
                    icon={ShieldAlert}
                    title="Corridor Friction"
                    accent={metrics.lakeWarnings.length ? "#F59E0B" : "#10B981"}
                    score={Math.max(20, 100 - metrics.lakeWarnings.length * 25)}
                  >
                    {metrics.lakeWarnings.length ? (
                      metrics.lakeWarnings.map((w, i) => (
                        <p key={i} className="text-[11px] leading-relaxed text-amber-300/90">
                          {w}
                        </p>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        No NGT lake-buffer conflicts detected along the alignment.
                      </p>
                    )}
                  </PillarCard>
                </div>

                {/* Focal points -> flyTo */}
                {metrics.poisInCatchment.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-sky-400" /> Focal Points
                    </p>
                    <div className="space-y-2">
                      {metrics.poisInCatchment.slice(0, 5).map((poi) => (
                        <motion.button
                          key={poi.id}
                          onClick={() =>
                            onFlyTo({
                              coordinates: poi.coordinates,
                              zoom: 15,
                              pitch: 52,
                              bearing: 20,
                            })
                          }
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          transition={motionSprings.snappy}
                          className="flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-left hover:bg-white/[0.06]"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: poiIcon[poi.category],
                                boxShadow: `0 0 8px ${poiIcon[poi.category]}`,
                              }}
                            />
                            <span className="text-[13px] text-slate-200">
                              {poi.name}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-sky-400">
                            <TrainFront className="h-3 w-3" /> Fly
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-white/[0.08] px-5 py-2.5">
          <p className="text-center text-[10px] text-slate-500">
            Tier-1 deterministic spatial compute · Turf.js ·{" "}
            <span className="font-mono">&lt; 20ms</span>
          </p>
        </div>
      </div>
    </aside>
  );
}

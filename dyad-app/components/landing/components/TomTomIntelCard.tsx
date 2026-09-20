'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CITIES_CONFIG } from '../data/citiesConfig';
import { ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { motionSprings } from '../../../lib/motion';

interface TomTomIntelCardProps {
  activeCityKey: string;
  onExploreClick?: () => void;
}

export function TomTomIntelCard({ activeCityKey }: TomTomIntelCardProps) {
  const city = CITIES_CONFIG[activeCityKey] || CITIES_CONFIG.bengaluru;

  return (
    <div className="fixed bottom-8 left-8 z-30 max-w-[460px] w-full pointer-events-auto select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={city.id}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={motionSprings.smooth}
          // SOLID PURE WHITE CONTAINER (MATCHING TOMTOM SCREENSHOT FOR ZERO READABILITY STRAIN)
          className="relative rounded-[28px] bg-white text-slate-950 p-7 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-slate-200/90"
        >
          {/* CITY BADGE & LIVE STATUS */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E52020] animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                {city.badge}
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-700 px-2.5 py-0.5 rounded-full bg-slate-100">
              TomTom Index 2025/26
            </span>
          </div>

          {/* MAIN PROMINENT HEADLINE (MATCHING USER SCREENSHOT: "Compared to 2024, New Delhi saw...") */}
          <h3 className="font-sans text-2xl sm:text-[26px] font-extrabold text-slate-950 leading-tight tracking-tight mb-3">
            {city.intelHeadline}
          </h3>

          {/* SUPPORTING TEXT */}
          <p className="text-slate-700 text-xs sm:text-[13px] font-medium leading-relaxed mb-5">
            {city.intelSubtext}
          </p>

          {/* TELEMETRY ROW (HIGH CONTRAST ON LIGHT GRAY PILL) */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono font-semibold text-slate-700">Peak Road</span>
              <span className="font-mono text-base font-extrabold text-[#E52020] tabular-nums">
                {city.metrics.peakSpeed}
              </span>
            </div>
            <div className="flex flex-col border-x border-slate-200 px-2">
              <span className="text-[10px] uppercase font-mono font-semibold text-slate-700">Annual Loss</span>
              <span className="font-mono text-base font-extrabold text-slate-900 tabular-nums">
                {city.metrics.annualLoss}
              </span>
            </div>
            <div className="flex flex-col pl-1">
              <span className="text-[10px] uppercase font-mono font-semibold text-slate-700">Corridor Load</span>
              <span className="font-mono text-base font-extrabold text-[#0ab1ba] tabular-nums">
                {city.metrics.pphpd}
              </span>
            </div>
          </div>

          {/* EXPLORE ACTION BUTTON (MATCHING TOMTOM SCREENSHOT RED PILL BUTTON) */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={motionSprings.snappy}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#E52020] hover:bg-[#c91818] text-white font-sans text-sm font-bold tracking-wide shadow-lg shadow-[#E52020]/30 transition-all cursor-pointer"
              >
                <span>{city.buttonText}</span>
                <ArrowRight className="size-4" />
              </motion.button>
            </Link>

            <Link href="/agents">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={motionSprings.snappy}
                title="View Modal Swarm Agent Intelligence"
                className="p-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer border border-slate-200"
              >
                <Activity className="size-4 text-[#0ab1ba]" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default TomTomIntelCard;

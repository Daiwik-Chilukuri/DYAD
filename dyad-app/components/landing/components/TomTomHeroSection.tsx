'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BotLogo } from '../../BotLogo';
import { CITIES_CONFIG, CityConfig } from '../data/citiesConfig';
import { motionSprings } from '../../../lib/motion';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';

interface TomTomHeroSectionProps {
  activeCityKey: string;
  onCitySelect: (cityKey: string) => void;
  onScrollDownClick: () => void;
}

const CITIES_TABS = [
  { id: 'india', label: 'Country' },
  { id: 'bengaluru', label: 'Bengaluru' },
  { id: 'delhi', label: 'Delhi' },
  { id: 'hyderabad', label: 'Hyderabad' },
];

export function TomTomHeroSection({
  activeCityKey,
  onCitySelect,
  onScrollDownClick,
}: TomTomHeroSectionProps) {
  const currentCity = CITIES_CONFIG[activeCityKey] || CITIES_CONFIG.india;

  return (
    <section className="relative w-full h-screen min-h-[640px] flex flex-col justify-between p-6 sm:p-8 pointer-events-none select-none">
      
      {/* 1. TOP BAR: DYAD BRAND (LEFT), TOMTOM WHITE PILL SWITCHER (CENTER), LAUNCH (RIGHT) */}
      <div className="relative z-30 flex items-center justify-between w-full">
        
        {/* TOP LEFT: DYAD LOGO */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
              <BotLogo className="size-5.5" isActive={true} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-white tracking-tight leading-none drop-shadow-md">
                Dyad
              </span>
              <span className="text-[10px] font-mono text-slate-300 font-semibold drop-shadow-sm mt-0.5">
                Autonomous Transit DPR
              </span>
            </div>
          </Link>
        </div>

        {/* TOP CENTER: TOMTOM PURE WHITE PILL SWITCHER (EXACT MATCH TO INSPIRATION IMAGE) */}
        <div className="pointer-events-auto">
          <div className="relative flex items-center p-1 sm:p-1.5 rounded-full bg-white shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-slate-200/90">
            {CITIES_TABS.map((city) => {
              const isActive = activeCityKey === city.id;
              return (
                <button
                  key={city.id}
                  onClick={() => onCitySelect(city.id)}
                  className={`relative px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors cursor-pointer select-none ${
                    isActive ? 'text-white' : 'text-slate-900 hover:text-black hover:bg-slate-100/80'
                  }`}
                >
                  {/* ACTIVE RED PILL */}
                  {isActive && (
                    <motion.div
                      layoutId="tomtom-active-pill"
                      className="absolute inset-0 rounded-full bg-[#E52020] shadow-md shadow-[#E52020]/35"
                      transition={motionSprings.snappy}
                    />
                  )}
                  <span className="relative z-10">{city.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TOP RIGHT: LAUNCH WAR ROOM CTA */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-3">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={motionSprings.snappy}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-lg shadow-black/30 border border-slate-200 transition-all cursor-pointer"
            >
              <span>Launch War Room</span>
              <ArrowUpRight className="size-3.5 text-[#E52020]" />
            </motion.button>
          </Link>
        </div>

      </div>

      {/* 2. FLOATING WHITE CARD ON THE LEFT (EXACT MATCH TO INSPIRATION IMAGE) */}
      <div className="relative z-30 max-w-md w-[calc(100%-2rem)] sm:w-[440px] pointer-events-auto my-auto ml-2 sm:ml-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCity.id}
            initial={{ opacity: 0, x: -20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.96 }}
            transition={motionSprings.smooth}
            // PURE WHITE CARD WITH LARGE ROUNDED CORNERS (EXACT TOMTOM REFERENCE)
            className="rounded-[28px] bg-white text-slate-950 p-8 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-slate-200/90"
          >
            {/* BIG BOLD HEADLINE */}
            <h2 className="font-sans text-2xl sm:text-[28px] font-extrabold text-slate-950 leading-[1.2] tracking-tight mb-8">
              {currentCity.intelHeadline}
            </h2>

            {/* RED PILL ACTION BUTTON */}
            <Link href="/" className="inline-block">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={motionSprings.snappy}
                className="flex items-center justify-center gap-2.5 py-3.5 px-7 rounded-full bg-[#E52020] hover:bg-[#cc1818] text-white font-sans text-sm font-bold tracking-wide shadow-lg shadow-[#E52020]/30 transition-all cursor-pointer"
              >
                <span>{currentCity.buttonText}</span>
              </motion.button>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. BOTTOM SCROLL DOWN CALLOUT */}
      <div className="relative z-30 flex flex-col items-center pb-2 pointer-events-auto">
        <button
          onClick={onScrollDownClick}
          className="group flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-slate-300 drop-shadow-sm">
            Scroll to explore platform overview
          </span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown className="size-5 text-[#0ab1ba]" />
          </motion.div>
        </button>
      </div>

    </section>
  );
}

export default TomTomHeroSection;

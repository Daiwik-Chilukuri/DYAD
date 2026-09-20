'use client';

import React from 'react';
import { motion } from 'framer-motion';

const LETTERS = ['D', 'Y', 'A', 'D'];

export function LandingHero() {
  return (
    <section className="relative flex flex-col items-center text-center px-4 pt-16 pb-8 max-w-5xl mx-auto select-none">
      <div className="relative">
        {/* Luminous Ambient Backdrop Blur */}
        <div className="absolute inset-0 blur-3xl bg-white/[0.04] -z-10 rounded-full scale-125 pointer-events-none" />
        
        <div className="flex items-baseline justify-center">
          <div className="flex items-center justify-center gap-1 sm:gap-2.5">
            {LETTERS.map((letter, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: 'blur(6px)', y: 12 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08, ease: [0, 0, 0.2, 1] }}
                whileHover={{ scale: 1.04, y: -2 }}
                className="font-sans text-7xl sm:text-8xl md:text-9xl lg:text-[136px] font-black tracking-[-0.07em] text-white drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] transition-all cursor-default select-none inline-block"
                style={{
                  color: '#ffffff',
                  textShadow: '0 0 35px rgba(255,255,255,0.15)',
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Iconic Turquoise Accent Square */}
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: [0, 0, 0.2, 1] }}
            className="size-3.5 sm:size-5 md:size-6 ml-1 sm:ml-2 rounded-xs bg-[#0ab1ba] inline-block shadow-[0_0_20px_#0ab1ba] shrink-0"
          />
        </div>
      </div>
    </section>
  );
}

export default LandingHero;

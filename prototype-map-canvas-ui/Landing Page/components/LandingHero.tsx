'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { motionSprings } from '../../lib/motion';

export function LandingHero() {
  const letters = ['D', 'Y', 'A', 'D'];

  return (
    <section className="relative flex flex-col items-center text-center px-4 pt-16 pb-8 max-w-5xl mx-auto select-none">
      
      {/* MASSIVE METALLIC "DYAD." TYPOGRAPHY WITH ICONIC SIGNATURE TURQUOISE ACCENT SQUARE */}
      <div className="relative">
        {/* SUBTLE MULTI-LAYERED DEEP BLACK SHADOW OCCLUSION */}
        <div className="absolute inset-0 blur-3xl bg-white/[0.02] -z-10 rounded-full scale-125 pointer-events-none" />

        <div className="flex items-baseline justify-center">
          <div className="flex items-center justify-center gap-1 sm:gap-2.5">
            {letters.map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 35, scale: 0.94, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{
                  ...motionSprings.smooth,
                  delay: index * 0.07,
                }}
                whileHover={{ 
                  scale: 1.04, 
                  color: '#ffffff',
                  transition: { duration: 0.15 } 
                }}
                className="font-sans text-7xl sm:text-8xl md:text-9xl lg:text-[136px] font-black tracking-[-0.07em] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] transition-all cursor-default"
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* ICONIC SIGNATURE TURQUOISE ACCENT SQUARE */}
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...motionSprings.snappy, delay: 0.35 }}
            className="size-3.5 sm:size-5 md:size-6 ml-1 sm:ml-2 rounded-xs bg-[#0ab1ba] inline-block shadow-[0_0_20px_#0ab1ba] shrink-0"
          />
        </div>
      </div>

    </section>
  );
}

export default LandingHero;

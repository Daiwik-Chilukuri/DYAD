'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { LandingHeader } from './components/LandingHeader';
import { LandingHero } from './components/LandingHero';
import { MissionOverviewSection } from './components/MissionOverviewSection';
import { ProjectOverviewSection } from './components/ProjectOverviewSection';
import { LandingFooter } from './components/LandingFooter';
import { motionSprings } from '../lib/motion';

// Dynamic import FlashCardMapSection with SSR disabled since MapLibre uses window/WebGL
const FlashCardMapSection = dynamic(
  () => import('./components/FlashCardMapSection'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full max-w-6xl mx-auto h-[560px] rounded-[32px] bg-[#050507] border border-white/[0.08] flex items-center justify-center font-mono text-xs text-zinc-500 shadow-[0_30px_90px_rgba(0,0,0,1)]">
        Loading MapLibre 3D Vector Engine...
      </div>
    )
  }
);

export function LandingPage() {
  const router = useRouter();

  // Fix body scrolling: Next.js layout has overflow-hidden on body for the war room map tool.
  // We unlock scrolling on body while on the landing page and clean up when leaving.
  useEffect(() => {
    document.body.classList.remove('overflow-hidden');
    document.body.style.overflow = 'auto';
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.overflowY = 'auto';

    return () => {
      document.body.classList.add('overflow-hidden');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K to jump into War Room
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        router.push('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <div id="landing-scroll-container" className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#000000] text-foreground font-sans selection:bg-white/20 selection:text-white scroll-smooth">
      
      {/* 1. TOP NAVBAR */}
      <LandingHeader />

      {/* 2. HERO HEADLINE & INTRODUCTION */}
      <LandingHero />

      {/* 3. CENTERPIECE: FLASH CARD WITH CITY SELECTION OPTIONS ABOVE IT */}
      <div id="demo" className="scroll-mt-20">
        <FlashCardMapSection />
      </div>

      {/* 4. SEPARATE PURPOSE / MISSION OVERVIEW: "AUTOMATE THE GRUNT WORK" */}
      <div id="purpose" className="border-t border-white/[0.06] bg-[#000000] scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={motionSprings.smooth}
        >
          <MissionOverviewSection />
        </motion.div>
      </div>

      {/* 5. PLATFORM INSIGHTS & REAL-WORLD CORRIDORS */}
      <div id="insights" className="border-t border-white/[0.06] bg-[#000000] scroll-mt-20">
        
        {/* SOME PROJECTS & EDITORIAL TECHNICAL SPECIFICATIONS */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={motionSprings.smooth}
        >
          <div id="specs">
            <ProjectOverviewSection />
          </div>
        </motion.div>
      </div>

      {/* 6. FOOTER */}
      <LandingFooter />

    </div>
  );
}

export default LandingPage;

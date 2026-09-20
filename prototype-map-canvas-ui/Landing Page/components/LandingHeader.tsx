'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 inset-x-0 z-50 w-full bg-[#0c0c0e]/95 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
      {/* Downward ambient shadow shade to visually lift header above the canvas */}
      <div className="absolute inset-x-0 -bottom-6 h-6 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

      <div className="w-full px-6 sm:px-10 lg:px-14 py-5 sm:py-5.5 flex items-center justify-between relative z-10">
        
        {/* LEFT: DYAD WORDMARK LOGO (TOP-LEFT ANCHOR) */}
        <Link href="/" className="flex items-baseline gap-2.5 group select-none shrink-0" aria-label="DYAD home">
          <span className="font-sans text-3xl sm:text-4xl lg:text-[42px] font-black tracking-[-0.04em] text-white group-hover:text-zinc-200 transition-colors leading-none">
            DYAD
          </span>
          <span className="size-3 sm:size-3.5 lg:size-4 rounded-xs bg-[#0ab1ba] inline-block shadow-[0_0_14px_#0ab1ba] group-hover:shadow-[0_0_20px_#0ab1ba] transition-all shrink-0" />
        </Link>

        {/* CENTER: CLEAN NAVIGATION LINKS (GENEROUSLY SPACED, ZERO HOVER POPUPS) */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-14 text-base font-semibold text-zinc-400 select-none">
          <a 
            href="#demo" 
            className="hover:text-white transition-colors py-1"
          >
            Home
          </a>

          <a 
            href="#purpose" 
            className="hover:text-white transition-colors py-1"
          >
            The Purpose
          </a>

          <a 
            href="#insights" 
            className="hover:text-white transition-colors py-1"
          >
            Platform Insights
          </a>

          <a 
            href="#swarm" 
            className="hover:text-white transition-colors py-1"
          >
            Multi-Agent Pipeline
          </a>
        </nav>

        {/* RIGHT: LOGIN AND SIGN UP BUTTONS */}
        <div className="hidden lg:flex items-center gap-3 select-none shrink-0">
          <Link 
            href="/login"
            className="rounded-full px-5 py-3 text-base font-semibold text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            Log in
          </Link>

          <Link 
            href="/signup"
            className="rounded-full bg-white px-7 py-3 text-base font-extrabold text-black shadow-[0_4px_18px_rgba(255,255,255,0.18)] hover:bg-zinc-200 hover:shadow-[0_6px_24px_rgba(255,255,255,0.26)] transition-all"
          >
            Sign up
          </Link>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-[#0a0a0c] border border-white/10 text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE EXPANDABLE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-6 py-5 border-t border-white/[0.06] bg-[#0c0c0e] space-y-4 select-none">
          <a
            href="#demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-zinc-300 hover:text-white py-1"
          >
            Home
          </a>
          <a
            href="#purpose"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-zinc-300 hover:text-white py-1"
          >
            The Purpose
          </a>
          <a
            href="#insights"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-zinc-300 hover:text-white py-1"
          >
            Platform Insights
          </a>
          <a
            href="#swarm"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-zinc-300 hover:text-white py-1"
          >
            Multi-Agent Pipeline
          </a>
          <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-3.5 text-base font-semibold text-zinc-300 hover:text-white rounded-xl border border-white/10 bg-white/[0.03] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-3.5 text-base font-extrabold text-black bg-white hover:bg-zinc-200 rounded-xl shadow-sm transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}

    </header>
  );
}

export default LandingHeader;

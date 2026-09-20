'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motionSprings } from '../../../lib/motion';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-between selection:bg-[#0ab1ba]/30 font-sans">
      {/* TOP HEADER */}
      <header className="w-full px-6 sm:px-12 py-6 flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c0e]/80 backdrop-blur-xl">
        <Link href="/landing" className="flex items-baseline gap-2 group">
          <span className="font-sans text-2xl font-black tracking-[-0.06em] text-white group-hover:text-zinc-200 transition-colors">
            DYAD
          </span>
          <span className="size-2 rounded-xs bg-[#0ab1ba] inline-block shadow-[0_0_12px_#0ab1ba]" />
        </Link>
        <Link
          href="/landing"
          className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Landing</span>
        </Link>
      </header>

      {/* CENTER SIGNUP CARD */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={motionSprings.smooth}
          className="w-full max-w-md rounded-2xl bg-[#09090c] border border-white/[0.08] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] ring-1 ring-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="size-1.5 rounded-full bg-[#0ab1ba]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              New Authority Clearance
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Request Dyad Access
          </h1>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Deploy autonomous DPR reconnaissance for your metropolitan transit authority.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); window.location.href = '/'; }} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                Full Name & Title
              </label>
              <input
                type="text"
                placeholder="Chief Planning Officer / Senior Urban Modeler"
                defaultValue="Urban Transit Planner"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050508] border border-white/10 text-sm text-white focus:outline-none focus:border-[#0ab1ba] transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                Agency / Transit Authority Domain
              </label>
              <input
                type="email"
                placeholder="official@metro.gov.in"
                defaultValue="director@bmrcl.kar.nic.in"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050508] border border-white/10 text-sm text-white focus:outline-none focus:border-[#0ab1ba] transition-colors font-mono"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={motionSprings.snappy}
              className="w-full mt-2 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(255,255,255,0.15)] transition-all cursor-pointer"
            >
              <span>Initialize Workspace & Launch</span>
              <ArrowRight className="size-4" />
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
            <span>Already have access?</span>
            <Link href="/login" className="text-[#0ab1ba] hover:underline font-medium">
              Log in
            </Link>
          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <footer className="w-full px-6 py-4 border-t border-white/[0.04] text-center text-xs font-mono text-zinc-600">
        Dyad Transit Command • Fast-Track Municipal Pre-Feasibility
      </footer>
    </div>
  );
}

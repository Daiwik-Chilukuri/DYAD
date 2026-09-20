'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Database, Compass, LocateFixed, CircleUser } from 'lucide-react';
import { motionSprings } from '../../lib/motion';
import { BotLogo } from '../BotLogo';
import { cn } from '../../lib/utils';

export interface SidebarRailProps {
  /** Optional callback triggered when clicking the Align / Dashboard item (e.g. uncollapsing panel) */
  onAlignClick?: () => void;
  className?: string;
}

export function SidebarRail({ onAlignClick, className }: SidebarRailProps) {
  const pathname = usePathname();

  const isHomeActive = pathname === '/' || pathname === '/landing';
  const isDataActive = Boolean(pathname?.startsWith('/data'));
  const isCollectorActive = Boolean(pathname?.startsWith('/collector'));
  const isAlignActive = Boolean(pathname?.startsWith('/dashboard'));
  const isSwarmActive = Boolean(pathname?.startsWith('/agents'));

  return (
    <aside
      className={cn(
        'relative z-30 w-[68px] flex flex-col items-center border-r border-white/[0.08] bg-[#0E1117]/95 backdrop-blur-xl py-4 h-full shrink-0 select-none',
        className
      )}
    >
      {/* 1. HOME BUTTON */}
      <Link
        href="/"
        title="DYAD Public Landing Page"
        className="flex flex-col items-center gap-1 group cursor-pointer mb-5"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          transition={motionSprings.snappy}
          className={cn(
            'w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm transition-all',
            isHomeActive
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500/20'
          )}
        >
          <Home className="size-5" />
        </motion.div>
        <span
          className={cn(
            'text-[8.5px] font-mono tracking-wider transition-colors',
            isHomeActive
              ? 'text-emerald-400 font-semibold'
              : 'font-medium text-slate-400 group-hover:text-emerald-400'
          )}
        >
          HOME
        </span>
      </Link>

      {/* 2. CORE WORKSPACE NAVIGATION */}
      <nav className="flex flex-col gap-3.5 items-center w-full">
        {/* DATA */}
        <Link
          href="/data"
          title="Data Ingestion & Synthesis Studio"
          className="flex flex-col items-center gap-1 group cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={motionSprings.snappy}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm',
              isDataActive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                : 'text-slate-400 group-hover:text-white group-hover:bg-white/[0.06] border-transparent'
            )}
          >
            <Database className="size-5" />
          </motion.div>
          <span
            className={cn(
              'text-[8.5px] font-mono tracking-wider transition-colors',
              isDataActive
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-500 group-hover:text-slate-300 font-normal'
            )}
          >
            DATA
          </span>
        </Link>

        {/* COLLECT */}
        <Link
          href="/collector"
          title="Autonomous Browser-Use Dataset Collector Studio"
          className="flex flex-col items-center gap-1 group cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={motionSprings.snappy}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm',
              isCollectorActive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                : 'text-slate-400 group-hover:text-white group-hover:bg-white/[0.06] border-transparent'
            )}
          >
            <Compass className="size-5" />
          </motion.div>
          <span
            className={cn(
              'text-[8.5px] font-mono tracking-wider transition-colors',
              isCollectorActive
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-500 group-hover:text-slate-300 font-normal'
            )}
          >
            COLLECT
          </span>
        </Link>

        {/* ALIGN */}
        <Link
          href="/dashboard"
          title="Corridor GPS Alignment Canvas"
          className="flex flex-col items-center gap-1 group cursor-pointer"
          onClick={onAlignClick}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={motionSprings.snappy}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm',
              isAlignActive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                : 'text-slate-400 group-hover:text-white group-hover:bg-white/[0.06] border-transparent'
            )}
          >
            <LocateFixed className="size-5" />
          </motion.div>
          <span
            className={cn(
              'text-[8.5px] font-mono tracking-wider transition-colors',
              isAlignActive
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-500 group-hover:text-slate-300 font-normal'
            )}
          >
            ALIGN
          </span>
        </Link>

        {/* SWARM */}
        <Link
          href="/agents"
          title="Autonomous Multi-Agent Swarm Intelligence"
          className="flex flex-col items-center gap-1 group cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={motionSprings.snappy}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm',
              isSwarmActive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                : 'text-slate-400 group-hover:text-white group-hover:bg-white/[0.06] border-transparent'
            )}
          >
            <BotLogo className="size-5" isActive={isSwarmActive} />
          </motion.div>
          <span
            className={cn(
              'text-[8.5px] font-mono tracking-wider transition-colors',
              isSwarmActive
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-500 group-hover:text-slate-300 font-normal'
            )}
          >
            SWARM
          </span>
        </Link>
      </nav>

      {/* 3. USER PROFILE (PINNED AT BOTTOM) */}
      <div className="mt-auto flex flex-col items-center gap-1">
        <button
          type="button"
          title="User Profile & Authority Credentials"
          className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-emerald-500/30 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer group shadow-sm"
        >
          <CircleUser className="size-5 text-slate-400 group-hover:text-emerald-300 transition-colors" />
        </button>
        <span className="text-[8.5px] font-mono text-slate-500 tracking-wider">USER</span>
      </div>
    </aside>
  );
}

export default SidebarRail;

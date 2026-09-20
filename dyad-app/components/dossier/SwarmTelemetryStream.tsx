'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Terminal,
  Radio,
  Copy,
  Check,
  Search,
  Filter,
  ArrowDownToLine,
  Layers,
  Users,
  Briefcase,
  Navigation,
  Trees,
} from 'lucide-react';
import { motionSprings } from '../../lib/motion';
import type { SwarmAgentState, SwarmTelemetryLog } from '../../types/dossier';

interface SwarmTelemetryStreamProps {
  isScanning: boolean;
  agents: Record<string, SwarmAgentState>;
  logs: SwarmTelemetryLog[];
  stage?: string;
  className?: string;
}

type LogCategory = 'ALL' | 'AGENTS' | 'SPATIAL' | 'CAMERA' | 'SYSTEM';

const getDomainIcon = (domain: string, className = 'size-3.5') => {
  switch (domain?.toLowerCase()) {
    case 'visualizer':
      return <Layers className={className} />;
    case 'demographics':
      return <Users className={className} />;
    case 'economic':
      return <Briefcase className={className} />;
    case 'mobility':
      return <Navigation className={className} />;
    case 'ecological':
      return <Trees className={className} />;
    default:
      return <Activity className={className} />;
  }
};

const getDomainColor = (domain: string) => {
  switch (domain?.toLowerCase()) {
    case 'visualizer':
      return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
    case 'demographics':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    case 'economic':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'mobility':
      return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    case 'ecological':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    default:
      return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  }
};

export function SwarmTelemetryStream({
  isScanning,
  agents,
  logs,
  stage = 'Idle',
  className = '',
}: SwarmTelemetryStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<LogCategory>('ALL');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll logs to latest entry when autoScroll is enabled
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Copy logs handler
  const handleCopyLogs = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined') {
      const text = logs
        .map(
          (l) =>
            `[${new Date(l.timestamp).toLocaleTimeString('en-IN', { hour12: false })}] ${l.message}`
        )
        .join('\n');
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  // Filter logs by category and search
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const msg = log.message.toLowerCase();
      // Category filter
      if (activeCategory === 'AGENTS') {
        if (!msg.includes('agent') && !msg.includes('subagent') && !msg.includes('completed') && !msg.includes('spawned'))
          return false;
      } else if (activeCategory === 'SPATIAL') {
        if (!msg.includes('buffer') && !msg.includes('polygon') && !msg.includes('poi') && !msg.includes('ward') && !msg.includes('feature'))
          return false;
      } else if (activeCategory === 'CAMERA') {
        if (!msg.includes('camera') && !msg.includes('focusing') && !msg.includes('station'))
          return false;
      } else if (activeCategory === 'SYSTEM') {
        if (!msg.includes('plan') && !msg.includes('corridor') && !msg.includes('evaluation') && !msg.includes('done'))
          return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        return msg.includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [logs, activeCategory, searchQuery]);

  return (
    <div className={`flex flex-col gap-3 h-full ${className}`}>
      {/* 1. Header Bar with Radar Pulse & Stage */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/40 border border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center size-3">
            {isScanning ? (
              <>
                <span className="absolute size-3 rounded-full bg-cyan-400/40 animate-ping" />
                <span className="size-2 rounded-full bg-cyan-400" />
              </>
            ) : (
              <span className="size-2 rounded-full bg-emerald-400" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-medium text-white tracking-tight">
              {isScanning ? 'Multi-Agent Swarm Calculating' : 'Swarm Audit Complete'}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              ({Object.values(agents).filter((a) => a.status === 'completed').length}/{Object.keys(agents).length} Ready)
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
          {stage}
        </span>
      </div>

      {/* 2. Subagent Specialized Chips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {Object.entries(agents).map(([key, agent]) => {
          const isCompleted = agent.status === 'completed';
          const isRunning = agent.status === 'running';
          const isError = agent.status === 'error';
          const domain = agent.domain || key;

          return (
            <motion.div
              key={key}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border transition-colors ${
                isCompleted
                  ? 'bg-[#161B22] border-emerald-500/30 text-slate-200'
                  : isRunning
                  ? 'bg-[#161B22] border-cyan-500/40 text-white shadow-[0_0_12px_rgba(0,245,212,0.1)]'
                  : isError
                  ? 'bg-[#161B22] border-rose-500/30 text-rose-300'
                  : 'bg-[#161B22]/60 border-white/[0.05] text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`p-1 rounded-lg border shrink-0 ${getDomainColor(domain)}`}>
                  {getDomainIcon(domain, 'size-3.5')}
                </span>
                <span className="text-[11.5px] font-sans font-medium truncate">
                  {agent.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-1">
                {agent.durationSec != null ? (
                  <span className="text-[10px] font-mono tabular-nums text-emerald-400 font-semibold">
                    {agent.durationSec.toFixed(2)}s
                  </span>
                ) : isRunning ? (
                  <span className="text-[10px] font-mono tabular-nums text-cyan-400 animate-pulse">
                    RUNNING
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-600">IDLE</span>
                )}
                {isRunning ? (
                  <Loader2 className="size-3 text-cyan-400 animate-spin shrink-0" />
                ) : isCompleted ? (
                  <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                ) : isError ? (
                  <AlertCircle className="size-3 text-rose-400 shrink-0" />
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Real-Time Telemetry Terminal Logs (Expanded & Full-Height) */}
      <div className="flex flex-col gap-2 rounded-2xl bg-black/60 border border-white/[0.08] p-3 shadow-xl shadow-black/40 flex-1 min-h-[480px]">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-400">
              <Terminal className="size-3.5" />
              <span className="text-[10.5px] font-mono font-semibold uppercase tracking-wide">
                Activity Terminal
              </span>
            </div>
            <span className="text-[10px] font-mono tabular-nums text-slate-400">
              {filteredLogs.length} / {logs.length} events
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer text-[10px] font-mono flex items-center gap-1 ${
                autoScroll
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
              }`}
              title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll paused'}
            >
              <ArrowDownToLine className="size-3" />
              <span className="hidden sm:inline">Follow</span>
            </button>

            {/* Copy logs button */}
            <button
              onClick={handleCopyLogs}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-[10px] font-mono flex items-center gap-1"
              title="Copy terminal events to clipboard"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 py-1">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terminal events..."
              className="w-full pl-7 pr-3 py-1 text-[10.5px] font-mono bg-black/40 border border-white/[0.06] rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
            {(['ALL', 'AGENTS', 'SPATIAL', 'CAMERA', 'SYSTEM'] as LogCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 rounded-md text-[9.5px] font-mono transition-colors shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.04]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Event Stream (Longer & Taller to Cover Dashboard) */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-[380px] max-h-[580px] overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-1 pr-1.5 select-text scrollbar-thin scrollbar-thumb-white/10"
        >
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-2 text-slate-600">
              <Terminal className="size-6 text-slate-700" />
              <span className="italic text-[11px]">
                {logs.length === 0
                  ? 'Awaiting corridor evaluation trigger...'
                  : 'No events matching search filter.'}
              </span>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const msg = log.message;
              const isDone = msg.includes('completed') || msg.includes('done');
              const isCamera = msg.includes('Focusing camera');
              const isFeature = msg.includes('features') || msg.includes('GeoJSON');
              const isSubagent = msg.includes('Subagent') || msg.includes('spawned');

              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 py-0.5 px-1.5 rounded hover:bg-white/[0.03] transition-colors ${
                    isDone
                      ? 'text-emerald-300 font-semibold'
                      : isCamera
                      ? 'text-yellow-300/90'
                      : isFeature
                      ? 'text-cyan-300'
                      : isSubagent
                      ? 'text-purple-300'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-600 shrink-0 tabular-nums text-[9.5px] w-6 text-right">
                    {index + 1}
                  </span>
                  <span className="text-slate-500 shrink-0 tabular-nums text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                  </span>
                  <span
                    className={`shrink-0 text-[10px] ${
                      isDone
                        ? 'text-emerald-400'
                        : isCamera
                        ? 'text-yellow-400'
                        : isFeature
                        ? 'text-cyan-400'
                        : 'text-slate-500'
                    }`}
                  >
                    ›
                  </span>
                  <span className="break-words font-normal">
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Blinking Interactive Shell Prompt at Terminal Foot */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05] text-[10.5px] font-mono text-slate-500 select-none">
          <span className="text-emerald-400 font-bold">dyad-swarm@modal-cloud</span>
          <span className="text-slate-600">:</span>
          <span className="text-cyan-400 font-semibold">~/orchestrator</span>
          <span className="text-slate-400">$</span>
          <span className="text-slate-400">
            {isScanning ? 'evaluating-corridor --live' : 'ready'}
          </span>
          <span className="size-2 bg-emerald-400 animate-pulse inline-block rounded-xs" />
        </div>
      </div>
    </div>
  );
}

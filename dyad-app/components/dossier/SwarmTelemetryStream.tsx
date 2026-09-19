'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle2, Loader2, AlertCircle, Terminal, Radio } from 'lucide-react';
import { motionSprings } from '../../lib/motion';
import type { SwarmAgentState, SwarmTelemetryLog } from '../../types/dossier';

interface SwarmTelemetryStreamProps {
  isScanning: boolean;
  agents: Record<string, SwarmAgentState>;
  logs: SwarmTelemetryLog[];
  stage?: string;
}

export function SwarmTelemetryStream({
  isScanning,
  agents,
  logs,
  stage = 'Idle',
}: SwarmTelemetryStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to latest entry
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Radar Scan Status Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center size-5">
            {isScanning ? (
              <>
                <span className="absolute size-4 rounded-full bg-emerald-400/25 animate-ping" />
                <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
              </>
            ) : (
              <span className="size-2 rounded-full bg-slate-500" />
            )}
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            {isScanning ? 'Multi-Agent Swarm Active' : 'Swarm Telemetry Standby'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
          <Radio className={`size-3 ${isScanning ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-[10.5px] font-mono tabular-nums text-slate-400 uppercase">
            {stage}
          </span>
        </div>
      </div>

      {/* 2. Subagent Specialized Chips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {Object.entries(agents).map(([key, agent]) => {
          const isCompleted = agent.status === 'completed';
          const isRunning = agent.status === 'running';
          const isError = agent.status === 'error';

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
                {isRunning ? (
                  <Loader2 className="size-3.5 text-cyan-400 animate-spin shrink-0" />
                ) : isCompleted ? (
                  <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                ) : isError ? (
                  <AlertCircle className="size-3.5 text-rose-400 shrink-0" />
                ) : (
                  <Activity className="size-3.5 text-slate-500 shrink-0" />
                )}
                <span className="text-[11.5px] font-sans font-medium truncate">
                  {agent.name}
                </span>
              </div>

              <div className="shrink-0 pl-1">
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
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Real-Time Telemetry Terminal Logs */}
      <div className="flex flex-col gap-1 rounded-xl bg-black/40 border border-white/[0.06] p-2.5">
        <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <Terminal className="size-3 text-cyan-400" />
            <span>Activity Log</span>
          </div>
          <span className="text-[9.5px] font-mono text-slate-500">
            {logs.length} events
          </span>
        </div>

        <div
          ref={scrollRef}
          className="h-28 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-1 pr-1 select-text scrollbar-thin scrollbar-thumb-white/10"
        >
          {logs.length === 0 ? (
            <span className="text-slate-600 italic text-[10.5px]">Awaiting corridor evaluation trigger...</span>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-500 shrink-0 tabular-nums text-[10px]">
                  {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                </span>
                <span className="text-cyan-400 shrink-0">›</span>
                <span className="break-words text-slate-300 font-normal">
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

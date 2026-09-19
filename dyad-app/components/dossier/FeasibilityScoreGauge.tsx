'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { motionSprings } from '../../lib/motion';

interface FeasibilityScoreGaugeProps {
  score: number;
  radius?: number;
  strokeWidth?: number;
  className?: string;
}

export function FeasibilityScoreGauge({
  score,
  radius = 54,
  strokeWidth = 8,
  className = '',
}: FeasibilityScoreGaugeProps) {
  // Parse and safely clamp score to [0, 100]
  const numericScore = typeof score === 'number' && !isNaN(score) ? score : 0;
  const clampedScore = Math.min(100, Math.max(0, numericScore));

  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = Math.max(0, circumference - (clampedScore / 100) * circumference);

  // Categorize sentiment
  let sentiment: 'optimal' | 'warning' | 'critical' = 'optimal';
  let color = '#10B981';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let verdict = 'High Feasibility / Prime Corridor';

  if (clampedScore >= 75.0) {
    sentiment = 'optimal';
    color = '#10B981';
    badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    verdict = 'High Feasibility / Prime Corridor';
  } else if (clampedScore >= 50.0) {
    sentiment = 'warning';
    color = '#F59E0B';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    verdict = 'Moderate Feasibility / Ecological Caveats';
  } else {
    sentiment = 'critical';
    color = '#EF4444';
    badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    verdict = 'High Friction / Severe Breaches';
  }

  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className={`flex items-center gap-4 p-3 rounded-xl bg-[#161B22]/60 border border-white/[0.06] ${className}`}>
      {/* SVG Radial Gauge */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="rotate-[-90deg] overflow-visible"
        >
          {/* Background Track Circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated Value Stroke */}
          <motion.circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={motionSprings.smooth}
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono tabular-nums text-xl font-bold text-white tracking-tight">
            {clampedScore.toFixed(1)}
          </span>
          <span className="text-[9.5px] font-mono uppercase text-slate-400">/ 100</span>
        </div>
      </div>

      {/* Verdict & Context */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium">
            Viability Index
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${badgeBg}`}>
            {sentiment.toUpperCase()}
          </span>
        </div>

        <h4 className="text-xs font-semibold text-slate-200 leading-tight">
          {verdict}
        </h4>

        <p className="text-[11px] text-slate-400 font-sans leading-snug">
          Synthesized across 5 specialized subagents, Namma Metro network topology, and BBMP spatial data.
        </p>
      </div>
    </div>
  );
}

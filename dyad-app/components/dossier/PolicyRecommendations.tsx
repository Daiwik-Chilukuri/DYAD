'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRightCircle } from 'lucide-react';

interface PolicyRecommendationsProps {
  recommendations: string[];
}

export function PolicyRecommendations({ recommendations = [] }: PolicyRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
          Policy & Statutory Directives
        </span>
        <span className="font-mono tabular-nums text-[11px] text-slate-500 font-semibold">
          {recommendations.length} Directives
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#161B22]/60 border border-white/[0.04] text-[11.5px] leading-relaxed text-slate-300 font-sans"
          >
            <ArrowRightCircle className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span className="flex-1">{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

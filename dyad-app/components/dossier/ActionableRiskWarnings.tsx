'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { motionSprings } from '../../lib/motion';
import type { RiskWarning } from '../../types/dossier';

interface ActionableRiskWarningsProps {
  warnings: RiskWarning[];
}

export function ActionableRiskWarnings({ warnings = [] }: ActionableRiskWarningsProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // 1. De-duplicate warnings by risk_id
  const uniqueWarningsMap = new Map<string, RiskWarning>();
  warnings.forEach((w) => {
    const id = w.risk_id || `risk-${w.headline || w.title || Math.random()}`;
    if (!uniqueWarningsMap.has(id)) {
      uniqueWarningsMap.set(id, { ...w, risk_id: id });
    }
  });
  const uniqueWarnings = Array.from(uniqueWarningsMap.values());

  // 2. Zero-risk empty state
  if (uniqueWarnings.length === 0) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs font-semibold text-emerald-300">
            Statutory Compliance Clearance
          </span>
          <span className="text-[11px] text-emerald-400/80">
            All statutory environmental and engineering checks passed.
          </span>
        </div>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return {
          badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          border: 'border-rose-500/25',
          icon: <AlertOctagon className="size-3.5 text-rose-400 shrink-0" />,
        };
      case 'HIGH':
        return {
          badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
          border: 'border-orange-500/25',
          icon: <AlertTriangle className="size-3.5 text-orange-400 shrink-0" />,
        };
      case 'MEDIUM':
        return {
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          border: 'border-amber-500/25',
          icon: <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />,
        };
      case 'LOW':
      default:
        return {
          badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          border: 'border-white/[0.08]',
          icon: <Info className="size-3.5 text-slate-400 shrink-0" />,
        };
    }
  };

  const sanitizeCategory = (cat?: string) => {
    const allowed = ['ECOLOGICAL', 'LAND_ACQUISITION', 'FINANCIAL', 'CIVIL_ENGINEERING'];
    if (cat && allowed.includes(cat.toUpperCase())) {
      return cat.toUpperCase();
    }
    return 'CIVIL_ENGINEERING';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
          Actionable Risk Warnings
        </span>
        <span className="font-mono tabular-nums text-[11px] text-slate-400 font-semibold">
          {uniqueWarnings.length} Flagged
        </span>
      </div>

      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
        {uniqueWarnings.map((w) => {
          const id = w.risk_id;
          const severity = (w.severity || 'MEDIUM').toUpperCase();
          const category = sanitizeCategory(w.category || w.pillar);
          const headline = w.headline || w.title || 'Corridor Engineering Flag';
          const description = w.description || 'Statutory review required for alignment segment.';
          const rawMitigation = w.mitigation_step || w.action_required || '';
          const mitigation =
            rawMitigation.trim() ||
            (severity === 'CRITICAL'
              ? 'Immediate civil realignment required to avoid statutory breach.'
              : 'Allocate technical review and contingency mitigation.');

          const styles = getSeverityStyle(severity);
          const isExpanded = !!expandedIds[id];
          const isLongDescription = description.length > 140;

          return (
            <motion.div
              key={id}
              layout
              className={`flex flex-col gap-2 p-3 rounded-xl bg-[#161B22]/70 border ${styles.border} transition-colors`}
            >
              {/* Header: Severity Badge + Category */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {styles.icon}
                  <h5 className="text-xs font-semibold text-slate-200 truncate">
                    {headline}
                  </h5>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${styles.badge}`}>
                    {severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">
                    {category}
                  </span>
                </div>
              </div>

              {/* Description Body */}
              <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {isLongDescription && !isExpanded ? (
                  <>
                    <span>{description.slice(0, 140)}...</span>
                    <button
                      onClick={() => toggleExpand(id)}
                      className="ml-1.5 text-cyan-400 hover:underline font-mono text-[10.5px] cursor-pointer inline-flex items-center gap-0.5"
                    >
                      More <ChevronDown className="size-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <span>{description}</span>
                    {isLongDescription && (
                      <button
                        onClick={() => toggleExpand(id)}
                        className="ml-1.5 text-cyan-400 hover:underline font-mono text-[10.5px] cursor-pointer inline-flex items-center gap-0.5"
                      >
                        Less <ChevronUp className="size-3" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Actionable Mitigation Step */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-black/40 border border-white/[0.04] text-[11px]">
                <Wrench className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9.5px] font-mono uppercase text-emerald-400 font-medium tracking-wider">
                    Recommended Mitigation:
                  </span>
                  <span className="text-slate-300 font-sans leading-snug">
                    {mitigation}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import katex from 'katex';
import { Copy, Check, Code } from 'lucide-react';

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
  showRawToggle?: boolean;
}

export function MathFormula({
  formula,
  displayMode = true,
  className = '',
  showRawToggle = true,
}: MathFormulaProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch (err) {
      console.warn('[KaTeX] render error:', err);
      return null;
    }
  }, [formula, displayMode]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(formula);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className={`relative group/math rounded-xl bg-black/60 border border-white/[0.08] p-3 transition-colors hover:border-emerald-500/30 ${className}`}>
      {/* Top right quick actions */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-60 group-hover/math:opacity-100 transition-opacity">
        {showRawToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowRaw((prev) => !prev);
            }}
            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={showRaw ? "Show rendered math" : "Show raw LaTeX"}
          >
            <Code className="size-3" />
          </button>
        )}
        <button
          onClick={handleCopy}
          className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
          title="Copy LaTeX"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
        </button>
      </div>

      {showRaw || !renderedHtml ? (
        <div className="font-mono text-[11px] text-emerald-400/90 overflow-x-auto py-1 pr-14 select-all">
          <code>{formula}</code>
        </div>
      ) : (
        <div
          className="text-emerald-300 overflow-x-auto py-1 pr-14 text-[13px] tracking-wide [&_.katex]:text-[1.05em] [&_.katex-display]:my-1"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      )}
    </div>
  );
}

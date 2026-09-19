import { Activity, Clock, IndianRupee, TrendingDown } from "lucide-react";

const stats = [
  { icon: Activity, label: "Rush-Hour Avg", value: "13.9 km/h" },
  { icon: Clock, label: "Time Lost", value: "168 hrs/yr" },
  { icon: IndianRupee, label: "Congestion Cost", value: "₹20,000 Cr" },
  { icon: TrendingDown, label: "Peak Slowdown", value: "-64%" },
  { icon: Activity, label: "Metro Line-Haul", value: "36.0 km/h" },
  { icon: Clock, label: "Recon Time", value: "< 4 sec" },
];

function Row() {
  return (
    <div className="inline-flex items-center">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <span key={i} className="inline-flex items-center gap-2 px-6">
            <Icon className="h-3.5 w-3.5 text-sky-400" strokeWidth={2.2} />
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              {s.label}
            </span>
            <span className="font-mono text-xs font-semibold tabular-nums text-slate-100">
              {s.value}
            </span>
            <span className="ml-4 h-1 w-1 rounded-full bg-slate-600" />
          </span>
        );
      })}
    </div>
  );
}

export function TelemetryTicker() {
  return (
    <div className="dyad-glass relative z-20 flex h-11 items-center overflow-hidden border-x-0 border-t-0">
      <div className="flex items-center gap-2 border-r border-white/[0.08] px-4">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300">
          Live · Bengaluru
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="dyad-marquee-track">
          <Row />
          <Row />
        </div>
      </div>
    </div>
  );
}

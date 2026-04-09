"use client";

import { motion } from "framer-motion";
import { Activity, Cpu, Gauge, Radio, TrendingUp, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/analyzer";
import {
  computeBreakdown,
  computeConfidence,
  confidenceLabel,
  getImpact,
  getImprovement,
  getSignals,
  getSystemType,
  impactColor,
} from "@/lib/perception";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PerceptionPanelProps = {
  result: AnalysisResult;
  expanded?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Confidence ring (lightweight SVG)                                  */
/* ------------------------------------------------------------------ */

function ConfidenceRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-[72px] w-[72px] items-center justify-center">
      <svg className="-rotate-90" height="72" viewBox="0 0 72 72" width="72">
        <circle
          className="text-white/[0.06]"
          cx="36"
          cy="36"
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth="5"
        />
        <motion.circle
          animate={{ strokeDashoffset: offset }}
          className="text-emerald-400"
          cx="36"
          cy="36"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeLinecap="round"
          strokeWidth="5"
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-lg font-bold text-white">{score}%</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PerceptionPanel                                                    */
/* ------------------------------------------------------------------ */

export function PerceptionPanel({ result, expanded = true }: PerceptionPanelProps) {
  const confidence = computeConfidence(result);
  const label = confidenceLabel(confidence);
  const breakdown = computeBreakdown(result);
  const signals = getSignals(result.category);
  const impact = getImpact(result.category);
  const improvement = getImprovement(result.category);
  const systemType = getSystemType(result.category);

  if (!expanded) return null;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
      initial={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.3 }}
    >
      {/* Row 1 — Confidence + Impact + System Type + Improvement */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Confidence */}
        <Card className="col-span-2 rounded-xl border-white/8 bg-gradient-to-br from-emerald-400/[0.04] to-transparent shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <ConfidenceRing score={confidence} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Confidence
              </p>
              <p className="text-sm font-semibold text-white">
                {label} ({confidence}%)
              </p>
              <div className="mt-1.5 space-y-0.5">
                {breakdown.map((b) => (
                  <div key={b.label} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">{b.label}</span>
                    <span className={cn("font-medium", b.value === "Weak" || b.value === "No match" || b.value === "Partial" ? "text-amber-400" : "text-emerald-400")}>
                      {b.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Level */}
        <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
            <Zap className="h-4 w-4 text-amber-400" />
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Impact</p>
            <Badge className={cn("text-[10px]", impactColor(impact))}>{impact}</Badge>
          </CardContent>
        </Card>

        {/* Estimated Improvement */}
        <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Est. Improvement</p>
            <p className="text-xs font-semibold text-emerald-300">{improvement.value}</p>
            <p className="text-[10px] text-slate-500">{improvement.metric}</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 — Signals + System Type */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Detected Signals */}
        <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-sky-400" />
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Detected Signals
              </p>
            </div>
            <ul className="space-y-1.5">
              {signals.map((signal, i) => (
                <motion.li
                  key={signal}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs text-slate-300"
                  initial={{ opacity: 0, x: -4 }}
                  transition={{ delay: i * 0.08, duration: 0.2 }}
                >
                  <Activity className="h-3 w-3 shrink-0 text-sky-400/60" />
                  {signal}
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* System Type */}
        <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
          <CardContent className="flex flex-col justify-center gap-3 p-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-violet-400" />
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Detected System
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-violet-400/70" />
              <span className="text-sm font-semibold text-white">{systemType}</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">
              Classification based on input keywords, error patterns, and diagnostic signals.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

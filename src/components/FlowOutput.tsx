"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { FlowResult, FlowRisk } from "@/lib/flow";
import { clampConfidence } from "@/lib/flow";
import { cn } from "@/lib/utils";

type FlowOutputProps = {
  flowData?: FlowResult | null;
  loading?: boolean;
  className?: string;
};

function getRiskColor(risk: FlowRisk) {
  switch (risk) {
    case "low":
      return "bg-emerald-400/10 border-emerald-400/30 text-emerald-300";
    case "medium":
      return "bg-amber-400/10 border-amber-400/30 text-amber-300";
    case "high":
      return "bg-red-400/10 border-red-400/30 text-red-300";
  }
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const c = clampConfidence(confidence);

  const getColor = (v: number) =>
    v >= 80
      ? "from-indigo-500 to-emerald-400"
      : v >= 55
        ? "from-amber-500 to-yellow-400"
        : "from-red-500 to-orange-400";

  return (
    <Card className="border-zinc-800/80 bg-zinc-900 shadow-sm">
      <div className="px-5 py-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Confidence
            </span>
          </div>
          <span className="font-mono text-lg font-semibold text-white">{c}%</span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            animate={{ width: `${c}%` }}
            className={cn("h-full rounded-full bg-gradient-to-r", getColor(c))}
            initial={{ width: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
      </div>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="border-zinc-800/80 bg-zinc-900 shadow-sm">
      <div className="border-b border-zinc-800/60 px-5 py-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          Analyzing system flow...
        </p>
      </div>
      <div className="space-y-3 px-5 py-4">
        <div className="h-3 w-1/2 animate-pulse rounded-md bg-zinc-800" />
        <div className="h-3 w-full animate-pulse rounded-md bg-zinc-800" />
        <div className="h-3 w-3/4 animate-pulse rounded-md bg-zinc-800" />
      </div>
    </Card>
  );
}

export function FlowOutput({ flowData, loading = false, className }: FlowOutputProps) {
  if (loading) {
    return (
      <div className={cn("mx-auto mt-8 w-full max-w-4xl space-y-8", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!flowData) return null;

  return (
    <div className={cn("mx-auto mt-8 w-full max-w-4xl space-y-8", className)}>
      {/* SECTION 1: SYSTEM FLOW */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              System Flow
            </p>
          </div>
          <div className="px-5 py-6">
            <div className="flex flex-wrap items-center gap-3">
              {flowData.flow.map((step, idx) => (
                <div className="flex items-center gap-3" key={`${step}-${idx}`}>
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-200"
                    initial={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18, delay: idx * 0.1 }}
                  >
                    {step}
                  </motion.div>
                  {idx < flowData.flow.length - 1 ? (
                    <motion.div
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-shrink-0 text-zinc-600"
                      initial={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.18, delay: idx * 0.1 + 0.08 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 2: PATTERN DETECTION */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.08 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Behavior Pattern
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-indigo-400/10 border-indigo-400/30 text-indigo-300 uppercase">
                {flowData.pattern}
              </Badge>
              <p className="text-sm text-zinc-400">
                {flowData.pattern === "Reactive" && "System responds to events rather than anticipating them."}
                {flowData.pattern === "Adaptive" && "System dynamically adjusts to changing conditions."}
                {flowData.pattern === "Unstable" && "System exhibits erratic or unpredictable behavior."}
                {flowData.pattern === "Bottlenecked" && "System is constrained by a single limiting factor."}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 3: RISK LEVEL */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.16 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Risk Level
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-3">
              <Badge className={cn("uppercase", getRiskColor(flowData.risk))}>
                {flowData.risk.toUpperCase()}
              </Badge>
              <p className="text-sm text-zinc-400">
                {flowData.risk === "low" && "System behavior is stable and within normal operating bounds."}
                {flowData.risk === "medium" && "System shows signs of stress but is not in immediate danger."}
                {flowData.risk === "high" && "System is at risk of failure or significant degradation."}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 4: INSIGHT */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.24 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Flow Insight
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-zinc-300">{flowData.insight}</p>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 5: CONFIDENCE */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.32 }}
      >
        <ConfidenceBar confidence={flowData.confidence} />
      </motion.div>
    </div>
  );
}

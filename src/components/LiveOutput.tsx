"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { LiveResult, LiveRisk } from "@/lib/live";
import { cn } from "@/lib/utils";

type LiveOutputProps = {
  liveData?: LiveResult | null;
  loading?: boolean;
  className?: string;
};

function getRiskColor(risk: LiveRisk) {
  switch (risk) {
    case "low":
      return "bg-emerald-400/10 border-emerald-400/30 text-emerald-300";
    case "medium":
      return "bg-amber-400/10 border-amber-400/30 text-amber-300";
    case "high":
      return "bg-red-400/10 border-red-400/30 text-red-300";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Stable":
      return "bg-emerald-400/10 border-emerald-400/30 text-emerald-300";
    case "At Risk":
      return "bg-amber-400/10 border-amber-400/30 text-amber-300";
    case "Degrading":
      return "bg-orange-400/10 border-orange-400/30 text-orange-300";
    case "Critical":
      return "bg-red-400/10 border-red-400/30 text-red-300";
    default:
      return "bg-zinc-400/10 border-zinc-400/30 text-zinc-300";
  }
}

function getDirectionIcon(direction: string) {
  switch (direction) {
    case "increasing":
    case "High":
    case "Rising":
      return <TrendingUp className="h-3 w-3 text-red-400" />;
    case "decreasing":
    case "Low":
    case "Falling":
      return <TrendingDown className="h-3 w-3 text-emerald-400" />;
    default:
      return <Minus className="h-3 w-3 text-zinc-400" />;
  }
}

function getMetricColor(metric: string) {
  const lower = metric.toLowerCase();
  if (lower.includes("high") || lower.includes("critical") || lower.includes("rising")) {
    return "text-red-400";
  }
  if (lower.includes("low") || lower.includes("stable")) {
    return "text-emerald-400";
  }
  return "text-zinc-300";
}

function MetricCard({ label, value, direction }: { label: string; value: string; direction: string }) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
      initial={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
        {getDirectionIcon(direction)}
      </div>
      <p className={cn("mt-2 text-lg font-semibold", getMetricColor(value))}>{value}</p>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="border-zinc-800/80 bg-zinc-900 shadow-sm">
      <div className="border-b border-zinc-800/60 px-5 py-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          Initializing live system...
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

export function LiveOutput({ liveData, loading = false, className }: LiveOutputProps) {
  if (loading) {
    return (
      <div className={cn("mx-auto mt-8 w-full max-w-4xl space-y-8", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!liveData) return null;

  return (
    <div className={cn("mx-auto mt-8 w-full max-w-4xl space-y-8", className)}>
      {/* SECTION 1: LIVE METRICS */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                Live System State
              </p>
            </div>
          </div>
          <div className="px-5 py-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MetricCard label="Traffic" value={liveData.metrics.traffic} direction={liveData.metrics.traffic} />
              <MetricCard label="CPU" value={liveData.metrics.cpu} direction={liveData.metrics.cpu} />
              <MetricCard label="Memory" value={liveData.metrics.memory} direction={liveData.metrics.memory} />
              <MetricCard label="Errors" value={liveData.metrics.errors} direction={liveData.metrics.errors} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 2: CURRENT STATUS */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.08 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Current Status
            </p>
          </div>
          <div className="px-5 py-4">
            <Badge className={cn("uppercase text-sm", getStatusColor(liveData.status))}>
              {liveData.status}
            </Badge>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 3: LIVE INSIGHT */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.16 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Live Insight
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-zinc-300">{liveData.insight}</p>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 4: IMMEDIATE RISK */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.24 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Immediate Risk
            </p>
          </div>
          <div className="px-5 py-4">
            <Badge className={cn("uppercase", getRiskColor(liveData.risk))}>
              {liveData.risk.toUpperCase()}
            </Badge>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

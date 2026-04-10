"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { TrustResult } from "@/lib/trust";
import { getTrustStatusColor } from "@/lib/trust";
import { cn } from "@/lib/utils";

type TrustOutputProps = {
  trustData?: TrustResult | null;
  loading?: boolean;
  className?: string;
};

function AnimatedScore({ score }: { score: number }) {
  const display = useMotionValue(0);

  useEffect(() => {
    const controls = animate(display, score, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [score, display]);

  const rounded = useTransform(display, (latest) => Math.round(latest));

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      initial={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span className="text-7xl font-bold text-white">{rounded}</motion.span>
      <span className="text-4xl font-medium text-zinc-500"> / 100</span>
    </motion.div>
  );
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="font-mono text-sm font-semibold text-white">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          animate={{ width: `${value}%` }}
          className={cn("h-full rounded-full bg-gradient-to-r", color)}
          initial={{ width: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="border-zinc-800/80 bg-zinc-900 shadow-sm">
      <div className="border-b border-zinc-800/60 px-5 py-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          Calculating system trust...
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

export function TrustOutput({ trustData, loading = false, className }: TrustOutputProps) {
  if (loading) {
    return (
      <div className={cn("mx-auto mt-8 w-full max-w-3xl space-y-6", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!trustData) return null;

  return (
    <div className={cn("mx-auto mt-8 w-full max-w-3xl space-y-6", className)}>
      {/* SECTION 1: TRUST SCORE */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0 }}
      >
        <Card className="border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="px-5 py-8 text-center">
            <AnimatedScore score={trustData.score} />
            <div className="mt-4 flex justify-center">
              <Badge className={cn("uppercase text-sm", getTrustStatusColor(trustData.status))}>
                {trustData.status}
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 2: BREAKDOWN */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.08 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Trust Breakdown
            </p>
          </div>
          <div className="space-y-4 px-5 py-6">
            <ProgressBar label="Stability" value={trustData.breakdown.stability} color="from-emerald-500 to-green-400" />
            <ProgressBar label="Errors" value={trustData.breakdown.errors} color="from-blue-500 to-cyan-400" />
            <ProgressBar label="Performance" value={trustData.breakdown.performance} color="from-purple-500 to-pink-400" />
            <ProgressBar label="Verification" value={trustData.breakdown.verification} color="from-indigo-500 to-violet-400" />
          </div>
        </Card>
      </motion.div>

      {/* SECTION 3: INSIGHT */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.16 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Trust Insight
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-zinc-300">{trustData.insight}</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

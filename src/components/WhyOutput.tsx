"use client";

import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import type { WhyResult } from "@/lib/why";
import { clampConfidence } from "@/lib/why";
import { cn } from "@/lib/utils";

type WhyOutputProps = {
  whyData?: WhyResult | null;
  loading?: boolean;
  className?: string;
};

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
          Analyzing system behavior...
        </p>
      </div>
      <div className="space-y-3 px-5 py-4">
        <div className="h-3 w-2/3 animate-pulse rounded-md bg-zinc-800" />
        <div className="h-3 w-full animate-pulse rounded-md bg-zinc-800" />
        <div className="h-3 w-4/5 animate-pulse rounded-md bg-zinc-800" />
      </div>
    </Card>
  );
}

export function WhyOutput({ whyData, loading = false, className }: WhyOutputProps) {
  if (loading) {
    return (
      <div className={cn("mx-auto mt-8 w-full max-w-3xl space-y-6", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!whyData) return null;

  return (
    <div className={cn("mx-auto mt-8 w-full max-w-3xl space-y-6", className)}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Why It Happened
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-zinc-300">{whyData.why}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.08 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Underlying Reason
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-zinc-300">{whyData.reason}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.16 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Deeper Insight
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-zinc-300">{whyData.insight}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.24 }}
      >
        <ConfidenceBar confidence={whyData.confidence} />
      </motion.div>
    </div>
  );
}

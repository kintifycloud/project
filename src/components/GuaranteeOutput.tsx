"use client";

import { motion } from "framer-motion";
import { Check, Shield, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { GuaranteeResult } from "@/lib/guarantee";
import { getLevelColor, getRiskColor } from "@/lib/guarantee";
import { cn } from "@/lib/utils";

type GuaranteeOutputProps = {
  guaranteeData?: GuaranteeResult | null;
  loading?: boolean;
  className?: string;
};

function LoadingSkeleton() {
  return (
    <Card className="border-zinc-800/80 bg-zinc-900 shadow-sm">
      <div className="border-b border-zinc-800/60 px-5 py-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          Calculating guarantee...
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

export function GuaranteeOutput({ guaranteeData, loading = false, className }: GuaranteeOutputProps) {
  if (loading) {
    return (
      <div className={cn("mx-auto mt-8 w-full max-w-3xl space-y-6", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!guaranteeData) return null;

  return (
    <div className={cn("mx-auto mt-8 w-full max-w-3xl space-y-6", className)}>
      {/* SECTION 1: GUARANTEE METRICS */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Guarantee Metrics
            </p>
          </div>
          <div className="space-y-4 px-5 py-6">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-zinc-400">Fix Success Probability:</span>
              <span className="font-mono text-lg font-semibold text-white">{guaranteeData.successProbability}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-zinc-400">Regression Risk:</span>
              <Badge className={cn("uppercase", getRiskColor(guaranteeData.regressionRisk))}>
                {guaranteeData.regressionRisk}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-zinc-400">Stability Window:</span>
              <span className="font-mono text-lg font-semibold text-white">{guaranteeData.stabilityWindow}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 2: GUARANTEE LEVEL */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.08 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                Guarantee Level
              </p>
            </div>
          </div>
          <div className="px-5 py-4">
            <Badge className={cn("text-sm", getLevelColor(guaranteeData.level))}>
              {guaranteeData.level}
            </Badge>
          </div>
        </Card>
      </motion.div>

      {/* SECTION 3: FALLBACK PROMISE */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.16 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-indigo-400" />
              <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                Fallback Promise
              </p>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-zinc-300">
              If system deviates:
              <span className="ml-2 text-indigo-400">→</span>
              <span className="ml-2 font-medium text-white">Kintify will re-analyze and auto-correct.</span>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

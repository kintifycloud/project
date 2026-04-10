"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { VerifyResult, VerifyStatus } from "@/lib/verify";
import { clampConfidence } from "@/lib/verify";
import { cn } from "@/lib/utils";

type VerifyOutputProps = {
  verifyData?: VerifyResult | null;
  loading?: boolean;
  className?: string;
};

function getStatusColor(status: VerifyStatus) {
  switch (status) {
    case "verified":
      return "bg-emerald-400/10 border-emerald-400/30 text-emerald-300";
    case "unstable":
      return "bg-amber-400/10 border-amber-400/30 text-amber-300";
    case "failed":
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
          Verifying system state...
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

export function VerifyOutput({ verifyData, loading = false, className }: VerifyOutputProps) {
  if (loading) {
    return (
      <div className={cn("mx-auto mt-8 w-full max-w-3xl space-y-6", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!verifyData) return null;

  return (
    <div className={cn("mx-auto mt-8 w-full max-w-3xl space-y-6", className)}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0 }}
      >
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                Verification Result
              </p>
              <Badge className={cn("uppercase", getStatusColor(verifyData.status))}>
                {verifyData.status}
              </Badge>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-lg font-semibold leading-relaxed text-white">{verifyData.result}</p>
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
              Proof Signals
            </p>
          </div>
          <div className="px-5 py-4">
            <ul className="space-y-2">
              {verifyData.signals.map((signal, idx) => (
                <motion.li
                  key={`${signal}-${idx}`}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 rounded-lg px-2 py-1 text-sm leading-relaxed text-zinc-300 transition-colors hover:bg-white/5"
                  initial={{ opacity: 0, x: -8 }}
                  transition={{ delay: idx * 0.06, duration: 0.2 }}
                >
                  <span className="shrink-0 text-indigo-400">&bull;</span>
                  {signal}
                </motion.li>
              ))}
            </ul>
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
              Verification Method
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-zinc-300">{verifyData.method}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, delay: 0.24 }}
      >
        <ConfidenceBar confidence={verifyData.confidence} />
      </motion.div>
    </div>
  );
}

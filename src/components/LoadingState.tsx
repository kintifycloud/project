"use client";

import { motion } from "framer-motion";

// ─── Single skeleton line ──────────────────────────────────────────────────
function SkeletonLine({ width = "w-full" }: { width?: string }) {
  return (
    <div
      className={`h-3 animate-pulse rounded-md bg-zinc-800 ${width}`}
    />
  );
}

// ─── Skeleton card block ───────────────────────────────────────────────────
function SkeletonCard({
  label,
  lines,
  delay = 0,
}: {
  label: string;
  lines: string[];
  delay?: number;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, delay }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800/60 px-5 py-3">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-700" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-700">
          {label}
        </span>
      </div>
      {/* Body */}
      <div className="space-y-2.5 px-5 py-4">
        {lines.map((w, i) => (
          <SkeletonLine key={i} width={w} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Animated thinking dots ────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400"
          transition={{ duration: 1, delay, repeat: Infinity }}
        />
      ))}
    </span>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────
export function LoadingState() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-4xl space-y-3 px-4 py-8 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
    >
      {/* Status banner */}
      <div className="flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-5 py-3">
        <ThinkingDots />
        <p className="font-mono text-sm text-indigo-300">
          Kintify is analyzing your system…
        </p>
      </div>

      {/* Confidence skeleton */}
      <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900 px-5 py-4">
        <div className="mb-2 flex items-center justify-between">
          <SkeletonLine width="w-28" />
          <SkeletonLine width="w-10" />
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            animate={{ x: ["−100%", "100%"] }}
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>

      {/* Section skeletons */}
      <SkeletonCard
        delay={0.05}
        label="Root Cause"
        lines={["w-full", "w-4/5", "w-3/5"]}
      />
      <SkeletonCard
        delay={0.1}
        label="Fix Plan"
        lines={["w-full", "w-full", "w-3/4", "w-2/3"]}
      />
      <SkeletonCard
        delay={0.15}
        label="Prevention"
        lines={["w-full", "w-4/5"]}
      />
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import type { TraceResult } from "@/lib/trace";
import { clampConfidence } from "@/lib/trace";
import { cn } from "@/lib/utils";

type TraceOutputProps = {
  trace?: TraceResult | null;
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

function TimelineSkeleton() {
  return (
    <Card className="border-zinc-800/80 bg-zinc-900 shadow-sm">
      <div className="border-b border-zinc-800/60 px-5 py-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          System Timeline
        </p>
        <p className="mt-1 text-sm text-zinc-400">Tracing system behavior...</p>
      </div>

      <div className="px-5 py-4">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div className="flex gap-4" key={i}>
              <div className="relative flex w-6 justify-center">
                <div className="mt-1.5 h-2 w-2 animate-pulse rounded-full bg-zinc-700" />
                <div className="absolute left-1/2 top-4 h-full w-px -translate-x-1/2 bg-zinc-800" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded-md bg-zinc-800" />
                <div className="h-3 w-4/5 animate-pulse rounded-md bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function TraceOutput({ trace, loading = false, className }: TraceOutputProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "mx-auto mt-8 w-full max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8",
          className,
        )}
      >
        <TimelineSkeleton />
      </div>
    );
  }

  if (!trace) return null;

  return (
    <div
      className={cn(
        "mx-auto mt-8 w-full max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      <section className="space-y-3">
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              System Timeline
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="space-y-4">
              {trace.timeline.map((item, idx) => (
                <motion.div
                  key={`${item.time}-${item.event}-${idx}`}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25, delay: idx * 0.09 }}
                >
                  <div className="relative flex w-6 justify-center">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-400" />
                    {idx < trace.timeline.length - 1 ? (
                      <div className="absolute left-1/2 top-4 h-full w-px -translate-x-1/2 bg-zinc-800" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">
                      <span className="font-mono text-zinc-400">{item.time}</span>
                      <span className="text-zinc-600"> — </span>
                      <span className="text-zinc-200">{item.event}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Cause Chain
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              {trace.causeChain.map((c, idx) => (
                <div className="flex items-center gap-2" key={`${c}-${idx}`}>
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
                    initial={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18, delay: idx * 0.08 }}
                  >
                    {c}
                  </motion.div>
                  {idx < trace.causeChain.length - 1 ? (
                    <motion.span
                      animate={{ opacity: 1, x: 0 }}
                      className="select-none text-zinc-600"
                      initial={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.18, delay: idx * 0.08 + 0.06 }}
                    >
                      →
                    </motion.span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800/60 px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              System Insight
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-zinc-300">{trace.insight}</p>
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <ConfidenceBar confidence={trace.confidence} />
      </section>
    </div>
  );
}

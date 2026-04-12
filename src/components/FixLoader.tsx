"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type FixLoaderProps = {
  className?: string;
};

export function FixLoader({ className }: FixLoaderProps) {
  const steps = useMemo(
    () => [
      "Reading logs...",
      "Tracing dependencies...",
      "Checking likely root causes...",
      "Building fix plan...",
    ],
    [],
  );

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const min = 700;
    const max = 900;

    const scheduleNext = () =>
      window.setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
      }, Math.floor(min + Math.random() * (max - min)));

    const timeoutId = scheduleNext();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [steps.length, currentStep]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={
        className ??
        "w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)]"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium tracking-wide text-zinc-300">
          AI Analysis
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
      </div>

      <div className="mt-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="text-sm font-medium text-white"
          >
            {steps[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 space-y-2">
        {steps.map((step, idx) => {
          const completed = idx < currentStep;
          const active = idx === currentStep;

          return (
            <div key={step} className="flex items-start gap-2">
              <div
                className={
                  "mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-md border " +
                  (completed
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : active
                      ? "border-indigo-500/40 bg-indigo-500/10"
                      : "border-zinc-800 bg-zinc-950/30")
                }
              >
                <span
                  className={
                    "text-xs leading-none " +
                    (completed
                      ? "text-emerald-300"
                      : active
                        ? "text-indigo-300"
                        : "text-zinc-600")
                  }
                >
                  {completed ? "✔" : active ? "→" : "•"}
                </span>
              </div>
              <div
                className={
                  "text-sm leading-relaxed " +
                  (completed
                    ? "text-zinc-200"
                    : active
                      ? "text-white"
                      : "text-zinc-500")
                }
              >
                {step}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/30 p-3">
          <div className="text-xs font-medium text-zinc-400">Root Cause</div>
          <div className="mt-2 space-y-2">
            <div className="h-3 w-3/5 animate-pulse rounded-md bg-zinc-800" />
            <div className="h-3 w-4/5 animate-pulse rounded-md bg-zinc-800" />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/30 p-3">
          <div className="text-xs font-medium text-zinc-400">Fix Plan</div>
          <div className="mt-2 space-y-2">
            <div className="h-3 w-5/6 animate-pulse rounded-md bg-zinc-800" />
            <div className="h-3 w-2/3 animate-pulse rounded-md bg-zinc-800" />
            <div className="h-3 w-3/4 animate-pulse rounded-md bg-zinc-800" />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/30 p-3">
          <div className="text-xs font-medium text-zinc-400">Expected Outcome</div>
          <div className="mt-2 space-y-2">
            <div className="h-3 w-1/2 animate-pulse rounded-md bg-zinc-800" />
            <div className="h-3 w-2/5 animate-pulse rounded-md bg-zinc-800" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

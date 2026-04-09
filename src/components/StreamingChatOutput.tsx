"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Play, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LlmAnalysisResult } from "@/lib/analyzer";
import { cn } from "@/lib/utils";

type StreamingSection = "analyzing" | "rootCause" | "fixPlan" | "expectedOutcome" | "confidence" | "complete";

type StreamingChatOutputProps = {
  result: LlmAnalysisResult;
  onRefine?: (newInput: string) => void;
};

export function StreamingChatOutput({ result, onRefine }: StreamingChatOutputProps) {
  const [currentSection, setCurrentSection] = useState<StreamingSection>("analyzing");
  const [simulationResult, setSimulationResult] = useState<"success" | "warning" | null>(null);
  const [refineInput, setRefineInput] = useState("");

  useEffect(() => {
    // Progressive reveal timeline
    const timeline = [
      { section: "analyzing" as StreamingSection, delay: 0 },
      { section: "rootCause" as StreamingSection, delay: 800 },
      { section: "fixPlan" as StreamingSection, delay: 1600 },
      { section: "expectedOutcome" as StreamingSection, delay: 2400 },
      { section: "confidence" as StreamingSection, delay: 3000 },
      { section: "complete" as StreamingSection, delay: 3500 },
    ];

    const timers = timeline.map(({ section, delay }) =>
      setTimeout(() => setCurrentSection(section), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const confidence = result.confidence || 85;
  const confidenceColor =
    confidence >= 90 ? "bg-emerald-500" : confidence >= 80 ? "bg-blue-500" : "bg-yellow-500";

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
  }

  function handleSimulate() {
    const random = Math.random();
    setSimulationResult(random > 0.3 ? "success" : "warning");
    setTimeout(() => setSimulationResult(null), 3000);
  }

  function handleRefine() {
    if (refineInput.trim()) {
      onRefine?.(refineInput);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Analyzing State */}
      {currentSection === "analyzing" && (
        <motion.div
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-8"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <Sparkles className="h-8 w-8 animate-pulse text-zinc-400" />
          <p className="text-base font-medium text-white">Analyzing issue...</p>
        </motion.div>
      )}

      {/* Root Cause */}
      {currentSection === "rootCause" && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur"
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">Identified Issue</span>
          </div>
          <h3 className="mb-2 text-base sm:text-lg font-semibold text-white">Root Cause</h3>
          <p className="text-sm text-zinc-300 leading-relaxed">{result.cause}</p>
        </motion.div>
      )}

      {/* Fix Plan */}
      {currentSection === "fixPlan" && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur"
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-white">Fix Plan</h3>
          <div className="space-y-2 sm:space-y-3">
            {result.fix.map((step, index) => (
              <motion.div
                key={index}
                animate={{ opacity: 1, x: 0 }}
                className="group flex items-start gap-2 sm:gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
                exit={{ opacity: 0, x: -8 }}
                initial={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.3, delay: index * 100 }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-white">
                  {index + 1}
                </span>
                <p className="flex-1 text-sm text-zinc-300">{step}</p>
                <Button
                  className="h-6 w-6 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleCopy(step)}
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Expected Outcome */}
      {currentSection === "expectedOutcome" && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur"
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-white">Expected Outcome</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-zinc-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>Reduced error rate and improved stability</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-zinc-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>Faster response times and better performance</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-zinc-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>Prevention of similar issues in the future</span>
            </li>
          </ul>
        </motion.div>
      )}

      {/* Confidence Bar */}
      {currentSection === "confidence" && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur"
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-2 sm:mb-3 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-white">Fix Confidence</h3>
            <span className="text-sm font-medium text-white">{confidence}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              animate={{ width: `${confidence}%` }}
              className={cn("h-full", confidenceColor)}
              initial={{ width: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-400">Based on pattern matching and system analysis</p>
        </motion.div>
      )}

      {/* Complete State - Actions */}
      {currentSection === "complete" && (
        <motion.div
          animate={{ opacity: 1 }}
          className="space-y-3 sm:space-y-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Simulate Fix Button */}
          <Button className="w-full" onClick={handleSimulate} variant="outline">
            <Play className="mr-2 h-4 w-4" />
            Simulate Fix
          </Button>

          {/* Simulation Result */}
          {simulationResult && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-lg p-3 text-center text-sm",
                simulationResult === "success"
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-yellow-500/10 text-yellow-300",
              )}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, y: -8 }}
            >
              {simulationResult === "success" ? "Simulation Successful" : "Potential issue detected"}
            </motion.div>
          )}

          {/* Refine Input */}
          {onRefine && (
            <Card className="border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur">
              <label className="mb-2 block text-sm font-medium text-white">Refine your issue...</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                  className="flex-1 min-h-[60px] rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-white/20 focus:outline-none"
                  onChange={(e) => setRefineInput(e.target.value)}
                  placeholder="Add more context or clarify your issue..."
                  value={refineInput}
                />
                <Button disabled={!refineInput.trim()} onClick={handleRefine} className="w-full sm:w-auto">
                  Re-analyze
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}

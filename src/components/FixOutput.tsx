"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Play } from "lucide-react";

import { EmailCapture } from "@/components/EmailCapture";
import {
  ActionPanel,
  AgentPanel,
  CauseBlock,
  ControlPanel,
  ExplanationBlock,
  FixStepsBlock,
  PerceptionPanel,
  PreventionBlock,
  ProblemBlock,
} from "@/components/output";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/analyzer";
import { computeConfidence } from "@/lib/perception";
import { cn } from "@/lib/utils";

type DetailLevel = "simple" | "detailed";

type FixOutputProps = {
  result?: AnalysisResult | null;
  className?: string;
  onReanalyze?: () => void;
  isReanalyzing?: boolean;
};

export function FixOutput({ result, className, onReanalyze, isReanalyzing }: FixOutputProps) {
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("detailed");
  const [expanded, setExpanded] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  if (!result) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2 py-16", className)}>
        <MessageSquare className="h-6 w-6 text-zinc-600" />
        <p className="text-sm text-zinc-500">Paste an error, API, or system issue to begin</p>
      </div>
    );
  }

  const confidence = computeConfidence(result);

  function handleSimulateFix() {
    setToast("Simulation complete no errors detected");
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8", className)}
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35 }}
    >
      {/* Toast */}
      {toast ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-fit rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white shadow-lg"
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {toast}
        </motion.div>
      ) : null}

      {/* Confidence Card */}
      <Card className="border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-white">Fix Confidence</h3>
            <p className="text-xs text-zinc-400">Based on pattern matching and system analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                animate={{ width: `${confidence}%` }}
                className="h-full bg-zinc-100"
                initial={{ width: 0 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-medium text-white">{confidence}%</span>
          </div>
        </div>
      </Card>

      {/* Section blocks with card styling */}
      <div className="space-y-4">
        {/* Root Cause */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-white">Root Cause</h3>
            <ProblemBlock data={result.problem} detailLevel={detailLevel} expanded={expanded} />
            <CauseBlock data={result.cause} detailLevel={detailLevel} expanded={expanded} />
            <ExplanationBlock data={result.explanation} detailLevel={detailLevel} expanded={expanded} />
          </Card>
        </motion.div>

        {/* Fix Plan */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-white">Fix Plan</h3>
            <FixStepsBlock data={result.fix} detailLevel={detailLevel} expanded={expanded} />
            <ActionPanel detailLevel={detailLevel} expanded={expanded} fixSteps={result.fix} />
          </Card>
        </motion.div>

        {/* Prevention (optional collapse) */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-white">Prevention</h3>
            <PreventionBlock data={result.prevention} detailLevel={detailLevel} expanded={expanded} />
          </Card>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <ControlPanel
              detailLevel={detailLevel}
              expanded={expanded}
              onDetailLevelChange={setDetailLevel}
              onExpandedChange={setExpanded}
              result={result}
              {...(onReanalyze ? { onReanalyze } : {})}
              {...(isReanalyzing !== undefined ? { isReanalyzing } : {})}
            />
          </Card>
        </motion.div>

        {/* Perception Engine */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <PerceptionPanel expanded={expanded} result={result} />
          </Card>
        </motion.div>

        {/* Agent Mode */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <AgentPanel />
          </Card>
        </motion.div>
      </div>

      {/* Simulate Fix Button */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Button className="w-full" onClick={handleSimulateFix} variant="outline">
          <Play className="mr-2 h-4 w-4" />
          Simulate Fix
        </Button>
      </motion.div>

      {/* Email capture */}
      <EmailCapture result={result} />
    </motion.div>
  );
}

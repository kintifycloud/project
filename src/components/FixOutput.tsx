"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AnalysisResult } from "@/lib/analyzer";
import { computeConfidence, confidenceLabel } from "@/lib/perception";
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

  if (!result) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2 py-16", className)}>
        <MessageSquare className="h-6 w-6 text-slate-600" />
        <p className="text-sm text-slate-500">Paste an error, API, or system issue to begin</p>
      </div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8", className)}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="rounded-2xl border-white/8 bg-white/[0.03] p-4 shadow-sm sm:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white sm:text-xl">Kintify Analysis Report</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">Generated in real-time from your system input</p>
          </div>
          <Badge className="w-fit border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
            Confidence: {confidenceLabel(computeConfidence(result))} ({computeConfidence(result)}%)
          </Badge>
        </div>

        <Separator className="mb-4 bg-white/8" />

        {/* Control Panel */}
        <ControlPanel
          detailLevel={detailLevel}
          expanded={expanded}
          onDetailLevelChange={setDetailLevel}
          onExpandedChange={setExpanded}
          result={result}
          {...(onReanalyze ? { onReanalyze } : {})}
          {...(isReanalyzing !== undefined ? { isReanalyzing } : {})}
        />

        <Separator className="my-4 bg-white/8" />

        {/* Perception Engine */}
        <PerceptionPanel expanded={expanded} result={result} />

        <Separator className="my-4 bg-white/8" />

        {/* Section blocks */}
        <div className="space-y-4">
          <ProblemBlock data={result.problem} detailLevel={detailLevel} expanded={expanded} />
          <CauseBlock data={result.cause} detailLevel={detailLevel} expanded={expanded} />
          <ExplanationBlock data={result.explanation} detailLevel={detailLevel} expanded={expanded} />

          <Separator className="my-4 bg-white/8" />

          <FixStepsBlock data={result.fix} detailLevel={detailLevel} expanded={expanded} />
          <ActionPanel detailLevel={detailLevel} expanded={expanded} fixSteps={result.fix} />
          <PreventionBlock data={result.prevention} detailLevel={detailLevel} expanded={expanded} />
        </div>

        <Separator className="my-6 bg-white/8" />

        {/* Agent Mode */}
        <AgentPanel />

        <Separator className="my-6 bg-white/8" />

        {/* Trust microcopy */}
        <p className="text-center text-xs text-slate-500">
          This analysis is generated from real system patterns and continuously improves.
        </p>
      </Card>

      {/* Email capture — outside the main card */}
      <div className="mt-6">
        <EmailCapture result={result} />
      </div>
    </motion.div>
  );
}

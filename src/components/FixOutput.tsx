"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Play, ShieldCheck, Zap, Eye, Bot, Sliders, AlertTriangle } from "lucide-react";

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

// ─── Types ────────────────────────────────────────────────────────────────────

type DetailLevel = "simple" | "detailed";

type FixOutputProps = {
  result?: AnalysisResult | null;
  className?: string;
  onReanalyze?: () => void;
  isReanalyzing?: boolean;
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

type SectionCardProps = {
  icon: React.ReactNode;
  label: string;
  accentClass?: string;
  delay?: number;
  children: React.ReactNode;
};

function SectionCard({
  icon,
  label,
  accentClass = "bg-zinc-500",
  delay = 0,
  children,
}: SectionCardProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900 shadow-sm">
        {/* Card header */}
        <div className="flex items-center gap-2 border-b border-zinc-800/60 px-5 py-3">
          <span className={cn("h-1.5 w-1.5 rounded-full", accentClass)} />
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            {icon}
            {label}
          </span>
        </div>
        {/* Card body */}
        <div className="px-5 py-4">{children}</div>
      </Card>
    </motion.div>
  );
}

// ─── Confidence bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ confidence }: { confidence: number }) {
  const getColor = (v: number) =>
    v >= 80
      ? "from-indigo-500 to-emerald-400"
      : v >= 55
        ? "from-amber-500 to-yellow-400"
        : "from-red-500 to-orange-400";

  const getLabel = (v: number) =>
    v >= 80 ? "High confidence" : v >= 55 ? "Moderate confidence" : "Low confidence";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: 0 }}
    >
      <Card className="border-zinc-800/80 bg-zinc-900 shadow-sm">
        <div className="px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                Fix Confidence
              </span>
            </div>
            <span className="font-mono text-lg font-semibold text-white">
              {confidence}%
            </span>
          </div>

          {/* Track */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              animate={{ width: `${confidence}%` }}
              className={cn("h-full rounded-full bg-gradient-to-r", getColor(confidence))}
              initial={{ width: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>

          <p className="mt-2 font-mono text-[11px] text-zinc-600">
            {getLabel(confidence)} · Based on pattern matching and system analysis
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FixOutput({
  result,
  className,
  onReanalyze,
  isReanalyzing,
}: FixOutputProps) {
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("detailed");
  const [expanded, setExpanded] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!result) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 py-16",
          className,
        )}
      >
        <MessageSquare className="h-6 w-6 text-zinc-700" />
        <p className="text-sm text-zinc-600">
          Paste an error, API, or system issue to begin
        </p>
      </div>
    );
  }

  const confidence = computeConfidence(result);

  function handleSimulateFix() {
    setToast("Simulation complete — no errors detected");
    setTimeout(() => setToast(null), 3200);
  }

  // ── Shared props forwarded to all output blocks ────────────────────────────
  const blockProps = { detailLevel, expanded };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mx-auto w-full max-w-4xl space-y-3 px-4 py-8 sm:px-6 lg:px-8",
        className,
      )}
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35 }}
    >
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex w-fit items-center gap-2 rounded-lg border border-emerald-500/25 bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fix Confidence ────────────────────────────────────────────────── */}
      <ConfidenceBar confidence={confidence} />

      {/* ── Root Cause ────────────────────────────────────────────────────── */}
      <SectionCard
        accentClass="bg-red-400"
        delay={0.08}
        icon={<AlertTriangle className="h-3 w-3" />}
        label="Root Cause"
      >
        <div className="space-y-3">
          <ProblemBlock data={result.problem} {...blockProps} />
          <CauseBlock data={result.cause} {...blockProps} />
          <ExplanationBlock data={result.explanation} {...blockProps} />
        </div>
      </SectionCard>

      {/* ── Fix Plan ──────────────────────────────────────────────────────── */}
      <SectionCard
        accentClass="bg-indigo-400"
        delay={0.14}
        icon={<Zap className="h-3 w-3" />}
        label="Fix Plan"
      >
        <div className="space-y-4">
          <FixStepsBlock data={result.fix} {...blockProps} />
          <ActionPanel
            detailLevel={detailLevel}
            expanded={expanded}
            fixSteps={result.fix}
          />
        </div>
      </SectionCard>

      {/* ── Prevention ────────────────────────────────────────────────────── */}
      <SectionCard
        accentClass="bg-amber-400"
        delay={0.2}
        icon={<ShieldCheck className="h-3 w-3" />}
        label="Prevention"
      >
        <PreventionBlock data={result.prevention} {...blockProps} />
      </SectionCard>

      {/* ── Control Panel ─────────────────────────────────────────────────── */}
      <SectionCard
        accentClass="bg-zinc-400"
        delay={0.26}
        icon={<Sliders className="h-3 w-3" />}
        label="Control Panel"
      >
        <ControlPanel
          detailLevel={detailLevel}
          expanded={expanded}
          onDetailLevelChange={setDetailLevel}
          onExpandedChange={setExpanded}
          result={result}
          {...(onReanalyze ? { onReanalyze } : {})}
          {...(isReanalyzing !== undefined ? { isReanalyzing } : {})}
        />
      </SectionCard>

      {/* ── Perception Engine ─────────────────────────────────────────────── */}
      <SectionCard
        accentClass="bg-sky-400"
        delay={0.32}
        icon={<Eye className="h-3 w-3" />}
        label="Perception Engine"
      >
        <PerceptionPanel expanded={expanded} result={result} />
      </SectionCard>

      {/* ── Agent Mode ────────────────────────────────────────────────────── */}
      <SectionCard
        accentClass="bg-violet-400"
        delay={0.38}
        icon={<Bot className="h-3 w-3" />}
        label="Agent Mode"
      >
        <AgentPanel />
      </SectionCard>

      {/* ── Simulate Fix ──────────────────────────────────────────────────── */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3, delay: 0.44 }}
      >
        <Button
          className="w-full border-zinc-700 bg-transparent text-zinc-300 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-white"
          onClick={handleSimulateFix}
          variant="outline"
        >
          <Play className="mr-2 h-4 w-4 text-indigo-400" />
          Simulate Fix
        </Button>
      </motion.div>

      {/* ── Email Capture ─────────────────────────────────────────────────── */}
      <EmailCapture result={result} />
    </motion.div>
  );
}

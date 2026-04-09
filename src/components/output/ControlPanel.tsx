"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, ClipboardCopy, RefreshCw, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/analyzer";

type DetailLevel = "simple" | "detailed";

type ControlPanelProps = {
  result: AnalysisResult;
  detailLevel: DetailLevel;
  expanded: boolean;
  onDetailLevelChange: (level: DetailLevel) => void;
  onExpandedChange: (expanded: boolean) => void;
  onReanalyze?: (() => void) | undefined;
  isReanalyzing?: boolean | undefined;
};

export function ControlPanel({
  result,
  detailLevel,
  expanded,
  onDetailLevelChange,
  onExpandedChange,
  onReanalyze,
  isReanalyzing,
}: ControlPanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = [
      "PROBLEM:",
      result.problem,
      "",
      "CAUSE:",
      result.cause,
      "",
      "EXPLANATION:",
      result.explanation,
      "",
      "FIX:",
      ...result.fix.map((s, i) => `${i + 1}. ${s}`),
      "",
      "PREVENTION:",
      ...result.prevention.map((t) => `• ${t}`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Detail toggle */}
      <Button
        aria-label={`Switch to ${detailLevel === "detailed" ? "simple" : "detailed"} view`}
        className="gap-1.5 rounded-lg text-xs"
        onClick={() => onDetailLevelChange(detailLevel === "detailed" ? "simple" : "detailed")}
        size="sm"
        variant="outline"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {detailLevel === "detailed" ? "Simple" : "Detailed"}
      </Button>

      {/* Expand / Collapse */}
      <Button
        aria-label={expanded ? "Collapse all sections" : "Expand all sections"}
        className="gap-1.5 rounded-lg text-xs"
        onClick={() => onExpandedChange(!expanded)}
        size="sm"
        variant="outline"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? "Collapse All" : "Expand All"}
      </Button>

      {/* Copy Report */}
      <Button
        aria-label="Copy full report to clipboard"
        className="gap-1.5 rounded-lg text-xs"
        onClick={handleCopy}
        size="sm"
        variant="outline"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5"
              exit={{ opacity: 0, scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Copied
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5"
              exit={{ opacity: 0, scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <ClipboardCopy className="h-3.5 w-3.5" />
              Copy Report
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Re-analyze */}
      {onReanalyze ? (
        <Button
          aria-label="Re-analyze this issue"
          className="gap-1.5 rounded-lg text-xs"
          disabled={isReanalyzing}
          onClick={onReanalyze}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isReanalyzing ? "animate-spin" : ""}`} />
          Re-analyze
        </Button>
      ) : null}
    </div>
  );
}

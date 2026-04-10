"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GuaranteeResult } from "@/lib/guarantee";
import { calculateGuaranteeLevel, calculateRegressionRisk } from "@/lib/guarantee";

import { GuaranteeOutput } from "./GuaranteeOutput";

// Mock data generator simulating combined data from /fix, /verify, /trust
function generateMockGuaranteeData(): GuaranteeResult {
  // Simulate fix confidence (success probability)
  const successProbability = 70 + Math.floor(Math.random() * 30); // 70-100

  // Calculate regression risk based on success probability
  const regressionRisk = calculateRegressionRisk(successProbability);

  // Calculate guarantee level based on success probability
  const level = calculateGuaranteeLevel(successProbability);

  // Stability window based on level
  const stabilityWindows = ["24 hours", "48 hours", "72 hours", "7 days", "30 days"];
  const stabilityWindow: string =
    level === "Strong Guarantee"
      ? stabilityWindows[Math.min(3 + Math.floor(Math.random() * 2), 4)] ?? "7 days"
      : level === "Moderate Guarantee"
        ? stabilityWindows[Math.min(2 + Math.floor(Math.random() * 2), 4)] ?? "72 hours"
        : stabilityWindows[Math.min(Math.floor(Math.random() * 2), 2)] ?? "24 hours";

  return {
    successProbability,
    regressionRisk,
    stabilityWindow: stabilityWindow ?? "24 hours",
    level,
  };
}

// Default empty state message
const emptyStateMessage = "Run /fix and /verify to generate guarantee.";

export function GuaranteeInput() {
  const [input, setInput] = useState("");
  const [guaranteeData, setGuaranteeData] = useState<GuaranteeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);

  function scrollToOutput() {
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  async function calculateGuarantee() {
    setLoading(true);
    setError(null);
    setIsEmpty(false);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate mock guarantee data (in production, this would combine real data from /fix, /verify, /trust)
      const result = generateMockGuaranteeData();
      setGuaranteeData(result);
      scrollToOutput();
    } catch (err) {
      console.error("Guarantee calculation error:", err);
      setError("Failed to calculate guarantee. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = loading;

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-colors focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.07)]">
        <textarea
          className="min-h-[148px] w-full resize-none bg-transparent px-5 py-4 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void calculateGuarantee();
          }}
          placeholder={
            "Optional: Paste system description or leave empty for automatic guarantee calculation…\n\nExample: Production deployment with recent fix applied, verification passed"
          }
          value={input}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/60 px-5 py-3">
          <span className="font-mono text-[11px] text-zinc-600">
            {input.length > 0 ? `${input.length} chars` : "Leave empty for auto-calculation"}
          </span>

          <div className="flex gap-2">
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
              disabled={isDisabled}
              onClick={() => void calculateGuarantee()}
              size="sm"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="mr-1.5 h-3.5 w-3.5" />
              )}
              {loading ? "Calculating…" : "Calculate Guarantee"}
            </Button>
          </div>
        </div>
      </div>

      <div ref={outputRef}>
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="loading"
              transition={{ duration: 0.2 }}
            >
              <GuaranteeOutput loading />
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="error"
              transition={{ duration: 0.2 }}
            >
              <ErrorState message={error} onRetry={() => void calculateGuarantee()} />
            </motion.div>
          )}

          {!loading && !error && isEmpty && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="empty"
              transition={{ duration: 0.2 }}
            >
              <Card className="border-zinc-800/80 bg-zinc-900 shadow-sm">
                <div className="px-5 py-4 text-center">
                  <p className="text-sm text-zinc-400">{emptyStateMessage}</p>
                </div>
              </Card>
            </motion.div>
          )}

          {!loading && !error && !isEmpty && guaranteeData && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="output"
              transition={{ duration: 0.3 }}
            >
              <GuaranteeOutput guaranteeData={guaranteeData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

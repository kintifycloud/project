"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import type { TrustResult } from "@/lib/trust";
import { calculateTrustScore, getTrustStatus } from "@/lib/trust";

import { TrustOutput } from "./TrustOutput";

// Mock data generator simulating combined data from /live, /verify, /flow
function generateMockTrustData(): TrustResult {
  // Simulate breakdown values from different modules
  const stability = 70 + Math.floor(Math.random() * 30); // 70-100
  const errors = 65 + Math.floor(Math.random() * 35); // 65-100
  const performance = 68 + Math.floor(Math.random() * 32); // 68-100
  const verification = 72 + Math.floor(Math.random() * 28); // 72-100

  const breakdown = {
    stability,
    errors,
    performance,
    verification,
  };

  const score = calculateTrustScore(breakdown);
  const status = getTrustStatus(score);

  const insights = [
    "System is stable but performance may degrade under peak traffic.",
    "All systems operating within normal parameters. Trust score is high.",
    "Verification shows some inconsistencies. Review recent changes.",
    "Error rate is elevated. Monitor for potential instability.",
    "Performance metrics are excellent. System is highly reliable.",
    "Stability is good but verification needs attention before deployment.",
  ];

  const insight = insights[Math.floor(Math.random() * insights.length)] ?? "System trust calculated successfully.";

  return {
    score,
    status,
    breakdown,
    insight,
  };
};

export function TrustInput() {
  const [input, setInput] = useState("");
  const [trustData, setTrustData] = useState<TrustResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);

  function scrollToOutput() {
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  async function calculateTrust() {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate mock trust data (in production, this would combine real data from /live, /verify, /flow)
      const result = generateMockTrustData();
      setTrustData(result);
      scrollToOutput();
    } catch (err) {
      console.error("Trust calculation error:", err);
      setError("Failed to calculate trust score. Please try again.");
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
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void calculateTrust();
          }}
          placeholder={
            "Optional: Paste system description or leave empty for automatic trust calculation…\n\nExample: Production cluster with 5 nodes, recent deployment, error rate 0.1%"
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
              onClick={() => void calculateTrust()}
              size="sm"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="mr-1.5 h-3.5 w-3.5" />
              )}
              {loading ? "Calculating…" : "Calculate Trust"}
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
              <TrustOutput loading />
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
              <ErrorState message={error} onRetry={() => void calculateTrust()} />
            </motion.div>
          )}

          {!loading && !error && trustData && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="output"
              transition={{ duration: 0.3 }}
            >
              <TrustOutput trustData={trustData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GuaranteeResult } from "@/lib/guarantee";
import { calculateGuaranteeLevel, calculateRegressionRisk, isGuaranteeResult } from "@/lib/guarantee";

import { GuaranteeOutput } from "./GuaranteeOutput";

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
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a system description to calculate guarantee.");
      return;
    }

    setLoading(true);
    setError(null);
    setIsEmpty(false);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/api/guarantee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API returned ${res.status}`);
      }

      const data: unknown = await res.json();

      console.log("GUARANTEE API RESPONSE:", data);

      if (!data) {
        throw new Error("No data received from API");
      }

      if (isGuaranteeResult(data)) {
        setGuaranteeData(data);
        scrollToOutput();
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (err) {
      console.error("Guarantee API error:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Request timed out. Please try again.");
        } else if (err.message.includes("fetch")) {
          setError("Network error. Please check your connection.");
        } else {
          setError(err.message || "Failed to calculate guarantee. Please try again.");
        }
      } else {
        setError("Failed to calculate guarantee. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = loading || input.trim().length === 0;

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-colors focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.07)]">
        <textarea
          className="min-h-[148px] w-full resize-none bg-transparent px-4 py-4 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50 sm:px-5 sm:min-h-[160px]"
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/60 px-4 py-3 sm:px-5 sm:py-4">
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

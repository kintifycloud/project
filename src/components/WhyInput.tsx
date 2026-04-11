"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { isWhyResult, type WhyResult } from "@/lib/why";

import { WhyOutput } from "./WhyOutput";

function buildFallbackWhy(rawText: string): WhyResult {
  const short = rawText.trim().slice(0, 420);

  return {
    why:
      short.length > 0
        ? "The system is reacting to a destabilizing input and escalating into failure."
        : "The system entered a failure mode due to destabilizing conditions.",
    reason:
      "A likely mismatch between workload behavior and resource/configuration limits caused the system to exceed safe operating bounds.",
    insight:
      "This pattern tends to repeat under load when limits, scaling behavior, or retry/restart policies amplify pressure instead of stabilizing the system.",
    confidence: 45,
  };
}

function parseWhyApiResponse(raw: unknown): WhyResult {
  if (isWhyResult(raw)) return raw;

  if (raw && typeof raw === "object" && "raw" in raw && typeof (raw as { raw: unknown }).raw === "string") {
    return buildFallbackWhy((raw as { raw: string }).raw);
  }

  if (typeof raw === "string") {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as unknown;
        if (isWhyResult(parsed)) return parsed;
      } catch {
        // fall through
      }
    }

    return buildFallbackWhy(raw);
  }

  return buildFallbackWhy("Unexpected API response shape.");
}

export function WhyInput() {
  const [input, setInput] = useState("");
  const [whyData, setWhyData] = useState<WhyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);

  function scrollToOutput() {
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  async function handleWhy() {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setWhyData(null);

    try {
      const res = await fetch("/api/why", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data: unknown = await res.json();
      const parsed = parseWhyApiResponse(data);
      setWhyData(parsed);
      scrollToOutput();
    } catch (err) {
      console.error("Why API error:", err);
      setError("Failed to explain why. Please try again.");
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
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleWhy();
          }}
          placeholder={
            "Paste logs or an incident description…\n\nExample: repeated pod restarts during peak traffic after enabling autoscaling"
          }
          value={input}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/60 px-4 py-3 sm:px-5 sm:py-4">
          <span className="font-mono text-[11px] text-zinc-600">
            {input.length > 0 ? `${input.length} chars` : "⌘ + Enter to submit"}
          </span>

          <div className="flex gap-2">
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
              disabled={isDisabled}
              onClick={() => void handleWhy()}
              size="sm"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="mr-1.5 h-3.5 w-3.5" />
              )}
              {loading ? "Analyzing…" : "Explain Why"}
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
              <WhyOutput loading />
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
              <ErrorState message={error} onRetry={() => void handleWhy()} />
            </motion.div>
          )}

          {!loading && !error && whyData && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="output"
              transition={{ duration: 0.3 }}
            >
              <WhyOutput whyData={whyData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

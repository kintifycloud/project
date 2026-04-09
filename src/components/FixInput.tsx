"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Play, Sparkles } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { FixOutput } from "@/components/FixOutput";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/analyzer";

// ─── Sample input ─────────────────────────────────────────────────────────────

const SAMPLE_INPUT = `TypeError: Cannot read properties of undefined (reading 'map')
    at ProductList (/app/components/ProductList.jsx:42:18)
    at renderWithHooks (react-dom.development.js:14985)

Redux state: { products: undefined, loading: false, error: null }
API /api/products → 200 OK → body: { data: null }`;

// ─── Fallback parser ───────────────────────────────────────────────────────────
// If the OpenRouter response is raw text instead of structured JSON,
// we construct a valid AnalysisResult so output ALWAYS renders.

function buildFallbackResult(rawText: string): AnalysisResult {
  return {
    category: "Unknown",
    problem: rawText.slice(0, 300) || "Unable to parse structured response.",
    cause: "Unable to determine exact cause from the provided input. Likely a configuration or null-reference issue.",
    explanation: "The system detected an anomaly but could not fully structure the response. Review the raw output above.",
    fix: [
      "Check logs - Review recent application logs for stack traces.",
      "Restart service - Attempt a clean restart of the affected service.",
      "Validate config - Verify all environment variables and configuration files.",
    ],
    prevention: [
      "Add null-safety guards around all API response fields.",
      "Implement schema validation (zod/yup) on API responses.",
      "Add integration tests for critical data paths.",
    ],
  };
}

// ─── Strict JSON parser ────────────────────────────────────────────────────────

function parseApiResponse(raw: unknown): AnalysisResult {
  // Already a valid-looking AnalysisResult object
  if (
    raw &&
    typeof raw === "object" &&
    "problem" in raw &&
    "cause" in raw &&
    "fix" in raw
  ) {
    return raw as AnalysisResult;
  }

  // Raw string — attempt to extract JSON block
  if (typeof raw === "string") {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as unknown;
        if (
          parsed &&
          typeof parsed === "object" &&
          "problem" in parsed &&
          "cause" in parsed &&
          "fix" in parsed
        ) {
          return parsed as AnalysisResult;
        }
      } catch {
        // fall through to fallback
      }
    }
    // Build fallback from raw text
    return buildFallbackResult(raw);
  }

  // Unknown shape — use empty fallback
  return buildFallbackResult("Unexpected API response shape.");
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FixInput() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<AnalysisResult | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);

  // ── Scroll to output ────────────────────────────────────────────────────
  function scrollToOutput() {
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  // ── Main analysis call ──────────────────────────────────────────────────
  async function handleFix() {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data: unknown = await res.json();

      // Debug — confirm data is arriving
      console.log("API RESPONSE:", data);

      const parsed = parseApiResponse(data);
      setOutput(parsed);
      scrollToOutput();
    } catch (err) {
      console.error("Fix API error:", err);
      setError("Failed to analyze issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Re-analyze (passed into FixOutput ControlPanel) ────────────────────
  async function handleReanalyze() {
    await handleFix();
  }

  // ── Load sample ─────────────────────────────────────────────────────────
  function handleSample() {
    setInput(SAMPLE_INPUT);
  }

  const isDisabled = loading || input.trim().length === 0;

  return (
    <div className="w-full">
      {/* ── Input card ─────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-colors focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.07)]">
        <textarea
          className="min-h-[148px] w-full resize-none bg-transparent px-5 py-4 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleFix();
          }}
          placeholder={
            "Paste logs, errors, or describe your issue…\n\ne.g. TypeError: Cannot read properties of undefined (reading 'map')\n    at ProductList (/app/components/ProductList.jsx:42:18)"
          }
          value={input}
        />

        {/* Footer row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/60 px-5 py-3">
          <span className="font-mono text-[11px] text-zinc-600">
            {input.length > 0 ? `${input.length} chars` : "⌘ + Enter to submit"}
          </span>

          <div className="flex gap-2">
            <Button
              className="border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
              disabled={loading}
              onClick={handleSample}
              size="sm"
              variant="outline"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Try Sample
            </Button>

            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
              disabled={isDisabled}
              onClick={() => void handleFix()}
              size="sm"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="mr-1.5 h-3.5 w-3.5" />
              )}
              {loading ? "Analyzing…" : "Fix Issue"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Output area — ALWAYS rendered when state is set ────────────── */}
      <div ref={outputRef}>
        <AnimatePresence mode="wait">
          {/* Loading skeleton */}
          {loading && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="loading"
              transition={{ duration: 0.2 }}
            >
              <LoadingState />
            </motion.div>
          )}

          {/* Error state */}
          {!loading && error && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="error"
              transition={{ duration: 0.2 }}
            >
              <ErrorState
                message={error}
                onRetry={() => void handleFix()}
              />
            </motion.div>
          )}

          {/* Output — fades in after API responds */}
          {!loading && !error && output && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="output"
              transition={{ duration: 0.3 }}
            >
              <FixOutput
                isReanalyzing={loading}
                onReanalyze={handleReanalyze}
                result={output}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

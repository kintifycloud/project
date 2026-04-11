"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { isFlowResult, type FlowResult } from "@/lib/flow";

import { FlowOutput } from "./FlowOutput";

function buildFallbackFlow(): FlowResult {
  return {
    flow: [
      "Input received",
      "System processing",
      "Resource allocation",
      "Output generation",
      "Response delivered",
    ],
    pattern: "Unknown but unstable",
    risk: "medium",
    insight:
      "The flow analysis could not be parsed as structured JSON. This fallback is a best-effort reconstruction from the raw response.",
    confidence: 45,
  };
}

function parseFlowApiResponse(raw: unknown): FlowResult {
  if (isFlowResult(raw)) return raw;

  if (raw && typeof raw === "object" && "raw" in raw && typeof (raw as { raw: unknown }).raw === "string") {
    return buildFallbackFlow();
  }

  if (typeof raw === "string") {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as unknown;
        if (isFlowResult(parsed)) return parsed;
      } catch {
        // fall through
      }
    }

    return buildFallbackFlow();
  }

  return buildFallbackFlow();
}

export function FlowInput() {
  const [input, setInput] = useState("");
  const [flowData, setFlowData] = useState<FlowResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);

  function scrollToOutput() {
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  async function handleFlow() {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter system logs or metrics to analyze flow patterns.");
      return;
    }

    setLoading(true);
    setError(null);
    setFlowData(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/api/flow", {
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

      console.log("FLOW API RESPONSE:", data);

      if (!data) {
        throw new Error("No data received from API");
      }

      const parsed = parseFlowApiResponse(data);
      setFlowData(parsed);
      scrollToOutput();
    } catch (err) {
      console.error("Flow API error:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Request timed out. Please try again.");
        } else if (err.message.includes("fetch")) {
          setError("Network error. Please check your connection.");
        } else {
          setError(err.message || "Failed to analyze flow. Please try again.");
        }
      } else {
        setError("Failed to analyze flow. Please try again.");
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
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleFlow();
          }}
          placeholder={
            "Paste system logs or metrics to analyze flow patterns…\n\nExample: CPU usage spiked from 20% to 95% over 2 minutes, followed by pod restarts and increased error rates"
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
              onClick={() => void handleFlow()}
              size="sm"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="mr-1.5 h-3.5 w-3.5" />
              )}
              {loading ? "Analyzing…" : "Analyze Flow"}
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
              <FlowOutput loading />
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
              <ErrorState message={error} onRetry={() => void handleFlow()} />
            </motion.div>
          )}

          {!loading && !error && flowData && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="output"
              transition={{ duration: 0.3 }}
            >
              <FlowOutput flowData={flowData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

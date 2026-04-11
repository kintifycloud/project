"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { isTraceResult, type TraceResult } from "@/lib/trace";

import { TraceOutput } from "./TraceOutput";

function buildFallbackTrace(rawText: string): TraceResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 4);

  const timeline = (lines.length ? lines : ["Event observed", "Degradation detected", "Recovery attempt"])
    .slice(0, 3)
    .map((line, idx) => ({
      time: `T+${idx}`,
      event: line.length > 160 ? `${line.slice(0, 160)}…` : line,
    }));

  return {
    timeline,
    causeChain: ["Signal anomaly", "Resource pressure", "Reactive recovery"],
    insight:
      "The trace output could not be parsed as structured JSON. This fallback is a best-effort reconstruction from the raw response.",
    confidence: 40,
  };
}

function parseTraceApiResponse(raw: unknown): TraceResult {
  if (isTraceResult(raw)) return raw;

  if (raw && typeof raw === "object" && "raw" in raw && typeof (raw as { raw: unknown }).raw === "string") {
    return buildFallbackTrace((raw as { raw: string }).raw);
  }

  if (typeof raw === "string") {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as unknown;
        if (isTraceResult(parsed)) return parsed;
      } catch {
        // fall through
      }
    }

    return buildFallbackTrace(raw);
  }

  return buildFallbackTrace("Unexpected API response shape.");
}

export function TraceInput() {
  const [input, setInput] = useState("");
  const [trace, setTrace] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);

  function scrollToOutput() {
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  async function handleTrace() {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter logs or an incident description to trace.");
      return;
    }

    setLoading(true);
    setError(null);
    setTrace(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/api/trace", {
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

      console.log("TRACE API RESPONSE:", data);

      if (!data) {
        throw new Error("No data received from API");
      }

      const parsed = parseTraceApiResponse(data);
      setTrace(parsed);
      scrollToOutput();
    } catch (err) {
      console.error("Trace API error:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Request timed out. Please try again.");
        } else if (err.message.includes("fetch")) {
          setError("Network error. Please check your connection.");
        } else {
          setError(err.message || "Failed to trace system behavior. Please try again.");
        }
      } else {
        setError("Failed to trace system behavior. Please try again.");
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
          className="min-h-[148px] w-full resize-none bg-transparent px-5 py-4 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleTrace();
          }}
          placeholder={
            "Paste logs or an incident description…\n\nExample: 12:03 Memory spike detected; kubelet eviction; pod restarted"
          }
          value={input}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/60 px-5 py-3">
          <span className="font-mono text-[11px] text-zinc-600">
            {input.length > 0 ? `${input.length} chars` : "⌘ + Enter to submit"}
          </span>

          <div className="flex gap-2">
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
              disabled={isDisabled}
              onClick={() => void handleTrace()}
              size="sm"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="mr-1.5 h-3.5 w-3.5" />
              )}
              {loading ? "Tracing…" : "Trace System"}
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
              <TraceOutput loading />
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
              <ErrorState message={error} onRetry={() => void handleTrace()} />
            </motion.div>
          )}

          {!loading && !error && trace && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="output"
              transition={{ duration: 0.3 }}
            >
              <TraceOutput trace={trace} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

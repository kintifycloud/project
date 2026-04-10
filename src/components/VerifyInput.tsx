"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { isVerifyResult, type VerifyResult } from "@/lib/verify";

import { VerifyOutput } from "./VerifyOutput";

function buildFallbackVerify(rawText: string): VerifyResult {
  const short = rawText.trim().slice(0, 420);

  return {
    status: "unstable",
    result:
      short.length > 0
        ? "Verification result is uncertain. The system may be in an intermediate state."
        : "Verification could not determine a definitive status based on the provided input.",
    signals: [
      "Unable to confirm service health from input",
      "Error rate and restart patterns not clearly observed",
      "Latency trends cannot be assessed without metrics",
    ],
    method:
      "Verification engine could not parse a clear signal pattern. This fallback reflects uncertainty rather than confirmation.",
    confidence: 45,
  };
}

function parseVerifyApiResponse(raw: unknown): VerifyResult {
  if (isVerifyResult(raw)) return raw;

  if (raw && typeof raw === "object" && "raw" in raw && typeof (raw as { raw: unknown }).raw === "string") {
    return buildFallbackVerify((raw as { raw: string }).raw);
  }

  if (typeof raw === "string") {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as unknown;
        if (isVerifyResult(parsed)) return parsed;
      } catch {
        // fall through
      }
    }

    return buildFallbackVerify(raw);
  }

  return buildFallbackVerify("Unexpected API response shape.");
}

export function VerifyInput() {
  const [input, setInput] = useState("");
  const [verifyData, setVerifyData] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);

  function scrollToOutput() {
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  async function handleVerify() {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setVerifyData(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data: unknown = await res.json();
      const parsed = parseVerifyApiResponse(data);
      setVerifyData(parsed);
      scrollToOutput();
    } catch (err) {
      console.error("Verify API error:", err);
      setError("Failed to verify system. Please try again.");
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
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleVerify();
          }}
          placeholder={
            "Paste fix description or system state to verify…\n\nExample: Applied memory limit fix to deployment, observed pod restarts stopped, CPU stable"
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
              onClick={() => void handleVerify()}
              size="sm"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="mr-1.5 h-3.5 w-3.5" />
              )}
              {loading ? "Verifying…" : "Verify System"}
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
              <VerifyOutput loading />
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
              <ErrorState message={error} onRetry={() => void handleVerify()} />
            </motion.div>
          )}

          {!loading && !error && verifyData && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="output"
              transition={{ duration: 0.3 }}
            >
              <VerifyOutput verifyData={verifyData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

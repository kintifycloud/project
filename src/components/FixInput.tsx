"use client";

import { KeyboardEvent, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { FixHistory } from "@/components/FixHistory";
import { LoadingState } from "@/components/LoadingState";
import { StreamingChatOutput } from "@/components/StreamingChatOutput";
import { Button } from "@/components/ui/button";
import type { LlmAnalysisResult } from "@/lib/analyzer";
import { saveToHistory } from "@/lib/history";
import { slugify } from "@/lib/store";
import { cn } from "@/lib/utils";

type FixInputProps = {
  className?: string;
  defaultValue?: string;
  showOutput?: boolean;
};

export function FixInput({ className, defaultValue = "", showOutput = true }: FixInputProps) {
  const [input, setInput] = useState(defaultValue);
  const [output, setOutput] = useState<LlmAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitForm = useCallback(async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      setError("Please paste an error, API, or system issue first.");
      return;
    }

    setLoading(true);
    setError(null);
    setOutput(null);

    console.log("SUBMITTING:", trimmedInput);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: trimmedInput }),
      });

      console.log("API RESPONSE STATUS:", response.status);

      if (!response.ok) {
        const err = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error || "Could not analyze issue. Try again.");
      }

      const data = (await response.json()) as LlmAnalysisResult;
      console.log("API RESPONSE DATA:", data);

      const generatedSlug = slugify(trimmedInput);
      setOutput(data);
      saveToHistory({
        input: trimmedInput,
        slug: generatedSlug,
        problem: data.problem,
        timestamp: Date.now(),
      });

      // Scroll to output after result
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.error("API ERROR:", err);
      setError(err instanceof Error ? err.message : "Could not analyze issue. Try again.");
    } finally {
      setLoading(false);
    }
  }, [input]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitForm();
    }
  }

  function handleTrySample() {
    setInput("Kubernetes pod restarts frequently with high memory usage and occasional CPU spikes");
    setError(null);
  }

  return (
    <div className={cn("space-y-6 sm:space-y-8", className)}>
      {/* Input Section */}
      <div className="space-y-4">
        <textarea
          aria-label="Describe your system issue"
          className="min-h-[140px] w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
          disabled={loading}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste logs, errors, or describe your issue..."
          value={input}
        />
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            className="w-full sm:w-auto"
            disabled={loading || !input.trim()}
            onClick={() => void submitForm()}
            type="button"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Fix Issue
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={loading}
            onClick={handleTrySample}
            type="button"
            variant="outline"
          >
            Try Sample
          </Button>
        </div>
      </div>

      {/* Output Section - Always renders based on state */}
      {showOutput && (
        <div className="mx-auto w-full max-w-3xl mt-8 sm:mt-10">
          {loading && <LoadingState />}
          {error && <ErrorState message={error} onRetry={() => void submitForm()} />}
          {output && (
            <AnimatePresence mode="wait">
              <motion.div
                key="output"
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 sm:space-y-6"
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35 }}
              >
                <StreamingChatOutput
                  onRefine={(newInput) => {
                    setInput(newInput);
                    void submitForm();
                  }}
                  result={output}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* History (hidden for cleaner UI - can be shown via toggle) */}
      <FixHistory />
    </div>
  );
}

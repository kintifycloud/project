"use client";

import { KeyboardEvent, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { FixHistory } from "@/components/FixHistory";
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
  const [result, setResult] = useState<LlmAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = useCallback(async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      setError("Please paste an error, API, or system issue first.");
      return;
    }

    setError(null);
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: trimmedInput }),
      });

      if (!response.ok) {
        const err = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error || "Could not analyze issue. Try again.");
      }

      const data = (await response.json()) as LlmAnalysisResult;
      const generatedSlug = slugify(trimmedInput);
      setResult(data);
      saveToHistory({
        input: trimmedInput,
        slug: generatedSlug,
        problem: data.problem,
        timestamp: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze issue. Try again.");
    } finally {
      setIsSubmitting(false);
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
          disabled={isSubmitting}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste logs, errors, or describe your issue..."
          value={input}
        />
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            className="w-full sm:w-auto"
            disabled={isSubmitting || !input.trim()}
            onClick={() => void submitForm()}
            type="button"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Fix Issue
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={handleTrySample}
            type="button"
            variant="outline"
          >
            Try Sample
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isSubmitting ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-base font-medium text-white">Kintify is analyzing your system...</p>
        </div>
      ) : null}

      {/* Output Section */}
      {showOutput && result ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="output"
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-3xl mt-8 sm:mt-10 space-y-4 sm:space-y-6"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35 }}
          >
            <StreamingChatOutput
              onRefine={(newInput) => {
                setInput(newInput);
                void submitForm();
              }}
              result={result}
            />
          </motion.div>
        </AnimatePresence>
      ) : null}

      {/* History (hidden for cleaner UI - can be shown via toggle) */}
      <FixHistory />
    </div>
  );
}

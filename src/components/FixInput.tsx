"use client";

import { FormEvent, KeyboardEvent, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { FixHistory } from "@/components/FixHistory";
import { FixOutput } from "@/components/FixOutput";
import { FixOutputAnimated } from "@/components/FixOutputAnimated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/analyzer";
import { saveToHistory } from "@/lib/history";
import { cn } from "@/lib/utils";

type FixInputProps = {
  className?: string;
  defaultValue?: string;
  showOutput?: boolean;
};

export function FixInput({ className, defaultValue = "", showOutput = true }: FixInputProps) {
  const router = useRouter();
  const [input, setInput] = useState(defaultValue);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
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
    setSlug(null);
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
        throw new Error(err?.error || "Unable to analyze. Try again.");
      }

      const data = (await response.json()) as AnalysisResult & { slug: string };
      setResult(data);
      if (data.slug) {
        setSlug(data.slug);
        saveToHistory({
          input: trimmedInput,
          slug: data.slug,
          problem: data.problem,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [input]);

  function handleAnimationComplete() {
    if (slug) router.push(`/fix/${slug}` as never);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitForm();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitForm();
    }
  }

  return (
    <div className={cn("space-y-6 sm:space-y-8", className)}>
      <Card className="rounded-xl border-white/8 bg-slate-950/80 shadow-sm">
        <CardHeader>
          <Badge className="w-fit gap-2" variant="secondary">
            <Sparkles className="h-3.5 w-3.5" />
            /fix cloud debugging tool
          </Badge>
          <CardTitle className="text-2xl">Paste a system issue and get a likely fix</CardTitle>
          <CardDescription>
            Use plain English, logs, API symptoms, or infrastructure errors. The analyzer returns a fast structured diagnosis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <textarea
              aria-label="Describe your system issue"
              className="min-h-36 w-full rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-300/40"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your error, API, or system issue..."
              value={input}
            />
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">Enter to submit · Shift+Enter for new line</p>
              <Button aria-label="Analyze issue" className="w-full sm:w-auto" disabled={isSubmitting} size="lg" type="submit">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Analyze issue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showOutput ? (
        <AnimatePresence mode="wait">
          {isSubmitting ? (
            <motion.div
              key="loading"
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center gap-3 py-16"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              <p className="text-base font-medium text-white">Analyzing with Kintify AI...</p>
              <p className="text-sm text-slate-400">Running intelligent diagnostics on your system issue...</p>
            </motion.div>
          ) : result ? (
            <motion.div
              key="animated-output"
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35 }}
            >
              <FixOutputAnimated onComplete={handleAnimationComplete} result={result} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35 }}
            >
              <FixOutput result={null} />
            </motion.div>
          )}
        </AnimatePresence>
      ) : null}

      <FixHistory />
    </div>
  );
}

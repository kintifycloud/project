"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState, useEffect } from "react";
import Script from "next/script";

import { FixLoader } from "@/components/FixLoader";

type FixApiSuccess = {
  success: true;
  deepPatternReasoning: string;
  ethicalLogicalIntelligence: string;
  strategicDecisionEngine: string[];
  predictiveModeling: string;
  efficiencyOptimization: string;
  confidence: number;
};

// Simple frontend display mapping
type SimpleFixDisplay = {
  rootCause: string;
  recommendedFix: string[];
  expectedOutcome: string;
  confidence: number;
};

type FixApiError = {
  success: false;
  error: string;
};

type FixApiResponse = FixApiSuccess | FixApiError;

export default function FixPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FixApiSuccess | null>(null);
  const [error, setError] = useState("");

  // Progressive reveal states (simple user-friendly names)
  const [revealedRootCause, setRevealedRootCause] = useState("");
  const [revealedRecommendedFix, setRevealedRecommendedFix] = useState<string[]>([]);
  const [revealedExpectedOutcome, setRevealedExpectedOutcome] = useState("");
  const [visibleCards, setVisibleCards] = useState<Set<"rootCause" | "recommendedFix" | "expectedOutcome" | "confidence">>(new Set());
  const [isTypingRootCause, setIsTypingRootCause] = useState(false);
  const [isTypingExpectedOutcome, setIsTypingExpectedOutcome] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Map complex backend response to simple frontend display
  const mapToSimpleDisplay = (backend: FixApiSuccess): SimpleFixDisplay => {
    return {
      rootCause: backend.deepPatternReasoning,
      recommendedFix: backend.strategicDecisionEngine,
      expectedOutcome: backend.predictiveModeling,
      confidence: backend.confidence,
    };
  };

  // Typewriter effect for text
  useEffect(() => {
    if (result) {
      const simpleDisplay = mapToSimpleDisplay(result);

      // Reset reveal states
      setRevealedRootCause("");
      setRevealedRecommendedFix([]);
      setRevealedExpectedOutcome("");
      setVisibleCards(new Set());
      setIsTypingRootCause(false);
      setIsTypingExpectedOutcome(false);

      const intervals: NodeJS.Timeout[] = [];

      // Progressive card reveal
      const revealSequence = async () => {
        // Reveal Root Cause first
        await new Promise(resolve => setTimeout(resolve, 100));
        setVisibleCards(prev => new Set([...prev, "rootCause"]));

        // Typewriter effect for Root Cause
        const rootCauseText = simpleDisplay.rootCause;
        let rootCauseIndex = 0;
        setIsTypingRootCause(true);
        const rootCauseInterval = setInterval(() => {
          if (rootCauseIndex < rootCauseText.length) {
            setRevealedRootCause(rootCauseText.slice(0, rootCauseIndex + 1));
            rootCauseIndex++;
          } else {
            clearInterval(rootCauseInterval);
            setIsTypingRootCause(false);
          }
        }, 15);
        intervals.push(rootCauseInterval);

        await new Promise(resolve => setTimeout(resolve, 800));
        setVisibleCards(prev => new Set([...prev, "recommendedFix"]));

        // Progressive reveal for Recommended Fix steps
        const recommendedFixSteps = simpleDisplay.recommendedFix;
        for (let i = 0; i < recommendedFixSteps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setRevealedRecommendedFix(prev => [...prev, recommendedFixSteps[i] as string]);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        setVisibleCards(prev => new Set([...prev, "expectedOutcome"]));

        // Typewriter effect for Expected Outcome
        const expectedOutcomeText = simpleDisplay.expectedOutcome;
        let expectedOutcomeIndex = 0;
        setIsTypingExpectedOutcome(true);
        const expectedOutcomeInterval = setInterval(() => {
          if (expectedOutcomeIndex < expectedOutcomeText.length) {
            setRevealedExpectedOutcome(expectedOutcomeText.slice(0, expectedOutcomeIndex + 1));
            expectedOutcomeIndex++;
          } else {
            clearInterval(expectedOutcomeInterval);
            setIsTypingExpectedOutcome(false);
          }
        }, 15);
        intervals.push(expectedOutcomeInterval);

        await new Promise(resolve => setTimeout(resolve, 600));
        setVisibleCards(prev => new Set([...prev, "confidence"]));
      };

      revealSequence();

      return () => {
        intervals.forEach(interval => clearInterval(interval));
      };
    }
  }, [result]);

  const samplePrompts = useMemo(
    () => [
      "Kubernetes pod crash loop",
      "API latency spike",
      "SSL certificate issue",
      "Docker container failing",
      "Database timeout",
    ],
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kintify Fix",
    url: "https://kintify.cloud/fix",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "Analyze cloud, API and infrastructure issues instantly. Get root cause, fix plan and trust validation.",
    featureList: [
      "AI root cause analysis",
      "Infrastructure issue diagnosis",
      "Fix recommendations",
      "Trust validation",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: "Kintify",
    },
  };

  return (
    <>
      <Script
        id="json-ld-fix"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-900/70">
          <div className="mx-auto flex w-full max-w-[900px] items-center justify-between px-4 py-4 sm:px-6">
            <div className="text-sm font-semibold tracking-tight text-white">
              Kintify
            </div>
            <a
              href="/docs"
              className="text-sm text-zinc-300 transition-colors hover:text-white"
            >
              Docs
            </a>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Fix production issues in minutes not hours.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Paste logs, cloud errors, or configs. Get root cause, exact fix, and
            expected outcome.
          </p>

          <div className="mt-8">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste logs, cloud errors, or describe your issue…"
              className="w-full min-h-[140px] resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {samplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setInput(prompt);
                    setError("");
                    textareaRef.current?.focus();
                  }}
                  className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <button
                type="button"
                disabled={loading || input.trim().length === 0}
                onClick={async () => {
                  if (loading || input.trim().length === 0) return;
                  setError("");
                  setResult(null);
                  setLoading(true);

                  try {
                    const res = await fetch("/api/fix", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        input,
                      }),
                    });

                    const data = (await res.json().catch(() => null)) as FixApiResponse | null;

                    if (!data) {
                      setError("Failed to analyze issue. Please try again.");
                      return;
                    }

                    if (data.success === false) {
                      setError(data.error);
                      return;
                    }

                    if (!res.ok) {
                      setError("Failed to analyze issue. Please try again.");
                      return;
                    }

                    setResult(data);
                  } catch {
                    setError("Failed to analyze issue. Please try again.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition-opacity hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Fix Issue
              </button>

              {error.length > 0 ? (
                <div className="mt-3 text-sm text-red-400">{error}</div>
              ) : null}

              {loading ? (
                <div className="mt-6">
                  <FixLoader />
                </div>
              ) : null}

              <div className="mt-6 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-10">
                {result === null ? (
                  <div className="text-center text-sm text-zinc-500">
                    Your fix result will appear here
                  </div>
                ) : (
                  <div className="space-y-5 text-sm text-zinc-200">
                    <AnimatePresence>
                      {visibleCards.has("rootCause") && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="grid gap-2"
                        >
                          <div className="text-xs font-medium tracking-wide text-zinc-400">
                            Root Cause
                          </div>
                          <div className="leading-relaxed text-zinc-100">
                            {revealedRootCause}
                            {isTypingRootCause && (
                              <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse" />
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {visibleCards.has("recommendedFix") && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="grid gap-2"
                        >
                          <div className="text-xs font-medium tracking-wide text-zinc-400">
                            Recommended Fix
                          </div>
                          <ol className="list-decimal space-y-1 pl-5 text-zinc-100">
                            {revealedRecommendedFix.map((step, idx) => (
                              <motion.li
                                key={`${idx}-${step}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="leading-relaxed"
                              >
                                {step}
                              </motion.li>
                            ))}
                          </ol>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {visibleCards.has("expectedOutcome") && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="grid gap-2"
                        >
                          <div className="text-xs font-medium tracking-wide text-zinc-400">
                            Expected Outcome
                          </div>
                          <div className="leading-relaxed text-zinc-100">
                            {revealedExpectedOutcome}
                            {isTypingExpectedOutcome && (
                              <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse" />
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {visibleCards.has("confidence") && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="flex items-center gap-2 text-xs text-zinc-400"
                        >
                          <span>Confidence</span>
                          <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-200">
                            {result.confidence}%
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

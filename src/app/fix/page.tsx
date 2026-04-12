"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState, useEffect } from "react";
import Script from "next/script";

type FixApiSuccess = {
  success: true;
  answer: string;
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

  // Progressive reveal states for single answer
  const [revealedAnswer, setRevealedAnswer] = useState("");
  const [visibleCards, setVisibleCards] = useState<Set<"answer">>(new Set());
  const [isTypingAnswer, setIsTypingAnswer] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Typewriter effect for single answer
  useEffect(() => {
    if (result) {
      // Reset reveal states
      setRevealedAnswer("");
      setVisibleCards(new Set());
      setIsTypingAnswer(false);

      const intervals: NodeJS.Timeout[] = [];

      // Progressive card reveal
      const revealSequence = async () => {
        // Reveal answer
        await new Promise(resolve => setTimeout(resolve, 100));
        setVisibleCards(prev => new Set([...prev, "answer"]));

        // Typewriter effect for answer
        const answerText = result.answer;
        let answerIndex = 0;
        setIsTypingAnswer(true);
        const answerInterval = setInterval(() => {
          if (answerIndex < answerText.length) {
            setRevealedAnswer(answerText.slice(0, answerIndex + 1));
            answerIndex++;
          } else {
            clearInterval(answerInterval);
            setIsTypingAnswer(false);
          }
        }, 15);
        intervals.push(answerInterval);
      };

      revealSequence();

      return () => {
        intervals.forEach(interval => clearInterval(interval));
      };
    }
  }, [result]);

  const samplePrompts = useMemo(
    () => [
      "Kubernetes pods stuck in CrashLoopBackOff",
      "Database connections timing out under load",
      "API p95 latency increased after deploy",
      "SSL handshake failed on production domain",
      "High CPU usage causing service slowdown",
      "Intermittent 502 errors behind load balancer",
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

        <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 sm:py-14">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
            Fix production issues in minutes not hours.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Paste logs, cloud errors, or configs. Get root cause, exact fix, and
            expected outcome.
          </p>

          <div className="mt-6 sm:mt-8">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste logs, cloud errors, or describe your issue…"
              className="w-full min-h-[180px] sm:min-h-[140px] resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-base text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
            />

            <div className="mt-4">
              <p className="mb-3 text-xs text-zinc-500">Try a sample issue</p>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((prompt) => (
                  <motion.button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      setError("");
                      textareaRef.current?.focus();
                    }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-full border border-zinc-800/80 bg-zinc-950/50 px-3 sm:px-4 py-2.5 text-xs sm:text-xs text-zinc-300 transition-all duration-200 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-zinc-100 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] active:scale-95"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
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
                className="w-full rounded-xl bg-indigo-500 px-5 py-3.5 text-sm font-medium text-white shadow-sm transition-opacity hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-3"
              >
                Fix Issue
              </button>

              {error.length > 0 ? (
                <div className="mt-3 text-sm text-red-400">{error}</div>
              ) : null}

              <div className="mt-6 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-6 sm:py-10">
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center gap-3"
                  >
                    <motion.div
                      className="h-8 w-8 rounded-full border-2 border-indigo-400/30 border-t-indigo-400"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="text-sm font-medium text-zinc-400"
                    >
                      Your fix result will appear here...
                    </motion.p>
                  </motion.div>
                ) : result === null ? (
                  <div className="text-center text-sm text-zinc-500">
                    Your fix result will appear here
                  </div>
                ) : (
                  <div className="text-sm text-zinc-200">
                    <AnimatePresence>
                      {visibleCards.has("answer") && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="leading-relaxed text-zinc-100"
                        >
                          {revealedAnswer}
                          {isTypingAnswer && (
                            <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse" />
                          )}
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

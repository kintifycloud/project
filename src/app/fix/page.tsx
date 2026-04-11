"use client";

import { useMemo, useRef, useState } from "react";
import Script from "next/script";

import { FixLoader } from "@/components/FixLoader";

type FixApiSuccess = {
  success: true;
  rootCause: string;
  fixPlan: string[];
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

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

                    if (!res.ok || !data) {
                      setError("Failed to analyze issue. Please try again.");
                      return;
                    }

                    if (data.success === false) {
                      setError(data.error);
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
                    <div className="grid gap-2">
                      <div className="text-xs font-medium tracking-wide text-zinc-400">
                        Root Cause
                      </div>
                      <div className="leading-relaxed text-zinc-100">
                        {result.rootCause}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="text-xs font-medium tracking-wide text-zinc-400">
                        Fix Plan
                      </div>
                      <ol className="list-decimal space-y-1 pl-5 text-zinc-100">
                        {result.fixPlan.map((step, idx) => (
                          <li key={`${idx}-${step}`} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="grid gap-2">
                      <div className="text-xs font-medium tracking-wide text-zinc-400">
                        Expected Outcome
                      </div>
                      <div className="leading-relaxed text-zinc-100">
                        {result.expectedOutcome}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span>Confidence</span>
                      <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-200">
                        {result.confidence}%
                      </span>
                    </div>
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

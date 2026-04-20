"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import type { FlowResponse } from "@/lib/flowPrompt";

function FlowPageContent() {
  const searchParams = useSearchParams();
  const [action, setAction] = useState(searchParams.get("action") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FlowResponse | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  async function generateSteps() {
    const trimmedAction = action.trim();

    if (!trimmedAction) {
      setError("Please enter an action to generate steps for");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCompletedSteps(new Set());

    try {
      const response = await fetch("/api/flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: trimmedAction }),
      });

      const data = (await response.json()) as unknown;

      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Failed to generate execution steps. Please try again.";
        setError(message);
        return;
      }

      setResult(data as FlowResponse);
    } catch {
      setError("Failed to generate execution steps. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleStep(index: number) {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-indigo-400">/flow</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Execution steps
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
            Step-by-step guidance for executing production fixes safely and systematically.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <textarea
            value={action}
            onChange={(e) => setAction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void generateSteps();
              }
            }}
            placeholder="Paste the action you want step-by-step execution for…"
            className="min-h-[120px] w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20"
          />

          <button
            type="button"
            disabled={loading || action.trim().length === 0}
            onClick={generateSteps}
            className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating steps..." : "Generate execution steps"}
          </button>

          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        {/* Output */}
        {result ? (
          <div className="mt-8 space-y-6">
            {/* Steps */}
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Execution steps</p>
              <div className="space-y-2">
                {result.steps.map((step, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleStep(index)}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      completedSteps.has(index)
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          completedSteps.has(index)
                            ? "border-green-500 bg-green-500"
                            : "border-zinc-600 bg-zinc-800"
                        }`}
                      >
                        {completedSteps.has(index) ? (
                          <Check className="h-3 w-3 text-white" />
                        ) : (
                          <span className="text-xs text-zinc-400">{index + 1}</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-300">{step}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Warnings</p>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="space-y-2">
                    {result.warnings.map((warning, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <p className="text-sm text-zinc-300">{warning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Rollback */}
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Rollback instruction</p>
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                <div className="flex items-start gap-3">
                  <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <p className="text-sm text-zinc-300 leading-relaxed">{result.rollback}</p>
                </div>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-500" />
            <p className="mt-3 text-sm text-zinc-500">Generating execution steps...</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function FlowPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-zinc-800" />
            <div className="mt-4 h-4 w-96 rounded bg-zinc-800" />
          </div>
        </div>
      </main>
    }>
      <FlowPageContent />
    </Suspense>
  );
}

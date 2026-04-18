"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";
import type { GuaranteeResponse } from "@/lib/guaranteePrompt";

function GuaranteePageContent() {
  const searchParams = useSearchParams();
  const [action, setAction] = useState(searchParams.get("action") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GuaranteeResponse | null>(null);

  const getProtectionColor = (level: string) => {
    switch (level) {
      case "strong":
        return {
          bg: "bg-green-500/10",
          text: "text-green-400",
          border: "border-green-500/30",
        };
      case "safe":
        return {
          bg: "bg-blue-500/10",
          text: "text-blue-400",
          border: "border-blue-500/30",
        };
      case "basic":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-400",
          border: "border-amber-500/30",
        };
      default:
        return {
          bg: "bg-zinc-500/10",
          text: "text-zinc-400",
          border: "border-zinc-500/30",
        };
    }
  };

  async function analyzeGuarantee() {
    const trimmedAction = action.trim();

    if (!trimmedAction) {
      setError("Please enter an action to analyze");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/guarantee", {
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
            : "Failed to analyze safety guarantee. Please try again.";
        setError(message);
        return;
      }

      setResult(data as GuaranteeResponse);
    } catch {
      setError("Failed to analyze safety guarantee. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-indigo-400">/guarantee</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Safety guarantee
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
            Understand what protects you if a fix fails, before you execute it in production.
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
                void analyzeGuarantee();
              }
            }}
            placeholder="Paste the action or fix you want to secure…"
            className="min-h-[120px] w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20"
          />

          <button
            type="button"
            disabled={loading || action.trim().length === 0}
            onClick={analyzeGuarantee}
            className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Check safety guarantee"}
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
            {/* Rollback Plan - Main Focus */}
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Rollback Plan</p>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
                  <p className="text-sm text-zinc-300 leading-relaxed">{result.rollbackPlan}</p>
                </div>
              </div>
            </div>

            {/* Failure Impact */}
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Failure Impact</p>
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <p className="text-sm text-zinc-300 leading-relaxed">{result.failureImpact}</p>
                </div>
              </div>
            </div>

            {/* Protection Level */}
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Protection Level</p>
              <div className={`rounded-xl border ${getProtectionColor(result.protectionLevel).border} ${getProtectionColor(result.protectionLevel).bg} p-4`}>
                <p className={`text-sm font-semibold ${getProtectionColor(result.protectionLevel).text}`}>
                  {result.protectionLevel.charAt(0).toUpperCase() + result.protectionLevel.slice(1)}
                </p>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-500" />
            <p className="mt-3 text-sm text-zinc-500">Analyzing safety guarantee...</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function GuaranteePage() {
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
      <GuaranteePageContent />
    </Suspense>
  );
}

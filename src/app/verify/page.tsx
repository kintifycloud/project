"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import type { VerifyResponse } from "@/lib/verifyPrompt";

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const [action, setAction] = useState(searchParams.get("action") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VerifyResponse | null>(null);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return {
          bg: "bg-red-500/10",
          text: "text-red-400",
          border: "border-red-500/30",
          icon: AlertTriangle,
        };
      case "medium":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-400",
          border: "border-amber-500/30",
          icon: AlertTriangle,
        };
      case "low":
        return {
          bg: "bg-green-500/10",
          text: "text-green-400",
          border: "border-green-500/30",
          icon: CheckCircle,
        };
      default:
        return {
          bg: "bg-zinc-500/10",
          text: "text-zinc-400",
          border: "border-zinc-500/30",
          icon: Shield,
        };
    }
  };

  async function verifyAction() {
    const trimmedAction = action.trim();

    if (!trimmedAction) {
      setError("Please enter an action to verify");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/verify", {
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
            : "Failed to verify action. Please try again.";
        setError(message);
        return;
      }

      setResult(data as VerifyResponse);
    } catch {
      setError("Failed to verify action. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-indigo-400">/verify</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Action verification
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
            Validate whether a suggested fix or action is safe before executing it in production.
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
                void verifyAction();
              }
            }}
            placeholder="Paste the action or fix you want to verify…"
            className="min-h-[120px] w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20"
          />

          <button
            type="button"
            disabled={loading || action.trim().length === 0}
            onClick={verifyAction}
            className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify action"}
          </button>

          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        {/* Output */}
        {result ? (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="space-y-4">
              {/* Risk Level */}
              <div className="flex items-center gap-3">
                <div className={`rounded-lg ${getRiskColor(result.riskLevel).bg} ${getRiskColor(result.riskLevel).border} border p-3`}>
                  {(() => {
                    const Icon = getRiskColor(result.riskLevel).icon;
                    return <Icon className={`h-5 w-5 ${getRiskColor(result.riskLevel).text}`} />;
                  })()}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Risk Level</p>
                  <p className={`text-lg font-semibold ${getRiskColor(result.riskLevel).text}`}>
                    {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)}
                  </p>
                </div>
              </div>

              {/* Impact */}
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Impact</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{result.impact}</p>
              </div>

              {/* Safe to Execute */}
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${result.safeToExecute ? "bg-green-500" : "bg-red-500"}`} />
                <p className="text-sm text-zinc-300">
                  {result.safeToExecute ? "Safe to execute" : "Not safe to execute immediately"}
                </p>
              </div>

              {/* Precaution */}
              <div className="rounded-lg bg-zinc-800/50 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Precaution</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{result.precaution}</p>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-500" />
            <p className="mt-3 text-sm text-zinc-500">Analyzing action safety...</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function VerifyPage() {
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
      <VerifyPageContent />
    </Suspense>
  );
}

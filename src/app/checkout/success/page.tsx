"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";

import { type KintifyPlan, writeKintifyPlan } from "@/lib/monetization";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const rawPlan = searchParams.get("plan");
  const plan: KintifyPlan = rawPlan === "enterprise" ? "enterprise" : rawPlan === "team" ? "team" : "pro";
  const isDemo = searchParams.get("demo") === "1";

  useEffect(() => {
    writeKintifyPlan(plan);
  }, [plan]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
          {isDemo ? "Checkout demo complete" : "Checkout complete"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
          {plan === "enterprise"
            ? "Enterprise access is ready. Organizations, audit visibility, and production-safe incident workflows can now be enabled."
            : plan === "team"
              ? "Team access is ready. Shared incidents and multi-user workflows can now be layered in."
              : "Pro access is ready. You can return to /fix for unlimited fixes, faster responses, and full history access."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/fix"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Return to /fix
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/pricing?checkout=success&plan=${plan}`}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            Back to pricing
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

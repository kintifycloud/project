import type { Metadata } from "next";
import Link from "next/link";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FixInput } from "@/components/FixInput";

export const metadata: Metadata = {
  title: "Fix Cloud Problems Instantly | Kintify",
  description: "Paste your cloud issue and instantly see what's wrong and how to fix it.",
  alternates: {
    canonical: "/fix",
  },
};

export default function FixPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      {/* ── Sticky nav bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-white">
              Kintify
            </span>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-3 text-sm text-zinc-400">
              <Link className="text-white" href="/fix">
                Fix
              </Link>
              <Link className="hover:text-white" href="/trace">
                Trace
              </Link>
              <Link className="hover:text-white" href="/why">
                Why
              </Link>
              <Link className="hover:text-white" href="/verify">
                Verify
              </Link>
              <Link className="hover:text-white" href="/flow">
                Flow
              </Link>
              <Link className="hover:text-white" href="/live">
                Live
              </Link>
              <Link className="hover:text-white" href="/trust">
                Trust
              </Link>
              <Link className="hover:text-white" href="/guarantee">
                Guarantee
              </Link>
            </nav>
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 font-mono text-[11px] text-indigo-400">
              Intelligence Active
            </span>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="px-4 pb-2 pt-14 text-center sm:px-6 sm:pt-16 md:pt-20">
        {/* Eyebrow badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/80 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono text-[11px] text-zinc-400">
            Root cause · Exact fix · Verified outcome
          </span>
        </div>

        <h1 className="mx-auto max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.6rem]">
          Fix production issues in{" "}
          <span className="text-indigo-400">minutes</span>{" "}
          <span className="text-zinc-500">not hours.</span>
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
          Paste logs, errors, or configs. Get root cause, exact fix and
          verified outcome.
        </p>
      </section>

      {/* ── Input Section ──────────────────────────────────────────── */}
      <section className="px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <ErrorBoundary>
            <FixInput />
          </ErrorBoundary>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60 px-4 py-6 text-center">
        <p className="font-mono text-xs text-zinc-600">
          Built for developers fixing real systems
        </p>
      </footer>
    </main>
  );
}

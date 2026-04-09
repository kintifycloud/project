import type { Metadata } from "next";

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
      {/* Hero Section */}
      <section className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 md:py-10">
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
              Fix production issues in minutes not hours.
            </h1>
            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              Paste logs, errors, or configs. Get root cause, exact fix and verified outcome.
            </p>
          </div>
        </div>
      </section>

      {/* Input Section */}
      <section className="px-4 py-6 sm:px-6 sm:py-8 md:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <ErrorBoundary>
            <FixInput />
          </ErrorBoundary>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-4 py-6 text-center text-sm text-zinc-500">
        Built for developers fixing real systems
      </footer>
    </main>
  );
}

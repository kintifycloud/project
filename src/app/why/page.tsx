import type { Metadata } from "next";
import Script from "next/script";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WhyInput } from "@/components/WhyInput";
import { PageNavbar } from "@/components/PageNavbar";

export const metadata: Metadata = {
  title: "Why Systems Behave This Way | Kintify",
  description: "Paste an issue and get causal reasoning: why it happened, the underlying reason, and deeper architectural insight.",
  alternates: {
    canonical: "/why",
  },
};

export default function WhyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Kintify Why",
    url: "https://kintify.cloud/why",
    description:
      "Understand why systems behave the way they do with causal reasoning, architectural insight and root cause analysis.",
  };

  return (
    <>
      <Script
        id="json-ld-why"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-zinc-950">
        <PageNavbar activePage="why" />

        {/* Hero Section */}
        <section className="px-4 pb-4 pt-16 text-center sm:px-6 sm:pb-6 sm:pt-20 md:px-8 md:pb-8 md:pt-24 lg:pt-28">
          <div className="mx-auto w-full max-w-4xl">
            {/* Eyebrow badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/80 px-3 py-1.5 sm:px-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono text-[11px] text-zinc-400 sm:text-xs">
                Causal reasoning · Architectural insight · Root cause
              </span>
            </div>

            <h1 className="mx-auto text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-[2.6rem]">
              Understand why your system behaves this way.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base md:text-lg">
              Not just what happened the reason behind it.
            </p>
          </div>
        </section>

        {/* Input Section */}
        <section className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:py-12">
          <div className="mx-auto w-full max-w-4xl">
            <ErrorBoundary>
              <WhyInput />
            </ErrorBoundary>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/60 px-4 py-6 text-center sm:px-6 md:px-8 lg:py-8">
          <p className="font-mono text-xs text-zinc-600 sm:text-sm">
            Built for causal intelligence
          </p>
        </footer>
      </main>
    </>
  );
}

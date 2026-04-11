import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LiveInput } from "@/components/LiveInput";

export const metadata: Metadata = {
  title: "Real-Time System Intelligence | Kintify",
  description: "See your system live with clarity. Not metrics. Real time understanding.",
  alternates: {
    canonical: "/live",
  },
};

export default function LivePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kintify Live",
    url: "https://kintify.cloud/live",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "Monitor live trust signals, incidents and system health across your cloud infrastructure.",
    featureList: [
      "Real-time trust monitoring",
      "Incident stream",
      "Cloud health insights",
      "System status feed",
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
        id="json-ld-live"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-white">Kintify</span>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-3 text-sm text-zinc-400">
              <Link className="hover:text-white" href="/fix">
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
              <Link className="text-white" href="/live">
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

      <section className="px-4 pb-2 pt-14 text-center sm:px-6 sm:pt-16 md:pt-20">
        <h1 className="mx-auto max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.6rem]">
          See your system live with clarity.
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
          Not metrics. Real time understanding.
        </p>
      </section>

      <section className="px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <ErrorBoundary>
            <LiveInput />
          </ErrorBoundary>
        </div>
      </section>

      <footer className="border-t border-zinc-800/60 px-4 py-6 text-center">
        <p className="font-mono text-xs text-zinc-600">Built for real-time intelligence</p>
      </footer>
      </main>
    </>
  );
}

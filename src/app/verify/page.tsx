import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { VerifyInput } from "@/components/VerifyInput";

export const metadata: Metadata = {
  title: "Verify System Fixes | Kintify",
  description: "Prove your system is actually fixed with verified outcomes, not assumptions.",
  alternates: {
    canonical: "/verify",
  },
};

export default function VerifyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Kintify Verify",
    url: "https://kintify.cloud/verify",
    description:
      "Verify infrastructure trust using DNS proofs, HTTP trust signals and machine readable attestations.",
    serviceType: "Cloud Trust Verification",
    provider: {
      "@type": "Organization",
      name: "Kintify",
    },
  };

  return (
    <>
      <Script
        id="json-ld-verify"
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
              <Link className="text-white" href="/verify">
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

      <section className="px-4 pb-2 pt-14 text-center sm:px-6 sm:pt-16 md:pt-20">
        <h1 className="mx-auto max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.6rem]">
          Prove your system is actually fixed.
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
          Not assumptions. Verified outcomes.
        </p>
      </section>

      <section className="px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <ErrorBoundary>
            <VerifyInput />
          </ErrorBoundary>
        </div>
      </section>

      <footer className="border-t border-zinc-800/60 px-4 py-6 text-center">
        <p className="font-mono text-xs text-zinc-600">Built for verified truth</p>
      </footer>
      </main>
    </>
  );
}

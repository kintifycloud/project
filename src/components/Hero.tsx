"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CloudCog, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { DemoModal } from "@/components/DemoModal";
import { VerisigBadge } from "@/components/VerisigBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const heroStats = [
  { label: "Trust boot time", value: "<60s" },
  { label: "Signals injected", value: "DNS + HTTP" },
  { label: "Deployment friction", value: "Near zero" },
];

const heroHighlights = [
  "Instant cryptographic trust for any .cloud",
  "Readable proofs for operators, browsers, and agents",
  "No external APIs in this demo experience",
];

export function Hero({ children }: { children?: ReactNode }) {
  return (
    <section className="relative isolate">
      <div className="absolute inset-0 -z-10 grid-veil opacity-50" />
      <div className="flex min-h-[100svh] w-full flex-col pb-16 pt-8 lg:pb-20 lg:pt-10">
        <header className="flex items-center justify-between gap-4 rounded-full border border-white/8 bg-white/[0.03] px-4 py-3 backdrop-blur lg:px-5">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-emerald-200">
              <CloudCog className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Kintify VeriKernel</p>
              <p className="text-xs text-slate-400">kintify.cloud</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <Link href="/fix">Fix</Link>
            <Link href={"/trace" as any}>Trace</Link>
            <Link href={"/why" as any}>Why</Link>
            <Link href={"/verify" as any}>Verify</Link>
            <Link href="#how-it-works">How it works</Link>
            <Link href="#proofs">Proofs</Link>
            <Link href="#features">Features</Link>
            <Link href="#faq">FAQ</Link>
          </nav>
          <Button asChild size="sm" variant="outline">
            <Link href="#proofs">
              Explore proofs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </header>

        <div className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 28 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <Badge className="mb-5 gap-2" variant="default">
              <Sparkles className="h-3.5 w-3.5" />
              VeriKernel by Kintify for live DNS + HTTP proofs
            </Badge>
            <h1 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
              Why is your cloud system breaking?
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
              Paste anything. Instantly see what&apos;s wrong and how to fix it.
            </p>

            {children ? <div className="mt-8">{children}</div> : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <DemoModal />
              <Button asChild size="lg" variant="outline">
                <Link href="#how-it-works">
                  See the rollout flow
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {heroStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.45, delay: 0.18 + index * 0.08, ease: "easeOut" }}
                  className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
                >
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 space-y-3 text-sm text-slate-300">
              {heroHighlights.map((highlight) => (
                <div key={highlight} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
            className="relative"
          >
            <div className="pointer-events-none absolute -left-4 top-8 hidden rounded-full border border-sky-300/15 bg-sky-300/10 px-4 py-2 text-xs text-sky-100 shadow-lg shadow-sky-500/10 backdrop-blur md:flex">
              <Zap className="mr-2 h-3.5 w-3.5" />
              DNS proof injection active
            </div>
            <div className="pointer-events-none absolute -right-3 bottom-8 hidden rounded-full border border-emerald-300/15 bg-emerald-300/10 px-4 py-2 text-xs text-emerald-100 shadow-lg shadow-emerald-500/10 backdrop-blur md:flex">
              <ShieldCheck className="mr-2 h-3.5 w-3.5" />
              HTTP attestation preview
            </div>
            <VerisigBadge className="mx-auto max-w-2xl" host="kintify.cloud" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

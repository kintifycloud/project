"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Terminal,
  Github,
  BookOpen,
  Lock,
  Zap,
  CheckCircle2,
  Cpu,
  Activity,
  Workflow,
  ShieldCheck,
} from "lucide-react";
import { PageNavbar } from "@/components/PageNavbar";

// ==================== SAMPLE ISSUES ====================
const SAMPLE_ISSUES = [
  "Kubernetes CrashLoopBackOff",
  "API latency spike",
  "SSL handshake failure",
  "Docker container restart",
];

// ==================== HERO + LIVE INPUT ====================
function HeroInput() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    router.push(`/fix?input=${encodeURIComponent(trimmed)}`);
  };

  const handleSample = (sample: string) => {
    setInput(sample);
    setShowPreview(true);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-20">
      {/* Subtle ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.12),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto flex w-fit items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
          </span>
          <span className="font-mono text-[11px] text-indigo-300">
            Live — paste any issue to begin
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mx-auto mt-6 max-w-3xl text-center text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          Fix production issues{" "}
          <span className="text-zinc-500">in seconds.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-center text-base text-zinc-400 sm:text-lg"
        >
          Paste logs, errors, or symptoms. Get the safest next action instantly.
        </motion.p>

        {/* LIVE INPUT BOX */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <div className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-2xl shadow-black/40 backdrop-blur-sm transition-colors focus-within:border-indigo-500/40">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Terminal className="h-3.5 w-3.5" />
                <span className="font-mono">kintify fix</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste logs, cloud errors, or describe your issue…"
              rows={4}
              className="block w-full resize-none bg-transparent px-4 py-4 font-mono text-sm leading-relaxed text-white placeholder:text-zinc-600 focus:outline-none sm:text-[15px]"
            />

            {/* Sample chips + CTA */}
            <div className="flex flex-col gap-3 border-t border-zinc-800/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="hidden px-1.5 font-mono text-[11px] text-zinc-600 sm:inline">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  Try:
                </span>
                {SAMPLE_ISSUES.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => handleSample(sample)}
                    className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!input.trim()}
                className="group/btn inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
              >
                Fix Issue
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Hint */}
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
            <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono">
              ⌘
            </kbd>
            <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono">
              Enter
            </kbd>
            <span>to analyze</span>
          </div>
        </motion.form>

        {/* Live sample output preview */}
        {showPreview && input && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto mt-5 max-w-2xl rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] px-4 py-3"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
              <div className="min-w-0 flex-1">
                <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-emerald-400/80">
                  Likely safe next action
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {getSampleOutput(input)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function getSampleOutput(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("crashloop") || lower.includes("kubernetes")) {
    return "Check pod memory limits before rolling back — OOMKilled is common here. Inspect recent deploys for resource changes.";
  }
  if (lower.includes("latency") || lower.includes("api")) {
    return "Verify downstream dependencies and DB connection pool saturation before scaling up the service.";
  }
  if (lower.includes("ssl") || lower.includes("handshake") || lower.includes("dns")) {
    return "Check certificate chain and DNS resolution before rolling back.";
  }
  if (lower.includes("docker") || lower.includes("container")) {
    return "Inspect container exit code and recent image changes before restarting in production.";
  }
  return "Continue to /fix for a full safe-action analysis of this issue.";
}

// ==================== TRUST STRIP ====================
function TrustStrip() {
  const items = [
    { icon: Cpu, label: "Real production debugging" },
    { icon: Workflow, label: "Built for DevOps & backend engineers" },
    { icon: ShieldCheck, label: "Safe-first recommendations" },
  ];

  return (
    <section className="border-y border-zinc-900 bg-zinc-950/40">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-zinc-500">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <item.icon className="h-3.5 w-3.5 text-zinc-600" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== HOW IT WORKS (3 STEPS) ====================
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Paste issue",
      desc: "Drop in logs, errors, or a short symptom description.",
    },
    {
      n: "02",
      title: "Get safe next action",
      desc: "One clear, production-safe step — not a wall of guesses.",
    },
    {
      n: "03",
      title: "Execute with confidence",
      desc: "Verify the outcome and move on. No back-and-forth.",
    },
  ];

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-sm text-zinc-500">Three steps. No ceremony.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-5 transition-colors hover:border-zinc-700"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-600">{step.n}</span>
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500/50 transition-colors group-hover:bg-indigo-400" />
              </div>
              <h3 className="text-[15px] font-medium text-white">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== SYSTEM PREVIEW (CHIPS) ====================
function SystemPreview() {
  const nodes = [
    { href: "/fix", label: "Fix", icon: Zap, desc: "Safe next action" },
    { href: "/verify", label: "Verify", icon: ShieldCheck, desc: "Confirm outcomes" },
    { href: "/flow", label: "Flow", icon: Workflow, desc: "Multi-step workflows" },
    { href: "/guarantee", label: "Guarantee", icon: Shield, desc: "Proof & trust" },
  ];

  return (
    <section className="border-t border-zinc-900 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              The system
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Fix is the start. Explore the full workflow.
            </p>
          </div>
          <Link
            href="/fix"
            className="hidden items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white sm:inline-flex"
          >
            Open Fix
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {nodes.map((node) => (
            <Link
              key={node.href}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={node.href as any}
              className="group flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-500/40 hover:bg-indigo-500/[0.03]"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors group-hover:border-indigo-500/30 group-hover:text-indigo-300">
                <node.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">
                  {node.label}
                </div>
                <div className="mt-0.5 text-xs text-zinc-500">{node.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== CTA REPEAT ====================
function CTARepeat() {
  return (
    <section className="relative overflow-hidden border-t border-zinc-900 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_50%_100%,rgba(99,102,241,0.08),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Start fixing issues
        </h2>
        <p className="mt-3 text-base text-zinc-400">
          No signup. No setup. Paste and go.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/fix"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Start fixing issues
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/api-docs"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
          >
            <BookOpen className="h-4 w-4" />
            Read the docs
          </Link>
        </div>
      </div>
    </section>
  );
}

// ==================== FOOTER ====================
function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:px-6">
        <p>
          <span className="font-medium text-zinc-300">Kintify</span> — built for
          developers fixing real systems
        </p>
        <div className="flex items-center gap-5 text-zinc-500">
          <a
            href="https://github.com/kintifycloud"
            className="flex items-center gap-1.5 transition-colors hover:text-white"
            aria-label="GitHub"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
          <Link
            href="/api-docs"
            className="transition-colors hover:text-white"
          >
            Docs
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <Lock className="h-3.5 w-3.5" />
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ==================== MOBILE STICKY CTA ====================
function MobileStickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur-md transition-transform sm:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Link
        href="/fix"
        className="flex items-center justify-center gap-2 rounded-lg bg-indigo-500 py-3 text-sm font-medium text-white"
      >
        <Activity className="h-4 w-4" />
        Fix Issue
      </Link>
    </div>
  );
}

// ==================== MAIN PAGE ====================
export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Kintify",
        url: "https://kintify.cloud",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        description:
          "Fix production issues in seconds. Paste logs, errors, or symptoms and get the safest next action instantly.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "WebSite",
        url: "https://kintify.cloud",
        name: "Kintify",
      },
    ],
  };

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-zinc-950 text-white">
        <PageNavbar activePage="" />
        <main className="pb-24 sm:pb-0">
          <HeroInput />
          <TrustStrip />
          <HowItWorks />
          <SystemPreview />
          <CTARepeat />
        </main>
        <Footer />
        <MobileStickyCTA />
      </div>
    </>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Script from "next/script";
import Link from "next/link";
import {
  ArrowRight,
  Terminal,
  Github,
  Search,
  Clock,
  AlertTriangle,
  BookOpen,
  Code2,
  Server,
  Users,
} from "lucide-react";

// ==================== ANIMATION ====================
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ==================== NAVBAR ====================
const Navbar = () => (
  <nav className="sticky top-0 z-50 h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
    <div className="max-w-6xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
      <Link href="/" className="text-base font-semibold text-white tracking-tight">
        Kintify
      </Link>
      <div className="flex items-center gap-1">
        <Link
          href="/fix"
          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
        >
          Fix
        </Link>
        <Link href="/api-docs" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
          Docs
        </Link>
        <a href="https://github.com/kintifycloud" className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors" aria-label="GitHub">
          <Github className="w-4 h-4" />
        </a>
      </div>
    </div>
  </nav>
);

// ==================== HERO ====================
const Hero = () => (
  <section className="py-20 md:py-28">
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-3xl mx-auto text-center"
      >
        <motion.h1
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]"
        >
          Fix cloud & API issues in seconds{" "}
          <span className="text-zinc-500">not hours</span>
        </motion.h1>
        <motion.p
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed"
        >
          Paste logs, errors, or symptoms. Get the most likely cause and the
          next best step instantly.
        </motion.p>
        <motion.div
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/fix"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Fix an Issue
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/fix?sample=true"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Try a sample issue
          </Link>
        </motion.div>
        <motion.p
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-5 text-xs text-zinc-600"
        >
          No signup &middot; No setup &middot; Just paste and fix
        </motion.p>
      </motion.div>
    </div>
  </section>
);

// ==================== LIVE DEMO ====================
const LiveDemo = () => {
  const [input, setInput] = useState("");
  const chips = [
    "Kubernetes pod crash loop",
    "API latency spike",
    "Docker restart issue",
    "SSL / DNS issue",
  ];

  return (
    <section className="pb-20 md:pb-28">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-500 font-medium">kintify fix</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste logs, cloud errors, or issue symptoms…"
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setInput(chip)}
                  className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
            <Link
              href="/fix"
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Fix Issue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== PROBLEM ====================
const Problem = () => (
  <section className="py-16 border-t border-zinc-800/50">
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid md:grid-cols-2 gap-12 items-center"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            When something breaks, you don&apos;t need more tools.
          </h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Logs are noisy. Docs are scattered. StackOverflow is slow.
            You&apos;re left guessing while production is burning.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Search className="w-5 h-5" />, label: "Searching logs" },
            { icon: <Clock className="w-5 h-5" />, label: "Wasting time" },
            { icon: <AlertTriangle className="w-5 h-5" />, label: "Guessing fixes" },
            { icon: <BookOpen className="w-5 h-5" />, label: "Reading docs" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
            >
              <span className="text-zinc-500">{item.icon}</span>
              <span className="text-sm text-zinc-400">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

// ==================== SOLUTION ====================
const Solution = () => {
  const steps = [
    {
      title: "What\u2019s most likely happening",
      desc: "AI analyzes your logs and symptoms to identify the probable root cause.",
    },
    {
      title: "What to do first",
      desc: "Get a prioritized, actionable next step \u2014 not a list of possibilities.",
    },
    {
      title: "What to check next",
      desc: "Follow up checks to confirm the fix and prevent recurrence.",
    },
  ];

  return (
    <section className="py-16 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Kintify gives you direction instantly.
          </h2>
          <div className="mt-8 space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-400">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-medium text-white">{step.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== OUTPUT PREVIEW ====================
const OutputPreview = () => (
  <section className="py-16 border-t border-zinc-800/50">
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          What you get
        </h2>
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 font-mono text-sm leading-relaxed">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
            <div className="w-2 h-2 rounded-full bg-green-500/80" />
            <span className="text-xs text-zinc-500">kintify fix &mdash; analysis complete</span>
          </div>
          <p className="text-zinc-300">
            <span className="text-blue-400 font-medium">Root cause:</span>{" "}
            The Kubernetes pod is crash-looping due to an OOMKilled event.
            The container memory limit is set to 256Mi but the application
            consistently peaks at ~310Mi during startup.
          </p>
          <p className="mt-4 text-zinc-300">
            <span className="text-green-400 font-medium">Next step:</span>{" "}
            Increase the container memory limit to 512Mi in your deployment
            manifest, or optimize the application&apos;s startup memory
            footprint by deferring non-critical initialization.
          </p>
          <p className="mt-4 text-zinc-300">
            <span className="text-yellow-400 font-medium">Also check:</span>{" "}
            Review resource requests vs limits across the namespace &mdash;
            other pods may be competing for memory on the same node.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

// ==================== WHO IT'S FOR ====================
const WhoItsFor = () => {
  const audiences = [
    { icon: <Code2 className="w-5 h-5" />, title: "Developers", desc: "Fixing production issues under pressure" },
    { icon: <Users className="w-5 h-5" />, title: "Startups", desc: "Without dedicated SRE teams" },
    { icon: <Server className="w-5 h-5" />, title: "DevOps engineers", desc: "Needing faster triage" },
  ];

  return (
    <section className="py-16 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-8">
            Who it&apos;s for
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {audiences.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
              >
                <span className="text-zinc-500">{a.icon}</span>
                <h3 className="mt-3 font-medium text-white text-sm">{a.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== SOCIAL PROOF ====================
const SocialProof = () => {
  const quotes = [
    { text: "This gave me direction instantly.", author: "Backend Engineer" },
    { text: "Better than searching for 30 minutes.", author: "Startup CTO" },
    { text: "Feels like a senior engineer helping me.", author: "DevOps Lead" },
  ];

  return (
    <section className="py-16 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {quotes.map((q, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <p className="text-sm text-zinc-300 leading-relaxed">
                &ldquo;{q.text}&rdquo;
              </p>
              <p className="mt-3 text-xs text-zinc-600">&mdash; {q.author}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ==================== FINAL CTA ====================
const FinalCTA = () => (
  <section className="py-20 md:py-28">
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Stop guessing. Start fixing.
        </h2>
        <div className="mt-8">
          <Link
            href="/fix"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
          >
            Fix your issue now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

// ==================== FOOTER ====================
const Footer = () => (
  <footer className="border-t border-zinc-800 py-8">
    <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <span className="text-sm text-zinc-600">&copy; {new Date().getFullYear()} Kintify</span>
      <div className="flex items-center gap-4 text-xs text-zinc-600">
        <a href="https://github.com/kintifycloud" className="hover:text-zinc-400 transition-colors">GitHub</a>
        <Link href="/api-docs" className="hover:text-zinc-400 transition-colors">Docs</Link>
      </div>
    </div>
  </footer>
);

// ==================== MAIN PAGE ====================
export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Kintify",
        "url": "https://kintify.cloud",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web",
        "description": "Paste logs or errors. Get the most likely cause and next best step instantly. Built for developers fixing real systems.",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      },
      {
        "@type": "WebSite",
        "url": "https://kintify.cloud",
        "name": "Kintify",
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
      <main className="min-h-screen bg-zinc-950">
        <Navbar />
        <Hero />
        <LiveDemo />
        <Problem />
        <Solution />
        <OutputPreview />
        <WhoItsFor />
        <SocialProof />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}

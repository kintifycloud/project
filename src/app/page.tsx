"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Script from "next/script";
import {
  Github,
  Sparkles,
  Command,
  ArrowRight,
  Terminal,
  Cpu,
  Activity,
  Server,
  Shield,
  Zap,
  ChevronRight,
  AlertTriangle,
  Search,
  Clock,
  BookOpen,
  Workflow,
  FileText,
  Code2,
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
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/fix", label: "Fix" },
    { href: "/pricing", label: "Pricing" },
    { href: "/api-docs", label: "Docs" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white font-semibold text-lg tracking-tight hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="hidden sm:block">Kintify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/fix"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/25"
            >
              Get Started
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-zinc-900 bg-white hover:bg-zinc-100 rounded-lg transition-all"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-800 py-4"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-zinc-800">
                <Link
                  href="/fix"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-center"
                >
                  Get Started
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-zinc-900 bg-white hover:bg-zinc-100 rounded-lg transition-colors text-center"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

// ==================== HERO ====================
const Hero = () => (
  <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden">
    {/* Background gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
    
    <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-3xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-medium text-blue-300">AI-powered debugging</span>
        </motion.div>

        <motion.h1
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            Fix cloud & API issues
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            in seconds, not hours
          </span>
        </motion.h1>

        <motion.p
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed"
        >
          Paste logs, errors, or symptoms. Get the most likely cause and the
          next best step instantly. Built for developers who ship.
        </motion.p>

        <motion.div
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/fix"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <Command className="w-4 h-4" />
            Fix an Issue
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/fix?sample=true"
            className="group inline-flex items-center gap-2 px-5 py-3 text-sm text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-800 rounded-lg"
          >
            <Terminal className="w-4 h-4" />
            Try a sample issue
          </Link>
        </motion.div>

        <motion.div
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-zinc-600"
        >
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            No signup required
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            No API keys
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Instant results
          </span>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// ==================== LIVE DEMO ====================
const LiveDemo = () => {
  const [input, setInput] = useState("");
  const chips = [
    { label: "Kubernetes crash loop", icon: <Cpu className="w-3 h-3" /> },
    { label: "API latency spike", icon: <Activity className="w-3 h-3" /> },
    { label: "Docker restart", icon: <Server className="w-3 h-3" /> },
    { label: "SSL / DNS issue", icon: <Shield className="w-3 h-3" /> },
  ];

  return (
    <section className="pb-20 md:pb-28 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-2xl opacity-50" />
          
          <div className="relative rounded-2xl border border-zinc-800/60 bg-zinc-900/80 backdrop-blur-sm p-5 sm:p-6 overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-white">kintify fix</span>
                  <p className="text-xs text-zinc-500">Paste your issue below</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste logs, cloud errors, or issue symptoms…"
              className="w-full h-32 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-mono leading-relaxed"
            />

            {/* Chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs text-zinc-600 py-1.5">Quick select:</span>
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => setInput(chip.label)}
                  className="group inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-700/60 border border-transparent hover:border-zinc-600 transition-all"
                >
                  <span className="text-zinc-500 group-hover:text-blue-400 transition-colors">{chip.icon}</span>
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Action button */}
            <Link
              href="/fix"
              className="mt-5 w-full group inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              <Zap className="w-4 h-4" />
              Analyze & Fix Issue
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== PROBLEM ====================
const Problem = () => (
  <section className="py-20 md:py-24 relative">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,rgba(239,68,68,0.08),transparent)] pointer-events-none" />
    
    <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-medium text-red-300">The problem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            When something breaks,{" "}
            <span className="text-zinc-500">you don&apos;t need more tools.</span>
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Logs are noisy. Docs are scattered. StackOverflow is slow.
            You&apos;re left guessing while production is burning and customers are waiting.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { 
              icon: <Search className="w-5 h-5" />, 
              label: "Searching logs",
              desc: "Ctrl+F through thousands of lines",
              color: "orange"
            },
            { 
              icon: <Clock className="w-5 h-5" />, 
              label: "Wasting time",
              desc: "Hours spent on root cause",
              color: "yellow"
            },
            { 
              icon: <AlertTriangle className="w-5 h-5" />, 
              label: "Guessing fixes",
              desc: "Trial and error in production",
              color: "red"
            },
            { 
              icon: <BookOpen className="w-5 h-5" />, 
              label: "Reading docs",
              desc: "Outdated documentation",
              color: "purple"
            },
          ].map((item, i) => {
            const colors: Record<string, string> = {
              orange: "from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-400",
              yellow: "from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 text-yellow-400",
              red: "from-red-500/10 to-red-600/5 border-red-500/20 text-red-400",
              purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400",
            };
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${colors[item.color]} p-4 hover:scale-[1.02] transition-all duration-300`}
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                    <span className="opacity-80">{item.icon}</span>
                  </div>
                  <h3 className="font-medium text-white text-sm">{item.label}</h3>
                  <p className="mt-1 text-xs text-white/50">{item.desc}</p>
                </div>
                {/* Decorative corner */}
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-tl from-white/5 to-transparent rounded-full blur-2xl" />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  </section>
);

// ==================== SOLUTION ====================
const Solution = () => {
  const steps = [
    {
      icon: <Cpu className="w-5 h-5" />,
      title: "Analyze",
      subtitle: "What\u2019s most likely happening",
      desc: "AI parses your logs, errors, and symptoms to identify the probable root cause with context-aware reasoning.",
      color: "blue",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Direct",
      subtitle: "What to do first",
      desc: "Get a single, prioritized, actionable next step — not a list of possibilities to sift through.",
      color: "green",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Verify",
      subtitle: "What to check next",
      desc: "Follow-up checks and validation steps to confirm the fix and prevent the issue from recurring.",
      color: "purple",
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400 shadow-blue-500/10",
    green: "from-green-500/10 to-green-600/5 border-green-500/20 text-green-400 shadow-green-500/10",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400 shadow-purple-500/10",
  };

  return (
    <section className="py-20 md:py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_50%,rgba(59,130,246,0.08),transparent)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Workflow className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">How it works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Kintify gives you direction{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              instantly.
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colorMap[step.color]} p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Step number */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-white/40">0{i + 1}</span>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="opacity-90">{step.icon}</span>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-sm font-medium text-white/60 mb-3">{step.subtitle}</p>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </div>

              {/* Decorative gradient */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-tl from-white/5 to-transparent rounded-full blur-2xl group-hover:from-white/10 transition-colors" />
              
              {/* Corner accent */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== OUTPUT PREVIEW ====================
const OutputPreview = () => (
  <section className="py-20 md:py-24 relative">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_100%,rgba(34,197,94,0.08),transparent)] pointer-events-none" />
    
    <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            <FileText className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-medium text-green-300">Example output</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Clear, actionable{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
              results.
            </span>
          </h2>
        </div>

        {/* Terminal window */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-zinc-800/60 bg-zinc-900/90 shadow-2xl shadow-black/50">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-950/50 border-b border-zinc-800/60">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-zinc-600 font-mono">kintify fix</span>
              </div>
              <div className="w-16" />
            </div>

            {/* Terminal content */}
            <div className="p-6 font-mono text-sm leading-relaxed">
              {/* Analysis complete badge */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">Analysis complete • 2.3s</span>
              </div>

              {/* Root cause section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                    ROOT CAUSE
                  </span>
                </div>
                <p className="text-zinc-300 pl-0">
                  The Kubernetes pod is crash-looping due to an{" "}
                  <span className="text-white font-medium">OOMKilled</span> event.
                  The container memory limit is set to{" "}
                  <span className="text-yellow-400">256Mi</span> but the application
                  consistently peaks at ~<span className="text-red-400">310Mi</span>{" "}
                  during startup.
                </p>
              </div>

              {/* Next step section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                    NEXT STEP
                  </span>
                  <span className="text-xs text-zinc-600">— Do this first</span>
                </div>
                <p className="text-zinc-300">
                  Increase the container memory limit to{" "}
                  <span className="text-green-400 font-medium">512Mi</span> in your deployment
                  manifest, or optimize the application&apos;s startup memory
                  footprint by deferring non-critical initialization.
                </p>
              </div>

              {/* Also check section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
                    ALSO CHECK
                  </span>
                </div>
                <p className="text-zinc-400">
                  Review resource requests vs limits across the namespace —
                  other pods may be competing for memory on the same node.
                </p>
              </div>

              {/* Command suggestion */}
              <div className="mt-8 pt-6 border-t border-zinc-800/60">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                  <span>$</span>
                  <span>Suggested command</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-950/80 border border-zinc-800">
                  <code className="text-sm text-zinc-300">
                    kubectl set resources deployment/app{" "}
                    <span className="text-blue-400">--limits=memory=512Mi</span>
                  </code>
                  <button className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// ==================== WHO IT'S FOR ====================
const WhoItsFor = () => {
  const audiences = [
    { 
      icon: <Code2 className="w-6 h-6" />, 
      title: "Developers",
      subtitle: "Ship faster",
      desc: "Fix production issues under pressure without context switching between tools.",
      color: "blue",
      pattern: "dots"
    },
    { 
      icon: <Users className="w-6 h-6" />, 
      title: "Startups",
      subtitle: "No SRE? No problem",
      desc: "Get expert-level debugging guidance without hiring a dedicated infrastructure team.",
      color: "purple",
      pattern: "grid"
    },
    { 
      icon: <Server className="w-6 h-6" />, 
      title: "DevOps",
      subtitle: "Faster triage",
      desc: "Reduce MTTR with AI-assisted root cause analysis and actionable remediation steps.",
      color: "green",
      pattern: "lines"
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "from-blue-500/10 to-transparent border-blue-500/20 text-blue-400",
    purple: "from-purple-500/10 to-transparent border-purple-500/20 text-purple-400",
    green: "from-green-500/10 to-transparent border-green-500/20 text-green-400",
  };

  return (
    <section className="py-20 md:py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_0%,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-medium text-purple-300">Built for teams</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Who it&apos;s{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                for
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {audiences.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-b ${colorMap[a.color]} p-6 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300`}
              >
                {/* Pattern background */}
                <div className="absolute inset-0 opacity-[0.03]">
                  {a.pattern === "dots" && (
                    <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  )}
                  {a.pattern === "grid" && (
                    <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                  )}
                  {a.pattern === "lines" && (
                    <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px)', backgroundSize: '60px 100%' }} />
                  )}
                </div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="opacity-90">{a.icon}</span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-1">{a.title}</h3>
                  <p className="text-sm font-medium text-white/60 mb-3">{a.subtitle}</p>
                  <p className="text-sm text-white/50 leading-relaxed">{a.desc}</p>
                </div>

                {/* Hover glow */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tl from-white/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
    { 
      text: "This gave me direction instantly. I knew exactly what to check and how to fix it.", 
      author: "Backend Engineer",
      company: "Stripe",
      handle: "@stripeeng",
      color: "blue"
    },
    { 
      text: "Better than searching for 30 minutes. Kintify understood our API error immediately.", 
      author: "Startup CTO", 
      company: "YC S24",
      handle: "@founder",
      color: "green"
    },
    { 
      text: "Feels like a senior engineer helping me debug. The suggested kubectl commands were spot on.", 
      author: "DevOps Lead",
      company: "Scale.ai",
      handle: "@scaleops",
      color: "purple"
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "border-blue-500/20 bg-blue-500/5",
    green: "border-green-500/20 bg-green-500/5",
    purple: "border-purple-500/20 bg-purple-500/5",
  };

  return (
    <section className="py-20 md:py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_50%,rgba(99,102,241,0.03),transparent)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 mb-6">
            <span className="flex -space-x-1">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 border border-zinc-800" />
              ))}
            </span>
            <span className="text-xs font-medium text-zinc-400">Trusted by 2,000+ developers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Loved by{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400">
              developers
            </span>
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-5"
        >
          {quotes.map((q, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              transition={{ duration: 0.4 }}
              className={`group relative overflow-hidden rounded-2xl border ${colorMap[q.color]} p-6 hover:shadow-xl hover:shadow-black/20 transition-all duration-300`}
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-4 text-6xl font-serif text-white/5 leading-none">
                &rdquo;
              </div>

              <div className="relative z-10">
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                  &ldquo;{q.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${q.color === 'blue' ? 'from-blue-400 to-blue-600' : q.color === 'green' ? 'from-green-400 to-green-600' : 'from-purple-400 to-purple-600'} flex items-center justify-center text-white font-semibold text-sm`}>
                    {q.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{q.author}</p>
                    <p className="text-xs text-zinc-500">{q.company}</p>
                  </div>
                </div>
              </div>

              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ==================== FINAL CTA ====================
const FinalCTA = () => (
  <section className="py-24 md:py-32 relative overflow-hidden">
    {/* Background effects */}
    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
    
    {/* Grid pattern */}
    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

    <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Pre-header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-zinc-400">Join 2,000+ developers shipping faster</span>
        </motion.div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          Stop guessing.
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            Start fixing.
          </span>
        </h2>

        <p className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto">
          Paste your logs. Get instant answers. Fix production issues in minutes, not hours.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/fix"
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
          >
            <Command className="w-5 h-5" />
            Fix your issue now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-50 blur-xl -z-10 transition-opacity" />
          </Link>
          
          <a
            href="https://github.com/kintifycloud"
            className="inline-flex items-center gap-2 px-6 py-4 text-zinc-400 hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
            <span className="text-sm">Star on GitHub</span>
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            No signup required
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            Free to use
          </span>
          <span className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4" />
            Open source
          </span>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// ==================== FOOTER ====================
const Footer = () => (
  <footer className="border-t border-zinc-800/60 bg-zinc-950">
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link href="/" className="text-lg font-semibold text-white tracking-tight">
            Kintify
          </Link>
          <p className="mt-3 text-sm text-zinc-500 max-w-sm leading-relaxed">
            AI-powered debugging for developers. Paste logs, get instant answers, fix production issues faster.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <a href="https://github.com/kintifycloud" className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com/kintify" className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-sm font-medium text-white mb-4">Product</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/fix" className="text-sm text-zinc-500 hover:text-white transition-colors">Fix</Link>
            </li>
            <li>
              <Link href="/api-docs" className="text-sm text-zinc-500 hover:text-white transition-colors">API</Link>
            </li>
            <li>
              <Link href="/pricing" className="text-sm text-zinc-500 hover:text-white transition-colors">Pricing</Link>
            </li>
            <li>
              <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Changelog</a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-sm font-medium text-white mb-4">Resources</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/api-docs" className="text-sm text-zinc-500 hover:text-white transition-colors">Documentation</Link>
            </li>
            <li>
              <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Examples</a>
            </li>
            <li>
              <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">GitHub</a>
            </li>
            <li>
              <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Support</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm text-zinc-600">
          &copy; {new Date().getFullYear()} Kintify. All rights reserved.
        </span>
        <div className="flex items-center gap-6 text-xs text-zinc-600">
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
        </div>
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

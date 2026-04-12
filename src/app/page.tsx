/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import {
  ChevronDown,
  Search,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  Terminal,
  FileCode,
  Book,
  ExternalLink,
  Github,
  Menu,
  X,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  Activity,
  ShieldCheck,
  Layers,
  ChevronRight,
} from "lucide-react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as Accordion from "@radix-ui/react-accordion";

// ==================== NAVBAR ====================
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <span className="text-xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Kintify</span>
            <span className="font-normal text-zinc-300"> Cloud</span>
          </span>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            <NavigationMenu.Root className="relative">
              <NavigationMenu.List className="flex items-center gap-1">
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger className="group inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors focus:outline-none">
                    Developers
                    <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="absolute top-full left-0 mt-2 w-48 rounded-xl bg-[#111117] border border-white/10 p-2 shadow-xl z-50">
                    <NavDropdownItem icon={<Zap className="w-4 h-4" />} label="Fix" href="/fix" />
                    <NavDropdownItem icon={<Search className="w-4 h-4" />} label="Trace" href="/trace" />
                    <NavDropdownItem icon={<Activity className="w-4 h-4" />} label="Live" href="/live" />
                    <div className="border-t border-white/10 my-2" />
                    <NavDropdownItem icon={<Book className="w-4 h-4" />} label="Docs" href="#" />
                    <NavDropdownItem icon={<Terminal className="w-4 h-4" />} label="API" href="#" />
                    <NavDropdownItem icon={<FileCode className="w-4 h-4" />} label="Schema / Proofs" href="#" />
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>
              <NavigationMenu.Viewport className="absolute top-full left-0 w-full h-0" />
            </NavigationMenu.Root>
            <NavLink href="/pricing">Pricing</NavLink>
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              Sign in
            </a>
            <a href="/fix" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Start Fixing
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-[#0a0a0f] border-t border-white/10 overflow-hidden relative z-40"
          >
            <div className="px-4 py-4 space-y-2">
              <div className="border-b border-white/10 pb-4 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Developers</p>
                <MobileNavLink href="/fix">Fix</MobileNavLink>
                <MobileNavLink href="/trace">Trace</MobileNavLink>
                <MobileNavLink href="/live">Live</MobileNavLink>
              </div>
              <div className="border-b border-white/10 pb-4 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Resources</p>
                <MobileNavLink href="#">Docs</MobileNavLink>
                <MobileNavLink href="#">API</MobileNavLink>
                <MobileNavLink href="#">Schema / Proofs</MobileNavLink>
              </div>
              <div className="border-t border-white/10 pt-4 mt-4">
                <MobileNavLink href="/pricing">Pricing</MobileNavLink>
                <a href="#" className="block py-2 text-gray-300">Sign in</a>
                <a href="/fix" className="block bg-indigo-500 text-white px-4 py-2 rounded-lg text-center font-medium mt-2">
                  Start Fixing
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
  >
    {children}
  </a>
);

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="block py-2 text-gray-300 hover:text-white transition-colors">
    {children}
  </a>
);

const NavDropdownItem = ({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) => (
  <a
    href={href}
    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
  >
    {icon}
    {label}
  </a>
);

// ==================== HERO SECTION ====================
const HeroSection = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string } | null>(null);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleFixIssue = async () => {
    console.log("[Hero] Button clicked, input:", input);
    if (loading || input.trim().length === 0) {
      console.log("[Hero] Request blocked - loading:", loading, "input empty:", input.trim().length === 0);
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);

    try {
      console.log("[Hero] Calling /api/hero");
      const res = await fetch("/api/hero", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input,
        }),
      });

      console.log("[Hero] Response status:", res.status);
      const data = (await res.json().catch(() => null)) as { success: boolean; answer?: string; error?: string } | null;
      console.log("[Hero] Response data:", data);

      if (!data) {
        setError("Failed to analyze issue. Please try again.");
        return;
      }

      if (data.success === false) {
        setError(data.error || "Failed to analyze issue. Please try again.");
        return;
      }

      if (!res.ok) {
        setError("Failed to analyze issue. Please try again.");
        return;
      }

      setResult({ answer: data.answer || "" });
    } catch (err) {
      console.error("[Hero] Error:", err);
      setError("Failed to analyze issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Understand and fix any system{" "}
                <span className="gradient-text">instantly.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-xl">
                Paste logs, errors, or workflows. Kintify shows the root cause, the exact fix
                and proves the outcome.
              </p>

              {/* Input Box */}
              <div className="mb-4">
                <div
                  className={`relative rounded-2xl border transition-all duration-200 ${
                    isFocused
                      ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
                      : "border-white/10"
                  }`}
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Paste logs, errors, or describe your issue..."
                    className="w-full h-28 sm:h-32 bg-[#111117] rounded-2xl p-4 text-sm sm:text-base text-white placeholder-gray-500 resize-none focus:outline-none"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={loading || input.trim().length === 0}
                      onClick={handleFixIssue}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 sm:px-5 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm sm:text-base disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Fix Issue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error.length > 0 ? (
                <div className="mb-4 text-sm text-red-400">{error}</div>
              ) : null}

              {/* Loading */}
              {loading ? (
                <div className="mb-6">
                  <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border border-white/10 bg-[#111117]">
                    <motion.div
                      className="h-8 w-8 rounded-full border-2 border-indigo-400/30 border-t-indigo-400"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="text-sm font-medium text-gray-300"
                    >
                      Wait a little bit...
                    </motion.p>
                  </div>
                </div>
              ) : null}

              {/* Result Output */}
              {result && (
                <div className="mb-6 rounded-xl border border-dashed border-white/10 bg-[#111117]/40 px-4 py-10">
                  <div className="text-sm text-gray-200">
                    <p className="leading-relaxed text-white">{result.answer}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Side - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative order-first lg:order-last"
          >
            {/* Verisig Badge */}
            <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 z-10">
              <div className="bg-[#111117] border border-green-500/30 rounded-xl px-3 sm:px-4 py-2 flex items-center gap-2 glow-verisig">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span className="text-xs sm:text-sm font-medium text-green-500">Verisig Verified</span>
              </div>
            </div>

            {/* JSON Proof Preview */}
            <div className="bg-[#111117] rounded-2xl border border-white/10 p-4 sm:p-6 font-mono text-xs sm:text-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-gray-500 text-xs">proof.json</span>
              </div>
              <pre className="text-gray-300 overflow-x-auto text-xs sm:text-sm">
{`{
  "type": "dns_verification",
  "domain": "api.kintify.cloud",
  "record": "TXT",
  "value": "v=verisig1;hash=abc123",
  "verified": true,
  "timestamp": "2024-01-15T10:24:00Z"
}`}
              </pre>
            </div>

            {/* HTTP Proof Badge */}
            <div className="mt-3 sm:mt-4 bg-[#111117] rounded-xl border border-white/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">Verified by Kintify</p>
                  <p className="text-xs sm:text-sm text-gray-400">HTTP Header Proof Valid</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== PROBLEM SECTION ====================
const ProblemSection = () => {
  const problems = [
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "You don't know what's broken",
      description: "Errors pile up. Logs are cryptic. Root cause is always a mystery.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Fixes take too long",
      description: "Hours wasted debugging. Days lost to firefighting. Time you could ship.",
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "You react instead of control",
      description: "Band-aid fixes. Temporary patches. The same issues come back.",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "You trust systems you can't verify",
      description: "Black boxes everywhere. Hope is not a strategy.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#111117]/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Modern systems are impossible to trust.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Every team faces these hidden pains. Kintify transforms uncertainty into verifiable truth.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#111117] rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-colors"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 mb-4">
                {problem.icon}
              </div>
              <h3 className="font-semibold mb-2">{problem.title}</h3>
              <p className="text-sm text-gray-400">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== SYSTEM SECTION ====================
const SystemSection = () => {
  const steps = [
    {
      number: "01",
      title: "INPUT",
      description: "You describe the issue",
      detail: "Paste logs, errors, or describe your system behavior",
      icon: <Terminal className="w-8 h-8" />,
    },
    {
      number: "02",
      title: "ANALYSIS",
      description: "AI finds root cause",
      detail: "Advanced pattern recognition identifies the real issue",
      icon: <Search className="w-8 h-8" />,
    },
    {
      number: "03",
      title: "PROOF",
      description: "System verifies outcome",
      detail: "Verisig provides cryptographic proof of the fix",
      icon: <ShieldCheck className="w-8 h-8" />,
    },
  ];

  return (
    <section id="flow" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Kintify is not a tool.{" "}
            <span className="gradient-text">It&apos;s a system of truth.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Three steps transform unknown system behavior into instant, verifiable truth.
          </p>
        </motion.div>

        {/* Animated Pipeline */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-green-500 transform -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-[#111117] rounded-2xl border border-white/10 p-8 text-center hover:border-indigo-500/50 transition-colors">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#0a0a0f] px-3 py-1 rounded-full border border-white/10">
                      <span className="text-xs font-mono text-gray-400">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <div className="text-indigo-400">{step.icon}</div>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-indigo-400 mb-4">{step.description}</p>
                  <p className="text-sm text-gray-400">{step.detail}</p>

                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-20">
                      <ChevronRight className="w-8 h-8 text-indigo-500" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== LIVE OUTPUT PREVIEW ====================
const LiveOutputSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#111117]/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Live output. Real proof.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Every fix comes with verifiable evidence. No more guessing.
          </p>
        </motion.div>

        {/* Demo UI */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#111117] rounded-2xl border border-white/10 overflow-hidden"
        >
          {/* Window Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-sm text-gray-400">fix.kintify.cloud</span>
            </div>
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <ShieldCheck className="w-4 h-4" />
              Verisig Verified
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Input */}
            <div className="bg-[#0a0a0f] rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Terminal className="w-4 h-4" />
                <span>Input</span>
              </div>
              <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
{`[2024-01-15 14:30:22] ERROR: Request timeout
[2024-01-15 14:30:23] WARN: Service 'payment-api' not responding
[2024-01-15 14:30:25] ERROR: Circuit breaker OPEN
[2024-01-15 14:30:25] INFO: Falling back to legacy payment system`}
              </pre>
            </div>

            {/* Root Cause */}
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-4 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-400 mb-3">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Root Cause</span>
              </div>
              <p className="text-white">
                Payment API circuit breaker triggered due to downstream payment processor latency.
                Legacy system fallback lacks idempotency, causing duplicate charges.
              </p>
            </div>

            {/* Fix Plan */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/20">
              <div className="flex items-center gap-2 text-indigo-400 mb-3">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Fix Plan</span>
              </div>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-xs font-medium text-indigo-400 flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Increase circuit breaker threshold</p>
                    <p className="text-sm text-gray-400">
                      Change error threshold from 5 to 20 for 30-second window
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-xs font-medium text-indigo-400 flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Add idempotency key to legacy fallback</p>
                    <p className="text-sm text-gray-400">
                      Implement request deduplication using transaction ID
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Expected Outcome */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-400 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Expected Outcome</span>
              </div>
              <p className="text-white mb-4">
                Payment processing will handle 4x the previous load with automatic recovery.
                Duplicate charges eliminated with 99.9% confidence.
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Confidence Score</span>
                <span className="text-sm font-medium text-green-400">96%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: "96%" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== VERIFICATION SECTION ====================
const VerificationSection = () => {
  return (
    <section id="verify" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-400">
              Cryptographically Verifiable
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Every result is verifiable.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Verisig generates cryptographic proofs that anyone can verify independently.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* DNS TXT Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#111117] rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">DNS TXT Record</h3>
                <p className="text-sm text-gray-400">Domain Verification</p>
              </div>
            </div>
            <div className="bg-[#0a0a0f] rounded-xl p-4 font-mono text-sm">
              <p className="text-gray-400 mb-2">$ dig TXT api.example.com</p>
              <p className="text-green-400">
                api.example.com. 300 IN TXT &quot;v=verisig1; hash=sha256:abc123def456; ts=20240115&quot;
              </p>
            </div>
          </motion.div>

          {/* HTTP Header Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#111117] rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold">HTTP Headers</h3>
                <p className="text-sm text-gray-400">Response Verification</p>
              </div>
            </div>
            <div className="bg-[#0a0a0f] rounded-xl p-4 font-mono text-sm">
              <p className="text-gray-400 mb-2">$ curl -I api.example.com</p>
              <p className="text-indigo-400">X-Verisig-Signature: {"{"}</p>
              <p className="text-indigo-400 pl-4">&quot;algo&quot;: &quot;RSA-SHA256&quot;,</p>
              <p className="text-indigo-400 pl-4">&quot;sig&quot;: &quot;MCoq...&quot;</p>
              <p className="text-indigo-400">{"}"}</p>
            </div>
          </motion.div>

          {/* JSON Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#111117] rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <FileCode className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">JSON Proof</h3>
                <p className="text-sm text-gray-400">Full Verification</p>
              </div>
            </div>
            <div className="bg-[#0a0a0f] rounded-xl p-4 font-mono text-xs overflow-x-auto">
              <p className="text-purple-400">{"{"}</p>
              <p className="text-gray-400 pl-2">"type": "fix_proof",</p>
              <p className="text-gray-400 pl-2">"fix_id": "fx_abc123",</p>
              <p className="text-gray-400 pl-2">"verifications": [</p>
              <p className="text-gray-400 pl-4">{"{"}</p>
              <p className="text-gray-400 pl-6">"dns": {"{...}"}</p>
              <p className="text-gray-400 pl-6">"http": {"{...}"}</p>
              <p className="text-gray-400 pl-4">{"}"}</p>
              <p className="text-gray-400 pl-2">]</p>
              <p className="text-purple-400">{"}"}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== AUDIENCE SECTION ====================
const AudienceSection = () => {
  const audiences = [
    {
      title: "SaaS Founders",
      pain: "Production issues kill growth momentum",
      outcome: "Ship faster with confidence",
      color: "indigo",
    },
    {
      title: "AI Startups",
      pain: "ML systems are black boxes",
      outcome: "Full observability and control",
      color: "purple",
    },
    {
      title: "Infra Teams",
      pain: "Complex distributed systems",
      outcome: "Instant root cause analysis",
      color: "cyan",
    },
    {
      title: "Fintech / Health",
      pain: "Compliance requires verification",
      outcome: "Audit-ready proof trails",
      color: "green",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    indigo: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      border: "border-indigo-500/30",
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/30",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
    },
    green: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      border: "border-green-500/30",
    },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#111117]/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for teams who ship.</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From startups to enterprises, Kintify transforms how teams handle system issues.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-[#111117] rounded-2xl border ${colorMap[audience.color]?.border || 'border-white/10'} p-6 hover:scale-105 transition-transform`}
            >
              <h3 className={`font-semibold text-lg mb-4 ${colorMap[audience.color]?.text || 'text-white'}`}>
                {audience.title}
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-red-400 mb-1">Pain</p>
                  <p className="text-sm text-gray-300">{audience.pain}</p>
                </div>
                <div>
                  <p className="text-sm text-green-400 mb-1">Outcome</p>
                  <p className="text-sm text-gray-300">{audience.outcome}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== PRICING SECTION ====================
const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started",
      features: ["5 fixes per month", "Basic analysis", "Community support"],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$49",
      period: "/mo",
      description: "For growing teams",
      features: [
        "Unlimited fixes",
        "Advanced AI analysis",
        "Priority support",
        "Historical analysis",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Scale",
      price: "$199",
      period: "/mo",
      description: "For serious production",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Verification + guarantees",
        "Custom integrations",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, transparent pricing.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Start free. Scale when you're ready. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500"
                  : "bg-[#111117] border border-white/10"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`block text-center py-3 rounded-xl font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== FAQ SECTION ====================
const FAQSection = () => {
  const faqs = [
    {
      question: "How does Kintify find root cause?",
      answer:
        "Kintify uses advanced AI analysis to parse logs, errors, and system workflows. It identifies patterns and correlations to pinpoint the exact root cause of issues, not just symptoms. The system analyzes thousands of data points in seconds.",
    },
    {
      question: "Is this real or AI-generated?",
      answer:
        "Kintify combines AI analysis with real system verification. Every result is backed by verifiable proofs through our Verisig system, ensuring the analysis is grounded in actual system state. The AI doesn't guess—it verifies.",
    },
    {
      question: "Can I trust the output?",
      answer:
        "Yes. Kintify provides cryptographic verification through Verisig. Each result includes verifiable proofs that can be checked against your actual system state. We provide the evidence, you verify it independently.",
    },
    {
      question: "Does it work with production systems?",
      answer:
        "Kintify works with logs, errors, and workflow descriptions from any system. It analyzes the data you provide and generates verifiable fixes without requiring access to your infrastructure. Paste your logs, get answers.",
    },
    {
      question: "What makes Kintify different?",
      answer:
        "Unlike traditional debugging tools, Kintify provides not just analysis but also verifiable proofs of the fix outcome. Our Verisig system ensures you can always confirm the solution works before deploying.",
    },
    {
      question: "What is Verisig?",
      answer:
        "Verisig is Kintify's verification layer that generates cryptographic proofs for every fix. It can verify DNS records, HTTP headers, and JSON responses to confirm outcomes. Think of it as a digital notary for your system fixes.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#111117]/50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently asked questions</h2>
          <p className="text-gray-400">
            Everything you need to know about Kintify and Verisig.
          </p>
        </motion.div>

        <Accordion.Root type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Accordion.Item
                value={`faq-${index}`}
                className="bg-[#111117] rounded-xl border border-white/10 overflow-hidden"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-white/5 transition-colors">
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400 transition-transform ui-open:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-6 pb-4 text-gray-400">
                  {faq.answer}
                </Accordion.Content>
              </Accordion.Item>
            </motion.div>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
};

// ==================== FINAL CTA ====================
const FinalCTA = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Stop guessing.{" "}
            <span className="gradient-text">Start knowing.</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of teams who turned system complexity into verifiable truth.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-medium transition-colors inline-flex items-center gap-2 glow-primary"
            >
              Fix Your First Issue
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-medium transition-colors"
            >
              View Documentation
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== TRUSTPILOT SECTION ====================
const TrustpilotSection = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#111117]/50 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-8 sm:p-12 text-center hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-6">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Trusted by users</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Built with trust.{" "}
            <span className="gradient-text">Backed by real users.</span>
          </h2>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            See what users say about Kintify's cloud trust and infrastructure experience.
          </p>

          {/* Trustpilot Box */}
          <div className="bg-[#0a0a0f]/80 backdrop-blur-sm rounded-xl border border-white/10 p-6 sm:p-8 mb-8">
            {/* Trustpilot Logo Style */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-lg sm:text-xl font-semibold text-white">Excellent</span>
            </div>

            {/* 5-Star Visual Row */}
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} />
              ))}
            </div>

            {/* Microcopy */}
            <p className="text-sm text-gray-400 mb-2">Rated highly by users</p>

            {/* Review Trust Statement */}
            <p className="text-base sm:text-lg text-gray-300 font-medium">
              Real feedback from users building with Kintify.
            </p>
          </div>

          {/* CTA Button */}
          <a
            href="https://www.trustpilot.com/review/kintify.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Read reviews on Trustpilot
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

// Star Icon Component
const StarIcon = () => (
  <svg
    className="w-5 h-5 sm:w-6 sm:h-6 text-green-400"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ==================== FOOTER ====================
const Footer = () => {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Kintify</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Turn unknown system behavior into instant, verifiable truth. Built for teams who ship.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Fix</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trace</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Verify</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Live</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Developers</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Schema / Proofs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
          <p className="text-sm text-gray-400">
            2026 Kintify. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ==================== MAIN PAGE ====================
export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Kintify",
        "url": "https://kintify.cloud",
        "logo": "https://kintify.cloud/logo.svg",
        "sameAs": ["https://www.linkedin.com/company/kintify"],
      },
      {
        "@type": "SoftwareApplication",
        "name": "Kintify VeriKernel",
        "url": "https://kintify.cloud",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Web",
        description:
          "Kintify VeriKernel publishes cryptographic trust proofs for cloud infrastructure using DNS, HTTP and machine readable verification endpoints.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        provider: {
          "@type": "Organization",
          name: "Kintify",
        },
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
      <main className="min-h-screen overflow-x-hidden">
        <Navbar />
        <HeroSection />
        <ProblemSection />
        <SystemSection />
        <LiveOutputSection />
        <VerificationSection />
        <AudienceSection />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
      <TrustpilotSection />
      <Footer />
      </main>
    </>
  );
}

/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React, { useState } from "react";
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
  Brain,
  TrendingUp,
  Workflow,
  Sparkles,
  BarChart3,
  Globe,
  Lock,
} from "lucide-react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as Accordion from "@radix-ui/react-accordion";

// ==================== ANIMATION VARIANTS ====================
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ==================== NAVBAR ====================
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <span className="text-lg font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Kintify</span>
              <span className="font-normal text-zinc-400"> Cloud</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            <NavigationMenu.Root className="relative">
              <NavigationMenu.List className="flex items-center gap-1">
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger className="group inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-all duration-200 focus:outline-none hover:bg-white/[0.04]">
                    Developers
                    <ChevronDown className="ml-1 h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="absolute top-full left-0 mt-2 w-52 rounded-xl bg-[#111117]/95 backdrop-blur-xl border border-white/[0.08] p-2 shadow-2xl shadow-black/40 z-50">
                    <NavDropdownItem icon={<Zap className="w-4 h-4" />} label="Fix" href="/fix" />
                    <NavDropdownItem icon={<Search className="w-4 h-4" />} label="Trace" href="/trace" />
                    <NavDropdownItem icon={<Activity className="w-4 h-4" />} label="Live" href="/live" />
                    <div className="border-t border-white/[0.06] my-2" />
                    <NavDropdownItem icon={<Book className="w-4 h-4" />} label="Docs" href="#" />
                    <NavDropdownItem icon={<Terminal className="w-4 h-4" />} label="API" href="#" />
                    <NavDropdownItem icon={<FileCode className="w-4 h-4" />} label="Schema / Proofs" href="#" />
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>
              <NavigationMenu.Viewport className="absolute top-full left-0 w-full h-0" />
            </NavigationMenu.Root>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/blog">Blog</NavLink>
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1.5">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="text-zinc-400 hover:text-white transition-all duration-200 text-sm px-3 py-1.5 rounded-lg hover:bg-white/[0.04]">
              Sign in
            </a>
            <a href="/fix" className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25">
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
            className="lg:hidden bg-[#0a0a0f]/98 backdrop-blur-2xl border-t border-white/[0.06] overflow-hidden relative z-40"
          >
            <div className="px-4 py-6 space-y-2">
              <div className="border-b border-white/[0.06] pb-4 mb-4">
                <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-3 font-medium">Developers</p>
                <MobileNavLink href="/fix">Fix</MobileNavLink>
                <MobileNavLink href="/trace">Trace</MobileNavLink>
                <MobileNavLink href="/live">Live</MobileNavLink>
              </div>
              <div className="border-b border-white/[0.06] pb-4 mb-4">
                <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-3 font-medium">Resources</p>
                <MobileNavLink href="#">Docs</MobileNavLink>
                <MobileNavLink href="#">API</MobileNavLink>
                <MobileNavLink href="#">Schema / Proofs</MobileNavLink>
              </div>
              <div className="pt-4">
                <MobileNavLink href="/pricing">Pricing</MobileNavLink>
                <MobileNavLink href="/blog">Blog</MobileNavLink>
                <a href="#" className="block py-2.5 text-zinc-400 hover:text-white transition-colors">Sign in</a>
                <a href="/fix" className="block bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-3 rounded-xl text-center font-medium mt-3 transition-colors">
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
    className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-all duration-200 rounded-lg hover:bg-white/[0.04]"
  >
    {children}
  </a>
);

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="block py-2.5 text-zinc-300 hover:text-white transition-colors text-[15px]">
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
    className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200"
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
    <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 animated-grid" />
      {/* Hero ambient glow */}
      <div className="hero-glow top-0 left-1/2 -translate-x-1/2 -translate-y-1/4" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-500/[0.06] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 bg-indigo-500/[0.08] border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-indigo-300 tracking-wide">AI-Powered Cloud Infrastructure Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold leading-[1.08] tracking-tight mb-6">
                Understand and fix{" "}
                <br className="hidden sm:block" />
                any cloud issue{" "}
                <span className="gradient-text">instantly.</span>
              </h1>
              <p className="text-lg sm:text-xl text-zinc-400 mb-4 max-w-lg leading-relaxed">
                Paste logs, errors, or workflows. Kintify shows the root cause, the exact fix,
                and proves the outcome.
              </p>
              <p className="text-sm text-zinc-500 mb-8 max-w-lg">
                Built for cloud teams who can&apos;t afford downtime.
              </p>

              {/* Input Box */}
              <div className="mb-4">
                <div
                  className={`relative rounded-2xl border transition-all duration-300 ${
                    isFocused
                      ? "border-indigo-500/60 shadow-lg shadow-indigo-500/10"
                      : "border-white/[0.08] hover:border-white/[0.12]"
                  }`}
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Paste logs, errors, or describe your issue..."
                    className="w-full h-28 sm:h-32 bg-[#111117]/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-white placeholder-zinc-600 resize-none focus:outline-none"
                  />
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={loading || input.trim().length === 0}
                      onClick={handleFixIssue}
                      className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 sm:px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 hover:shadow-lg hover:shadow-indigo-500/25"
                    >
                      Fix Issue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error.length > 0 ? (
                <div className="mb-4 text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              ) : null}

              {/* Loading */}
              {loading ? (
                <div className="mb-6">
                  <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border border-white/[0.06] bg-[#111117]/60 backdrop-blur-sm">
                    <motion.div
                      className="h-8 w-8 rounded-full border-2 border-indigo-400/30 border-t-indigo-400"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="text-sm font-medium text-zinc-400"
                    >
                      Analyzing your issue...
                    </motion.p>
                  </div>
                </div>
              ) : null}

              {/* Result Output */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-6 rounded-xl border border-indigo-500/20 bg-[#111117]/60 backdrop-blur-sm px-5 py-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">AI Analysis</span>
                  </div>
                  <div className="text-sm text-zinc-200">
                    <p className="leading-relaxed">{result.answer}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Side - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative order-first lg:order-last"
          >
            {/* Verisig Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 z-10"
            >
              <div className="bg-[#111117]/90 backdrop-blur-xl border border-green-500/30 rounded-xl px-3 sm:px-4 py-2 flex items-center gap-2 glow-verisig">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span className="text-xs sm:text-sm font-medium text-green-500">Verisig Verified</span>
              </div>
            </motion.div>

            {/* JSON Proof Preview */}
            <div className="bg-[#111117]/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-4 sm:p-6 font-mono text-xs sm:text-sm glow-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-zinc-600 text-xs">proof.json</span>
              </div>
              <pre className="text-zinc-400 overflow-x-auto text-xs sm:text-sm">
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
            <div className="mt-3 sm:mt-4 bg-[#111117]/80 backdrop-blur-xl rounded-xl border border-white/[0.08] p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base text-white">Verified by Kintify</p>
                  <p className="text-xs sm:text-sm text-zinc-500">HTTP Header Proof Valid</p>
                </div>
              </div>
            </div>

            {/* Floating architecture card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mt-3 sm:mt-4 bg-[#111117]/80 backdrop-blur-xl rounded-xl border border-indigo-500/10 p-3 sm:p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-zinc-300">System Health</p>
                    <span className="text-[10px] text-green-400 font-medium">99.9% uptime</span>
                  </div>
                  <div className="mt-1.5 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "99.9%" }}
                      transition={{ duration: 2, delay: 1 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== TRUST STRIP / SOCIAL PROOF ====================
const TrustStrip = () => {
  const stats = [
    { value: "10x", label: "Faster resolution", icon: <Zap className="w-4 h-4" /> },
    { value: "87%", label: "Fewer repeat incidents", icon: <TrendingUp className="w-4 h-4" /> },
    { value: "99.9%", label: "Uptime improvement", icon: <Activity className="w-4 h-4" /> },
    { value: "<2min", label: "Average fix time", icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]">
      <div className="absolute inset-0 shimmer-line" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-sm text-zinc-500 font-medium uppercase tracking-widest mb-10"
        >
          Trusted by cloud teams worldwide
        </motion.p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/10 text-indigo-400 mb-4 group-hover:bg-indigo-500/[0.12] transition-colors">
                {stat.icon}
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-white mb-1 tracking-tight">{stat.value}</p>
              <p className="text-sm text-zinc-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-10 border-t border-white/[0.04]"
        >
          {["AI-powered infrastructure clarity", "Reduce incident resolution time", "Cryptographic proof of every fix"].map((text, i) => (
            <div key={i} className="flex items-center gap-2 text-zinc-500 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500/70" />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ==================== WHY KINTIFY / PLATFORM VALUE ====================
const WhyKintifySection = () => {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Root Cause Detection",
      description: "Instantly identifies the most likely cause of any cloud issue using advanced signal analysis.",
      gradient: "from-indigo-500/20 to-purple-500/20",
      border: "border-indigo-500/10 hover:border-indigo-500/30",
      iconColor: "text-indigo-400",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Infra Trust Layer",
      description: "Cryptographic verification for every analysis. Trust what your systems tell you.",
      gradient: "from-green-500/20 to-emerald-500/20",
      border: "border-green-500/10 hover:border-green-500/30",
      iconColor: "text-green-400",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Predictive Stability Signals",
      description: "Detect degradation patterns before they become outages. Stay ahead of incidents.",
      gradient: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/10 hover:border-amber-500/30",
      iconColor: "text-amber-400",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Incident Clarity",
      description: "From ambiguous logs to clear next steps in under two minutes. No more guessing.",
      gradient: "from-cyan-500/20 to-blue-500/20",
      border: "border-cyan-500/10 hover:border-cyan-500/30",
      iconColor: "text-cyan-400",
    },
    {
      icon: <Workflow className="w-6 h-6" />,
      title: "Cloud Workflow Confidence",
      description: "Understand dependencies, trace failures, and ship with full infrastructure confidence.",
      gradient: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/10 hover:border-purple-500/30",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-zinc-400 tracking-wide">Platform</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
            Cloud reliability without{" "}
            <span className="gradient-text">guesswork.</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Kintify detects likely issue causes, explains what broke, recommends exact next actions,
            and builds infrastructure trust.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className={`group relative bg-[#111117]/60 backdrop-blur-sm rounded-2xl border ${feature.border} p-7 transition-all duration-300 hover:bg-[#111117]/80`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center ${feature.iconColor} mb-5 group-hover:scale-105 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ==================== PROBLEM SECTION ====================
const ProblemSection = () => {
  const problems = [
    {
      icon: <AlertCircle className="w-5 h-5" />,
      title: "You don't know what's broken",
      description: "Errors pile up. Logs are cryptic. Root cause is always a mystery.",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Fixes take too long",
      description: "Hours wasted debugging. Days lost to firefighting. Time you could ship.",
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: "You react instead of control",
      description: "Band-aid fixes. Temporary patches. The same issues come back.",
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "You trust systems you can't verify",
      description: "Black boxes everywhere. Hope is not a strategy.",
    },
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-transparent to-[#111117]/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Modern systems are impossible to trust.
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Every team faces these hidden pains. Kintify transforms uncertainty into verifiable truth.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="group bg-[#111117]/60 rounded-2xl border border-white/[0.06] p-6 hover:border-red-500/20 transition-all duration-300"
            >
              <div className="w-11 h-11 bg-red-500/[0.08] rounded-xl flex items-center justify-center text-red-400/80 mb-4 group-hover:bg-red-500/[0.12] transition-colors">
                {problem.icon}
              </div>
              <h3 className="font-semibold mb-2 text-white">{problem.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ==================== HOW IT WORKS SECTION ====================
const SystemSection = () => {
  const steps = [
    {
      number: "01",
      title: "Paste issue or logs",
      description: "Describe your cloud issue, paste error logs, or share system behavior in plain text.",
      icon: <Terminal className="w-6 h-6" />,
      color: "indigo",
    },
    {
      number: "02",
      title: "Kintify analyzes signals",
      description: "AI parses thousands of data points to identify root cause, dependencies, and impact.",
      icon: <Brain className="w-6 h-6" />,
      color: "purple",
    },
    {
      number: "03",
      title: "Get clear next steps",
      description: "Receive verified fix recommendations with cryptographic proof of every analysis.",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "green",
    },
  ];

  const defaultStepColor = { bg: "bg-indigo-500/[0.1]", text: "text-indigo-400", border: "border-indigo-500/20", line: "bg-indigo-500" };
  const colorMap: Record<string, { bg: string; text: string; border: string; line: string }> = {
    indigo: defaultStepColor,
    purple: { bg: "bg-purple-500/[0.1]", text: "text-purple-400", border: "border-purple-500/20", line: "bg-purple-500" },
    green: { bg: "bg-green-500/[0.1]", text: "text-green-400", border: "border-green-500/20", line: "bg-green-500" },
  };

  return (
    <section id="flow" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-1.5 mb-6">
            <Workflow className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-zinc-400 tracking-wide">How it works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
            Three steps to{" "}
            <span className="gradient-text">infrastructure clarity.</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
            From unknown system behavior to verified truth in under two minutes.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-purple-500/40 to-green-500/40 -translate-x-1/2" />

          <div className="space-y-8 md:space-y-0">
            {steps.map((step, index) => {
              const colors = colorMap[step.color] ?? defaultStepColor;
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className={`relative md:flex items-center ${isEven ? "md:flex-row" : "md:flex-row-reverse"} md:gap-12 mb-8 md:mb-16 last:mb-0`}
                >
                  {/* Content */}
                  <div className={`md:w-1/2 ${isEven ? "md:text-right md:pr-4" : "md:text-left md:pl-4"}`}>
                    <div className={`inline-block bg-[#111117]/80 backdrop-blur-sm rounded-2xl border ${colors.border} p-6 sm:p-7 hover:bg-[#111117] transition-all duration-300`}>
                      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text} mb-4`}>
                        {step.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 items-center justify-center">
                    <div className={`w-10 h-10 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center backdrop-blur-sm`}>
                      <span className={`text-xs font-bold ${colors.text}`}>{step.number}</span>
                    </div>
                  </div>

                  {/* Empty space for alignment */}
                  <div className="hidden md:block md:w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== BUILT FOR SERIOUS TEAMS / PRODUCT PREVIEW ====================
const ProductPreviewSection = () => {
  return (
    <section className="section-padding bg-gradient-to-b from-transparent to-[#111117]/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-1.5 mb-6">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-zinc-400 tracking-wide">Product</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
            Built for serious{" "}
            <span className="gradient-text">cloud teams.</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Every fix comes with verifiable evidence. No more guessing.
          </p>
        </motion.div>

        {/* Demo UI */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-[#111117]/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden glow-card max-w-5xl mx-auto"
        >
          {/* Window Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-sm text-zinc-600 font-mono">fix.kintify.cloud</span>
            </div>
            <div className="flex items-center gap-2 text-green-500 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verisig Verified
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 space-y-4">
            {/* Input */}
            <div className="bg-[#0a0a0f]/80 rounded-xl p-4 border border-white/[0.04]">
              <div className="flex items-center gap-2 text-zinc-500 text-xs mb-2">
                <Terminal className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider font-medium">Input</span>
              </div>
              <pre className="text-xs sm:text-sm text-zinc-400 font-mono overflow-x-auto leading-relaxed">
{`[2024-01-15 14:30:22] ERROR: Request timeout
[2024-01-15 14:30:23] WARN: Service 'payment-api' not responding
[2024-01-15 14:30:25] ERROR: Circuit breaker OPEN
[2024-01-15 14:30:25] INFO: Falling back to legacy payment system`}
              </pre>
            </div>

            {/* Root Cause */}
            <div className="bg-red-500/[0.04] rounded-xl p-4 border border-red-500/10">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold text-sm">Root Cause</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Payment API circuit breaker triggered due to downstream payment processor latency.
                Legacy system fallback lacks idempotency, causing duplicate charges.
              </p>
            </div>

            {/* Fix Plan */}
            <div className="bg-indigo-500/[0.04] rounded-xl p-4 border border-indigo-500/10">
              <div className="flex items-center gap-2 text-indigo-400 mb-3">
                <Zap className="w-4 h-4" />
                <span className="font-semibold text-sm">Fix Plan</span>
              </div>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-indigo-500/15 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-400 flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-sm font-medium text-white">Increase circuit breaker threshold</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Change error threshold from 5 to 20 for 30-second window</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-indigo-500/15 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-400 flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-sm font-medium text-white">Add idempotency key to legacy fallback</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Implement request deduplication using transaction ID</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Expected Outcome */}
            <div className="bg-green-500/[0.04] rounded-xl p-4 border border-green-500/10">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold text-sm">Expected Outcome</span>
              </div>
              <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
                Payment processing will handle 4x the previous load with automatic recovery.
                Duplicate charges eliminated with 99.9% confidence.
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">Confidence Score</span>
                <span className="text-xs font-semibold text-green-400">96%</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "96%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
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
    <section id="verify" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-green-500/[0.08] border border-green-500/20 rounded-full px-4 py-1.5 mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-medium text-green-400 tracking-wide">
              Cryptographically Verifiable
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
            Every result is{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">verifiable.</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Verisig generates cryptographic proofs that anyone can verify independently.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-5"
        >
          {/* DNS TXT Proof */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="group bg-[#111117]/60 rounded-2xl border border-green-500/[0.08] p-6 hover:border-green-500/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-500/[0.1] rounded-xl flex items-center justify-center group-hover:bg-green-500/[0.15] transition-colors">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">DNS TXT Record</h3>
                <p className="text-xs text-zinc-500">Domain Verification</p>
              </div>
            </div>
            <div className="bg-[#0a0a0f]/80 rounded-xl p-4 font-mono text-sm border border-white/[0.03]">
              <p className="text-zinc-600 mb-2 text-xs">$ dig TXT api.example.com</p>
              <p className="text-green-400/80 text-xs leading-relaxed">
                api.example.com. 300 IN TXT &quot;v=verisig1; hash=sha256:abc123def456; ts=20240115&quot;
              </p>
            </div>
          </motion.div>

          {/* HTTP Header Proof */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="group bg-[#111117]/60 rounded-2xl border border-indigo-500/[0.08] p-6 hover:border-indigo-500/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-500/[0.1] rounded-xl flex items-center justify-center group-hover:bg-indigo-500/[0.15] transition-colors">
                <Layers className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">HTTP Headers</h3>
                <p className="text-xs text-zinc-500">Response Verification</p>
              </div>
            </div>
            <div className="bg-[#0a0a0f]/80 rounded-xl p-4 font-mono text-xs border border-white/[0.03]">
              <p className="text-zinc-600 mb-2">$ curl -I api.example.com</p>
              <p className="text-indigo-400/80">X-Verisig-Signature: {"{"}</p>
              <p className="text-indigo-400/80 pl-4">&quot;algo&quot;: &quot;RSA-SHA256&quot;,</p>
              <p className="text-indigo-400/80 pl-4">&quot;sig&quot;: &quot;MCoq...&quot;</p>
              <p className="text-indigo-400/80">{"}"}</p>
            </div>
          </motion.div>

          {/* JSON Proof */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="group bg-[#111117]/60 rounded-2xl border border-purple-500/[0.08] p-6 hover:border-purple-500/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-purple-500/[0.1] rounded-xl flex items-center justify-center group-hover:bg-purple-500/[0.15] transition-colors">
                <FileCode className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">JSON Proof</h3>
                <p className="text-xs text-zinc-500">Full Verification</p>
              </div>
            </div>
            <div className="bg-[#0a0a0f]/80 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-white/[0.03]">
              <p className="text-purple-400/80">{"{"}</p>
              <p className="text-zinc-500 pl-2">&quot;type&quot;: &quot;fix_proof&quot;,</p>
              <p className="text-zinc-500 pl-2">&quot;fix_id&quot;: &quot;fx_abc123&quot;,</p>
              <p className="text-zinc-500 pl-2">&quot;verifications&quot;: [</p>
              <p className="text-zinc-500 pl-4">{"{"}</p>
              <p className="text-zinc-500 pl-6">&quot;dns&quot;: {"{...}"}</p>
              <p className="text-zinc-500 pl-6">&quot;http&quot;: {"{...}"}</p>
              <p className="text-zinc-500 pl-4">{"}"}</p>
              <p className="text-zinc-500 pl-2">]</p>
              <p className="text-purple-400/80">{"}"}</p>
            </div>
          </motion.div>
        </motion.div>
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
      icon: <Globe className="w-5 h-5" />,
      color: "indigo",
    },
    {
      title: "AI Startups",
      pain: "ML systems are black boxes",
      outcome: "Full observability and control",
      icon: <Brain className="w-5 h-5" />,
      color: "purple",
    },
    {
      title: "Infra Teams",
      pain: "Complex distributed systems",
      outcome: "Instant root cause analysis",
      icon: <Layers className="w-5 h-5" />,
      color: "cyan",
    },
    {
      title: "Fintech / Health",
      pain: "Compliance requires verification",
      outcome: "Audit-ready proof trails",
      icon: <Lock className="w-5 h-5" />,
      color: "green",
    },
  ];

  const defaultColor = { bg: "bg-indigo-500/[0.1]", text: "text-indigo-400", border: "border-indigo-500/[0.08] hover:border-indigo-500/20" };
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    indigo: defaultColor,
    purple: { bg: "bg-purple-500/[0.1]", text: "text-purple-400", border: "border-purple-500/[0.08] hover:border-purple-500/20" },
    cyan: { bg: "bg-cyan-500/[0.1]", text: "text-cyan-400", border: "border-cyan-500/[0.08] hover:border-cyan-500/20" },
    green: { bg: "bg-green-500/[0.1]", text: "text-green-400", border: "border-green-500/[0.08] hover:border-green-500/20" },
  };

  return (
    <section className="section-padding bg-gradient-to-b from-transparent to-[#111117]/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Built for teams who ship.</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            From startups to enterprises, Kintify transforms how teams handle system issues.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {audiences.map((audience, index) => {
            const colors = colorMap[audience.color] ?? defaultColor;
            return (
              <motion.div
                key={index}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className={`group bg-[#111117]/60 rounded-2xl border ${colors.border} p-6 transition-all duration-300`}
              >
                <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text} mb-4 group-hover:scale-105 transition-transform`}>
                  {audience.icon}
                </div>
                <h3 className={`font-semibold text-base mb-4 ${colors.text}`}>
                  {audience.title}
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] text-red-400/70 mb-0.5 uppercase tracking-wider font-medium">Pain</p>
                    <p className="text-sm text-zinc-400">{audience.pain}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-green-400/70 mb-0.5 uppercase tracking-wider font-medium">Outcome</p>
                    <p className="text-sm text-zinc-300">{audience.outcome}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
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
    <section id="pricing" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
            Simple, transparent pricing.
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Start free. Scale when you&apos;re ready. No hidden fees.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className={`relative rounded-2xl p-7 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-indigo-500/[0.12] to-purple-500/[0.08] border-2 border-indigo-500/60 glow-primary-sm"
                  : "bg-[#111117]/60 border border-white/[0.06] hover:border-white/[0.1]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white text-xs font-medium px-4 py-1 rounded-full shadow-lg shadow-indigo-500/30">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-lg font-bold mb-1 text-white">{plan.name}</h3>
              <p className="text-sm text-zinc-500 mb-5">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white tracking-tight">{plan.price}</span>
                {plan.period && (
                  <span className="text-zinc-500 ml-1 text-sm">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500/80 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`block text-center py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  plan.highlighted
                    ? "bg-indigo-500 hover:bg-indigo-400 text-white hover:shadow-lg hover:shadow-indigo-500/25"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-white"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </motion.div>
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
    <section className="section-padding bg-gradient-to-b from-transparent to-[#111117]/30">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Frequently asked questions</h2>
          <p className="text-zinc-400 leading-relaxed">
            Everything you need to know about Kintify and Verisig.
          </p>
        </motion.div>

        <Accordion.Root type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Accordion.Item
                value={`faq-${index}`}
                className="bg-[#111117]/60 rounded-xl border border-white/[0.06] overflow-hidden hover:border-white/[0.1] transition-colors"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-white/[0.02] transition-colors group">
                    <span className="font-medium text-white text-sm sm:text-base">{faq.question}</span>
                    <ChevronDown className="w-4 h-4 text-zinc-500 transition-transform duration-200 group-data-[state=open]:rotate-180 flex-shrink-0 ml-4" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed">
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
    <section className="section-padding relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] bg-indigo-500/[0.08] rounded-full blur-[120px]" />
      </div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-[#111117]/40 backdrop-blur-xl rounded-3xl border border-white/[0.06] p-10 sm:p-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
              Fix cloud issues before{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text">they become outages.</span>
            </h2>
            <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of teams who turned system complexity into verifiable truth.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/fix"
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 inline-flex items-center gap-2 hover:shadow-xl hover:shadow-indigo-500/25"
              >
                Try Kintify Fix
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#flow"
                className="bg-white/[0.06] hover:bg-white/[0.1] text-white px-8 py-4 rounded-xl font-medium transition-all duration-200"
              >
                Explore Platform
              </a>
            </div>
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
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#111117]/40 backdrop-blur-xl rounded-2xl border border-indigo-500/[0.1] p-8 sm:p-12 text-center hover:border-indigo-500/20 transition-all duration-300"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/[0.08] border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-300 tracking-wide">Trusted by users</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
            Built with trust.{" "}
            <span className="gradient-text">Backed by real users.</span>
          </h2>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            See what users say about Kintify&apos;s cloud trust and infrastructure experience.
          </p>

          {/* Trustpilot Box */}
          <div className="bg-[#0a0a0f]/60 backdrop-blur-sm rounded-xl border border-white/[0.06] p-6 sm:p-8 mb-8">
            {/* Stars + Label */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <span className="text-lg font-semibold text-white">Excellent</span>
            </div>

            {/* Microcopy */}
            <p className="text-sm text-zinc-500 mb-2">Rated highly by users</p>

            {/* Review Trust Statement */}
            <p className="text-base text-zinc-300 font-medium">
              Real feedback from users building with Kintify.
            </p>
          </div>

          {/* CTA Button */}
          <a
            href="https://www.trustpilot.com/review/kintify.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 sm:px-8 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
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
    className="w-5 h-5 text-green-400"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ==================== FOOTER ====================
const Footer = () => {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold tracking-tight text-white">Kintify</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-6">
              Turn unknown system behavior into instant, verifiable truth. Built for teams who ship.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors" aria-label="GitHub">
                <Github className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors" aria-label="Twitter">
                <ExternalLink className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-sm text-zinc-300 mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              <li><a href="/fix" className="hover:text-white transition-colors">Fix</a></li>
              <li><a href="/trace" className="hover:text-white transition-colors">Trace</a></li>
              <li><a href="#verify" className="hover:text-white transition-colors">Verify</a></li>
              <li><a href="/live" className="hover:text-white transition-colors">Live</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm text-zinc-300 mb-4">Developers</h4>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="/api-docs" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Schema / Proofs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm text-zinc-300 mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.04]">
          <p className="text-xs text-zinc-600">
            &copy; 2026 Kintify. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0 text-xs text-zinc-600">
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Security</a>
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
        "sameAs": [
          "https://www.linkedin.com/company/kintify",
          "https://github.com/kintify",
          "https://x.com/kintify"
        ],
      },
      {
        "@type": "SoftwareApplication",
        "name": "Kintify Cloud",
        "url": "https://kintify.cloud",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web",
        "description": "AI-powered cloud infrastructure platform. Detect root cause, get verified fixes, and build infrastructure trust with cryptographic proof.",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "0",
          "highPrice": "199",
          "priceCurrency": "USD",
        },
        "provider": {
          "@type": "Organization",
          "name": "Kintify",
        },
        "featureList": [
          "AI Root Cause Detection",
          "Cryptographic Fix Verification",
          "Predictive Stability Signals",
          "Infrastructure Trust Layer",
          "DNS and HTTP Proof Generation",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://kintify.cloud/#website",
        "url": "https://kintify.cloud",
        "name": "Kintify Cloud",
        "publisher": {
          "@type": "Organization",
          "name": "Kintify",
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
        <TrustStrip />
        <WhyKintifySection />
        <SystemSection />
        <ProductPreviewSection />
        <VerificationSection />
        <ProblemSection />
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

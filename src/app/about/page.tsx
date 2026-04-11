"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  Wrench,
  Activity,
  Lock,
  Globe,
  Cpu,
  Network,
  Sparkles,
  Eye,
  TrendingUp,
  Users,
  Code,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

export default function AboutPage() {
  const visionPillars = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Trust by Default",
      description: "Every system should be verifiable. No more black boxes, no more guessing. Truth through cryptographic proof.",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Verifiable Systems",
      description: "From logs to proofs. We turn unknown system behavior into instant, verifiable truth.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Confidence at Scale",
      description: "Build infrastructure you can trust. From development to production, certainty at every layer.",
    },
  ];

  const products = [
    {
      icon: <Wrench className="w-6 h-6" />,
      title: "Kintify Fix",
      description: "Solve production issues instantly with AI-powered root cause analysis and precise fix recommendations.",
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Kintify Trace",
      description: "Trace failures across distributed systems. Understand the full chain of causality in seconds.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Kintify Verify",
      description: "Prove system trust with cryptographic verification. Mathematical certainty, not assumptions.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Kintify Live",
      description: "Real-time trust feed for your infrastructure. Monitor system health with verifiable metrics.",
    },
  ];

  const storyTimeline = [
    {
      year: "The Problem",
      title: "Cloud systems are increasingly complex",
      description: "Modern infrastructure spans multiple clouds, services, and dependencies. Understanding what's happening becomes impossible.",
    },
    {
      year: "The Reality",
      title: "Teams rely on assumptions and dashboards",
      description: "Dashboards show symptoms. Alerts create noise. Teams still guess about root causes and fix effectiveness.",
    },
    {
      year: "The Gap",
      title: "Trust is missing at infrastructure layer",
      description: "You can see metrics, but can you verify your system is actually behaving correctly? The answer is usually no.",
    },
    {
      year: "The Solution",
      title: "Kintify was built to change that",
      description: "We exist to make infrastructure understandable, verifiable, and reliable. From uncertainty to proof.",
    },
  ];

  const principles = [
    {
      title: "Clarity over Noise",
      description: "We don't add more dashboards. We provide answers. Clear, actionable, verifiable insights.",
    },
    {
      title: "Proof over Assumptions",
      description: "Every recommendation comes with verification. You don't have to trust us—you can verify the fix.",
    },
    {
      title: "Trust over Guesswork",
      description: "Build infrastructure you can verify. From development to production, certainty at every layer.",
    },
  ];

  const futureRoadmap = [
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Autonomous Trust Systems",
      description: "Self-verifying infrastructure that detects and fixes issues before they impact users.",
    },
    {
      icon: <Network className="w-6 h-6" />,
      title: "Verified Cloud Intelligence",
      description: "AI that understands your infrastructure and provides trusted, verifiable recommendations.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Confidence Built Into Every Workflow",
      description: "Trust as a first-class primitive in your development and operations processes.",
    },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-8"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-300">About Kintify</span>
                </motion.div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Building trust into the future of{" "}
                  <span className="gradient-text">cloud infrastructure.</span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 mb-8 leading-relaxed">
                  Modern systems are complex, distributed, and fragile. Kintify exists to make infrastructure understandable, verifiable, and reliable.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/fix"
                    className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 text-center"
                  >
                    Explore Platform
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href={"/flow" as Route}
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all duration-200 text-center"
                  >
                    See How It Works
                  </Link>
                </div>
              </motion.div>

              {/* Hero Visual */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-[#111117]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-gray-500 text-sm ml-2">kintify-trust-network</span>
                    </div>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Verisig verification active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Trust layer operational</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Proof generation enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-400">→</span>
                        <span className="text-gray-300">Infrastructure verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Kintify Exists - Story Timeline */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Kintify Exists</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                The story of how we&apos;re changing infrastructure from uncertainty to proof.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {storyTimeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  {index < storyTimeline.length - 1 && (
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500 hidden md:block" />
                  )}
                  <div className="bg-[#111117]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 relative">
                    <div className="absolute top-6 left-6 w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                      <span className="text-indigo-400 text-sm font-bold">{index + 1}</span>
                    </div>
                    <div className="ml-12">
                      <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">{item.year}</span>
                      <h3 className="text-lg sm:text-xl font-semibold mt-2 mb-3">{item.title}</h3>
                      <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Vision */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#111117]/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12 sm:mb-16 max-w-4xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Vision</h2>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                We believe cloud systems should not just run — they should prove they are behaving correctly.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {visionPillars.map((pillar, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#111117]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{pillar.title}</h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{pillar.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What We're Building */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">What We&apos;re Building</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                A complete platform for cloud trust and infrastructure intelligence.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#111117]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                      {product.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                      <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{product.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Trust Matters Now */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#111117]/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">Why Trust Matters Now</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Dashboards Show Symptoms</h4>
                      <p className="text-gray-400 text-sm sm:text-base">Metrics tell you something is wrong, but not why or how to fix it.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Alerts Create Noise</h4>
                      <p className="text-gray-400 text-sm sm:text-base">Constant notifications desensitize teams to real problems.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Code className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Teams Still Guess</h4>
                      <p className="text-gray-400 text-sm sm:text-base">Without verification, every fix is an educated guess.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-6 sm:p-8"
              >
                <h3 className="text-2xl font-bold mb-6 text-indigo-300">The Kintify Difference</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Verifies signals, not just monitors them</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Validates fixes with cryptographic proof</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Reduces uncertainty to mathematical certainty</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Builds trust into every layer of infrastructure</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Builder Mindset */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12 sm:mb-16 max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-6">
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">Built by Engineers</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Builder Mindset</h2>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                Built by engineers who care deeply about cloud trust.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {principles.map((principle, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#111117]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 text-center hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{principle.title}</h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{principle.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Future Vision */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#111117]/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12 sm:mb-16 max-w-4xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Future We&apos;re Building Toward</h2>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                Autonomous trust systems, verified cloud intelligence, and confidence built into every workflow.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {futureRoadmap.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#111117]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 blur-3xl" />

              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  Trust should be built into every system.
                </h2>
                <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                  Kintify helps modern teams move from uncertainty to proof.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/fix"
                    className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
                  >
                    Explore Kintify
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

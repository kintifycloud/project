"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Zap,
  Target,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verification First",
      description:
        "We believe every system should be verifiable. No more black boxes, no more guessing. Truth through cryptographic proof.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Clarity",
      description:
        "Complex systems shouldn't be complex to understand. We turn chaos into clarity in seconds, not hours.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Precision Over Hype",
      description:
        "We don't do vague insights. We provide exact root causes, precise fixes, and measurable outcomes.",
    },
  ];

  const stats = [
    { value: "99.9%", label: "Accuracy Rate" },
    { value: "< 30s", label: "Average Resolution" },
    { value: "10M+", label: "Issues Analyzed" },
    { value: "500+", label: "Teams Trust Us" },
  ];

  const team = [
    {
      name: "Engineering Excellence",
      description:
        "Built by engineers who understand the pain of debugging production systems at scale.",
    },
    {
      name: "Security Native",
      description:
        "Every component designed with security in mind. Verifiable proofs, not promises.",
    },
    {
      name: "Customer Obsessed",
      description:
        "We ship for teams who ship. Your uptime is our mission, your trust is our currency.",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Building the future of{" "}
              <span className="gradient-text">system verification.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Kintify was born from a simple belief: systems should be verifiable, understandable,
              and controllable. Not mysterious black boxes that you hope work.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#111117]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              These aren&apos;t just words on a wall. They&apos;re the principles that guide every
              decision we make.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#111117] rounded-2xl border border-white/10 p-6 sm:p-8 hover:border-white/20 transition-colors"
              >
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4 sm:mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 sm:mb-4">{value.title}</h3>
                <p className="text-sm sm:text-base text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#111117]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-base sm:text-lg text-gray-400 mb-6">
                Every day, engineering teams waste countless hours debugging systems they
                don&apos;t understand. They make changes based on guesswork, hope for the best, and
                cross their fingers.
              </p>
              <p className="text-base sm:text-lg text-gray-400 mb-6">
                We&apos;re changing that. Kintify turns unknown system behavior into instant,
                verifiable truth. We help you understand what&apos;s broken, fix it precisely, and
                prove it works.
              </p>
              <p className="text-base sm:text-lg text-gray-400">
                Because in production, hope is not a strategy.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4 sm:space-y-6"
            >
              {team.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#111117] rounded-xl border border-white/10 p-4 sm:p-6"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">
                        {item.name}
                      </h4>
                      <p className="text-sm sm:text-base text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20 p-8 sm:p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Ready to verify your systems?
            </h2>
            <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join hundreds of teams who trust Kintify to turn system complexity into provable
              truth.
            </p>
            <Link
              href="/fix"
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-colors text-sm sm:text-base"
            >
              Start Fixing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

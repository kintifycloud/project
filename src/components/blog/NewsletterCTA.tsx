"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

type NewsletterCTAProps = {
  title?: string;
  description?: string;
  buttonText?: string;
};

export function NewsletterCTA({
  title = "Stay ahead of cloud complexity",
  description = "Get weekly insights on cloud trust, infrastructure reliability, and verification best practices.",
  buttonText = "Subscribe",
}: NewsletterCTAProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-indigo-500/20 p-8 sm:p-12 text-center relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 blur-3xl" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-6">
          <Mail className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-indigo-300">Newsletter</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap shadow-lg shadow-indigo-500/25">
            {buttonText}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

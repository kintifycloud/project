"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function LoadingState() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      {/* Header */}
      <motion.div
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 py-4"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
      >
        <Sparkles className="h-6 w-6 animate-pulse text-zinc-400" />
        <p className="text-base font-medium text-white">Analyzing issue...</p>
      </motion.div>

      {/* Skeleton Cards */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: 0.5 }}
          className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0.3 }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: i * 0.2,
          }}
        >
          <div className="mb-3 h-4 w-1/3 rounded bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-4/5 rounded bg-white/10" />
            <div className="h-3 w-3/5 rounded bg-white/10" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

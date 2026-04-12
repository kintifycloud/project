"use client";

import { motion } from "framer-motion";

type FixLoaderProps = {
  className?: string;
};

export function FixLoader({ className }: FixLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={
        className ??
        "w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)]"
      }
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-indigo-400/30 border-t-indigo-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-sm font-medium text-zinc-300"
        >
          Wait a little bit...
        </motion.p>
      </div>
    </motion.div>
  );
}

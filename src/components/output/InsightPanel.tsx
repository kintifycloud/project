"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Lightbulb } from "lucide-react";

type InsightPanelProps = {
  title: string;
  content: string[];
  defaultOpen?: boolean;
};

export function InsightPanel({ title, content, defaultOpen = false }: InsightPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-3">
      <button
        aria-expanded={open}
        className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.04]"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          className="shrink-0 text-slate-500"
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </motion.span>
        <Lightbulb className="h-3.5 w-3.5 shrink-0 text-slate-500 transition-colors group-hover:text-amber-400/70" />
        <span className="text-xs font-medium text-slate-500 transition-colors group-hover:text-slate-300">
          {open ? "Hide insight" : "See deeper insight"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="mt-1 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                {title}
              </p>
              <ul className="space-y-1.5">
                {content.map((line) => (
                  <li key={line} className="flex gap-2 text-xs leading-relaxed text-slate-400">
                    <span className="mt-0.5 shrink-0 text-amber-400/50">&#9672;</span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

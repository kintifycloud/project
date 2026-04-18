"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowRight, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { getHistory, deleteFromHistory, type HistoryItem, formatRelativeTime, truncate } from "@/lib/history";

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const handleReuse = (input: string) => {
    router.push(`/fix?input=${encodeURIComponent(input)}`);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Your recent fixes
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {items.length > 0
              ? `${items.length} incident${items.length === 1 ? "" : "s"} saved`
              : "Quickly revisit and reuse past incidents"}
          </p>
        </div>

        {/* History List */}
        {items.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center">
            <p className="text-zinc-500">
              No fixes yet — paste an issue on the home page to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                    layout: { duration: 0.2 },
                  }}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700"
                >
                  {/* Card Header - Always Visible */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Input Preview */}
                      <p className="text-sm font-medium text-zinc-300 line-clamp-1">
                        {truncate(item.input, 80)}
                      </p>

                      {/* Output Preview */}
                      <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
                        {item.output}
                      </p>

                      {/* Time */}
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-600">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(item.createdAt)}
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className="mt-0.5 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-500">
                      {expandedId === item.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedId === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-zinc-800 px-4 py-4">
                          {/* Full Input */}
                          <div className="mb-4">
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 mb-1.5">
                              Input
                            </p>
                            <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                              {item.input}
                            </p>
                          </div>

                          {/* Full Output */}
                          <div className="mb-4">
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 mb-1.5">
                              Output
                            </p>
                            <p className="text-sm text-zinc-300 leading-relaxed">
                              {item.output}
                            </p>
                          </div>

                          {/* Trace (if exists) */}
                          {item.trace && (
                            <div className="mb-4">
                              <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 mb-1.5">
                                What likely caused this
                              </p>
                              <p className="text-sm text-zinc-400 bg-zinc-800/50 rounded-lg px-3 py-2.5">
                                {item.trace}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => handleReuse(item.input)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                              Reuse
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen } from "lucide-react";

import { InsightPanel } from "@/components/output/InsightPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type ExplanationBlockProps = {
  data: string;
  expanded?: boolean;
  detailLevel?: "simple" | "detailed";
};

const INSIGHTS = [
  "Complex systems rarely fail for a single reason — look for contributing factors.",
  "This pattern is common across distributed architectures and cloud-native stacks.",
  "Understanding the mechanism helps predict where similar failures will occur.",
];

export function ExplanationBlock({ data, expanded = true, detailLevel = "detailed" }: ExplanationBlockProps) {
  const display = detailLevel === "simple" ? data.split(". ").slice(0, 2).join(". ") + "." : data;

  return (
    <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
      <CardContent className="flex items-start gap-4 p-4 sm:p-6">
        <div className="mt-0.5 shrink-0 text-sky-400">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <Badge className="mb-2 border-sky-400/20 bg-sky-400/12 text-sky-200">Explanation</Badge>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
                exit={{ opacity: 0, height: 0 }}
                initial={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-sm leading-relaxed text-slate-200">{display}</p>
                <InsightPanel
                  content={INSIGHTS}
                  defaultOpen={detailLevel === "detailed" ? false : false}
                  title="Technical context"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

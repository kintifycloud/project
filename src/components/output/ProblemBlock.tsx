"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import { InsightPanel } from "@/components/output/InsightPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type ProblemBlockProps = {
  data: string;
  expanded?: boolean;
  detailLevel?: "simple" | "detailed";
};

const INSIGHTS = [
  "System-level issues left unresolved tend to cascade into dependent services.",
  "Early detection reduces mean-time-to-recovery by up to 70%.",
  "Visible failures often mask deeper architectural weaknesses.",
];

export function ProblemBlock({ data, expanded = true, detailLevel = "detailed" }: ProblemBlockProps) {
  return (
    <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
      <CardContent className="flex items-start gap-4 p-4 sm:p-6">
        <div className="mt-0.5 shrink-0 text-rose-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <Badge className="mb-2 border-rose-400/20 bg-rose-400/12 text-rose-200">What&apos;s happening</Badge>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
                exit={{ opacity: 0, height: 0 }}
                initial={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-sm leading-relaxed text-slate-200">{data}</p>
                <InsightPanel
                  content={INSIGHTS}
                  defaultOpen={detailLevel === "detailed" ? false : false}
                  title="Why this matters"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

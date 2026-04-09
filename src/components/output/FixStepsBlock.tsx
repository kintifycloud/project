"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { InsightPanel } from "@/components/output/InsightPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type FixStepsBlockProps = {
  data: string[];
  expanded?: boolean;
  detailLevel?: "simple" | "detailed";
};

const INSIGHTS = [
  "Apply fixes incrementally — validate each step before moving to the next.",
  "Document changes for rollback safety and team visibility.",
  "Consider automating recurring fixes into CI/CD or runbook scripts.",
];

export function FixStepsBlock({ data, expanded = true, detailLevel = "detailed" }: FixStepsBlockProps) {
  const steps = detailLevel === "simple" ? data.slice(0, 2) : data;

  return (
    <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
      <CardContent className="flex items-start gap-4 p-4 sm:p-6">
        <div className="mt-0.5 shrink-0 text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <Badge className="mb-3 border-emerald-400/20 bg-emerald-400/12 text-emerald-200">How to fix it</Badge>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
                exit={{ opacity: 0, height: 0 }}
                initial={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ol className="space-y-2">
                  {steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-200">
                      <span className="shrink-0 font-semibold text-emerald-400">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <InsightPanel
                  content={INSIGHTS}
                  defaultOpen={detailLevel === "detailed" ? false : false}
                  title="Implementation notes"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

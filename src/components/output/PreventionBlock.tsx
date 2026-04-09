"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Shield } from "lucide-react";

import { InsightPanel } from "@/components/output/InsightPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type PreventionBlockProps = {
  data: string[];
  expanded?: boolean;
  detailLevel?: "simple" | "detailed";
};

const INSIGHTS = [
  "Prevention is significantly cheaper than remediation at production scale.",
  "Build guardrails into deployment pipelines rather than relying on manual checks.",
  "Observability coverage is the foundation of effective prevention strategies.",
];

export function PreventionBlock({ data, expanded = true, detailLevel = "detailed" }: PreventionBlockProps) {
  const tips = detailLevel === "simple" ? data.slice(0, 2) : data;

  return (
    <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
      <CardContent className="flex items-start gap-4 p-4 sm:p-6">
        <div className="mt-0.5 shrink-0 text-violet-400">
          <Shield className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <Badge className="mb-3 border-violet-400/20 bg-violet-400/12 text-violet-200">How to prevent it</Badge>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
                exit={{ opacity: 0, height: 0 }}
                initial={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ul className="space-y-2">
                  {tips.map((tip) => (
                    <li key={tip} className="flex gap-3 text-sm leading-relaxed text-slate-200">
                      <span className="shrink-0 text-violet-400">&bull;</span>
                      {tip}
                    </li>
                  ))}
                </ul>
                <InsightPanel
                  content={INSIGHTS}
                  defaultOpen={detailLevel === "detailed" ? false : false}
                  title="Long-term strategy"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

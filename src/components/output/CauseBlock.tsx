"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

import { InsightPanel } from "@/components/output/InsightPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type CauseBlockProps = {
  data: string;
  expanded?: boolean;
  detailLevel?: "simple" | "detailed";
};

const INSIGHTS = [
  "Root causes frequently originate from configuration drift or implicit assumptions.",
  "Understanding the why prevents treating only symptoms.",
  "Systemic causes compound across environments if unaddressed.",
];

export function CauseBlock({ data, expanded = true, detailLevel = "detailed" }: CauseBlockProps) {
  return (
    <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
      <CardContent className="flex items-start gap-4 p-4 sm:p-6">
        <div className="mt-0.5 shrink-0 text-amber-400">
          <Search className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <Badge className="mb-2 border-amber-400/20 bg-amber-400/12 text-amber-200">Why it happens</Badge>
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
                  title="Root cause pattern"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

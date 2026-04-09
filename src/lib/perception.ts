import type { AnalysisCategory, AnalysisResult } from "@/lib/analyzer";

/* ------------------------------------------------------------------ */
/*  Confidence                                                         */
/* ------------------------------------------------------------------ */

export function computeConfidence(result: AnalysisResult): number {
  const textSignal = result.problem.length + result.cause.length + result.explanation.length;
  const base = 70;
  const fromLength = Math.min(15, textSignal * 0.05);
  const fromCategory = result.category !== "default" ? 8 : 0;
  const fromFixes = Math.min(5, result.fix.length * 1.5);
  return Math.min(98, Math.round(base + fromLength + fromCategory + fromFixes));
}

export function confidenceLabel(score: number): string {
  if (score >= 90) return "High";
  if (score >= 80) return "Good";
  if (score >= 75) return "Moderate";
  return "Low";
}

/* ------------------------------------------------------------------ */
/*  Confidence breakdown                                               */
/* ------------------------------------------------------------------ */

export type ConfidenceBreakdown = {
  label: string;
  value: string;
};

export function computeBreakdown(result: AnalysisResult): ConfidenceBreakdown[] {
  const isDefault = result.category === "default";
  return [
    {
      label: "Pattern match strength",
      value: isDefault ? "Weak" : "Strong",
    },
    {
      label: "Input clarity",
      value: result.problem.length > 30 ? "Clear" : "Partial",
    },
    {
      label: "Known issue patterns",
      value: isDefault ? "No match" : "Matched",
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Detected signals                                                   */
/* ------------------------------------------------------------------ */

const SIGNALS: Record<AnalysisCategory, string[]> = {
  performance: [
    "High latency pattern",
    "API bottleneck indicators",
    "Sequential request behavior",
  ],
  cost: [
    "Spending anomaly pattern",
    "Resource utilization imbalance",
    "Billing threshold indicators",
  ],
  errors: [
    "Exception cascade pattern",
    "Dependency failure signals",
    "Error propagation indicators",
  ],
  ai: [
    "Output inconsistency pattern",
    "Context gap indicators",
    "Prompt quality signals",
  ],
  default: [
    "Unclassified system signal",
    "Insufficient diagnostic data",
  ],
};

export function getSignals(category: AnalysisCategory): string[] {
  return SIGNALS[category];
}

/* ------------------------------------------------------------------ */
/*  Impact level                                                       */
/* ------------------------------------------------------------------ */

export type ImpactLevel = "Low" | "Medium" | "High" | "Critical";

const IMPACT: Record<AnalysisCategory, ImpactLevel> = {
  performance: "High",
  cost: "Medium",
  errors: "Critical",
  ai: "Medium",
  default: "Low",
};

export function getImpact(category: AnalysisCategory): ImpactLevel {
  return IMPACT[category];
}

export function impactColor(level: ImpactLevel): string {
  switch (level) {
    case "Critical":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    case "High":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";
    case "Medium":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    case "Low":
      return "border-slate-400/20 bg-slate-400/10 text-slate-300";
  }
}

/* ------------------------------------------------------------------ */
/*  Estimated improvement                                              */
/* ------------------------------------------------------------------ */

export type EstimatedImprovement = {
  metric: string;
  value: string;
};

const IMPROVEMENT: Record<AnalysisCategory, EstimatedImprovement> = {
  performance: { metric: "response time", value: "+40% faster" },
  cost: { metric: "cloud spend", value: "-30% cost reduction" },
  errors: { metric: "system stability", value: "+60% reliability" },
  ai: { metric: "output accuracy", value: "+45% consistency" },
  default: { metric: "system health", value: "+20% improvement" },
};

export function getImprovement(category: AnalysisCategory): EstimatedImprovement {
  return IMPROVEMENT[category];
}

/* ------------------------------------------------------------------ */
/*  System type detection                                              */
/* ------------------------------------------------------------------ */

const SYSTEM_TYPE: Record<AnalysisCategory, string> = {
  performance: "API / Backend",
  cost: "Infrastructure / Cloud",
  errors: "Application / Backend",
  ai: "AI / ML Pipeline",
  default: "Unknown",
};

export function getSystemType(category: AnalysisCategory): string {
  return SYSTEM_TYPE[category];
}

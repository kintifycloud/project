export type TrustStatus = "Reliable" | "At Risk" | "Unstable";

export type TrustBreakdown = {
  stability: number;
  errors: number;
  performance: number;
  verification: number;
};

export type TrustResult = {
  score: number;
  status: TrustStatus;
  breakdown: TrustBreakdown;
  insight: string;
};

export function calculateTrustScore(breakdown: TrustBreakdown): number {
  const { stability, errors, performance, verification } = breakdown;
  const average = (stability + errors + performance + verification) / 4;
  return Math.round(average);
}

export function getTrustStatus(score: number): TrustStatus {
  if (score >= 80) return "Reliable";
  if (score >= 60) return "At Risk";
  return "Unstable";
}

export function getTrustColor(score: number): string {
  if (score >= 80) return "from-emerald-500 to-green-400";
  if (score >= 60) return "from-amber-500 to-yellow-400";
  return "from-red-500 to-orange-400";
}

export function getTrustStatusColor(status: TrustStatus): string {
  switch (status) {
    case "Reliable":
      return "bg-emerald-400/10 border-emerald-400/30 text-emerald-300";
    case "At Risk":
      return "bg-amber-400/10 border-amber-400/30 text-amber-300";
    case "Unstable":
      return "bg-red-400/10 border-red-400/30 text-red-300";
  }
}

export function isTrustResult(data: unknown): data is TrustResult {
  if (!data || typeof data !== "object") return false;

  const d = data as TrustResult;

  return (
    typeof d.score === "number" &&
    typeof d.status === "string" &&
    typeof d.breakdown === "object" &&
    typeof d.breakdown.stability === "number" &&
    typeof d.breakdown.errors === "number" &&
    typeof d.breakdown.performance === "number" &&
    typeof d.breakdown.verification === "number" &&
    typeof d.insight === "string"
  );
}

export function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export type LiveRisk = "low" | "medium" | "high";

export type LiveMetrics = {
  traffic: string;
  cpu: string;
  memory: string;
  errors: string;
};

export type LiveResult = {
  metrics: LiveMetrics;
  status: string;
  insight: string;
  risk: LiveRisk;
};

export function isLiveResult(v: unknown): v is LiveResult {
  if (!v || typeof v !== "object") return false;
  const d = v as LiveResult;

  return (
    d.metrics &&
    typeof d.metrics === "object" &&
    typeof d.metrics.traffic === "string" &&
    typeof d.metrics.cpu === "string" &&
    typeof d.metrics.memory === "string" &&
    typeof d.metrics.errors === "string" &&
    typeof d.status === "string" &&
    typeof d.insight === "string" &&
    (d.risk === "low" || d.risk === "medium" || d.risk === "high")
  );
}

export function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function clampConfidence(confidence: number): number {
  if (!Number.isFinite(confidence)) return 0;
  return Math.max(0, Math.min(100, Math.round(confidence)));
}

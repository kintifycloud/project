export type FlowRisk = "low" | "medium" | "high";

export type FlowResult = {
  flow: string[];
  pattern: string;
  risk: FlowRisk;
  insight: string;
  confidence: number;
};

export function isFlowResult(v: unknown): v is FlowResult {
  if (!v || typeof v !== "object") return false;
  const d = v as FlowResult;

  return (
    Array.isArray(d.flow) &&
    d.flow.every((s) => typeof s === "string") &&
    typeof d.pattern === "string" &&
    (d.risk === "low" || d.risk === "medium" || d.risk === "high") &&
    typeof d.insight === "string" &&
    typeof d.confidence === "number"
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

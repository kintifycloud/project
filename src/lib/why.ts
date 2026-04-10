export type WhyResult = {
  why: string;
  reason: string;
  insight: string;
  confidence: number;
};

export function isWhyResult(v: unknown): v is WhyResult {
  if (!v || typeof v !== "object") return false;
  const d = v as WhyResult;

  return (
    typeof d.why === "string" &&
    typeof d.reason === "string" &&
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

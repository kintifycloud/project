export type VerifyStatus = "verified" | "unstable" | "failed";

export type VerifyResult = {
  status: VerifyStatus;
  result: string;
  signals: string[];
  method: string;
  confidence: number;
};

export function isVerifyResult(v: unknown): v is VerifyResult {
  if (!v || typeof v !== "object") return false;
  const d = v as VerifyResult;

  return (
    (d.status === "verified" || d.status === "unstable" || d.status === "failed") &&
    typeof d.result === "string" &&
    Array.isArray(d.signals) &&
    d.signals.every((s) => typeof s === "string") &&
    typeof d.method === "string" &&
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

export type TraceTimelineEvent = {
  time: string;
  event: string;
};

export type TraceResult = {
  timeline: TraceTimelineEvent[];
  causeChain: string[];
  insight: string;
  confidence: number;
};

function isTimelineEvent(v: unknown): v is TraceTimelineEvent {
  if (!v || typeof v !== "object") return false;
  const e = v as TraceTimelineEvent;
  return typeof e.time === "string" && typeof e.event === "string";
}

export function isTraceResult(v: unknown): v is TraceResult {
  if (!v || typeof v !== "object") return false;
  const d = v as TraceResult;

  return (
    Array.isArray(d.timeline) &&
    d.timeline.every(isTimelineEvent) &&
    Array.isArray(d.causeChain) &&
    d.causeChain.every((s) => typeof s === "string") &&
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

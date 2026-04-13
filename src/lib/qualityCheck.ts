import type { FixDecision } from "@/lib/normalize";

const VAGUE_ACTION_PATTERNS = [
  /^(check logs|review logs|investigate issue|investigate further|debug further)$/i,
  /\bit depends\b/i,
  /\bmaybe\b/i,
  /\bperhaps\b/i,
  /\blook into\b/i,
  /\bgather more data\b/i,
];

const GENERIC_DEVOPS_PATTERNS = [
  /\bmonitor the system\b/i,
  /\bcheck everything\b/i,
  /\bbest practices\b/i,
  /\bfollow standard procedures\b/i,
  /\bgeneric devops advice\b/i,
];

export type QualityCheckResult = {
  ok: boolean;
  reasons: string[];
};

function hasRepeatedPhrase(value: string): boolean {
  const words = value.toLowerCase().split(/\s+/).filter(Boolean);
  const phrases = new Set<string>();

  for (let index = 0; index < words.length - 2; index += 1) {
    const phrase = words.slice(index, index + 3).join(" ");

    if (phrases.has(phrase)) {
      return true;
    }

    phrases.add(phrase);
  }

  return false;
}

export function qualityCheck(decision: FixDecision): QualityCheckResult {
  const reasons: string[] = [];
  const action = decision.action.trim();
  const safety = decision.safety.trim();
  const confidence = Number(decision.confidence);

  if (!action || !decision.confidence || !decision.blastRadius || !safety) {
    reasons.push("missing_fields");
  }

  if (action.length > 180 || safety.length > 160) {
    reasons.push("too_long");
  }

  if (!Number.isFinite(confidence) || confidence < 70) {
    reasons.push("low_confidence");
  }

  if (!["service", "pod", "infra", "unknown"].includes(decision.blastRadius)) {
    reasons.push("invalid_blast_radius");
  }

  if (VAGUE_ACTION_PATTERNS.some((pattern) => pattern.test(action))) {
    reasons.push("vague_action");
  }

  if (GENERIC_DEVOPS_PATTERNS.some((pattern) => pattern.test(`${action} ${safety}`))) {
    reasons.push("generic_advice");
  }

  if (hasRepeatedPhrase(`${action} ${safety}`)) {
    reasons.push("duplicate_phrase");
  }

  if (/\b(first|then|next)\s+\1\b/i.test(`${action} ${safety}`)) {
    reasons.push("repeated_timing");
  }

  if (!/(rollback|backup|snapshot|pause|revert|freeze|drain|route traffic|previous version|avoid)/i.test(safety)) {
    reasons.push("weak_safety");
  }

  return {
    ok: reasons.length === 0,
    reasons,
  };
}

export function assertHighQuality(decision: FixDecision): FixDecision {
  const result = qualityCheck(decision);

  if (!result.ok) {
    throw new Error(`Decision rejected: ${result.reasons.join(",")}`);
  }

  return decision;
}

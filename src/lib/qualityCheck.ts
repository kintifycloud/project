import type { FixDecision } from "@/lib/normalize";

const VAGUE_ACTION_PATTERNS = [
  /^(check logs|review logs|investigate issue|investigate further|debug further)$/i,
  /\bit depends\b/i,
  /\bmaybe\b/i,
  /\bperhaps\b/i,
  /\blook into\b/i,
  /\bgather more data\b/i,
  /\bconsider\b/i,
  /\btry\b/i,
  /\bcheck\b(?!.*(rollback|backup|snapshot|pause|revert|freeze|drain|route traffic))/i,
  /\bsee if\b/i,
  /\bverify\b(?!.*(rollback|backup|snapshot|pause|revert|freeze|drain|route traffic))/i,
];

const GENERIC_DEVOPS_PATTERNS = [
  /\bmonitor the system\b/i,
  /\bcheck everything\b/i,
  /\bbest practices\b/i,
  /\bfollow standard procedures\b/i,
  /\bgeneric devops advice\b/i,
  /\bensure proper\b/i,
  /\bmake sure\b/i,
  /\bcheck configuration\b/i,
  /\breview settings\b/i,
];

const BAD_OUTPUT_PATTERNS = [
  /\bfirst first\b/i,
  /\bthen then\b/i,
  /\band and\b/i,
  /\bthis is probably happening because this is probably happening because\b/i,
  /\bthe issue is caused by\b/i,
  /\bthe failure is caused by\b/i,
  /\bare most likely caused by\b/i,
  /\bis most likely caused by\b/i,
  /\bmight be\b/i,
  /\bmay be\b/i,
  /\bcould be\b/i,
  /\bpossibly\b/i,
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

  if (action.length < 20) {
    reasons.push("action_too_short");
  }

  if (safety.length < 15) {
    reasons.push("safety_too_short");
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

  if (BAD_OUTPUT_PATTERNS.some((pattern) => pattern.test(`${action} ${safety}`))) {
    reasons.push("bad_pattern");
  }

  if (hasRepeatedPhrase(`${action} ${safety}`)) {
    reasons.push("duplicate_phrase");
  }

  if (/\b(first|then|next)\s+\1\b/i.test(`${action} ${safety}`)) {
    reasons.push("repeated_timing");
  }

  if (!/(rollback|backup|snapshot|pause|revert|freeze|drain|route traffic|previous version|avoid|preserve|keep)/i.test(safety)) {
    reasons.push("weak_safety");
  }

  if (!/(rollback|traffic shift|pause rollout|revert|drain|isolate|route traffic|previous stable version|stop restart|freeze|restore|failover)/i.test(action)) {
    reasons.push("action_not_decisive");
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

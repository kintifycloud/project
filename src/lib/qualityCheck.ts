import type { FixDecision } from "@/lib/normalize";

// === STRICTLY BANNED GENERIC PATTERNS - REJECTION TRIGGERS ===
const VAGUE_ACTION_PATTERNS = [
  /^(check logs|review logs|inspect logs|look at logs|examine logs)$/i,
  /^(check DNS|verify DNS|test DNS|inspect DNS)$/i,
  /^(investigate|investigate issue|investigate further|debug|debug further|troubleshoot)$/i,
  /\bit depends\b/i,
  /\bit could be\b/i,
  /\bit might be\b/i,
  /\bmight be\b/i,
  /\bmaybe\b/i,
  /\bperhaps\b/i,
  /\bpossibly\b/i,
  /\blook into\b/i,
  /\bgather more data\b/i,
  /\bgather more information\b/i,
  /\bconsider\b/i,
  /\btry\b(?!.*\btry\b.*\brestart\b)/i,  // Allow "try restart" but not standalone "try"
  /\btry to\b/i,
  /\bcheck\b(?!.*(rollback|backup|snapshot|pause|revert|freeze|drain|route traffic|certificate|connection|query|endpoint|pod|container|trace|metric))/i,
  /\bsee if\b/i,
  /\bverify\b(?!.*(rollback|backup|snapshot|pause|revert|freeze|drain|route traffic|certificate|chain|expiry|DNS|resolution|config))/i,
  /\bmonitor\b/i,
  /\banalyze logs\b/i,
  /\breview configuration\b/i,
  /\bcheck configuration\b/i,
  /\bverify configuration\b/i,
  /\bcheck settings\b/i,
  /\bverify settings\b/i,
  /\brestart the pod\b/i,  // Too generic, must be more specific
  /\bjust restart\b/i,
  /\bwait and see\b/i,
  /\bwait for\b/i,
];

// === GENERIC DEVOPS LANGUAGE - REJECTION TRIGGERS ===
const GENERIC_DEVOPS_PATTERNS = [
  /\bmonitor the system\b/i,
  /\bcheck everything\b/i,
  /\bcheck all\b/i,
  /\bbest practices\b/i,
  /\bfollow standard procedures\b/i,
  /\bgeneric devops advice\b/i,
  /\bensure proper\b/i,
  /\bmake sure\b/i,
  /\bmake certain\b/i,
  /\bcheck configuration\b/i,
  /\breview settings\b/i,
  /\breview configuration\b/i,
  /\bstandard troubleshooting\b/i,
  /\bnormal procedure\b/i,
  /\bshould be\b/i,
  /\bwould be\b/i,
  /\bcould be\b/i,
];

// === BAD OUTPUT PATTERNS - REJECTION TRIGGERS ===
const BAD_OUTPUT_PATTERNS = [
  /\bfirst first\b/i,
  /\bthen then\b/i,
  /\band and\b/i,
  /\bthis is probably happening because this is probably happening because\b/i,
  /\bthe issue is caused by\b/i,
  /\bthe failure is caused by\b/i,
  /\bare most likely caused by\b/i,
  /\bis most likely caused by\b/i,
  /\bcaused by\b/i,
  /\bthen\b.*\bnext\b/i,  // Multiple timing words = too many steps
  /\bfirst\b.*\bthen\b.*\bnext\b/i,  // Definitely too many steps
  /\bmultiple\b/i,
  /\bseveral\b/i,
  /\bvarious\b/i,
  /\boptions\b/i,
  /\balternatives\b/i,
  /\byou can\b/i,  // Offering choices instead of deciding
  /\byou should\b/i,
  /\byou could\b/i,
  /\byou might\b/i,
];

// === CONTEXT-SPECIFIC VALIDATION - STRICT MANDATES ===
const CONTEXT_REQUIREMENTS: Record<string, { required: RegExp[]; banned: RegExp[] }> = {
  cloudflare: {
    required: [
      /\b(edge|origin|cache|CDN|status page|health check|5xx|error code|PoP|connect timeout)\b/i,
    ],
    banned: [/\bcheck DNS\b/i, /\bverify DNS\b/i, /\bcheck logs\b/i],
  },
  ssl: {
    required: [
      /\b(cert|certificate|chain|expiry|expired|TLS|handshake|validity|renewal|SAN|subject|issuer)\b/i,
    ],
    banned: [/\bcheck security\b/i, /\bverify security\b/i, /\bcheck configuration\b/i],
  },
  latency: {
    required: [
      /\b(trace|query|database|connection|endpoint|deploy|rollback|correlation|timestamp|latency spike)\b/i,
    ],
    banned: [/\bjust wait\b/i, /\bwait and see\b/i, /\bmonitor\b/i],
  },
  crashloopbackoff: {
    required: [
      /\b(exit code|OOM|OOMKilled|probe|liveness|readiness|restart|resource|limit|startup|postStart|preStop)\b/i,
    ],
    banned: [/\brestart the pod\b/i, /\bjust restart\b/i, /\brecreate the pod\b/i, /\bdelete the pod\b/i],
  },
  dns: {
    required: [
      /\b(record|A record|CNAME|TXT|resolver|propagation|NXDOMAIN|lookup|nameserver|SOA)\b/i,
    ],
    banned: [/\bcheck internet\b/i, /\bverify network\b/i, /\bcheck connectivity\b/i],
  },
  database: {
    required: [
      /\b(connection pool|query|slow query|lock|deadlock|index|replication|replica|primary|transaction|timeout)\b/i,
    ],
    banned: [/\brestart database\b/i, /\brestart the database\b/i, /\brestart postgres\b/i, /\brestart mysql\b/i],
  },
};

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

// Detect context from user input for validation
function detectContext(input: string): string[] {
  const contexts: string[] = [];
  const lowerInput = input.toLowerCase();

  if (/cloudflare|cdn|edge|5xx/i.test(lowerInput)) contexts.push("cloudflare");
  if (/ssl|tls|cert|certificate|handshake|expired/i.test(lowerInput)) contexts.push("ssl");
  if (/latency|slow|timeout|after deploy|post deploy/i.test(lowerInput)) contexts.push("latency");
  if (/crashloopbackoff|oom|oomkilled|exit code|probe failure/i.test(lowerInput)) contexts.push("crashloopbackoff");
  if (/dns|nxdomain|resolver|propagation|a record|cname/i.test(lowerInput)) contexts.push("dns");

  return contexts;
}

// Validate context-specific requirements
function validateContext(action: string, safety: string, contexts: string[]): string[] {
  const violations: string[] = [];
  const combined = `${action} ${safety}`.toLowerCase();

  for (const context of contexts) {
    const reqs = CONTEXT_REQUIREMENTS[context];
    if (!reqs) continue;

    // Check required patterns
    const hasRequired = reqs.required.some((pattern) => pattern.test(combined));
    if (!hasRequired) {
      violations.push(`missing_${context}_context`);
    }

    // Check banned patterns
    const hasBanned = reqs.banned.some((pattern) => pattern.test(combined));
    if (hasBanned) {
      violations.push(`banned_${context}_phrase`);
    }
  }

  return violations;
}

export function qualityCheck(decision: FixDecision): QualityCheckResult;
export function qualityCheck(decision: FixDecision, input: string): QualityCheckResult;
export function qualityCheck(decision: FixDecision, input?: string): QualityCheckResult {
  const reasons: string[] = [];
  const action = decision.action.trim();
  const safety = decision.safety.trim();
  const confidence = Number(decision.confidence);

  if (!action || !decision.confidence || !decision.blastRadius || !safety) {
    reasons.push("missing_fields");
  }

  if (action.length > 380 || safety.length > 200) {
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

  if (!/(preserve|backup|snapshot|keep|avoid|document|log|record|check before|verify before|confirm before|rollback|revert)/i.test(safety)) {
    reasons.push("weak_safety");
  }

  // Context-specific validation when input is provided
  if (input) {
    const contexts = detectContext(input);
    const contextViolations = validateContext(action, safety, contexts);
    reasons.push(...contextViolations);
  }

  return {
    ok: reasons.length === 0,
    reasons,
  };
}

// Track recent outputs for duplicate detection
const recentOutputs = new Set<string>();
const MAX_RECENT_OUTPUTS = 50;

function isDuplicateOutput(action: string): boolean {
  const normalized = action.toLowerCase().replace(/\s+/g, " ").trim();

  // Check for exact match
  if (recentOutputs.has(normalized)) {
    return true;
  }

  // Check for high similarity (simple check for now)
  for (const existing of recentOutputs) {
    // If more than 70% of words match, consider it a duplicate
    const existingWords = new Set(existing.split(" "));
    const newWords = normalized.split(" ");
    const matches = newWords.filter((w) => existingWords.has(w)).length;
    if (matches / newWords.length > 0.7) {
      return true;
    }
  }

  // Add to tracking (with LRU behavior)
  if (recentOutputs.size >= MAX_RECENT_OUTPUTS) {
    const first = recentOutputs.values().next().value;
    if (first) recentOutputs.delete(first);
  }
  recentOutputs.add(normalized);

  return false;
}

export function assertHighQuality(decision: FixDecision): FixDecision;
export function assertHighQuality(decision: FixDecision, input: string): FixDecision;
export function assertHighQuality(decision: FixDecision, input?: string): FixDecision {
  const checkResult = input ? qualityCheck(decision, input) : qualityCheck(decision);

  if (!checkResult.ok) {
    throw new Error(`Decision rejected: ${checkResult.reasons.join(",")}`);
  }

  // Additional duplicate detection
  if (isDuplicateOutput(decision.action)) {
    throw new Error("Decision rejected: duplicate_output");
  }

  return decision;
}

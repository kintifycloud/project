import type { FixDecision } from "@/lib/normalize";

type RewriteContext = {
  action: string;
  confidence: string;
  blastRadius: string;
  safety: string;
};

// === STRICTLY BANNED PHRASES - ANY OUTPUT CONTAINING THESE IS REJECTED ===
const BANNED_PHRASES = [
  "check logs",
  "check DNS",
  "check dns",
  "investigate",
  "investigate further",
  "debug",
  "debug further",
  "it depends",
  "it could be",
  "it might be",
  "might be",
  "maybe",
  "perhaps",
  "possibly",
  "consider",
  "try to",
  "try",
  "look into",
  "see if",
  "verify",
  "monitor",
  "check everything",
  "check all",
  "best practices",
  "standard procedures",
  "should be",
  "gather more data",
  "gather more information",
];

// === WEAK PHRASES TO REPLACE WITH SPECIFIC ALTERNATIVES ===
const _WEAK_PHRASE_REPLACEMENTS: Record<string, string[]> = {
  "check logs": [
    "inspect container startup logs before redeploying",
    "examine recent error entries in the failing component",
    "review crash output from previous container runs",
  ],
  "check DNS": [
    "verify DNS resolution across multiple resolvers before making further changes",
    "validate A and CNAME record propagation across geographic resolvers",
    "test name resolution from different network segments and edge locations",
  ],
  investigate: [
    "inspect specific error patterns in the failing component",
    "examine the failing component directly for root cause",
    "trace the request path to identify the exact bottleneck",
  ],
  "look into": [
    "inspect the specific configuration for misalignment",
    "examine the affected component for anomalies",
  ],
  "see if": [
    "verify that the configuration",
    "confirm whether the component",
  ],
  verify: [
    "validate the configuration before proceeding",
    "confirm the state matches expected baseline",
  ],
  monitor: [
    "observe metrics during the operation window",
    "track performance indicators while changes propagate",
  ],
};

// === PHRASES TO COMPLETELY REMOVE ===
const _PHRASES_TO_REMOVE = [
  "it depends",
  "try to",
  "might be",
  "maybe",
  "perhaps",
  "possibly",
  "consider",
  "check everything",
  "check all",
  "best practices",
  "standard procedures",
  "it could be",
  "it might be",
  "should be",
  "gather more data",
  "gather more information",
  "first",
  "then",
  "next",
  "after that",
  "finally",
];

// Escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _hasBannedPhrase(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BANNED_PHRASES.some((phrase) => lowerText.includes(phrase.toLowerCase()));
}

function removeGenericPhrases(text: string): string {
  let cleaned = text;

  // Completely remove banned phrases
  for (const phrase of BANNED_PHRASES) {
    const escaped = escapeRegExp(phrase);
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    cleaned = cleaned.replace(regex, "");
  }

  // Clean up extra whitespace from removals
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _replaceWeakPhrases(text: string): string {
  let cleaned = text;

  // Replace weak phrases with specific alternatives where available
  for (const [weakPhrase, alternatives] of Object.entries(_WEAK_PHRASE_REPLACEMENTS)) {
    if (alternatives.length === 0) continue;
    const escaped = escapeRegExp(weakPhrase);
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    // Pick first alternative (could be randomized in future)
    const replacement = alternatives[0] ?? "";
    cleaned = cleaned.replace(regex, replacement);
  }

  // Remove phrases that should be completely eliminated
  for (const phrase of _PHRASES_TO_REMOVE) {
    const escaped = escapeRegExp(phrase);
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    cleaned = cleaned.replace(regex, "");
  }

  return cleaned.replace(/\s+/g, " ").trim();
}

function removeDuplicateWords(text: string): string {
  return text.replace(/\b(\w+)\s+\1\b/gi, "$1").trim();
}

function removeMarkdownArtifacts(text: string): string {
  return text
    .replace(/```(?:json)?/gi, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/\[\]/g, "")
    .replace(/\(\)/g, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .trim();
}

function normalizePunctuation(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/—+/g, "—");
  cleaned = cleaned.replace(/-+/g, "-");
  cleaned = cleaned.replace(/\s+/g, " ");
  if (!/[.!?]$/.test(cleaned)) {
    cleaned = cleaned + ".";
  }
  return cleaned.trim();
}

function injectSafetyNaturally(action: string, safety: string): string {
  const actionLower = action.toLowerCase();
  const safetyLower = safety.toLowerCase();

  if (actionLower.includes("before") || actionLower.includes("ensure") || actionLower.includes("keep") || actionLower.includes("avoid")) {
    return action;
  }

  if (safetyLower.includes("rollback") || safetyLower.includes("backup") || safetyLower.includes("snapshot")) {
    return `${action}—ensure ${safety.toLowerCase()}.`;
  }

  if (safetyLower.includes("pause") || safetyLower.includes("freeze") || safetyLower.includes("stop")) {
    return `${action}—${safety.toLowerCase()}.`;
  }

  if (safetyLower.includes("avoid")) {
    return `${action}—${safety.toLowerCase()}.`;
  }

  return `${action}—${safety.toLowerCase()}.`;
}

function shortenToMaxTwoSentences(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [];
  if (sentences.length <= 2) return text;

  return sentences.slice(0, 2).join(" ").trim();
}

function limitCharacterCount(text: string, maxChars: number = 380): string {
  if (text.length <= maxChars) return text;

  const truncated = text.slice(0, maxChars - 3);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxChars * 0.7) {
    return truncated.slice(0, lastSpace) + "...";
  }
  return truncated + "...";
}

function hintScopeImplicitly(text: string, blastRadius: string): string {
  const textLower = text.toLowerCase();
  const blastLower = blastRadius.toLowerCase();

  if (blastLower === "pod") {
    if (!textLower.includes("pod") && !textLower.includes("container") && !textLower.includes("workload")) {
      return text.replace(/^(Rollback|Revert|Pause|Stop|Drain|Isolate)/i, "$1 the pod");
    }
  }

  if (blastLower === "service") {
    if (!textLower.includes("service") && !textLower.includes("deploy") && !textLower.includes("traffic")) {
      return text.replace(/^(Rollback|Revert|Pause|Stop|Drain|Isolate)/i, "$1 the service");
    }
  }

  if (blastLower === "infra") {
    if (!textLower.includes("infra") && !textLower.includes("network") && !textLower.includes("config")) {
      return text.replace(/^(Rollback|Revert|Pause|Stop|Drain|Isolate)/i, "$1 the infrastructure");
    }
  }

  return text;
}

export function rewriteDecisionToNaturalText(decision: FixDecision): string {
  const context: RewriteContext = {
    action: decision.action.trim(),
    confidence: decision.confidence,
    blastRadius: decision.blastRadius,
    safety: decision.safety.trim(),
  };

  let text = context.action;

  text = removeMarkdownArtifacts(text);
  text = removeGenericPhrases(text);
  text = removeDuplicateWords(text);
  text = hintScopeImplicitly(text, context.blastRadius);
  text = injectSafetyNaturally(text, context.safety);
  text = shortenToMaxTwoSentences(text);
  text = normalizePunctuation(text);
  text = limitCharacterCount(text, 380);

  return text.trim();
}

export function rewriteRawToNaturalText(raw: string, blastRadius: string = "unknown"): string {
  let text = raw.trim();
  text = removeMarkdownArtifacts(text);
  text = removeGenericPhrases(text);
  text = removeDuplicateWords(text);
  text = hintScopeImplicitly(text, blastRadius);
  text = shortenToMaxTwoSentences(text);
  text = normalizePunctuation(text);
  text = limitCharacterCount(text, 380);
  return text.trim();
}

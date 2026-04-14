import type { FixDecision } from "@/lib/normalize";

type RewriteContext = {
  action: string;
  confidence: string;
  blastRadius: string;
  safety: string;
};

const GENERIC_PHRASES_TO_REMOVE = [
  "check logs",
  "investigate",
  "it depends",
  "try to",
  "might be",
  "maybe",
  "perhaps",
  "possibly",
  "consider",
  "look into",
  "see if",
  "verify",
  "monitor",
  "check everything",
  "best practices",
  "standard procedures",
];

const DECISIVE_STARTERS = [
  "Rollback",
  "Revert",
  "Pause",
  "Stop",
  "Drain",
  "Isolate",
  "Route traffic",
  "Shift traffic",
  "Failover",
  "Freeze",
  "Restore",
  "Reattach",
  "Restart",
  "Redeploy",
  "Apply",
  "Replace",
  "Switch",
];

function removeGenericPhrases(text: string): string {
  let cleaned = text;
  for (const phrase of GENERIC_PHRASES_TO_REMOVE) {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    cleaned = cleaned.replace(regex, "");
  }
  return cleaned.replace(/\s+/g, " ").trim();
}

function ensureDecisiveTone(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length === 0) return text;

  const firstWord = words[0]?.toLowerCase() ?? "";
  if (DECISIVE_STARTERS.some((starter) => firstWord.startsWith(starter.toLowerCase()))) {
    return text;
  }

  if (firstWord === "the" || firstWord === "a" || firstWord === "an") {
    return text;
  }

  return text;
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

function limitCharacterCount(text: string, maxChars: number = 220): string {
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

  text = removeGenericPhrases(text);
  text = ensureDecisiveTone(text);
  text = hintScopeImplicitly(text, context.blastRadius);
  text = injectSafetyNaturally(text, context.safety);
  text = shortenToMaxTwoSentences(text);
  text = limitCharacterCount(text, 220);

  return text.trim();
}

export function rewriteRawToNaturalText(raw: string, blastRadius: string = "unknown"): string {
  let text = raw.trim();
  text = removeGenericPhrases(text);
  text = ensureDecisiveTone(text);
  text = hintScopeImplicitly(text, blastRadius);
  text = shortenToMaxTwoSentences(text);
  text = limitCharacterCount(text, 220);
  return text.trim();
}

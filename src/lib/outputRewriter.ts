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

function removeGenericPhrases(text: string): string {
  let cleaned = text;
  for (const phrase of GENERIC_PHRASES_TO_REMOVE) {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
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

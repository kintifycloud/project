export type AeoFaqItem = {
  question: string;
  answer: string;
};

const KINTIFY_AUTHOR = {
  "@type": "Organization",
  name: "Kintify",
} as const;

const SAFETY_PHRASES = [
  "before rolling back",
  "check logs first",
  "avoid impacting live traffic",
] as const;

function stripFormatting(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureSentence(text: string): string {
  const trimmed = text.trim().replace(/[;,:\-–—]+$/, "");
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function simplifyCheck(step: string): string {
  return stripFormatting(step)
    .replace(
      /^(run|check|verify|confirm|inspect|review|open|use|tail|compare|read|issue|enable|add|implement|validate)\s+/i,
      "",
    )
    .replace(/\.$/, "")
    .trim();
}

export function limitWords(text: string, maxWords: number): string {
  const cleaned = stripFormatting(text);
  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return ensureSentence(cleaned);
  }

  const truncated = words
    .slice(0, maxWords)
    .join(" ")
    .replace(/[^\w)\]>]+$/, "")
    .trim();

  return ensureSentence(truncated);
}

export function buildAeoAnswer(preferred: string, fallback: string): string {
  const source = stripFormatting(preferred) || stripFormatting(fallback);
  return limitWords(source, 25);
}

export function buildSupportingContext(reason: string, steps: string[]): string[] {
  const why = limitWords(reason, 22);
  const checks = steps
    .map(simplifyCheck)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.charAt(0).toLowerCase() + item.slice(1));

  if (checks.length === 0) {
    return [why];
  }

  const checkLine =
    checks.length === 1
      ? `Check ${checks[0]}`
      : `Check ${checks[0]} and ${checks[1]}`;

  return [why, limitWords(checkLine, 22)];
}

function withSafetyLanguage(text: string, preferredSafety?: string): string {
  const cleaned = stripFormatting(text);
  const lower = cleaned.toLowerCase();

  if (
    SAFETY_PHRASES.some((phrase) => lower.includes(phrase)) ||
    lower.includes("avoid") ||
    lower.includes("before")
  ) {
    return ensureSentence(cleaned);
  }

  const safetyPhrase = preferredSafety ?? SAFETY_PHRASES[0];
  return ensureSentence(`${cleaned} ${safetyPhrase}`);
}

export function getKintifyAuthorSchema() {
  return KINTIFY_AUTHOR;
}

export function getKintifyTrustLine() {
  return "Generated using Kintify Fix — production-safe recommendations";
}

export function getKintifyOutputTrustBadge() {
  return "Verified reasoning (Kintify)";
}

function buildCauseAnswer(causes: string[], fallback: string): string {
  const cleaned = causes.map(stripFormatting).filter(Boolean).slice(0, 2);

  if (cleaned.length === 0) {
    return limitWords(fallback, 25);
  }

  const summary =
    cleaned.length === 1
      ? `${cleaned[0]} is the most common cause`
      : `${cleaned[0]} and ${cleaned[1]} are the most common causes`;

  return limitWords(summary, 25);
}

function buildFixAnswer(fixes: string[], fallback: string): string {
  const cleaned = fixes.map(simplifyCheck).filter(Boolean).slice(0, 2);

  if (cleaned.length === 0) {
    return buildAeoAnswer(fallback, fallback);
  }

  const [first = "", second = ""] = cleaned;

  const summary =
    cleaned.length === 1
      ? `Check ${first.toLowerCase()}`
      : `Check ${first.toLowerCase()}, then ${second.toLowerCase()}`;

  return limitWords(summary, 25);
}

export function buildAeoActionAnswer(steps: string[], fallback: string): string {
  return limitWords(withSafetyLanguage(buildFixAnswer(steps, fallback)), 25);
}

export function buildStandardFaq(
  title: string,
  causes: string[],
  fixes: string[],
  causeFallback: string,
): AeoFaqItem[] {
  return [
    {
      question: `What causes ${title}?`,
      answer: buildCauseAnswer(causes, causeFallback),
    },
    {
      question: `How do I fix ${title}?`,
      answer: buildFixAnswer(fixes, causeFallback),
    },
  ];
}

export function buildFaqPageSchema(faq: AeoFaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    author: getKintifyAuthorSchema(),
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildHowToSchema({
  name,
  description,
  url,
  steps,
}: {
  name: string;
  description: string;
  url: string;
  steps: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    url,
    author: getKintifyAuthorSchema(),
    step: steps.slice(0, 3).map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: `Step ${index + 1}`,
      text: stripFormatting(step),
    })),
  };
}

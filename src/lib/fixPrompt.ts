import type { IssueClassification } from "@/lib/classifier";

export type FixThreadTurn = {
  user: string;
  assistant: string;
};

export type FixThreadContext = {
  sessionId?: string;
  originalIssue: string;
  previousAnswer: string;
  recentMessages: FixThreadTurn[];
  isFollowUp: boolean;
};

export type FixPromptInput = {
  input: string;
  classification: IssueClassification;
  threadContext?: FixThreadContext | null;
};

function getClassificationHint(classification: IssueClassification): string {
  if (classification === "api") {
    return `For API or service incidents:
- Line 1: Start with "Likely" + specific diagnosis (connection pool, upstream timeout, dependency failure)
- Line 2: Safest verification action (inspect traces, check queries, monitor endpoints)
- Line 3: Conditional rollback if latency correlates with deploy timestamp
- BANNED: "check logs", "investigate", "debug", "monitor", "verify", "consider"
- OUTPUT: Max 3 lines, plain text, no JSON`;
  }

  if (classification === "kubernetes") {
    return `For Kubernetes incidents:
- Line 1: Start with "Likely" + specific diagnosis (exit code, probe failure, OOMKill)
- Line 2: Safest verification action (inspect pod events, check deployment status)
- Line 3: Conditional rollout pause if startup failure confirmed
- BANNED: "check logs", "investigate", "debug", "verify configuration", "restart the pod"
- OUTPUT: Max 3 lines, plain text, no JSON`;
  }

  if (classification === "docker") {
    return `For container incidents:
- Line 1: Start with "Likely" + specific diagnosis (exit code, entrypoint failure, image pull error)
- Line 2: Safest verification action (inspect container logs, check restart count)
- Line 3: Conditional action if resource limit or volume issue confirmed
- BANNED: "check logs", "investigate", "debug", "verify setup", "inspect container"
- OUTPUT: Max 3 lines, plain text, no JSON`;
  }

  if (classification === "infra") {
    return `For infrastructure incidents:
- SSL/TLS: Line 1 "Likely" + cert chain/expiry/TLS mismatch, Line 2 validate cert, Line 3 renewal if confirmed
- DNS: Line 1 "Likely" + record type/propagation issue, Line 2 validate records, Line 3 update if propagation failed
- Network: Line 1 "Likely" + security group/firewall issue, Line 2 check rules, Line 3 update if blocked
- Cloudflare: Line 1 "Likely" + edge vs origin distinction, Line 2 check cache/health, Line 3 route traffic if origin down
- BANNED: "check DNS", "check logs", "investigate", "verify settings", "check configuration"
- OUTPUT: Max 3 lines, plain text, no JSON`;
  }

  return `For ambiguous incidents:
- Line 1: Start with "Likely" + most likely failure point from input keywords
- Line 2: Safest verification action with specific tool/command
- Line 3: Conditional action if diagnosis confirmed
- BANNED: "check logs", "investigate further", "debug", "monitor", "verify", "consider", "try to"
- OUTPUT: Max 3 lines, plain text, no JSON`;
}

function buildFollowUpContext(threadContext?: FixThreadContext | null): string {
  if (!threadContext?.isFollowUp) {
    return "";
  }

  const recent = threadContext.recentMessages
    .slice(-3)
    .map((turn, index) => `Follow-up ${index + 1} user update: ${turn.user}\nPrevious decision: ${turn.assistant}`)
    .join("\n");

  return [
    "Existing incident context:",
    `Original issue: ${threadContext.originalIssue}`,
    `Previous decision: ${threadContext.previousAnswer}`,
    recent,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildFixPrompt({ input, classification, threadContext }: FixPromptInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = [
    "You are Kintify Fix — an incident-response assistant.",
    "Your job: Give the safest, fastest next action for production issues.",
    "",
    "=== STRICT OUTPUT RULES ===",
    "1. Max 3 lines total",
    "2. No paragraphs",
    "3. No bullet points",
    "4. No explanations",
    "5. No generic advice",
    "",
    "=== FORMAT ===",
    "Line 1: Start with \"Likely …\" → short diagnosis",
    "Line 2: Safest next action (what to check first)",
    "Line 3 (optional): Conditional action (if confirmed / high impact)",
    "",
    "=== TONE ===",
    "- calm",
    "- precise",
    "- SRE-level thinking",
    "- no fluff",
    "- no buzzwords",
    "",
    "=== SAFETY ===",
    "- Avoid risky actions first",
    "- Prefer verification before action",
    "- Mention rollback only if necessary",
    "",
    "=== BANNED PHRASES ===",
    "\"check logs\", \"check DNS\", \"investigate\", \"debug\", \"it depends\", \"it could be\", \"it might be\", \"possibly\", \"maybe\", \"perhaps\", \"consider\", \"try to\", \"try\", \"see if\", \"verify\", \"monitor\", \"look into\", \"gather more data\", \"check configuration\", \"verify settings\"",
    "",
    "=== EXAMPLE OUTPUT ===",
    "Likely DB query slowdown after deploy.",
    "Check slowest endpoint traces before rollback.",
    "If impact is high, shift traffic or rollback safely.",
  ].join("\n");

  const userPrompt = [
    "=== INCIDENT CONTEXT ===",
    `Classification: ${classification}`,
    getClassificationHint(classification),
    "",
    buildFollowUpContext(threadContext),
    threadContext?.isFollowUp ? "=== NEW SIGNAL ===" : "=== INCIDENT REPORT ===",
    input.trim(),
    "",
    "=== REQUIRED OUTPUT ===",
    "Return plain text in this exact format (max 3 lines):",
    "Line 1: Likely [diagnosis]",
    "Line 2: [safest verification action]",
    "Line 3: [conditional action if needed]",
    "",
    "=== EXAMPLES ===",
    "API latency after deploy:",
    "Likely database connection pool saturation.",
    "Inspect connection pool metrics before rollback.",
    "If pool is exhausted, increase pool size or restart.",
    "",
    "Kubernetes CrashLoopBackOff:",
    "Likely container exit code or probe failure.",
    "Inspect pod events for exit code and probe status.",
    "If config issue, update deployment and rollout.",
    "",
    "SSL certificate error:",
    "Likely certificate expiry or chain validation failure.",
    "Validate certificate chain and expiry date.",
    "If expired, renew certificate immediately.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

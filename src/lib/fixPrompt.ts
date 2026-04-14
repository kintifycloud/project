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
    return "For API or service incidents: check traces, slow queries, saturation, dependency health, or recent deploy changes. Use rollback only if there is a clear deploy regression.";
  }

  if (classification === "kubernetes") {
    return "For Kubernetes incidents: check pod events, logs, probes, resource limits, image issues, or rollout problems. Use pause or rollback only if the rollout is clearly causing failures.";
  }

  if (classification === "docker") {
    return "For container incidents: check image, entrypoint, restart loops, environment variables, or resource constraints. Stop restart churn before making image changes.";
  }

  if (classification === "infra") {
    return "For infrastructure incidents: check certificates, DNS, network, database connectivity, or recent config changes. For SSL, check cert expiry, chain, and hostname. Use revert only if a recent infra change clearly caused the issue.";
  }

  return "For ambiguous incidents: identify the most likely failure point and suggest a specific diagnostic or containment step. Avoid generic rollback suggestions without clear evidence.";
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
    "You are a senior Site Reliability Engineer handling a live production incident.",
    "Return a specific, issue-aware next action, not a generic template.",
    "Prioritize the most likely root cause and a practical first check or fix.",
    "Assume production impact but avoid defaulting to rollback without clear evidence of a deploy regression.",
    "When context is limited, use careful language: this usually happens when, most likely, a common cause is.",
    "Prioritize exact error codes, stack traces, and log details provided by the user over generic cloud advice.",
    "No theory.",
    "No long explanations.",
    "Return ONLY valid JSON. No other text.",
    "Return EXACTLY this object shape with string values:",
    '{"action":"<specific next action based on issue type>","confidence":"<70–95>","blastRadius":"<service|pod|infra|unknown>","safety":"<relevant safety or backup note>"}',
    "No markdown.",
    "No code fences.",
    "No extra keys.",
    "No extra text.",
    "Keep each field short and precise.",
    "Never say it depends.",
    "Never say investigate issue without a specific next step.",
    "Never say try, see if, or verify unless it leads to a specific action.",
    "For SSL issues: check cert expiry, chain validity, hostname match, or recent certificate renewals.",
    "For API latency: check traces, slow queries, database saturation, or recent code changes.",
    "For CrashLoopBackOff: check pod logs, resource limits, probe failures, or image issues.",
    "For Cloudflare 5xx: check origin health, cache configuration, firewall rules, or DNS changes.",
    "For database locks: check connection pool, slow queries, transaction locks, or recent schema changes.",
    "For memory/OOM: check pod limits, container memory usage, memory leaks, or recent code changes.",
    "Use rollback, revert, pause, or freeze ONLY when there is clear evidence of a recent deploy regression or production outage.",
    "Otherwise, suggest a specific diagnostic or targeted fix relevant to the issue type.",
    "Confidence must be between 70 and 95.",
    "BlastRadius must be exactly: service, pod, infra, or unknown.",
    "Safety must be relevant to the action: backup, snapshot, preserve evidence, or avoid data loss.",
  ].join("\n");

  const userPrompt = [
    "Goal:",
    "Return safest next action only.",
    "",
    `Issue classification: ${classification}`,
    getClassificationHint(classification),
    "",
    buildFollowUpContext(threadContext),
    threadContext?.isFollowUp ? "New user update:" : "User incident report:",
    input.trim(),
    "",
    "Output structure:",
    "Action:",
    "<one clear next step>",
    "",
    "Confidence:",
    "<number 70–95>",
    "",
    "Blast Radius:",
    "<pod | service | infra | unknown>",
    "",
    "Safety:",
    "<rollback / backup suggestion>",
    "",
    "Example:",
    "User: API latency after deploy",
    "Output:",
    "Action: Check distributed traces for slow endpoints and database query latency before considering rollback",
    "Confidence: 85",
    "Blast Radius: service",
    "Safety: Preserve trace data and slow query logs for further analysis",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

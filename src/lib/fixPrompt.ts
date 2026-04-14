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
    return "Treat this as an API or service-path incident with possible deploy, dependency, or traffic impact.";
  }

  if (classification === "kubernetes") {
    return "Treat this as a Kubernetes incident with workload safety, rollout safety, and pod stability in mind.";
  }

  if (classification === "docker") {
    return "Treat this as a container runtime incident with image, entrypoint, restart, and env safety in mind.";
  }

  if (classification === "infra") {
    return "Treat this as an infrastructure incident with network, certificate, database, or platform impact in mind.";
  }

  return "Treat this as an ambiguous production incident and choose the safest reversible next step.";
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
    "Return the safest next action, not a full solution.",
    "Prioritize safety above all else.",
    "Assume production impact.",
    "Avoid risky actions without warning.",
    "No theory.",
    "No long explanations.",
    "Return ONLY valid JSON. No other text.",
    "Return EXACTLY this object shape with string values:",
    '{"action":"<safe next action>","confidence":"<70–95>","blastRadius":"<service|pod|infra|unknown>","safety":"<rollback or backup suggestion>"}',
    "No markdown.",
    "No code fences.",
    "No extra keys.",
    "No extra text.",
    "Keep each field short and precise.",
    "Never say it depends.",
    "Never say investigate issue.",
    "Never say check logs unless paired with a decisive safe action.",
    "Never say maybe, perhaps, possibly, might, could, or consider.",
    "Never say try, see if, or verify unless it leads to a specific safe action.",
    "Prefer rollback, traffic shift, rollout pause, isolation, or evidence-preserving next steps when risk is high.",
    "Action must be decisive: rollback, revert, pause, drain, isolate, route traffic, failover, or freeze changes.",
    "Confidence must be between 70 and 95.",
    "BlastRadius must be exactly: service, pod, infra, or unknown.",
    "Safety must include: rollback, backup, snapshot, pause, revert, freeze, drain, route traffic, previous version, avoid, preserve, or keep.",
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
    "Action: Rollback recent deploy or route traffic to previous stable version before debugging slow endpoints",
    "Confidence: 88",
    "Blast Radius: service",
    "Safety: Ensure previous deployment snapshot is available before rollback",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

import type { IssueClassification } from "@/lib/classifier";

export type TracePromptInput = {
  input: string;
  classification: IssueClassification;
  decisionAction: string;
};

export function buildTracePrompt({ input, classification, decisionAction }: TracePromptInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = [
    "You are analyzing what likely caused a production incident.",
    "Explain briefly what happened BEFORE the issue occurred.",
    "",
    "=== RULES ===",
    "- 1–2 sentences only",
    "- No solutions or advice",
    "- No repetition of the fix action",
    "- Focus on sequence or cause chain",
    "- Simple, clear language",
    "- No technical jargon unless necessary",
    "- No markdown formatting",
    "",
    "=== BANNED ===",
    '"To fix this", "You should", "Consider", "Try to", "Make sure"',
    "",
    "=== TONE ===",
    "Factual, observational, like a post-incident timeline entry.",
  ].join("\n");

  const userPrompt = [
    "=== INCIDENT ===",
    `Type: ${classification}`,
    `Report: ${input.trim()}`,
    "",
    "=== CONTEXT ===",
    `Fix action being taken: ${decisionAction}`,
    "",
    "=== YOUR TASK ===",
    "Explain what likely caused this incident (the sequence of events).",
    "Focus on the cause chain, not the solution.",
    "",
    "Example 1 (CrashLoopBackOff):",
    '"Recent configuration changes likely caused the container to fail during startup, triggering repeated restarts under Kubernetes health checks."',
    "",
    "Example 2 (Latency):",
    '"Recent deploy likely introduced inefficient queries, which increased response time under load and caused latency spikes."',
    "",
    "Example 3 (SSL):",
    '"Certificate renewal likely failed silently, causing the TLS handshake to reject connections before they reached the application."',
    "",
    "Now write the cause explanation for this incident:",
  ].join("\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

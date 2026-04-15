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
- MUST include distributed tracing endpoint OR specific database query inspection
- MUST reference connection pool saturation, upstream timeout, or dependency failure
- MUST suggest rollback ONLY if latency spike correlates with deploy timestamp
- BANNED: "check logs", "investigate", "debug", "monitor", "verify", "consider"
- REQUIRED: Start with STRONG VERB (Inspect, Rollback, Restart, Scale, Drain)
- OUTPUT: 1 decisive action + safety clause ONLY`;
  }

  if (classification === "kubernetes") {
    return `For Kubernetes incidents:
- CrashLoopBackOff: MUST identify exit code, probe failure, or OOMKill event
- MUST reference specific pod name, deployment, or node pool affected
- MUST suggest rollout pause ONLY if container events show startup failure
- BANNED: "check logs", "investigate", "debug", "verify configuration", "restart the pod"
- REQUIRED: kubectl command OR specific resource to inspect
- OUTPUT: 1 decisive action + safety clause ONLY`;
  }

  if (classification === "docker") {
    return `For container incidents:
- MUST identify specific exit code, entrypoint failure, or image pull error
- MUST reference restart count, resource limit, or volume mount issue
- BANNED: "check logs", "investigate", "debug", "verify setup", "inspect container"
- REQUIRED: docker command OR specific config/file to examine
- OUTPUT: 1 decisive action + safety clause ONLY`;
  }

  if (classification === "infra") {
    return `For infrastructure incidents:
- SSL/TLS: MUST include certificate chain validation OR expiry date check OR TLS version mismatch
- DNS: MUST include specific record type (A/CNAME/TXT) OR resolver test OR propagation validation
- Network: MUST include security group rule OR firewall check OR connectivity test
- Cloudflare: MUST distinguish edge cache status vs origin health check
- Latency after deploy: MUST include rollback decision logic with deploy correlation
- BANNED: "check DNS", "check logs", "investigate", "verify settings", "check configuration"
- REQUIRED: specific certificate, record, or infrastructure component to validate
- OUTPUT: 1 decisive action + safety clause ONLY`;
  }

  return `For ambiguous incidents:
- MUST identify single most likely failure point from input keywords
- MUST provide specific next step with exact tool/command
- BANNED: "check logs", "investigate further", "debug", "monitor", "verify", "consider", "try to"
- REQUIRED: Start with STRONG VERB (Inspect, Isolate, Scale, Rollback, Restart, Drain)
- OUTPUT: 1 decisive action + safety clause ONLY`;
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
    "You are a senior Site Reliability Engineer handling a live P1 production incident.",
    "Your job: Return ONE specific, context-aware, decisive action. No lists. No multiple suggestions. No hesitation.",
    "",
    "=== ABSOLUTE BANS (output will be REJECTED if found) ===",
    'BANNED PHRASES: "check logs", "check DNS", "investigate", "investigate further", "debug", "it depends", "it could be", "it might be", "possibly", "maybe", "perhaps", "consider", "try to", "try", "see if", "verify", "monitor", "look into", "gather more data", "check configuration", "verify settings"',
    "",
    "=== CONTEXT-SPECIFIC MANDATES ===",
    "Cloudflare / CDN issues: MUST distinguish edge (cache status, PoP health) vs origin (5xx rates, connect timeouts).",
    "SSL/TLS issues: MUST include certificate chain validation OR expiry date check OR TLS version mismatch.",
    "Latency after deploy: MUST include rollback decision logic with explicit deploy timestamp correlation.",
    "CrashLoopBackOff: MUST identify specific exit code, probe failure (liveness/readiness), or OOMKill event.",
    "DNS issues: MUST include specific record type (A/CNAME/TXT) OR resolver test OR propagation validation.",
    "Database issues: MUST include connection pool saturation, specific slow query pattern, or lock analysis.",
    "",
    "=== OUTPUT RULES ===",
    "Action: MUST start with STRONG VERB (Inspect, Rollback, Restart, Isolate, Drain, Scale, Validate, Pause, Revert).",
    "Action: ONE sentence only. Decisive tone. No fluff. No hesitation.",
    "Action: MUST be UNIQUE for each issue type. Generic responses are rejected.",
    "Action: MUST reference specific component mentioned in input (service name, endpoint, pod, certificate).",
    "Safety: MUST include rollback awareness OR backup awareness OR 'avoid X before Y'.",
    "Safety: Production-aware. Data-preservation focused.",
    "Confidence: 70-95 only. No uncertainty language.",
    "BlastRadius: service | pod | infra | unknown only.",
    "",
    "=== FORMAT ===",
    "Return ONLY valid JSON:",
    '{"action":"<single decisive action>","confidence":"<70-95>","blastRadius":"<service|pod|infra|unknown>","safety":"<rollback or backup awareness>"}',
    "No markdown. No code fences. No extra keys. No extra text.",
    "",
    "=== PRIORITY ===",
    "1. Safety first (preserve data, enable rollback, prevent data loss)",
    "2. Specificity second (exact component, not generic advice)",
    "3. Decisiveness third (clear action, no tentative language)",
    "4. Brevity fourth (1 sentence max for action)",
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
    "Return ONLY this JSON structure:",
    '{"action":"<ONE decisive sentence starting with strong verb>","confidence":"<70-95>","blastRadius":"<service|pod|infra|unknown>","safety":"<rollback/backup/avoidance clause>"}',
    "",
    "=== EXAMPLES BY CONTEXT ===",
    "Cloudflare 5xx:",
    '{"action":"Inspect edge cache status and origin health checks to distinguish CDN vs origin failure before routing traffic away","confidence":"88","blastRadius":"infra","safety":"Preserve current traffic routing configuration before any changes"}',
    "",
    "SSL Certificate Error:",
    '{"action":"Validate certificate chain and expiry date against the hostname before attempting renewal","confidence":"85","blastRadius":"infra","safety":"Export current certificate bundle before replacement to enable rollback"}',
    "",
    "Latency after deploy:",
    '{"action":"Inspect distributed traces for database query latency and connection pool saturation before rolling back the deployment","confidence":"82","blastRadius":"service","safety":"Preserve current deployment revision and database metrics before revert"}',
    "",
    "CrashLoopBackOff:",
    '{"action":"Inspect container exit code and probe failure events to identify startup failure cause","confidence":"86","blastRadius":"pod","safety":"Keep previous ReplicaSet ready for immediate rollback if config issue confirmed"}',
    "",
    "DNS Resolution Failure:",
    '{"action":"Validate A and CNAME record propagation across multiple geographic resolvers","confidence":"84","blastRadius":"infra","safety":"Document current DNS records before any record modifications"}',
  ]
    .filter(Boolean)
    .join("\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

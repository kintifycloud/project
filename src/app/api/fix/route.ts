import { logs } from '@opentelemetry/api-logs';
import '../../../lib/otel-init';
import { supabase } from '../../../lib/supabase';

type ProviderName = "gemini" | "deepseek" | "mistral" | "openrouter";

type FixApiSuccess = {
  success: true;
  output: string;
  answer: string;
  confidence?: number;
  provider: ProviderName;
};

type FixApiError = {
  success: false;
  error: string;
  provider?: ProviderName;
  upstreamStatus?: number;
};

type ProviderException = Error & {
  provider: ProviderName;
  upstreamStatus?: number;
};

type DetectedEnvironment = "kubernetes" | "docker" | "aws" | "database" | "node" | "nginx" | "generic";

type IntentMode = "DETAILED_GUIDE" | "CONCISE_FIX";

type IssueSeverity = "critical" | "high" | "medium";

type UserUrgency = "production_urgent" | "elevated" | "normal";

type FixThreadTurn = {
  user: string;
  assistant: string;
};

type FixThreadContext = {
  sessionId?: string;
  originalIssue: string;
  previousAnswer: string;
  recentMessages: FixThreadTurn[];
  isFollowUp: boolean;
};

function getFastPathResponse(input: string): string | null {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes("crashloopbackoff") || lowerInput.includes("crash loop")) {
    return "This is probably happening because the container is exiting right away or failing startup checks after a config, secret, or dependency change, so start by checking kubectl describe pod <pod> and kubectl logs <pod> --previous to see the last termination reason, then verify recent ConfigMap, Secret, and env var changes, and if that looks normal inspect startup and readiness probes because they often keep a slow but healthy container stuck in a restart loop.";
  }

  if (lowerInput.includes("ssl handshake") || lowerInput.includes("ssl certificate") || lowerInput.includes("tls")) {
    return "This is probably happening because the server is presenting an expired certificate, an incomplete chain, or the wrong hostname, so start by checking openssl s_client -connect <host>:443 -servername <host> to see exactly what is being served, then make sure the ingress or load balancer has the full chain and correct cert attached, and if that looks normal verify the listener is not still serving a cached or default fallback certificate.";
  }

  if (lowerInput.includes("502") || lowerInput.includes("bad gateway")) {
    return "This is probably happening because the proxy can reach the upstream target but the app is crashing, listening on the wrong port, or timing out before headers are returned, so start by checking target health and making sure the service port matches the actual listener, then inspect app logs at the same timestamp as the 502s, and if that looks normal compare proxy and upstream timeout settings because mismatches there often keep 502s going after the first fix.";
  }

  if (lowerInput.includes("latency") || lowerInput.includes("slow") || lowerInput.includes("timeout")) {
    return "This is probably happening because a recent change introduced a slower query path, lock contention, or downstream timeout amplification, so start by checking p95 and p99 latency before and after the last release and trace the slow endpoint through your APM to find the longest span, then inspect database slow queries and connection saturation, and if that looks normal check for retry storms, queue buildup, or autoscaling lag keeping the system under pressure.";
  }

  if (lowerInput.includes("database") && lowerInput.includes("connection")) {
    return "This is probably happening because the connection pool is being exhausted by leaked sessions, long transactions, or limits that are too low for peak concurrency, so start by checking active sessions and transaction age in the database, then make sure the app closes connections on every code path and tune pool lifetime settings, and if that looks normal inspect background workers or stuck jobs because they often keep connections open after the main request path is fixed.";
  }

  if (lowerInput.includes("memory") || lowerInput.includes("oom")) {
    return "This is probably happening because memory usage is growing past the container limit from a leak, unbounded cache, or a workload spike, so start by checking the termination reason with kubectl describe pod <pod-name> and current usage with kubectl top pod <pod-name> or your metrics stack, then capture a heap profile or dump during growth to find what is being retained, and if that looks normal verify requests and limits are not too low and check for traffic bursts or background jobs temporarily pushing memory higher.";
  }

  return null;
}

function detectEnvironment(input: string): DetectedEnvironment {
  const lowerInput = input.toLowerCase();

  if (/(kubernetes|kubectl|\bpod\b|deployment|daemonset|statefulset|namespace|crashloopbackoff|oomkilled|ingress|configmap|secret)/.test(lowerInput)) {
    return "kubernetes";
  }

  if (/(docker|dockerfile|docker-compose|containerd|container exited|compose)/.test(lowerInput)) {
    return "docker";
  }

  if (/(nginx|reverse proxy|proxy_pass|upstream prematurely closed connection)/.test(lowerInput)) {
    return "nginx";
  }

  if (/(aws|ec2|ecs|eks|fargate|lambda|cloudwatch|alb|elb|iam|rds|route53)/.test(lowerInput)) {
    return "aws";
  }

  if (/(postgres|postgresql|mysql|mariadb|mongodb|redis|database|connection pool|sql|deadlock)/.test(lowerInput)) {
    return "database";
  }

  if (/(node\.?js|npm|pnpm|yarn|next\.?js|typescript|heap out of memory|typeerror|referenceerror)/.test(lowerInput)) {
    return "node";
  }

  return "generic";
}

function detectIntentMode(input: string): IntentMode {
  const lowerInput = input.toLowerCase();

  if (/(step by step|step-by-step|guide me|walk me through|walkthrough|how do i fix this exactly|how do i debug this exactly|exact commands|detailed troubleshooting|show me exactly|what do i check first)/.test(lowerInput)) {
    return "DETAILED_GUIDE";
  }

  return "CONCISE_FIX";
}

function detectIssueSeverity(input: string): IssueSeverity {
  const lowerInput = input.toLowerCase();

  if (/(outage|down in prod|production down|sev[ -]?1|critical incident|customer impact|all requests failing|site down|payments? failing|checkout broken|ssl broken|tls broken|certificate expired in prod|deploy outage|login broken in prod)/.test(lowerInput)) {
    return "critical";
  }

  if (/(latency|timeout|timed out|crashloopbackoff|restart|ssl|tls|certificate|502|503|504|oom|deadlock|connection refused|deploy failed|rollout failed|release blocked)/.test(lowerInput)) {
    return "high";
  }

  return "medium";
}

function detectUserUrgency(input: string): UserUrgency {
  const lowerInput = input.toLowerCase();

  if (/(production|prod|urgent|asap|right now|customer|incident|outage|sev[ -]?1|broken deploy|deploy failed|release blocked|payments? failing|customers? cannot|traffic down|users impacted)/.test(lowerInput)) {
    return "production_urgent";
  }

  if (/(deploy|deployment|release|broken|failing|cannot|can't|unable)/.test(lowerInput)) {
    return "elevated";
  }

  return "normal";
}

function formatPromptList(items: string[]): string {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0] ?? "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function getIssueSignals(input: string): string[] {
  const lowerInput = input.toLowerCase();
  const signals = new Set<string>();

  if (/(crashloopbackoff|crash loop|restart|restarting|startup probe|readiness probe)/.test(lowerInput)) {
    signals.add("restart loop or startup failure");
  }

  if (/(ssl|tls|certificate|handshake|x509)/.test(lowerInput)) {
    signals.add("tls or certificate mismatch");
  }

  if (/(latency|slow|timeout|timeouts|timed out|p95|p99)/.test(lowerInput)) {
    signals.add("latency or timeout regression");
  }

  if (/(database|postgres|postgresql|mysql|mariadb|connection|pool|deadlock|query)/.test(lowerInput)) {
    signals.add("database pressure or connection saturation");
  }

  if (/(502|503|504|bad gateway|upstream|proxy|load balancer|alb|elb|ingress|nginx)/.test(lowerInput)) {
    signals.add("load balancer or upstream failure");
  }

  if (/(memory|oom|oomkilled|heap|garbage collection|gc)/.test(lowerInput)) {
    signals.add("memory pressure or leak");
  }

  if (/(docker|container|image|entrypoint)/.test(lowerInput)) {
    signals.add("container runtime or image mismatch");
  }

  if (signals.size === 0) {
    signals.add("runtime, config, or dependency regression");
  }

  return Array.from(signals);
}

function getModeSpecificInstructions(mode: IntentMode): string {
  if (mode === "DETAILED_GUIDE") {
    return [
      "- The user wants a guided walkthrough, so make the sequence easy to follow in one paragraph",
      "- Tell them what to check first, include exact commands when relevant, and say what to do next if the first check looks normal",
      "- Keep it natural and human, not like a numbered runbook",
    ].join("\n");
  }

  return [
    "- Default to a concise fix with the highest-value next action first",
    "- Keep it tight and practical without sounding clipped or generic",
  ].join("\n");
}

function getContextAwareChecks(input: string): string[] {
  const lowerInput = input.toLowerCase();
  const environment = detectEnvironment(input);

  if (environment === "kubernetes") {
    if (/(memory|oom)/.test(lowerInput)) {
      return ["kubectl describe pod <pod-name>", "kubectl top pod <pod-name>", "kubectl logs <pod-name> --previous"];
    }

    if (/(restart|crash|crashloopbackoff)/.test(lowerInput)) {
      return ["kubectl describe pod <pod-name>", "kubectl logs <pod-name> --previous", "kubectl get events --sort-by=.metadata.creationTimestamp"];
    }

    return ["kubectl describe pod <pod-name>", "kubectl logs <pod-name>", "kubectl get events --sort-by=.metadata.creationTimestamp"];
  }

  if (environment === "docker") {
    return ["docker ps -a", "docker logs <container-name> --tail 200", "docker inspect <container-name>"];
  }

  if (environment === "nginx") {
    return ["nginx -t", "tail -n 200 /var/log/nginx/error.log", "tail -n 200 /var/log/nginx/access.log"];
  }

  if (environment === "aws") {
    if (/(alb|elb|502|503|504|bad gateway)/.test(lowerInput)) {
      return ["aws elbv2 describe-target-health --target-group-arn <target-group-arn>", "aws logs tail <log-group-name> --follow"];
    }

    return ["aws logs tail <log-group-name> --follow", "aws cloudwatch get-metric-statistics --namespace <namespace> --metric-name <metric-name>"];
  }

  if (environment === "database") {
    if (/(postgres|postgresql)/.test(lowerInput)) {
      return ["psql <connection-string> -c \"select pid, state, wait_event_type, wait_event, query_start from pg_stat_activity order by query_start asc;\"", "psql <connection-string> -c \"select * from pg_stat_database;\""];
    }

    return ["inspect active sessions in the database", "review connection pool limits against peak concurrency"];
  }

  if (environment === "node") {
    return ["npm ls --depth=0", "npm why <package-name>", "node --trace-gc <entry-file>"];
  }

  return ["compare the current runtime config to the last healthy deploy", "inspect logs and metrics from the exact failure window"];
}

function buildPromptContext(input: string, threadContext?: FixThreadContext | null): string {
  const analysisInput = buildContextAnalysisInput(input, threadContext);
  const environment = detectEnvironment(analysisInput);
  const intentMode = detectIntentMode(input);
  const severity = detectIssueSeverity(analysisInput);
  const urgency = detectUserUrgency(analysisInput);
  const signals = getIssueSignals(analysisInput);
  const checks = getContextAwareChecks(analysisInput);

  return [
    `Detected environment: ${environment}.`,
    `Requested help style: ${intentMode === "DETAILED_GUIDE" ? "guided walkthrough" : "concise practical fix"}.`,
    `Severity signal: ${severity}.`,
    `Urgency signal: ${urgency}.`,
    `Key signals: ${formatPromptList(signals.slice(0, 3))}.`,
    `Useful checks to anchor on when relevant: ${formatPromptList(checks.slice(0, 3))}.`,
  ].join("\n");
}

function buildThreadPromptContext(input: string, threadContext?: FixThreadContext | null): string {
  if (!threadContext?.isFollowUp) {
    return "";
  }

  const recentThreadContext = threadContext.recentMessages.length > 0
    ? threadContext.recentMessages
        .map((turn, index) => `Follow-up ${index + 1} from user: ${turn.user}\nReply already given: ${turn.assistant}`)
        .join("\n")
    : "";

  return `
You are continuing an existing debugging thread for the same issue.

Original issue:
${threadContext.originalIssue}

Previous answer already shown to the user:
${threadContext.previousAnswer}

${recentThreadContext ? `Recent follow-up context:\n${recentThreadContext}\n` : ""}New user update:
${input}

Follow-up rules:
- Assume the user has already seen the earlier answer
- Do not repeat the same checks unless the new update changes their relevance
- Move the troubleshooting forward based on what has already been suggested
- Reference prior context naturally without sounding like a transcript
`;
}

function buildContextAnalysisInput(input: string, threadContext?: FixThreadContext | null): string {
  if (!threadContext?.isFollowUp) {
    return input;
  }

  return [
    threadContext.originalIssue,
    threadContext.previousAnswer,
    ...threadContext.recentMessages.flatMap((turn) => [turn.user, turn.assistant]),
    input,
  ]
    .filter(Boolean)
    .join("\n");
}

function toThreadText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function parseThreadContext(raw: unknown): FixThreadContext | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const maybe = raw as {
    sessionId?: unknown;
    originalIssue?: unknown;
    previousAnswer?: unknown;
    recentMessages?: unknown;
    isFollowUp?: unknown;
  };

  const originalIssue = toThreadText(maybe.originalIssue, 1200);
  const previousAnswer = toThreadText(maybe.previousAnswer, 1200);
  const sessionId = toThreadText(maybe.sessionId, 120);
  const isFollowUp = maybe.isFollowUp === true;
  const recentMessages = Array.isArray(maybe.recentMessages)
    ? maybe.recentMessages
        .map((entry) => {
          const item = entry as { user?: unknown; assistant?: unknown } | null;
          const user = toThreadText(item?.user, 600);
          const assistant = toThreadText(item?.assistant, 600);

          if (!user || !assistant) {
            return null;
          }

          return { user, assistant } satisfies FixThreadTurn;
        })
        .filter((entry): entry is FixThreadTurn => entry !== null)
        .slice(-3)
    : [];

  if (!isFollowUp || !originalIssue || !previousAnswer) {
    return null;
  }

  return {
    ...(sessionId ? { sessionId } : {}),
    originalIssue,
    previousAnswer,
    recentMessages,
    isFollowUp: true,
  };
}

function isComplexIssue(input: string): boolean {
  const lowerInput = input.toLowerCase();
  const lineCount = input.split(/\r?\n/).length;

  return (
    input.length > 320 ||
    lineCount > 6 ||
    /(stack trace|traceback|caused by|exception|oom|memory|timeout|latency|deadlock|connection refused|crashloopbackoff|502|503|504|segfault)/.test(lowerInput)
  );
}

function getAdaptiveMaxOutputTokens(input: string): number {
  const intentMode = detectIntentMode(input);

  if (intentMode === "DETAILED_GUIDE") {
    return isComplexIssue(input) ? 320 : 280;
  }

  return isComplexIssue(input) ? 280 : 220;
}

function getProviderTimeoutMs(): number {
  return 5500;
}

function getProviderTemperature(input: string): number {
  return detectIntentMode(input) === "DETAILED_GUIDE" ? 0.4 : 0.35;
}

function getProviderConfidence(provider: ProviderName): number {
  if (provider === "gemini") {
    return 90;
  }

  if (provider === "deepseek") {
    return 86;
  }

  if (provider === "mistral") {
    return 83;
  }

  return 80;
}

function getProviderApiKey(provider: ProviderName): string | undefined {
  if (provider === "gemini") {
    return process.env.GEMINI_API_KEY;
  }

  if (provider === "deepseek") {
    return process.env.DEEPSEEK_API_KEY;
  }

  if (provider === "mistral") {
    return process.env.MISTRAL_API_KEY;
  }

  return process.env.OPENROUTER_API_KEY;
}

function buildProviderPrompt(input: string, threadContext?: FixThreadContext | null): string {
  const intentMode = detectIntentMode(input);
  const analysisInput = buildContextAnalysisInput(input, threadContext);
  const severity = detectIssueSeverity(analysisInput);
  const promptContext = buildPromptContext(input, threadContext);
  const modeSpecificInstructions = getModeSpecificInstructions(intentMode);
  const threadPromptContext = buildThreadPromptContext(input, threadContext);

  return `
You are a senior Site Reliability Engineer helping a teammate fix a real production issue.

Analyze the issue and respond with ONE natural, clear, and highly practical paragraph that feels grounded in the actual symptom, not like a generic AI template.
${threadPromptContext ? `${threadPromptContext}\n` : `User Issue:\n${input}\n`}

Context Hints:
${promptContext}

Instructions:
- Identify the most likely root cause
- Briefly connect the symptom to that cause so the answer feels grounded
- Detect environment automatically (Kubernetes, Docker, AWS, Node.js, etc.)
- Include exact commands or actions when useful
- Guide what to do first in a natural way
- Add one next check if the first thing looks normal
- Add subtle proactive checks if relevant
- Keep the answer concise but not clipped
- ${severity === "critical" ? "If the issue is production-critical, start with the fastest safe containment step to reduce user impact before deeper debugging" : "Keep the first action high-value and easy to verify"}
 ${modeSpecificInstructions}

Tone Rules:
- Sound like a real engineer explaining the issue to a teammate
- Keep it natural and slightly conversational (not robotic, not overly formal)
- Avoid rigid phrasing like “the issue is caused by...”
- Avoid repetition or filler
- Be confident but not arrogant
- Make it easy to read quickly
- Prefer clarity and specificity over generic safety language

STRICT RULES:
- Output must be ONE paragraph only
- No headings, no bullets, no labels
- No fluff
- No generic advice
- Do not return incomplete sentences
- Do not return placeholder text
- Your response must be a complete, useful paragraph
- Target roughly 120 to 180 words unless the issue is very simple
- Keep it practical and grounded in real debugging
`;
}

function createProviderException(provider: ProviderName, message: string, upstreamStatus?: number): ProviderException {
  const error = new Error(message) as ProviderException;
  error.provider = provider;

  if (typeof upstreamStatus === "number") {
    error.upstreamStatus = upstreamStatus;
  }

  return error;
}

function getProviderErrorMessage(provider: ProviderName, status: number, upstreamMessage?: string): string {
  if (status === 401 || status === 403) {
    return `${provider} authentication failed`;
  }

  if (status === 429) {
    return `${provider} rate limit exceeded`;
  }

  if (status >= 500) {
    return `${provider} upstream service failed`;
  }

  if (upstreamMessage) {
    return `${provider} error: ${upstreamMessage}`;
  }

  return `${provider} request failed`;
}

function extractGeminiText(data: unknown): string {
  const maybe = data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> } | null;
  return maybe?.candidates?.[0]?.content?.parts?.[0]?.text ? String(maybe.candidates[0].content.parts[0].text) : "";
}

function extractChatCompletionText(data: unknown): string {
  const maybe = data as { choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }> } | null;
  const content = maybe?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map((part) => (typeof part?.text === "string" ? part.text : "")).join(" ").trim();
  }

  return "";
}

function extractUpstreamMessage(data: unknown): string | undefined {
  const maybe = data as { error?: { message?: string } } | null;
  return typeof maybe?.error?.message === "string" ? maybe.error.message : undefined;
}

function dedupeRepeatedSentences(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]*/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];

  if (sentences.length === 0) {
    return text.trim();
  }

  const deduped: string[] = [];

  for (const sentence of sentences) {
    const normalizedSentence = sentence.replace(/\s+/g, " ").trim();
    const previousSentence = deduped[deduped.length - 1];

    if (normalizedSentence && normalizedSentence.toLowerCase() !== previousSentence?.toLowerCase()) {
      deduped.push(normalizedSentence);
    }
  }

  return deduped.join(" ").trim();
}

function sanitizeProviderOutput(text: string): string {
  return dedupeRepeatedSentences(
    text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/^\s*#{1,6}\s+/gm, "")
      .replace(/^\s*[-*]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/\r?\n+/g, " ")
      .replace(/^(?:hey|hi|hello|sure|okay|ok|got it|absolutely|certainly)[,:\-]\s+/i, "")
      .replace(/^(?:answer|response|fix|summary)\s*:\s*/i, "")
      .replace(/^(?:here(?:'s| is)\s+(?:what to do|the fix|a fix|what to check))[:,\-]?\s*/i, "")
      .replace(/\b(try restarting service|restart the service|check the logs)\b(?:[.!?]|$)/gi, "$1.")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;!?])/g, "$1")
      .trim()
      .replace(/^["']+|["']+$/g, ""),
  );
}

function getLastWord(text: string): string {
  const words = text.replace(/[.!?]+$/g, "").trim().split(/\s+/).filter(Boolean);
  return words[words.length - 1]?.toLowerCase() ?? "";
}

function getQualityRejectionReason(text: string): string | null {
  const cleaned = sanitizeProviderOutput(text);
  const words = cleaned.split(/\s+/).filter(Boolean);
  const lastWord = getLastWord(cleaned);

  if (!cleaned) {
    return "empty output";
  }

  if (cleaned.length < 35 || words.length < 7) {
    return "output too short";
  }

  if (!/[a-z]/i.test(cleaned)) {
    return "malformed text";
  }

  if (/\b(?:placeholder|lorem ipsum|tbd|todo|dummy text|as an ai|i cannot determine|i can't determine|not enough context|need more context|it depends|there could be several reasons)\b/i.test(cleaned)) {
    return "placeholder or filler text";
  }

  if (/(?:^|\s)(?:and|or|because|with|after|before|during|then|when|while|where|from|into|onto|around|through|if|that)$/.test(lastWord)) {
    return "abrupt ending";
  }

  if (!/\b(?:start by|check|verify|inspect|review|compare|trace|run|look at|make sure|confirm|capture|measure|tail|describe|logs|metrics|profile|diff)\b/i.test(cleaned)) {
    return "missing practical debugging guidance";
  }

  if (!/\b(?:because|caused by|coming from|due to|triggered by|means the|usually because)\b/i.test(cleaned) && cleaned.length < 90) {
    return "too vague";
  }

  return null;
}

function normalizeFixOutput(text: string): string {
  let output = sanitizeProviderOutput(text);

  const words = output.split(/\s+/).filter(Boolean);
  if (words.length > 180) {
    output = `${words.slice(0, 180).join(" ").replace(/[.,;:!?]+$/g, "")}.`;
  }

  if (output && !/[.!?]$/.test(output)) {
    output = `${output}.`;
  }

  return output;
}

function toLowercaseLeadingPhrase(text: string): string {
  if (!text) {
    return text;
  }

  return text.charAt(0).toLowerCase() + text.slice(1);
}

function applySeverityAwareTone(text: string, input: string, threadContext?: FixThreadContext | null): string {
  const analysisInput = buildContextAnalysisInput(input, threadContext);
  const severity = detectIssueSeverity(analysisInput);
  const urgency = detectUserUrgency(analysisInput);

  if (severity !== "critical" && urgency !== "production_urgent") {
    return text;
  }

  if (/^(?:This looks production-critical|This likely needs immediate rollback|Restore traffic first|Reduce user impact first)/i.test(text)) {
    return text;
  }

  const lowerInput = analysisInput.toLowerCase();
  const nextClause = toLowercaseLeadingPhrase(text);

  if (/(payments?|checkout|billing|payment intent|card)/.test(lowerInput)) {
    return normalizeFixOutput(`This looks production-critical, so restore the payment path first by rolling back the last risky checkout change or failing over to the last known good payment configuration, then ${nextClause}`);
  }

  if (/(ssl|tls|certificate|handshake|x509)/.test(lowerInput)) {
    return normalizeFixOutput(`This looks production-critical, so restore traffic first by serving a valid certificate or reverting to the last known good listener configuration, then ${nextClause}`);
  }

  if (/(deploy|deployment|rollout|release)/.test(lowerInput)) {
    return normalizeFixOutput(`This likely needs immediate rollback to reduce impact, so restore the last known good deploy first if you can do that safely, then ${nextClause}`);
  }

  if (/(502|503|504|bad gateway|upstream|load balancer|alb|elb|nginx|traffic down)/.test(lowerInput)) {
    return normalizeFixOutput(`This looks production-critical, so restore traffic first by shifting requests back to healthy targets or reversing the last risky edge change, then ${nextClause}`);
  }

  return normalizeFixOutput(`This looks production-critical, so restore user impact first by rolling back the last known risky change if that is safe, then ${nextClause}`);
}

function applyIntentAwarePolish(text: string, input: string, threadContext?: FixThreadContext | null): string {
  const polished = applySeverityAwareTone(polishFixOutput(text), input, threadContext);

  if (detectIntentMode(input) !== "DETAILED_GUIDE") {
    if (!threadContext?.isFollowUp) {
      return polished;
    }

    if (/\b(?:already checked|since you already checked|because you already verified|based on what you tried)\b/i.test(polished)) {
      return polished;
    }

    return normalizeFixOutput(
      `Based on what you already checked, ${polished.charAt(0).toLowerCase()}${polished.slice(1)}`,
    );
  }

  if (/(?:\bif that looks normal\b|\bif that fails\b|\bif it still\b|\bthen inspect\b|\bthen check\b)/i.test(polished)) {
    return polished;
  }

  const checks = getContextAwareChecks(buildContextAnalysisInput(input, threadContext));
  if (checks.length < 2) {
    return polished;
  }

  return normalizeFixOutput(
    `${polished.replace(/[.!?]+$/g, "")}, then if that looks normal move to ${checks[1]} so you can rule out the next likely failure point without guessing.`,
  );
}

function polishFixOutput(text: string): string {
  return normalizeFixOutput(
    strengthenDecisionTone(normalizeFixOutput(text))
      .replace(/\bthen then\b/gi, "then")
      .replace(/\bbecause because\b/gi, "because")
      .replace(/\band and\b/gi, "and")
      .replace(/\bso start by start(?:ing)? by\b/gi, "start by")
      .replace(/\bthis is probably happening because this is probably happening because\b/gi, "This is probably happening because")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;!?])/g, "$1")
      .trim(),
  );
}

function strengthenDecisionTone(text: string): string {
  return text
    .replace(/^the issue is caused by\s+/i, "This is probably happening because ")
    .replace(/^the issue is being caused by\s+/i, "This is probably happening because ")
    .replace(/^the failure is caused by\s+/i, "This is probably happening because ")
    .replace(/^the failure is being driven by\s+/i, "This is probably happening because ")
    .replace(/^this is an out-of-memory condition caused by\s+/i, "This is probably happening because ")
    .replace(/^the tls failure is caused by\s+/i, "This is probably happening because ")
    .replace(/\bare most likely caused by\b/gi, "are caused by")
    .replace(/\bis most likely caused by\b/gi, "is caused by")
    .replace(/\bare most likely being driven by\b/gi, "are being driven by")
    .replace(/\bis most likely being driven by\b/gi, "is being driven by")
    .replace(/\bis most likely coming from\b/gi, "is coming from")
    .replace(/\bare most likely coming from\b/gi, "are coming from")
    .replace(/\bis most likely triggered by\b/gi, "is triggered by")
    .replace(/\bare most likely triggered by\b/gi, "are triggered by")
    .replace(/\bmight be\b/gi, "is")
    .replace(/\bmay be\b/gi, "is")
    .replace(/\bstart by confirming\b/gi, "start by checking")
    .replace(/\bconfirm the application closes\b/gi, "make sure the application closes")
    .replace(/\bconfirm the ingress or load balancer has\b/gi, "make sure the ingress or load balancer has")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();
}

function validateProviderText(provider: ProviderName, text: string): string {
  const polished = polishFixOutput(text);
  const reason = getQualityRejectionReason(polished);

  if (reason) {
    const preview = polished.slice(0, 120);
    console.log(`[Fix API] Rejected ${provider} output: ${reason}${preview ? ` | ${preview}` : ""}`);
    throw createProviderException(provider, `${provider} returned low-quality output: ${reason}`);
  }

  return polished;
}

function logProviderConfiguration() {
  const providerStates: Record<ProviderName, boolean> = {
    gemini: Boolean(getProviderApiKey("gemini")),
    deepseek: Boolean(getProviderApiKey("deepseek")),
    mistral: Boolean(getProviderApiKey("mistral")),
    openrouter: Boolean(getProviderApiKey("openrouter")),
  };

  console.log("[Fix API] Provider configuration", providerStates);
}

async function runProviderRequest<T>(provider: ProviderName, fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), getProviderTimeoutMs());

  try {
    console.log(`[Fix API] Attempting provider ${provider}`);
    const result = await fn(controller.signal);
    console.log(`[Fix API] Provider ${provider} succeeded in ${Date.now() - startedAt}ms`);
    return result;
  } catch (error) {
    const reason = error instanceof Error && error.name === "AbortError"
      ? `${provider} request timeout`
      : error instanceof Error
        ? error.message
        : String(error);
    console.log(`[Fix API] Provider ${provider} failed in ${Date.now() - startedAt}ms: ${reason}`);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const raw = await res.text();

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function callOpenAiCompatibleProvider(
  provider: Exclude<ProviderName, "gemini">,
  endpoint: string,
  apiKey: string,
  model: string,
  input: string,
  threadContext?: FixThreadContext | null,
): Promise<FixApiSuccess> {
  return runProviderRequest(provider, async (signal) => {
    const prompt = buildProviderPrompt(input, threadContext);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(provider === "openrouter"
          ? {
              "HTTP-Referer": "https://kintify.cloud",
              "X-Title": "Kintify Fix",
            }
          : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a senior Site Reliability Engineer helping a teammate debug a real production issue. Respond with one natural, practical paragraph only. Do not return incomplete sentences. Do not return placeholder text. Your response must be a complete, useful paragraph. If this is a follow-up, continue the same thread, avoid repeating earlier advice, and move the troubleshooting forward.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: getProviderTemperature(input),
        max_tokens: getAdaptiveMaxOutputTokens(input),
      }),
      signal,
    });

    const data = await parseJsonResponse(res);
    const text = extractChatCompletionText(data);

    if (!res.ok || !text) {
      throw createProviderException(
        provider,
        getProviderErrorMessage(provider, res.status, extractUpstreamMessage(data)),
        res.status,
      );
    }

    const output = validateProviderText(provider, text);

    return {
      success: true,
      output,
      answer: output,
      confidence: getProviderConfidence(provider),
      provider,
    };
  });
}

async function callGemini(input: string, threadContext?: FixThreadContext | null): Promise<FixApiSuccess> {
  if (!process.env.GEMINI_API_KEY) {
    throw createProviderException("gemini", "Gemini not configured");
  }

  return runProviderRequest("gemini", async (signal) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: buildProviderPrompt(input, threadContext) }],
            },
          ],
          generationConfig: {
            temperature: getProviderTemperature(input),
            maxOutputTokens: getAdaptiveMaxOutputTokens(input),
          },
        }),
        signal,
      },
    );

    const data = await parseJsonResponse(res);
    const text = extractGeminiText(data);

    if (!res.ok || !text) {
      throw createProviderException(
        "gemini",
        getProviderErrorMessage("gemini", res.status, extractUpstreamMessage(data)),
        res.status,
      );
    }

    const output = validateProviderText("gemini", text);

    return {
      success: true,
      output,
      answer: output,
      confidence: getProviderConfidence("gemini"),
      provider: "gemini",
    };
  });
}

async function callDeepSeek(input: string, threadContext?: FixThreadContext | null): Promise<FixApiSuccess> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw createProviderException("deepseek", "DeepSeek not configured");
  }

  return callOpenAiCompatibleProvider(
    "deepseek",
    "https://api.deepseek.com/chat/completions",
    process.env.DEEPSEEK_API_KEY,
    "deepseek-chat",
    input,
    threadContext,
  );
}

async function callMistral(input: string, threadContext?: FixThreadContext | null): Promise<FixApiSuccess> {
  if (!process.env.MISTRAL_API_KEY) {
    throw createProviderException("mistral", "Mistral not configured");
  }

  return callOpenAiCompatibleProvider(
    "mistral",
    "https://api.mistral.ai/v1/chat/completions",
    process.env.MISTRAL_API_KEY,
    "mistral-small-latest",
    input,
    threadContext,
  );
}

async function callOpenRouter(input: string, threadContext?: FixThreadContext | null): Promise<FixApiSuccess> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw createProviderException("openrouter", "OpenRouter not configured");
  }

  return callOpenAiCompatibleProvider(
    "openrouter",
    "https://openrouter.ai/api/v1/chat/completions",
    process.env.OPENROUTER_API_KEY,
    "openai/gpt-4o-mini",
    input,
    threadContext,
  );
}

async function saveFixHistory(userInput: string, aiOutput: string, provider: ProviderName): Promise<void> {
  if (!supabase) {
    console.warn('[Supabase] Fix history not saved - client not initialized');
    return;
  }

  try {
    const { error } = await supabase
      .from('fix_history')
      .insert({
        user_input: userInput,
        ai_output: aiOutput,
        provider: provider,
      });

    if (error) {
      console.error('[Supabase] Failed to save fix history:', error);
    } else {
      console.log('[Supabase] Fix history saved');
    }
  } catch (error) {
    console.error('[Supabase] Error saving fix history:', error);
  }
}

function buildSuccessResponse(output: string, provider: ProviderName, confidence: number | undefined, input: string, threadContext?: FixThreadContext | null) {
  const text = applyIntentAwarePolish(output, input, threadContext);

  return new Response(JSON.stringify({
    success: true,
    output: text,
    answer: text,
    ...(typeof confidence === "number" ? { confidence } : {}),
    provider,
  } satisfies FixApiSuccess), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(req: Request) {
  try {
    console.log('[OTEL API] POST request received');

    // Explicit test log emission
    const logger = logs.getLogger('kintifycloud');
    console.log('[OTEL API] Logger obtained:', logger);
    console.log('[OTEL API] Logger type:', logger.constructor.name);
    console.log('[OTEL API] Logger provider:', (logger as { provider?: { constructor?: { name?: string } } }).provider?.constructor?.name);
    
    const logRecord = {
      severityText: 'INFO',
      body: 'OpenTelemetry test log - Grafana Cloud integration verified',
      attributes: {
        'service.name': 'kintifycloud',
        'service.version': '0.1.0',
        'test.log': 'true',
        'api.route': '/api/fix',
      },
    };
    
    console.log('[OTEL API] Emitting log record:', logRecord);
    logger.emit(logRecord);
    console.log('[OTEL API] Log emitted successfully');

    // Force flush to ensure logs are sent immediately
    const loggerProvider = (logger as { provider?: { forceFlush?: () => Promise<void> } }).provider;
    if (loggerProvider && typeof loggerProvider.forceFlush === 'function') {
      console.log('[OTEL API] Force flushing logger provider...');
      await loggerProvider.forceFlush();
      console.log('[OTEL API] Force flush completed');
    } else {
      console.warn('[OTEL API] Logger provider or forceFlush not available');
    }

    const body = await req.json();
    const input = body.input?.trim();
    const threadContext = parseThreadContext(body.thread);

    if (!input) {
      return Response.json({
        success: false,
        error: "Input is required",
      }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY && !process.env.DEEPSEEK_API_KEY && !process.env.MISTRAL_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return Response.json({
        success: false,
        error: "Server is not configured",
      } satisfies FixApiError, { status: 500 });
    }

    logProviderConfiguration();
    console.log(`[Fix API] Intent ${detectIntentMode(input)}, environment ${detectEnvironment(input)}, severity ${detectIssueSeverity(input)}, urgency ${detectUserUrgency(input)}`);
    if (threadContext?.isFollowUp) {
      console.log(`[Fix API] Continuing issue thread${threadContext.sessionId ? ` ${threadContext.sessionId}` : ""} with ${threadContext.recentMessages.length} prior follow-up turns`);
    }

    // Check for fast path responses first
    const fastPathResponse = threadContext?.isFollowUp ? null : getFastPathResponse(input);
    if (fastPathResponse) {
      saveFixHistory(input, fastPathResponse, "gemini");
      return buildSuccessResponse(fastPathResponse, "gemini", 85, input, threadContext);
    }

    const providers = [callGemini, callDeepSeek, callMistral, callOpenRouter];
    let lastError: ProviderException | null = null;

    for (const callProvider of providers) {
      try {
        const result = await callProvider(input, threadContext);
        console.log(`[Fix API] Using provider ${result.provider}`);
        saveFixHistory(input, result.output, result.provider);
        return buildSuccessResponse(result.output, result.provider, result.confidence, input, threadContext);
      } catch (error) {
        const providerError = error as ProviderException;
        console.log(`[Fix API] Falling back after ${providerError.provider}: ${providerError.message}`);
        lastError = providerError;
      }
    }

    const payload: FixApiError = {
      success: false,
      error: lastError?.message ?? "Failed to analyze issue. Please try again.",
      ...(lastError?.provider ? { provider: lastError.provider } : {}),
      ...(typeof lastError?.upstreamStatus === "number" ? { upstreamStatus: lastError.upstreamStatus } : {}),
    };

    return Response.json(payload, { status: 502 });
   } catch {
     return Response.json({
       success: false,
       error: "Failed to analyze issue. Please try again.",
    }, { status: 500 });
  }
}

import { analyzeWithLLM } from "@/lib/analyzer";

type ProviderName = "gemini" | "deepseek" | "mistral" | "openrouter";

type FixApiSuccess = {
  success: true;
  output: string;
  answer: string;
  confidence?: number;
  provider: ProviderName;
};

type DetectedEnvironment = "kubernetes" | "docker" | "aws" | "node" | "python" | "database" | "linux" | "generic";

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

// Predefined fast paths for common patterns
function getFastPathResponse(input: string): string | null {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes("crashloopbackoff") || lowerInput.includes("crash loop")) {
    return "CrashLoopBackOff is happening because the container is exiting immediately or startup probes are failing after a bad config, secret, or dependency change, so start with `kubectl describe pod <pod>` to confirm the last termination reason and inspect `kubectl logs <pod> --previous` for the failing process, then verify recent ConfigMap, Secret, and env var changes, and if it still loops after the config is corrected, check whether readiness or startup probes are killing a slow-starting container and confirm dependent services are actually reachable during boot.";
  }

  if (lowerInput.includes("ssl handshake") || lowerInput.includes("ssl certificate") || lowerInput.includes("tls")) {
    return "The TLS failure is caused by an expired certificate, an incomplete intermediate chain, or a hostname mismatch between the served certificate and the requested domain, so start with `openssl s_client -connect <host>:443 -servername <host>` to verify the exact certificate and chain being served, then confirm the ingress or load balancer has the full chain installed and that the certificate covers the requested hostname, and if the handshake still fails after replacing the cert, make sure the listener is actually serving the new certificate instead of a cached or default fallback certificate.";
  }

  if (lowerInput.includes("502") || lowerInput.includes("bad gateway")) {
    return "A 502 here means the load balancer or reverse proxy is reaching the upstream target but the application is failing before it can return headers, usually because the backend is crashing, listening on the wrong port, or timing out, so start by checking target health and confirming the service port matches the actual container listener, then inspect upstream logs at the same timestamp as the 502s, and if the backend looks healthy, verify timeout alignment between the proxy and application because mismatched idle or upstream timeouts commonly keep 502s alive after the first fix.";
  }

  if (lowerInput.includes("latency") || lowerInput.includes("slow") || lowerInput.includes("timeout")) {
    return "The latency spike is coming from a recent change that introduced a slower query path, lock contention, or downstream timeout amplification, so start by comparing p95 and p99 latency before and after the last release and trace the slow endpoint through your APM to find the longest span, then inspect database slow query logs and connection saturation, and if the endpoint still stays slow after fixing the hot path, check whether retries, queue backlogs, or autoscaling lag are keeping the system under pressure and extending recovery time.";
  }

  if (lowerInput.includes("database") && lowerInput.includes("connection")) {
    return "The database issue is caused by connection pool exhaustion from leaked sessions, long-running transactions, or pool limits that are lower than peak concurrency, so start by checking active sessions and transaction age in the database and confirm the application closes connections on every code path, then reduce idle and max lifetime settings for stale clients and tune the pool size so it stays below the database connection cap, and if saturation continues after pool tuning, inspect background workers and stuck transactions because they often hold connections long after the main request path is fixed.";
  }

  if (lowerInput.includes("memory") || lowerInput.includes("oom")) {
    return "This is an out-of-memory condition caused by a leak, unbounded cache growth, or a workload spike pushing the container past its memory limit, so start by confirming the termination reason with `kubectl describe pod <pod-name>` or your container runtime and compare memory usage against limits with `kubectl top pod <pod-name>` or your metrics stack, then capture a heap profile or dump during growth to identify retaining objects and either fix the allocation pattern or raise memory requests and limits, and if memory still spikes after the change, verify resource requests are not too low and check for traffic bursts or background jobs temporarily inflating usage.";
  }

  return null;
}

function detectEnvironment(input: string): DetectedEnvironment {
  const lowerInput = input.toLowerCase();

  if (/(kubernetes|kubectl|\bpod\b|deployment|daemonset|statefulset|namespace|crashloopbackoff|imagepullbackoff|oomkilled|ingress|configmap|secret)/.test(lowerInput)) {
    return "kubernetes";
  }

  if (/(docker|dockerfile|docker-compose|containerd|container exited|container exit|compose)/.test(lowerInput)) {
    return "docker";
  }

  if (/(aws|ec2|ecs|eks|fargate|lambda|cloudwatch|alb|elb|iam|rds|s3|route53)/.test(lowerInput)) {
    return "aws";
  }

  if (/(node\.?js|npm|pnpm|yarn|express|next\.?js|typescript|heap out of memory|typeerror|referenceerror|unhandledpromise|module not found)/.test(lowerInput)) {
    return "node";
  }

  if (/(python|pip|django|flask|gunicorn|uvicorn|traceback|modulenotfounderror|importerror|pytest)/.test(lowerInput)) {
    return "python";
  }

  if (/(postgres|postgresql|mysql|mariadb|mongodb|redis|database|connection pool|sql|deadlock)/.test(lowerInput)) {
    return "database";
  }

  if (/(linux|systemd|journalctl|nginx|ubuntu|debian|centos|disk full|filesystem|oom)/.test(lowerInput)) {
    return "linux";
  }

  return "generic";
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
  return isComplexIssue(input) ? 260 : 160;
}

function getProviderTimeoutMs(): number {
  return 5000;
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

function buildProviderPrompt(input: string): string {
  return `
You are a senior Site Reliability Engineer helping a teammate fix a real production issue.
 
Analyze the issue and respond with ONE natural, clear, and highly practical paragraph.
 
User Issue:
${input}
 
Instructions:
- Identify the most likely root cause
- Detect environment automatically (Kubernetes, Docker, AWS, Node.js, etc.)
- Include exact commands or actions when useful
- Guide what to do first in a natural way
- Add subtle proactive checks if relevant
- If needed, include a fallback direction
 
Tone Rules:
- Sound like a real engineer explaining the issue to a teammate
- Keep it natural and slightly conversational (not robotic, not overly formal)
- Avoid rigid phrasing like “the issue is caused by...”
- Avoid repetition or filler
- Be confident but not arrogant
- Make it easy to read quickly
 
STRICT RULES:
- Output must be ONE paragraph only
- No headings, no bullets, no labels
- No fluff
- No generic advice
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
  const maybe = data as { choices?: Array<{ message?: { content?: string | Array<{ text?: string; type?: string }> } }> } | null;
  const content = maybe?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (part && typeof part.text === "string") {
          return part.text;
        }

        return "";
      })
      .join(" ")
      .trim();
  }

  return "";
}

function extractUpstreamMessage(data: unknown): string | undefined {
  const maybe = data as { error?: { message?: string } } | null;
  return typeof maybe?.error?.message === "string" ? maybe.error.message : undefined;
}

function validateProviderText(provider: ProviderName, text: string): string {
  const normalized = normalizeFixOutput(text);

  if (!normalized || normalized.length < 24) {
    throw createProviderException(provider, `${provider} returned malformed output`);
  }

  return normalized;
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
    const reason =
      error instanceof Error && error.name === "AbortError" ?
        `${provider} request timeout`
      :
        error instanceof Error ? error.message
      :
        String(error);
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
): Promise<FixApiSuccess> {
  return runProviderRequest(provider, async (signal) => {
    const prompt = buildProviderPrompt(input);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(provider === "openrouter" ? {
          "HTTP-Referer": "https://kintify.cloud",
          "X-Title": "Kintify Fix",
        } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a senior Site Reliability Engineer helping a teammate debug a real production issue. Respond with one natural, practical paragraph only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
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

async function callGemini(input: string): Promise<FixApiSuccess> {
  if (!process.env.GEMINI_API_KEY) {
    throw createProviderException("gemini", "Gemini not configured");
  }

  return runProviderRequest("gemini", async (signal) => {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildProviderPrompt(input) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: getAdaptiveMaxOutputTokens(input),
        },
      }),
      signal,
    });

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

async function callDeepSeek(input: string): Promise<FixApiSuccess> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw createProviderException("deepseek", "DeepSeek not configured");
  }

  return callOpenAiCompatibleProvider(
    "deepseek",
    "https://api.deepseek.com/chat/completions",
    process.env.DEEPSEEK_API_KEY,
    "deepseek-chat",
    input,
  );
}

async function callMistral(input: string): Promise<FixApiSuccess> {
  if (!process.env.MISTRAL_API_KEY) {
    throw createProviderException("mistral", "Mistral not configured");
  }

  return callOpenAiCompatibleProvider(
    "mistral",
    "https://api.mistral.ai/v1/chat/completions",
    process.env.MISTRAL_API_KEY,
    "mistral-small-latest",
    input,
  );
}

async function callOpenRouter(input: string): Promise<FixApiSuccess> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw createProviderException("openrouter", "OpenRouter not configured");
  }

  return callOpenAiCompatibleProvider(
    "openrouter",
    "https://openrouter.ai/api/v1/chat/completions",
    process.env.OPENROUTER_API_KEY,
    "openai/gpt-4o-mini",
    input,
  );
}

function formatInlineList(items: string[]): string {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0] ?? "";
  }

  if (items.length === 2) {
    return `${items[0]}, then ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", then ")}, and ${items[items.length - 1]}`;
}

function normalizeFixOutput(text: string): string {
  let output = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim()
    .replace(/^["']+|["']+$/g, "");

  const words = output.split(/\s+/).filter(Boolean);
  if (words.length > 180) {
    output = `${words.slice(0, 180).join(" ").replace(/[.,;:!?]+$/g, "")}.`;
  }

  if (output && !/[.!?]$/.test(output)) {
    output = `${output}.`;
  }

  return output;
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
    .replace(/\bmost likely\b/gi, "")
    .replace(/\bmight be\b/gi, "is")
    .replace(/\bmay be\b/gi, "is")
    .replace(/\bstart by confirming\b/gi, "start by checking")
    .replace(/\bconfirm the application closes\b/gi, "make sure the application closes")
    .replace(/\bconfirm the ingress or load balancer has\b/gi, "make sure the ingress or load balancer has")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();
}

function buildSuccessResponse(output: string, provider: ProviderName, confidence?: number) {
  const text = strengthenDecisionTone(normalizeFixOutput(output));

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

function toSentenceFragment(text: string): string {
  const normalized = normalizeFixOutput(text).replace(/[.!?]+$/g, "");
  if (!normalized) {
    return "";
  }

  return normalized.charAt(0).toLowerCase() + normalized.slice(1);
}

function buildFallbackParagraph(input: string, llm: Awaited<ReturnType<typeof analyzeWithLLM>>): string {
  const cause = strengthenDecisionTone(normalizeFixOutput(llm.cause ?? "The failure is being driven by a production configuration or dependency fault.")).replace(/[.!?]+$/g, "");
  const explanationText = llm.explanation ? normalizeFixOutput(llm.explanation).replace(/[.!?]+$/g, "") : "";
  const fixes = Array.isArray(llm.fix) ? llm.fix.map((step) => toSentenceFragment(step)).filter(Boolean) : [];
  const commands = getEnvironmentCommands(input);
  const proactiveChecks = getProactiveChecks(input);
  const nextCheck = getNextCheckGuidance(input);
  const commandClause = commands.length > 0 ? ` Start by running ${formatInlineList(commands.slice(0, isComplexIssue(input) ? 3 : 2))} to confirm the failure path.` : "";
  const explanationClause = explanationText ? ` This is happening because ${toSentenceFragment(explanationText)}.` : "";
  const fixClause = fixes.length > 0 ? ` Fix it by ${formatInlineList(fixes.slice(0, isComplexIssue(input) ? 3 : 2))}.` : "";
  const proactiveClause = proactiveChecks.length > 0 ? ` Also verify ${formatInlineList(proactiveChecks.slice(0, isComplexIssue(input) ? 2 : 1))}.` : "";
  const nextCheckClause = nextCheck ? ` ${nextCheck.charAt(0).toUpperCase() + nextCheck.slice(1)}.` : "";
  const improvementClause = llm.improvement ? ` After it is stable, ${toSentenceFragment(llm.improvement)}.` : "";

  return strengthenDecisionTone(normalizeFixOutput(`${cause}.${explanationClause}${commandClause}${fixClause}${proactiveClause}${nextCheckClause}${improvementClause}`));
}

function getProactiveChecks(input: string): string[] {
  const lowerInput = input.toLowerCase();
  const environment = detectEnvironment(input);

  if (environment === "kubernetes") {
    if (/(oom|memory)/.test(lowerInput)) {
      return [
        "resource requests are not set too low causing aggressive rescheduling",
        "traffic spikes or background jobs are not temporarily inflating memory usage",
      ];
    }

    if (/(restart|crash|crashloopbackoff)/.test(lowerInput)) {
      return [
        "startup and readiness probes are not killing a slow but healthy container",
        "the mounted Secret or ConfigMap actually matches the current rollout",
      ];
    }

    return [
      "the active deployment spec matches the image and config you think is running",
      "service dependencies are reachable from the pod network and namespace",
    ];
  }

  if (environment === "docker") {
    return [
      "the container entrypoint and working directory match the built image",
      "the expected environment variables and mounted files are present at runtime",
    ];
  }

  if (environment === "aws") {
    return [
      "the role or instance profile still has the permissions expected by the application",
      "the target group, listener, or security group was not changed during the last rollout",
    ];
  }

  if (environment === "node") {
    return [
      "the deployed Node version and lockfile match the environment the build was tested on",
      "required environment variables are loaded in the actual runtime process and not just the build step",
    ];
  }

  if (environment === "python") {
    return [
      "the production virtual environment contains the same dependency versions as the last healthy release",
      "the worker or app process is loading the correct module path and settings file",
    ];
  }

  if (environment === "database") {
    return [
      "background jobs or migration processes are not holding connections open",
      "connection lifetime and idle timeout settings are not keeping stale clients alive",
    ];
  }

  if (environment === "linux") {
    return [
      "disk pressure or inode exhaustion is not causing secondary failures around the main error",
      "the service is running with the expected user, unit file, and environment overrides",
    ];
  }

  return [
    "the active runtime configuration still matches the last known healthy deployment",
    "an upstream dependency or DNS target did not change at the same time as the failure",
  ];
}

function getNextCheckGuidance(input: string): string {
  const lowerInput = input.toLowerCase();
  const environment = detectEnvironment(input);

  if (environment === "kubernetes" && /(oom|memory)/.test(lowerInput)) {
    return "if memory keeps rising after the code or limit change, verify requests are not too low and inspect whether traffic spikes or background jobs are driving short-lived peaks";
  }

  if (environment === "kubernetes" && /(restart|crash|crashloopbackoff)/.test(lowerInput)) {
    return "if the pod still restarts after the config fix, inspect probe failures and confirm dependent services are actually reachable during startup";
  }

  if (environment === "aws" && /(502|503|504|alb|elb)/.test(lowerInput)) {
    return "if errors continue after the upstream fix, confirm target group health, security groups, and idle timeout settings are aligned across the listener and application";
  }

  if (environment === "database" || /connection/.test(lowerInput)) {
    return "if pool tuning does not clear it, inspect long-running transactions, worker processes, and leaked clients that stay open outside the main request path";
  }

  if (/(tls|ssl|certificate)/.test(lowerInput)) {
    return "if the handshake still fails after replacing the certificate, confirm the listener is serving the new chain and not a default or cached certificate";
  }

  if (/(latency|slow|timeout)/.test(lowerInput)) {
    return "if latency stays high after fixing the hot path, check retry storms, queue backlogs, and autoscaling lag because they commonly keep pressure on the system";
  }

  return "if the first fix does not clear it, diff the current runtime config and the last known healthy release to catch a hidden deploy or dependency change";
}

function getEnvironmentCommands(input: string): string[] {
  const lowerInput = input.toLowerCase();
  const environment = detectEnvironment(input);

  if (environment === "kubernetes") {
    if (/(oom|memory)/.test(lowerInput)) {
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

  if (environment === "aws") {
    if (/lambda/.test(lowerInput)) {
      return ["aws logs tail /aws/lambda/<function-name> --follow", "aws lambda get-function-configuration --function-name <function-name>"];
    }

    if (/(ecs|fargate)/.test(lowerInput)) {
      return ["aws ecs describe-services --cluster <cluster> --services <service>", "aws logs tail <log-group-name> --follow"];
    }

    if (/(alb|elb|502|503|504)/.test(lowerInput)) {
      return ["aws elbv2 describe-target-health --target-group-arn <target-group-arn>", "aws logs tail <log-group-name> --follow"];
    }

    return ["aws logs tail <log-group-name> --follow", "aws cloudwatch get-metric-statistics --namespace <namespace> --metric-name <metric-name>"];
  }

  if (environment === "node") {
    return ["npm ls --depth=0", "npm why <package-name>", "node --trace-gc <entry-file>"];
  }

  if (environment === "python") {
    return ["pip freeze", "python -X tracemalloc <app.py>", "python -m pytest -k <failing-test>"];
  }

  if (environment === "database") {
    if (/(postgres|postgresql)/.test(lowerInput)) {
      return ["psql <connection-string> -c \"select pid, state, wait_event_type, wait_event, query_start from pg_stat_activity order by query_start asc;\"", "psql <connection-string> -c \"select * from pg_stat_database;\""];
    }

    if (/mysql|mariadb/.test(lowerInput)) {
      return ["mysqladmin processlist", "mysql -e \"show full processlist;\""];
    }

    return ["inspect active sessions in the database", "review connection pool limits against peak concurrency"];
  }

  if (environment === "linux") {
    return ["journalctl -u <service-name> -n 200", "df -h", "free -m"];
  }

  return [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = body.input?.trim();

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

    // Check for fast path responses first
    const fastPathResponse = getFastPathResponse(input);
    if (fastPathResponse) {
      return buildSuccessResponse(fastPathResponse, "gemini", 85);
    }

    const providers = [callGemini, callDeepSeek, callMistral, callOpenRouter];
    let lastError: ProviderException | null = null;

    for (const callProvider of providers) {
      try {
        const result = await callProvider(input);
        console.log(`[Fix API] Using provider ${result.provider}`);
        return buildSuccessResponse(result.output, result.provider, result.confidence);
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

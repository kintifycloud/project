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

function validateProviderText(provider: ProviderName, text: string): string {
  const normalized = strengthenDecisionTone(normalizeFixOutput(text));

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
): Promise<FixApiSuccess> {
  return runProviderRequest(provider, async (signal) => {
    const prompt = buildProviderPrompt(input);
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
              parts: [{ text: buildProviderPrompt(input) }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
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

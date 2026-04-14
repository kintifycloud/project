import type { IssueClassification } from "@/lib/classifier";
import { buildFixPrompt, type FixThreadContext } from "@/lib/fixPrompt";
import { normalizeDecision, serializeDecision, toStrictDecision, type FixDecision } from "@/lib/normalize";
import { assertHighQuality } from "@/lib/qualityCheck";

export type ProviderName = "gemini" | "deepseek" | "mistral" | "openrouter";

type RouteLlmInput = {
  input: string;
  classification: IssueClassification;
  threadContext?: FixThreadContext | null;
};

type RouteLlmResult = {
  provider: ProviderName;
  decision: FixDecision;
  raw: string;
};

type ProviderDefinition = {
  name: ProviderName;
  enabled: boolean;
  run: (prompt: { systemPrompt: string; userPrompt: string }, signal: AbortSignal) => Promise<string>;
};

const PROVIDER_TIMEOUT_MS = 4500;

function createTimeoutController() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  return {
    controller,
    clear: () => clearTimeout(timeoutId),
  };
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const raw = await response.text();

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
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

function extractGeminiText(data: unknown): string {
  const maybe = data as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  } | null;

  return maybe?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

function getProviderError(provider: ProviderName, response: Response, body: unknown): Error {
  const message =
    typeof body === "object" && body !== null && "error" in body
      ? String((body as { error?: { message?: string } | string }).error instanceof Object
          ? ((body as { error?: { message?: string } }).error?.message ?? `${provider} request failed`)
          : (body as { error?: string }).error)
      : `${provider} request failed`;

  return new Error(`${provider}:${response.status}:${message}`);
}

function buildProviders(): ProviderDefinition[] {
  return [
    {
      name: "gemini",
      enabled: Boolean(process.env.GEMINI_API_KEY),
      run: async ({ systemPrompt, userPrompt }, signal) => {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              contents: [
                {
                  role: "user",
                  parts: [{ text: userPrompt }],
                },
              ],
              generationConfig: {
                temperature: 0.15,
                maxOutputTokens: 400,
              },
            }),
            signal,
          },
        );

        const body = await parseJsonResponse(response);

        if (!response.ok) {
          throw getProviderError("gemini", response, body);
        }

        const text = extractGeminiText(body);

        if (!text) {
          throw new Error("gemini:empty_response");
        }

        return text;
      },
    },
    {
      name: "deepseek",
      enabled: Boolean(process.env.DEEPSEEK_API_KEY),
      run: async ({ systemPrompt, userPrompt }, signal) => {
        const response = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.15,
            max_tokens: 400,
          }),
          signal,
        });

        const body = await parseJsonResponse(response);

        if (!response.ok) {
          throw getProviderError("deepseek", response, body);
        }

        const text = extractChatCompletionText(body);

        if (!text) {
          throw new Error("deepseek:empty_response");
        }

        return text;
      },
    },
    {
      name: "mistral",
      enabled: Boolean(process.env.MISTRAL_API_KEY),
      run: async ({ systemPrompt, userPrompt }, signal) => {
        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: "mistral-small-latest",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.15,
            max_tokens: 400,
          }),
          signal,
        });

        const body = await parseJsonResponse(response);

        if (!response.ok) {
          throw getProviderError("mistral", response, body);
        }

        const text = extractChatCompletionText(body);

        if (!text) {
          throw new Error("mistral:empty_response");
        }

        return text;
      },
    },
    {
      name: "openrouter",
      enabled: Boolean(process.env.OPENROUTER_API_KEY),
      run: async ({ systemPrompt, userPrompt }, signal) => {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://kintify.cloud",
            "X-Title": "Kintify Fix",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.1,
            max_tokens: 400,
          }),
          signal,
        });

        const body = await parseJsonResponse(response);

        if (!response.ok) {
          throw getProviderError("openrouter", response, body);
        }

        const text = extractChatCompletionText(body);

        if (!text) {
          throw new Error("openrouter:empty_response");
        }

        return text;
      },
    },
  ];
}

export async function routeFixDecision({ input, classification, threadContext }: RouteLlmInput): Promise<RouteLlmResult> {
  const prompt = buildFixPrompt(threadContext ? {
    input,
    classification,
    threadContext,
  } : {
    input,
    classification,
  });
  const providers = buildProviders();
  let lastError: Error | null = null;

  for (const provider of providers) {
    if (!provider.enabled) {
      continue;
    }

    const timeout = createTimeoutController();

    try {
      const raw = await provider.run(prompt, timeout.controller.signal);
      const decision = assertHighQuality(toStrictDecision(normalizeDecision(raw)));

      return {
        provider: provider.name,
        decision,
        raw: serializeDecision(decision),
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    } finally {
      timeout.clear();
    }
  }

  throw lastError ?? new Error("No provider available");
}

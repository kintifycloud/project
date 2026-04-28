import type { IssueClassification } from "@/lib/classifier";
import { buildFixPrompt, type FixThreadContext } from "@/lib/fixPrompt";
import { type FixDecision, serializeDecision } from "@/lib/normalize";

export type ProviderName = "gemini" | "deepseek" | "mistral" | "openrouter" | "fallback";

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

const PROVIDER_TIMEOUT_MS = 2500; // 2.5 second timeout per model (STEP 5)

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

// STEP 1: Strict model order - Gemini → DeepSeek → Mistral → OpenRouter
const MODEL_ORDER: ProviderName[] = ["gemini", "deepseek", "mistral", "openrouter"];

// STEP 4: Generic phrases to reject
const GENERIC_PHRASES = [
  "try restarting",
  "have you tried",
  "maybe it's",
  "could be",
  "might be",
  "possibly",
  "perhaps",
  "check the logs",
  "google it",
  "search online",
  "contact support",
  "unknown error",
  "something went wrong",
];

// STEP 4: Validation function
function validateOutput(output: string): { valid: boolean; reason?: string } {
  const trimmed = output.trim();
  const lines = trimmed.split("\n").filter(line => line.trim().length > 0);
  
  // Check line count (2-3 lines)
  if (lines.length < 2 || lines.length > 3) {
    return { valid: false, reason: `Must be 2-3 lines, got ${lines.length}` };
  }
  
  // Check starts with "Likely"
  if (!trimmed.toLowerCase().startsWith("likely")) {
    return { valid: false, reason: "Must start with 'Likely'" };
  }
  
  // Check length (<300 chars)
  if (trimmed.length > 300) {
    return { valid: false, reason: `Too long (${trimmed.length} chars, max 300)` };
  }
  
  // Check for generic phrases
  const lowerOutput = trimmed.toLowerCase();
  for (const phrase of GENERIC_PHRASES) {
    if (lowerOutput.includes(phrase)) {
      return { valid: false, reason: `Contains generic phrase: "${phrase}"` };
    }
  }
  
  return { valid: true };
}

// STEP 6: Normalization function
function normalizeOutput(output: string): string {
  let normalized = output.trim();
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, " ");
  
  // Split into lines and enforce 3-line max
  const words = normalized.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  
  for (const word of words) {
    if (currentLine.length + word.length > 100) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? " " : "") + word;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  // Enforce 3-line max
  const finalLines = lines.slice(0, 3);
  
  return finalLines.join("\n");
}

// STEP 7: Final cleanup function
function cleanupOutput(output: string): string {
  let cleaned = output;
  
  // Remove markdown
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");
  cleaned = cleaned.replace(/`{3}[\w]*\n?/g, "");
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");
  
  // Remove bullets
  cleaned = cleaned.replace(/^[\s]*[-•*·]\s*/gm, "");
  cleaned = cleaned.replace(/^[\s]*\d+[.)]\s*/gm, "");
  
  // Remove bold/italic
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/__([^_]+)__/g, "$1");
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1");
  cleaned = cleaned.replace(/_([^_]+)_/g, "$1");
  
  // Remove headers
  cleaned = cleaned.replace(/#{1,6}\s*/g, "");
  
  // Remove links
  cleaned = cleaned.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  
  // Normalize whitespace
  cleaned = cleaned.replace(/[ \t]+/g, " ");
  cleaned = cleaned.trim();
  
  return cleaned;
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
  
  // STEP 1: Build providers in strict order
  const allProviders = buildProviders();
  const providerMap = new Map(allProviders.map(p => [p.name, p]));
  
  // STEP 3: Try each model in order with validation
  const startTime = Date.now();
  let fallbackCount = 0;
  let lastError: Error | null = null;
  
  for (const modelName of MODEL_ORDER) {
    const provider = providerMap.get(modelName);
    if (!provider || !provider.enabled) {
      console.log(`[Router] ${modelName} not enabled, skipping`);
      continue;
    }
    
    const modelStartTime = Date.now();
    const timeout = createTimeoutController();
    
    try {
      console.log(`[Router] Trying ${modelName}...`);
      
      // Call model
      const raw = await provider.run(prompt, timeout.controller.signal);
      
      // STEP 6: Normalize output
      const normalized = normalizeOutput(raw);
      
      // STEP 7: Final cleanup
      const cleaned = cleanupOutput(normalized);
      
      // STEP 4: Validate output
      const validation = validateOutput(cleaned);
      if (!validation.valid) {
        console.log(`[Router] ${modelName} output invalid: ${validation.reason}`);
        fallbackCount++;
        lastError = new Error(`${modelName}:validation_failed:${validation.reason}`);
        timeout.clear();
        continue;
      }
      
      // Valid output - convert to decision format (plain text now)
      // For new format, we create a minimal decision object
      const decision: FixDecision = {
        action: cleaned,
        confidence: "85", // Default confidence for valid new format
        blastRadius: "unknown", // Will be inferred by normalize
        safety: "Preserve current state before changes",
      };
      
      const latency = Date.now() - modelStartTime;
      
      // STEP 8: Log success
      console.log(`[Router] ${modelName} succeeded in ${latency}ms${fallbackCount > 0 ? ` (after ${fallbackCount} fallbacks)` : ''}`);
      
      return {
        provider: modelName,
        decision,
        raw: cleaned, // Return plain text directly
      };
    } catch (error) {
      const modelLatency = Date.now() - modelStartTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`[Router] ${modelName} failed in ${modelLatency}ms: ${errorMessage}`);
      fallbackCount++;
      lastError = error instanceof Error ? error : new Error(String(error));
    } finally {
      timeout.clear();
    }
  }
  
  // STEP 10: All models failed - return fallback message
  const totalLatency = Date.now() - startTime;
  console.error(`[Router] All models failed after ${totalLatency}ms`, lastError);
  const fallbackDecision: FixDecision = {
    action: "Likely unclear issue. Check logs and recent changes to isolate failure.",
    confidence: "50",
    blastRadius: "unknown",
    safety: "Document current state before making changes.",
  };
  return {
    provider: "fallback",
    decision: fallbackDecision,
    raw: serializeDecision(fallbackDecision),
  };
}

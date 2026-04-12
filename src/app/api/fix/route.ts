import { analyzeWithLLM } from "@/lib/analyzer";

type FixApiSuccess = {
  success: true;
  answer: string;
  confidence: number;
  provider: "gemini" | "openrouter";
};

type FixApiError = {
  success: false;
  error: string;
  provider?: "gemini" | "openrouter";
  upstreamStatus?: number;
};

function parseGeminiStructured(text: string): Omit<FixApiSuccess, "success" | "provider"> {
  // Extract answer before confidence line
  const answerText = text.split("Confidence:")[0]?.trim() ?? "";
  let answer = answerText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .join("\n\n");

  // Post-process to trim repetition and filler
  answer = answer
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\.+/g, ".") // Remove multiple periods
    .replace(/\s+\./g, ".") // Remove spaces before periods
    .replace(/\.\s*\./g, ".") // Remove consecutive periods
    .replace(/\b(the|a|an)\s+/gi, " ") // Remove common filler words (optional, keep minimal)
    .replace(/\b(in order to|in order for)\b/gi, "to") // Simplify phrases
    .replace(/\b(due to the fact that)\b/gi, "because") // Simplify phrases
    .replace(/\b(at this point in time)\b/gi, "now") // Simplify phrases
    .replace(/\b(in the event that)\b/gi, "if") // Simplify phrases
    .replace(/\b(it is important to note that)\b/gi, "") // Remove filler
    .replace(/\b(it should be noted that)\b/gi, "") // Remove filler
    .replace(/\b(please note that)\b/gi, "") // Remove filler
    .replace(/\b(additionally|furthermore|moreover)\b/gi, "") // Remove filler transitions
    .replace(/\b(in addition|also|as well)\b/gi, "") // Remove filler transitions
    .trim();

  // Limit to reasonable length (approx 3-4 sentences)
  const sentences = answer.split(". ").filter(Boolean);
  if (sentences.length > 4) {
    answer = sentences.slice(0, 4).join(". ") + ".";
  }

  const confidenceRaw = text.split("Confidence:")[1]?.trim() ?? "";
  let confidence = Number.parseInt(confidenceRaw, 10);
  if (!Number.isFinite(confidence)) confidence = 0;

  return {
    answer,
    confidence,
  };
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

    if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return Response.json({
        success: false,
        error: "Server is not configured",
      } satisfies FixApiError, { status: 500 });
    }

    const prompt = `
You are a senior Site Reliability Engineer and cloud infrastructure expert.

Analyze the following issue:

${input}

Provide a concise answer in 2 to 4 short sentences that:
- explains the root cause clearly
- recommends the most important fix action
- describes the likely expected result

Return EXACTLY in this format:

<Your concise 2-4 sentence answer>

Confidence:
<number between 70–95>

Rules:
- Maximum 2 to 4 sentences total
- Practical diagnosis only
- Most important fix action
- Likely expected result
- No long explanations
- No theory
- No repetition
- No filler
- Senior engineer tone: calm, confident
- Write as if speaking directly to a colleague who needs quick guidance
`;

    const tryGemini = async (): Promise<FixApiSuccess> => {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini not configured");
      }

      // Use only current, supported models
      const modelIds = [
        "gemini-2.5-flash", // Primary recommended model
        "gemini-2.0-flash-lite", // Fallback
      ];

      // Prioritize v1beta endpoint for latest model support
      const apiVersions = ["v1beta", "v1"];

      let lastError: FixApiError | null = null;

      for (const modelId of modelIds) {
        for (const apiVersion of apiVersions) {
          const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelId}:generateContent?key=${process.env.GEMINI_API_KEY}`;

          // Debug logging
          console.log(`[Gemini Debug] Attempting model: ${modelId}, version: ${apiVersion}, endpoint: ${endpoint}`);

          let res: Response;
          try {
            res = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [{ text: prompt }],
                  },
                ],
              }),
            });
          } catch (fetchErr) {
            console.log(`[Gemini Debug] Fetch error for ${modelId}/${apiVersion}:`, fetchErr instanceof Error ? fetchErr.message : String(fetchErr));
            lastError = {
              success: false,
              provider: "gemini",
              error: "Network error connecting to Gemini API",
              upstreamStatus: 0,
            };
            continue;
          }

          const raw = await res.text();
          console.log(`[Gemini Debug] Response status: ${res.status} for ${modelId}/${apiVersion}`);

          const data = (() => {
            try {
              return JSON.parse(raw);
            } catch {
              console.log(`[Gemini Debug] Failed to parse response as JSON for ${modelId}/${apiVersion}`);
              return null;
            }
          })();

          // Debug log error details if present
          if (data?.error) {
            console.log(`[Gemini Debug] API error for ${modelId}/${apiVersion}:`, data.error);
          }

          const text: string =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ?
              String(data.candidates[0].content.parts[0].text)
            :
              "";

          if (!res.ok || !text) {
            const upstreamMessage =
              typeof data?.error?.message === "string" ? data.error.message : undefined;

            // Handle specific error cases
            let errorMessage = "Failed to analyze issue. Please try again.";
            if (upstreamMessage) {
              if (upstreamMessage.includes("API key")) {
                errorMessage = "Invalid API key configuration";
              } else if (upstreamMessage.includes("quota") || upstreamMessage.includes("rate limit")) {
                errorMessage = "API rate limit exceeded";
              } else if (upstreamMessage.includes("timeout")) {
                errorMessage = "Request timeout";
              } else {
                errorMessage = `Gemini error: ${upstreamMessage}`;
              }
            }

            lastError = {
              success: false,
              provider: "gemini",
              error: errorMessage,
              upstreamStatus: res.status,
            };
            continue;
          }

          console.log(`[Gemini Debug] Successfully generated response from ${modelId}/${apiVersion}`);
          const parsed = parseGeminiStructured(text);
          return {
            success: true,
            provider: "gemini",
            ...parsed,
          };
        }
      }

      return Promise.reject(
        lastError ??
          ({
            success: false,
            provider: "gemini",
            error: "Unable to analyze issue right now.",
          } satisfies FixApiError),
      );
    };

    const tryOpenRouter = async (): Promise<FixApiSuccess> => {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OpenRouter not configured");
      }

      const llm = await analyzeWithLLM(input);

      if (
        llm.cause === "Analysis unavailable" ||
        llm.explanation === "Unable to analyze due to API or parsing error. Please try again."
      ) {
        return Promise.reject({
          success: false,
          provider: "openrouter",
          error:
            "OpenRouter analysis failed (check OPENROUTER_API_KEY, network, or model availability).",
        } satisfies FixApiError);
      }

      return {
        success: true,
        provider: "openrouter",
        answer: `${llm.cause ?? "Unable to determine the cause from available data."} ${Array.isArray(llm.fix) ? llm.fix.join(" ") : "Review system logs and check resource utilization."} ${llm.improvement ?? llm.explanation ?? ""}`.trim(),
        confidence:
          typeof llm.confidence === "number" ?
            Math.max(0, Math.min(100, Math.round(llm.confidence)))
          :
            0,
      };
    };

    try {
      const result = await tryGemini();
      return Response.json(result);
    } catch (geminiErr) {
      try {
        const result = await tryOpenRouter();
        return Response.json(result);
      } catch {
        const maybe = geminiErr as Partial<FixApiError> | undefined;
        const payload: FixApiError = {
          success: false,
          error: maybe?.error ?? "Failed to analyze issue. Please try again.",
          ...(maybe?.provider ? { provider: maybe.provider } : {}),
          ...(typeof maybe?.upstreamStatus === "number" ? { upstreamStatus: maybe.upstreamStatus } : {}),
        };

        return Response.json(payload, { status: 502 });
      }
    }
  } catch {
    return Response.json({
      success: false,
      error: "Failed to analyze issue. Please try again.",
    }, { status: 500 });
  }
}

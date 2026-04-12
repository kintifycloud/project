import { analyzeWithLLM } from "@/lib/analyzer";

type FixApiSuccess = {
  success: true;
  deepPatternReasoning: string;
  ethicalLogicalIntelligence: string;
  strategicDecisionEngine: string[];
  predictiveModeling: string;
  efficiencyOptimization: string;
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
  const deepPatternReasoning = text.split("Deep Pattern Reasoning:")[1]?.split("Ethical + Logical Intelligence:")[0]?.trim() ?? "";

  const ethicalLogicalIntelligence = text.split("Ethical + Logical Intelligence:")[1]?.split("Strategic Decision Engine:")[0]?.trim() ?? "";

  const strategicDecisionEngineRaw = text.split("Strategic Decision Engine:")[1]?.split("Predictive Modeling:")[0] ?? "";
  const strategicDecisionEngine = strategicDecisionEngineRaw
    .split("\n")
    .map((line) => line.replace(/^[-*\u2022\s]+\d*\.?\s*/, "").trim())
    .filter(Boolean);

  const predictiveModeling = text.split("Predictive Modeling:")[1]?.split("Efficiency Optimization:")[0]?.trim() ?? "";

  const efficiencyOptimization = text.split("Efficiency Optimization:")[1]?.split("Confidence:")[0]?.trim() ?? "";

  const confidenceRaw = text.split("Confidence:")[1]?.trim() ?? "";
  let confidence = Number.parseInt(confidenceRaw, 10);
  if (!Number.isFinite(confidence)) confidence = 0;

  return {
    deepPatternReasoning,
    ethicalLogicalIntelligence,
    strategicDecisionEngine,
    predictiveModeling,
    efficiencyOptimization,
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

Return EXACTLY in this format:

Deep Pattern Reasoning:
Identify likely hidden issue patterns, infer root technical causes, and explain why this happened.

Ethical + Logical Intelligence:
Avoid overclaiming. Clearly distinguish confirmed findings from likely assumptions. Provide technically honest reasoning.

Strategic Decision Engine:
Recommend exact next actions, best fix order, and highest impact first.

Predictive Modeling:
Estimate likely impact if unresolved, probable future failures, and system risk trends.

Efficiency Optimization:
Suggest ways to prevent recurrence, performance improvements, and trust/infra hardening tips.

Confidence:
<number between 70–95>

Rules:
- concise but valuable
- highly readable
- technically credible
- no fluff
- no robotic repetition
- no huge paragraphs
- premium tone: calm confidence, trustworthy
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
        deepPatternReasoning: llm.cause ?? "Unable to determine pattern reasoning from fallback analysis.",
        ethicalLogicalIntelligence: "Analysis based on available data. Some assumptions may be made due to limited context.",
        strategicDecisionEngine: Array.isArray(llm.fix) ? llm.fix : ["Review system logs", "Check resource utilization", "Verify configuration"],
        predictiveModeling: llm.improvement ?? llm.explanation ?? "Unable to predict future impact without additional context.",
        efficiencyOptimization: "Monitor system metrics and implement automated alerting for early detection.",
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

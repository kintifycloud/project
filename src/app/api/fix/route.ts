import { analyzeWithLLM } from "@/lib/analyzer";

type FixApiSuccess = {
  success: true;
  rootCause: string;
  fixPlan: string[];
  expectedOutcome: string;
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
  const rootCause = text.split("Root Cause:")[1]?.split("Fix Plan:")[0]?.trim() ?? "";

  const fixPlanRaw = text.split("Fix Plan:")[1]?.split("Expected Outcome:")[0] ?? "";
  const fixPlan = fixPlanRaw
    .split("\n")
    .map((line) => line.replace(/^[-*\u2022\s]+/, "").trim())
    .filter(Boolean);

  const expectedOutcome =
    text.split("Expected Outcome:")[1]?.split("Confidence:")[0]?.trim() ?? "";

  const confidenceRaw = text.split("Confidence:")[1]?.trim() ?? "";
  let confidence = Number.parseInt(confidenceRaw, 10);
  if (!Number.isFinite(confidence)) confidence = 0;

  return {
    rootCause,
    fixPlan,
    expectedOutcome,
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
You are a senior Site Reliability Engineer.

Analyze the following issue:

${input}

Return EXACTLY in this format:

Root Cause:
<clear cause>

Fix Plan:
- step 1
- step 2
- step 3

Expected Outcome:
<result>

Confidence:
<number between 70–95>

Rules:
- concise
- actionable
- no fluff
- no empty sections
`;

    const tryGemini = async (): Promise<FixApiSuccess> => {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini not configured");
      }

      const modelIds = ["gemini-1.5-flash", "gemini-1.5-flash-latest"];

      let lastError: FixApiError | null = null;

      for (const modelId of modelIds) {
        const res = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/" +
            modelId +
            ":generateContent?key=" +
            process.env.GEMINI_API_KEY,
          {
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
          },
        );

        const raw = await res.text();
        const data = (() => {
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        })();

        const text: string =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ?
            String(data.candidates[0].content.parts[0].text)
          :
            "";

        if (!res.ok || !text) {
          const upstreamMessage =
            typeof data?.error?.message === "string" ? data.error.message : undefined;

          lastError = {
            success: false,
            provider: "gemini",
            error:
              upstreamMessage ?
                `Gemini error: ${upstreamMessage}`
              :
                "Failed to analyze issue. Please try again.",
            upstreamStatus: res.status,
          };
          continue;
        }

        const parsed = parseGeminiStructured(text);
        return {
          success: true,
          provider: "gemini",
          ...parsed,
        };
      }

      return Promise.reject(
        lastError ??
          ({
            success: false,
            provider: "gemini",
            error: "Failed to analyze issue. Please try again.",
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
        rootCause: llm.cause ?? "",
        fixPlan: Array.isArray(llm.fix) ? llm.fix : [],
        expectedOutcome: llm.improvement ?? llm.explanation ?? "",
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

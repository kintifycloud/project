import { NextRequest } from "next/server";

import { analyzeInput, analyzeWithLLM, type LlmAnalysisResult } from "@/lib/analyzer";
import { isKeyRateLimited, validateApiKey } from "@/lib/auth";
import { computeConfidence, getImpact, getImprovement } from "@/lib/perception";
import { isRateLimited } from "@/lib/rate-limit";
import { saveResult, slugify } from "@/lib/store";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    const isApiCall = Boolean(apiKey);

    /* -------------------------------------------------------------- */
    /*  Auth & rate-limit                                              */
    /* -------------------------------------------------------------- */

    if (isApiCall) {
      const auth = validateApiKey(apiKey);

      if (!auth.valid) {
        return Response.json(
          { error: auth.error },
          { status: 401, headers: NO_STORE },
        );
      }

      if (isKeyRateLimited(auth.meta.id, auth.meta.rateLimit)) {
        return Response.json(
          { error: "Rate limit exceeded. Max 60 requests per minute." },
          { status: 429, headers: { ...NO_STORE, "Retry-After": "60" } },
        );
      }
    } else {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

      if (isRateLimited(ip)) {
        return Response.json(
          { error: "Too many requests. Try again later." },
          { status: 429, headers: NO_STORE },
        );
      }
    }

    /* -------------------------------------------------------------- */
    /*  Validate input                                                 */
    /* -------------------------------------------------------------- */

    const body = (await request.json().catch(() => null)) as { input?: unknown } | null;
    const input = typeof body?.input === "string" ? body.input.trim() : "";

    if (input.length < 3) {
      return Response.json(
        { error: "Input too short. Provide more details." },
        { status: 400, headers: NO_STORE },
      );
    }

    /* -------------------------------------------------------------- */
    /*  Analyze — LLM first, fallback to mock                          */
    /* -------------------------------------------------------------- */

    const slug = slugify(input);
    let llmResult: LlmAnalysisResult | null = null;

    try {
      llmResult = await analyzeWithLLM(input);
    } catch {
      // LLM failed (timeout, parse error, API error) — fall through to mock
    }

    /* -------------------------------------------------------------- */
    /*  Build response                                                 */
    /* -------------------------------------------------------------- */

    if (llmResult) {
      // Save the base AnalysisResult for the slug page
      saveResult(slug, {
        category: llmResult.category,
        problem: llmResult.problem,
        cause: llmResult.cause,
        explanation: llmResult.explanation,
        fix: llmResult.fix,
        prevention: llmResult.prevention,
      });

      if (isApiCall) {
        return Response.json(
          {
            category: llmResult.category,
            problem: llmResult.problem,
            cause: llmResult.cause,
            explanation: llmResult.explanation,
            fix: llmResult.fix,
            prevention: llmResult.prevention,
            confidence: llmResult.confidence,
            impact: llmResult.impact,
            improvement: llmResult.improvement,
            slug,
          },
          { headers: NO_STORE },
        );
      }

      // UI flow
      return Response.json(
        { ...llmResult, slug },
        { headers: NO_STORE },
      );
    }

    // Fallback: mock analysis
    const result = analyzeInput(input);
    saveResult(slug, result);

    if (isApiCall) {
      const confidence = computeConfidence(result);
      const impact = getImpact(result.category);
      const improvement = getImprovement(result.category);

      return Response.json(
        {
          category: result.category,
          problem: result.problem,
          cause: result.cause,
          explanation: result.explanation,
          fix: result.fix,
          prevention: result.prevention,
          confidence,
          impact,
          improvement: improvement.value,
          slug,
        },
        { headers: NO_STORE },
      );
    }

    return Response.json(
      { ...result, slug },
      { headers: NO_STORE },
    );
  } catch {
    return Response.json(
      { error: "Analysis failed. Try again." },
      { status: 500, headers: NO_STORE },
    );
  }
}

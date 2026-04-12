import { analyzeWithLLM } from "@/lib/analyzer";

type HeroApiSuccess = {
  success: true;
  answer: string;
};

type HeroApiError = {
  success: false;
  error: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = body.input?.trim();

    if (!input) {
      return Response.json({
        success: false,
        error: "Input is required",
      } satisfies HeroApiError, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json({
        success: false,
        error: "Hero analysis not configured",
      } satisfies HeroApiError, { status: 500 });
    }

    const llm = await analyzeWithLLM(input);

    if (
      llm.cause === "Analysis unavailable" ||
      llm.explanation === "Unable to analyze due to API or parsing error. Please try again."
    ) {
      return Response.json({
        success: false,
        error: "Unable to analyze issue. Please try again.",
      } satisfies HeroApiError, { status: 502 });
    }

    // Convert LLM response to single clean answer
    const answer = `${llm.cause} ${Array.isArray(llm.fix) ? llm.fix.join(" ") : ""} ${llm.improvement ?? ""}`.trim();

    // Post-process to ensure concise output
    const conciseAnswer = answer
      .replace(/\s+/g, " ")
      .replace(/\.+/g, ".")
      .replace(/\s+\./g, ".")
      .replace(/\.\s*\./g, ".")
      .replace(/\b(in order to|in order for)\b/gi, "to")
      .replace(/\b(due to the fact that)\b/gi, "because")
      .replace(/\b(at this point in time)\b/gi, "now")
      .replace(/\b(in the event that)\b/gi, "if")
      .replace(/\b(it is important to note that)\b/gi, "")
      .replace(/\b(it should be noted that)\b/gi, "")
      .replace(/\b(please note that)\b/gi, "")
      .replace(/\b(additionally|furthermore|moreover)\b/gi, "")
      .replace(/\b(in addition|also|as well)\b/gi, "")
      .trim();

    // Limit to 2-4 sentences
    const sentences = conciseAnswer.split(". ").filter(Boolean);
    let finalAnswer = conciseAnswer;
    if (sentences.length > 4) {
      finalAnswer = sentences.slice(0, 4).join(". ") + ".";
    }

    return Response.json({
      success: true,
      answer: finalAnswer,
    } satisfies HeroApiSuccess);
  } catch {
    return Response.json({
      success: false,
      error: "Failed to analyze issue. Please try again.",
    } satisfies HeroApiError, { status: 500 });
  }
}

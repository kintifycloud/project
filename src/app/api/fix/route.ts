export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = body.input?.trim();

    if (!input) {
      return Response.json({
        success: false,
        error: "Input is required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({
        success: false,
        error: "Server is not configured",
      });
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

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
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

    const data = await res.json().catch(() => null);
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?
        String(data.candidates[0].content.parts[0].text)
      :
        "";

    if (!res.ok || !text) {
      return Response.json({
        success: false,
        error: "Failed to analyze issue. Please try again.",
      });
    }

    const rootCause = text.split("Root Cause:")[1]?.split("Fix Plan:")[0]?.trim();

    const fixPlanRaw = text.split("Fix Plan:")[1]?.split("Expected Outcome:")[0];
    const fixPlan = fixPlanRaw
      ?.split("\n")
      .map((line: string) => line.replace(/^[-*\u2022\s]+/, "").trim())
      .filter(Boolean);

    const expectedOutcome = text
      .split("Expected Outcome:")[1]
      ?.split("Confidence:")[0]
      ?.trim();

    const confidenceRaw = text.split("Confidence:")[1]?.trim();
    let confidence = Number.parseInt(confidenceRaw ?? "", 10);
    if (!Number.isFinite(confidence)) confidence = 0;

    return Response.json({
      success: true,
      rootCause: rootCause ?? "",
      fixPlan: fixPlan ?? [],
      expectedOutcome: expectedOutcome ?? "",
      confidence,
    });
  } catch {
    return Response.json({
      success: false,
      error: "Failed to analyze issue. Please try again.",
    });
  }
}

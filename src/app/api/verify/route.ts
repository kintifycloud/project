import { NextResponse } from "next/server";

import { openai } from "@/lib/llm";
import { buildVerifyPrompt, type VerifyResponse } from "@/lib/verifyPrompt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = (body?.action as string | undefined) || "";

    if (!action || action.trim().length === 0) {
      console.error("VERIFY API: Empty action received");
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    const cleanAction = action.slice(0, 2000);

    console.log("VERIFY API: Starting verification for action:", cleanAction.slice(0, 100));

    const prompt = buildVerifyPrompt(cleanAction);

    console.log("VERIFY API: Calling LLM for action verification");
    const res = await openai.chat.completions.create({
      model: "openchat/openchat-7b",
      messages: [
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const text = res.choices[0]?.message?.content || "";

    console.log("VERIFY API: LLM response received, parsing JSON");

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("VERIFY API: No JSON found in response");
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as VerifyResponse;

    // Validate response structure
    if (!parsed.riskLevel || !parsed.impact || typeof parsed.safeToExecute !== "boolean" || !parsed.precaution) {
      console.error("VERIFY API: Invalid response structure");
      return NextResponse.json({ error: "Invalid response structure" }, { status: 500 });
    }

    console.log("VERIFY API: Valid verify result, returning");
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("VERIFY API: Error:", error);
    return NextResponse.json({ error: "Could not verify action. Please try again." }, { status: 500 });
  }
}

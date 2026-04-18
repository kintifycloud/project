import { NextResponse } from "next/server";

import { openai } from "@/lib/llm";
import { buildGuaranteePrompt, type GuaranteeResponse } from "@/lib/guaranteePrompt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = (body?.action as string | undefined) || "";

    if (!action || action.trim().length === 0) {
      console.error("GUARANTEE API: Empty action received");
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    const cleanAction = action.slice(0, 2000);

    console.log("GUARANTEE API: Starting safety analysis for action:", cleanAction.slice(0, 100));

    const prompt = buildGuaranteePrompt(cleanAction);

    console.log("GUARANTEE API: Calling LLM for safety guarantee");
    const res = await openai.chat.completions.create({
      model: "openchat/openchat-7b",
      messages: [
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const text = res.choices[0]?.message?.content || "";

    console.log("GUARANTEE API: LLM response received, parsing JSON");

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("GUARANTEE API: No JSON found in response");
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as GuaranteeResponse;

    // Validate response structure
    if (!parsed.rollbackPlan || !parsed.failureImpact || !parsed.protectionLevel) {
      console.error("GUARANTEE API: Invalid response structure");
      return NextResponse.json({ error: "Invalid response structure" }, { status: 500 });
    }

    // Validate protection level
    if (!["basic", "safe", "strong"].includes(parsed.protectionLevel)) {
      console.error("GUARANTEE API: Invalid protection level");
      return NextResponse.json({ error: "Invalid protection level" }, { status: 500 });
    }

    console.log("GUARANTEE API: Valid guarantee result, returning");
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GUARANTEE API: Error:", error);
    return NextResponse.json({ error: "Could not analyze safety guarantee. Please try again." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { openai } from "@/lib/llm";
import { buildFlowPrompt, type FlowResponse } from "@/lib/flowPrompt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = (body?.action as string | undefined) || "";

    if (!action || action.trim().length === 0) {
      console.error("FLOW API: Empty action received");
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    const cleanAction = action.slice(0, 2000);

    console.log("FLOW API: Starting execution guidance for action:", cleanAction.slice(0, 100));

    const prompt = buildFlowPrompt(cleanAction);

    console.log("FLOW API: Calling LLM for execution guidance");
    const res = await openai.chat.completions.create({
      model: "openchat/openchat-7b",
      messages: [
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const text = res.choices[0]?.message?.content || "";

    console.log("FLOW API: LLM response received, parsing JSON");

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("FLOW API: No JSON found in response");
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as FlowResponse;

    // Validate response structure
    if (!Array.isArray(parsed.steps) || !Array.isArray(parsed.warnings) || !parsed.rollback) {
      console.error("FLOW API: Invalid response structure");
      return NextResponse.json({ error: "Invalid response structure" }, { status: 500 });
    }

    console.log("FLOW API: Valid flow result, returning");
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("FLOW API: Error:", error);
    return NextResponse.json({ error: "Could not generate execution steps. Please try again." }, { status: 500 });
  }
}

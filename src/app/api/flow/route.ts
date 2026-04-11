import { NextResponse } from "next/server";

import { openai } from "@/lib/llm";
import { clampConfidence, isFlowResult, safeParseJson } from "@/lib/flow";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = (body?.input as string | undefined) || "";

    if (!input || input.trim().length === 0) {
      console.error("FLOW API: Empty input received");
      return NextResponse.json({ error: "Input is required." }, { status: 400 });
    }

    const cleanInput = input.slice(0, 6000);

    console.log("FLOW API: Starting flow analysis for input:", cleanInput.slice(0, 100));

    const system =
      "You are a system behavior analyst. Convert system data into behavior flow, pattern, and risk.";

    const user = `Return ONLY valid JSON. No markdown. No extra text.

Required output format:
{
  "flow": ["string", "string", "string", "string", "string"],
  "pattern": "Reactive" | "Adaptive" | "Unstable" | "Bottlenecked",
  "risk": "low" | "medium" | "high",
  "insight": "string",
  "confidence": number
}

Constraints:
- flow: 4-6 concise behavior steps (e.g., Traffic spike, CPU increase, Memory pressure, Scaling delay, Errors)
- pattern: choose exactly one of Reactive / Adaptive / Unstable / Bottlenecked
- risk: choose exactly one of low / medium / high
- be concise and clear

System data/logs to analyze:
"""
${cleanInput}
"""`;

    console.log("FLOW API: Calling OpenRouter LLM");
    const res = await openai.chat.completions.create({
      model: "openchat/openchat-7b",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      max_tokens: 700,
    });

    const text = res.choices[0]?.message?.content || "";

    console.log("FLOW API: LLM response received, parsing JSON");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = safeParseJson(jsonMatch ? jsonMatch[0] : "");

    if (isFlowResult(parsed)) {
      console.log("FLOW API: Valid flow result, returning");
      return NextResponse.json({
        ...parsed,
        confidence: clampConfidence(parsed.confidence),
      });
    }

    console.error("FLOW API: Invalid response format from LLM");
    return NextResponse.json(
      {
        error: "Invalid response format",
        raw: text,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("FLOW API: Error:", error);
    return NextResponse.json({ error: "Could not analyze flow. Please try again." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { openai } from "@/lib/llm";
import { isLiveResult, safeParseJson } from "@/lib/live";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = (body?.input as string | undefined) || "";

    if (!input || input.trim().length === 0) {
      console.error("LIVE API: Empty input received");
      return NextResponse.json({ error: "Input is required." }, { status: 400 });
    }

    console.log("LIVE API: Starting live analysis for input:", input.slice(0, 100));

    const system =
      "You are a real-time system intelligence engine. Interpret system description and provide live insight.";

    const user = `Return ONLY valid JSON. No markdown. No extra text.

Required output format:
{
  "status": "Stable" | "At Risk" | "Degrading" | "Critical",
  "insight": "string",
  "risk": "low" | "medium" | "high"
}

Constraints:
- status: choose exactly one of Stable / At Risk / Degrading / Critical
- risk: choose exactly one of low / medium / high
- insight: 1-2 sentences explaining current state
- be concise and clear

System description to analyze:
${input}`;

    console.log("LIVE API: Calling OpenRouter LLM");
    const res = await openai.chat.completions.create({
      model: "openchat/openchat-7b",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      max_tokens: 400,
    });

    const text = res.choices[0]?.message?.content || "";

    console.log("LIVE API: LLM response received, parsing JSON");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = safeParseJson(jsonMatch ? jsonMatch[0] : "");

    if (isLiveResult(parsed)) {
      console.log("LIVE API: Valid live result, returning");
      return NextResponse.json(parsed);
    }

    console.error("LIVE API: Invalid response format from LLM");
    return NextResponse.json(
      {
        error: "Invalid response format",
        raw: text,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("LIVE API: Error:", error);
    return NextResponse.json({ error: "Could not generate insight. Please try again." }, { status: 500 });
  }
}

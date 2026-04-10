import { NextResponse } from "next/server";

import { openai } from "@/lib/llm";
import { clampConfidence, isTraceResult, safeParseJson } from "@/lib/trace";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = (body?.input as string | undefined) || "";

    if (!input || input.trim().length === 0) {
      return NextResponse.json({ error: "Input is required." }, { status: 400 });
    }

    const cleanInput = input.slice(0, 6000);

    const system =
      "You are a system debugging expert. Convert logs into a clear timeline, cause chain, and insight. Be concise. Focus on clarity.";

    const user = `Return ONLY valid JSON. No markdown. No extra text.

Required output format:
{
  "timeline": [
    { "time": "12:01", "event": "Service started" }
  ],
  "causeChain": ["Memory leak", "OOM kill", "Restart loop"],
  "insight": "string",
  "confidence": number
}

Convert these logs/issues into system understanding:
"""
${cleanInput}
"""`;

    const res = await openai.chat.completions.create({
      model: "openchat/openchat-7b",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      max_tokens: 900,
    });

    const text = res.choices[0]?.message?.content || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = safeParseJson(jsonMatch ? jsonMatch[0] : "");

    if (isTraceResult(parsed)) {
      return NextResponse.json({
        ...parsed,
        confidence: clampConfidence(parsed.confidence),
      });
    }

    return NextResponse.json(
      {
        error: "Invalid response format",
        raw: text,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Trace API error:", error);
    return NextResponse.json({ error: "Could not trace system. Please try again." }, { status: 500 });
  }
}

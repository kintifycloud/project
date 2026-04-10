import { NextResponse } from "next/server";

import { openai } from "@/lib/llm";
import { clampConfidence, isWhyResult, safeParseJson } from "@/lib/why";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = (body?.input as string | undefined) || "";

    if (!input || input.trim().length === 0) {
      return NextResponse.json({ error: "Input is required." }, { status: 400 });
    }

    const cleanInput = input.slice(0, 6000);

    const system =
      "You are a senior system architect. Explain WHY the issue occurred. Focus on causal reasoning, not surface symptoms.";

    const user = `Return ONLY valid JSON. No markdown. No extra text.

Required output format:
{
  "why": "string",
  "reason": "string",
  "insight": "string",
  "confidence": number
}

Constraints:
- why: 2-3 sentences max
- be concise and clear

Issue/logs:
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
      max_tokens: 700,
    });

    const text = res.choices[0]?.message?.content || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = safeParseJson(jsonMatch ? jsonMatch[0] : "");

    if (isWhyResult(parsed)) {
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
    console.error("Why API error:", error);
    return NextResponse.json({ error: "Could not explain why. Please try again." }, { status: 500 });
  }
}

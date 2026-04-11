import { NextResponse } from "next/server";

import { openai } from "@/lib/llm";
import { clampConfidence, isVerifyResult, safeParseJson } from "@/lib/verify";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = (body?.input as string | undefined) || "";

    if (!input || input.trim().length === 0) {
      console.error("VERIFY API: Empty input received");
      return NextResponse.json({ error: "Input is required." }, { status: 400 });
    }

    const cleanInput = input.slice(0, 6000);

    console.log("VERIFY API: Starting verification for input:", cleanInput.slice(0, 100));

    const system =
      "You are a system verification engine. Determine if a fix is successful based on signals. Return a clear verification result.";

    const user = `Return ONLY valid JSON. No markdown. No extra text.

Required output format:
{
  "status": "verified" | "unstable" | "failed",
  "result": "string",
  "signals": ["string"],
  "method": "string",
  "confidence": number
}

Constraints:
- status: choose exactly one of verified / unstable / failed
- signals: list 3-5 concise observations (e.g. service health, error rate, restart count, latency)
- be concise and clear

Fix description or system state to verify:
"""
${cleanInput}
"""`;

    console.log("VERIFY API: Calling OpenRouter LLM");
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

    console.log("VERIFY API: LLM response received, parsing JSON");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = safeParseJson(jsonMatch ? jsonMatch[0] : "");

    if (isVerifyResult(parsed)) {
      console.log("VERIFY API: Valid verify result, returning");
      return NextResponse.json({
        ...parsed,
        confidence: clampConfidence(parsed.confidence),
      });
    }

    console.error("VERIFY API: Invalid response format from LLM");
    return NextResponse.json(
      {
        error: "Invalid response format",
        raw: text,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("VERIFY API: Error:", error);
    return NextResponse.json({ error: "Could not verify system. Please try again." }, { status: 500 });
  }
}

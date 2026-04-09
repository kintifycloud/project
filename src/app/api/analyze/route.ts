import { analyzeWithLLM } from "@/lib/analyzer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = body.input || "";

    if (input.length < 3) {
      return NextResponse.json(
        { error: "Input too short. Provide more details." },
        { status: 400 },
      );
    }

    const result = await analyzeWithLLM(input);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Analysis failed. Try again." },
      { status: 500 },
    );
  }
}

import { analyzeWithLLM } from "@/lib/analyzer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = body.input || "";

    const result = await analyzeWithLLM(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fix API error:", error);
    return NextResponse.json({
      error: "Could not analyze issue. Try again.",
    }, { status: 500 });
  }
}

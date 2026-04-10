import { analyzeWithLLM, analyzeInput } from "@/lib/analyzer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = body.input || "";

    if (!input || input.trim().length === 0) {
      return NextResponse.json({
        error: "Input is required.",
      }, { status: 400 });
    }

    console.log("Starting analysis for input:", input.slice(0, 100));

    // Try LLM analysis first
    let result;
    try {
      result = await analyzeWithLLM(input);
      console.log("LLM analysis successful, category:", result.category);
    } catch (llmError) {
      console.error("LLM analysis failed, falling back to mock analyzer:", llmError);
      // Fallback to mock analyzer
      result = analyzeInput(input);
      console.log("Mock analysis used, category:", result.category);
    }

    // Return only AnalysisResult fields (strip LlmAnalysisResult extras)
    const analysisResult = {
      category: result.category,
      problem: result.problem,
      cause: result.cause,
      explanation: result.explanation,
      fix: result.fix,
      prevention: result.prevention,
    };

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Fix API error:", error);
    return NextResponse.json({
      error: "Could not analyze issue. Please try again.",
    }, { status: 500 });
  }
}

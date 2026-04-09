import { analyzeWithLLM } from "@/lib/analyzer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const input = body.input || ""

    const result = await analyzeWithLLM(input)

    return NextResponse.json(result)

  } catch {
    return NextResponse.json({
      error: "Could not analyze issue. Try again.",
    })
  }
}

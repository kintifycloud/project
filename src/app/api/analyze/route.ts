import { NextRequest } from "next/server";

import { analyzeInput } from "@/lib/analyzer";
import { isRateLimited } from "@/lib/rate-limit";
import { saveResult, slugify } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (isRateLimited(ip)) {
      return Response.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "Cache-Control": "no-store" } },
      );
    }

    const body = (await request.json().catch(() => null)) as { input?: unknown } | null;
    const input = typeof body?.input === "string" ? body.input.trim() : "";

    if (input.length < 3) {
      return Response.json(
        { error: "Input too short. Provide more details." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const result = analyzeInput(input);
    const slug = slugify(input);

    saveResult(slug, result);

    await new Promise((resolve) => setTimeout(resolve, 800));

    return Response.json(
      { ...result, slug },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Analysis failed. Try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

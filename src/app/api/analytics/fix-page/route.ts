import { NextResponse } from "next/server";

import { trackGeneratedIssueEvent } from "@/lib/queryStore";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { slug?: unknown; type?: unknown }
    | null;

  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const type = body?.type === "conversion" ? "conversion" : body?.type === "pageView" ? "pageView" : null;

  if (!slug || !type) {
    return NextResponse.json({ error: "Invalid analytics payload" }, { status: 400 });
  }

  await trackGeneratedIssueEvent(slug, type);
  return NextResponse.json({ ok: true });
}

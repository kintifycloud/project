import { NextRequest } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: unknown;
      result?: unknown;
    } | null;

    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!EMAIL_RE.test(email)) {
      return Response.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    if (!body?.result || typeof body.result !== "object") {
      return Response.json(
        { error: "Missing result data." },
        { status: 400 },
      );
    }

    // TODO: persist to database
    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Save failed. Try again." },
      { status: 500 },
    );
  }
}

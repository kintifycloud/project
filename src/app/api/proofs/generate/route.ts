import { NextRequest, NextResponse } from "next/server";

import { mockVerisigGenerator } from "@/lib/utils";

function safeHost(value: string | null) {
  if (!value) {
    return "kintify.cloud";
  }

  const host = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9.-]/g, "");

  return host || "kintify.cloud";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const host = safeHost(searchParams.get("host"));
  const claim = searchParams.get("claim")?.trim() || "instant cryptographic cloud trust";
  const region = searchParams.get("region")?.trim() || "global-edge";
  const proof = mockVerisigGenerator({ host, claim, region, issuer: "Kintify VeriKernel" });

  return NextResponse.json(
    {
      ok: true,
      proof,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

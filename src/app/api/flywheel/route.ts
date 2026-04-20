import { NextResponse } from "next/server";

import { generateIssuesFromQueries } from "@/lib/queryStore";

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.FLYWHEEL_TRIGGER_TOKEN;

  if (!expectedToken) {
    return true;
  }

  return authHeader === `Bearer ${expectedToken}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await generateIssuesFromQueries();
  return NextResponse.json({
    ok: true,
    generatedAt: summary.generatedAt,
    clusterCount: summary.clusters.length,
    generatedIssueCount: summary.generatedIssues.length,
    manualReview: summary.manualReview.map((issue) => ({
      slug: issue.slug,
      title: issue.title,
      queryCount: issue.queryCount,
      reviewStatus: issue.reviewStatus,
    })),
  });
}

export async function POST(request: Request) {
  return GET(request);
}

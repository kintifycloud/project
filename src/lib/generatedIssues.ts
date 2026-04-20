import type { Issue } from "@/lib/issues";

export type GeneratedIssue = Issue & {
  source: "generated";
  queryCount: number;
  queries: string[];
  reviewStatus: "pending" | "approved";
  generatedAt: number;
  pageViews: number;
  conversions: number;
};

export const generatedIssues: GeneratedIssue[] = [];

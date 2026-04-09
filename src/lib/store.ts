import type { AnalysisResult } from "@/lib/analyzer";

const store = new Map<string, AnalysisResult>();

export function saveResult(slug: string, data: AnalysisResult) {
  store.set(slug, data);
}

export function getResult(slug: string): AnalysisResult | undefined {
  return store.get(slug);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

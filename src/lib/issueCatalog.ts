import type { GeneratedIssue } from "@/lib/generatedIssues";
import {
  findIssueInCatalog,
  getCatalogIssueSlugs,
  getRelatedIssuesFromCatalog,
  type Issue,
} from "@/lib/issues";
import { getGeneratedIssues } from "@/lib/queryStore";

export async function getIssueCatalog() {
  const generatedIssues = await getGeneratedIssues();
  return {
    generatedIssues,
    allSlugs: getCatalogIssueSlugs(generatedIssues),
  };
}

export async function findCatalogIssue(
  slug: string,
): Promise<Issue | GeneratedIssue | undefined> {
  const generatedIssues = await getGeneratedIssues();
  return findIssueInCatalog(slug, generatedIssues);
}

export async function getCatalogRelatedIssues(
  issue: Issue | GeneratedIssue,
  limit = 4,
): Promise<Array<Issue | GeneratedIssue>> {
  const generatedIssues = await getGeneratedIssues();
  return getRelatedIssuesFromCatalog(issue, generatedIssues, limit);
}

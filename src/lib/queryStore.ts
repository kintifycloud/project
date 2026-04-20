import { promises as fs } from "node:fs";
import path from "node:path";

import { classifyIssue, isWeakFixInput } from "@/lib/classifier";
import {
  generatedIssues as generatedIssueSnapshot,
  type GeneratedIssue,
} from "@/lib/generatedIssues";

export type QueryItem = {
  text: string;
  createdAt: number;
  response?: string;
};

export type QueryCluster = {
  slug: string;
  queries: string[];
  count: number;
  normalizedText: string;
  category: "api" | "kubernetes" | "docker" | "dns-ssl";
};

export type QueryAnalytics = {
  pageViews: Record<string, number>;
  conversions: Record<string, number>;
};

export type QueryStoreData = {
  queries: QueryItem[];
  generatedIssues: GeneratedIssue[];
  analytics: QueryAnalytics;
  lastGeneratedAt: number | null;
};

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const QUERY_STORE_PATH = path.join(DATA_DIRECTORY, "query-store.json");
const GENERATED_ISSUES_MODULE_PATH = path.join(
  process.cwd(),
  "src",
  "lib",
  "generatedIssues.ts",
);
const MAX_GENERATED_ISSUES = 20;
const MAX_MANUAL_REVIEW_ISSUES = 10;
const MIN_QUERY_LENGTH = 10;
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "after",
  "all",
  "app",
  "application",
  "at",
  "by",
  "for",
  "from",
  "how",
  "in",
  "into",
  "is",
  "issue",
  "it",
  "my",
  "of",
  "on",
  "or",
  "our",
  "please",
  "problem",
  "the",
  "this",
  "to",
  "when",
  "with",
]);
const SPAM_PATTERNS = [
  /(buy now|free money|casino|crypto giveaway|viagra|loan approval)/i,
  /(http:\/\/|https:\/\/).*(http:\/\/|https:\/\/)/i,
  /^([a-z0-9])\1{7,}$/i,
];

function getEmptyStore(): QueryStoreData {
  return {
    queries: [],
    generatedIssues: [],
    analytics: {
      pageViews: {},
      conversions: {},
    },
    lastGeneratedAt: null,
  };
}

async function ensureStoreDirectory() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
}

function sanitizeQueryItem(value: unknown): QueryItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const maybe = value as {
    text?: unknown;
    createdAt?: unknown;
    response?: unknown;
  };

  if (typeof maybe.text !== "string") {
    return null;
  }

  const text = maybe.text.trim();
  if (!text) {
    return null;
  }

  const createdAt =
    typeof maybe.createdAt === "number" && Number.isFinite(maybe.createdAt)
      ? maybe.createdAt
      : Date.now();

  const response = typeof maybe.response === "string" ? maybe.response.trim() : undefined;

  return {
    text,
    createdAt,
    ...(response ? { response } : {}),
  };
}

function sanitizeAnalytics(value: unknown): QueryAnalytics {
  if (!value || typeof value !== "object") {
    return { pageViews: {}, conversions: {} };
  }

  const maybe = value as {
    pageViews?: unknown;
    conversions?: unknown;
  };

  function sanitizeMetric(metric: unknown): Record<string, number> {
    if (!metric || typeof metric !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(metric as Record<string, unknown>)
        .filter(
          (entry): entry is [string, number] =>
            typeof entry[0] === "string" &&
            typeof entry[1] === "number" &&
            Number.isFinite(entry[1]),
        )
        .map(([key, count]) => [key, Math.max(0, Math.floor(count))]),
    );
  }

  return {
    pageViews: sanitizeMetric(maybe.pageViews),
    conversions: sanitizeMetric(maybe.conversions),
  };
}

function sanitizeGeneratedIssue(value: unknown, analytics: QueryAnalytics): GeneratedIssue | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const maybe = value as GeneratedIssue;
  if (
    typeof maybe.slug !== "string" ||
    typeof maybe.title !== "string" ||
    typeof maybe.category !== "string" ||
    typeof maybe.description !== "string" ||
    typeof maybe.shortAnswer !== "string" ||
    typeof maybe.exampleInput !== "string" ||
    typeof maybe.exampleOutput !== "string" ||
    !Array.isArray(maybe.causes) ||
    !Array.isArray(maybe.fix)
  ) {
    return null;
  }

  const slug = maybe.slug.trim();
  if (!slug) {
    return null;
  }

  return {
    slug,
    title: maybe.title.trim(),
    category: maybe.category,
    description: maybe.description.trim(),
    shortAnswer: maybe.shortAnswer.trim(),
    exampleInput: maybe.exampleInput.trim(),
    exampleOutput: maybe.exampleOutput.trim(),
    causes: maybe.causes.filter((item): item is string => typeof item === "string" && item.trim().length > 0),
    fix: maybe.fix.filter((item): item is string => typeof item === "string" && item.trim().length > 0),
    source: "generated",
    queryCount:
      typeof maybe.queryCount === "number" && Number.isFinite(maybe.queryCount)
        ? Math.max(1, Math.floor(maybe.queryCount))
        : 1,
    queries: Array.isArray(maybe.queries)
      ? maybe.queries.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [],
    reviewStatus: maybe.reviewStatus === "approved" ? "approved" : "pending",
    generatedAt:
      typeof maybe.generatedAt === "number" && Number.isFinite(maybe.generatedAt)
        ? maybe.generatedAt
        : Date.now(),
    pageViews: analytics.pageViews[slug] ?? 0,
    conversions: analytics.conversions[slug] ?? 0,
  };
}

async function readQueryStore(): Promise<QueryStoreData> {
  try {
    const raw = await fs.readFile(QUERY_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as {
      queries?: unknown;
      generatedIssues?: unknown;
      analytics?: unknown;
      lastGeneratedAt?: unknown;
    };

    const analytics = sanitizeAnalytics(parsed.analytics);

    return {
      queries: Array.isArray(parsed.queries)
        ? parsed.queries
            .map(sanitizeQueryItem)
            .filter((item): item is QueryItem => item !== null)
        : [],
      generatedIssues: Array.isArray(parsed.generatedIssues)
        ? parsed.generatedIssues
            .map((item) => sanitizeGeneratedIssue(item, analytics))
            .filter((item): item is GeneratedIssue => item !== null)
        : [],
      analytics,
      lastGeneratedAt:
        typeof parsed.lastGeneratedAt === "number" && Number.isFinite(parsed.lastGeneratedAt)
          ? parsed.lastGeneratedAt
          : null,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return getEmptyStore();
    }

    console.warn("[queryStore] Failed to read query store:", error);
    return getEmptyStore();
  }
}

async function writeQueryStore(data: QueryStoreData) {
  await ensureStoreDirectory();
  await fs.writeFile(QUERY_STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

function serializeGeneratedIssuesModule(issues: GeneratedIssue[]): string {
  return `import type { Issue } from "@/lib/issues";

export type GeneratedIssue = Issue & {
  source: "generated";
  queryCount: number;
  queries: string[];
  reviewStatus: "pending" | "approved";
  generatedAt: number;
  pageViews: number;
  conversions: number;
};

export const generatedIssues: GeneratedIssue[] = ${JSON.stringify(issues, null, 2)};
`;
}

async function writeGeneratedIssuesModule(issues: GeneratedIssue[]) {
  await fs.writeFile(
    GENERATED_ISSUES_MODULE_PATH,
    serializeGeneratedIssuesModule(issues),
    "utf8",
  );
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function singularizeToken(token: string): string {
  if (token.endsWith("ies") && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }
  if (token.endsWith("es") && token.length > 4) {
    return token.slice(0, -2);
  }
  if (token.endsWith("s") && token.length > 3) {
    return token.slice(0, -1);
  }
  return token;
}

export function normalizeQueryText(text: string): string {
  const collapsed = collapseWhitespace(text.toLowerCase());
  return collapsed
    .replace(/crash\s*loop\s*back\s*off/g, "crashloopbackoff")
    .replace(/crash\s*loop/g, "crashloopbackoff")
    .replace(/after deployment/g, "after deploy")
    .replace(/deployment/g, "deploy")
    .replace(/timed out/g, "timeout")
    .replace(/time out/g, "timeout")
    .replace(/too many/g, "excessive")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeForCluster(text: string): string[] {
  return Array.from(
    new Set(
      normalizeQueryText(text)
        .split(/\s+/)
        .map((token) => singularizeToken(token))
        .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
    ),
  ).sort();
}

function buildClusterSlug(tokens: string[]): string {
  return tokens
    .slice(0, 5)
    .join("-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function toIssueCategory(category: QueryCluster["category"]): GeneratedIssue["category"] {
  switch (category) {
    case "api":
      return "api";
    case "kubernetes":
      return "kubernetes";
    case "docker":
      return "docker";
    default:
      return "dns-ssl";
  }
}

function toClusterCategory(value: Awaited<ReturnType<typeof classifyIssue>>["type"]): QueryCluster["category"] {
  switch (value) {
    case "api":
    case "kubernetes":
    case "docker":
      return value;
    default:
      return "dns-ssl";
  }
}

export function isSpamQuery(text: string): boolean {
  const trimmed = collapseWhitespace(text);
  if (trimmed.length <= MIN_QUERY_LENGTH) {
    return true;
  }
  return SPAM_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function getRepresentativeQuery(queries: string[]): string {
  return [...queries].sort((left, right) => left.length - right.length)[0] ?? queries[0] ?? "";
}

function titleize(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildGeneratedIssue(cluster: QueryCluster, generatedAt: number, analytics: QueryAnalytics): GeneratedIssue {
  const representative = getRepresentativeQuery(cluster.queries);
  const titleRoot = titleize(representative);
  const pageTitle = titleRoot.startsWith("Fix ") ? titleRoot.slice(4) : titleRoot;
  const actionFocus = cluster.queries[0] ?? representative;

  return {
    slug: cluster.slug,
    title: pageTitle,
    category: toIssueCategory(cluster.category),
    description: `Kintify Fix for ${pageTitle}. Built from real developer queries and optimized for fast troubleshooting.`,
    shortAnswer: `Check ${actionFocus.toLowerCase()} by confirming the failing component, reviewing the latest change, and validating the most likely dependency before rollback.`,
    exampleInput: representative,
    exampleOutput: `Inspect the failing path for ${representative.toLowerCase()}, confirm the last change that affected it, and verify upstream dependencies before retrying the fix.`,
    causes: [
      `A recent change introduced the ${representative.toLowerCase()} failure pattern.`,
      `A dependency, configuration value, or upstream service is no longer matching the expected runtime state.`,
      `The issue is recurring across similar real-world Kintify Fix submissions.`,
    ],
    fix: [
      `Reproduce ${representative.toLowerCase()} with the exact failing input or log sample.`,
      "Compare the latest config, deploy, or infrastructure change against the last known healthy state.",
      "Validate the upstream dependency, resource limit, or network path tied to the failure before rollback.",
      "Apply the smallest safe change, then rerun the same check to confirm recovery.",
    ],
    source: "generated",
    queryCount: cluster.count,
    queries: cluster.queries,
    reviewStatus: "pending",
    generatedAt,
    pageViews: analytics.pageViews[cluster.slug] ?? 0,
    conversions: analytics.conversions[cluster.slug] ?? 0,
  };
}

export async function recordQuery(input: { text: string; response?: string }) {
  const trimmed = collapseWhitespace(input.text);
  if (!trimmed || isSpamQuery(trimmed)) {
    return;
  }

  const store = await readQueryStore();
  const item: QueryItem = {
    text: trimmed,
    createdAt: Date.now(),
    ...(input.response ? { response: collapseWhitespace(input.response).slice(0, 1200) } : {}),
  };

  store.queries.unshift(item);
  store.queries = store.queries.slice(0, 5000);
  await writeQueryStore(store);
}

export async function recordQueryResponse(text: string, response: string) {
  const trimmedText = collapseWhitespace(text);
  const trimmedResponse = collapseWhitespace(response);

  if (!trimmedText || !trimmedResponse) {
    return;
  }

  const store = await readQueryStore();
  const target = store.queries.find(
    (item) => item.text === trimmedText && typeof item.response !== "string",
  );

  if (!target) {
    return;
  }

  target.response = trimmedResponse.slice(0, 1200);
  await writeQueryStore(store);
}

export async function clusterQueries(items?: QueryItem[]): Promise<QueryCluster[]> {
  const source = items ?? (await readQueryStore()).queries;
  const deduped = new Map<string, QueryItem[]>();

  for (const item of source) {
    const trimmed = collapseWhitespace(item.text);
    if (!trimmed || trimmed.length <= MIN_QUERY_LENGTH || isSpamQuery(trimmed) || isWeakFixInput(trimmed)) {
      continue;
    }

    const tokens = tokenizeForCluster(trimmed);
    if (tokens.length < 2) {
      continue;
    }

    const key = buildClusterSlug(tokens);
    if (!key) {
      continue;
    }

    const entries = deduped.get(key) ?? [];
    entries.push({ ...item, text: trimmed });
    deduped.set(key, entries);
  }

  const clusters = await Promise.all(
    Array.from(deduped.entries()).map(async ([slug, entries]) => {
      const uniqueQueries = Array.from(new Set(entries.map((entry) => collapseWhitespace(entry.text))));
      const classification = await classifyIssue(uniqueQueries[0] ?? slug);
      return {
        slug,
        queries: uniqueQueries,
        count: entries.length,
        normalizedText: normalizeQueryText(uniqueQueries[0] ?? slug),
        category: toClusterCategory(classification.type),
      } satisfies QueryCluster;
    }),
  );

  return clusters.sort((left, right) => right.count - left.count || left.slug.localeCompare(right.slug));
}

export async function generateIssuesFromQueries(options?: { limit?: number }) {
  const store = await readQueryStore();
  const clusters = await clusterQueries(store.queries);
  const generatedAt = Date.now();
  const nextIssues = clusters
    .filter((cluster) => (cluster.queries[0]?.length ?? 0) > MIN_QUERY_LENGTH)
    .slice(0, options?.limit ?? MAX_GENERATED_ISSUES)
    .map((cluster) => buildGeneratedIssue(cluster, generatedAt, store.analytics));

  const pending = nextIssues.slice(0, MAX_MANUAL_REVIEW_ISSUES).map((issue) => ({
    ...issue,
    reviewStatus: issue.reviewStatus,
  }));
  const rest = nextIssues.slice(MAX_MANUAL_REVIEW_ISSUES).map((issue) => ({
    ...issue,
    reviewStatus: "approved" as const,
  }));

  store.generatedIssues = [...pending, ...rest];
  store.lastGeneratedAt = generatedAt;
  await writeQueryStore(store);
  await writeGeneratedIssuesModule(store.generatedIssues);

  return {
    generatedAt,
    clusters,
    generatedIssues: store.generatedIssues,
    manualReview: store.generatedIssues.slice(0, MAX_MANUAL_REVIEW_ISSUES),
  };
}

export async function getGeneratedIssues(): Promise<GeneratedIssue[]> {
  const store = await readQueryStore();
  if (store.generatedIssues.length > 0) {
    return store.generatedIssues;
  }

  return generatedIssueSnapshot;
}

export async function getQueryStoreSnapshot() {
  return readQueryStore();
}

export async function trackGeneratedIssueEvent(
  slug: string,
  type: "pageView" | "conversion",
) {
  const store = await readQueryStore();
  const key = type === "pageView" ? "pageViews" : "conversions";
  const current = store.analytics[key][slug] ?? 0;
  store.analytics[key][slug] = current + 1;

  store.generatedIssues = store.generatedIssues.map((issue) =>
    issue.slug === slug
      ? {
          ...issue,
          pageViews: store.analytics.pageViews[slug] ?? 0,
          conversions: store.analytics.conversions[slug] ?? 0,
        }
      : issue,
  );

  await writeQueryStore(store);
}

import { openai } from "@/lib/llm";

export type AnalysisCategory = "performance" | "cost" | "errors" | "ai" | "default";

export type AnalysisResult = {
  category: AnalysisCategory;
  problem: string;
  cause: string;
  explanation: string;
  fix: string[];
  prevention: string[];
};

export type LlmAnalysisResult = AnalysisResult & {
  confidence: number;
  impact: string;
  improvement: string;
};

/* ------------------------------------------------------------------ */
/*  LLM-powered analysis                                               */
/* ------------------------------------------------------------------ */

const MAX_INPUT_LENGTH = 500;
const LLM_TIMEOUT_MS = 8_000;

const SYSTEM_PROMPT = `You are Kintify, a cloud systems diagnostics expert.
Analyze the user's system issue and return ONLY valid JSON with this exact structure:

{
  "category": "performance" | "cost" | "errors" | "ai" | "default",
  "problem": "one-sentence problem statement",
  "cause": "one-sentence root cause",
  "explanation": "2-3 sentence technical explanation",
  "fix": ["step 1", "step 2", "step 3"],
  "prevention": ["tip 1", "tip 2", "tip 3"],
  "confidence": <number 70-98>,
  "impact": "Low" | "Medium" | "High" | "Critical",
  "improvement": "+XX% <metric>"
}

Rules:
- fix and prevention must each have 3-5 items
- confidence must be a number between 70 and 98
- improvement must be a short string like "+40% faster" or "-30% cost reduction"
- Return ONLY JSON, no markdown, no explanation outside JSON`;

function validateLlmResponse(data: unknown): LlmAnalysisResult | null {
  if (!data || typeof data !== "object") return null;

  const d = data as Record<string, unknown>;

  const validCategories: AnalysisCategory[] = ["performance", "cost", "errors", "ai", "default"];
  const category = validCategories.includes(d.category as AnalysisCategory)
    ? (d.category as AnalysisCategory)
    : "default";

  if (typeof d.problem !== "string" || !d.problem) return null;
  if (typeof d.cause !== "string" || !d.cause) return null;
  if (typeof d.explanation !== "string") return null;
  if (!Array.isArray(d.fix) || d.fix.length === 0) return null;
  if (!Array.isArray(d.prevention) || d.prevention.length === 0) return null;

  const fix = d.fix.filter((s): s is string => typeof s === "string" && s.length > 0);
  const prevention = d.prevention.filter((s): s is string => typeof s === "string" && s.length > 0);

  if (fix.length === 0 || prevention.length === 0) return null;

  const confidence =
    typeof d.confidence === "number"
      ? Math.min(98, Math.max(70, Math.round(d.confidence)))
      : 85;

  const impact =
    typeof d.impact === "string" && ["Low", "Medium", "High", "Critical"].includes(d.impact)
      ? d.impact
      : "Medium";

  const improvement = typeof d.improvement === "string" && d.improvement ? d.improvement : "+25% improvement";

  return {
    category,
    problem: d.problem as string,
    cause: d.cause as string,
    explanation: (d.explanation as string) || "",
    fix,
    prevention,
    confidence,
    impact,
    improvement,
  };
}

export async function analyzeWithLLM(input: string): Promise<LlmAnalysisResult> {
  const trimmed = input.slice(0, MAX_INPUT_LENGTH);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const res = await openai.chat.completions.create(
      {
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: trimmed },
        ],
        temperature: 0.3,
        max_tokens: 800,
      },
      { signal: controller.signal },
    );

    const text = res.choices[0]?.message?.content ?? "";

    // Strip markdown fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const parsed = JSON.parse(cleaned) as unknown;
    const validated = validateLlmResponse(parsed);

    if (!validated) {
      throw new Error("LLM response failed validation");
    }

    return validated;
  } finally {
    clearTimeout(timeout);
  }
}

type AnalysisVariant = {
  problem: string[];
  cause: string[];
  explanation: string[];
  fix: string[][];
  prevention: string[][];
};

const responses = {
  performance: {
    problem: ["Performance degradation detected", "Latency-related performance issue detected"],
    cause: [
      "High latency due to inefficient request handling",
      "Slowdowns caused by serialized work or overloaded services",
    ],
    explanation: [
      "This usually happens when requests are processed sequentially or when backend services are overloaded. Over time, this creates bottlenecks that slow down response times.",
      "Sequential processing and unoptimized queries compound under load. Without concurrency or caching, each request waits in line, degrading overall throughput.",
    ],
    fix: [
      [
        "Implement caching (Redis or in-memory)",
        "Use parallel API calls instead of sequential",
        "Optimize database queries and add indexes",
      ],
      [
        "Add a CDN or edge cache for static responses",
        "Break large requests into smaller parallel tasks",
        "Profile slow endpoints and optimize hot paths",
      ],
    ],
    prevention: [
      [
        "Monitor latency with structured logging",
        "Set up rate limits and request budgets",
        "Use autoscaling where possible",
      ],
      [
        "Establish latency SLOs and alert on breaches",
        "Load-test critical paths before release",
        "Review query plans during code review",
      ],
    ],
  },
  cost: {
    problem: ["Unexpected cost increase detected", "Cloud spend anomaly detected"],
    cause: [
      "Usage spikes or inefficient resource allocation",
      "Resource overprovisioning or unmonitored storage growth",
    ],
    explanation: [
      "Cloud costs often increase when resources run unchecked. Idle instances, oversized clusters, and unmonitored storage are common causes that compound silently over billing cycles.",
      "Without budget guardrails, small inefficiencies accumulate. Orphaned resources, over-provisioned compute, and unoptimized data transfer can double spend within weeks.",
    ],
    fix: [
      [
        "Audit active resources and remove unused ones",
        "Set budget alerts and spending limits",
        "Right-size compute instances based on actual usage",
      ],
      [
        "Identify top-spending services in your billing dashboard",
        "Consolidate redundant infrastructure",
        "Switch to reserved or spot instances for steady workloads",
      ],
    ],
    prevention: [
      [
        "Enable cost monitoring dashboards",
        "Review billing reports weekly",
        "Use reserved instances for predictable workloads",
      ],
      [
        "Tag all resources for cost attribution",
        "Automate cleanup of idle resources",
        "Set per-team or per-project spending caps",
      ],
    ],
  },
  errors: {
    problem: ["System error detected", "Application failure pattern detected"],
    cause: [
      "Unhandled exceptions or dependency failures",
      "A failing dependency or unstable service triggering cascading errors",
    ],
    explanation: [
      "Errors often cascade from a single failing component. Missing error boundaries, unvalidated inputs, or unstable third-party services can trigger repeated failures across the system.",
      "When one service fails without proper isolation, the failure propagates. Retry storms, missing fallbacks, and tight coupling amplify a small issue into a system-wide outage.",
    ],
    fix: [
      [
        "Check logs and stack traces for the root exception",
        "Validate all external dependencies and API contracts",
        "Add error boundaries and retry logic with backoff",
      ],
      [
        "Reproduce the error locally with the same inputs",
        "Verify service health for all upstream dependencies",
        "Add structured try-catch blocks around critical paths",
      ],
    ],
    prevention: [
      [
        "Implement structured logging across all services",
        "Add health checks for critical dependencies",
        "Use circuit breakers for external calls",
      ],
      [
        "Set up alerting on error rate spikes",
        "Write integration tests for dependency boundaries",
        "Maintain a runbook for common failure modes",
      ],
    ],
  },
  ai: {
    problem: ["AI output inconsistency detected", "Model response quality issue detected"],
    cause: [
      "Model uncertainty or insufficient context",
      "Vague prompts or missing grounding data",
    ],
    explanation: [
      "AI models can produce unreliable output when prompts are vague, context is missing, or the model lacks grounding data. This leads to hallucinations or low-confidence responses.",
      "Without explicit constraints, models default to probabilistic guesses. Ambiguous instructions and missing context increase the chance of incorrect or fabricated output.",
    ],
    fix: [
      [
        "Improve prompt clarity and add explicit constraints",
        "Provide more relevant context in the input",
        "Add output validation and confidence scoring",
      ],
      [
        "Use few-shot examples to guide model behavior",
        "Ground responses with retrieval-augmented generation",
        "Implement structured output parsing with schema validation",
      ],
    ],
    prevention: [
      [
        "Test prompts with diverse inputs before production",
        "Implement human-in-the-loop review for critical outputs",
        "Version control your prompts and track changes",
      ],
      [
        "Build an evaluation suite for output quality",
        "Log all model inputs and outputs for debugging",
        "Set confidence thresholds before surfacing results",
      ],
    ],
  },
  default: {
    problem: ["Unknown system issue", "Unclassified cloud issue detected"],
    cause: [
      "Insufficient data to determine root cause",
      "The issue description lacks enough signal for precise diagnosis",
    ],
    explanation: [
      "The provided input does not contain enough signal for a precise diagnosis. More context about the system, error messages, or symptoms would help narrow down the issue.",
      "Without specific error messages, logs, or symptoms, the analyzer cannot confidently classify the problem. Adding detail improves diagnostic accuracy significantly.",
    ],
    fix: [
      [
        "Include specific error messages or log output",
        "Describe what changed before the issue started",
        "Identify which services or components are affected",
      ],
      [
        "Paste the full error or stack trace if available",
        "Note the timeline of when the issue first appeared",
        "List the infrastructure components involved",
      ],
    ],
    prevention: [
      [
        "Maintain detailed system documentation",
        "Set up centralized logging and monitoring",
        "Create runbooks for common failure scenarios",
      ],
      [
        "Keep an architecture diagram up to date",
        "Standardize error reporting across teams",
        "Run regular incident review sessions",
      ],
    ],
  },
} satisfies Record<"performance" | "cost" | "errors" | "ai" | "default", AnalysisVariant>;

function hashText(text: string) {
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function pickVariant(options: string[], text: string) {
  const selection = options[hashText(text) % options.length];
  return selection ?? options[0] ?? "";
}

function pickVariantArray(options: string[][], text: string): string[] {
  const selection = options[hashText(text) % options.length];
  return selection ?? options[0] ?? [];
}

function buildResult(variant: AnalysisVariant, text: string, category: AnalysisCategory): AnalysisResult {
  return {
    category,
    problem: pickVariant(variant.problem, `${text}:problem`),
    cause: pickVariant(variant.cause, `${text}:cause`),
    explanation: pickVariant(variant.explanation, `${text}:explanation`),
    fix: pickVariantArray(variant.fix, `${text}:fix`),
    prevention: pickVariantArray(variant.prevention, `${text}:prevention`),
  };
}

export function analyzeInput(input: string): AnalysisResult {
  const text = input.toLowerCase();

  if (
    text.includes("slow") ||
    text.includes("latency") ||
    text.includes("delay") ||
    text.includes("timeout")
  ) {
    return buildResult(responses.performance, text, "performance");
  }

  if (
    text.includes("cost") ||
    text.includes("bill") ||
    text.includes("expensive") ||
    text.includes("charges")
  ) {
    return buildResult(responses.cost, text, "cost");
  }

  if (
    text.includes("error") ||
    text.includes("fail") ||
    text.includes("crash") ||
    text.includes("exception")
  ) {
    return buildResult(responses.errors, text, "errors");
  }

  if (
    text.includes("ai") ||
    text.includes("hallucination") ||
    text.includes("wrong answer") ||
    text.includes("wrong") ||
    text.includes("inaccurate")
  ) {
    return buildResult(responses.ai, text, "ai");
  }

  return buildResult(responses.default, text, "default");
}

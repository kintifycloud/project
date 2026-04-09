export type AnalysisResult = {
  problem: string;
  cause: string;
  explanation: string;
  fix: string[];
  prevention: string[];
};

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

function buildResult(variant: AnalysisVariant, text: string): AnalysisResult {
  return {
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
    return buildResult(responses.performance, text);
  }

  if (
    text.includes("cost") ||
    text.includes("bill") ||
    text.includes("expensive") ||
    text.includes("charges")
  ) {
    return buildResult(responses.cost, text);
  }

  if (
    text.includes("error") ||
    text.includes("fail") ||
    text.includes("crash") ||
    text.includes("exception")
  ) {
    return buildResult(responses.errors, text);
  }

  if (
    text.includes("ai") ||
    text.includes("hallucination") ||
    text.includes("wrong answer") ||
    text.includes("wrong") ||
    text.includes("inaccurate")
  ) {
    return buildResult(responses.ai, text);
  }

  return buildResult(responses.default, text);
}

export type BlogTableOfContentsItem = {
  id: string;
  title: string;
  level: 1 | 2 | 3;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  subtitle: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  trending: boolean;
  content: string;
  tableOfContents: BlogTableOfContentsItem[];
  relatedSlugs: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "introducing-verisig-cryptographic-proofs",
    title: "Introducing Verisig: Cryptographic Proofs for System Verification",
    excerpt:
      "Learn how our verification layer provides mathematical certainty that production fixes actually work.",
    subtitle:
      "How our verification layer provides mathematical certainty that your fixes actually work in production environments.",
    author: "Alex Chen",
    authorRole: "Lead Engineer",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Trust",
    image: "bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20",
    difficulty: "Advanced",
    trending: true,
    content: `# Introduction

In modern cloud infrastructure, trust is often assumed rather than proven. Teams deploy changes, watch dashboards, and infer that the system is healthy without verifiable evidence.

## The Problem with Current Approaches

Observation does not equal verification. Metrics can look stable while configuration drift, partial rollout issues, or stale caches still affect production behavior.

## Enter Verisig

Verisig records system state and produces proofs that can be independently checked. That changes verification from a manual confidence exercise into a repeatable validation step.

### How It Works

1. Capture the system signal you want to verify.
2. Produce a proof artifact tied to that signal.
3. Validate the proof from an independent path.

## Real-World Impact

Teams can confirm whether a fix actually changed production state instead of relying on elapsed time and incomplete metrics.

## Technical Deep Dive

### DNS TXT Record Verification

DNS TXT records expose verifiable state in a public and machine-readable way.

### HTTP Header Verification

Signed HTTP headers let clients verify runtime identity and response provenance.

## Conclusion

Verification should be a first-class part of cloud operations. Proof-backed checks reduce uncertainty after deploys and incidents.`,
    tableOfContents: [
      { id: "introduction", title: "Introduction", level: 1 },
      { id: "the-problem-with-current-approaches", title: "The Problem with Current Approaches", level: 2 },
      { id: "enter-verisig", title: "Enter Verisig", level: 2 },
      { id: "how-it-works", title: "How It Works", level: 3 },
      { id: "real-world-impact", title: "Real-World Impact", level: 2 },
      { id: "technical-deep-dive", title: "Technical Deep Dive", level: 2 },
      { id: "dns-txt-record-verification", title: "DNS TXT Record Verification", level: 3 },
      { id: "http-header-verification", title: "HTTP Header Verification", level: 3 },
      { id: "conclusion", title: "Conclusion", level: 2 },
    ],
    relatedSlugs: [
      "debugging-production-systems-kintify-way",
      "why-hope-is-not-a-strategy",
      "building-for-scale-daily-analyses",
    ],
  },
  {
    slug: "debugging-production-systems-kintify-way",
    title: "Debugging Production Systems: The Old Way vs The Kintify Way",
    excerpt:
      "Compare manual production debugging workflows with a tighter, evidence-based incident process.",
    subtitle:
      "A practical comparison between reactive debugging habits and a structured production diagnosis workflow.",
    author: "Sarah Miller",
    authorRole: "Infrastructure Engineer",
    date: "2024-01-10",
    readTime: "6 min read",
    category: "Infrastructure",
    image: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
    difficulty: "Intermediate",
    trending: false,
    content: `# Introduction

Production debugging is often slowed down by guesswork, context switching, and incomplete logs.

## The Old Workflow

Teams typically jump between dashboards, logs, deploy history, and chat threads before they can identify what changed.

## The Structured Workflow

A better process starts with the symptom, narrows the dependency path, compares recent changes, and validates the suspected cause against logs and runtime state.

### First Response Steps

1. Capture the failing symptom and timeframe.
2. Check recent deploy and config changes.
3. Confirm the root cause with logs or tracing data.

## What Changes in Practice

The main improvement is not speed alone. It is reducing wrong fixes and avoiding repeated incident loops.

## Conclusion

Production debugging improves when evidence is collected in a consistent order and validated before rollout changes are made.`,
    tableOfContents: [
      { id: "introduction", title: "Introduction", level: 1 },
      { id: "the-old-workflow", title: "The Old Workflow", level: 2 },
      { id: "the-structured-workflow", title: "The Structured Workflow", level: 2 },
      { id: "first-response-steps", title: "First Response Steps", level: 3 },
      { id: "what-changes-in-practice", title: "What Changes in Practice", level: 2 },
      { id: "conclusion", title: "Conclusion", level: 2 },
    ],
    relatedSlugs: [
      "introducing-verisig-cryptographic-proofs",
      "why-hope-is-not-a-strategy",
      "future-of-ai-debugging-cloud-infrastructure",
    ],
  },
  {
    slug: "why-hope-is-not-a-strategy",
    title: "Why Hope Is Not a Strategy for Production Systems",
    excerpt:
      "Understanding the operational cost of uncertainty and why verified fixes matter in production.",
    subtitle:
      "Why teams need validation, not assumptions, when they change production systems under pressure.",
    author: "Marcus Johnson",
    authorRole: "Reliability Engineer",
    date: "2024-01-05",
    readTime: "5 min read",
    category: "Reliability",
    image: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
    difficulty: "Beginner",
    trending: true,
    content: `# Introduction

Many incidents stay open longer because the team assumes a fix worked before verifying the production outcome.

## Why Assumptions Fail

Assumptions fail when only one layer of the system is checked. A deploy can succeed while the service still serves stale traffic, fails health checks, or exhausts connections.

## What Validation Looks Like

Validation means confirming the expected runtime state with logs, metrics, or a direct verification path.

### Operational Checks

1. Confirm the symptom is gone.
2. Confirm traffic paths are healthy.
3. Confirm the underlying dependency is stable.

## Long-Term Impact

Teams that verify changes reduce repeated incidents and spend less time reopening the same failure class.

## Conclusion

Hope is not a strategy because it cannot be tested. Verification can.`,
    tableOfContents: [
      { id: "introduction", title: "Introduction", level: 1 },
      { id: "why-assumptions-fail", title: "Why Assumptions Fail", level: 2 },
      { id: "what-validation-looks-like", title: "What Validation Looks Like", level: 2 },
      { id: "operational-checks", title: "Operational Checks", level: 3 },
      { id: "long-term-impact", title: "Long-Term Impact", level: 2 },
      { id: "conclusion", title: "Conclusion", level: 2 },
    ],
    relatedSlugs: [
      "debugging-production-systems-kintify-way",
      "introducing-verisig-cryptographic-proofs",
      "security-by-design-protecting-data",
    ],
  },
  {
    slug: "building-for-scale-daily-analyses",
    title: "Building for Scale: How We Handle 10M+ Daily Analyses",
    excerpt:
      "A technical look at the architectural decisions behind high-volume diagnostic workloads.",
    subtitle:
      "The infrastructure patterns that keep diagnostic workloads fast, isolated, and reliable at scale.",
    author: "Alex Chen",
    authorRole: "Lead Engineer",
    date: "2023-12-28",
    readTime: "10 min read",
    category: "Infrastructure",
    image: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
    difficulty: "Advanced",
    trending: false,
    content: `# Introduction

High-volume diagnostic systems have to balance request latency, noisy input handling, and burst traffic.

## Throughput Constraints

The main scaling pressure comes from request concurrency, storage fan-out, and analysis jobs that vary widely in execution time.

## Architectural Decisions

Work is split into bounded stages so burst traffic does not saturate a single dependency.

### Scaling Controls

1. Queue slow analysis tasks.
2. Cache repeated lookups.
3. Isolate downstream failures with timeouts and concurrency limits.

## Reliability Lessons

Scaling successfully requires limiting blast radius as much as increasing capacity.

## Conclusion

A scalable analysis platform is built on predictable failure boundaries and carefully measured bottlenecks.`,
    tableOfContents: [
      { id: "introduction", title: "Introduction", level: 1 },
      { id: "throughput-constraints", title: "Throughput Constraints", level: 2 },
      { id: "architectural-decisions", title: "Architectural Decisions", level: 2 },
      { id: "scaling-controls", title: "Scaling Controls", level: 3 },
      { id: "reliability-lessons", title: "Reliability Lessons", level: 2 },
      { id: "conclusion", title: "Conclusion", level: 2 },
    ],
    relatedSlugs: [
      "debugging-production-systems-kintify-way",
      "future-of-ai-debugging-cloud-infrastructure",
      "security-by-design-protecting-data",
    ],
  },
  {
    slug: "future-of-ai-debugging-cloud-infrastructure",
    title: "The Future of AI Debugging in Cloud Infrastructure",
    excerpt:
      "How structured diagnostics, retrieval, and validation are changing incident response workflows.",
    subtitle:
      "A practical view of where AI-assisted debugging helps and where human verification still matters.",
    author: "Sarah Miller",
    authorRole: "Infrastructure Engineer",
    date: "2023-12-20",
    readTime: "7 min read",
    category: "AI Debugging",
    image: "bg-gradient-to-br from-pink-500/20 to-rose-500/20",
    difficulty: "Intermediate",
    trending: true,
    content: `# Introduction

AI-assisted debugging is useful when it compresses investigation time without hiding the evidence behind the answer.

## Where AI Helps

AI can cluster symptoms, summarize logs, and propose likely failure paths faster than a manual first pass.

## Where Validation Still Matters

Suggested causes still need to be checked against logs, deploy history, metrics, and runtime configuration.

### Good Operational Use

1. Use AI to narrow the search space.
2. Verify the proposed cause with system evidence.
3. Validate the fix after the change is applied.

## Expected Direction

The most useful systems combine structured evidence, ranking, and verification instead of replacing operator judgment.

## Conclusion

The future of AI debugging is not blind automation. It is faster technical reasoning with better validation.`,
    tableOfContents: [
      { id: "introduction", title: "Introduction", level: 1 },
      { id: "where-ai-helps", title: "Where AI Helps", level: 2 },
      { id: "where-validation-still-matters", title: "Where Validation Still Matters", level: 2 },
      { id: "good-operational-use", title: "Good Operational Use", level: 3 },
      { id: "expected-direction", title: "Expected Direction", level: 2 },
      { id: "conclusion", title: "Conclusion", level: 2 },
    ],
    relatedSlugs: [
      "debugging-production-systems-kintify-way",
      "building-for-scale-daily-analyses",
      "introducing-verisig-cryptographic-proofs",
    ],
  },
  {
    slug: "security-by-design-protecting-data",
    title: "Security by Design: How We Protect Your Data",
    excerpt:
      "A practical overview of data handling, access boundaries, and security controls in the platform.",
    subtitle:
      "How we think about access control, retention boundaries, and safe defaults for diagnostic data.",
    author: "Marcus Johnson",
    authorRole: "Security Engineer",
    date: "2023-12-15",
    readTime: "9 min read",
    category: "Security",
    image: "bg-gradient-to-br from-violet-500/20 to-purple-500/20",
    difficulty: "Advanced",
    trending: false,
    content: `# Introduction

Diagnostic systems often process logs, stack traces, and configuration fragments that may contain sensitive data.

## Security Requirements

The system must minimize retention, restrict access paths, and avoid copying sensitive material into unnecessary storage layers.

## Design Principles

Secure defaults matter most when operators are under pressure and moving quickly.

### Control Areas

1. Encrypt data in transit and at rest.
2. Restrict operator and service access by role.
3. Log administrative actions for audit review.

## Operational Review

Security controls should be tested against actual workflows, not only architecture diagrams.

## Conclusion

Security by design means turning safe handling into the default path, not an optional checklist.`,
    tableOfContents: [
      { id: "introduction", title: "Introduction", level: 1 },
      { id: "security-requirements", title: "Security Requirements", level: 2 },
      { id: "design-principles", title: "Design Principles", level: 2 },
      { id: "control-areas", title: "Control Areas", level: 3 },
      { id: "operational-review", title: "Operational Review", level: 2 },
      { id: "conclusion", title: "Conclusion", level: 2 },
    ],
    relatedSlugs: [
      "why-hope-is-not-a-strategy",
      "building-for-scale-daily-analyses",
      "introducing-verisig-cryptographic-proofs",
    ],
  },
];

export function findBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(slug: string, limit = 3) {
  const current = findBlogPost(slug);

  if (!current) {
    return [];
  }

  const related = current.relatedSlugs
    .map((relatedSlug) => findBlogPost(relatedSlug))
    .filter((post): post is BlogPost => Boolean(post));

  return related.slice(0, limit);
}

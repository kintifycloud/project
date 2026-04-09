import type { AnalysisCategory } from "@/lib/analyzer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SeoEntry = {
  category: AnalysisCategory;
  issue: string;
  title: string;
  description: string;
  keywords: string[];
  problem: string;
  cause: string;
  explanation: string;
  fix: string[];
  prevention: string[];
  faq: { question: string; answer: string }[];
};

/* ------------------------------------------------------------------ */
/*  Data — Performance (5)                                             */
/* ------------------------------------------------------------------ */

const performance: SeoEntry[] = [
  {
    category: "performance",
    issue: "api-latency",
    title: "Fix API Latency Issues in Cloud Systems",
    description:
      "Learn how to detect and fix API latency problems in cloud-based applications. Covers caching, parallel requests, database optimization, and more.",
    keywords: ["api latency fix", "slow api cloud", "reduce latency api", "cloud api performance", "api response time optimization"],
    problem: "API latency is degrading user experience and system throughput across cloud endpoints.",
    cause: "High latency caused by sequential request handling, missing caches, and unoptimized database queries compounding under load.",
    explanation:
      "API latency accumulates when each request waits on upstream services sequentially. Without caching, every call hits the origin. Combined with unindexed queries, even moderate traffic creates visible delays that impact SLAs and end-user satisfaction.",
    fix: [
      "Implement response caching with Redis or an in-memory store to eliminate redundant computation",
      "Replace sequential API calls with Promise.all to parallelize independent requests",
      "Add database indexes on frequently queried columns and review slow-query logs",
      "Enable CDN or edge caching for semi-static API responses",
      "Profile endpoints with distributed tracing to pinpoint the slowest spans",
    ],
    prevention: [
      "Establish latency SLOs and alert on P95/P99 breaches",
      "Load-test critical paths before each release",
      "Review query execution plans during code review",
    ],
    faq: [
      {
        question: "What causes API latency in cloud systems?",
        answer:
          "Common causes include sequential request handling, missing caches, unindexed database queries, cold starts in serverless functions, and network hops between regions.",
      },
      {
        question: "How do I measure API latency?",
        answer:
          "Use distributed tracing tools like OpenTelemetry, Datadog, or AWS X-Ray. Track P50, P95, and P99 latency at the route level.",
      },
      {
        question: "Does caching always improve API performance?",
        answer:
          "Caching helps most for read-heavy, semi-static data. For highly dynamic or write-heavy endpoints, cache invalidation complexity may outweigh the benefit.",
      },
    ],
  },
  {
    category: "performance",
    issue: "slow-database-queries",
    title: "Fix Slow Database Queries in Production",
    description:
      "Diagnose and resolve slow database queries that degrade application performance. Covers indexing, query optimization, and connection pooling.",
    keywords: ["slow database queries fix", "database performance optimization", "sql query optimization", "database indexing guide"],
    problem: "Database queries are running significantly slower than expected, creating bottlenecks in the application layer.",
    cause: "Missing indexes, full table scans, and inefficient JOIN operations cause query execution times to spike under load.",
    explanation:
      "When queries lack proper indexes, the database engine performs full table scans for every request. As data grows, these scans become exponentially slower. N+1 query patterns and unoptimized JOINs multiply the problem across application endpoints.",
    fix: [
      "Run EXPLAIN ANALYZE on slow queries to identify full table scans and missing indexes",
      "Add composite indexes on columns used in WHERE, JOIN, and ORDER BY clauses",
      "Eliminate N+1 query patterns by using eager loading or batched queries",
      "Implement connection pooling to reduce connection overhead",
      "Consider read replicas for heavy read workloads to distribute query load",
    ],
    prevention: [
      "Monitor query execution times and set alerts on slow-query thresholds",
      "Include query plan review as part of the code review process",
      "Run periodic index analysis to catch unused or missing indexes",
    ],
    faq: [
      {
        question: "How do I find slow queries in production?",
        answer:
          "Enable slow-query logging in your database (e.g., slow_query_log in MySQL, log_min_duration_statement in PostgreSQL) and review the output regularly.",
      },
      {
        question: "What is an N+1 query problem?",
        answer:
          "An N+1 query occurs when code fetches a list of N items and then runs a separate query for each item's related data, resulting in N+1 total queries instead of one or two.",
      },
    ],
  },
  {
    category: "performance",
    issue: "server-timeout-errors",
    title: "Fix Server Timeout Errors in Cloud Applications",
    description:
      "Resolve server timeout errors caused by long-running operations, resource exhaustion, or misconfigured timeouts in cloud infrastructure.",
    keywords: ["server timeout fix", "504 gateway timeout", "cloud timeout errors", "request timeout optimization"],
    problem: "Server requests are timing out before completing, returning 504 errors and degrading user experience.",
    cause: "Long-running synchronous operations, resource exhaustion, and misconfigured timeout thresholds cause requests to exceed time limits.",
    explanation:
      "Timeouts occur when a request cannot be completed within the configured limit. This is often caused by synchronous processing of heavy operations, database locks, or an overloaded upstream service that cannot respond in time. Load balancers and API gateways enforce their own timeout windows.",
    fix: [
      "Move long-running operations to background jobs using a message queue",
      "Increase timeout thresholds at the load balancer and application level where appropriate",
      "Implement request deadlines and cancel operations that exceed acceptable limits",
      "Scale compute resources to handle peak request volume",
      "Add health checks to detect and route around slow or unresponsive instances",
    ],
    prevention: [
      "Set realistic timeout budgets for each service in the request chain",
      "Monitor timeout rates per endpoint and alert on spikes",
      "Load-test with realistic traffic patterns to uncover timeout-prone paths",
    ],
    faq: [
      {
        question: "What causes 504 Gateway Timeout errors?",
        answer:
          "A 504 error means a gateway or proxy did not receive a timely response from the upstream server. Common causes include slow backend processing, overloaded services, or misconfigured timeout settings.",
      },
      {
        question: "Should I just increase timeout values?",
        answer:
          "Increasing timeouts is a temporary fix. The root cause — slow processing, resource exhaustion, or upstream bottlenecks — should be addressed to avoid cascading failures.",
      },
    ],
  },
  {
    category: "performance",
    issue: "high-memory-usage",
    title: "Fix High Memory Usage in Cloud Services",
    description:
      "Identify and resolve memory leaks, excessive allocations, and high memory usage in cloud-hosted applications.",
    keywords: ["high memory usage fix", "memory leak cloud", "reduce memory consumption", "node memory optimization"],
    problem: "Cloud services are consuming excessive memory, leading to OOM kills, degraded performance, and increased costs.",
    cause: "Memory leaks, unbounded caches, large in-memory data structures, and missing garbage collection pressure create runaway memory growth.",
    explanation:
      "Memory usage climbs when objects are allocated but never released — event listeners that aren't cleaned up, caches that grow without eviction, or large datasets loaded entirely into memory. Over time, processes hit container memory limits and get killed.",
    fix: [
      "Profile memory usage with heap snapshots to identify objects that are not being freed",
      "Implement LRU eviction on all in-memory caches to bound their size",
      "Stream large datasets instead of loading them entirely into memory",
      "Fix event listener leaks by ensuring proper cleanup in lifecycle hooks",
      "Right-size container memory limits and add OOM alerts",
    ],
    prevention: [
      "Monitor memory usage trends and set alerts before OOM thresholds",
      "Run memory profiling as part of load testing",
      "Audit third-party libraries for known memory leak issues",
    ],
    faq: [
      {
        question: "How do I detect a memory leak in Node.js?",
        answer:
          "Use --inspect with Chrome DevTools or tools like clinic.js to take heap snapshots over time. Compare snapshots to identify objects that grow but are never garbage collected.",
      },
      {
        question: "What is an OOM kill?",
        answer:
          "OOM (Out of Memory) kill happens when the operating system or container runtime terminates a process that exceeds its memory limit to protect overall system stability.",
      },
    ],
  },
  {
    category: "performance",
    issue: "cold-start-latency",
    title: "Fix Cold Start Latency in Serverless Functions",
    description:
      "Reduce cold start latency in AWS Lambda, Google Cloud Functions, and Azure Functions for faster serverless response times.",
    keywords: ["cold start fix", "serverless cold start", "lambda cold start optimization", "reduce cold start latency"],
    problem: "Serverless functions experience significant cold start delays that impact user-facing response times.",
    cause: "Cold starts occur when the runtime must initialize a new execution environment, load dependencies, and establish connections before handling the first request.",
    explanation:
      "Serverless platforms reclaim idle instances to save resources. When a new request arrives after an idle period, the platform must provision a container, load the runtime, initialize the application code, and establish any database or service connections. This initialization adds hundreds of milliseconds to seconds of latency.",
    fix: [
      "Reduce deployment package size by removing unused dependencies and using tree-shaking",
      "Use provisioned concurrency or reserved instances to keep warm execution environments",
      "Lazy-load heavy modules — initialize them only when the specific code path is needed",
      "Move database connection initialization outside the handler using connection pooling",
      "Choose lighter runtimes (e.g., Go, Rust) for latency-critical functions",
    ],
    prevention: [
      "Monitor cold start frequency and P99 latency per function",
      "Set up scheduled pings to keep critical functions warm during business hours",
      "Review bundle size impact when adding new dependencies",
    ],
    faq: [
      {
        question: "What is a cold start in serverless?",
        answer:
          "A cold start is the initialization time required when a serverless platform creates a new execution environment for a function that has no warm instances available.",
      },
      {
        question: "Does provisioned concurrency eliminate cold starts?",
        answer:
          "Yes, provisioned concurrency pre-initializes a set number of execution environments, eliminating cold starts for those instances. However, it adds cost for keeping them warm.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Data — Cost (5)                                                    */
/* ------------------------------------------------------------------ */

const cost: SeoEntry[] = [
  {
    category: "cost",
    issue: "high-cloud-billing",
    title: "Fix High Cloud Billing and Reduce Unexpected Costs",
    description:
      "Identify root causes of high cloud bills and implement strategies to reduce cloud spending across AWS, GCP, and Azure.",
    keywords: ["high cloud billing fix", "reduce cloud costs", "cloud cost optimization", "unexpected cloud charges"],
    problem: "Cloud billing has increased significantly beyond expected budgets without a corresponding increase in usage.",
    cause: "Idle resources, over-provisioned instances, unmonitored storage growth, and missing budget alerts allow costs to escalate unnoticed.",
    explanation:
      "Cloud costs compound silently when resources are provisioned but not actively managed. Orphaned volumes, oversized instances running 24/7, and unoptimized data transfer fees accumulate across billing cycles. Without budget guardrails, small inefficiencies double spend within weeks.",
    fix: [
      "Audit all active resources and terminate idle or orphaned instances, volumes, and snapshots",
      "Right-size compute instances based on actual CPU and memory utilization metrics",
      "Set up budget alerts and spending limits in your cloud provider's billing console",
      "Switch steady-state workloads to reserved instances or savings plans for up to 60% savings",
      "Enable cost allocation tags to identify top-spending teams and services",
    ],
    prevention: [
      "Review billing dashboards weekly and investigate anomalies immediately",
      "Automate cleanup of idle resources with lifecycle policies",
      "Set per-team or per-project spending caps",
    ],
    faq: [
      {
        question: "Why is my cloud bill so high?",
        answer:
          "Common causes include idle resources still running, over-provisioned instances, unmonitored storage growth, cross-region data transfer fees, and missing auto-scaling policies.",
      },
      {
        question: "How do I set up cloud budget alerts?",
        answer:
          "In AWS, use AWS Budgets; in GCP, use Budget Alerts in Billing; in Azure, use Cost Management + Billing. Set thresholds at 50%, 80%, and 100% of your monthly budget.",
      },
    ],
  },
  {
    category: "cost",
    issue: "unused-cloud-resources",
    title: "Find and Remove Unused Cloud Resources to Cut Costs",
    description:
      "Identify and eliminate unused cloud resources like idle instances, unattached volumes, and orphaned snapshots draining your budget.",
    keywords: ["unused cloud resources", "orphaned cloud resources", "idle instances cost", "cloud resource cleanup"],
    problem: "Unused cloud resources are accumulating charges without providing any value to the organization.",
    cause: "Resources created for testing, migrations, or temporary workloads are not cleaned up after use, continuing to incur charges.",
    explanation:
      "Development teams frequently spin up instances, volumes, and services for temporary needs. Without lifecycle policies or cleanup automation, these resources persist indefinitely. Unattached EBS volumes, stopped-but-not-terminated instances, and orphaned load balancers silently add to the monthly bill.",
    fix: [
      "List all unattached EBS volumes, unused Elastic IPs, and idle load balancers for immediate cleanup",
      "Identify stopped instances that have been inactive for more than 7 days and terminate them",
      "Remove orphaned snapshots that no longer correspond to active volumes",
      "Implement resource tagging policies to track ownership and purpose of every resource",
      "Use cloud provider tools like AWS Trusted Advisor or GCP Recommender to find waste",
    ],
    prevention: [
      "Automate resource cleanup with TTL tags and scheduled Lambda functions",
      "Require resource ownership tags at creation time via IAM policies",
      "Run monthly resource audits as part of FinOps reviews",
    ],
    faq: [
      {
        question: "How do I find unused resources in AWS?",
        answer:
          "Use AWS Trusted Advisor, Cost Explorer, or CLI commands to list unattached volumes, idle instances, and unused Elastic IPs. Third-party tools like Spot.io or CloudHealth also help.",
      },
      {
        question: "Do stopped instances still cost money?",
        answer:
          "Stopped EC2 instances don't incur compute charges, but their attached EBS volumes, Elastic IPs, and snapshots continue to generate costs.",
      },
    ],
  },
  {
    category: "cost",
    issue: "data-transfer-costs",
    title: "Reduce Cloud Data Transfer Costs Across Regions",
    description:
      "Lower cross-region and internet egress data transfer fees that silently inflate cloud bills in AWS, GCP, and Azure.",
    keywords: ["data transfer costs cloud", "reduce egress costs", "cross region data transfer", "cloud network cost optimization"],
    problem: "Data transfer charges are a disproportionately large portion of the cloud bill.",
    cause: "Cross-region replication, internet egress, and unoptimized API payloads generate high data transfer volumes.",
    explanation:
      "Cloud providers charge for data leaving a region (egress) and for inter-region transfers. Services that frequently communicate across regions, large API responses sent to end users, and database replication across zones all contribute. These costs are often overlooked because they're not tied to a single resource.",
    fix: [
      "Co-locate services that communicate frequently within the same region and availability zone",
      "Use a CDN to cache and serve content from edge locations, reducing origin egress",
      "Compress API responses with gzip or Brotli to reduce payload sizes",
      "Consolidate cross-region replication to only business-critical data",
      "Review VPC endpoints and NAT gateway configurations to reduce unnecessary internet routing",
    ],
    prevention: [
      "Monitor data transfer costs as a separate line item in billing dashboards",
      "Architect new services with data locality in mind from the start",
      "Set up alerts specifically for data transfer cost anomalies",
    ],
    faq: [
      {
        question: "Why are data transfer costs so high in the cloud?",
        answer:
          "Cloud providers charge for egress (data leaving their network) and cross-region transfers. High-volume APIs, database replication, and media delivery are common contributors.",
      },
      {
        question: "Does using a CDN reduce data transfer costs?",
        answer:
          "Yes. CDNs cache content at edge locations so requests are served locally instead of hitting the origin, which significantly reduces egress charges.",
      },
    ],
  },
  {
    category: "cost",
    issue: "overprovisioned-instances",
    title: "Fix Overprovisioned Cloud Instances and Right-Size Resources",
    description:
      "Right-size overprovisioned cloud instances to match actual workload needs and reduce unnecessary compute spending.",
    keywords: ["overprovisioned instances fix", "right-size cloud instances", "cloud instance optimization", "reduce compute costs"],
    problem: "Cloud instances are provisioned with significantly more CPU and memory than workloads require.",
    cause: "Teams default to large instance types as a safety margin, and sizing is rarely revisited after initial deployment.",
    explanation:
      "Overprovisioning is the most common cloud cost waste. Teams select instance types based on peak-load assumptions or copy configurations from other services without profiling actual resource utilization. Instances running at 10-20% CPU utilization represent 80% wasted spend on compute.",
    fix: [
      "Analyze CPU and memory utilization metrics over the past 30 days to establish actual requirements",
      "Downsize instances to the smallest type that sustains P95 utilization with comfortable headroom",
      "Use auto-scaling groups to dynamically adjust capacity based on real-time demand",
      "Consider burstable instance types (e.g., T3, T4g) for workloads with variable utilization patterns",
      "Use cloud provider recommendation tools like AWS Compute Optimizer or GCP machine type recommendations",
    ],
    prevention: [
      "Require utilization data review before provisioning new instances",
      "Schedule quarterly right-sizing reviews as part of FinOps practices",
      "Implement auto-scaling by default for all non-static workloads",
    ],
    faq: [
      {
        question: "How do I know if my instances are overprovisioned?",
        answer:
          "Check average and peak CPU/memory utilization. If average utilization is consistently below 30%, the instance is likely overprovisioned and can be downsized.",
      },
      {
        question: "Will right-sizing cause performance issues?",
        answer:
          "Not if done with data. Size based on P95 utilization plus a safety margin. Use auto-scaling to handle unexpected peaks.",
      },
    ],
  },
  {
    category: "cost",
    issue: "storage-cost-growth",
    title: "Control Cloud Storage Cost Growth and Optimize Data Lifecycle",
    description:
      "Manage growing cloud storage costs by implementing lifecycle policies, tiered storage, and data retention strategies.",
    keywords: ["cloud storage cost fix", "reduce S3 costs", "storage lifecycle policy", "cloud storage optimization"],
    problem: "Cloud storage costs are growing month over month as data accumulates without lifecycle management.",
    cause: "Data is stored indefinitely in high-performance tiers without archival policies, and old data is never deleted or transitioned.",
    explanation:
      "Storage costs grow linearly with data volume. When all data — including logs, backups, and historical records — stays in hot storage tiers (e.g., S3 Standard, GCS Standard), costs compound. Without retention policies, data accumulates indefinitely, and teams lose visibility into what's stored and why.",
    fix: [
      "Implement S3 Lifecycle policies to transition old objects to Infrequent Access or Glacier tiers",
      "Set retention policies on log buckets to auto-delete data older than the required retention window",
      "Audit large buckets to identify and remove obsolete backups, temp files, and duplicate data",
      "Enable intelligent tiering to automatically move objects between tiers based on access patterns",
      "Compress stored data where possible — especially logs, JSON exports, and CSV files",
    ],
    prevention: [
      "Require lifecycle policies on every new storage bucket at creation time",
      "Monitor per-bucket storage growth and set cost alerts",
      "Document data retention requirements per data classification",
    ],
    faq: [
      {
        question: "What is S3 Intelligent Tiering?",
        answer:
          "S3 Intelligent Tiering automatically moves objects between access tiers based on changing access patterns, optimizing cost without manual intervention or retrieval fees.",
      },
      {
        question: "How much can lifecycle policies save?",
        answer:
          "Transitioning infrequently accessed data to Glacier can save up to 70-80% compared to Standard storage pricing.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Data — Errors (5)                                                  */
/* ------------------------------------------------------------------ */

const errors: SeoEntry[] = [
  {
    category: "errors",
    issue: "unhandled-exception",
    title: "Fix Unhandled Exceptions Crashing Cloud Applications",
    description:
      "Resolve unhandled exceptions that cause crashes, restarts, and downtime in production cloud applications.",
    keywords: ["unhandled exception fix", "application crash fix", "uncaught error production", "error handling best practices"],
    problem: "Unhandled exceptions are crashing the application in production, causing restarts and user-facing downtime.",
    cause: "Missing try-catch blocks, unvalidated external inputs, and absent error boundaries allow exceptions to propagate uncaught.",
    explanation:
      "When an exception is thrown and no handler catches it, the process terminates. In containerized environments, the orchestrator restarts the container, but users experience errors during the restart window. Missing input validation and absent error boundaries in API handlers are the most common causes.",
    fix: [
      "Add structured try-catch blocks around all external API calls and database operations",
      "Implement global error handlers and uncaughtException/unhandledRejection listeners",
      "Validate all external inputs with schema validation (e.g., Zod, Joi) before processing",
      "Add error boundaries in UI frameworks to isolate component-level failures",
      "Set up structured logging to capture the full stack trace and request context on every error",
    ],
    prevention: [
      "Enforce error handling patterns in code review checklists",
      "Use TypeScript strict mode to catch potential null/undefined errors at compile time",
      "Write integration tests that cover error paths, not just happy paths",
    ],
    faq: [
      {
        question: "What is an unhandled exception?",
        answer:
          "An unhandled exception is an error that occurs during execution but is not caught by any try-catch block or error handler, causing the process to crash.",
      },
      {
        question: "How do I catch all unhandled errors in Node.js?",
        answer:
          "Listen for process.on('uncaughtException') and process.on('unhandledRejection'). However, these should be a safety net — fix the root cause rather than relying on global handlers.",
      },
    ],
  },
  {
    category: "errors",
    issue: "dependency-failure",
    title: "Fix Dependency Failures Causing Cascading Errors",
    description:
      "Resolve cascading failures triggered by failing upstream dependencies and unstable third-party services.",
    keywords: ["dependency failure fix", "cascading error cloud", "upstream service failure", "circuit breaker pattern"],
    problem: "A failing upstream dependency is causing cascading errors across the application, degrading all connected services.",
    cause: "Tight coupling to upstream services without timeouts, retries, or circuit breakers allows a single failure to propagate system-wide.",
    explanation:
      "When a dependent service fails and the calling service has no timeout or fallback, requests queue up waiting for a response that never comes. Thread pools exhaust, connection pools fill, and the failure cascades to every service that depends on the now-overwhelmed caller.",
    fix: [
      "Implement circuit breakers to stop calling a failing service and return a fallback response",
      "Add request timeouts on every outgoing HTTP call to prevent indefinite waiting",
      "Use retry logic with exponential backoff for transient failures",
      "Verify upstream service health with dedicated health-check endpoints before routing traffic",
      "Implement bulkheads to isolate failure domains and prevent cross-service contamination",
    ],
    prevention: [
      "Map all service dependencies and identify single points of failure",
      "Run chaos engineering experiments to test resilience to dependency failures",
      "Set up dependency health dashboards and alert on degradation",
    ],
    faq: [
      {
        question: "What is a circuit breaker in software?",
        answer:
          "A circuit breaker monitors calls to an external service. When failures exceed a threshold, it 'opens' and short-circuits requests with a fallback, preventing the caller from overwhelming the failing service.",
      },
      {
        question: "How do I prevent cascading failures?",
        answer:
          "Use circuit breakers, timeouts, retries with backoff, bulkheads, and fallback responses. Design services to degrade gracefully rather than fail completely.",
      },
    ],
  },
  {
    category: "errors",
    issue: "database-connection-errors",
    title: "Fix Database Connection Errors in Cloud Applications",
    description:
      "Resolve database connection failures, pool exhaustion, and authentication errors that cause application downtime.",
    keywords: ["database connection error fix", "connection pool exhaustion", "database timeout error", "cloud database errors"],
    problem: "The application cannot establish or maintain database connections, causing queries to fail and features to break.",
    cause: "Connection pool exhaustion, network configuration issues, credential rotation failures, or database resource limits are blocking connections.",
    explanation:
      "Database connections are a finite resource. When the application opens connections faster than it releases them — due to missing connection pooling, leaked connections, or long-running transactions — the pool exhausts. New requests fail with connection timeout errors.",
    fix: [
      "Implement connection pooling with a max-pool-size that matches your database's connection limit",
      "Ensure connections are properly released after each query — check for leaks in error paths",
      "Verify network configuration: security groups, VPC peering, and DNS resolution to the database",
      "Check database server resource limits (max_connections, CPU, memory) and scale if needed",
      "Add connection retry logic with backoff for transient network failures",
    ],
    prevention: [
      "Monitor active connection count and alert when approaching the pool limit",
      "Set connection idle timeouts to reclaim unused connections automatically",
      "Test database failover scenarios to ensure the application reconnects gracefully",
    ],
    faq: [
      {
        question: "What causes connection pool exhaustion?",
        answer:
          "It happens when the application opens more connections than it releases. Common causes include leaked connections in error paths, long-running transactions, and misconfigured pool sizes.",
      },
      {
        question: "How many database connections should I allow?",
        answer:
          "It depends on your database. PostgreSQL defaults to 100. Set your pool size to a fraction of max_connections, leaving room for admin access and other services.",
      },
    ],
  },
  {
    category: "errors",
    issue: "rate-limiting-errors",
    title: "Fix Rate Limiting and 429 Too Many Requests Errors",
    description:
      "Resolve HTTP 429 errors and rate limiting issues when calling APIs, cloud services, or third-party integrations.",
    keywords: ["429 too many requests fix", "rate limiting errors", "api rate limit exceeded", "throttling fix cloud"],
    problem: "API requests are being rejected with 429 Too Many Requests errors, blocking critical application functionality.",
    cause: "Request volume exceeds the rate limits set by the API provider, or bursts of traffic trigger throttling mechanisms.",
    explanation:
      "Rate limiting is a protective mechanism that APIs use to prevent abuse and ensure fair usage. When your application sends too many requests in a short window, the server responds with 429 status codes. This is especially common with third-party APIs, payment gateways, and cloud provider control-plane APIs.",
    fix: [
      "Implement client-side rate limiting to stay within the API's documented limits",
      "Add exponential backoff and retry logic that respects the Retry-After header",
      "Cache API responses locally to reduce the total number of outgoing requests",
      "Spread requests over time using a queue or token-bucket algorithm instead of bursting",
      "Request a rate limit increase from the API provider if your use case justifies higher throughput",
    ],
    prevention: [
      "Monitor outgoing request rates and alert when approaching API limits",
      "Design systems with rate limits in mind from the start — never assume unlimited throughput",
      "Use API usage dashboards to track consumption per service and endpoint",
    ],
    faq: [
      {
        question: "What does a 429 status code mean?",
        answer:
          "HTTP 429 means 'Too Many Requests.' The server is rate-limiting your client because you've exceeded the allowed number of requests in a given time period.",
      },
      {
        question: "How do I handle Retry-After headers?",
        answer:
          "Read the Retry-After header value (in seconds or as a date), wait that long before retrying. Combine this with exponential backoff for best results.",
      },
    ],
  },
  {
    category: "errors",
    issue: "cors-errors",
    title: "Fix CORS Errors in Cloud API and Web Applications",
    description:
      "Resolve Cross-Origin Resource Sharing (CORS) errors that block frontend applications from accessing backend APIs.",
    keywords: ["cors error fix", "cross origin error fix", "cors policy blocked", "cors headers configuration"],
    problem: "Frontend requests to the API are blocked by the browser due to CORS policy violations.",
    cause: "The backend API is not returning the correct Access-Control-Allow-Origin headers, or preflight OPTIONS requests are not handled.",
    explanation:
      "Browsers enforce the Same-Origin Policy and block cross-origin requests unless the server explicitly allows them via CORS headers. When a frontend hosted on one domain calls an API on another domain, the browser sends a preflight OPTIONS request. If the API doesn't respond with the correct headers, the browser blocks the actual request.",
    fix: [
      "Configure the API to return Access-Control-Allow-Origin with the frontend's domain (avoid wildcard * in production)",
      "Handle OPTIONS preflight requests and return Access-Control-Allow-Methods and Access-Control-Allow-Headers",
      "If using credentials (cookies, auth headers), set Access-Control-Allow-Credentials: true",
      "Ensure API gateways and reverse proxies are not stripping CORS headers from responses",
      "For development, use a proxy in your dev server config instead of disabling CORS entirely",
    ],
    prevention: [
      "Document CORS configuration as part of API setup runbooks",
      "Test CORS in integration tests to catch misconfigurations before deployment",
      "Audit CORS headers after infrastructure changes or proxy configuration updates",
    ],
    faq: [
      {
        question: "Why do CORS errors only happen in the browser?",
        answer:
          "CORS is a browser security feature. Server-to-server requests (e.g., from Node.js backends) are not subject to CORS because they don't use the Same-Origin Policy.",
      },
      {
        question: "Is it safe to use Access-Control-Allow-Origin: *?",
        answer:
          "Wildcard (*) is acceptable for public, read-only APIs. For APIs that use cookies or authentication, you must specify the exact origin domain.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Data — AI (5)                                                      */
/* ------------------------------------------------------------------ */

const ai: SeoEntry[] = [
  {
    category: "ai",
    issue: "ai-hallucination",
    title: "Fix AI Hallucination and Improve Model Accuracy",
    description:
      "Reduce AI hallucinations by improving prompt engineering, adding grounding data, and implementing output validation.",
    keywords: ["ai hallucination fix", "reduce ai hallucination", "llm accuracy improvement", "ai output validation"],
    problem: "AI model is producing fabricated or incorrect information that undermines trust in the system output.",
    cause: "Vague prompts, missing grounding context, and lack of output validation allow the model to generate plausible but incorrect responses.",
    explanation:
      "LLMs generate responses probabilistically based on patterns in training data. Without explicit constraints and grounding information, the model fills knowledge gaps with statistically plausible but factually incorrect content. This is especially common for domain-specific questions outside the model's training distribution.",
    fix: [
      "Add explicit constraints and rules to prompts that define acceptable output boundaries",
      "Provide grounding context using retrieval-augmented generation (RAG) from verified sources",
      "Implement output validation with schema checks and confidence scoring",
      "Use few-shot examples in prompts to guide the model toward correct response patterns",
      "Add a post-processing step that cross-references claims against known facts",
    ],
    prevention: [
      "Build an evaluation suite that tests model output against known-correct answers",
      "Log all model inputs and outputs for debugging and quality tracking",
      "Set confidence thresholds — only surface results above an acceptable accuracy level",
    ],
    faq: [
      {
        question: "What is AI hallucination?",
        answer:
          "AI hallucination is when a language model generates information that sounds plausible but is factually incorrect, fabricated, or not supported by the input context.",
      },
      {
        question: "Can RAG completely eliminate hallucinations?",
        answer:
          "RAG significantly reduces hallucinations by grounding responses in retrieved documents, but it cannot eliminate them entirely. Output validation and confidence scoring provide additional safety layers.",
      },
    ],
  },
  {
    category: "ai",
    issue: "prompt-engineering-issues",
    title: "Fix Prompt Engineering Issues for Better AI Output",
    description:
      "Improve AI prompt design to get consistent, accurate, and structured output from language models.",
    keywords: ["prompt engineering fix", "better ai prompts", "llm prompt optimization", "structured ai output"],
    problem: "AI model responses are inconsistent, vague, or poorly structured due to ineffective prompt design.",
    cause: "Prompts lack clear instructions, constraints, output format specifications, and contextual examples.",
    explanation:
      "The quality of AI output is directly proportional to the quality of the prompt. Vague instructions produce vague results. Without specifying the desired output format, constraints, and providing examples, the model defaults to generic, unpredictable responses that vary with each call.",
    fix: [
      "Define explicit output format requirements (JSON, numbered list, etc.) in every prompt",
      "Add role context — tell the model what role it should assume and what expertise to apply",
      "Include 2-3 few-shot examples that demonstrate the expected input-output pattern",
      "Add negative constraints — explicitly state what the model should NOT do",
      "Break complex tasks into sequential sub-prompts for more predictable results",
    ],
    prevention: [
      "Version control prompts and track changes alongside code deployments",
      "Test prompts with diverse inputs before deploying to production",
      "Create a prompt library with tested templates for common use cases",
    ],
    faq: [
      {
        question: "What makes a good AI prompt?",
        answer:
          "A good prompt has: a clear role, specific instructions, output format requirements, constraints, and ideally 2-3 examples of desired behavior.",
      },
      {
        question: "Why does the same prompt give different results?",
        answer:
          "LLMs are non-deterministic by default due to temperature settings. Set temperature to 0 for maximum consistency, or use seed parameters when available.",
      },
    ],
  },
  {
    category: "ai",
    issue: "high-ai-api-costs",
    title: "Reduce High AI API Costs for LLM Applications",
    description:
      "Optimize AI API usage and costs by implementing caching, token management, and model selection strategies.",
    keywords: ["reduce ai api costs", "llm cost optimization", "openai cost reduction", "ai token management"],
    problem: "AI API costs are growing rapidly as usage scales, threatening the financial viability of the application.",
    cause: "Unoptimized token usage, missing response caching, oversized prompts, and using expensive models for simple tasks drive costs up.",
    explanation:
      "AI API pricing is based on tokens processed. Every character in the prompt and response is counted. Large system prompts, verbose responses, redundant calls, and using GPT-4-class models for tasks that GPT-3.5 or smaller models can handle all inflate costs. At scale, these inefficiencies compound quickly.",
    fix: [
      "Cache identical or semantically similar queries to avoid redundant API calls",
      "Trim prompts to the minimum context needed — remove verbose instructions and examples",
      "Route simple tasks to cheaper, smaller models and reserve expensive models for complex reasoning",
      "Set max_tokens limits on responses to prevent unnecessarily long outputs",
      "Batch related requests where possible to reduce per-call overhead",
    ],
    prevention: [
      "Monitor token usage and cost per endpoint with real-time dashboards",
      "Set per-user and per-feature rate limits to prevent runaway usage",
      "Evaluate open-source model alternatives for tasks that don't require frontier capabilities",
    ],
    faq: [
      {
        question: "How are AI API costs calculated?",
        answer:
          "Costs are based on tokens — roughly 4 characters per token for English. Both input (prompt) and output (response) tokens are billed, often at different rates.",
      },
      {
        question: "Can caching reduce AI API costs significantly?",
        answer:
          "Yes. Semantic caching can reduce API calls by 30-60% for applications with repetitive query patterns, directly cutting costs.",
      },
    ],
  },
  {
    category: "ai",
    issue: "slow-ai-response-time",
    title: "Fix Slow AI Response Times in Production Applications",
    description:
      "Optimize AI model response latency for better user experience in real-time applications using streaming, caching, and model optimization.",
    keywords: ["slow ai response fix", "llm latency optimization", "ai streaming response", "reduce ai response time"],
    problem: "AI-powered features are too slow for real-time user interactions, causing poor user experience.",
    cause: "Large model sizes, long prompts, synchronous processing, and missing response caching create unacceptable latency.",
    explanation:
      "AI model inference time depends on model size, input length, and output length. Large models with long prompts produce slower responses. Without streaming, the user waits for the entire response to be generated before seeing anything. Synchronous processing blocks the UI thread.",
    fix: [
      "Implement streaming responses so users see output as it's generated token by token",
      "Use smaller, faster models for latency-critical features where full reasoning isn't needed",
      "Cache common queries and their responses to serve repeated requests instantly",
      "Reduce prompt length by removing unnecessary context and using concise instructions",
      "Run inference asynchronously and show a loading state while processing",
    ],
    prevention: [
      "Set latency SLOs for AI features and monitor P95 response times",
      "Benchmark model alternatives for speed vs quality tradeoffs",
      "Design UX around progressive disclosure — show partial results early",
    ],
    faq: [
      {
        question: "Why are AI API responses slow?",
        answer:
          "Response time depends on model size, prompt length, max output tokens, and server load. Larger models and longer prompts take more time to generate responses.",
      },
      {
        question: "Does streaming actually improve AI response speed?",
        answer:
          "Streaming doesn't reduce total generation time, but it drastically improves perceived speed because users see the first tokens within milliseconds instead of waiting for the full response.",
      },
    ],
  },
  {
    category: "ai",
    issue: "ai-output-inconsistency",
    title: "Fix AI Output Inconsistency and Non-Deterministic Responses",
    description:
      "Make AI model outputs more consistent and deterministic for production applications requiring reliable results.",
    keywords: ["ai inconsistency fix", "deterministic ai output", "llm reproducibility", "consistent ai responses"],
    problem: "The AI model produces different outputs for the same input, making results unpredictable and unreliable.",
    cause: "Non-zero temperature settings, ambiguous prompts, and lack of structured output enforcement allow variable responses.",
    explanation:
      "LLMs are inherently stochastic — they sample from probability distributions to generate tokens. With temperature > 0, each run can produce different outputs. Combined with ambiguous prompts that don't constrain the response format, outputs vary widely in structure, length, and content.",
    fix: [
      "Set temperature to 0 (or as low as possible) for deterministic output in production",
      "Use structured output modes (JSON mode, function calling) to enforce response format",
      "Add explicit format requirements and constraints in the system prompt",
      "Implement output parsing with schema validation (e.g., Zod) to reject malformed responses",
      "Use seed parameters when available to improve reproducibility across identical inputs",
    ],
    prevention: [
      "Test prompt + model combinations with automated evaluation suites",
      "Pin model versions to prevent behavior changes from model updates",
      "Log input-output pairs to detect consistency drift over time",
    ],
    faq: [
      {
        question: "What does temperature control in AI models?",
        answer:
          "Temperature controls randomness. At 0, the model always picks the most likely token, producing deterministic output. Higher values increase randomness and creativity.",
      },
      {
        question: "How do I validate AI model output format?",
        answer:
          "Use JSON mode or function calling to constrain output format, then parse the result with a schema validator like Zod to ensure all required fields are present and correctly typed.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Combined export                                                    */
/* ------------------------------------------------------------------ */

export const seoEntries: SeoEntry[] = [...performance, ...cost, ...errors, ...ai];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function findEntry(category: string, issue: string): SeoEntry | undefined {
  return seoEntries.find((e) => e.category === category && e.issue === issue);
}

export function getRelated(current: SeoEntry, limit = 5): SeoEntry[] {
  const sameCategory = seoEntries.filter(
    (e) => e.category === current.category && e.issue !== current.issue,
  );
  const otherCategory = seoEntries.filter((e) => e.category !== current.category);
  return [...sameCategory.slice(0, Math.ceil(limit / 2)), ...otherCategory.slice(0, Math.floor(limit / 2))].slice(0, limit);
}

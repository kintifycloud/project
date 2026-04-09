"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ClipboardCopy, Play, Terminal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ActionItem = {
  label: string;
  description: string;
  snippet?: string;
  lang?: string;
};

type ActionPanelProps = {
  fixSteps: string[];
  expanded?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Keyword → Action mapping                                           */
/* ------------------------------------------------------------------ */

const ACTION_MAP: { keywords: string[]; action: ActionItem }[] = [
  {
    keywords: ["caching", "cache", "redis", "in-memory"],
    action: {
      label: "Enable caching layer",
      description: "Install Redis or add an in-memory cache to reduce repeated computation.",
      lang: "bash",
      snippet: `# Install Redis client
npm install ioredis

# Basic cache pattern
import Redis from "ioredis"
const redis = new Redis()

async function getCached(key: string, fetcher: () => Promise<unknown>) {
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)
  const data = await fetcher()
  await redis.set(key, JSON.stringify(data), "EX", 300)
  return data
}`,
    },
  },
  {
    keywords: ["parallel", "promise.all", "concurrent", "sequential"],
    action: {
      label: "Parallelize API calls",
      description: "Replace sequential awaits with Promise.all to cut total latency.",
      lang: "ts",
      snippet: `// Before — sequential (slow)
const users = await fetchUsers()
const orders = await fetchOrders()

// After — parallel (fast)
const [users, orders] = await Promise.all([
  fetchUsers(),
  fetchOrders(),
])`,
    },
  },
  {
    keywords: ["database", "queries", "index", "indexes", "query"],
    action: {
      label: "Optimize database queries",
      description: "Add indexes on frequently filtered columns and review query plans.",
      lang: "sql",
      snippet: `-- Add index on commonly queried columns
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_logs_created_at ON logs(created_at);

-- Check query execution plan
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = $1;`,
    },
  },
  {
    keywords: ["cdn", "edge", "static"],
    action: {
      label: "Add CDN / edge caching",
      description: "Serve static or semi-static responses from the edge to reduce origin load.",
      lang: "ts",
      snippet: `// Next.js route with revalidation
export const revalidate = 60 // seconds

// Or set cache headers manually
res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")`,
    },
  },
  {
    keywords: ["profile", "profiling", "slow endpoint", "hot path"],
    action: {
      label: "Profile slow endpoints",
      description: "Instrument critical paths to identify where time is spent.",
      lang: "ts",
      snippet: `const start = performance.now()
const result = await expensiveOperation()
const duration = performance.now() - start
console.log(\`Operation took \${duration.toFixed(1)}ms\`)

// Or use Node.js built-in profiler
// node --prof app.js`,
    },
  },
  {
    keywords: ["audit", "unused", "remove", "cleanup"],
    action: {
      label: "Audit and clean resources",
      description: "List active resources and remove anything idle or orphaned.",
      lang: "bash",
      snippet: `# AWS — find unattached EBS volumes
aws ec2 describe-volumes \\
  --filters Name=status,Values=available \\
  --query 'Volumes[*].{ID:VolumeId,Size:Size}'

# GCP — list idle VMs
gcloud compute instances list \\
  --filter="status=TERMINATED"`,
    },
  },
  {
    keywords: ["budget", "alert", "spending", "limit", "cost"],
    action: {
      label: "Set budget alerts",
      description: "Configure spending thresholds to catch anomalies before they escalate.",
      lang: "bash",
      snippet: `# AWS — create a budget alarm
aws budgets create-budget \\
  --account-id 123456789012 \\
  --budget file://budget.json \\
  --notifications-with-subscribers file://notify.json

# Or use your cloud console's budget dashboard`,
    },
  },
  {
    keywords: ["right-size", "resize", "instance", "compute", "reserved", "spot"],
    action: {
      label: "Right-size compute",
      description: "Match instance types to actual utilisation to cut waste.",
      lang: "bash",
      snippet: `# AWS — get utilization recommendations
aws compute-optimizer get-ec2-instance-recommendations

# Kubernetes — check resource requests vs actual
kubectl top pods --containers`,
    },
  },
  {
    keywords: ["logs", "stack trace", "log", "logging", "exception"],
    action: {
      label: "Query logs for root cause",
      description: "Search structured logs for the originating error.",
      lang: "bash",
      snippet: `# Search recent error logs
grep -rn "ERROR\\|Exception\\|FATAL" /var/log/app/ --include="*.log" | tail -50

# Or with structured logging (e.g. Datadog, CloudWatch)
# Filter: status:error @service:api @level:error`,
    },
  },
  {
    keywords: ["error boundary", "error boundaries", "retry", "backoff", "try-catch"],
    action: {
      label: "Add retry logic with backoff",
      description: "Wrap unreliable calls with exponential backoff to handle transient failures.",
      lang: "ts",
      snippet: `async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 200
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise((r) => setTimeout(r, delay * 2 ** i))
    }
  }
  throw new Error("Unreachable")
}`,
    },
  },
  {
    keywords: ["health check", "dependency", "dependencies", "upstream", "validate"],
    action: {
      label: "Verify dependency health",
      description: "Ping upstream services to isolate which dependency is failing.",
      lang: "ts",
      snippet: `async function checkHealth(services: Record<string, string>) {
  const results = await Promise.allSettled(
    Object.entries(services).map(async ([name, url]) => {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      return { name, ok: res.ok, status: res.status }
    })
  )
  return results.map((r) =>
    r.status === "fulfilled" ? r.value : { name: "unknown", ok: false }
  )
}`,
    },
  },
  {
    keywords: ["prompt", "clarity", "constraints", "few-shot", "examples"],
    action: {
      label: "Improve prompt engineering",
      description: "Add structure, constraints, and examples to guide model output.",
      lang: "ts",
      snippet: `const prompt = \`You are a cloud diagnostics expert.

Given the following system issue, respond with:
1. Root cause (one sentence)
2. Fix steps (numbered list)
3. Prevention tips (bullet list)

Rules:
- Be specific and actionable
- Do not hallucinate services the user didn't mention
- If uncertain, say so explicitly

Issue: \${userInput}\``,
    },
  },
  {
    keywords: ["validation", "confidence", "scoring", "schema", "output"],
    action: {
      label: "Add output validation",
      description: "Parse and validate model output against a schema before surfacing.",
      lang: "ts",
      snippet: `import { z } from "zod"

const AnalysisSchema = z.object({
  problem: z.string().min(10),
  cause: z.string().min(10),
  fix: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1),
})

const parsed = AnalysisSchema.safeParse(modelOutput)
if (!parsed.success) {
  console.error("Invalid output:", parsed.error.flatten())
}`,
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Matching logic                                                     */
/* ------------------------------------------------------------------ */

function matchActions(fixSteps: string[]): ActionItem[] {
  const joined = fixSteps.join(" ").toLowerCase();
  const matched: ActionItem[] = [];
  const seen = new Set<string>();

  for (const entry of ACTION_MAP) {
    if (seen.has(entry.action.label)) continue;
    if (entry.keywords.some((kw) => joined.includes(kw))) {
      matched.push(entry.action);
      seen.add(entry.action.label);
    }
  }

  return matched;
}

/* ------------------------------------------------------------------ */
/*  CopyButton                                                         */
/* ------------------------------------------------------------------ */

function CopySnippetButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked
    }
  }

  return (
    <button
      aria-label="Copy snippet"
      className="absolute right-2 top-2 rounded-md border border-white/8 bg-white/[0.04] p-1.5 text-slate-500 transition-colors hover:bg-white/[0.08] hover:text-slate-300"
      onClick={handleCopy}
      type="button"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  ActionPanel                                                        */
/* ------------------------------------------------------------------ */

export function ActionPanel({ fixSteps, expanded = true }: ActionPanelProps) {
  const actions = matchActions(fixSteps);

  if (actions.length === 0) return null;

  return (
    <Card className="rounded-xl border-emerald-400/10 bg-emerald-400/[0.02] shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Play className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">Action Plan</span>
          <Badge className="ml-auto border-emerald-400/20 bg-emerald-400/10 text-emerald-300 text-[10px]">
            {actions.length} {actions.length === 1 ? "action" : "actions"}
          </Badge>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4 overflow-hidden"
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              {actions.map((action, index) => (
                <motion.div
                  key={action.label}
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 6 }}
                  transition={{ delay: index * 0.06, duration: 0.25 }}
                >
                  <div className="rounded-lg border border-white/6 bg-white/[0.02] p-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-emerald-400/70" />
                      <p className="text-xs font-semibold text-slate-200">{action.label}</p>
                    </div>
                    <p className="mb-3 text-xs leading-relaxed text-slate-400">{action.description}</p>

                    {action.snippet ? (
                      <div className="relative">
                        <CopySnippetButton text={action.snippet} />
                        <pre className="overflow-x-auto rounded-md border border-white/6 bg-slate-950/80 p-3 pr-10 font-mono text-[11px] leading-relaxed text-slate-300">
                          <code>{action.snippet}</code>
                        </pre>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Code2, Key, Shield, Terminal, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { siteUrl } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "API Documentation | Kintify",
  description:
    "Integrate Kintify cloud diagnostics into your own systems. Structured analysis API with confidence scoring, impact levels, and actionable fixes.",
  alternates: { canonical: "/api-docs" },
  openGraph: {
    title: "API Documentation | Kintify",
    description: "Integrate Kintify cloud diagnostics into your own systems.",
    url: `${siteUrl}/api-docs`,
    type: "website",
  },
};

/* ------------------------------------------------------------------ */
/*  Code block                                                         */
/* ------------------------------------------------------------------ */

function CodeBlock({ title, lang, code }: { title: string; lang: string; code: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <Code2 className="h-3.5 w-3.5 text-emerald-400/70" />
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <Badge className="ml-auto border-white/8 bg-white/[0.04] text-[9px] text-slate-500" variant="outline">
          {lang}
        </Badge>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-white/6 bg-slate-950/80 p-4 font-mono text-[12px] leading-relaxed text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ApiDocsPage() {
  return (
    <main className="overflow-x-hidden pb-24">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 grid-veil opacity-50" />
        <div className="mx-auto w-full max-w-2xl py-10 sm:py-14 md:py-20">
          {/* Nav */}
          <div className="mb-8">
            <Button asChild size="sm" variant="ghost">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>

          {/* Header */}
          <Badge variant="secondary" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Developer Documentation
          </Badge>
          <h1 className="mt-4 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            Kintify Analyze API
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
            Integrate Kintify cloud diagnostics into your own systems. Send a system issue, get a structured diagnosis with confidence scoring, impact levels, and actionable fixes.
          </p>

          <Separator className="my-8 bg-white/8" />

          <div className="space-y-10">
            {/* Endpoint */}
            <Section icon={<Zap className="h-4 w-4 text-emerald-400" />} title="Endpoint">
              <Card className="rounded-xl border-white/8 bg-white/[0.03]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300">POST</Badge>
                    <code className="text-sm text-white">{siteUrl}/api/analyze</code>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Accepts JSON body with a system issue description. Returns a structured analysis.
                  </p>
                </CardContent>
              </Card>
            </Section>

            {/* Authentication */}
            <Section icon={<Key className="h-4 w-4 text-amber-400" />} title="Authentication">
              <Card className="rounded-xl border-white/8 bg-white/[0.03]">
                <CardContent className="space-y-3 p-4">
                  <p className="text-sm text-slate-300">
                    Include your API key in the <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs text-emerald-300">x-api-key</code> header.
                  </p>
                  <div className="rounded-md border border-white/6 bg-slate-950/80 p-3 font-mono text-[12px] text-slate-300">
                    x-api-key: demo-key
                  </div>
                  <p className="text-xs text-slate-500">
                    Use <code className="text-emerald-400/70">demo-key</code> for testing. Rate limited to 60 requests/minute.
                  </p>
                </CardContent>
              </Card>
            </Section>

            {/* Rate Limits */}
            <Section icon={<Shield className="h-4 w-4 text-violet-400" />} title="Rate Limits">
              <Card className="rounded-xl border-white/8 bg-white/[0.03]">
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Demo tier</span>
                      <Badge className="border-white/8 bg-white/[0.04] text-slate-400" variant="outline">60 req/min</Badge>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Exceeding the limit returns <code className="text-rose-400/70">429 Too Many Requests</code> with a <code className="text-slate-400">Retry-After</code> header.
                  </p>
                </CardContent>
              </Card>
            </Section>

            {/* Request */}
            <Section icon={<Terminal className="h-4 w-4 text-sky-400" />} title="Request">
              <div className="space-y-4">
                <CodeBlock
                  title="Request body"
                  lang="JSON"
                  code={`{
  "input": "my api is slow and costs are high"
}`}
                />

                <Card className="rounded-xl border-white/8 bg-white/[0.03]">
                  <CardContent className="p-4">
                    <h3 className="mb-2 text-xs font-semibold text-slate-400">Parameters</h3>
                    <div className="flex items-start gap-3">
                      <code className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-xs text-emerald-300">input</code>
                      <div>
                        <p className="text-xs text-slate-300">
                          <span className="font-medium text-white">string, required</span> — The system issue, error message, or symptom to analyze. Minimum 3 characters.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Section>

            {/* Response */}
            <Section icon={<Code2 className="h-4 w-4 text-emerald-400" />} title="Response">
              <CodeBlock
                title="Success (200)"
                lang="JSON"
                code={`{
  "category": "performance",
  "problem": "Performance degradation detected",
  "cause": "High latency due to inefficient request handling",
  "explanation": "This usually happens when requests are processed sequentially...",
  "fix": [
    "Implement caching (Redis or in-memory)",
    "Use parallel API calls instead of sequential",
    "Optimize database queries and add indexes"
  ],
  "prevention": [
    "Monitor latency with structured logging",
    "Set up rate limits and request budgets",
    "Use autoscaling where possible"
  ],
  "confidence": 87,
  "impact": "High",
  "improvement": "+40% faster",
  "slug": "my-api-is-slow-and-costs-are-high"
}`}
              />
            </Section>

            {/* Errors */}
            <Section icon={<Shield className="h-4 w-4 text-rose-400" />} title="Error Responses">
              <div className="space-y-3">
                {[
                  { status: "400", desc: "Input too short or missing", body: '{ "error": "Input too short. Provide more details." }' },
                  { status: "401", desc: "Invalid or missing API key", body: '{ "error": "Invalid API key." }' },
                  { status: "429", desc: "Rate limit exceeded", body: '{ "error": "Rate limit exceeded. Max 60 requests per minute." }' },
                  { status: "500", desc: "Internal server error", body: '{ "error": "Analysis failed. Try again." }' },
                ].map((err) => (
                  <Card key={err.status} className="rounded-lg border-white/6 bg-white/[0.02]">
                    <CardContent className="flex items-start gap-3 p-3">
                      <Badge className="shrink-0 border-rose-400/20 bg-rose-400/10 text-rose-300 text-[10px]">
                        {err.status}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-300">{err.desc}</p>
                        <code className="mt-1 block text-[11px] text-slate-500">{err.body}</code>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Section>

            <Separator className="bg-white/8" />

            {/* Code examples */}
            <Section icon={<Code2 className="h-4 w-4 text-amber-400" />} title="Code Examples">
              <div className="space-y-6">
                <CodeBlock
                  title="cURL"
                  lang="bash"
                  code={`curl -X POST ${siteUrl}/api/analyze \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: demo-key" \\
  -d '{"input":"my api is slow and timing out"}'`}
                />

                <CodeBlock
                  title="JavaScript (fetch)"
                  lang="JavaScript"
                  code={`const response = await fetch("${siteUrl}/api/analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "demo-key",
  },
  body: JSON.stringify({
    input: "my api is slow and timing out",
  }),
});

const data = await response.json();
console.log(data.category);   // "performance"
console.log(data.confidence);  // 87
console.log(data.fix);         // ["Implement caching...", ...]`}
                />

                <CodeBlock
                  title="Python (requests)"
                  lang="Python"
                  code={`import requests

response = requests.post(
    "${siteUrl}/api/analyze",
    headers={"x-api-key": "demo-key"},
    json={"input": "my api is slow and timing out"},
)

data = response.json()
print(data["category"])    # "performance"
print(data["confidence"])  # 87
print(data["fix"])         # ["Implement caching...", ...]`}
                />
              </div>
            </Section>

            <Separator className="bg-white/8" />

            {/* CTA */}
            <div className="text-center">
              <p className="mb-2 text-sm text-slate-400">Ready to try it?</p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button asChild variant="outline">
                  <Link href="/fix">Try the interactive tool</Link>
                </Button>
              </div>
              <p className="mt-6 text-xs text-slate-600">
                Need higher rate limits or a production key? Contact us at hello@kintify.cloud
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

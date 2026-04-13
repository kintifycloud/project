import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { FixProblemCTA } from "@/components/FixProblemCTA";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  fixProblems,
  findFixProblem,
  getRelatedProblems,
  type FixProblem,
} from "@/lib/fixProblems";
import { siteUrl } from "@/lib/schemas";

/* ------------------------------------------------------------------ */
/*  Static params — pre-render every slug at build time                */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return fixProblems.map((p) => ({ category: p.slug }));
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PageProps = {
  params: Promise<{ category: string }>;
};

/* ------------------------------------------------------------------ */
/*  JSON-LD builders                                                   */
/* ------------------------------------------------------------------ */

function buildKeywords(p: FixProblem) {
  return [p.problem, "debugging", "cloud fix", ...p.causes.slice(0, 3)];
}

function buildWebPageSchema(p: FixProblem) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${p.title} | Kintify`,
    url: `${siteUrl}/fix/${p.slug}`,
    description: p.directAnswer,
    publisher: {
      "@type": "Organization",
      name: "Kintify",
      url: siteUrl,
    },
    about: p.problem,
  };
}

function buildFaqSchema(p: FixProblem) {
  if (p.faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: p.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

function buildHowToSchema(p: FixProblem) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: p.title,
    description: p.directAnswer,
    url: `${siteUrl}/fix/${p.slug}`,
    step: p.fixes.map((fix, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `Step ${i + 1}`,
      text: fix,
    })),
  };
}

function buildTechArticleSchema(p: FixProblem) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: p.title,
    description: p.directAnswer,
    url: `${siteUrl}/fix/${p.slug}`,
    author: {
      "@type": "Organization",
      name: "Kintify",
    },
    about: p.problem,
    keywords: buildKeywords(p),
  };
}

function buildSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Kintify",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
      "Technical issue diagnosis for cloud, infrastructure, API, and runtime errors.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

function DirectAnswer({
  title,
  answer,
}: {
  title: string;
  answer: string;
}) {
  return (
    <section
      aria-labelledby="direct-answer"
      className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-5 sm:p-6"
    >
      <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h1>
      <h2 id="direct-answer" className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
        Direct answer
      </h2>
      <p className="mt-3 text-sm leading-7 text-zinc-100 sm:text-base">{answer}</p>
    </section>
  );
}

function StructuredBreakdown({ problem }: { problem: FixProblem }) {
  return (
    <section aria-labelledby="structured-breakdown" className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
      <h2 id="structured-breakdown" className="text-lg font-semibold text-white">
        Structured breakdown
      </h2>
      <div className="mt-5 space-y-5">
        <section>
          <h3 className="text-sm font-semibold text-zinc-200">Cause</h3>
          <p className="mt-2 text-sm leading-7 text-zinc-300">{problem.instantAnswer}</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200">Fix</h3>
          <ul className="mt-2 space-y-2">
            {problem.fixes.slice(0, 3).map((fix) => (
              <li key={fix} className="flex items-start gap-3 text-sm leading-7 text-zinc-300">
                <span className="mt-2 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                <span>{fix}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-200">Outcome</h3>
          <p className="mt-2 text-sm leading-7 text-zinc-300">{problem.outcome}</p>
        </section>
      </div>
    </section>
  );
}

function RelatedTechnicalContext({ problem }: { problem: FixProblem }) {
  return (
    <section aria-labelledby="related-technical-context" className="space-y-6">
      <div>
        <h2 id="related-technical-context" className="text-xl font-semibold text-white">
          Related technical context
        </h2>
        <p className="mt-2 text-sm leading-7 text-zinc-400">
          These examples show the commands, logs, and configuration patterns most often used to verify this issue.
        </p>
      </div>
      <section>
        <h3 className="text-sm font-semibold text-zinc-200">Command examples</h3>
        <ul className="mt-3 space-y-2">
          {problem.technicalContext.commands.map((command) => (
            <li key={command} className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
              <code className="text-xs text-zinc-200 sm:text-sm">{command}</code>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="text-sm font-semibold text-zinc-200">Log snippet</h3>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-xs leading-6 text-zinc-200 sm:text-sm">
          <code>{problem.technicalContext.logSnippet}</code>
        </pre>
      </section>
      <section>
        <h3 className="text-sm font-semibold text-zinc-200">Config snippet</h3>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-xs leading-6 text-zinc-200 sm:text-sm">
          <code>{problem.technicalContext.configSnippet}</code>
        </pre>
      </section>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const p = findFixProblem(slug);

  if (!p) return { title: "Not Found" };

  const title = `${p.title} | Kintify`;
  const description = p.directAnswer;
  const url = `${siteUrl}/fix/${p.slug}`;

  return {
    title,
    description,
    keywords: buildKeywords(p),
    alternates: { canonical: `/fix/${p.slug}` },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "Kintify",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function FixProblemPage({ params }: PageProps) {
  const { category: slug } = await params;
  const p = findFixProblem(slug);

  if (!p) notFound();

  const related = getRelatedProblems(p, 5);
  const relatedFixes = related.slice(0, 3);
  const commonIssues = related.slice(3, 5);
  const schemas = [
    buildSoftwareApplicationSchema(),
    buildWebPageSchema(p),
    buildHowToSchema(p),
    buildTechArticleSchema(p),
    ...(buildFaqSchema(p) ? [buildFaqSchema(p)] : []),
  ];

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-white"
          >
            Kintify
          </Link>
          <Link
            href="/fix"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Fix Tool
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-6 md:pt-16">
        {/* ============ INSTANT ANSWER ============ */}
        <DirectAnswer title={p.title} answer={p.directAnswer} />

        <section className="mt-10">
          <StructuredBreakdown problem={p} />
        </section>

        {/* ============ CAUSES ============ */}
        <section className="mt-12" aria-labelledby="common-causes">
          <h2 id="common-causes" className="text-xl font-semibold text-white">
            Common causes
          </h2>
          <ul className="space-y-2">
            {p.causes.map((cause) => (
              <li
                key={cause}
                className="mt-4 flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-4 py-3 text-sm leading-7 text-zinc-300"
              >
                <span className="mt-2 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ============ FIX STEPS ============ */}
        <section className="mt-12" aria-labelledby="fix-steps">
          <h2 id="fix-steps" className="text-xl font-semibold text-white">
            Fix steps
          </h2>
          <ol className="space-y-3">
            {p.fixes.map((fix, i) => (
              <li key={fix} className="flex gap-4">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-green-500/20 bg-green-600/10">
                  <span className="text-xs font-medium text-green-400">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">{fix}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ============ CTA 1 — LIVE FIX ============ */}
        <section className="mt-12" aria-labelledby="live-fix-cta">
          <h2 id="live-fix-cta" className="text-xl font-semibold text-white">
            Analyze this issue
          </h2>
          <p className="mt-2 text-sm leading-7 text-zinc-400">
            Paste the issue description, logs, or symptoms into the fix tool to inspect this problem with your own runtime details.
          </p>
          <div className="mt-4">
            <FixProblemCTA sampleInput={p.sampleInput} label="Analyze This Issue" />
          </div>
        </section>

        {/* ============ CTA 2 ============ */}
        <section className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-white">Need more context?</h2>
          <p className="mt-2 text-sm leading-7 text-zinc-400">
            If the standard steps do not resolve the issue, open the fix tool and include the current logs, configuration, and deployment changes.
          </p>
          <Link
            href="/fix"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Open Fix Tool
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* ============ FAQ ACCORDION ============ */}
        {p.faqs.length > 0 && (
          <section className="mt-12" aria-labelledby="faq">
            <h2 id="faq" className="text-xl font-semibold text-white">
              Frequently asked questions
            </h2>
            <Accordion type="multiple" className="space-y-2">
              {p.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        <section className="mt-12">
          <RelatedTechnicalContext problem={p} />
        </section>

        {/* ============ RELATED FIXES ============ */}
        {related.length > 0 && (
          <nav className="mt-12 space-y-10" aria-label="Related fix links">
            <section aria-labelledby="related-fixes">
              <h2 id="related-fixes" className="text-xl font-semibold text-white">
                Related fixes
              </h2>
              <ul className="mt-4 space-y-2">
                {relatedFixes.map((rel) => (
                  <li key={rel.slug}>
                    <Link
                      href={`/fix/${rel.slug}` as never}
                      className="group flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-4 py-3 transition-colors hover:border-blue-500/20 hover:bg-blue-500/[0.03]"
                    >
                      <span className="text-sm font-medium text-zinc-200 group-hover:text-white">
                        How to fix {rel.problem.toLowerCase()}
                      </span>
                      <ArrowRight className="ml-3 h-4 w-4 flex-shrink-0 text-zinc-600 transition-colors group-hover:text-blue-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            {commonIssues.length > 0 && (
              <section aria-labelledby="common-issues">
                <h2 id="common-issues" className="text-xl font-semibold text-white">
                  Common issues
                </h2>
                <ul className="mt-4 space-y-2">
                  {commonIssues.map((rel) => (
                    <li key={rel.slug}>
                      <Link
                        href={`/fix/${rel.slug}` as never}
                        className="group flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-4 py-3 transition-colors hover:border-blue-500/20 hover:bg-blue-500/[0.03]"
                      >
                        <span className="text-sm font-medium text-zinc-200 group-hover:text-white">
                          Troubleshooting guide for {rel.problem.toLowerCase()}
                        </span>
                        <ArrowRight className="ml-3 h-4 w-4 flex-shrink-0 text-zinc-600 transition-colors group-hover:text-blue-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </nav>
        )}

        {/* ============ FOOTER ============ */}
        <footer className="mt-16 border-t border-zinc-800 pt-8 text-center">
          <span className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} Kintify
          </span>
        </footer>
      </article>
    </main>
  );
}

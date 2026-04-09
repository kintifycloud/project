import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { CopyLinkButton } from "@/components/CopyLinkButton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FixOutput } from "@/components/FixOutput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/analyzer";
import { siteUrl } from "@/lib/schemas";
import { findEntry, getRelated, seoEntries, type SeoEntry } from "@/lib/seoData";

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return seoEntries.map((entry) => ({
    category: entry.category,
    issue: entry.issue,
  }));
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PageProps = {
  params: Promise<{ category: string; issue: string }>;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toAnalysisResult(entry: SeoEntry): AnalysisResult {
  return {
    category: entry.category,
    problem: entry.problem,
    cause: entry.cause,
    explanation: entry.explanation,
    fix: entry.fix,
    prevention: entry.prevention,
  };
}

const currentYear = new Date().getFullYear();

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    performance: "Performance",
    cost: "Cost Optimization",
    errors: "Error Resolution",
    ai: "AI / ML",
  };
  return map[cat] ?? cat;
}

/* ------------------------------------------------------------------ */
/*  JSON-LD builders                                                   */
/* ------------------------------------------------------------------ */

function buildHowToSchema(entry: SeoEntry) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: entry.title,
    description: entry.description,
    url: `${siteUrl}/fix/${entry.category}/${entry.issue}`,
    step: [
      {
        "@type": "HowToStep",
        name: "Identify the problem",
        text: entry.problem,
      },
      {
        "@type": "HowToStep",
        name: "Understand the cause",
        text: entry.cause,
      },
      ...entry.fix.map((step, i) => ({
        "@type": "HowToStep" as const,
        name: `Fix step ${i + 1}`,
        text: step,
      })),
    ],
  };
}

function buildFaqSchema(entry: SeoEntry) {
  if (entry.faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entry.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildArticleSchema(entry: SeoEntry) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.description,
    url: `${siteUrl}/fix/${entry.category}/${entry.issue}`,
    author: {
      "@type": "Organization",
      name: "Kintify",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Kintify",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.svg`,
      },
    },
    datePublished: "2025-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    keywords: entry.keywords.join(", "),
  };
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, issue } = await params;
  const entry = findEntry(category, issue);

  if (!entry) return { title: "Not Found" };

  const pageTitle = `${entry.title} in ${currentYear} | Kintify Cloud Optimization Guide`;
  const pageUrl = `/fix/${entry.category}/${entry.issue}`;

  return {
    title: pageTitle,
    description: entry.description,
    keywords: entry.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: entry.description,
      url: `${siteUrl}${pageUrl}`,
      type: "article",
      siteName: "Kintify",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: entry.description,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function SeoFixPage({ params }: PageProps) {
  const { category, issue } = await params;
  const entry = findEntry(category, issue);

  if (!entry) notFound();

  const result = toAnalysisResult(entry);
  const related = getRelated(entry, 5);

  const howToLd = buildHowToSchema(entry);
  const faqLd = buildFaqSchema(entry);
  const articleLd = buildArticleSchema(entry);
  const schemas = [howToLd, articleLd, ...(faqLd ? [faqLd] : [])];

  return (
    <main className="overflow-x-hidden pb-24">
      {/* JSON-LD */}
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        type="application/ld+json"
      />

      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 grid-veil opacity-50" />
        <div className="mx-auto w-full max-w-2xl py-10 sm:py-14 md:py-20">
          {/* Navigation */}
          <div className="mb-8 flex items-center justify-between">
            <Button asChild size="sm" variant="ghost">
              <Link href="/fix">
                <ArrowLeft className="h-4 w-4" />
                Back to /fix
              </Link>
            </Button>
            <CopyLinkButton />
          </div>

          {/* Category + Title */}
          <Badge variant="secondary">{categoryLabel(entry.category)}</Badge>
          <h1 className="mt-4 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            {entry.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
            {entry.description}
          </p>

          {/* Keywords — natural inclusion for SEO */}
          <div className="mt-4 flex flex-wrap gap-2">
            {entry.keywords.slice(0, 4).map((kw) => (
              <Badge key={kw} className="border-white/8 bg-white/[0.04] text-[10px] text-slate-400" variant="outline">
                {kw}
              </Badge>
            ))}
          </div>

          {/* FixOutput */}
          <div className="mt-10">
            <ErrorBoundary>
              <FixOutput result={result} />
            </ErrorBoundary>
          </div>

          {/* FAQ Section — visible text for SEO */}
          {entry.faq.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 text-lg font-semibold text-white">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {entry.faq.map((item) => (
                  <Card key={item.question} className="rounded-xl border-white/8 bg-white/[0.03]">
                    <CardContent className="p-4">
                      <h3 className="mb-2 text-sm font-semibold text-slate-200">{item.question}</h3>
                      <p className="text-sm leading-relaxed text-slate-400">{item.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Related Issues */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 text-lg font-semibold text-white">Related Issues</h2>
              <div className="space-y-2">
                {related.map((rel) => (
                  <Link
                    key={`${rel.category}-${rel.issue}`}
                    className="group flex items-center justify-between rounded-lg border border-white/6 bg-white/[0.02] px-4 py-3 transition-colors hover:border-emerald-400/20 hover:bg-emerald-400/[0.03]"
                    href={`/fix/${rel.category}/${rel.issue}` as never}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white">
                        {rel.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {categoryLabel(rel.category)}
                      </p>
                    </div>
                    <ArrowRight className="ml-3 h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-emerald-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 text-center">
            <p className="mb-4 text-sm text-slate-500">Have another issue?</p>
            <Button asChild variant="outline">
              <Link href="/fix">Analyze a new problem</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { AeoFixTemplate } from "@/components/AeoFixTemplate";
import {
  buildAeoActionAnswer,
  buildFaqPageSchema,
  buildHowToSchema as buildAeoHowToSchema,
  buildStandardFaq,
  buildSupportingContext,
  getKintifyAuthorSchema,
} from "@/lib/aeo";
import { siteUrl } from "@/lib/schemas";
import { findEntry, getRelated, type SeoEntry } from "@/lib/seoData";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PageProps = {
  params: Promise<{ category: string; issue: string }>;
};

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
  return buildAeoHowToSchema({
    name: `Kintify Fix: ${entry.title}`,
    description: buildAeoActionAnswer(entry.fix, entry.cause),
    url: `${siteUrl}/fix/${entry.category}/${entry.issue}`,
    steps: entry.fix,
  });
}

function buildFaqSchema(entry: SeoEntry) {
  return buildFaqPageSchema(
    buildStandardFaq(entry.title, [entry.cause], entry.fix, entry.problem),
  );
}

function buildArticleSchema(entry: SeoEntry) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Kintify Fix: ${entry.title}`,
    description: `Kintify Fix for ${entry.title}. Get the answer, checks, and next action fast.`,
    url: `${siteUrl}/fix/${entry.category}/${entry.issue}`,
    author: getKintifyAuthorSchema(),
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

  const pageTitle = `Kintify Fix: ${entry.title}`;
  const pageUrl = `/fix/${entry.category}/${entry.issue}`;
  const description = `Kintify Fix for ${entry.title}. Get the answer, checks, and next action fast.`;

  return {
    title: pageTitle,
    description,
    keywords: entry.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: `${siteUrl}${pageUrl}`,
      type: "article",
      siteName: "Kintify",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
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

  const related = getRelated(entry, 5);
  const faq = buildStandardFaq(entry.title, [entry.cause], entry.fix, entry.problem);
  const answer = buildAeoActionAnswer(entry.fix, entry.cause);
  const contextLines = buildSupportingContext(entry.cause, entry.fix);

  const howToLd = buildHowToSchema(entry);
  const faqLd = buildFaqSchema(entry);
  const articleLd = buildArticleSchema(entry);
  const schemas = [howToLd, articleLd, faqLd];

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        type="application/ld+json"
      />
      <AeoFixTemplate
        badge={`Kintify Fix · ${categoryLabel(entry.category)}`}
        title={entry.title}
        answer={answer}
        contextLines={contextLines}
        sampleInput={entry.problem}
        steps={entry.fix.slice(0, 3)}
        faq={faq}
        relatedLinks={related.slice(0, 4).map((rel) => ({
          href: `/fix/${rel.category}/${rel.issue}`,
          label: rel.title,
        }))}
        supplementaryTitle="What to check"
        supplementaryItems={[entry.problem, entry.explanation].filter(Boolean).slice(0, 2)}
      />
    </>
  );
}

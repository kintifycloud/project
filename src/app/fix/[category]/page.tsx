import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AeoFixTemplate } from "@/components/AeoFixTemplate";
import {
  fixProblems,
  findFixProblem,
  getRelatedProblems,
  type FixProblem,
} from "@/lib/fixProblems";
import {
  type Issue,
} from "@/lib/issues";
import { findCatalogIssue, getCatalogRelatedIssues, getIssueCatalog } from "@/lib/issueCatalog";
import {
  buildAeoActionAnswer,
  buildFaqPageSchema,
  buildHowToSchema as buildAeoHowToSchema,
  buildStandardFaq,
  buildSupportingContext,
  getKintifyAuthorSchema,
} from "@/lib/aeo";
import { siteUrl } from "@/lib/schemas";

/* ------------------------------------------------------------------ */
/*  Static params — pre-render every slug at build time                */
/* ------------------------------------------------------------------ */

export async function generateStaticParams() {
  const catalog = await getIssueCatalog();
  const fromProblems = fixProblems.map((p) => ({ category: p.slug }));
  const fromIssues = catalog.allSlugs.map((slug) => ({ category: slug }));
  // Deduplicate in case of collision
  const seen = new Set<string>();
  return [...fromIssues, ...fromProblems].filter((entry) => {
    if (seen.has(entry.category)) return false;
    seen.add(entry.category);
    return true;
  });
}

/* ------------------------------------------------------------------ */
/*  JSON-LD for minimal issue pages (FAQ + SoftwareApplication)        */
/* ------------------------------------------------------------------ */

function buildIssueFaqSchema(issue: Issue) {
  return buildFaqPageSchema(
    buildStandardFaq(issue.title, issue.causes, issue.fix, issue.shortAnswer),
  );
}

function buildIssueWebPageSchema(issue: Issue) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Kintify Fix: ${issue.title}`,
    url: `${siteUrl}/fix/${issue.slug}`,
    description: `Kintify Fix for ${issue.title}. Get the answer, checks, and next action fast.`,
    author: getKintifyAuthorSchema(),
    about: {
      "@type": "Thing",
      name: issue.title,
      description: issue.description,
    },
  };
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
    name: `Kintify Fix: ${p.problem}`,
    url: `${siteUrl}/fix/${p.slug}`,
    description: `Kintify Fix for ${p.problem}. Get the answer, checks, and next action fast.`,
    author: getKintifyAuthorSchema(),
    publisher: {
      "@type": "Organization",
      name: "Kintify",
      url: siteUrl,
    },
    about: p.problem,
  };
}

function buildFaqSchema(p: FixProblem) {
  return buildFaqPageSchema(
    buildStandardFaq(p.problem, p.causes, p.fixes, p.instantAnswer),
  );
}

function buildHowToSchema(p: FixProblem) {
  return buildAeoHowToSchema({
    name: `Kintify Fix: ${p.problem}`,
    description: buildAeoActionAnswer(p.fixes, p.directAnswer),
    url: `${siteUrl}/fix/${p.slug}`,
    steps: p.fixes,
  });
}

function buildTechArticleSchema(p: FixProblem) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `Kintify Fix: ${p.problem}`,
    description: `Kintify Fix for ${p.problem}. Get the answer, checks, and next action fast.`,
    url: `${siteUrl}/fix/${p.slug}`,
    author: getKintifyAuthorSchema(),
    about: p.problem,
    keywords: buildKeywords(p),
  };
}

function buildSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Kintify Fix",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
      "Technical issue diagnosis for cloud, infrastructure, API, and runtime errors.",
    author: getKintifyAuthorSchema(),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: slug } = await params;

  // Check issues.ts first (new programmatic SEO system)
  const issue = await findCatalogIssue(slug);
  if (issue) {
    const title = `Kintify Fix: ${issue.title}`;
    const description = `Kintify Fix for ${issue.title}. Get the answer, checks, and next action fast.`;
    const url = `${siteUrl}/fix/${issue.slug}`;
    return {
      title,
      description,
      keywords: [
        issue.title,
        `fix ${issue.title}`,
        `${issue.title} error`,
        `${issue.title} solution`,
        "debugging",
        "devops",
        issue.category,
      ],
      alternates: { canonical: `/fix/${issue.slug}` },
      openGraph: {
        title,
        description,
        url,
        type: "article",
        siteName: "Kintify",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const p = findFixProblem(slug);
  if (!p) return { title: "Not Found" };

  const title = `Kintify Fix: ${p.problem}`;
  const description = `Kintify Fix for ${p.problem}. Get the answer, checks, and next action fast.`;
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

  // Dispatch to the minimal /lib/issues.ts template when present.
  const issue = await findCatalogIssue(slug);
  if (issue) {
    const relatedIssues = await getCatalogRelatedIssues(issue, 4);
    const generatedIssueProps =
      "source" in issue && issue.source === "generated"
        ? {
            sourceSlug: issue.slug,
            sourceType: "generated" as const,
          }
        : {};
    const issueFaq = buildStandardFaq(
      issue.title,
      issue.causes,
      issue.fix,
      issue.shortAnswer,
    );
    const issueAnswer = buildAeoActionAnswer(issue.fix, issue.exampleOutput);
    const issueContextLines = buildSupportingContext(issue.shortAnswer, issue.fix);
    const issueSchemas = [
      buildSoftwareApplicationSchema(),
      buildIssueWebPageSchema(issue),
      buildIssueFaqSchema(issue),
      buildAeoHowToSchema({
        name: `Kintify Fix: ${issue.title}`,
        description: issueAnswer,
        url: `${siteUrl}/fix/${issue.slug}`,
        steps: issue.fix,
      }),
    ];
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(issueSchemas) }}
        />
        <AeoFixTemplate
          badge={`Kintify Fix · ${issue.category}`}
          title={issue.title}
          answer={issueAnswer}
          contextLines={issueContextLines}
          sampleInput={issue.exampleInput}
          steps={issue.fix.slice(0, 3)}
          faq={issueFaq}
          relatedLinks={relatedIssues.map((relatedIssue) => ({
            href: `/fix/${relatedIssue.slug}`,
            label: relatedIssue.title,
          }))}
          supplementaryTitle="Common causes"
          supplementaryItems={issue.causes.slice(0, 3)}
          {...generatedIssueProps}
        />
      </>
    );
  }

  const p = findFixProblem(slug);

  if (!p) notFound();

  const related = getRelatedProblems(p, 5);
  const faq = buildStandardFaq(p.problem, p.causes, p.fixes, p.instantAnswer);
  const answer = buildAeoActionAnswer(p.fixes, p.directAnswer);
  const contextLines = buildSupportingContext(p.instantAnswer, p.fixes);
  const schemas = [
    buildSoftwareApplicationSchema(),
    buildWebPageSchema(p),
    buildHowToSchema(p),
    buildTechArticleSchema(p),
    buildFaqSchema(p),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <AeoFixTemplate
        badge="Kintify Fix"
        title={p.problem}
        answer={answer}
        contextLines={contextLines}
        sampleInput={p.sampleInput}
        steps={p.fixes.slice(0, 3)}
        faq={faq}
        relatedLinks={related.slice(0, 3).map((rel) => ({
          href: `/fix/${rel.slug}`,
          label: rel.problem,
        }))}
        supplementaryTitle="Common causes"
        supplementaryItems={p.causes.slice(0, 3)}
      />
    </>
  );
}

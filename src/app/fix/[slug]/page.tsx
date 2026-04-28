import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { findIssue, getRelatedIssues } from "@/lib/issues";
import { generatedIssues } from "@/lib/generatedIssues";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { getIssueSlugs } = await import("@/lib/issues");
  const staticSlugs = getIssueSlugs();
  const generatedSlugs = generatedIssues.map((issue) => issue.slug);
  const allSlugs = [...staticSlugs, ...generatedSlugs];
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const issue = findIssue(slug) || generatedIssues.find((i) => i.slug === slug);

  if (!issue) {
    return {
      title: "Issue Not Found | Kintify",
    };
  }

  return {
    title: `Fix ${issue.title} Fast | Kintify Fix`,
    description: `Fix ${issue.title.toLowerCase()} in seconds with Kintify Fix. Get root cause and safe next action instantly.`,
    openGraph: {
      title: `Fix ${issue.title} Fast | Kintify Fix`,
      description: `Fix ${issue.title.toLowerCase()} in seconds with Kintify Fix. Get root cause and safe next action instantly.`,
      url: `https://kintify.cloud/fix/${slug}`,
      siteName: "Kintify Fix",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Fix ${issue.title} Fast | Kintify Fix`,
      description: `Fix ${issue.title.toLowerCase()} in seconds with Kintify Fix. Get root cause and safe next action instantly.`,
    },
    alternates: {
      canonical: `https://kintify.cloud/fix/${slug}`,
    },
  };
}

export default async function FixSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const issue = findIssue(slug) || generatedIssues.find((i) => i.slug === slug);

  if (!issue) {
    notFound();
  }

  const relatedIssues = getRelatedIssues(issue, 4);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What causes ${issue.title}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: issue.shortAnswer,
        },
      },
      {
        "@type": "Question",
        name: `How to fix ${issue.title}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: issue.exampleOutput,
        },
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to fix ${issue.title}`,
    description: issue.shortAnswer,
    step: issue.fix.slice(0, 3).map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
    })),
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [faqSchema, howToSchema],
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* H1 */}
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Fix: {issue.title}
        </h1>

        {/* Answer-First Structure (AEO) */}
        <div className="mt-6 rounded-xl border border-indigo-500/30 bg-indigo-500/[0.08] px-5 py-4">
          <p className="text-base font-medium text-white sm:text-lg">
            {issue.fix[0]}
          </p>
        </div>

        {/* Supporting Context */}
        <p className="mt-6 text-base leading-relaxed text-zinc-300 sm:text-lg">
          {issue.shortAnswer}
        </p>

        {/* Main CTA - Inline /fix input box */}
        <section className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] px-6 py-8">
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">
              Get a fix for your specific issue with Kintify Fix
            </span>
          </div>
          <Link
            href="/fix"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-4 text-base font-medium text-white transition-colors hover:bg-indigo-400 sm:text-lg"
          >
            Try Kintify Fix
            <ArrowRight className="h-5 w-5" />
          </Link>
        </section>

        {/* FAQ Block (AEO) */}
        <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-6">
          <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">What causes {issue.title}?</p>
              <p className="mt-1 text-sm text-zinc-400">{issue.shortAnswer}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">How to fix {issue.title}?</p>
              <p className="mt-1 text-sm text-zinc-400">{issue.exampleOutput}</p>
            </div>
          </div>
        </section>

        {/* Example Fix Output */}
        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-6">
          <h2 className="text-lg font-semibold text-white">Example fix from Kintify Fix</h2>
          <p className="mt-3 text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">Input:</span> {issue.exampleInput}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">Output:</span> {issue.exampleOutput}
          </p>
        </section>

        {/* Trust Signal */}
        <p className="mt-8 text-center text-xs text-zinc-500">
          Used by developers debugging real production systems
        </p>

        {/* Try your own issue */}
        <div className="mt-4 text-center">
          <Link
            href="/fix"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
          >
            Try your own issue with Kintify Fix
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Related Issues */}
        {relatedIssues.length > 0 && (
          <section className="mt-12 border-t border-zinc-800 pt-8">
            <h2 className="text-lg font-semibold text-white">Related fixes from Kintify Fix</h2>
            <ul className="mt-4 space-y-3">
              {relatedIssues.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={`/fix/${related.slug}`}
                    className="block rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-300 transition-colors hover:border-indigo-500/30 hover:text-white"
                  >
                    {related.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

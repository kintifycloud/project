import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { CopyLinkButton } from "@/components/CopyLinkButton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FixOutput } from "@/components/FixOutput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analyzeInput, type AnalysisResult } from "@/lib/analyzer";
import { siteUrl } from "@/lib/schemas";
import { getResult } from "@/lib/store";

type SlugPageProps = {
  params: Promise<{ slug: string }>;
};

function unslugify(slug: string): string {
  return slug.replace(/-/g, " ");
}

function resolveResult(slug: string) {
  const stored = getResult(slug);

  if (stored) return stored;

  return analyzeInput(unslugify(slug));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = resolveResult(slug);

  return {
    title: `How to fix: ${result.problem} | Kintify`,
    description: `${result.problem} explained with cause and fix. Instantly analyzed by Kintify.`,
    alternates: {
      canonical: `/fix/${slug}`,
    },
    openGraph: {
      title: `How to fix: ${result.problem} | Kintify`,
      description: `${result.problem} explained with cause and fix. Instantly analyzed by Kintify.`,
      url: `${siteUrl}/fix/${slug}`,
      type: "article",
    },
  };
}

function buildJsonLd(slug: string, result: AnalysisResult) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to fix: ${result.problem}`,
    description: `${result.problem} explained with cause and fix. Instantly analyzed by Kintify.`,
    url: `${siteUrl}/fix/${slug}`,
    step: [
      {
        "@type": "HowToStep",
        name: "Identify the problem",
        text: result.problem,
      },
      {
        "@type": "HowToStep",
        name: "Understand the cause",
        text: result.cause,
      },
      ...result.fix.map((step, index) => ({
        "@type": "HowToStep" as const,
        name: `Fix step ${index + 1}`,
        text: step,
      })),
    ],
  };
}

export default async function FixSlugPage({ params }: SlugPageProps) {
  const { slug } = await params;
  const result = resolveResult(slug);

  const jsonLd = buildJsonLd(slug, result);

  return (
    <main className="overflow-x-hidden pb-24">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />

      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 grid-veil opacity-50" />
        <div className="mx-auto w-full max-w-2xl py-10 sm:py-14 md:py-20">
          <div className="mb-8 flex items-center justify-between">
            <Button asChild size="sm" variant="ghost">
              <Link href="/fix">
                <ArrowLeft className="h-4 w-4" />
                Back to /fix
              </Link>
            </Button>
            <CopyLinkButton />
          </div>

          <Badge variant="secondary">Structured diagnosis</Badge>
          <h1 className="mt-4 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            How to fix: {result.problem.toLowerCase()}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
            {result.problem} explained with cause and fix. Instantly analyzed by Kintify.
          </p>

          <div className="mt-10">
            <ErrorBoundary>
              <FixOutput result={result} />
            </ErrorBoundary>
          </div>

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

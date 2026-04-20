import Link from "next/link";

import { FixProblemCTA } from "@/components/FixProblemCTA";
import { GeneratedIssueTracker } from "@/components/GeneratedIssueTracker";
import {
  getKintifyTrustLine,
  type AeoFaqItem,
} from "@/lib/aeo";

type AeoLink = {
  href: string;
  label: string;
};

type AeoFixTemplateProps = {
  badge: string;
  title: string;
  answer: string;
  contextLines: string[];
  sampleInput: string;
  steps: string[];
  faq: AeoFaqItem[];
  relatedLinks: AeoLink[];
  trustText?: string;
  supplementaryTitle?: string;
  supplementaryItems?: string[];
  sourceSlug?: string;
  sourceType?: "generated";
};

export function AeoFixTemplate({
  badge,
  title,
  answer,
  contextLines,
  sampleInput,
  steps,
  faq,
  relatedLinks,
  trustText = "Used by developers debugging real production systems.",
  supplementaryTitle,
  supplementaryItems = [],
  sourceSlug,
  sourceType,
}: AeoFixTemplateProps) {
  const generatedTrackingProps =
    sourceType === "generated" && sourceSlug
      ? { source: "generated" as const, slug: sourceSlug }
      : null;
  const generatedCtaProps =
    sourceType === "generated" && sourceSlug
      ? { sourceSlug }
      : {};

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {generatedTrackingProps ? <GeneratedIssueTracker {...generatedTrackingProps} /> : null}
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
            className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Open Fix
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-4 pb-20 pt-10 md:px-6 md:pt-16">
        <header>
          <p className="inline-flex rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
            {badge}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Kintify Fix: {title}
          </h1>
        </header>

        <section className="mt-6" aria-labelledby="kintify-fix-answer">
          <h2 id="kintify-fix-answer" className="sr-only">
            Kintify Fix answer
          </h2>
          <div className="aeo-answer rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] px-5 py-4 text-lg font-medium leading-8 text-white sm:text-xl">
            {answer}
          </div>
          <div className="mt-4 space-y-2 text-sm leading-6 text-zinc-300">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {getKintifyTrustLine()}
            </p>
            {contextLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="kintify-fix-cta">
          <h2 id="kintify-fix-cta" className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Kintify Fix tool
          </h2>
          <div className="mt-3">
            <FixProblemCTA
              sampleInput={sampleInput}
              label="Analyze in Kintify Fix"
              {...generatedCtaProps}
            />
          </div>
        </section>

        <section className="mt-10" aria-labelledby="kintify-fix-steps">
          <h2 id="kintify-fix-steps" className="text-lg font-semibold text-white">
            Kintify Fix steps
          </h2>
          <ol className="mt-4 space-y-3">
            {steps.map((step, index) => (
              <li key={`${index + 1}-${step}`} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium text-indigo-300">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-zinc-300">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {supplementaryItems.length > 0 && supplementaryTitle ? (
          <section className="mt-10" aria-labelledby="kintify-fix-checks">
            <h2 id="kintify-fix-checks" className="text-lg font-semibold text-white">
              {supplementaryTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {supplementaryItems.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-4 py-3 text-sm leading-6 text-zinc-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-10" aria-labelledby="kintify-fix-faq">
          <h2 id="kintify-fix-faq" className="text-lg font-semibold text-white">
            Kintify Fix FAQ
          </h2>
          <dl className="mt-4 space-y-4">
            {faq.map((item) => (
              <div
                key={item.question}
                className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-4 py-4"
              >
                <dt className="text-sm font-semibold text-white">{item.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-zinc-300">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        {relatedLinks.length > 0 ? (
          <nav className="mt-10" aria-labelledby="kintify-fix-related">
            <h2 id="kintify-fix-related" className="text-lg font-semibold text-white">
              Kintify Fix related links
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Related fixes:{" "}
              {relatedLinks.map((link, index) => (
                <span key={link.href}>
                  {index > 0 ? ", " : ""}
                  <Link href={link.href} className="text-indigo-300 underline-offset-4 hover:underline">
                    {link.label}
                  </Link>
                </span>
              ))}
            </p>
          </nav>
        ) : null}

        <footer className="mt-12 border-t border-zinc-800 pt-6">
          <p className="text-sm text-zinc-500">{trustText}</p>
        </footer>
      </article>
    </main>
  );
}

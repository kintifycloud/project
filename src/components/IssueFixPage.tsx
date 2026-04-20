import Link from "next/link";
import { ArrowRight, CheckCircle2, Terminal } from "lucide-react";

import { FixProblemCTA } from "@/components/FixProblemCTA";
import type { Issue } from "@/lib/issues";

type IssueFixPageProps = {
  issue: Issue;
  related: Issue[];
};

export function IssueFixPage({ issue, related }: IssueFixPageProps) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar (minimal, matches product) */}
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
        {/* Category pill */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] font-mono text-zinc-400">
          <Terminal className="h-3 w-3" />
          {issue.category.toUpperCase()}
        </div>

        {/* H1 */}
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Fix: {issue.title}
        </h1>

        {/* Short answer (2-3 lines) */}
        <p className="mt-4 text-base leading-7 text-zinc-300 sm:text-lg">
          {issue.shortAnswer}
        </p>

        {/* Inline /fix input box — MAIN CTA */}
        <section className="mt-8" aria-labelledby="fix-cta">
          <h2 id="fix-cta" className="sr-only">
            Try it now
          </h2>
          <FixProblemCTA
            sampleInput={issue.exampleInput}
            label="Fix This Issue"
          />
          <p className="mt-2 text-center text-xs text-zinc-500">
            Paste your own logs above, or use the example to see how it works.
          </p>
        </section>

        {/* Example fix output */}
        <section className="mt-10" aria-labelledby="example-output">
          <h2 id="example-output" className="text-sm font-medium text-zinc-400">
            Example safe-action output
          </h2>
          <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] px-4 py-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
              <p className="text-sm leading-7 text-zinc-200">
                {issue.exampleOutput}
              </p>
            </div>
          </div>
        </section>

        {/* Common causes */}
        <section className="mt-10" aria-labelledby="causes">
          <h2 id="causes" className="text-base font-semibold text-white">
            Common causes
          </h2>
          <ul className="mt-3 space-y-2">
            {issue.causes.map((c) => (
              <li
                key={c}
                className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-3 py-2 text-sm leading-6 text-zinc-300"
              >
                <span className="mt-2 block h-1 w-1 flex-shrink-0 rounded-full bg-zinc-500" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Fix steps */}
        <section className="mt-8" aria-labelledby="fix-steps">
          <h2 id="fix-steps" className="text-base font-semibold text-white">
            Fix steps
          </h2>
          <ol className="mt-3 space-y-2.5">
            {issue.fix.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[11px] font-medium text-indigo-300">
                  {i + 1}
                </span>
                <p className="text-sm leading-6 text-zinc-300">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Try your own issue */}
        <section className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-sm font-semibold text-white">
            Try your own issue
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Paste your logs, errors, or symptoms — get a safe next action in
            seconds.
          </p>
          <Link
            href="/fix"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-transform hover:-translate-y-0.5"
          >
            Open Fix
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Related issues */}
        {related.length > 0 && (
          <section className="mt-12" aria-labelledby="related">
            <h2 id="related" className="text-sm font-semibold text-white">
              Related issues
            </h2>
            <ul className="mt-3 space-y-1.5">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={`/fix/${r.slug}` as any}
                    className="group flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/20 px-3 py-2.5 transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/[0.03]"
                  >
                    <span className="text-sm text-zinc-300 group-hover:text-white">
                      Fix: {r.title}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-zinc-600 transition-colors group-hover:text-indigo-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-zinc-800 pt-6 text-center">
          <p className="text-sm text-zinc-500">
            <span className="font-medium text-zinc-300">Kintify</span> — built
            for developers fixing real systems
          </p>
        </footer>
      </article>
    </main>
  );
}

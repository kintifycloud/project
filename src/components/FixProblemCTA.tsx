import { ArrowRight, Terminal } from "lucide-react";

type FixProblemCTAProps = {
  sampleInput: string;
  label?: string;
  sourceSlug?: string;
};

export function FixProblemCTA({
  sampleInput,
  label = "Fix This Issue Now",
  sourceSlug,
}: FixProblemCTAProps) {
  return (
    <form action="/fix" method="GET" className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <Terminal className="h-4 w-4 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-500">kintify fix</span>
      </div>
      {sourceSlug ? <input type="hidden" name="source" value={sourceSlug} /> : null}
      <textarea
        name="input"
        defaultValue={sampleInput}
        placeholder="Paste logs, errors, or symptoms…"
        className="h-28 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
      />
      <button
        type="submit"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
      >
        {label}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

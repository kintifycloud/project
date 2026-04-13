"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Terminal } from "lucide-react";

type FixProblemCTAProps = {
  sampleInput: string;
  label?: string;
};

export function FixProblemCTA({
  sampleInput,
  label = "Fix This Issue Now",
}: FixProblemCTAProps) {
  const [input, setInput] = useState(sampleInput);
  const router = useRouter();

  function handleFix() {
    const encoded = encodeURIComponent(input);
    router.push(`/fix?input=${encoded}`);
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-xl shadow-black/20">
      <div className="mb-3 flex items-center gap-2">
        <Terminal className="h-4 w-4 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-500">kintify fix</span>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste logs, errors, or symptoms…"
        className="h-28 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
      />
      <button
        onClick={handleFix}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
      >
        {label}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

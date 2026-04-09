"use client";

import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { VerisigBadge } from "@/components/VerisigBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, mockVerisigGenerator } from "@/lib/utils";

const starterPrompts = [
  "Issue a trust proof for my new app.kintify.cloud endpoint",
  "Show how Kintify VeriKernel injects proof headers for a migration",
  "Preview a DNS TXT proof for a .cloud service in staging",
];

const defaultPrompt = "Issue a trust proof for my new app.kintify.cloud endpoint";

export function DemoModal({ className }: { className?: string }) {
  const [prompt, setPrompt] = useState<string>(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [host, setHost] = useState("api.kintify.cloud");

  const preview = useMemo(
    () =>
      mockVerisigGenerator({
        host,
        claim: prompt,
        issuer: "Kintify VeriKernel",
        region: "attested-edge",
      }),
    [host, prompt],
  );

  const handleGenerate = async () => {
    setIsGenerating(true);

    await new Promise((resolve) => {
      window.setTimeout(resolve, 450);
    });

    setHost((currentHost) => currentHost || "api.kintify.cloud");
    setIsGenerating(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn(className)} size="lg">
          <Sparkles className="h-4 w-4" />
          Launch local proof demo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Natural-language VeriKernel demo</DialogTitle>
          <DialogDescription>
            This mock flow stays entirely inside the app. It previews how Kintify VeriKernel can turn a plain-language trust request into DNS + HTTP proof output for kintify.cloud.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400" htmlFor="verikernel-prompt">
                Prompt
              </label>
              <textarea
                id="verikernel-prompt"
                className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-50 outline-none ring-0 transition-colors placeholder:text-slate-500 focus:border-emerald-300/35"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Describe the trust proof you want Kintify VeriKernel to issue"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400" htmlFor="verikernel-host">
                Host
              </label>
              <input
                id="verikernel-host"
                className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-50 outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-300/35"
                value={host}
                onChange={(event) => setHost(event.target.value)}
                placeholder="api.kintify.cloud"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((starterPrompt) => (
                <button
                  key={starterPrompt}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200 transition-colors hover:bg-white/[0.08]"
                  onClick={() => setPrompt(starterPrompt)}
                  type="button"
                >
                  {starterPrompt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <VerisigBadge claim={preview.claim} host={preview.host} />
            <div className="rounded-[24px] border border-white/8 bg-slate-950/72 p-4 font-mono text-xs leading-6 text-slate-300">
              <p className="text-slate-500">verikernel.json</p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(preview, null, 2)}</pre>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleGenerate} size="lg">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate local proof
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { BadgeCheck, Globe2, KeyRound, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn, mockVerisigGenerator } from "@/lib/utils";

type VerisigBadgeProps = {
  host?: string;
  claim?: string;
  className?: string;
};

export function VerisigBadge({ host = "kintify.cloud", claim, className }: VerisigBadgeProps) {
  const proof = mockVerisigGenerator({
    host,
    claim: claim ?? "instant cryptographic trust for any .cloud",
    issuer: "Kintify VeriKernel",
    region: "edge-trust-lattice",
  });

  return (
    <div className={cn("verisig-badge rounded-[28px] p-5 text-sm text-slate-200", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/82">Kintify VeriKernel</p>
            <p className="mt-1 text-lg font-semibold text-white">Verisig proof preview</p>
          </div>
        </div>
        <Badge className="gap-1.5" variant="default">
          <BadgeCheck className="h-3.5 w-3.5" />
          Proof active
        </Badge>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
            <Globe2 className="h-3.5 w-3.5" />
            DNS TXT
          </div>
          <code className="block overflow-x-auto rounded-2xl bg-slate-950/70 p-4 font-mono text-[12px] leading-6 text-emerald-200">
            {proof.dnsTxt}
          </code>
        </div>

        <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
            <KeyRound className="h-3.5 w-3.5" />
            HTTP header
          </div>
          <code className="block overflow-x-auto rounded-2xl bg-slate-950/70 p-4 font-mono text-[12px] leading-6 text-sky-200">
            {proof.httpHeader}
          </code>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-400 sm:grid-cols-4">
            <div>
              <p className="uppercase tracking-[0.18em]">Host</p>
              <p className="mt-1 text-sm text-slate-100">{proof.host}</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.18em]">Score</p>
              <p className="mt-1 text-sm text-slate-100">{proof.score}</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.18em]">Issuer</p>
              <p className="mt-1 text-sm text-slate-100">{proof.issuer}</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.18em]">Endpoint</p>
              <p className="mt-1 truncate text-sm text-slate-100">{proof.endpoint}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

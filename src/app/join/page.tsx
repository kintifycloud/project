"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/lib/auth-context";
import { useTeam } from "@/lib/team-context";
import { extractInviteToken } from "@/lib/team-mode";

function JoinPageContent() {
  const searchParams = useSearchParams();
  const { loading: authLoading, user } = useAuth();
  const { joinTeam, loading: teamLoading, teamLocked } = useTeam();
  const [status, setStatus] = useState<"idle" | "joining" | "joined">("idle");
  const [error, setError] = useState<string | null>(null);

  const inviteToken = useMemo(() => {
    return extractInviteToken(searchParams.get("invite") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (authLoading || teamLoading || !user || !inviteToken || status !== "idle") {
      return;
    }

    if (teamLocked) {
      setError("Upgrade to Team before joining a shared workspace.");
      return;
    }

    setStatus("joining");
    setError(null);

    void joinTeam(inviteToken).then((nextError) => {
      if (nextError) {
        setError(nextError);
        setStatus("idle");
        return;
      }

      setStatus("joined");
    });
  }, [authLoading, inviteToken, joinTeam, status, teamLoading, teamLocked, user]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="rounded-full border border-indigo-500/30 bg-indigo-500/10 p-4 text-indigo-300">
          <Users className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">Join your Kintify team</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
          Share fixes across your team. Resolve incidents faster.
        </p>

        {!inviteToken ? <p className="mt-6 text-sm text-red-300">This invite link is missing a token.</p> : null}
        {error ? <p className="mt-6 text-sm text-red-300">{error}</p> : null}

        {!user && !authLoading ? (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-5 text-left">
            <p className="text-sm text-zinc-300">Sign in first, then open this invite again to join the team.</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}

        {authLoading || teamLoading || status === "joining" ? (
          <p className="mt-6 text-sm text-zinc-400">Joining team...</p>
        ) : null}

        {status === "joined" ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] px-6 py-5 text-center text-emerald-100">
            <div className="flex justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm">You&apos;re in. Your shared incident workspace is ready.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/history"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
              >
                Open shared history
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/fix"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
              >
                Start fixing
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinPageContent />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Copy, Users } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useTeam } from "@/lib/team-context";

function TeamBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
      {label}
    </span>
  );
}

export function TeamSwitcher() {
  const { user } = useAuth();
  const { activeWorkspace, createInvite, createTeam, joinTeam, loading, plan, switchWorkspace, teamLocked, workspaces } = useTeam();
  const [open, setOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"create" | "join" | "invite" | "switch" | null>(null);

  const sortedWorkspaces = useMemo(() => {
    return [...workspaces].sort((left, right) => {
      if (left.kind === right.kind) {
        return left.name.localeCompare(right.name);
      }

      return left.kind === "personal" ? -1 : 1;
    });
  }, [workspaces]);

  const handleWorkspaceSwitch = async (workspaceId: string) => {
    setBusyAction("switch");
    setFeedback(null);
    const error = await switchWorkspace(workspaceId);
    if (!error) {
      setOpen(false);
      setInviteUrl(null);
    }
    setFeedback(error);
    setBusyAction(null);
  };

  const handleCreateTeam = async () => {
    setBusyAction("create");
    setFeedback(null);
    setInviteUrl(null);
    const error = await createTeam(createName);
    if (!error) {
      setCreateName("");
    }
    setFeedback(error);
    setBusyAction(null);
  };

  const handleJoinTeam = async () => {
    setBusyAction("join");
    setFeedback(null);
    setInviteUrl(null);
    const error = await joinTeam(inviteInput);
    if (!error) {
      setInviteInput("");
    }
    setFeedback(error);
    setBusyAction(null);
  };

  const handleCreateInvite = async () => {
    setBusyAction("invite");
    setFeedback(null);
    const result = await createInvite(inviteEmail);
    if (result.invite?.url) {
      setInviteUrl(result.invite.url);
      setInviteEmail("");
    }
    setFeedback(result.error ?? (result.invite ? `Invite ready for ${result.invite.teamName}.` : null));
    setBusyAction(null);
  };

  const copyInvite = async () => {
    if (!inviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setFeedback("Invite link copied.");
    } catch {
      setFeedback("Could not copy invite link.");
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 transition-colors hover:border-zinc-700 hover:text-white"
      >
        <Users className="h-4 w-4 text-indigo-400" />
        <span className="max-w-28 truncate">{activeWorkspace.name}</span>
        <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[22rem] rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">{activeWorkspace.name}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {activeWorkspace.kind === "team"
                  ? `${activeWorkspace.memberCount} member${activeWorkspace.memberCount === 1 ? "" : "s"}`
                  : "Private workspace"}
              </p>
            </div>
            <TeamBadge label={activeWorkspace.kind === "team" ? activeWorkspace.role : plan} />
          </div>

          <div className="mt-4 space-y-2">
            {sortedWorkspaces.map((workspace) => {
              const selected = workspace.id === activeWorkspace.id;

              return (
                <button
                  key={workspace.id}
                  type="button"
                  disabled={busyAction !== null || selected}
                  onClick={() => void handleWorkspaceSwitch(workspace.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "border-indigo-500/40 bg-indigo-500/10 text-white"
                      : "border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:border-zinc-700 hover:text-white"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <span className="truncate">{workspace.name}</span>
                  <span className="ml-3 text-xs text-zinc-500">
                    {workspace.kind === "personal" ? "Personal" : workspace.role}
                  </span>
                </button>
              );
            })}
          </div>

          {!user ? (
            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
              <p>Sign in to create, join, and switch shared workspaces.</p>
              <Link href="/login" className="mt-3 inline-flex text-sm font-medium text-indigo-400 hover:text-indigo-300">
                Sign in
              </Link>
            </div>
          ) : teamLocked ? (
            <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-3 text-sm text-zinc-200">
              <p className="font-medium text-white">Share fixes across your team. Resolve incidents faster.</p>
              <p className="mt-2 text-zinc-400">Upgrade to Team to unlock shared history, incident workflows, and multi-user access.</p>
              <Link
                href="/pricing"
                className="mt-3 inline-flex rounded-xl bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
              >
                Upgrade to Team
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4 border-t border-zinc-800 pt-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">Create team</label>
                <div className="mt-2 flex gap-2">
                  <input
                    value={createName}
                    onChange={(event) => setCreateName(event.target.value)}
                    placeholder="Platform"
                    className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => void handleCreateTeam()}
                    disabled={busyAction !== null}
                    className="rounded-xl bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:opacity-60"
                  >
                    Create
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">Join team</label>
                <div className="mt-2 flex gap-2">
                  <input
                    value={inviteInput}
                    onChange={(event) => setInviteInput(event.target.value)}
                    placeholder="Paste invite link"
                    className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => void handleJoinTeam()}
                    disabled={busyAction !== null}
                    className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white disabled:opacity-60"
                  >
                    Join
                  </button>
                </div>
              </div>

              {activeWorkspace.kind === "team" && activeWorkspace.role === "owner" ? (
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">Invite users</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      placeholder="Email optional"
                      className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => void handleCreateInvite()}
                      disabled={busyAction !== null}
                      className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white disabled:opacity-60"
                    >
                      Invite
                    </button>
                  </div>
                  {inviteUrl ? (
                    <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-3">
                      <p className="break-all text-xs text-zinc-400">{inviteUrl}</p>
                      <button
                        type="button"
                        onClick={() => void copyInvite()}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy invite link
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}

          {loading ? <p className="mt-4 text-xs text-zinc-500">Loading workspace state...</p> : null}
          {feedback ? <p className="mt-4 text-xs text-zinc-400">{feedback}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

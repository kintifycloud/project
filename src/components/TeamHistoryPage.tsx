"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  RotateCcw,
  Search,
  Users,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useEnterprise } from "@/lib/enterprise-context";
import { formatRelativeTime, truncate } from "@/lib/history";
import { hasProAccess, hasTeamAccess, KINTIFY_FREE_HISTORY_PREVIEW, trackMonetizationEvent } from "@/lib/monetization";
import { useTeam } from "@/lib/team-context";
import { listWorkspaceIncidents, normalizeError, updateIncidentStatus, type IncidentRecord } from "@/lib/team-mode";

function IncidentStatusBadge({ status }: { status: IncidentRecord["status"] }) {
  const isResolved = status === "resolved";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
        isResolved
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-amber-500/20 bg-amber-500/10 text-amber-300"
      }`}
    >
      {status}
    </span>
  );
}

export function TeamHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { canResolveIncidents, trackAudit } = useEnterprise();
  const { activeWorkspace, loading: workspaceLoading, plan } = useTeam();
  const [items, setItems] = useState<IncidentRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copiedIncidentId, setCopiedIncidentId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const loadIncidents = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextItems = await listWorkspaceIncidents(user.id, activeWorkspace.id);
      setItems(nextItems);
    } catch (loadError) {
      setError(normalizeError(loadError, "Could not load incidents."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace.id, user]);

  useEffect(() => {
    if (workspaceLoading) {
      return;
    }

    void loadIncidents();
  }, [loadIncidents, workspaceLoading]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) => {
      return [item.input, item.output, item.trace ?? "", item.createdByEmail, item.status]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [items, search]);

  const hasHistoryAccess = activeWorkspace.kind === "team" ? hasTeamAccess(plan) : hasProAccess(plan);
  const visibleItems = hasHistoryAccess ? filteredItems : filteredItems.slice(0, KINTIFY_FREE_HISTORY_PREVIEW);
  const hiddenCount = Math.max(filteredItems.length - visibleItems.length, 0);

  useEffect(() => {
    if (!hasHistoryAccess && filteredItems.length > KINTIFY_FREE_HISTORY_PREVIEW) {
      trackMonetizationEvent("historyLock");
    }
  }, [filteredItems.length, hasHistoryAccess]);

  const handleReuse = (input: string) => {
    router.push(`/fix?input=${encodeURIComponent(input)}`);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleCopyLink = async (incidentId: string) => {
    const url = `${window.location.origin}/incident/${incidentId}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedIncidentId(incidentId);
      window.setTimeout(() => setCopiedIncidentId((current) => (current === incidentId ? null : current)), 1600);
    } catch {
      setError("Could not copy the incident link.");
    }
  };

  const handleStatusToggle = async (item: IncidentRecord) => {
    if (!canResolveIncidents) {
      setError("Your enterprise role is read-only in this organization.");
      return;
    }

    setStatusUpdatingId(item.id);
    setError(null);

    try {
      const nextStatus = item.status === "open" ? "resolved" : "open";
      const updated = await updateIncidentStatus(item.id, nextStatus);
      setItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      await trackAudit({
        action: nextStatus === "resolved" ? "incident.resolved" : "incident.reopened",
        incidentId: updated.id,
        metadata: {
          status: nextStatus,
        },
      });
    } catch (statusError) {
      setError(normalizeError(statusError, "Could not update incident status."));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (workspaceLoading) {
    return null;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs text-zinc-400">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              {activeWorkspace.name}
            </div>
            <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {activeWorkspace.kind === "team" ? "Shared incidents" : "Your incidents"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              {activeWorkspace.kind === "team"
                ? "Share fixes across your team. Resolve incidents faster."
                : "Every successful fix becomes an incident you can revisit, reuse, and share later."}
            </p>
          </div>
          <div className="w-full max-w-sm">
            <label className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-400 focus-within:border-zinc-700">
              <Search className="h-4 w-4" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search incidents"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </label>
          </div>
        </div>

        {!user ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center">
            <p className="text-zinc-300">Sign in to save incidents to your workspace and share them with your team.</p>
            <div className="mt-4 flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-12 text-center text-sm text-zinc-400">
            Loading incidents...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-6 py-5 text-sm text-red-100">
            {error}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center">
            <p className="text-zinc-500">
              {search.trim() ? "No incidents match your search yet." : "No incidents yet — paste an issue on the home page to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                    layout: { duration: 0.2 },
                  }}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="line-clamp-1 text-sm font-medium text-zinc-300">{truncate(item.input, 90)}</p>
                        <IncidentStatusBadge status={item.status} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{item.output}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(item.createdAt)}
                        </span>
                        <span>{item.createdByEmail}</span>
                      </div>
                    </div>
                    <div className="mt-0.5 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-500">
                      {expandedId === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedId === item.id ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-zinc-800 px-4 py-4">
                          <div className="mb-4">
                            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-zinc-600">Input</p>
                            <p className="whitespace-pre-wrap text-sm text-zinc-300">{item.input}</p>
                          </div>

                          <div className="mb-4">
                            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-zinc-600">Output</p>
                            <p className="text-sm leading-relaxed text-zinc-300">{item.output}</p>
                          </div>

                          {item.trace ? (
                            <div className="mb-4">
                              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-zinc-600">What likely caused this</p>
                              <p className="rounded-lg bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-400">{item.trace}</p>
                            </div>
                          ) : null}

                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => handleReuse(item.input)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                              Reuse
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleStatusToggle(item)}
                              disabled={statusUpdatingId === item.id || !canResolveIncidents}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-60"
                            >
                              {item.status === "open" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                              {item.status === "open" ? "Resolve" : "Reopen"}
                            </button>
                            <Link
                              href={`/incident/${item.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
                            >
                              Open link
                            </Link>
                            <button
                              type="button"
                              onClick={() => void handleCopyLink(item.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              {copiedIncidentId === item.id ? "Copied" : "Copy link"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {!hasHistoryAccess && hiddenCount > 0 ? (
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.05] px-6 py-5">
                <p className="text-sm font-medium text-white">
                  {activeWorkspace.kind === "team" ? "Unlock shared incident workflows" : "Unlock the full `/history`"}
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  {activeWorkspace.kind === "team"
                    ? "Upgrade to Team to unlock shared history, incident status, and multi-user access."
                    : `You have ${hiddenCount} more saved incident${hiddenCount === 1 ? "" : "s"} waiting. Upgrade to Pro for full history access.`}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
                  >
                    {activeWorkspace.kind === "team" ? "Upgrade to Team" : "Upgrade to Pro"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/fix"
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
                  >
                    Maybe later
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}

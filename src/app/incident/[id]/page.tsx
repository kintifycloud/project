"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, Copy, Eye, EyeOff, RotateCcw, Share2 } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useEnterprise } from "@/lib/enterprise-context";
import { formatRelativeTime } from "@/lib/history";
import { type AuditLogRecord } from "@/lib/enterprise-mode";
import { getIncidentById, normalizeError, updateIncidentPrivacy, updateIncidentStatus, type IncidentRecord } from "@/lib/team-mode";

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  const { canResolveIncidents, loadIncidentTimeline, trackAudit } = useEnterprise();
  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [timeline, setTimeline] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  const incidentId = typeof params?.id === "string" ? params.id : "";

  const loadIncident = useCallback(async () => {
    if (!incidentId || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextIncident = await getIncidentById(incidentId);
      if (!nextIncident) {
        setError("Incident not found or not available in your workspace.");
        setIncident(null);
      } else {
        setIncident(nextIncident);
        const timelineResult = await loadIncidentTimeline(incidentId);
        if (!timelineResult.error) {
          setTimeline(timelineResult.entries);
        }
      }
    } catch (loadError) {
      setError(normalizeError(loadError, "Could not load incident."));
    } finally {
      setLoading(false);
    }
  }, [incidentId, user, loadIncidentTimeline]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadIncident();
  }, [authLoading, loadIncident]);

  const handleStatusToggle = async () => {
    if (!incident) {
      return;
    }

    if (!canResolveIncidents) {
      setError("Your enterprise role is read-only in this organization.");
      return;
    }

    setStatusLoading(true);
    setError(null);

    try {
      const nextStatus = incident.status === "open" ? "resolved" : "open";
      const updated = await updateIncidentStatus(incident.id, nextStatus);
      setIncident(updated);
      await trackAudit({
        action: nextStatus === "resolved" ? "incident.resolved" : "incident.reopened",
        incidentId: updated.id,
        metadata: {
          status: nextStatus,
        },
      });
      const timelineResult = await loadIncidentTimeline(updated.id);
      if (!timelineResult.error) {
        setTimeline(timelineResult.entries);
      }
    } catch (statusError) {
      setError(normalizeError(statusError, "Could not update incident status."));
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Could not copy the incident link.");
    }
  };

  const handlePrivacyToggle = async () => {
    if (!incident) {
      return;
    }

    setPrivacyLoading(true);
    setError(null);

    try {
      const updated = await updateIncidentPrivacy(incident.id, !incident.isPublic);
      setIncident(updated);
      await trackAudit({
        action: updated.isPublic ? "incident.made_public" : "incident.made_private",
        incidentId: updated.id,
        metadata: {
          isPublic: updated.isPublic,
        },
      });
    } catch (privacyError) {
      setError(normalizeError(privacyError, "Could not update incident privacy."));
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handleSlackShare = () => {
    if (!incident) return;
    const shareUrl = `https://kintify.cloud/share/${incident.id}`;
    const text = `Check out this fix: ${incident.input.slice(0, 50)}...`;
    window.open(
      `https://slack.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        {!user && !authLoading ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center">
            <p className="text-zinc-300">Sign in to view this incident.</p>
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
        ) : loading || authLoading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-12 text-center text-sm text-zinc-400">
            Loading incident...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-6 py-5 text-sm text-red-100">
            {error}
          </div>
        ) : incident ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-indigo-400">Incident</p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">{incident.input}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formatRelativeTime(incident.createdAt)}
                  </span>
                  <span>{incident.createdByEmail}</span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
                      incident.status === "resolved"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {incident.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopyLink()}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy link"}
                </button>
                <button
                  type="button"
                  onClick={() => void handlePrivacyToggle()}
                  disabled={privacyLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white disabled:opacity-60"
                  title={incident.isPublic ? "Make private" : "Make public"}
                >
                  {incident.isPublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {incident.isPublic ? "Private" : "Public"}
                </button>
                <button
                  type="button"
                  onClick={handleSlackShare}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white"
                  title="Share to Slack"
                >
                  <Share2 className="h-4 w-4" />
                  Slack
                </button>
                <button
                  type="button"
                  onClick={() => void handleStatusToggle()}
                  disabled={statusLoading || !canResolveIncidents}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:opacity-60"
                >
                  {incident.status === "open" ? <CheckCircle2 className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                  {incident.status === "open" ? "Mark resolved" : "Reopen incident"}
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">Input</p>
                <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-200 whitespace-pre-wrap">
                  {incident.input}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">Output</p>
                <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm leading-7 text-zinc-200">
                  {incident.output}
                </div>
              </div>
              {incident.trace ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">What likely caused this</p>
                  <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-300">
                    {incident.trace}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push(`/fix?input=${encodeURIComponent(incident.input)}`)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
              >
                Reuse fix
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/history"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
              >
                Back to history
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <h2 className="text-lg font-semibold text-white">Incident timeline</h2>
              <p className="mt-1 text-sm text-zinc-400">Created, fix-generated, action-taken, and resolved events appear here.</p>
              <div className="mt-4 space-y-3">
                {timeline.length === 0 ? <p className="text-sm text-zinc-500">No timeline events recorded yet.</p> : null}
                {timeline.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{entry.action}</p>
                        <p className="mt-1 text-xs text-zinc-500">{entry.userEmail}</p>
                      </div>
                      <p className="text-xs text-zinc-500">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

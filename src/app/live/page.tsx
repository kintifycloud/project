"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { formatRelativeTime } from "@/lib/history";
import { getRecentIncidents, type IncidentRecord } from "@/lib/team-mode";

// Pulsing dot component for live indicator
function LivePulsingDot() {
  return (
    <div className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </div>
  );
}

// Individual incident card component
function IncidentCard({ incident }: { incident: IncidentRecord }) {
  const [relativeTime, setRelativeTime] = useState(formatRelativeTime(incident.createdAt));

  // Update relative time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(incident.createdAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [incident.createdAt]);

  const statusColor = incident.status === "resolved" 
    ? "border-emerald-500/20 bg-emerald-500/[0.06]" 
    : "border-amber-500/20 bg-amber-500/[0.06]";

  return (
    <div
      className={`group relative rounded-xl border ${statusColor} p-4 transition-all duration-200 hover:border-opacity-50`}
    >
      <div className="flex items-start gap-3">
        {/* Status indicator */}
        <div className="mt-1 flex-shrink-0">
          <div className={`h-2 w-2 rounded-full ${incident.status === "resolved" ? "bg-emerald-500" : "bg-amber-500"}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white line-clamp-1">{incident.input.slice(0, 80)}</h3>
            <span className={`text-xs ${incident.status === "resolved" ? "text-emerald-400" : "text-amber-400"}`}>
              {incident.status}
            </span>
          </div>

          <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{incident.output.slice(0, 120)}</p>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="h-3.5 w-3.5" />
              <span>{relativeTime}</span>
            </div>

            <Link
              href={`/incident/${incident.id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              View details
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
        <Zap className="h-6 w-6 text-emerald-500" />
      </div>
      <h3 className="text-lg font-medium text-white">All systems look stable</h3>
      <p className="mt-1 text-sm text-zinc-400">
        No active incidents detected
      </p>
    </div>
  );
}

export default function LivePage() {
  const { user, loading: authLoading } = useAuth();
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load recent incidents
  useEffect(() => {
    if (!user || authLoading) return;

    const loadIncidents = async () => {
      try {
        const data = await getRecentIncidents(user, 10);
        setIncidents(data);
      } catch (error) {
        console.error("Failed to load incidents:", error);
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();

    // Refresh every 30 seconds
    const interval = setInterval(loadIncidents, 30000);
    return () => clearInterval(interval);
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-zinc-800" />
            <div className="h-4 w-64 rounded bg-zinc-800" />
            <div className="mt-8 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-zinc-800/50" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center">
            <p className="text-zinc-300">Sign in to view live incidents.</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const openIncidents = incidents.filter((i) => i.status === "open");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-indigo-400">
              /live
            </p>
            <LivePulsingDot />
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Live system signals
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
            Real-time anomaly detection and incident tracking
          </p>
        </div>

        {/* Stats */}
        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-zinc-400">{openIncidents.length} open</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-400">{incidents.filter((i) => i.status === "resolved").length} resolved</span>
          </div>
        </div>

        {/* Incident feed */}
        <div className="mt-8 space-y-3">
          {incidents.length === 0 ? (
            <EmptyState />
          ) : (
            incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] px-6 py-6">
          <p className="text-sm font-medium text-indigo-300 mb-3">
            Detect an anomaly?
          </p>
          <Link
            href="/fix"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Get a fix
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}

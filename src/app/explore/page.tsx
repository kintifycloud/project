import type { Metadata } from "next";
import Link from "next/link";
import { Clock, TrendingUp } from "lucide-react";
import { getPublicIncidents, type IncidentRecord } from "@/lib/team-mode";

export const metadata: Metadata = {
  title: "Explore Fixes | Kintify",
  description: "Browse publicly shared fixes from the Kintify community. Learn how others resolved their issues.",
  openGraph: {
    title: "Explore Fixes | Kintify",
    description: "Browse publicly shared fixes from the Kintify community.",
    url: "https://kintify.cloud/explore",
    siteName: "Kintify",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export default async function ExplorePage() {
  let incidents: IncidentRecord[] = [];
  
  try {
    incidents = await getPublicIncidents(50);
  } catch (error) {
    console.error("Failed to load public incidents:", error);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-6 w-6 text-indigo-400" />
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Explore Fixes
            </h1>
          </div>
          <p className="text-base text-zinc-400 sm:text-lg">
            Browse publicly shared fixes from the Kintify community. Learn how others resolved their issues.
          </p>
        </div>

        {/* CTA */}
        <div className="mb-10 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] px-6 py-6">
          <p className="text-sm font-medium text-indigo-300 mb-3">
            Have an issue to fix?
          </p>
          <Link
            href="/fix"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Try Kintify Fix
          </Link>
        </div>

        {/* Incidents Grid */}
        {incidents.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
            <p className="text-zinc-400">No public fixes yet. Be the first to share one!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {incidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/share/${incident.id}`}
                className="block rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-indigo-500/30 hover:bg-zinc-900/70"
              >
                <div className="mb-3">
                  <p className="text-sm font-medium text-white line-clamp-2">
                    {truncateText(incident.input, 80)}
                  </p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {truncateText(incident.output, 120)}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTimeAgo(incident.createdAt)}</span>
                  </div>
                  {incident.status === "resolved" && (
                    <span className="text-emerald-400">Resolved</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 border-t border-zinc-800 pt-6 text-center">
          <p className="text-xs text-zinc-500">
            Powered by Kintify Fix — Incident resolution acceleration
          </p>
        </div>
      </div>
    </main>
  );
}

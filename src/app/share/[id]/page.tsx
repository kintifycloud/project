import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Copy, Share2 } from "lucide-react";
import { getPublicIncidentById } from "@/lib/team-mode";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const incident = await getPublicIncidentById(id);

  if (!incident) {
    return {
      title: "Share Not Found | Kintify",
    };
  }

  const title = incident.input.slice(0, 60) + (incident.input.length > 60 ? "..." : "");
  
  return {
    title: `Fixed: ${title} | Kintify`,
    description: `See how this issue was resolved with Kintify Fix.`,
    openGraph: {
      title: `Fixed: ${title} | Kintify`,
      description: `See how this issue was resolved with Kintify Fix.`,
      url: `https://kintify.cloud/share/${id}`,
      siteName: "Kintify",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Fixed: ${title} | Kintify`,
      description: `See how this issue was resolved with Kintify Fix.`,
    },
    alternates: {
      canonical: `https://kintify.cloud/share/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params;
  const incident = await getPublicIncidentById(id);

  if (!incident) {
    notFound();
  }

  const shareUrl = `https://kintify.cloud/share/${id}`;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header with branding */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            ← Back to Kintify
          </Link>
          <p className="text-xs text-zinc-500">Fixed with Kintify</p>
        </div>

        {/* Problem */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Issue
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-300 sm:text-lg">
            {incident.input}
          </p>
        </div>

        {/* Solution */}
        <div className="mb-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] px-6 py-6">
          <h2 className="text-lg font-semibold text-white">Solution</h2>
          <p className="mt-3 text-base leading-relaxed text-zinc-200 sm:text-lg">
            {incident.output}
          </p>
        </div>

        {/* Metadata */}
        <div className="mb-8 flex items-center gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{formatTimeAgo(incident.createdAt)}</span>
          </div>
          {incident.status === "resolved" && (
            <span className="text-emerald-400">Resolved</span>
          )}
        </div>

        {/* Share actions */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-6">
          <h3 className="text-sm font-medium text-white mb-4">Share this fix</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              <Copy className="h-4 w-4" />
              Copy link
            </button>
            <a
              href={`https://slack.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out this fix: ${incident.input.slice(0, 50)}...`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              <Share2 className="h-4 w-4" />
              Share to Slack
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="mb-4 text-sm text-zinc-400">
            Fix your own issues instantly with Kintify Fix
          </p>
          <Link
            href="/fix"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Try Kintify Fix
          </Link>
        </div>

        {/* Footer branding */}
        <div className="mt-12 border-t border-zinc-800 pt-6 text-center">
          <p className="text-xs text-zinc-500">
            Powered by Kintify Fix — Incident resolution acceleration
          </p>
        </div>
      </div>
    </main>
  );
}

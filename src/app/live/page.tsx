"use client";

import { useEffect, useState, useCallback } from "react";
import {
  type LiveIssue,
  initialMockIssues,
  additionalMockIssues,
  generateIssueId,
  formatRelativeTime,
  getSeverityColor,
  getSeverityLabel,
  buildFixUrl,
} from "@/lib/liveFeed";

// Pulsing dot component for live indicator
function LivePulsingDot() {
  return (
    <div className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </div>
  );
}

// Individual issue card component
function IssueCard({
  issue,
  onFix,
}: {
  issue: LiveIssue;
  onFix: (issue: LiveIssue) => void;
}) {
  const colors = getSeverityColor(issue.severity);
  const [relativeTime, setRelativeTime] = useState(formatRelativeTime(issue.timestamp));

  // Update relative time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(issue.timestamp));
    }, 30000);
    return () => clearInterval(interval);
  }, [issue.timestamp]);

  return (
    <div
      className={`group relative rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all duration-200 hover:border-opacity-50`}
    >
      <div className="flex items-start gap-3">
        {/* Severity indicator */}
        <div className="mt-1 flex-shrink-0">
          <div className={`h-2 w-2 rounded-full ${colors.dot}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">{issue.title}</h3>
            <span className={`text-xs ${colors.text}`}>
              {getSeverityLabel(issue.severity)}
            </span>
          </div>

          <p className="mt-1 text-sm text-zinc-400">{issue.description}</p>

          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-xs text-zinc-500">{relativeTime}</span>

            <a
              href={buildFixUrl(issue)}
              onClick={() => onFix(issue)}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Fix this
              <span aria-hidden="true">→</span>
            </a>
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
        <svg
          className="h-6 w-6 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white">All systems look stable</h3>
      <p className="mt-1 text-sm text-zinc-400">
        No active incidents detected
      </p>
    </div>
  );
}

export default function LivePage() {
  const [issues, setIssues] = useState<LiveIssue[]>(initialMockIssues);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!isClient) return;

    const interval = setInterval(() => {
      setIssues((currentIssues) => {
        // Random action: add, update, or rotate
        const action = Math.random();

        if (action < 0.4 && currentIssues.length > 0) {
          // Update timestamp of random issue (refresh)
          const indexToUpdate = Math.floor(Math.random() * currentIssues.length);
          return currentIssues.map((issue, index) =>
            index === indexToUpdate
              ? { ...issue, timestamp: Date.now() - Math.random() * 60000 }
              : issue
          );
        } else if (action < 0.7 && currentIssues.length < 6) {
          // Add new issue
          const randomTemplate =
            additionalMockIssues[Math.floor(Math.random() * additionalMockIssues.length)];
          if (!randomTemplate) return currentIssues;
          const newIssue: LiveIssue = {
            id: generateIssueId(),
            title: randomTemplate.title,
            description: randomTemplate.description,
            severity: randomTemplate.severity,
            suggestion: randomTemplate.suggestion,
            timestamp: Date.now(),
          };
          return [newIssue, ...currentIssues].slice(0, 6);
        } else if (action < 0.85 && currentIssues.length > 2) {
          // Remove oldest low-severity issue
          const lowSeverityIssues = currentIssues.filter((i) => i.severity === "low");
          if (lowSeverityIssues.length > 0) {
            const oldestLow = lowSeverityIssues.reduce((oldest, current) =>
              current.timestamp < oldest.timestamp ? current : oldest
            );
            return currentIssues.filter((i) => i.id !== oldestLow.id);
          }
          return currentIssues;
        }

        return currentIssues;
      });
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [isClient]);

  const handleFix = useCallback((issue: LiveIssue) => {
    // Analytics or tracking hook for future use
    console.log("Navigating to fix:", issue.id);
  }, []);

  if (!isClient) {
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
            What needs attention right now
          </p>
        </div>

        {/* Incident feed */}
        <div className="mt-8 space-y-3">
          {issues.length === 0 ? (
            <EmptyState />
          ) : (
            issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onFix={handleFix} />
            ))
          )}
        </div>

        {/* Footer info */}
        {issues.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-xs text-zinc-500">
            <span>
              {issues.length} active {issues.length === 1 ? "signal" : "signals"}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {issues.filter((i) => i.severity === "high").length} critical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {issues.filter((i) => i.severity === "medium").length} warning
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  DollarSign,
  Play,
  Search,
  Shield,
  XCircle,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisCategory } from "@/lib/analyzer";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PriorityLevel = "Low" | "Medium" | "High" | "Critical";

type AgentEvent = {
  id: string;
  timestamp: number;
  category: AnalysisCategory;
  icon: "warning" | "cost" | "error";
  title: string;
  detail: string;
  priority: PriorityLevel;
  miniAnalysis: {
    cause: string;
    fix: string;
  };
  resolved: boolean;
  expanded: boolean;
};

type AgentPanelProps = {
  className?: string;
};

/* ------------------------------------------------------------------ */
/*  Mock data pools                                                    */
/* ------------------------------------------------------------------ */

const MOCK_EVENTS: Omit<AgentEvent, "id" | "timestamp" | "resolved" | "expanded">[] = [
  {
    category: "performance",
    icon: "warning",
    title: "API latency increased by 32%",
    detail: "Endpoint /api/data P95 latency rose from 120ms to 158ms over the last 5 minutes.",
    priority: "High",
    miniAnalysis: {
      cause: "Sequential upstream calls under increased traffic load.",
      fix: "Parallelize API calls with Promise.all and enable response caching.",
    },
  },
  {
    category: "performance",
    icon: "warning",
    title: "Database query time spiking",
    detail: "SELECT on orders table averaging 340ms — 3x above baseline.",
    priority: "Medium",
    miniAnalysis: {
      cause: "Missing composite index on user_id + created_at columns.",
      fix: "Add index: CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);",
    },
  },
  {
    category: "performance",
    icon: "warning",
    title: "Memory usage approaching 85% threshold",
    detail: "Container memory at 850MB of 1GB limit. Growth rate: +12MB/min.",
    priority: "High",
    miniAnalysis: {
      cause: "Unbounded in-memory cache growing without eviction policy.",
      fix: "Implement LRU cache with max 500 entries and 5-minute TTL.",
    },
  },
  {
    category: "cost",
    icon: "cost",
    title: "Cloud cost spike detected (+18%)",
    detail: "Daily spend jumped from $142 to $168. Largest increase: compute instances.",
    priority: "Medium",
    miniAnalysis: {
      cause: "Auto-scaling provisioned 3 additional instances that weren't released.",
      fix: "Review scale-down policies and terminate idle instances.",
    },
  },
  {
    category: "cost",
    icon: "cost",
    title: "Unused storage volumes detected",
    detail: "4 unattached EBS volumes totaling 200GB found in us-east-1.",
    priority: "Low",
    miniAnalysis: {
      cause: "Volumes from terminated instances not cleaned up.",
      fix: "Delete unattached volumes: aws ec2 delete-volume --volume-id <id>",
    },
  },
  {
    category: "cost",
    icon: "cost",
    title: "Data transfer costs rising",
    detail: "Cross-region transfer up 40% this week. Egress charges: $23/day.",
    priority: "Medium",
    miniAnalysis: {
      cause: "Services in us-east-1 calling database in eu-west-1.",
      fix: "Co-locate dependent services in the same region or add a read replica.",
    },
  },
  {
    category: "errors",
    icon: "error",
    title: "Error rate rising on /api/checkout",
    detail: "Error rate at 4.2% — up from 0.3% baseline. 500 errors dominating.",
    priority: "Critical",
    miniAnalysis: {
      cause: "Payment gateway returning timeouts under load.",
      fix: "Add circuit breaker with fallback and retry with exponential backoff.",
    },
  },
  {
    category: "errors",
    icon: "error",
    title: "Unhandled exception in auth service",
    detail: "TypeError: Cannot read property 'token' of undefined — 12 occurrences in 2 min.",
    priority: "High",
    miniAnalysis: {
      cause: "Missing null check on session object after token refresh failure.",
      fix: "Add optional chaining and validate session before token access.",
    },
  },
  {
    category: "errors",
    icon: "error",
    title: "Connection pool exhaustion detected",
    detail: "PostgreSQL active connections at 98/100. New connections failing.",
    priority: "Critical",
    miniAnalysis: {
      cause: "Connection leak in error handling path — connections not released on exception.",
      fix: "Wrap queries in try/finally to ensure connection release. Increase pool to 150.",
    },
  },
  {
    category: "performance",
    icon: "warning",
    title: "Cold start latency spike on Lambda",
    detail: "Function init taking 2.8s — above the 1s target. Bundle size: 45MB.",
    priority: "Medium",
    miniAnalysis: {
      cause: "Large deployment package with unused dependencies.",
      fix: "Tree-shake dependencies and enable provisioned concurrency for critical functions.",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let eventCounter = 0;

function generateMockIssue(): AgentEvent {
  const template = MOCK_EVENTS[eventCounter % MOCK_EVENTS.length]!;
  eventCounter += 1;
  return {
    ...template,
    id: `agent-${Date.now()}-${eventCounter}`,
    timestamp: Date.now(),
    resolved: false,
    expanded: false,
  };
}

function priorityColor(p: PriorityLevel): string {
  switch (p) {
    case "Critical":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    case "High":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";
    case "Medium":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    case "Low":
      return "border-slate-400/20 bg-slate-400/10 text-slate-400";
  }
}

function eventIcon(icon: AgentEvent["icon"]) {
  switch (icon) {
    case "warning":
      return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
    case "cost":
      return <DollarSign className="h-3.5 w-3.5 text-emerald-400" />;
    case "error":
      return <XCircle className="h-3.5 w-3.5 text-rose-400" />;
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const MAX_EVENTS = 10;
const INTERVAL_MIN = 5000;
const INTERVAL_MAX = 8000;

function randomInterval(): number {
  return Math.floor(Math.random() * (INTERVAL_MAX - INTERVAL_MIN + 1)) + INTERVAL_MIN;
}

/* ------------------------------------------------------------------ */
/*  AgentPanel                                                         */
/* ------------------------------------------------------------------ */

export function AgentPanel({ className }: AgentPanelProps) {
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Schedule next event with random 5-8s delay */
  const scheduleNext = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setEvents((prev) => {
        const next = [generateMockIssue(), ...prev].slice(0, MAX_EVENTS);
        return next;
      });
      scheduleNext();
    }, randomInterval());
  }, []);

  /* Start / stop agent */
  useEffect(() => {
    if (agentEnabled) {
      // Fire first event quickly
      const kickoff = setTimeout(() => {
        setEvents((prev) => [generateMockIssue(), ...prev].slice(0, MAX_EVENTS));
        scheduleNext();
      }, 1200);
      return () => {
        clearTimeout(kickoff);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
    // Cleanup when disabled
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [agentEnabled, scheduleNext]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /* Toggle event expansion */
  function toggleExpand(id: string) {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, expanded: !e.expanded } : e)),
    );
  }

  /* Mark as resolved (simulated "Apply fix") */
  function resolveEvent(id: string) {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, resolved: true } : e)),
    );
  }

  const activeCount = events.filter((e) => !e.resolved).length;
  const resolvedCount = events.filter((e) => e.resolved).length;

  return (
    <Card className={cn("rounded-xl border-white/8 bg-white/[0.03] shadow-sm", className)}>
      <CardContent className="p-4 sm:p-6">
        {/* Header row */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold text-white">Agent Mode</span>
            {agentEnabled && (
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                className="flex items-center gap-1 text-[10px] text-emerald-400"
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CircleDot className="h-2.5 w-2.5" />
                Live
              </motion.span>
            )}
          </div>

          {/* Toggle */}
          <button
            aria-label={agentEnabled ? "Disable agent mode" : "Enable agent mode"}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              agentEnabled ? "bg-emerald-500" : "bg-white/10",
            )}
            onClick={() => setAgentEnabled((v) => !v)}
            type="button"
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                agentEnabled ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>

        {/* Agent personality message */}
        <AnimatePresence>
          {agentEnabled && (
            <motion.div
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.03] px-3 py-2">
                <Activity className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <p className="text-[11px] text-emerald-300/80">
                  Kintify is actively monitoring your system
                </p>
              </div>

              {/* Stats bar */}
              {events.length > 0 && (
                <div className="mb-3 flex items-center gap-3 text-[10px]">
                  <span className="text-slate-500">
                    {activeCount} active · {resolvedCount} resolved
                  </span>
                </div>
              )}

              {/* Live feed header */}
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-3 w-3 text-amber-400" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  Live System Activity
                </span>
              </div>

              {/* Events */}
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {events.map((evt) => (
                    <motion.div
                      key={evt.id}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      initial={{ opacity: 0, y: -8 }}
                      layout
                      transition={{ duration: 0.25 }}
                    >
                      <div
                        className={cn(
                          "rounded-lg border p-3 transition-colors",
                          evt.resolved
                            ? "border-emerald-400/15 bg-emerald-400/[0.03]"
                            : "border-white/6 bg-white/[0.02]",
                        )}
                      >
                        {/* Event header */}
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 shrink-0">{eventIcon(evt.icon)}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p
                                className={cn(
                                  "text-xs font-semibold",
                                  evt.resolved ? "text-emerald-300 line-through" : "text-slate-200",
                                )}
                              >
                                {evt.title}
                              </p>
                              <Badge className={cn("shrink-0 text-[9px]", priorityColor(evt.priority))}>
                                {evt.priority}
                              </Badge>
                            </div>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                              {formatTime(evt.timestamp)}
                            </p>
                          </div>

                          {/* Expand / collapse */}
                          <button
                            aria-label={evt.expanded ? "Collapse" : "Expand"}
                            className="shrink-0 text-slate-600 transition-colors hover:text-slate-400"
                            onClick={() => toggleExpand(evt.id)}
                            type="button"
                          >
                            {evt.expanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Expanded detail + mini analysis */}
                        <AnimatePresence initial={false}>
                          {evt.expanded && (
                            <motion.div
                              animate={{ opacity: 1, height: "auto" }}
                              className="overflow-hidden"
                              exit={{ opacity: 0, height: 0 }}
                              initial={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                                {evt.detail}
                              </p>

                              {/* Mini analysis */}
                              <div className="mt-2 rounded-md border border-white/5 bg-white/[0.02] p-2">
                                <div className="mb-1 flex items-center gap-1.5">
                                  <Search className="h-3 w-3 text-sky-400/70" />
                                  <span className="text-[10px] font-medium text-sky-300/70">Auto-Analysis</span>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                  <span className="font-medium text-slate-300">Cause:</span> {evt.miniAnalysis.cause}
                                </p>
                                <p className="mt-1 text-[10px] text-slate-400">
                                  <span className="font-medium text-emerald-300">Fix:</span> {evt.miniAnalysis.fix}
                                </p>
                              </div>

                              {/* Action buttons */}
                              <div className="mt-2 flex gap-2">
                                {!evt.resolved && (
                                  <>
                                    <Button
                                      className="h-6 gap-1 rounded-md px-2 text-[10px]"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => toggleExpand(evt.id)}
                                    >
                                      <Play className="h-3 w-3" />
                                      Analyze deeper
                                    </Button>
                                    <Button
                                      className="h-6 gap-1 rounded-md border-emerald-400/20 bg-emerald-400/10 px-2 text-[10px] text-emerald-300 hover:bg-emerald-400/20"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => resolveEvent(evt.id)}
                                    >
                                      <CheckCircle2 className="h-3 w-3" />
                                      Apply fix
                                    </Button>
                                  </>
                                )}
                                {evt.resolved && (
                                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Fix applied
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty state */}
                {events.length === 0 && (
                  <div className="flex items-center justify-center py-6">
                    <p className="text-xs text-slate-600">Listening for system events...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disabled state */}
        {!agentEnabled && (
          <p className="text-xs text-slate-600">
            Enable Agent Mode to start continuous monitoring and auto-analysis.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

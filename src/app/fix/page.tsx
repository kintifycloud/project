"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { Suspense, useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { FixDecisionPage } from "@/components/FixDecisionPage";

type FixApiSuccess = {
  success: true;
  answer: string;
  confidence: number;
};

type FixApiError = {
  success: false;
  error: string;
};

type FixApiResponse = FixApiSuccess | FixApiError;

type FixThreadTurn = {
  user: string;
  assistant: string;
};

type FixThreadState = {
  sessionId: string;
  originalIssue: string;
  previousAnswer: string;
  recentMessages: FixThreadTurn[];
};

type FixRequestBody = {
  input: string;
  thread?: {
    sessionId: string;
    originalIssue: string;
    previousAnswer: string;
    recentMessages: FixThreadTurn[];
    isFollowUp: boolean;
  };
};

type FixFeedbackValue = "helpful" | "not_enough" | null;

const FIX_THREAD_STORAGE_KEY = "kintify.fix.thread";
const FIX_USAGE_STORAGE_KEY = "kintify.fix.usage";
const FIX_FEEDBACK_STORAGE_KEY = "kintify.fix.feedback";
const FIX_FREE_LIMIT = 5;
const FIX_LOADING_MESSAGES = [
  "Reading issue context...",
  "Checking likely failure points...",
  "Mapping probable root cause...",
  "Preparing practical fix...",
] as const;
const FIX_TRUST_PREVIEW_MESSAGES = [
  "Detected DB pool exhaustion after deploy",
  "Flagged TLS certificate chain issue",
  "Spotted likely pod memory leak",
] as const;

function getInputGuidanceMessage(input: string): string | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return "Add a bit more detail so Kintify can help better.";
  }

  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const isExplicitlyVague = ["help", "fix", "error", "issue", "bug", "broken", "problem"].includes(normalized);

  if (isExplicitlyVague) {
    return "Add a bit more detail so Kintify can help better.";
  }

  if (trimmed.length < 12 && !/[\r\n:/.\\-]/.test(trimmed)) {
    return "Add a bit more detail so Kintify can help better.";
  }

  return null;
}

function getGracefulFailureCopy(error: string): { title: string; detail: string } {
  if (/(timeout|timed out|abort)/i.test(error)) {
    return {
      title: "Couldn't complete this check right now. Try again in a moment.",
      detail: "We hit a temporary provider timeout. A retry should help.",
    };
  }

  if (/(provider|upstream|502|503|504|server is not configured|failed to analyze|network)/i.test(error)) {
    return {
      title: "We hit a temporary provider issue. A retry should help.",
      detail: "Couldn't complete this check right now. Try again in a moment.",
    };
  }

  return {
    title: "Couldn't complete this check right now. Try again in a moment.",
    detail: "A quick retry usually gets things moving again.",
  };
}

function formatDurationLabel(durationMs: number): string {
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function createFixSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `fix-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toThreadString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function readFixThreadState(): FixThreadState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(FIX_THREAD_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      sessionId?: unknown;
      originalIssue?: unknown;
      previousAnswer?: unknown;
      recentMessages?: unknown;
    };

    const sessionId = toThreadString(parsed.sessionId, 120);
    const originalIssue = toThreadString(parsed.originalIssue, 1200);
    const previousAnswer = toThreadString(parsed.previousAnswer, 1200);
    const recentMessages = Array.isArray(parsed.recentMessages)
      ? parsed.recentMessages
          .map((entry) => {
            const item = entry as { user?: unknown; assistant?: unknown } | null;
            const user = toThreadString(item?.user, 600);
            const assistant = toThreadString(item?.assistant, 1200);

            if (!user || !assistant) {
              return null;
            }

            return { user, assistant } satisfies FixThreadTurn;
          })
          .filter((entry): entry is FixThreadTurn => entry !== null)
          .slice(-3)
      : [];

    if (!sessionId || !originalIssue || !previousAnswer) {
      return null;
    }

    return {
      sessionId,
      originalIssue,
      previousAnswer,
      recentMessages,
    };
  } catch {
    return null;
  }
}

function writeFixThreadState(thread: FixThreadState | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!thread) {
    window.sessionStorage.removeItem(FIX_THREAD_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(FIX_THREAD_STORAGE_KEY, JSON.stringify(thread));
}

function readFixUsageCount(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = window.localStorage.getItem(FIX_USAGE_STORAGE_KEY);
  const count = Number(raw);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

function writeFixUsageCount(count: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FIX_USAGE_STORAGE_KEY, String(Math.max(0, count)));
}

function saveFixFeedback(value: Exclude<FixFeedbackValue, null>, issue: string, answer: string, sessionId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = window.localStorage.getItem(FIX_FEEDBACK_STORAGE_KEY);
    const existing = Array.isArray(JSON.parse(raw ?? "[]")) ? JSON.parse(raw ?? "[]") as unknown[] : [];
    const next = [
      ...existing.slice(-19),
      {
        value,
        issue: issue.slice(0, 600),
        answer: answer.slice(0, 1000),
        sessionId: sessionId ?? "",
        createdAt: Date.now(),
      },
    ];
    window.localStorage.setItem(FIX_FEEDBACK_STORAGE_KEY, JSON.stringify(next));
  } catch {
    window.localStorage.setItem(FIX_FEEDBACK_STORAGE_KEY, JSON.stringify([
      {
        value,
        issue: issue.slice(0, 600),
        answer: answer.slice(0, 1000),
        sessionId: sessionId ?? "",
        createdAt: Date.now(),
      },
    ]));
  }
}

function isExplicitNewIssue(input: string): boolean {
  return /\b(?:new issue|different issue|another issue|start over|reset context|clear context|new problem|unrelated)\b/i.test(input);
}

function isLikelyFollowUpInput(input: string): boolean {
  return /\b(?:still|now|after trying|i tried|i checked|that didn't work|that did not work|what next|guide me|walk me through|continue|update|same issue|next step|what do i check first|here's what happened)\b/i.test(input);
}

function shouldStartNewThread(input: string, thread: FixThreadState | null): boolean {
  if (!thread) {
    return true;
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return false;
  }

  if (trimmed === thread.originalIssue) {
    return true;
  }

  if (isExplicitNewIssue(trimmed)) {
    return true;
  }

  if (trimmed.length > 220 && !isLikelyFollowUpInput(trimmed)) {
    return true;
  }

  if (/[\r\n]/.test(trimmed) && trimmed.length > 120 && !isLikelyFollowUpInput(trimmed)) {
    return true;
  }

  return false;
}

function buildThreadPayload(input: string, thread: FixThreadState | null): FixRequestBody["thread"] | undefined {
  if (!thread || shouldStartNewThread(input, thread)) {
    return undefined;
  }

  return {
    sessionId: thread.sessionId,
    originalIssue: thread.originalIssue,
    previousAnswer: thread.previousAnswer,
    recentMessages: thread.recentMessages.slice(-3),
    isFollowUp: true,
  };
}

function getMetadataPills(issueText: string, answerText: string): string[] {
  const source = `${issueText} ${answerText}`.toLowerCase();
  const pills: string[] = [];

  function addPill(label: string) {
    if (!pills.includes(label) && pills.length < 4) {
      pills.push(label);
    }
  }

  if (/(kubernetes|kubectl|pod|deployment|crashloopbackoff|oomkilled|ingress)/.test(source)) {
    addPill("Kubernetes");
  } else if (/(docker|container|image|entrypoint|compose)/.test(source)) {
    addPill("Docker");
  } else if (/(aws|alb|elb|cloudwatch|ecs|eks|lambda|rds)/.test(source)) {
    addPill("AWS");
  } else if (/(nginx|reverse proxy|proxy|upstream)/.test(source)) {
    addPill("Nginx");
  } else if (/(api|endpoint|request|response|gateway)/.test(source)) {
    addPill("API");
  }

  if (/(database|postgres|postgresql|mysql|query|connection pool|deadlock|transaction)/.test(source)) {
    addPill("Database");
  }

  if (/(ssl|tls|certificate|handshake|x509)/.test(source)) {
    addPill("TLS");
  }

  if (/(deploy|deployment|rollout|release)/.test(source)) {
    addPill("Deploy");
  }

  if (/(latency|slow|timeout|timed out|p95|p99)/.test(source)) {
    addPill("Latency");
  }

  if (/(oom|memory|heap|out-of-memory)/.test(source)) {
    addPill("Memory");
  }

  if (/(production-critical|immediate rollback|restore traffic first|production down|users impacted|payments? failing|traffic down|outage|critical)/.test(source)) {
    addPill("High Priority");
  }

  if (pills.length === 0) {
    addPill("Infra Issue");
  }

  return pills.slice(0, 4);
}

function getIssueSummary(issueText: string, answerText: string): string {
  const source = `${issueText} ${answerText}`.toLowerCase();

  if (/(ssl|tls|certificate|handshake|x509)/.test(source)) {
    return "Probable TLS certificate or chain issue";
  }

  if (/(crashloopbackoff|crash loop|startup probe|readiness probe|restarting)/.test(source)) {
    return "Likely Kubernetes restart loop from config or startup failure";
  }

  if (/(oom|memory|heap|out-of-memory)/.test(source) && /(kubernetes|kubectl|pod|deployment)/.test(source)) {
    return "Likely Kubernetes memory pressure or container limit issue";
  }

  if (/(latency|slow|timeout|timed out)/.test(source) && /(deploy|deployment|rollout|release|api)/.test(source)) {
    return "Likely deploy regression affecting API latency";
  }

  if (/(latency|slow|timeout|timed out)/.test(source) && /(database|postgres|mysql|query|pool)/.test(source)) {
    return "Likely latency regression tied to database pressure";
  }

  if (/(502|503|504|bad gateway|upstream|load balancer|alb|elb|nginx)/.test(source)) {
    return "Likely upstream or load balancer failure";
  }

  if (/(database|postgres|postgresql|mysql|query|connection pool|deadlock|transaction)/.test(source)) {
    return "Probable database connection or query bottleneck";
  }

  if (/(docker|container|image|entrypoint|compose)/.test(source)) {
    return "Likely container runtime or image mismatch";
  }

  if (/(deploy|deployment|rollout|release)/.test(source)) {
    return "Likely deploy regression affecting service health";
  }

  return "Likely runtime or configuration regression";
}

function getSuggestedNextChecks(issueText: string, answerText: string): string[] {
  const source = `${issueText} ${answerText}`.toLowerCase();

  if (/(ssl|tls|certificate|handshake|x509)/.test(source)) {
    return ["Check cert expiry", "Verify certificate chain", "Inspect LB TLS config"];
  }

  if (/(crashloopbackoff|crash loop|startup probe|readiness probe|restarting)/.test(source)) {
    return ["Check pod events", "View previous pod logs", "Inspect startup probes"];
  }

  if (/(oom|memory|heap|out-of-memory)/.test(source)) {
    return ["Inspect memory limits", "Check pod memory usage", "Look for traffic spikes"];
  }

  if (/(latency|slow|timeout|timed out)/.test(source) && /(database|postgres|mysql|query|pool)/.test(source)) {
    return ["Check recent deploy diff", "View slow query logs", "Inspect DB pool", "Trace slow endpoint"];
  }

  if (/(latency|slow|timeout|timed out)/.test(source)) {
    return ["Check recent deploy diff", "Trace slow endpoint", "Inspect upstream latency"];
  }

  if (/(502|503|504|bad gateway|upstream|load balancer|alb|elb|nginx)/.test(source)) {
    return ["Check target health", "Inspect upstream logs", "Verify service port", "Review timeout settings"];
  }

  if (/(database|postgres|postgresql|mysql|query|connection pool|deadlock|transaction)/.test(source)) {
    return ["Inspect active sessions", "Check pool saturation", "Review slow queries"];
  }

  if (/(docker|container|image|entrypoint|compose)/.test(source)) {
    return ["View container logs", "Inspect entrypoint", "Check runtime env vars"];
  }

  if (/(deploy|deployment|rollout|release)/.test(source)) {
    return ["Check recent deploy diff", "Review config changes", "Consider safe rollback"];
  }

  return ["Check recent deploy diff", "Inspect failure logs", "Compare runtime config"];
}

export function FixPageInner() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FixApiSuccess | null>(null);
  const [error, setError] = useState("");
  const [thread, setThread] = useState<FixThreadState | null>(null);
  const [followUpInput, setFollowUpInput] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [usageCount, setUsageCount] = useState(0);
  const [feedbackState, setFeedbackState] = useState<FixFeedbackValue>(null);

  // Progressive reveal states for single answer
  const [revealedAnswer, setRevealedAnswer] = useState("");
  const [visibleCards, setVisibleCards] = useState<Set<"answer">>(new Set());
  const [isTypingAnswer, setIsTypingAnswer] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [analysisDurationMs, setAnalysisDurationMs] = useState<number | null>(null);
  const [generationDurationMs, setGenerationDurationMs] = useState<number | null>(null);
  const [trustPreviewIndex, setTrustPreviewIndex] = useState(0);
  const [inputGuidance, setInputGuidance] = useState<string | null>(null);
  const [lastSubmittedInput, setLastSubmittedInput] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const followUpInputRef = useRef<HTMLInputElement | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    setThread(readFixThreadState());
    setUsageCount(readFixUsageCount());
  }, []);

  useEffect(() => {
    const prefill = searchParams.get("input");
    if (prefill) {
      setInput(prefill);
    }
  }, [searchParams]);

  useEffect(() => {
    setCopyState("idle");
    setFeedbackState(null);
  }, [result?.answer]);

  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % FIX_LOADING_MESSAGES.length);
    }, 1400);

    return () => {
      window.clearInterval(interval);
    };
  }, [loading]);

  useEffect(() => {
    if (usageCount > 0 || loading || result !== null) {
      setTrustPreviewIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setTrustPreviewIndex((current) => (current + 1) % FIX_TRUST_PREVIEW_MESSAGES.length);
    }, 2600);

    return () => {
      window.clearInterval(interval);
    };
  }, [loading, result, usageCount]);

  // Typewriter effect for single answer
  useEffect(() => {
    if (result) {
      // Reset reveal states
      setRevealedAnswer("");
      setVisibleCards(new Set());
      setIsTypingAnswer(false);

      const intervals: NodeJS.Timeout[] = [];

      // Progressive card reveal
      const revealSequence = async () => {
        // Reveal answer
        await new Promise(resolve => setTimeout(resolve, 100));
        setVisibleCards(prev => new Set([...prev, "answer"]));

        // Typewriter effect for answer
        const answerText = result.answer;
        let answerIndex = 0;
        setIsTypingAnswer(true);
        const answerInterval = setInterval(() => {
          if (answerIndex < answerText.length) {
            setRevealedAnswer(answerText.slice(0, answerIndex + 1));
            answerIndex++;
          } else {
            clearInterval(answerInterval);
            setIsTypingAnswer(false);
          }
        }, 15);
        intervals.push(answerInterval);
      };

      revealSequence();

      return () => {
        intervals.forEach(interval => clearInterval(interval));
      };
    }
  }, [result]);

  async function submitIssue(rawInput: string, source: "main" | "follow_up") {
    const trimmedInput = rawInput.trim();
    if (loading) {
      return;
    }

    if (!trimmedInput) {
      setInputGuidance("Add a bit more detail so Kintify can help better.");
      return;
    }

    const persistedUsageCount = readFixUsageCount();
    const effectiveUsageCount = Math.max(usageCount, persistedUsageCount);

    if (persistedUsageCount !== usageCount) {
      setUsageCount(persistedUsageCount);
    }

    if (effectiveUsageCount >= FIX_FREE_LIMIT) {
      setError("");
      return;
    }

    if (source === "main") {
      const nextGuidance = getInputGuidanceMessage(trimmedInput);

      if (nextGuidance) {
        setInputGuidance(nextGuidance);
        return;
      }
    }

    const requestStartedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
    const startsNewThread = shouldStartNewThread(trimmedInput, thread);
    const threadPayload = buildThreadPayload(trimmedInput, thread);

    setError("");
    setInputGuidance(null);
    setResult(null);
    setLastSubmittedInput(trimmedInput);
    setAnalysisDurationMs(null);
    setGenerationDurationMs(null);
    setLoadingMessageIndex(0);
    setLoading(true);

    if (startsNewThread) {
      setThread(null);
      writeFixThreadState(null);
    }

    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: trimmedInput,
          ...(threadPayload ? { thread: threadPayload } : {}),
        } satisfies FixRequestBody),
      });

      const data = (await res.json().catch(() => null)) as FixApiResponse | null;

      if (!data) {
        setError("Failed to analyze issue. Please try again.");
        return;
      }

      if (data.success === false) {
        setError(data.error);
        return;
      }

      if (!res.ok) {
        setError("Failed to analyze issue. Please try again.");
        return;
      }

      const requestCompletedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
      const nextAnalysisDurationMs = requestCompletedAt - requestStartedAt;
      const nextGenerationDurationMs = nextAnalysisDurationMs + 100 + (data.answer.length * 15);

      setAnalysisDurationMs(nextAnalysisDurationMs);
      setGenerationDurationMs(nextGenerationDurationMs);
      setResult(data);
      setUsageCount((previous) => {
        const next = previous + 1;
        writeFixUsageCount(next);
        return next;
      });

      const nextThread = threadPayload ? {
        sessionId: threadPayload.sessionId,
        originalIssue: threadPayload.originalIssue,
        previousAnswer: data.answer,
        recentMessages: [
          ...threadPayload.recentMessages,
          {
            user: trimmedInput,
            assistant: data.answer,
          },
        ].slice(-3),
      } satisfies FixThreadState : {
        sessionId: createFixSessionId(),
        originalIssue: trimmedInput,
        previousAnswer: data.answer,
        recentMessages: [],
      } satisfies FixThreadState;

      setThread(nextThread);
      writeFixThreadState(nextThread);

      if (source === "follow_up") {
        setFollowUpInput("");
      }
    } catch {
      setError("Failed to analyze issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyResult() {
    if (!result?.answer || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.answer);
      setCopyState("copied");
      window.setTimeout(() => {
        setCopyState("idle");
      }, 1800);
    } catch {
      setCopyState("idle");
    }
  }

   function handleFeedback(value: Exclude<FixFeedbackValue, null>) {
     if (!result?.answer) {
       return;
     }

     setFeedbackState(value);
     saveFixFeedback(value, latestIssueContext || input, result.answer, thread?.sessionId);
   }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kintify Fix",
    url: "https://kintify.cloud/fix",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "Analyze cloud, API and infrastructure issues instantly. Get root cause, fix plan and trust validation.",
    featureList: [
      "AI root cause analysis",
      "Infrastructure issue diagnosis",
      "Fix recommendations",
      "Trust validation",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: "Kintify",
    },
  };

  const latestIssueContext = thread?.recentMessages[thread.recentMessages.length - 1]?.user ?? thread?.originalIssue ?? "";
  const metadataPills = result ? getMetadataPills(latestIssueContext, result.answer) : [];
  const issueSummary = result ? getIssueSummary(latestIssueContext, result.answer) : "";
  const suggestedNextChecks = result ? getSuggestedNextChecks(latestIssueContext, result.answer).slice(0, 4) : [];
  const displayedUsageCount = Math.min(usageCount, FIX_FREE_LIMIT);
  const freeFixesLeft = Math.max(FIX_FREE_LIMIT - usageCount, 0);
  const hasReachedFreeLimit = usageCount >= FIX_FREE_LIMIT;
  const currentLoadingMessage = FIX_LOADING_MESSAGES[loadingMessageIndex] ?? FIX_LOADING_MESSAGES[0];
  const shouldShowTrustPreview = usageCount === 0 && !loading && result === null;
  const currentTrustPreview = FIX_TRUST_PREVIEW_MESSAGES[trustPreviewIndex] ?? FIX_TRUST_PREVIEW_MESSAGES[0];
  const gracefulFailureCopy = error.length > 0 ? getGracefulFailureCopy(error) : null;

  return (
    <>
      <Script
        id="json-ld-fix"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-900/70">
          <div className="mx-auto flex w-full max-w-[900px] items-center justify-between px-4 py-4 sm:px-6">
            <div className="text-sm font-semibold tracking-tight text-white">
              Kintify
            </div>
            <a
              href="/docs"
              className="text-sm text-zinc-300 transition-colors hover:text-white"
            >
              Docs
            </a>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 sm:py-14">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
            Fix production issues in minutes not hours.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Paste logs, cloud errors, or configs. Get root cause, exact fix, and
            expected outcome.
          </p>

          <div className="mt-6 sm:mt-8">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                const nextValue = e.target.value;

                setInput(nextValue);

                if (inputGuidance) {
                  setInputGuidance(getInputGuidanceMessage(nextValue));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();

                  void submitIssue(input, "main");
                }
              }}
              onBlur={() => {
                if (input.trim().length === 0) {
                  setInputGuidance(getInputGuidanceMessage(input));
                }
              }}
              placeholder="Paste logs, cloud errors, or describe your issue…"
              className="w-full min-h-[180px] sm:min-h-[140px] resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-base text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
            />

            <div className="mt-6">
              <button
                type="button"
                disabled={loading || hasReachedFreeLimit || input.trim().length === 0}
                onClick={() => {
                  void submitIssue(input, "main");
                }}
                className="w-full rounded-xl bg-indigo-500 px-5 py-3.5 text-sm font-medium text-white shadow-sm transition-opacity hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-3"
              >
                Fix Issue
              </button>

              <div className="mt-2 text-xs text-zinc-500">
                {hasReachedFreeLimit ? `${displayedUsageCount} of ${FIX_FREE_LIMIT} free fixes used` : `Free fixes left: ${freeFixesLeft}`}
              </div>

              {hasReachedFreeLimit ? (
                <div className="mt-2 text-xs text-zinc-500">
                  <div>You’ve used your free Kintify fixes for now.</div>
                  <div className="mt-1 text-zinc-600">Please come back later or continue when access resets.</div>
                </div>
              ) : null}

              <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/70" />
                <span>Built for engineers handling real incidents.</span>
              </div>

              {inputGuidance ? (
                <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400/70" />
                  <span>{inputGuidance}</span>
                </div>
              ) : null}

              <div className="mt-6 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-6 sm:py-10">
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center gap-4"
                  >
                    <motion.div
                      className="h-8 w-8 rounded-full border-2 border-indigo-400/30 border-t-indigo-400"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="min-h-[20px] text-center">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={currentLoadingMessage}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="text-sm font-medium text-zinc-400"
                        >
                          {currentLoadingMessage}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <div className="flex items-center gap-2">
                      {FIX_LOADING_MESSAGES.map((message, index) => (
                        <motion.span
                          key={message}
                          animate={index === loadingMessageIndex ? { opacity: [0.55, 1, 0.55] } : { opacity: 0.45 }}
                          transition={index === loadingMessageIndex ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                          className={`rounded-full ${index === loadingMessageIndex ? "h-1.5 w-6 bg-indigo-400/70" : "h-1.5 w-1.5 bg-zinc-700"}`}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : error.length > 0 && gracefulFailureCopy ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mx-auto max-w-xl text-center"
                  >
                    <p className="text-sm font-medium text-zinc-300">
                      {gracefulFailureCopy.title}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {gracefulFailureCopy.detail}
                    </p>
                    <div className="mt-5 flex justify-center">
                      <button
                        type="button"
                        disabled={loading || (lastSubmittedInput || input).trim().length === 0}
                        onClick={() => {
                          const retryValue = lastSubmittedInput || input;
                          void submitIssue(retryValue, "main");
                        }}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Retry
                      </button>
                    </div>
                  </motion.div>
                ) : result === null ? (
                  <div className="text-center">
                    <p className="text-sm font-medium text-zinc-400">
                      Paste your issue to get a fast, practical fix.
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      Kintify helps you diagnose cloud issues faster.
                    </p>
                    {shouldShowTrustPreview ? (
                      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/60" />
                        <div className="min-h-[16px]">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={currentTrustPreview}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.28, ease: "easeOut" }}
                              className="text-[11px] text-zinc-500"
                            >
                              {currentTrustPreview}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-200">
                    <div className="mb-4 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          void handleCopyResult();
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
                      >
                        {copyState === "copied" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copyState === "copied" ? "Copied" : "Copy result"}
                      </button>
                    </div>

                    <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                      {issueSummary}
                    </div>

                    {(analysisDurationMs !== null || generationDurationMs !== null) ? (
                      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-500">
                        {analysisDurationMs !== null ? (
                          <span>Analysis completed in {formatDurationLabel(analysisDurationMs)}</span>
                        ) : null}
                        {generationDurationMs !== null ? (
                          <span>Live issue analysis completed in {formatDurationLabel(generationDurationMs)}</span>
                        ) : null}
                      </div>
                    ) : null}

                    <AnimatePresence>
                      {visibleCards.has("answer") && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="leading-relaxed text-zinc-100"
                        >
                          {revealedAnswer}
                          {isTypingAnswer && (
                            <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {metadataPills.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {metadataPills.map((pill) => (
                          <span
                            key={pill}
                            className="rounded-full border border-zinc-800/90 bg-zinc-900/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300 shadow-[0_0_18px_rgba(99,102,241,0.06)]"
                          >
                            {pill}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {suggestedNextChecks.length > 0 ? (
                      <div className="mt-4">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                          Quick next checks
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedNextChecks.map((check) => (
                            <button
                              key={check}
                              type="button"
                              onClick={() => {
                                setFollowUpInput(check);
                                followUpInputRef.current?.focus();
                              }}
                              className="rounded-full border border-zinc-800/90 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-indigo-500/40 hover:text-white"
                            >
                              {check}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-zinc-500">Was this helpful?</p>
                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          whileHover={{ y: -1 }}
                          onClick={() => handleFeedback("helpful")}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${feedbackState === "helpful" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-zinc-800/90 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:text-white"}`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          Helpful
                        </motion.button>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          whileHover={{ y: -1 }}
                          onClick={() => handleFeedback("not_enough")}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${feedbackState === "not_enough" ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-zinc-800/90 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:text-white"}`}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          Not enough
                        </motion.button>
                      </div>
                    </div>

                    {feedbackState ? (
                      <div className="mt-2 text-xs text-zinc-500">
                        Thanks — your feedback was saved on this device.
                      </div>
                    ) : null}

                    <div className="mt-5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-zinc-200">Need deeper help?</p>
                          <p className="mt-1 text-xs text-zinc-500">Continue this issue without repeating context.</p>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:max-w-[430px] sm:flex-row">
                          <input
                            ref={followUpInputRef}
                            value={followUpInput}
                            onChange={(e) => setFollowUpInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void submitIssue(followUpInput, "follow_up");
                              }
                            }}
                            placeholder="e.g. I checked that and it still fails"
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <button
                            type="button"
                            disabled={loading || hasReachedFreeLimit || followUpInput.trim().length === 0}
                            onClick={() => {
                              void submitIssue(followUpInput, "follow_up");
                            }}
                            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-indigo-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Continue issue
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function FixPage() {
  return (
    <Suspense>
      <FixDecisionPage />
    </Suspense>
  );
}

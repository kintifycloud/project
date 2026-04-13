"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type BlastRadius = "service" | "pod" | "infra" | "unknown";

type FixDecision = {
  action: string;
  confidence: string;
  blastRadius: BlastRadius;
  safety: string;
};

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

type FixUsageState = {
  count: number;
  resetAt: number;
};

const FIX_THREAD_STORAGE_KEY = "kintify.fix.thread";
const FIX_USAGE_STORAGE_KEY = "kintify.fix.usage.v2";
const FIX_FREE_LIMIT = 5;
const FIX_USAGE_WINDOW_MS = 60 * 60 * 1000;

function isFixDecision(value: unknown): value is FixDecision {
  if (!value || typeof value !== "object") {
    return false;
  }

  const decision = value as Record<string, unknown>;

  return (
    typeof decision.action === "string" &&
    typeof decision.confidence === "string" &&
    typeof decision.blastRadius === "string" &&
    typeof decision.safety === "string"
  );
}

function getInputGuidanceMessage(input: string): string | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return "Add logs, error text, or recent changes.";
  }

  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const isExplicitlyVague = ["help", "fix", "error", "issue", "bug", "broken", "problem"].includes(normalized);

  if (isExplicitlyVague) {
    return "Add logs, error text, or recent changes.";
  }

  if (trimmed.length < 12 && !/[\r\n:/.\\-]/.test(trimmed)) {
    return "Add logs, error text, or recent changes.";
  }

  return null;
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
            const assistant = toThreadString(item?.assistant, 600);

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

function readFixUsageState(): FixUsageState {
  if (typeof window === "undefined") {
    return {
      count: 0,
      resetAt: Date.now() + FIX_USAGE_WINDOW_MS,
    };
  }

  try {
    const raw = window.localStorage.getItem(FIX_USAGE_STORAGE_KEY);

    if (!raw) {
      return {
        count: 0,
        resetAt: Date.now() + FIX_USAGE_WINDOW_MS,
      };
    }

    const parsed = JSON.parse(raw) as { count?: unknown; resetAt?: unknown };
    const count = Number(parsed.count);
    const resetAt = Number(parsed.resetAt);
    const now = Date.now();

    if (!Number.isFinite(count) || !Number.isFinite(resetAt) || resetAt <= now) {
      return {
        count: 0,
        resetAt: now + FIX_USAGE_WINDOW_MS,
      };
    }

    return {
      count: Math.max(0, Math.floor(count)),
      resetAt,
    };
  } catch {
    return {
      count: 0,
      resetAt: Date.now() + FIX_USAGE_WINDOW_MS,
    };
  }
}

function writeFixUsageState(state: FixUsageState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FIX_USAGE_STORAGE_KEY, JSON.stringify(state));
}

function incrementFixUsageState(current: FixUsageState): FixUsageState {
  const now = Date.now();
  const active = current.resetAt <= now
    ? { count: 0, resetAt: now + FIX_USAGE_WINDOW_MS }
    : current;

  return {
    count: active.count + 1,
    resetAt: active.resetAt,
  };
}

function forceLimitReachedState(): FixUsageState {
  return {
    count: FIX_FREE_LIMIT,
    resetAt: Date.now() + FIX_USAGE_WINDOW_MS,
  };
}

function isExplicitNewIssue(input: string): boolean {
  return /\b(?:new issue|different issue|another issue|start over|reset context|clear context|new problem|unrelated)\b/i.test(input);
}

function isLikelyFollowUpInput(input: string): boolean {
  return /\b(?:still|now|after trying|i tried|i checked|that did not work|what next|continue|update|same issue|next step)\b/i.test(input);
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

function formatDecisionSummary(decision: FixDecision): string {
  return [
    `Action: ${decision.action}`,
    `Confidence: ${decision.confidence}`,
    `Blast Radius: ${decision.blastRadius}`,
    `Safety: ${decision.safety}`,
  ].join("\n");
}

function getScopeLabel(blastRadius: BlastRadius): string {
  if (blastRadius === "service") {
    return "service-level impact likely";
  }

  if (blastRadius === "pod") {
    return "pod or workload-level impact likely";
  }

  if (blastRadius === "infra") {
    return "infrastructure-level impact likely";
  }

  return "scope unclear";
}

export function FixDecisionPage() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FixDecision | null>(null);
  const [thread, setThread] = useState<FixThreadState | null>(null);
  const [followUpInput, setFollowUpInput] = useState("");
  const [usageState, setUsageState] = useState<FixUsageState>({
    count: 0,
    resetAt: Date.now() + FIX_USAGE_WINDOW_MS,
  });
  const [inputGuidance, setInputGuidance] = useState<string | null>(null);
  const [lastSubmittedInput, setLastSubmittedInput] = useState("");

  useEffect(() => {
    const nextThread = readFixThreadState();
    const nextUsageState = readFixUsageState();

    setThread(nextThread);
    setUsageState(nextUsageState);
    writeFixUsageState(nextUsageState);
  }, []);

  useEffect(() => {
    const prefill = searchParams.get("input");

    if (prefill) {
      setInput(prefill);
    }
  }, [searchParams]);

  async function submitIssue(rawInput: string, source: "main" | "follow_up") {
    const trimmedInput = rawInput.trim();

    if (loading) {
      return;
    }

    if (!trimmedInput) {
      setInputGuidance("Add logs, error text, or recent changes.");
      return;
    }

    const currentUsage = readFixUsageState();
    const localLimitReached = currentUsage.count >= FIX_FREE_LIMIT;

    setUsageState(currentUsage);
    writeFixUsageState(currentUsage);

    if (localLimitReached) {
      setError("Free limit reached");
      return;
    }

    if (source === "main") {
      const nextGuidance = getInputGuidanceMessage(trimmedInput);

      if (nextGuidance) {
        setInputGuidance(nextGuidance);
        return;
      }
    }

    const startsNewThread = shouldStartNewThread(trimmedInput, thread);
    const threadPayload = buildThreadPayload(trimmedInput, thread);

    setLoading(true);
    setError("");
    setInputGuidance(null);
    setResult(null);
    setLastSubmittedInput(trimmedInput);

    if (startsNewThread) {
      setThread(null);
      writeFixThreadState(null);
    }

    try {
      const response = await fetch("/api/fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: trimmedInput,
          ...(threadPayload ? { thread: threadPayload } : {}),
        } satisfies FixRequestBody),
      });

      const data = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Failed to analyze issue. Please try again.";

        if (response.status === 429 || message === "Free limit reached") {
          const limitedState = forceLimitReachedState();
          setUsageState(limitedState);
          writeFixUsageState(limitedState);
        }

        setError(message);
        return;
      }

      if (!isFixDecision(data)) {
        setError("Failed to analyze issue. Please try again.");
        return;
      }

      const nextResult = data satisfies FixDecision;
      const nextUsageState = incrementFixUsageState(currentUsage);
      const answerSummary = formatDecisionSummary(nextResult);

      setResult(nextResult);
      setUsageState(nextUsageState);
      writeFixUsageState(nextUsageState);

      const nextThread = threadPayload ? {
        sessionId: threadPayload.sessionId,
        originalIssue: threadPayload.originalIssue,
        previousAnswer: answerSummary,
        recentMessages: [
          ...threadPayload.recentMessages,
          {
            user: trimmedInput,
            assistant: answerSummary,
          },
        ].slice(-3),
      } satisfies FixThreadState : {
        sessionId: createFixSessionId(),
        originalIssue: trimmedInput,
        previousAnswer: answerSummary,
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

  const hasReachedFreeLimit = usageState.count >= FIX_FREE_LIMIT;
  const freeFixesLeft = Math.max(FIX_FREE_LIMIT - usageState.count, 0);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-indigo-400">/fix</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            SRE grade incident decision engine.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Paste the incident signal. Get the safest next action, confidence, scope and safety guardrail.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <textarea
            value={input}
            onChange={(event) => {
              const nextValue = event.target.value;
              setInput(nextValue);

              if (inputGuidance) {
                setInputGuidance(getInputGuidanceMessage(nextValue));
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submitIssue(input, "main");
              }
            }}
            placeholder="API latency after deploy, CrashLoopBackOff after config change, TLS failures after cert rotation..."
            className="min-h-[180px] w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={loading || hasReachedFreeLimit || input.trim().length === 0}
              onClick={() => {
                void submitIssue(input, "main");
              }}
              className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Evaluating safest next action..." : "Fix Issue"}
            </button>

            <div className="text-xs text-zinc-500">
              {hasReachedFreeLimit ? "Free limit reached" : `Free fixes left: ${freeFixesLeft}`}
            </div>
          </div>

          {inputGuidance ? (
            <div className="text-xs text-amber-300">{inputGuidance}</div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {result ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-5">
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Action</p>
                  <p className="mt-2 text-lg leading-relaxed text-white">{result.action}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Confidence</p>
                    <p className="mt-2 text-sm text-zinc-200">{result.confidence}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Scope</p>
                    <p className="mt-2 text-sm text-zinc-200">{getScopeLabel(result.blastRadius)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Blast Radius</p>
                    <p className="mt-2 text-sm text-zinc-200">{result.blastRadius}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Safety</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-200">{result.safety}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-800 px-5 py-8 text-sm text-zinc-500">
              {loading ? "Evaluating incident safety..." : "Your decision output will appear here."}
            </div>
          )}

          {result ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={followUpInput}
                  onChange={(event) => setFollowUpInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void submitIssue(followUpInput, "follow_up");
                    }
                  }}
                  placeholder="Continue this incident with one new signal"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  disabled={loading || hasReachedFreeLimit || followUpInput.trim().length === 0}
                  onClick={() => {
                    void submitIssue(followUpInput, "follow_up");
                  }}
                  className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-indigo-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue issue
                </button>
              </div>
            </div>
          ) : null}

          {lastSubmittedInput && !result && !loading && !error ? (
            <div className="text-xs text-zinc-600">Last request: {lastSubmittedInput}</div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

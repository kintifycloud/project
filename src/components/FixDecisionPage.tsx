"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  RotateCcw,
  Sparkles,
  Command,
  Zap,
  Terminal,
  Maximize2,
  Minimize2,
  Hash,
  MessageSquare,
  FileCode,
  Crown,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { getKintifyOutputTrustBadge } from "@/lib/aeo";
import { buildCheckoutUrl } from "@/lib/checkout";
import { useAuth } from "@/lib/auth-context";
import {
  getFreeFixesRemaining,
  hasProAccess,
  hasEnterpriseAccess,
  hasReachedFreeFixLimit,
  incrementKintifyUsage,
  KINTIFY_FREE_FIX_LIMIT,
  readKintifyPlan,
  readKintifyUsage,
  shouldShowSoftPaywall,
  trackMonetizationEvent,
  type KintifyPlan,
  type KintifyUsage,
} from "@/lib/monetization";
import { useEnterprise } from "@/lib/enterprise-context";
import { useTeam } from "@/lib/team-context";
import { createWorkspaceIncident, normalizeError } from "@/lib/team-mode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// =============================================================================
// PRO UX CONSTANTS & CONFIG
// =============================================================================

const STAGED_MESSAGES = [
  "Reading input…",
  "Detecting issue type…",
  "Analyzing signals…",
  "Forming safe action…",
] as const;

const SAMPLE_ISSUES = [
  "Kubernetes CrashLoopBackOff",
  "API latency spike",
  "SSL handshake failure",
  "DNS propagation issue",
] as const;

// STEP 1: Slash commands
const SLASH_COMMANDS = [
  { cmd: "/k8s", desc: "Kubernetes issues", example: "/k8s crashloop" },
  { cmd: "/api", desc: "API/latency issues", example: "/api timeout" },
  { cmd: "/dns", desc: "DNS issues", example: "/dns resolve" },
  { cmd: "/ssl", desc: "SSL/TLS issues", example: "/ssl cert" },
  { cmd: "/db", desc: "Database issues", example: "/db connection" },
  { cmd: "/log", desc: "Parse logs", example: "/log error" },
] as const;

// STEP 6: Inline quick actions
const INLINE_COMMANDS = [
  { cmd: "/verify", label: "Verify", desc: "Check the fix" },
  { cmd: "/flow", label: "Flow", desc: "Show steps" },
  { cmd: "/trace", label: "Trace", desc: "Root cause" },
  { cmd: "/guarantee", label: "Safety", desc: "Check safety" },
] as const;

const FIX_THREAD_STORAGE_KEY = "kintify.fix.thread";
const FIX_INPUT_STORAGE_KEY = "kintify.fix.input";
const FIX_INPUT_HISTORY_KEY = "kintify.fix.inputHistory";
const FIX_BROWSER_ID_KEY = "kintify.browser_id";
const FIX_FOCUS_MODE_KEY = "kintify.fix.focusMode";
const MAX_INPUT_HISTORY = 10;

// =============================================================================
// TYPES
// =============================================================================

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

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getInputGuidanceMessage(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return "Add logs, error text, or recent changes.";
  
  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const isExplicitlyVague = ["help", "fix", "error", "issue", "bug", "broken", "problem"].includes(normalized);
  
  if (isExplicitlyVague || (trimmed.length < 12 && !/[\r\n:/.\\-]/.test(trimmed))) {
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

function getBrowserId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(FIX_BROWSER_ID_KEY);
    if (existing) return existing;
    const newId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `browser-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(FIX_BROWSER_ID_KEY, newId);
    return newId;
  } catch {
    return "";
  }
}

function toThreadString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function readFixThreadState(): FixThreadState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(FIX_THREAD_STORAGE_KEY);
    if (!raw) return null;
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
            if (!user || !assistant) return null;
            return { user, assistant } satisfies FixThreadTurn;
          })
          .filter((entry): entry is FixThreadTurn => entry !== null)
          .slice(-3)
      : [];
    if (!sessionId || !originalIssue || !previousAnswer) return null;
    return { sessionId, originalIssue, previousAnswer, recentMessages };
  } catch {
    return null;
  }
}

function writeFixThreadState(thread: FixThreadState | null) {
  if (typeof window === "undefined") return;
  if (!thread) {
    window.sessionStorage.removeItem(FIX_THREAD_STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(FIX_THREAD_STORAGE_KEY, JSON.stringify(thread));
}

function isExplicitNewIssue(input: string): boolean {
  return /\b(?:new issue|different issue|another issue|start over|reset context|clear context|new problem|unrelated)\b/i.test(input);
}

function isLikelyFollowUpInput(input: string): boolean {
  return /\b(?:still|now|after trying|i tried|i checked|that did not work|what next|continue|update|same issue|next step)\b/i.test(input);
}

function shouldStartNewThread(input: string, thread: FixThreadState | null): boolean {
  if (!thread) return true;
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (trimmed === thread.originalIssue) return true;
  if (isExplicitNewIssue(trimmed)) return true;
  if (trimmed.length > 220 && !isLikelyFollowUpInput(trimmed)) return true;
  if (/[\r\n]/.test(trimmed) && trimmed.length > 120 && !isLikelyFollowUpInput(trimmed)) return true;
  return false;
}

function buildThreadPayload(input: string, thread: FixThreadState | null): FixRequestBody["thread"] | undefined {
  if (!thread || shouldStartNewThread(input, thread)) return undefined;
  return {
    sessionId: thread.sessionId,
    originalIssue: thread.originalIssue,
    previousAnswer: thread.previousAnswer,
    recentMessages: thread.recentMessages.slice(-3),
    isFollowUp: true,
  };
}

function cleanOutputFormat(text: string): string {
  let cleaned = text.trim();
  // Remove code block markers
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");
  cleaned = cleaned.replace(/`{3}[\w]*\n?/g, "");
  // Remove markdown artifacts
  cleaned = cleaned.replace(/^[\s]*[-•*·]\s*/gm, "");
  cleaned = cleaned.replace(/^[\s]*\d+[.)]\s*/gm, "");
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, "$1");
  cleaned = cleaned.replace(/__(.+?)__/g, "$1");
  cleaned = cleaned.replace(/_(.+?)_/g, "$1");
  cleaned = cleaned.replace(/`(.+?)`/g, "$1");
  cleaned = cleaned.replace(/#{1,6}\s*/g, "");
  cleaned = cleaned.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  cleaned = cleaned.replace(/\[\]/g, "");
  cleaned = cleaned.replace(/\(\)/g, "");
  cleaned = cleaned.replace(/!\[([^\]]*)\]/g, "$1");
  // Normalize whitespace
  cleaned = cleaned.replace(/—+/g, "—");
  cleaned = cleaned.replace(/-{2,}/g, "—");
  cleaned = cleaned.replace(/…/g, "...");
  cleaned = cleaned.replace(/[ \t]+/g, " ");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.replace(/[ \t]*\n[ \t]*/g, " ");
  cleaned = cleaned.split("\n").map((line) => line.trim()).join("\n");
  // Ensure proper ending
  cleaned = cleaned.trim();
  if (cleaned.length > 0 && !/[.!?;:]$/.test(cleaned)) {
    cleaned += ".";
  }
  cleaned = cleaned.replace(/\.{2,}/g, ".");
  return cleaned.trim();
}

// =============================================================================
// PRO UX: INPUT HISTORY MANAGEMENT (STEP 4)
// =============================================================================

function readInputHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FIX_INPUT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed.slice(-MAX_INPUT_HISTORY);
    }
    return [];
  } catch {
    return [];
  }
}

function writeInputHistory(history: string[]) {
  if (typeof window === "undefined") return;
  try {
    const unique = [...new Set(history)].slice(-MAX_INPUT_HISTORY);
    window.localStorage.setItem(FIX_INPUT_HISTORY_KEY, JSON.stringify(unique));
  } catch {
    // Ignore
  }
}

function addToInputHistory(input: string) {
  if (!input.trim()) return;
  const history = readInputHistory();
  // Remove if exists, add to end
  const filtered = history.filter((h) => h !== input);
  filtered.push(input);
  writeInputHistory(filtered);
}

// =============================================================================
// PRO UX: SMART PARSING (STEP 11)
// =============================================================================

type InputType = "logs" | "stacktrace" | "config" | "description" | "command";

function detectInputType(input: string): InputType {
  const trimmed = input.trim();
  
  // Stack trace detection
  if (/\s+at\s+.+\(.+:\d+:\d+\)/.test(trimmed) || /Exception|Error:\s+/.test(trimmed)) {
    return "stacktrace";
  }
  
  // Log format detection (timestamps, log levels)
  if (/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(trimmed) || /\[(INFO|WARN|ERROR|DEBUG|TRACE)\]/i.test(trimmed)) {
    return "logs";
  }
  
  // Config file detection
  if (/^(apiVersion|kind|metadata|spec|data|config)/m.test(trimmed) || /^(---|\{\s*")/.test(trimmed)) {
    return "config";
  }
  
  // Shell command detection
  if (/^(kubectl|docker|helm|aws|gcloud|terraform|ansible)/i.test(trimmed)) {
    return "command";
  }
  
  return "description";
}

function enhanceInputWithContext(input: string, inputType: InputType): string {
  const prefixMap: Record<InputType, string> = {
    logs: "[LOG ANALYSIS] ",
    stacktrace: "[STACK TRACE] ",
    config: "[CONFIG REVIEW] ",
    command: "[COMMAND DEBUG] ",
    description: "",
  };
  
  return inputType !== "description" ? `${prefixMap[inputType]}${input}` : input;
}

// =============================================================================
// PRO UX: FOCUS MODE (STEP 8)
// =============================================================================

function readFocusMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(FIX_FOCUS_MODE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeFocusMode(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FIX_FOCUS_MODE_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore
  }
}

function getGeneratedConversionStorageKey(slug: string): string {
  return `kintify.generated.conversion.${slug}`;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function StagedLoadingIndicator({ messageIndex }: { messageIndex: number }) {
  const visibleMessages = STAGED_MESSAGES.slice(0, messageIndex + 1);
  
  return (
    <div className="flex flex-col gap-2">
      {visibleMessages.map((msg, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            {idx === messageIndex && (
              <div className="absolute inset-0 h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping opacity-60" />
            )}
          </div>
          <span className={`text-sm ${idx === messageIndex ? "text-zinc-200" : "text-zinc-500"}`}>
            {msg}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function SampleIssuePill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(99, 102, 241, 0.15)" }}
      whileTap={{ scale: 0.98 }}
      className="rounded-full border border-zinc-700/50 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-indigo-500/30 hover:text-zinc-200"
    >
      {label}
    </motion.button>
  );
}

type ValidRoute = "/trace" | `/verify?${string}` | `/flow?${string}` | `/guarantee?${string}`;

function PostOutputLink({ href, children }: { href: ValidRoute; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
    >
      {children}
    </Link>
  );
}

// =============================================================================
// PRO UX SUB-COMPONENTS
// =============================================================================

// STEP 1: Command dropdown for slash commands
function CommandDropdown({
  input,
  selectedIndex,
  onSelect,
  visible,
}: {
  input: string;
  selectedIndex: number;
  onSelect: (cmd: string) => void;
  visible: boolean;
}) {
  if (!visible || !input.startsWith("/")) return null;
  
  const query = input.slice(1).toLowerCase();
  const filtered = SLASH_COMMANDS.filter(
    (c) => c.cmd.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query)
  );
  
  if (filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-zinc-700 bg-zinc-800 shadow-xl"
    >
      <div className="py-1">
        {filtered.map((cmd, idx) => (
          <button
            key={cmd.cmd}
            type="button"
            onClick={() => onSelect(cmd.cmd)}
            className={`w-full px-4 py-2.5 text-left transition-colors ${
              idx === selectedIndex ? "bg-indigo-500/10" : "hover:bg-zinc-700/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-200">{cmd.cmd}</span>
              <span className="text-xs text-zinc-500">{cmd.desc}</span>
            </div>
            <div className="mt-0.5 text-xs text-zinc-600">{cmd.example}</div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// STEP 7: Multiple copy format buttons
function CopyFormats({ text, input }: { text: string; input: string }) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  // This state is used in the component

  const copyAs = useCallback(
    async (format: "plain" | "slack" | "markdown") => {
      let content = text;
      if (format === "slack") {
        content = `*Issue:* ${input}\n*Fix:* ${text}`;
      } else if (format === "markdown") {
        content = `## Issue\n${input}\n\n## Fix\n${text}`;
      }
      try {
        await navigator.clipboard.writeText(content);
        setCopiedFormat(format);
        setTimeout(() => setCopiedFormat(null), 2000);
      } catch {
        // Ignore
      }
    },
    [text, input]
  );

  const formats = [
    { key: "plain", icon: Copy, label: "Copy" },
    { key: "slack", icon: MessageSquare, label: "Slack" },
    { key: "markdown", icon: FileCode, label: "Markdown" },
  ] as const;

  return (
    <div className="flex items-center gap-1">
      {formats.map(({ key, icon: Icon, label }) => (
        <motion.button
          key={key}
          type="button"
          onClick={() => void copyAs(key)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
        >
          <Icon className="h-3.5 w-3.5" />
          {copiedFormat === key ? "Copied!" : label}
        </motion.button>
      ))}
    </div>
  );
}

// STEP 3: Re-run button
function ReRunButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-indigo-500/30 hover:text-indigo-400 disabled:opacity-40"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      ↻ Re-run
    </motion.button>
  );
}

// STEP 11: Input type indicator
function InputTypeIndicator({ type }: { type: InputType }) {
  const icons = {
    logs: Terminal,
    stacktrace: Hash,
    config: FileCode,
    command: Command,
    description: Sparkles,
  };
  const labels = {
    logs: "Log analysis",
    stacktrace: "Stack trace",
    config: "Config review",
    command: "Command debug",
    description: "Issue description",
  };
  const Icon = icons[type];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-1.5 text-xs text-zinc-500"
    >
      <Icon className="h-3.5 w-3.5" />
      {labels[type]}
    </motion.div>
  );
}

// Feedback buttons for evaluation (STEP 4)
function FeedbackButtons({ onFeedback, feedbackGiven }: { onFeedback: (feedback: boolean) => void; feedbackGiven: boolean | null }) {
  if (feedbackGiven !== null) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-xs text-zinc-500"
      >
        {feedbackGiven ? (
          <span className="flex items-center gap-1 text-green-400">
            <ThumbsUp className="h-3.5 w-3.5" />
            Thanks for the feedback!
          </span>
        ) : (
          <span className="flex items-center gap-1 text-zinc-400">
            <ThumbsDown className="h-3.5 w-3.5" />
            We&apos;ll improve next time
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <span className="text-xs text-zinc-500">Was this helpful?</span>
      <motion.button
        type="button"
        onClick={() => onFeedback(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-1.5 text-zinc-400 transition-colors hover:border-green-500/30 hover:text-green-400"
        title="Helpful"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </motion.button>
      <motion.button
        type="button"
        onClick={() => onFeedback(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-1.5 text-zinc-400 transition-colors hover:border-red-500/30 hover:text-red-400"
        title="Not helpful"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </motion.button>
    </motion.div>
  );
}

// STEP 6: Inline command pills
function InlineCommandPills({ onSelect, lastInput }: { onSelect: (cmd: string) => void; lastInput: string }) {
  if (!lastInput) return null;
  
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <span className="text-xs text-zinc-500">Quick action:</span>
      {INLINE_COMMANDS.map(({ cmd, desc }) => (
          <motion.button
            key={cmd}
            type="button"
            onClick={() => onSelect(cmd)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full border border-zinc-700/50 bg-zinc-800/50 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-indigo-500/30 hover:text-indigo-400"
            title={desc}
          >
            {cmd}
          </motion.button>
      ))}
    </div>
  );
}



export function FixDecisionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { canCreateIncidents, trackAudit } = useEnterprise();
  const { activeWorkspace } = useTeam();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [textareaHeight, setTextareaHeight] = useState(120);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [thread, setThread] = useState<FixThreadState | null>(null);
  const [usageState, setUsageState] = useState<KintifyUsage>(() => readKintifyUsage());
  const [plan, setPlan] = useState<KintifyPlan>(() => readKintifyPlan());
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [inputGuidance, setInputGuidance] = useState<string | null>(null);
  const [stagedMessageIndex, setStagedMessageIndex] = useState(0);
  const [displayedResult, setDisplayedResult] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [browserId] = useState(() => getBrowserId());
  const [trace, setTrace] = useState<string | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  
  // STEP 8: Focus Mode
  const [focusMode, setFocusMode] = useState(() => readFocusMode());
  
  // STEP 1: Command dropdown
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [lastSubmittedInput, setLastSubmittedInput] = useState<string>("");
  
  // STEP 4: Input history navigation
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // STEP 5: Streaming output handled in typewriter effect
  
  // STEP 11: Smart parsing
  const [detectedInputType, setDetectedInputType] = useState<InputType>("description");
  
  // STEP 7: Copy formats handled in CopyFormats component
  
  // STEP 10: Multi-issue detection for future enhancement

  // STEP 7: Smart Input Memory - Restore from localStorage
  useEffect(() => {
    const nextThread = readFixThreadState();
    const nextUsageState = readKintifyUsage();
    const nextPlan = readKintifyPlan();
    setThread(nextThread);
    setUsageState(nextUsageState);
    setPlan(nextPlan);

    // Restore saved input
    if (typeof window !== "undefined") {
      try {
        const savedInput = window.localStorage.getItem(FIX_INPUT_STORAGE_KEY);
        if (savedInput) {
          setInput(savedInput);
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }, []);

  const handleUpgrade = useCallback((targetPlan: "pro" | "team" = "pro") => {
    trackMonetizationEvent("checkoutClick");
    router.push(buildCheckoutUrl(targetPlan));
  }, [router]);

  const handleMaybeLater = useCallback(() => {
    setPaywallOpen(false);
    trackMonetizationEvent("paywallDismiss");
  }, []);

  const submitIssue = useCallback(async (rawInput: string, isReRun = false) => {
    const trimmedInput = rawInput.trim();

    if (loading) return;

    if (!trimmedInput) {
      setInputGuidance("Add logs, error text, or recent changes.");
      return;
    }

    // STEP 4: Save to input history
    if (!isReRun) {
      addToInputHistory(trimmedInput);
      setLastSubmittedInput(trimmedInput);
    }

    const currentUsage = readKintifyUsage();
    const currentPlan = readKintifyPlan();
    setUsageState(currentUsage);
    setPlan(currentPlan);

    if (!hasProAccess(currentPlan) && hasReachedFreeFixLimit(currentUsage)) {
      setError("");
      setPaywallOpen(true);
      trackMonetizationEvent("paywallView");
      return;
    }

    const nextGuidance = getInputGuidanceMessage(trimmedInput);
    if (nextGuidance) {
      setInputGuidance(nextGuidance);
      return;
    }

    // STEP 11: Smart parsing enhancement
    const inputType = detectInputType(trimmedInput);
    const enhancedInput = enhanceInputWithContext(trimmedInput, inputType);

    const startsNewThread = shouldStartNewThread(trimmedInput, thread);
    const threadPayload = buildThreadPayload(trimmedInput, thread);

    setLoading(true);
    setError("");
    setInputGuidance(null);
    setResult(null);
    setHasSubmitted(true);

    if (startsNewThread) {
      setThread(null);
      writeFixThreadState(null);
    }

    try {
      // STEP 9: Latency optimization - warm connection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch("/api/fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kintify-Priority": hasProAccess(currentPlan) ? "true" : "false",
          "X-Kintify-Enterprise": hasEnterpriseAccess(currentPlan) ? "true" : "false",
        },
        body: JSON.stringify({
          input: enhancedInput,
          browserId,
          priority: hasProAccess(currentPlan),
          enterprise: hasEnterpriseAccess(currentPlan),
          ...(threadPayload ? { thread: threadPayload } : {}),
        } satisfies FixRequestBody & { browserId: string; priority: boolean; enterprise: boolean }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Couldn't analyze this — try simplifying the issue";

        if (message === "Free limit reached") {
          const limitedState = {
            count: KINTIFY_FREE_FIX_LIMIT,
            month: readKintifyUsage().month,
          } satisfies KintifyUsage;
          setUsageState(limitedState);
          setPaywallOpen(true);
          trackMonetizationEvent("paywallView");
        }

        setError(message);
        return;
      }

      if (!data || typeof data !== "object" || !("answer" in data) || typeof (data as { answer?: unknown }).answer !== "string") {
        setError("Couldn't analyze this — try simplifying the issue");
        return;
      }

      const nextResult = (data as { answer: string }).answer;
      const nextTrace = (data as { trace?: string }).trace ?? null;
      const nextUsageState = hasProAccess(currentPlan)
        ? currentUsage
        : incrementKintifyUsage(currentUsage);

      setResult(nextResult);
      setTrace(nextTrace);
      setShowTrace(false);
      setDisplayedResult("");
      setUsageState(nextUsageState);
      trackMonetizationEvent("fixSuccess");

      if (user && !canCreateIncidents) {
        setError("Your enterprise role is read-only in this organization.");
      } else if (user) {
        try {
          const incident = await createWorkspaceIncident(user, activeWorkspace.id, currentPlan, {
            input: trimmedInput,
            output: nextResult,
            trace: nextTrace,
          });

          await trackAudit({
            action: "fix.generated",
            incidentId: incident.id,
            metadata: {
              input: trimmedInput,
              workspaceId: activeWorkspace.id,
              priority: hasEnterpriseAccess(currentPlan) ? "enterprise" : hasProAccess(currentPlan) ? "paid" : "standard",
            },
          });
        } catch (incidentError) {
          setError(normalizeError(incidentError, "Fix generated, but the incident could not be saved."));
        }
      }

      const nextThread = threadPayload
        ? {
            sessionId: threadPayload.sessionId,
            originalIssue: threadPayload.originalIssue,
            previousAnswer: nextResult,
            recentMessages: [
              ...threadPayload.recentMessages,
              { user: trimmedInput, assistant: nextResult },
            ].slice(-3),
          } satisfies FixThreadState
        : {
            sessionId: createFixSessionId(),
            originalIssue: trimmedInput,
            previousAnswer: nextResult,
            recentMessages: [],
          } satisfies FixThreadState;

      setThread(nextThread);
      writeFixThreadState(nextThread);
    } catch {
      // STEP 9: Better error UX - keep input intact, show friendly message
      setError("Couldn't analyze this — try simplifying the issue");
    } finally {
      setLoading(false);
    }
  }, [loading, thread, browserId, user, activeWorkspace, canCreateIncidents, trackAudit, setInputGuidance, setUsageState, setPlan, setError, setPaywallOpen, setResult, setHasSubmitted, setThread, setTrace, setShowTrace, setDisplayedResult]);

  // STEP 2: Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K → Focus input
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        textareaRef.current?.focus();
      }
      
      // Cmd/Ctrl + Enter → Re-run last fix
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "Enter" &&
        lastSubmittedInput &&
        !loading &&
        hasProAccess(plan)
      ) {
        e.preventDefault();
        void submitIssue(lastSubmittedInput, true);
      }
      
      // Esc → Clear output and close dropdowns
      if (e.key === "Escape") {
        setShowCommands(false);
        if (result) {
          setResult(null);
          setDisplayedResult("");
          setTrace(null);
          setShowTrace(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastSubmittedInput, loading, plan, result, submitIssue]);

  // STEP 1: Command dropdown visibility based on input
  useEffect(() => {
    if (input.startsWith("/") && !input.includes(" ")) {
      setShowCommands(true);
      setSelectedCommandIndex(0);
    } else {
      setShowCommands(false);
    }
  }, [input]);

  // STEP 11: Smart parsing - detect input type
  useEffect(() => {
    if (input.length > 10) {
      setDetectedInputType(detectInputType(input));
    }
  }, [input]);

  // Save input to localStorage on change (debounced)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const timeout = setTimeout(() => {
      try {
        if (input.trim()) {
          window.localStorage.setItem(FIX_INPUT_STORAGE_KEY, input);
        }
      } catch {
        // Ignore localStorage errors
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [input]);

  // URL prefill
  useEffect(() => {
    const prefill = searchParams.get("input");
    if (prefill) {
      setInput(prefill);
    }
  }, [searchParams]);

  useEffect(() => {
    const source = searchParams.get("source");
    if (!source || typeof window === "undefined") {
      return;
    }

    const storageKey = getGeneratedConversionStorageKey(source);
    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    window.sessionStorage.setItem(storageKey, "1");
    void fetch("/api/analytics/fix-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: source, type: "conversion" }),
      keepalive: true,
    }).catch(() => undefined);
  }, [searchParams]);

  // STEP 2: Staged loading messages - appear progressively
  useEffect(() => {
    if (!loading) {
      setStagedMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStagedMessageIndex((prev) => {
        if (prev < STAGED_MESSAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [loading]);

  // STEP 3: Typewriter output effect
  useEffect(() => {
    if (!result) {
      setDisplayedResult("");
      setIsTyping(false);
      return;
    }

    const cleanedResult = cleanOutputFormat(result);
    const chunks: string[] = [];
    const words = cleanedResult.split(" ").filter((w): w is string => w.length > 0);

    for (let i = 0; i < words.length; i++) {
      const word = words[i] ?? "";
      if (i < words.length - 1) {
        chunks.push(word + " ");
      } else {
        chunks.push(word);
      }
    }

    setDisplayedResult("");
    setIsTyping(true);

    let chunkIndex = 0;
    let currentText = "";

    const getSpeed = (chunk: string | undefined): number => {
      if (!chunk) return 15;
      if (/[.!?;:]$/.test(chunk)) return 50;
      if (chunk.length > 8) return 22;
      return 15;
    };

    const typeNext = () => {
      if (chunkIndex < chunks.length) {
        const chunk = chunks[chunkIndex];
        if (chunk) {
          currentText += chunk;
          setDisplayedResult(currentText);
        }
        chunkIndex++;
        const speed = getSpeed(chunk);
        setTimeout(typeNext, speed);
      } else {
        setIsTyping(false);
      }
    };

    typeNext();
  }, [result]);

  // STEP 1: Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 120), 400);
      setTextareaHeight(newHeight);
    }
  }, [input]);

  const handleSampleClick = useCallback((sample: string) => {
    setInput(sample);
    textareaRef.current?.focus();
  }, []);

  const handleReset = useCallback(() => {
    setInput("");
    setResult(null);
    setError("");
    setTrace(null);
    setShowTrace(false);
    setHasSubmitted(false);
    setDisplayedResult("");
    setThread(null);
    setLastSubmittedInput("");
    setFeedbackGiven(null);
    // Reset complete
    writeFixThreadState(null);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(FIX_INPUT_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
    textareaRef.current?.focus();
  }, []);

  const handleFeedback = useCallback(async (feedback: boolean) => {
    setFeedbackGiven(feedback);
    
    // Send feedback to evaluation system (STEP 4)
    try {
      await fetch("/api/evaluation/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: "temp", // TODO: Pass actual evaluation record ID from API response
          feedback,
        }),
      });
    } catch {
      // Silently fail - feedback is optional
    }
  }, []);

  // STEP 8: Toggle focus mode
  const toggleFocusMode = useCallback(() => {
    const newMode = !focusMode;
    setFocusMode(newMode);
    writeFocusMode(newMode);
  }, [focusMode]);

  // STEP 1: Handle command selection
  const handleCommandSelect = useCallback((cmd: string) => {
    setInput(cmd + " ");
    setShowCommands(false);
    textareaRef.current?.focus();
  }, []);

  // STEP 6: Handle inline quick actions
  const handleInlineCommand = useCallback((cmd: string) => {
    if (lastSubmittedInput && hasProAccess(plan)) {
      void submitIssue(`${cmd} ${lastSubmittedInput}`, true);
    }
  }, [lastSubmittedInput, plan, submitIssue]);

  const hasReachedFreeLimit = !hasProAccess(plan) && hasReachedFreeFixLimit(usageState);
  const freeFixesLeft = hasProAccess(plan) ? Infinity : getFreeFixesRemaining(usageState);
  const showSoftPaywall = shouldShowSoftPaywall(usageState, plan) && !loading && !result;

  return (
    <main className={`min-h-screen bg-zinc-950 text-zinc-100 transition-all duration-300 ${focusMode ? "fixed inset-0 z-50" : ""}`}>
      <Dialog open={paywallOpen} onOpenChange={setPaywallOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You’ve used your free fixes</DialogTitle>
            <DialogDescription>
              Upgrade to continue fixing issues instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-300">
            <p className="font-medium text-white">Kintify Pro unlocks:</p>
            <ul className="mt-3 space-y-2 text-zinc-400">
              <li>Unlimited fixes</li>
              <li>Faster responses with priority routing</li>
              <li>Full `/history` access</li>
              <li>Pro UX features like re-run and advanced keyboard flow</li>
            </ul>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={handleMaybeLater}
              className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              Maybe later
            </button>
            <button
              type="button"
              onClick={() => handleUpgrade("pro")}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
            >
              <Crown className="h-4 w-4" />
              Upgrade
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className={`mx-auto w-full px-4 py-8 sm:px-6 transition-all duration-300 ${focusMode ? "h-screen max-w-none py-4" : "max-w-3xl sm:py-12"}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`flex items-start justify-between ${focusMode ? "hidden" : "space-y-2"}`}
        >
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-400">/fix</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              What broke?
            </h1>
            <p className="max-w-xl text-sm text-zinc-400">
              Paste logs, errors, or describe your issue. Get instant, actionable guidance.
            </p>
          </div>
          
          {/* STEP 8: Focus Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-zinc-500 sm:block">
              <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono">⌘K</kbd> focus
            </span>
            <motion.button
              type="button"
              onClick={toggleFocusMode}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-indigo-500/30 hover:text-zinc-200"
              title={focusMode ? "Exit focus mode" : "Enter focus mode"}
            >
              {focusMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {focusMode ? "Exit" : "Focus"}
            </motion.button>
          </div>
        </motion.div>

        {/* STEP 1 & 4: Input Area - Clean, auto-resizing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-6"
        >
          <div
            className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
              loading
                ? "border-zinc-800/50 bg-zinc-900/50 opacity-70"
                : "border-zinc-800 bg-zinc-900 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.07)]"
            }`}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => {
                const nextValue = event.target.value;
                setInput(nextValue);
                if (inputGuidance) {
                  setInputGuidance(getInputGuidanceMessage(nextValue));
                }
              }}
              onKeyDown={(event) => {
                // STEP 1: Command dropdown navigation
                if (showCommands) {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    const filtered = SLASH_COMMANDS.filter((c) => 
                      c.cmd.toLowerCase().includes(input.slice(1).toLowerCase())
                    );
                    setSelectedCommandIndex((prev) => (prev + 1) % filtered.length);
                    return;
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    const filtered = SLASH_COMMANDS.filter((c) => 
                      c.cmd.toLowerCase().includes(input.slice(1).toLowerCase())
                    );
                    setSelectedCommandIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
                    return;
                  }
                  if (event.key === "Enter" || event.key === "Tab") {
                    event.preventDefault();
                    const filtered = SLASH_COMMANDS.filter((c) => 
                      c.cmd.toLowerCase().includes(input.slice(1).toLowerCase())
                    );
                    if (filtered[selectedCommandIndex]) {
                      handleCommandSelect(filtered[selectedCommandIndex].cmd);
                    }
                    return;
                  }
                  if (event.key === "Escape") {
                    setShowCommands(false);
                    return;
                  }
                }
                
                // STEP 4: Input history navigation (when at start of empty line)
                if (!showCommands && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
                  if (event.key === "ArrowUp" && (input === "" || textareaRef.current?.selectionStart === 0)) {
                    event.preventDefault();
                    const history = readInputHistory();
                    if (history.length > 0) {
                      const newIndex = Math.min(historyIndex + 1, history.length - 1);
                      setHistoryIndex(newIndex);
                      setInput(history[history.length - 1 - newIndex] ?? "");
                    }
                    return;
                  }
                  if (event.key === "ArrowDown" && historyIndex >= 0) {
                    event.preventDefault();
                    const newIndex = historyIndex - 1;
                    setHistoryIndex(newIndex);
                    if (newIndex < 0) {
                      setInput("");
                    } else {
                      const history = readInputHistory();
                      setInput(history[history.length - 1 - newIndex] ?? "");
                    }
                    return;
                  }
                }
                
                // STEP 2: Enter = submit, Shift+Enter = newline
                if (event.key === "Enter" && !event.shiftKey && !showCommands) {
                  event.preventDefault();
                  void submitIssue(input);
                }
              }}
              onFocus={() => {
                // STEP 9: Latency optimization - prefetch hint
                if (typeof window !== "undefined" && "connection" in navigator) {
                  const conn = (navigator as { connection?: { type?: string } }).connection;
                  if (conn?.type !== "cellular") {
                    // Pre-warm connection
                    void fetch("/api/fix", { method: "HEAD" }).catch(() => {});
                  }
                }
              }}
              disabled={loading}
              placeholder="Describe your issue or paste error logs..."
              className="w-full resize-none bg-transparent px-4 py-4 text-base leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed sm:text-sm"
              style={{ height: `${textareaHeight}px`, minHeight: "120px", maxHeight: "400px" }}
            />
            
            {/* STEP 1: Command dropdown */}
            <CommandDropdown
              input={input}
              selectedIndex={selectedCommandIndex}
              onSelect={handleCommandSelect}
              visible={showCommands}
            />

            {/* STEP 1: Sample issues pills */}
            {!hasSubmitted && !loading && (
              <div className="border-t border-zinc-800/50 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-zinc-500">
                    <Sparkles className="mr-1 inline h-3 w-3" />
                    Try:
                  </span>
                  {SAMPLE_ISSUES.map((sample) => (
                    <SampleIssuePill
                      key={sample}
                      label={sample}
                      onClick={() => handleSampleClick(sample)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Helper text with PRO UX hints */}
          {!hasSubmitted && !loading && (
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>Try: <span className="text-zinc-400">/</span>k8s, <span className="text-zinc-400">/</span>api, <span className="text-zinc-400">/</span>ssl… or paste logs</span>
              <span className="hidden sm:inline"><kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 font-mono text-[10px]">Esc</kbd> clear</span>
            </div>
          )}

          {showSoftPaywall ? (
            <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-100">
              1 free fix remaining
            </div>
          ) : null}

          {/* STEP 9: Error display - keeps input intact */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input guidance */}
          {inputGuidance && !error && (
            <p className="mt-2 text-xs text-amber-300">{inputGuidance}</p>
          )}

          {/* Submit button & PRO UX controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                disabled={loading || hasReachedFreeLimit || input.trim().length === 0}
                onClick={() => void submitIssue(input)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Zap className="h-4 w-4 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Terminal className="h-4 w-4" />
                    Fix Issue
                  </>
                )}
              </motion.button>
              
              {/* STEP 3: Re-run button (shown when we have last input) */}
              {lastSubmittedInput && !loading && hasProAccess(plan) && (
                <ReRunButton
                  onClick={() => void submitIssue(lastSubmittedInput, true)}
                  disabled={hasReachedFreeLimit}
                />
              )}
              
              {/* STEP 11: Smart input type indicator */}
              {input.length > 10 && <InputTypeIndicator type={detectedInputType} />}
            </div>

            <div className="flex items-center gap-3">
              {/* Keyboard shortcut hint */}
              <span className="hidden text-xs text-zinc-500 sm:block">
                <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono">↵</kbd> run
                {hasProAccess(plan) ? (
                  <>
                    <span className="mx-1">·</span>
                    <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono">Shift↵</kbd> newline
                  </>
                ) : null}
              </span>
              
              <span className="text-xs text-zinc-500">
                {hasReachedFreeLimit
                  ? "Free limit reached"
                  : `${freeFixesLeft} free ${freeFixesLeft === 1 ? "fix" : "fixes"} left this month`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* STEP 2 & 3: Output Area */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {/* Loading state with staged messages */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-6 py-8"
              >
                <StagedLoadingIndicator messageIndex={stagedMessageIndex} />
              </motion.div>
            )}

            {/* Empty state - PRO UX hints */}
            {!loading && !result && !hasSubmitted && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-zinc-800/50 bg-zinc-900/20 px-6 py-12 text-center"
              >
                <div className="space-y-3">
                  <p className="text-sm text-zinc-400">
                    Paste logs, errors, or type <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-xs">/</kbd> for commands
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 font-mono">⌘K</kbd> focus
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 font-mono">↑↓</kbd> history
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 font-mono">⌘↵</kbd> re-run
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Clean paragraph output - NO CARDS */}
            {!loading && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-6 sm:px-8 sm:py-8"
              >
                {/* STEP 7: Copy formats */}
                <div className="mb-4 flex items-start justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Suggested Action
                  </span>
                  <CopyFormats text={displayedResult} input={lastSubmittedInput || input} />
                </div>

                {/* STEP 3: Typewriter output */}
                <p className="text-lg leading-relaxed text-zinc-100 sm:text-xl sm:leading-relaxed">
                  {displayedResult}
                  {isTyping && (
                    <span className="ml-1 inline-block h-5 w-[2px] animate-pulse bg-indigo-400" />
                  )}
                </p>

                <p className="mt-3 text-xs text-zinc-500">
                  {getKintifyOutputTrustBadge()}
                </p>

                {/* STEP 4: Feedback buttons for evaluation */}
                {!isTyping && (
                  <div className="mt-4">
                    <FeedbackButtons 
                      onFeedback={handleFeedback} 
                      feedbackGiven={feedbackGiven} 
                    />
                  </div>
                )}

                {!isTyping && !hasProAccess(plan) ? (
                  <div className="mt-4 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.05] px-4 py-3 text-sm text-zinc-300">
                    Saved time debugging this?{" "}
                    <button
                      type="button"
                      onClick={() => handleUpgrade("pro")}
                      className="font-medium text-indigo-300 underline-offset-4 transition-colors hover:text-indigo-200 hover:underline"
                    >
                      Upgrade for unlimited fixes.
                    </button>
                  </div>
                ) : null}

                {/* Trace expansion */}
                {!isTyping && trace && (
                  <div className="mt-6 pt-4 border-t border-zinc-800/50">
                    {!showTrace ? (
                      <button
                        type="button"
                        onClick={() => setShowTrace(true)}
                        className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                      >
                        See why this happened →
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-zinc-400"
                      >
                        {trace}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* STEP 6: Post-output hooks */}
                {!isTyping && (
                  <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 pt-4 border-t border-zinc-800/50">
                    <PostOutputLink href="/trace">See why this happened →</PostOutputLink>
                    <PostOutputLink href={`/verify?action=${encodeURIComponent(displayedResult)}`}>
                      Verify before executing →
                    </PostOutputLink>
                    <PostOutputLink href={`/flow?action=${encodeURIComponent(displayedResult)}`}>
                      Show steps →
                    </PostOutputLink>
                    <PostOutputLink href={`/guarantee?action=${encodeURIComponent(displayedResult)}`}>
                      Check safety →
                    </PostOutputLink>
                  </div>
                )}
                
                {/* STEP 6: Inline quick action commands */}
                {!isTyping && lastSubmittedInput && (
                  hasProAccess(plan) ? (
                    <InlineCommandPills
                      onSelect={handleInlineCommand}
                      lastInput={lastSubmittedInput}
                    />
                  ) : (
                    <div className="mt-6 rounded-xl border border-zinc-800/70 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-400">
                      Pro unlocks re-run shortcuts and advanced keyboard flow.
                    </div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 12: New session button (zero friction reset) */}
          {!loading && result && !isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex items-center justify-center gap-3"
            >
              <motion.button
                type="button"
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-indigo-500/50 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                New session
              </motion.button>
              
              {/* Re-run hint */}
              <span className="text-xs text-zinc-500">
                <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono">⌘↵</kbd> re-run
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

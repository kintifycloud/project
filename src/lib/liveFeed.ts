export type Severity = "low" | "medium" | "high";

export type LiveIssue = {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  timestamp: number;
  suggestion: string;
};

// Mock initial data simulating real-time system signals
export const initialMockIssues: LiveIssue[] = [
  {
    id: "issue-001",
    title: "API latency spike detected",
    description: "Response times increased 3x in last 5 minutes",
    severity: "high",
    timestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
    suggestion: "Check database connection pool and recent deployment logs",
  },
  {
    id: "issue-002",
    title: "Kubernetes pod restarting repeatedly",
    description: "auth-service-7b9c4d5f-x2k9m crashed 4 times in 10 minutes",
    severity: "high",
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    suggestion: "Inspect CrashLoopBackOff events and resource limits",
  },
  {
    id: "issue-003",
    title: "Database connections nearing limit",
    description: "Connection pool at 87% capacity",
    severity: "medium",
    timestamp: Date.now() - 1000 * 60 * 8, // 8 minutes ago
    suggestion: "Review connection leaks and consider increasing pool size",
  },
  {
    id: "issue-004",
    title: "5xx errors increasing at edge",
    description: "502/504 errors up 12% from baseline",
    severity: "medium",
    timestamp: Date.now() - 1000 * 60 * 12, // 12 minutes ago
    suggestion: "Check upstream health and load balancer configuration",
  },
  {
    id: "issue-005",
    title: "Memory usage climbing steadily",
    description: "Worker nodes averaging 78% RAM utilization",
    severity: "low",
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    suggestion: "Monitor for memory leaks or schedule vertical scaling",
  },
];

// Additional mock issues for rotation simulation
export const additionalMockIssues: Omit<LiveIssue, "id" | "timestamp">[] = [
  {
    title: "SSL certificate expiring soon",
    description: "Edge certificate expires in 7 days",
    severity: "medium",
    suggestion: "Renew TLS certificate and update cert-manager",
  },
  {
    title: "Queue depth growing",
    description: "Background job queue exceeding normal depth",
    severity: "low",
    suggestion: "Scale workers or investigate job processing delays",
  },
  {
    title: "Disk space warning",
    description: "Log partition at 82% on primary node",
    severity: "medium",
    suggestion: "Rotate logs or expand storage volume",
  },
  {
    title: "Rate limiting triggered",
    description: "API gateway throttling 15% of requests",
    severity: "high",
    suggestion: "Review rate limits or scale gateway capacity",
  },
  {
    title: "Cache hit rate dropping",
    description: "Redis cache efficiency down to 65%",
    severity: "low",
    suggestion: "Analyze cache keys and eviction patterns",
  },
];

// Generate a unique issue ID
export function generateIssueId(): string {
  return `issue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// Format timestamp to relative time
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 30) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Severity color mapping for UI
export function getSeverityColor(severity: Severity): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (severity) {
    case "high":
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/30",
        dot: "bg-red-500",
      };
    case "medium":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/30",
        dot: "bg-amber-500",
      };
    case "low":
      return {
        bg: "bg-zinc-500/10",
        text: "text-zinc-400",
        border: "border-zinc-500/30",
        dot: "bg-zinc-500",
      };
  }
}

// Severity label
export function getSeverityLabel(severity: Severity): string {
  switch (severity) {
    case "high":
      return "Critical";
    case "medium":
      return "Warning";
    case "low":
      return "Info";
  }
}

// Build URL for fix page with prefill
export function buildFixUrl(issue: LiveIssue): string {
  const issueText = `${issue.title}: ${issue.description}. ${issue.suggestion}`;
  const params = new URLSearchParams({ input: issueText });
  return `/fix?${params.toString()}`;
}

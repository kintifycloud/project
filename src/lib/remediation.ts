// Safe Auto-Remediation System for Kintify
// Phase 1: Command generation with guardrails (no real execution)

import type { IssueClassification } from "./classifier";
import type { BlastRadius } from "./normalize";

// ============================================================================
// TYPES
// ============================================================================

export type ExecutionEligibility = "safe" | "review-required" | "unsafe";

export type SafeActionType = 
  | "restart-pod"
  | "clear-cache"
  | "redeploy-previous"
  | "scale-replicas"
  | "restart-service"
  | "flush-dns"
  | "reload-config"
  | "none";

export type UnsafePattern = 
  | "delete"
  | "drop"
  | "truncate"
  | "modify-database"
  | "remove-user"
  | "revoke"
  | "terminate"
  | "wipe"
  | "destroy";

export interface RemediationCommand {
  /** The executable command or steps */
  command: string;
  /** Shell type: bash, powershell, kubectl, etc. */
  shell: "bash" | "powershell" | "kubectl" | "docker" | "sql" | "generic";
  /** Description of what this command does */
  description: string;
  /** Estimated time to complete */
  estimatedDuration: string;
  /** Whether this command requires confirmation */
  requiresConfirmation: boolean;
}

export interface RemediationSafety {
  /** Rollback instructions */
  rollback: string;
  /** Prerequisites before executing */
  prerequisites: string[];
  /** Post-execution monitoring steps */
  monitor: string[];
  /** Impact description */
  impact: string;
  /** Safety warnings */
  warnings: string[];
}

export interface RemediationAction {
  /** Unique identifier for this action */
  id: string;
  /** Human-readable action description */
  action: string;
  /** Command to execute (if applicable) */
  command?: RemediationCommand | undefined;
  /** Safety metadata */
  safety: RemediationSafety;
  /** Execution eligibility status */
  eligibility: ExecutionEligibility;
  /** Safe action category (for allowed actions) */
  safeActionType?: SafeActionType;
  /** Confidence score 0-100 */
  confidence: number;
  /** Blast radius */
  blastRadius: BlastRadius;
  /** Issue classification */
  classification: IssueClassification;
  /** Safety language included */
  safetyLanguage: {
    verifyBefore: string;
    monitorAfter: string;
  };
}

export interface ExecutionLog {
  id: string;
  actionId: string;
  timestamp: number;
  status: "suggested" | "confirmed" | "executed" | "cancelled" | "failed";
  userId?: string;
  workspaceId?: string;
  input: string;
  action: string;
  command?: string;
  result?: {
    success: boolean;
    message: string;
    output?: string;
  };
  metadata?: Record<string, unknown>;
}

// ============================================================================
// SAFE ACTION DEFINITIONS
// ============================================================================

export const SAFE_ACTION_PATTERNS: Record<SafeActionType, {
  keywords: string[];
  examples: string[];
  maxBlastRadius: BlastRadius;
}> = {
  "restart-pod": {
    keywords: ["restart", "pod", "deployment", "rollout restart", "redeploy"],
    examples: [
      "kubectl rollout restart deployment/app",
      "kubectl delete pod app-123",
    ],
    maxBlastRadius: "pod",
  },
  "clear-cache": {
    keywords: ["cache", "clear", "flush", "redis", "cdn"],
    examples: [
      "redis-cli FLUSHDB",
      "curl -X PURGE https://cdn.example.com/cache",
    ],
    maxBlastRadius: "service",
  },
  "redeploy-previous": {
    keywords: ["rollback", "undo", "previous", "revert"],
    examples: [
      "kubectl rollout undo deployment/app",
      "git revert HEAD && git push",
    ],
    maxBlastRadius: "service",
  },
  "scale-replicas": {
    keywords: ["scale", "replicas", "horizontal"],
    examples: [
      "kubectl scale deployment/app --replicas=5",
    ],
    maxBlastRadius: "service",
  },
  "restart-service": {
    keywords: ["restart", "service", "systemctl", "service restart"],
    examples: [
      "systemctl restart nginx",
      "service app restart",
    ],
    maxBlastRadius: "service",
  },
  "flush-dns": {
    keywords: ["dns", "flush", "clear", "cache"],
    examples: [
      "sudo killall -HUP mDNSResponder",
      "ipconfig /flushdns",
    ],
    maxBlastRadius: "pod",
  },
  "reload-config": {
    keywords: ["reload", "config", "configuration", "refresh"],
    examples: [
      "nginx -s reload",
      "kubectl apply -f configmap.yaml",
    ],
    maxBlastRadius: "service",
  },
  "none": {
    keywords: [],
    examples: [],
    maxBlastRadius: "unknown",
  },
};

export const UNSAFE_PATTERNS: UnsafePattern[] = [
  "delete",
  "drop",
  "truncate",
  "modify-database",
  "remove-user",
  "revoke",
  "terminate",
  "wipe",
  "destroy",
];

export const UNSAFE_KEYWORDS: string[] = [
  "delete",
  "drop",
  "truncate table",
  "delete from",
  "remove user",
  "revoke",
  "terminate instance",
  "wipe",
  "destroy",
  "format disk",
  "rm -rf",
  "dd if=",
  "fdisk",
];

// ============================================================================
// COMMAND MAPPER
// ============================================================================

/**
 * Extract commands from action text and map to structured RemediationCommand
 */
export function extractCommand(action: string, classification: IssueClassification): RemediationCommand | undefined {
  // Pattern matching for kubectl commands
  const kubectlMatch = action.match(/(kubectl\s+[\w\s-]+(?:deployment|pod|service|configmap)[\w\s-]*)/i);
  if (kubectlMatch?.[1]) {
    return {
      command: kubectlMatch[1].trim(),
      shell: "kubectl",
      description: `Kubernetes command for ${classification} remediation`,
      estimatedDuration: "30-60s",
      requiresConfirmation: true,
    };
  }

  // Pattern matching for docker commands
  const dockerMatch = action.match(/(docker\s+[\w\s-]+(?:restart|stop|start|exec|logs)[\w\s-]*)/i);
  if (dockerMatch?.[1]) {
    return {
      command: dockerMatch[1].trim(),
      shell: "docker",
      description: `Docker command for container remediation`,
      estimatedDuration: "10-30s",
      requiresConfirmation: true,
    };
  }

  // Pattern matching for system commands
  const systemctlMatch = action.match(/(systemctl\s+[\w\s-]+)/i);
  if (systemctlMatch?.[1]) {
    return {
      command: systemctlMatch[1].trim(),
      shell: "bash",
      description: `System service command`,
      estimatedDuration: "5-15s",
      requiresConfirmation: true,
    };
  }

  // Pattern matching for redis/cache commands
  const redisMatch = action.match(/(redis-cli\s+\w+)/i);
  if (redisMatch?.[1]) {
    return {
      command: redisMatch[1].trim(),
      shell: "bash",
      description: `Redis cache operation`,
      estimatedDuration: "1-5s",
      requiresConfirmation: true,
    };
  }

  // Generic command patterns
  const genericMatch = action.match(/\b(curl\s+[\w\s-]+)/i);
  if (genericMatch?.[1]) {
    return {
      command: genericMatch[1].trim(),
      shell: "bash",
      description: `HTTP/API operation`,
      estimatedDuration: "5-10s",
      requiresConfirmation: false,
    };
  }

  return undefined;
}

/**
 * Build a command from action text when no explicit command is found
 */
export function buildCommandFromAction(action: string, classification: IssueClassification): RemediationCommand | undefined {
  // Generate contextual commands based on classification
  const lowerAction = action.toLowerCase();

  if (classification === "kubernetes" || lowerAction.includes("pod") || lowerAction.includes("deployment")) {
    if (lowerAction.includes("restart") || lowerAction.includes("rollout")) {
      return {
        command: "kubectl rollout restart deployment/<deployment-name>",
        shell: "kubectl",
        description: "Restart the deployment to trigger pod recreation",
        estimatedDuration: "30-60s",
        requiresConfirmation: true,
      };
    }
    if (lowerAction.includes("scale")) {
      return {
        command: "kubectl scale deployment/<deployment-name> --replicas=<count>",
        shell: "kubectl",
        description: "Scale deployment to specified replica count",
        estimatedDuration: "15-30s",
        requiresConfirmation: true,
      };
    }
  }

  if (classification === "api" && (lowerAction.includes("cache") || lowerAction.includes("redis"))) {
    return {
      command: "redis-cli FLUSHDB",
      shell: "bash",
      description: "Clear Redis database cache",
      estimatedDuration: "1-5s",
      requiresConfirmation: true,
    };
  }

  if (classification === "infra" && lowerAction.includes("dns")) {
    return {
      command: "dig +short <hostname> @8.8.8.8",
      shell: "bash",
      description: "Test DNS resolution from external resolver",
      estimatedDuration: "2-5s",
      requiresConfirmation: false,
    };
  }

  return undefined;
}

// ============================================================================
// SAFETY VALIDATOR
// ============================================================================

/**
 * Check if action contains unsafe patterns
 */
export function containsUnsafePatterns(action: string): boolean {
  const lowerAction = action.toLowerCase();
  return UNSAFE_KEYWORDS.some(keyword => lowerAction.includes(keyword.toLowerCase()));
}

/**
 * Determine if an action is safe to execute automatically
 */
export function determineEligibility(
  action: string,
  blastRadius: BlastRadius,
  hasCommand: boolean
): ExecutionEligibility {
  // Always require review if unsafe patterns detected
  if (containsUnsafePatterns(action)) {
    return "unsafe";
  }

  // If no command can be extracted, it's not executable
  if (!hasCommand) {
    return "review-required";
  }

  // Check against safe action patterns
  const lowerAction = action.toLowerCase();
  for (const [type, config] of Object.entries(SAFE_ACTION_PATTERNS)) {
    if (type === "none") continue;
    
    const matchesKeyword = config.keywords.some(kw => lowerAction.includes(kw.toLowerCase()));
    const withinBlastRadius = ["pod", "unknown"].includes(config.maxBlastRadius) || 
                              (blastRadius !== "infra");
    
    if (matchesKeyword && withinBlastRadius) {
      return "safe";
    }
  }

  // Default to requiring review
  return "review-required";
}

/**
 * Categorize action into safe action type
 */
export function categorizeSafeAction(action: string): SafeActionType {
  const lowerAction = action.toLowerCase();
  
  for (const [type, config] of Object.entries(SAFE_ACTION_PATTERNS)) {
    if (type === "none") continue;
    if (config.keywords.some(kw => lowerAction.includes(kw.toLowerCase()))) {
      return type as SafeActionType;
    }
  }
  
  return "none";
}

/**
 * Build safety metadata for an action
 */
export function buildSafetyMetadata(
  action: string,
  classification: IssueClassification,
  blastRadius: BlastRadius
): RemediationSafety {
  const warnings: string[] = [];
  const prerequisites: string[] = [];
  const monitor: string[] = [];

  // Base safety messaging
  warnings.push("⚠️ Verify before executing — review the command carefully");
  warnings.push("⚠️ Monitor after change — watch for unexpected behavior");

  // Classification-specific safety
  if (classification === "kubernetes") {
    prerequisites.push("Ensure kubectl is configured with the correct context");
    prerequisites.push("Verify you have permissions to modify the target resource");
    monitor.push("Watch pod status: kubectl get pods -w");
    monitor.push("Check deployment rollout: kubectl rollout status deployment/<name>");
  }

  if (classification === "api") {
    prerequisites.push("Confirm the service is in maintenance mode if required");
    monitor.push("Monitor error rates and latency metrics");
    monitor.push("Verify endpoint health after changes");
  }

  if (classification === "infra") {
    prerequisites.push("Verify infrastructure change window");
    prerequisites.push("Ensure backup/recovery procedures are ready");
    monitor.push("Monitor DNS propagation if applicable");
    monitor.push("Check SSL/TLS certificate validity");
  }

  // Blast radius specific
  if (blastRadius === "service") {
    warnings.push("This affects the entire service — ensure load balancer can handle temporary disruption");
  }
  if (blastRadius === "infra") {
    warnings.push("⚠️ Infrastructure-level changes can affect multiple services");
  }

  // Rollback guidance
  let rollback = "Before executing, ensure rollback is available: ";
  if (classification === "kubernetes") {
    rollback += "kubectl rollout undo deployment/<name>";
  } else if (classification === "api") {
    rollback += "Revert the configuration change and restart the service";
  } else {
    rollback += "Document current state and have a restoration plan ready";
  }

  return {
    rollback,
    prerequisites,
    monitor,
    impact: `Impact: ${blastRadius}-level changes. ${warnings[0]}`,
    warnings,
  };
}

// ============================================================================
// EXECUTION LOGGING
// ============================================================================

const REMEDIATION_LOG_KEY = "kintify_remediation_log";
const MAX_LOG_ENTRIES = 100;

export function logRemediationAction(log: Omit<ExecutionLog, "id" | "timestamp">): ExecutionLog {
  const entry: ExecutionLog = {
    ...log,
    id: generateLogId(),
    timestamp: Date.now(),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = readRemediationLogs();
      const updated = [entry, ...existing].slice(0, MAX_LOG_ENTRIES);
      window.localStorage.setItem(REMEDIATION_LOG_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  }

  return entry;
}

export function readRemediationLogs(): ExecutionLog[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(REMEDIATION_LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExecutionLog[];
  } catch {
    return [];
  }
}

export function clearRemediationLogs(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(REMEDIATION_LOG_KEY);
    } catch {
      // Ignore
    }
  }
}

function generateLogId(): string {
  return `rem-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ============================================================================
// SLACK-STYLE COMMAND PARSING
// ============================================================================

/**
 * Parse Slack-style /fix commands
 * Format: /fix [action] [context]
 * Example: /fix restart pod in deployment/app
 */
export interface ParsedSlackCommand {
  action: string;
  context?: string;
  isSlackStyle: boolean;
}

export function parseSlackCommand(input: string): ParsedSlackCommand {
  const trimmed = input.trim();
  
  // Check if it's a slack-style command
  if (!trimmed.startsWith("/")) {
    return { action: trimmed, isSlackStyle: false };
  }

  // Remove leading slash and parse
  const withoutSlash = trimmed.slice(1).trim();
  const parts = withoutSlash.split(/\s+/);
  
  if (parts.length < 2) {
    return { action: withoutSlash, isSlackStyle: true };
  }

  // Map common slack commands
  const commandMap: Record<string, string> = {
    "restart": "restart",
    "rollback": "rollback",
    "scale": "scale",
    "flush": "clear-cache",
    "clear": "clear-cache",
    "check": "inspect",
    "inspect": "inspect",
    "verify": "verify",
  };

  const firstPart = parts[0];
  if (!firstPart) {
    return { action: withoutSlash, isSlackStyle: true };
  }

  const action = commandMap[firstPart.toLowerCase()] || firstPart;
  const context = parts.slice(1).join(" ");

  return {
    action,
    context,
    isSlackStyle: true,
  };
}

/**
 * Enhance input with slack command context
 */
export function enhanceSlackInput(parsed: ParsedSlackCommand, originalInput: string): string {
  if (!parsed.isSlackStyle) return originalInput;

  // Map to richer context
  const contextEnhancers: Record<string, string> = {
    "restart": `Restart operation requested for: ${parsed.context}. Provide specific commands with rollback safety.`,
    "rollback": `Rollback requested for: ${parsed.context}. Include verification steps and safety checks.`,
    "scale": `Scaling operation for: ${parsed.context}. Provide replica count recommendations with safety guardrails.`,
    "clear-cache": `Cache clear requested for: ${parsed.context}. Include pre-checks and verification steps.`,
    "inspect": `Inspection request for: ${parsed.context}. Provide diagnostic commands with safety language.`,
  };

  return contextEnhancers[parsed.action] || originalInput;
}

// ============================================================================
// BUILD REMEDIATION ACTION
// ============================================================================

export interface BuildRemediationInput {
  action: string;
  confidence: string;
  blastRadius: BlastRadius;
  safety: string;
  classification: IssueClassification;
  originalInput: string;
}

export function buildRemediationAction(input: BuildRemediationInput): RemediationAction {
  const id = `action-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  
  // Try to extract command
  const extractedCommand = extractCommand(input.action, input.classification);
  const generatedCommand = !extractedCommand 
    ? buildCommandFromAction(input.action, input.classification)
    : undefined;
  const command = extractedCommand || generatedCommand;

  // Determine eligibility
  const eligibility = determineEligibility(input.action, input.blastRadius, !!command);
  const safeActionType = categorizeSafeAction(input.action);

  // Build safety metadata
  const safetyMetadata = buildSafetyMetadata(input.action, input.classification, input.blastRadius);
  
  // Combine original safety with generated safety
  const combinedSafety: RemediationSafety = {
    ...safetyMetadata,
    rollback: input.safety || safetyMetadata.rollback,
  };

  return {
    id,
    action: input.action,
    command,
    safety: combinedSafety,
    eligibility,
    ...(safeActionType !== "none" ? { safeActionType } : {}),
    confidence: parseInt(input.confidence, 10) || 75,
    blastRadius: input.blastRadius,
    classification: input.classification,
    safetyLanguage: {
      verifyBefore: "⚠️ Verify before executing — ensure you understand the impact",
      monitorAfter: "⚠️ Monitor after change — watch metrics and logs for unexpected behavior",
    },
  };
}

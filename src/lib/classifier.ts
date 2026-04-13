export type IssueClassification = "api" | "kubernetes" | "docker" | "infra" | "unknown";

export type ClassificationResult = {
  type: IssueClassification;
  reason: string;
  isVague: boolean;
};

const CLASSIFIER_RULES: Array<{ type: IssueClassification; reason: string; pattern: RegExp }> = [
  {
    type: "kubernetes",
    reason: "Detected Kubernetes runtime or workload signals",
    pattern: /(kubernetes|kubectl|\bpod\b|deployment|daemonset|statefulset|namespace|crashloopbackoff|oomkilled|ingress|configmap|secret|helm|k8s)/i,
  },
  {
    type: "docker",
    reason: "Detected container runtime or image signals",
    pattern: /(docker|dockerfile|docker-compose|container exited|container restart|image pull|entrypoint|compose)/i,
  },
  {
    type: "api",
    reason: "Detected API, gateway, latency, or request path signals",
    pattern: /(api|endpoint|request|response|latency|timeout|p95|p99|gateway|502|503|504|bad gateway|upstream|route traffic)/i,
  },
  {
    type: "infra",
    reason: "Detected infrastructure, platform, or network signals",
    pattern: /(terraform|dns|ssl|tls|certificate|network|load balancer|alb|elb|cloudwatch|aws|gcp|azure|vm|node|host|infra|database|postgres|mysql|redis)/i,
  },
];

const VAGUE_TERMS = new Set(["help", "fix", "issue", "error", "broken", "problem", "urgent"]);

export function isWeakFixInput(input: string): boolean {
  const trimmed = input.trim();

  if (!trimmed) {
    return true;
  }

  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  if (VAGUE_TERMS.has(normalized)) {
    return true;
  }

  if (trimmed.length < 16 && !/[\r\n:/\\.-]/.test(trimmed)) {
    return true;
  }

  const tokenCount = normalized.split(" ").filter(Boolean).length;
  return tokenCount < 3;
}

export async function classifyIssue(input: string): Promise<ClassificationResult> {
  if (isWeakFixInput(input)) {
    return {
      type: "unknown",
      reason: "Input is too weak for incident classification",
      isVague: true,
    };
  }

  for (const rule of CLASSIFIER_RULES) {
    if (rule.pattern.test(input)) {
      return {
        type: rule.type,
        reason: rule.reason,
        isVague: false,
      };
    }
  }

  return {
    type: "unknown",
    reason: "No decisive incident signature detected",
    isVague: false,
  };
}

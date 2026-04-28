export type BlastRadius = "service" | "pod" | "infra" | "unknown";

export type FixDecision = {
  action: string;
  confidence: string;
  blastRadius: BlastRadius;
  safety: string;
};

export const VAGUE_INPUT_DECISION: FixDecision = {
  action: "Add specific error messages, logs, or context about what changed so the issue can be diagnosed accurately",
  confidence: "72",
  blastRadius: "unknown",
  safety: "Avoid making changes until the failure pattern is clear",
};

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripFormatting(value: string): string {
  return collapseWhitespace(
    value
      .replace(/```(?:json)?/gi, " ")
      .replace(/```/g, " ")
      .replace(/^[`"']+|[`"']+$/g, "")
      .replace(/^[-*]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/\r/g, " ")
      .replace(/\u0000/g, " "),
  );
}

function normalizeTextField(value: unknown): string {
  if (typeof value !== "string") {
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    return "";
  }

  return stripFormatting(value);
}

function parseJsonCandidate(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    const fenced = trimmed.match(/\{[\s\S]*\}/);

    if (!fenced) {
      return null;
    }

    try {
      const parsed = JSON.parse(fenced[0]) as unknown;
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
}

function extractLabeledValue(source: string, label: string): string {
  const match = source.match(new RegExp(`(?:^|\\n)${label}\\s*:\\s*(.+?)(?=\\n[A-Za-z][A-Za-z ]*:\\s|$)`, "i"));
  return match?.[1] ? stripFormatting(match[1]) : "";
}

function normalizeConfidenceValue(value: unknown): string {
  const text = normalizeTextField(value);
  const match = text.match(/\d{2,3}/);

  if (!match) {
    return "";
  }

  const numeric = Number(match[0]);

  if (!Number.isFinite(numeric)) {
    return "";
  }

  return String(Math.min(Math.max(Math.round(numeric), 0), 95));
}

function normalizeBlastRadiusValue(value: unknown): BlastRadius {
  const text = normalizeTextField(value).toLowerCase();

  if (!text) {
    return "unknown";
  }

  if (/(^|\b)(pod|container|node pool|daemonset|statefulset|deployment rollout|crashloop|oomkilled)(\b|$)/.test(text)) {
    return "pod";
  }

  if (/(^|\b)(service|api|endpoint|gateway|ingress|load balancer target|application)(\b|$)/.test(text)) {
    return "service";
  }

  if (/(^|\b)(infra|infrastructure|network|dns|database cluster|region|host|node|vpc|lb|load balancer|certificate|tls)(\b|$)/.test(text)) {
    return "infra";
  }

  if (/(^|\b)(unknown|unclear)(\b|$)/.test(text)) {
    return "unknown";
  }

  return "unknown";
}

function fromObject(record: Record<string, unknown>): FixDecision {
  const action = normalizeTextField(record.action ?? record.Action ?? record.nextAction);
  const confidence = normalizeConfidenceValue(record.confidence ?? record.Confidence);
  const blastRadius = normalizeBlastRadiusValue(
    record.blastRadius ?? record["blast_radius"] ?? record["blast-radius"] ?? record.BlastRadius ?? record["Blast Radius"],
  );
  const safety = normalizeTextField(record.safety ?? record.Safety ?? record.rollback);

  return {
    action,
    confidence,
    blastRadius,
    safety,
  };
}

function fromLabeledText(raw: string): FixDecision {
  const cleaned = stripFormatting(raw).replace(/\s+(Action|Confidence|Blast Radius|Safety):/gi, "\n$1:");

  return {
    action: extractLabeledValue(cleaned, "Action"),
    confidence: normalizeConfidenceValue(extractLabeledValue(cleaned, "Confidence")),
    blastRadius: normalizeBlastRadiusValue(extractLabeledValue(cleaned, "Blast Radius")),
    safety: extractLabeledValue(cleaned, "Safety"),
  };
}

// NEW: Parse plain text format (max 3 lines starting with "Likely")
function fromPlainText(raw: string): FixDecision {
  const cleaned = stripFormatting(raw);
  const lines = cleaned.split('\n').filter(line => line.trim().length > 0);
  
  // Extract action (the full plain text output)
  const action = lines.slice(0, 3).join(' ').trim();
  
  // Infer confidence from quality (starts with "Likely" = higher confidence)
  const confidence = action.toLowerCase().startsWith('likely') ? '85' : '70';
  
  // Infer blast radius from keywords
  const blastRadius = normalizeBlastRadiusValue(action);
  
  // Infer safety from content (mention of rollback, verify, check = safer)
  const safety = action.toLowerCase().includes('rollback') || 
                 action.toLowerCase().includes('verify') ||
                 action.toLowerCase().includes('before') 
                 ? 'Preserve current state before changes' 
                 : 'Document current state before action';

  return {
    action,
    confidence,
    blastRadius,
    safety,
  };
}

export function normalizeDecision(raw: unknown): FixDecision {
  // Handle plain text format (new format)
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    
    // Check if it's plain text (not JSON, starts with "Likely")
    if (!trimmed.startsWith('{') && trimmed.toLowerCase().startsWith('likely')) {
      return fromPlainText(trimmed);
    }
    
    // Try JSON parsing for backward compatibility
    const parsed = parseJsonCandidate(trimmed);
    if (parsed) {
      return fromObject(parsed);
    }
    
    // Fall back to labeled text
    return fromLabeledText(trimmed);
  }

  if (raw && typeof raw === "object") {
    return fromObject(raw as Record<string, unknown>);
  }

  throw new Error("Model output is not readable");
}

export function toStrictDecision(decision: FixDecision): FixDecision {
  return {
    action: normalizeTextField(decision.action),
    confidence: normalizeConfidenceValue(decision.confidence),
    blastRadius: normalizeBlastRadiusValue(decision.blastRadius),
    safety: normalizeTextField(decision.safety),
  };
}

export function serializeDecision(decision: FixDecision): string {
  const normalized = toStrictDecision(decision);

  return JSON.stringify({
    action: normalized.action,
    confidence: normalized.confidence,
    blastRadius: normalized.blastRadius,
    safety: normalized.safety,
  });
}

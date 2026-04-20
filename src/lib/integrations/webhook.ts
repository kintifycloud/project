/**
 * Webhook Integration - Log ingestion and auto-trigger system
 */

import { createHmac, timingSafeEqual } from "crypto";
import type { WebhookIntegration, LogPayload } from "./types";

/**
 * Verify webhook signature using HMAC-SHA256
 */
export function verifyWebhookSignature(
  secret: string,
  payload: string,
  signature: string
): boolean {
  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Parse webhook payload based on source
 */
export function parseWebhookPayload(
  source: string,
  body: Record<string, unknown>
): LogPayload | null {
  switch (source.toLowerCase()) {
    case "datadog":
      return parseDatadogPayload(body);
    case "cloudflare":
      return parseCloudflarePayload(body);
    case "generic":
    default:
      return parseGenericPayload(body);
  }
}

/**
 * Parse Datadog webhook payload
 */
function parseDatadogPayload(body: Record<string, unknown>): LogPayload | null {
  // Datadog alert webhook format
  const alertType = body.alert_type as string | undefined;
  const title = body.title as string | undefined;
  const message = body.message as string | undefined;
  const eventData = body.event_data as Record<string, unknown> | undefined;

  if (!title && !message) {
    return null;
  }

  const severity = mapDatadogSeverity(alertType);
  const issueText = buildIssueFromDatadog(title, message, eventData);

  return {
    source: "datadog",
    event: "alert",
    timestamp: new Date().toISOString(),
    severity,
    data: {
      message: issueText,
      service: body.service as string | undefined,
      environment: body.env as string | undefined,
      errorCount: body.error_count as number | undefined,
      latencyP95: body.latency_p95 as number | undefined,
      tags: body.tags as string[] | undefined,
      timestamp: undefined,
      metadata: {
        alertId: body.id,
        link: body.link,
        priority: body.priority,
      },
    },
  };
}

/**
 * Parse Cloudflare log payload
 */
function parseCloudflarePayload(body: Record<string, unknown>): LogPayload | null {
  // Cloudflare Logpush or alert format
  const logs = body.logs as Array<Record<string, unknown>> | undefined;
  const alert = body.alert as Record<string, unknown> | undefined;

  let issueText = "";
  let severity: LogPayload["severity"] = "warning";

  if (alert) {
    issueText = `Cloudflare Alert: ${alert.name || "Unknown"} - ${alert.description || ""}`;
    severity = alert.severity === "critical" ? "critical" : "warning";
  } else if (logs && logs.length > 0) {
    const errorLogs = logs.filter((log) => log.status && (log.status as number) >= 500);
    if (errorLogs.length > 0) {
      issueText = `Cloudflare 5xx errors detected: ${errorLogs.length} errors`;
      severity = errorLogs.length > 10 ? "critical" : "warning";
    } else {
      return null;
    }
  } else {
    return null;
  }

  return {
    source: "cloudflare",
    event: "alert",
    timestamp: new Date().toISOString(),
    severity,
    data: {
      message: issueText,
      service: body.zone_name as string | undefined,
      environment: undefined,
      errorCount: logs?.filter((l) => (l.status as number) >= 500).length,
      latencyP95: undefined,
      tags: body.tags as string[] | undefined,
      timestamp: undefined,
      metadata: {
        zoneId: body.zone_id,
        rayId: body.ray_id,
      },
    },
  };
}

/**
 * Parse generic JSON log payload
 */
function parseGenericPayload(body: Record<string, unknown>): LogPayload | null {
  const message = (body.message as string) || (body.error as string) || (body.alert as string);

  if (!message) {
    return null;
  }

  const severity = (body.severity as LogPayload["severity"]) || "warning";
  const errorCount = body.error_count as number | undefined;
  const latencyP95 = body.latency_p95 as number | undefined;

  return {
    source: "generic",
    event: body.event === "error" || body.event === "alert" ? body.event : "log",
    timestamp: (body.timestamp as string) || new Date().toISOString(),
    severity,
    data: {
      message,
      service: body.service as string | undefined,
      environment: body.environment as string | undefined,
      errorCount,
      latencyP95,
      tags: body.tags as string[] | undefined,
      timestamp: (body.timestamp as string) || undefined,
      metadata: body.metadata as Record<string, unknown> | undefined,
    },
  };
}

/**
 * Map Datadog alert type to severity
 */
function mapDatadogSeverity(alertType?: string): LogPayload["severity"] {
  switch (alertType?.toLowerCase()) {
    case "error":
    case "critical":
      return "critical";
    case "warning":
      return "warning";
    case "success":
      return "info";
    default:
      return "warning";
  }
}

/**
 * Build readable issue text from Datadog alert
 */
function buildIssueFromDatadog(
  title?: string,
  message?: string,
  eventData?: Record<string, unknown>
): string {
  const parts: string[] = [];

  if (title) {
    parts.push(title);
  }

  if (message) {
    parts.push(message.slice(0, 200));
  }

  if (eventData?.query) {
    parts.push(`Query: ${eventData.query}`);
  }

  return parts.join(" - ");
}

/**
 * Check if webhook should auto-trigger based on thresholds
 */
export function shouldAutoTrigger(
  integration: WebhookIntegration,
  payload: LogPayload
): { shouldTrigger: boolean; reason: string } {
  const thresholds = integration.settings.alertThresholds;

  // Critical severity always triggers
  if (payload.severity === "critical") {
    return { shouldTrigger: true, reason: "Critical severity detected" };
  }

  // Error rate threshold
  if (thresholds.errorRate && payload.data.errorCount !== undefined) {
    if (payload.data.errorCount >= thresholds.errorRate) {
      return {
        shouldTrigger: true,
        reason: `Error rate ${payload.data.errorCount} >= threshold ${thresholds.errorRate}`,
      };
    }
  }

  // Latency threshold
  if (thresholds.latencyMs && payload.data.latencyP95 !== undefined) {
    if (payload.data.latencyP95 >= thresholds.latencyMs) {
      return {
        shouldTrigger: true,
        reason: `Latency ${payload.data.latencyP95}ms >= threshold ${thresholds.latencyMs}ms`,
      };
    }
  }

  // Error events trigger
  if (payload.event === "error" && payload.severity === "error") {
    return { shouldTrigger: true, reason: "Error event detected" };
  }

  return { shouldTrigger: false, reason: "Below thresholds" };
}

/**
 * Build fix input from webhook payload
 */
export function buildFixInputFromPayload(payload: LogPayload): string {
  const parts: string[] = [payload.data.message];

  if (payload.data.service) {
    parts.push(`[Service: ${payload.data.service}]`);
  }

  if (payload.data.environment) {
    parts.push(`[Env: ${payload.data.environment}]`);
  }

  if (payload.data.errorCount) {
    parts.push(`[Errors: ${payload.data.errorCount}]`);
  }

  if (payload.data.latencyP95) {
    parts.push(`[Latency P95: ${payload.data.latencyP95}ms]`);
  }

  return parts.join(" ");
}

/**
 * Validate webhook integration configuration
 */
export function validateWebhookConfig(integration: WebhookIntegration): { valid: boolean; error?: string } {
  if (!integration.settings.webhookUrl) {
    return { valid: false, error: "Missing webhook URL" };
  }

  try {
    new URL(integration.settings.webhookUrl);
  } catch {
    return { valid: false, error: "Invalid webhook URL" };
  }

  if (!integration.settings.secret || integration.settings.secret.length < 32) {
    return { valid: false, error: "Secret must be at least 32 characters" };
  }

  return { valid: true };
}


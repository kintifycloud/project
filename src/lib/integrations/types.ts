/**
 * Integration Types - Core type definitions for all integrations
 */

export type IntegrationType = "slack" | "github" | "webhook" | "datadog" | "cloudflare" | "pagerduty";

export type IntegrationStatus = "connected" | "disconnected" | "error" | "pending";

export interface BaseIntegration {
  id: string;
  type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  teamId: string | null;
  organizationId: string | null;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  settings: Record<string, unknown>;
}

// Slack Integration
export interface SlackIntegration extends BaseIntegration {
  type: "slack";
  settings: {
    botToken: string;
    signingSecret: string;
    defaultChannel?: string;
    autoPushEnabled: boolean;
    slashCommandEnabled: boolean;
  };
}

// Webhook Integration
export interface WebhookIntegration extends BaseIntegration {
  type: "webhook";
  settings: {
    webhookUrl: string;
    secret: string;
    autoTriggerEnabled: boolean;
    alertThresholds: {
      errorRate?: number;
      latencyMs?: number;
    };
  };
}

// GitHub Integration
export interface GitHubIntegration extends BaseIntegration {
  type: "github";
  settings: {
    appId: string;
    privateKey: string;
    installationId?: string;
    commentOnPR: boolean;
    suggestFixes: boolean;
  };
}

// Datadog Integration
export interface DatadogIntegration extends BaseIntegration {
  type: "datadog";
  settings: {
    apiKey: string;
    appKey: string;
    webhookEndpoint?: string;
    monitors: string[];
  };
}

// Cloudflare Integration
export interface CloudflareIntegration extends BaseIntegration {
  type: "cloudflare";
  settings: {
    apiToken: string;
    zoneId?: string;
    logPushEnabled: boolean;
  };
}

export type Integration = SlackIntegration | WebhookIntegration | GitHubIntegration | DatadogIntegration | CloudflareIntegration;

// Webhook Payload Types
export interface WebhookPayload {
  source: string;
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
  severity: "info" | "warning" | "error" | "critical" | undefined;
}

export interface LogPayload extends WebhookPayload {
  source: "datadog" | "cloudflare" | "generic";
  event: "log" | "alert" | "error";
  data: {
    message: string;
    service: string | undefined;
    environment: string | undefined;
    errorCount: number | undefined;
    latencyP95: number | undefined;
    timestamp: string | undefined;
    tags: string[] | undefined;
    metadata: Record<string, unknown> | undefined;
  };
}

export interface SlackSlashCommandPayload {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
}

export interface SlackInteractionPayload {
  type: "block_actions" | "view_submission" | "shortcut";
  user: {
    id: string;
    username: string;
  };
  channel?: {
    id: string;
    name: string;
  };
  actions?: Array<{
    action_id: string;
    block_id: string;
    value: string;
  }>;
  view?: {
    id: string;
    callback_id: string;
    state: Record<string, unknown>;
  };
  response_url?: string;
}

export interface FixResult {
  answer: string;
  trace: string;
  classification?: string;
  provider?: string;
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  type: "trigger" | "response" | "error" | "push";
  payload: Record<string, unknown>;
  result: FixResult | undefined;
  error: string | undefined;
  createdAt: number;
}

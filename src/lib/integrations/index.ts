/**
 * Integrations System - Main exports
 * 
 * Modular system for connecting Kintify to real dev workflows.
 * Start with: Slack + Webhooks
 */

// Types
export * from "./types";
export type {
  Integration,
  IntegrationType,
  IntegrationStatus,
  IntegrationEvent,
  SlackIntegration,
  WebhookIntegration,
  GitHubIntegration,
  DatadogIntegration,
  CloudflareIntegration,
  SlackSlashCommandPayload,
  SlackInteractionPayload,
  LogPayload,
  WebhookPayload,
  FixResult,
} from "./types";

// Integration modules
export * from "./slack";
export * from "./webhook";
export * from "./github";

// Core integration utilities (db operations)
export {
  getIntegration,
  getIntegrationByTeam,
  listIntegrations,
  createIntegration,
  updateIntegrationStatus,
  deleteIntegration,
  recordIntegrationEvent,
  getIntegrationEvents,
  generateSecureToken,
  hashToken,
} from "./core";

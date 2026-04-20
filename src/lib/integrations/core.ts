/**
 * Core Integration Utilities
 * Database operations and shared integration logic
 */

import { supabaseAdmin } from "../supabase-admin";
import type {
  Integration,
  IntegrationType,
  IntegrationEvent,
  SlackIntegration,
  WebhookIntegration,
  GitHubIntegration,
} from "./types";

type IntegrationRow = {
  id: string;
  type: IntegrationType;
  name: string;
  status: "connected" | "disconnected" | "error" | "pending";
  team_id: string | null;
  organization_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  settings: Record<string, unknown>;
};

type IntegrationEventRow = {
  id: string;
  integration_id: string;
  type: "trigger" | "response" | "error" | "push";
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
};

function mapIntegrationRow(row: IntegrationRow): Integration {
  const base = {
    id: row.id,
    type: row.type,
    name: row.name,
    status: row.status,
    teamId: row.team_id,
    organizationId: row.organization_id,
    createdBy: row.created_by,
    createdAt: Date.parse(row.created_at),
    updatedAt: Date.parse(row.updated_at),
    settings: row.settings,
  };

  switch (row.type) {
    case "slack":
      return {
        ...base,
        type: "slack",
        settings: {
          botToken: (row.settings.botToken as string) || "",
          signingSecret: (row.settings.signingSecret as string) || "",
          defaultChannel: row.settings.defaultChannel as string | undefined,
          autoPushEnabled: (row.settings.autoPushEnabled as boolean) || false,
          slashCommandEnabled: (row.settings.slashCommandEnabled as boolean) || false,
        },
      } as SlackIntegration;
    case "webhook":
      return {
        ...base,
        type: "webhook",
        settings: {
          webhookUrl: (row.settings.webhookUrl as string) || "",
          secret: (row.settings.secret as string) || "",
          autoTriggerEnabled: (row.settings.autoTriggerEnabled as boolean) || false,
          alertThresholds: (row.settings.alertThresholds as { errorRate?: number; latencyMs?: number }) || {},
        },
      } as WebhookIntegration;
    case "github":
      return {
        ...base,
        type: "github",
        settings: {
          appId: (row.settings.appId as string) || "",
          privateKey: (row.settings.privateKey as string) || "",
          installationId: row.settings.installationId as string | undefined,
          commentOnPR: (row.settings.commentOnPR as boolean) || false,
          suggestFixes: (row.settings.suggestFixes as boolean) || false,
        },
      } as GitHubIntegration;
    default:
      return base as Integration;
  }
}

function mapEventRow(row: IntegrationEventRow): IntegrationEvent {
  return {
    id: row.id,
    integrationId: row.integration_id,
    type: row.type,
    payload: row.payload,
    result: (row.result as unknown as IntegrationEvent["result"]),
    error: row.error || undefined,
    createdAt: Date.parse(row.created_at),
  };
}

/**
 * Get integration by ID
 */
export async function getIntegration(integrationId: string): Promise<Integration | null> {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured");
  }

  const { data, error } = await supabaseAdmin
    .from("integrations")
    .select("id, type, name, status, team_id, organization_id, created_by, created_at, updated_at, settings")
    .eq("id", integrationId)
    .maybeSingle<IntegrationRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapIntegrationRow(data) : null;
}

/**
 * Get integration by team and type
 */
export async function getIntegrationByTeam(
  teamId: string | null,
  type: IntegrationType
): Promise<Integration | null> {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured");
  }

  const query = supabaseAdmin
    .from("integrations")
    .select("id, type, name, status, team_id, organization_id, created_by, created_at, updated_at, settings")
    .eq("type", type)
    .eq("status", "connected");

  const { data, error } = teamId
    ? await query.eq("team_id", teamId)
    : await query.is("team_id", null);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as IntegrationRow[];
  const row = rows[0];
  return row ? mapIntegrationRow(row) : null;
}

/**
 * List all integrations for a team/user
 */
export async function listIntegrations(
  teamId: string | null,
  organizationId?: string | null
): Promise<Integration[]> {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured");
  }

  let query = supabaseAdmin
    .from("integrations")
    .select("id, type, name, status, team_id, organization_id, created_by, created_at, updated_at, settings");

  if (teamId) {
    query = query.eq("team_id", teamId);
  } else {
    query = query.is("team_id", null);
  }

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as IntegrationRow[]).map(mapIntegrationRow);
}

/**
 * Create a new integration
 */
export async function createIntegration(
  userId: string,
  teamId: string | null,
  organizationId: string | null,
  type: IntegrationType,
  name: string,
  settings: Record<string, unknown>
): Promise<Integration> {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured");
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Mask sensitive values before storing
  const maskedSettings = maskSensitiveSettings(type, settings);

  const { data, error } = await supabaseAdmin
    .from("integrations")
    .insert({
      id,
      type,
      name,
      status: "pending",
      team_id: teamId,
      organization_id: organizationId,
      created_by: userId,
      created_at: now,
      updated_at: now,
      settings: maskedSettings,
    })
    .select("id, type, name, status, team_id, organization_id, created_by, created_at, updated_at, settings")
    .single<IntegrationRow>();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create integration");
  }

  return mapIntegrationRow(data);
}

/**
 * Update integration status
 */
export async function updateIntegrationStatus(
  integrationId: string,
  status: Integration["status"],
  settings?: Record<string, unknown>
): Promise<Integration> {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured");
  }

  const existing = await getIntegration(integrationId);
  if (!existing) {
    throw new Error("Integration not found");
  }

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (settings) {
    const maskedSettings = maskSensitiveSettings(existing.type, settings);
    update.settings = maskedSettings;
  }

  const { data, error } = await supabaseAdmin
    .from("integrations")
    .update(update)
    .eq("id", integrationId)
    .select("id, type, name, status, team_id, organization_id, created_by, created_at, updated_at, settings")
    .single<IntegrationRow>();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update integration");
  }

  return mapIntegrationRow(data);
}

/**
 * Delete integration
 */
export async function deleteIntegration(integrationId: string): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured");
  }

  const { error } = await supabaseAdmin.from("integrations").delete().eq("id", integrationId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Record integration event
 */
export async function recordIntegrationEvent(
  integrationId: string,
  type: IntegrationEvent["type"],
  payload: Record<string, unknown>,
  result?: Record<string, unknown>,
  error?: string
): Promise<IntegrationEvent> {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured");
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const update: Record<string, unknown> = {
    id,
    integration_id: integrationId,
    type,
    payload,
    created_at: now,
  };

  if (result !== undefined) {
    update.result = result;
  }
  if (error !== undefined) {
    update.error = error;
  }

  const { data, error: dbError } = await supabaseAdmin
    .from("integration_events")
    .insert(update)
    .select("id, integration_id, type, payload, result, error, created_at")
    .single<IntegrationEventRow>();

  if (dbError || !data) {
    throw new Error(dbError?.message ?? "Failed to record event");
  }

  return mapEventRow(data);
}

/**
 * Get recent events for an integration
 */
export async function getIntegrationEvents(
  integrationId: string,
  limit = 50
): Promise<IntegrationEvent[]> {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured");
  }

  const { data, error } = await supabaseAdmin
    .from("integration_events")
    .select("id, integration_id, type, payload, result, error, created_at")
    .eq("integration_id", integrationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as IntegrationEventRow[]).map(mapEventRow);
}

/**
 * Mask sensitive settings before storage
 */
function maskSensitiveSettings(
  type: IntegrationType,
  settings: Record<string, unknown>
): Record<string, unknown> {
  const masked = { ...settings };

  switch (type) {
    case "slack":
      if (typeof masked.botToken === "string" && masked.botToken.length > 8) {
        masked.botToken = `${masked.botToken.slice(0, 4)}...${masked.botToken.slice(-4)}`;
      }
      if (typeof masked.signingSecret === "string" && masked.signingSecret.length > 8) {
        masked.signingSecret = "***";
      }
      break;
    case "webhook":
      if (typeof masked.secret === "string" && masked.secret.length > 8) {
        masked.secret = "***";
      }
      break;
    case "github":
      if (typeof masked.privateKey === "string") {
        masked.privateKey = "***";
      }
      break;
    case "datadog":
      if (typeof masked.apiKey === "string" && masked.apiKey.length > 8) {
        masked.apiKey = `${masked.apiKey.slice(0, 4)}...${masked.apiKey.slice(-4)}`;
      }
      if (typeof masked.appKey === "string" && masked.appKey.length > 8) {
        masked.appKey = `${masked.appKey.slice(0, 4)}...${masked.appKey.slice(-4)}`;
      }
      break;
    case "cloudflare":
      if (typeof masked.apiToken === "string" && masked.apiToken.length > 8) {
        masked.apiToken = `${masked.apiToken.slice(0, 4)}...${masked.apiToken.slice(-4)}`;
      }
      break;
  }

  return masked;
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hash token for storage comparison
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

declare const crypto: Crypto;

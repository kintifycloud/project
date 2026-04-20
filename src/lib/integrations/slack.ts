/**
 * Slack Integration - Slash commands, bot responses, and channel push
 */

import { createHmac, timingSafeEqual } from "crypto";
import type {
  SlackIntegration,
  SlackSlashCommandPayload,
  SlackInteractionPayload,
  FixResult,
} from "./types";

const SLACK_API_BASE = "https://slack.com/api";

/**
 * Verify Slack request signature
 */
export function verifySlackRequest(
  signingSecret: string,
  timestamp: string,
  body: string,
  signature: string
): boolean {
  const time = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);

  // Request too old (> 5 minutes)
  if (Math.abs(now - time) > 300) {
    return false;
  }

  const sigBaseString = `v0:${timestamp}:${body}`;
  const mySignature = `v0=${createHmac("sha256", signingSecret).update(sigBaseString).digest("hex")}`;

  try {
    return timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

/**
 * Parse slash command payload from URL encoded body
 */
export function parseSlashCommand(body: string): SlackSlashCommandPayload {
  const params = new URLSearchParams(body);

  return {
    token: params.get("token") || "",
    team_id: params.get("team_id") || "",
    team_domain: params.get("team_domain") || "",
    channel_id: params.get("channel_id") || "",
    channel_name: params.get("channel_name") || "",
    user_id: params.get("user_id") || "",
    user_name: params.get("user_name") || "",
    command: params.get("command") || "",
    text: params.get("text") || "",
    response_url: params.get("response_url") || "",
    trigger_id: params.get("trigger_id") || "",
  };
}

/**
 * Parse interaction payload from JSON
 */
export function parseInteractionPayload(payload: string): SlackInteractionPayload {
  return JSON.parse(payload) as SlackInteractionPayload;
}

/**
 * Build formatted Slack message block for fix result
 */
export function buildFixMessageBlocks(
  issue: string,
  result: FixResult,
  includeActions = true
): unknown[] {
  const blocks: unknown[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🔧 Kintify Fix",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Issue:* ${issue.slice(0, 100)}${issue.length > 100 ? "..." : ""}`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: result.answer.slice(0, 2900),
      },
    },
  ];

  if (result.trace) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📊 *Analysis:* ${result.trace.slice(0, 200)}`,
        },
      ],
    });
  }

  if (includeActions) {
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "✅ Mark Resolved",
            emoji: true,
          },
          style: "primary",
          value: "resolve",
          action_id: "resolve_incident",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "🔗 View Details",
            emoji: true,
          },
          url: `https://kintify.cloud/incident/${Date.now()}`,
          action_id: "view_details",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "🔄 Run Again",
            emoji: true,
          },
          value: "rerun",
          action_id: "rerun_fix",
        },
      ],
    });
  }

  return blocks;
}

/**
 * Send message to Slack channel
 */
export async function sendSlackMessage(
  integration: SlackIntegration,
  channel: string,
  blocks: unknown[],
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${integration.settings.botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel,
      blocks,
      text,
      unfurl_links: false,
    }),
  });

  if (!response.ok) {
    return { ok: false, error: `HTTP ${response.status}` };
  }

  const data = await response.json();
  return { ok: data.ok === true, error: data.error };
}

/**
 * Send immediate response to slash command
 */
export async function sendSlashResponse(
  responseUrl: string,
  blocks: unknown[],
  text: string,
  responseType: "ephemeral" | "in_channel" = "in_channel"
): Promise<boolean> {
  const response = await fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      response_type: responseType,
      blocks,
      text,
    }),
  });

  return response.ok;
}

/**
 * Build loading message for immediate response
 */
export function buildLoadingMessage(issue: string): unknown[] {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🔍 Analyzing: *${issue.slice(0, 100)}${issue.length > 100 ? "..." : ""}*`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "⏳ Running SRE-grade analysis...",
        },
      ],
    },
  ];
}

/**
 * Build error message for Slack
 */
export function buildErrorMessage(error: string): unknown[] {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "❌ *Unable to analyze issue*",
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Error: ${error.slice(0, 200)}`,
        },
      ],
    },
  ];
}

/**
 * Extract issue text from slash command
 * Handles /fix [issue] format
 */
export function extractIssueFromCommand(text: string): string {
  return text.trim();
}

/**
 * Validate Slack integration configuration
 */
export function validateSlackConfig(integration: SlackIntegration): { valid: boolean; error?: string } {
  if (!integration.settings.botToken || !integration.settings.botToken.startsWith("xoxb-")) {
    return { valid: false, error: "Invalid bot token" };
  }

  if (!integration.settings.signingSecret) {
    return { valid: false, error: "Missing signing secret" };
  }

  return { valid: true };
}

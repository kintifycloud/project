/**
 * Slack Integration API - Slash commands and interactions
 * 
 * Endpoint: /api/integrations/slack
 * 
 * Supports:
 * - POST: Slash command (/fix [issue])
 * - POST (x-www-form-urlencoded): Slack interaction callbacks
 */

import { NextRequest, NextResponse } from "next/server";
import {
  verifySlackRequest,
  parseSlashCommand,
  buildFixMessageBlocks,
  buildLoadingMessage,
  buildErrorMessage,
  sendSlashResponse,
  extractIssueFromCommand,
} from "@/lib/integrations/slack";
import { recordIntegrationEvent } from "@/lib/integrations/core";
import { supabaseAdmin } from "@/lib/supabase-admin";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Slack-Signature, X-Slack-Request-Timestamp",
};

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Handle URL-encoded slash command
    if (contentType.includes("application/x-www-form-urlencoded")) {
      return handleSlashCommand(req);
    }

    // Handle JSON interaction
    if (contentType.includes("application/json")) {
      return handleInteraction(req);
    }

    return NextResponse.json(
      { error: "Unsupported content type" },
      { status: 400, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[Slack API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Handle Slack slash command (/fix)
 */
async function handleSlashCommand(req: NextRequest): Promise<Response> {
  // Get raw body for signature verification
  const body = await req.text();
  const timestamp = req.headers.get("x-slack-request-timestamp") || "";
  const signature = req.headers.get("x-slack-signature") || "";

  // Parse the command
  const command = parseSlashCommand(body);

  // Find the integration by Slack team ID
  if (!supabaseAdmin) {
    return sendImmediateResponse("Kintify is not configured properly.");
  }

  // Look up integration by Slack team ID
  const { data: integrationData } = await supabaseAdmin
    .from("integrations")
    .select("id, settings, status, team_id")
    .eq("type", "slack")
    .filter("settings->>teamId", "eq", command.team_id)
    .maybeSingle();

  if (!integrationData) {
    return sendImmediateResponse(
      "This Slack workspace is not connected to Kintify. Please connect it in your Kintify settings."
    );
  }

  const integration = {
    id: integrationData.id,
    type: "slack" as const,
    teamId: integrationData.team_id,
    status: integrationData.status,
    settings: integrationData.settings as {
      botToken: string;
      signingSecret: string;
      slashCommandEnabled?: boolean;
    },
  };

  // Verify request signature
  if (!verifySlackRequest(integration.settings.signingSecret, timestamp, body, signature)) {
    await recordIntegrationEvent(integration.id, "error", { error: "Invalid signature" });
    return sendImmediateResponse("Request verification failed.");
  }

  // Check if slash commands are enabled
  if (integration.settings.slashCommandEnabled === false) {
    return sendImmediateResponse("Slash commands are disabled for this integration.");
  }

  // Extract issue from command text
  const issue = extractIssueFromCommand(command.text);

  if (!issue) {
    return sendImmediateResponse(
      "Please provide an issue to fix.\nUsage: `/fix [issue description]`\n\nExample: `/fix API latency after deploy`"
    );
  }

  // Record the trigger
  await recordIntegrationEvent(integration.id, "trigger", {
    channel: command.channel_name,
    user: command.user_name,
    issue: issue.slice(0, 500),
  });

  // Send immediate acknowledgment (Slack requires response within 3 seconds)
  // We'll send the actual result async via response_url
  const loadingBlocks = buildLoadingMessage(issue);
  
  // Fire off the fix analysis asynchronously
  runFixAndRespond(command.response_url, issue, integration.id);

  return NextResponse.json(
    {
      blocks: loadingBlocks,
      text: `Analyzing: ${issue.slice(0, 100)}...`,
    },
    { status: 200, headers: corsHeaders }
  );
}

/**
 * Send immediate response for slash command
 */
function sendImmediateResponse(text: string): Response {
  return NextResponse.json(
    { text },
    { status: 200, headers: corsHeaders }
  );
}

/**
 * Run fix analysis and respond via Slack response_url
 */
async function runFixAndRespond(
  responseUrl: string,
  issue: string,
  integrationId: string
): Promise<void> {
  try {
    const fixResult = await runFixAnalysis(issue);

    // Record the result
    await recordIntegrationEvent(integrationId, "response", {
      input: issue,
      triggered: true,
    }, fixResult);

    // Build and send response
    const blocks = buildFixMessageBlocks(issue, fixResult, true);
    await sendSlashResponse(responseUrl, blocks, fixResult.answer, "in_channel");

  } catch (error) {
    console.error("[Slack] Fix analysis failed:", error);
    
    await recordIntegrationEvent(integrationId, "error", {
      input: issue,
      error: error instanceof Error ? error.message : String(error),
    });

    const errorBlocks = buildErrorMessage(
      error instanceof Error ? error.message : "Analysis failed"
    );
    await sendSlashResponse(responseUrl, errorBlocks, "Analysis failed", "ephemeral");
  }
}

/**
 * Run fix analysis via internal API
 */
async function runFixAnalysis(input: string): Promise<{
  answer: string;
  trace: string;
}> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "https://kintify.cloud"}/api/fix`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kintify-Priority": "true",
      },
      body: JSON.stringify({ input }),
    }
  );

  if (!response.ok) {
    throw new Error(`Fix API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    answer: data.answer,
    trace: data.trace,
  };
}

/**
 * Handle Slack interaction callbacks (button clicks, etc.)
 */
async function handleInteraction(req: NextRequest): Promise<Response> {
  // Parse the payload - Slack sends this as x-www-form-urlencoded with payload param
  const body = await req.text();
  const params = new URLSearchParams(body);
  const payloadParam = params.get("payload");

  if (!payloadParam) {
    return NextResponse.json(
      { error: "Missing payload" },
      { status: 400, headers: corsHeaders }
    );
  }

  const payload = JSON.parse(payloadParam);

  // Handle different interaction types
  switch (payload.type) {
    case "block_actions":
      return handleBlockActions(payload);
    default:
      return NextResponse.json(
        { error: "Unknown interaction type" },
        { status: 400, headers: corsHeaders }
      );
  }
}

/**
 * Handle block action interactions (button clicks)
 */
async function handleBlockActions(payload: Record<string, unknown>): Promise<Response> {
  const actions = payload.actions as Array<{ action_id: string; value: string }> | undefined;
  
  if (!actions || actions.length === 0) {
    return NextResponse.json({ text: "No action found" }, { status: 200, headers: corsHeaders });
  }

  const action = actions[0];
  if (!action) {
    return NextResponse.json({ text: "No action found" }, { status: 200, headers: corsHeaders });
  }

  switch (action.action_id) {
    case "resolve_incident":
      // Mark incident as resolved
      return NextResponse.json(
        { 
          replace_original: true,
          text: "✅ Incident marked as resolved."
        },
        { status: 200, headers: corsHeaders }
      );

    case "rerun_fix":
      // Re-run the fix
      // This would need to extract the original issue from the message
      return NextResponse.json(
        { text: "🔄 Re-running analysis..." },
        { status: 200, headers: corsHeaders }
      );

    default:
      return NextResponse.json(
        { text: "Unknown action" },
        { status: 200, headers: corsHeaders }
      );
  }
}

/**
 * Webhook API - Receive logs and alerts from external systems
 * Auto-triggers fix analysis based on configured thresholds
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  parseWebhookPayload,
  verifyWebhookSignature,
  shouldAutoTrigger,
  buildFixInputFromPayload,
} from "@/lib/integrations/webhook";
import {
  getIntegration,
  recordIntegrationEvent,
} from "@/lib/integrations/core";
import type { WebhookIntegration } from "@/lib/integrations/types";
import { createWebhookIncident } from "@/lib/team-mode";

// CORS headers for webhook endpoints
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Signature, X-Source",
};

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Get integration ID from URL or header
    const url = new URL(req.url);
    const integrationId = url.searchParams.get("id") || req.headers.get("x-integration-id");
    
    if (!integrationId) {
      return NextResponse.json(
        { error: "Missing integration ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Load integration
    const integration = await getIntegration(integrationId);
    if (!integration || integration.type !== "webhook") {
      return NextResponse.json(
        { error: "Invalid integration" },
        { status: 404, headers: corsHeaders }
      );
    }

    const webhookIntegration = integration as WebhookIntegration;

    // Verify signature if secret is configured
    const signature = req.headers.get("x-signature") || req.headers.get("x-hub-signature-256");
    let payload: Record<string, unknown>;
    if (webhookIntegration.settings.secret && signature) {
      const body = await req.text();
      if (!verifyWebhookSignature(webhookIntegration.settings.secret, body, signature)) {
        await recordIntegrationEvent(integrationId, "error", { error: "Invalid signature" });
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401, headers: corsHeaders }
        );
      }
      // Re-parse body after signature verification
      payload = JSON.parse(body);
    } else {
      payload = await req.json();
    }

    // Determine source
    const source = (req.headers.get("x-source") as string) || 
                   (payload.source as string) || 
                   "generic";

    // Parse payload
    const logPayload = parseWebhookPayload(source, payload);
    if (!logPayload) {
      return NextResponse.json(
        { error: "Invalid payload format" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Record the trigger event
    await recordIntegrationEvent(integrationId, "trigger", {
      source,
      severity: logPayload.severity,
      message: logPayload.data.message?.slice(0, 500),
    });

    // Check if auto-trigger is enabled and should fire
    const triggerCheck = shouldAutoTrigger(webhookIntegration, logPayload);
    
    if (!triggerCheck.shouldTrigger) {
      return NextResponse.json(
        { 
          received: true, 
          autoTrigger: false, 
          reason: triggerCheck.reason 
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // Run fix analysis
    const fixInput = buildFixInputFromPayload(logPayload);
    const fixResult = await runFixAnalysis(fixInput);

    // Record the result
    await recordIntegrationEvent(integrationId, "response", {
      source,
      input: fixInput,
      triggered: true,
    }, fixResult);

    // Create incident automatically (STEP 5)
    try {
      await createWebhookIncident({
        input: fixInput,
        output: fixResult.answer,
        trace: fixResult.trace,
        teamId: integration.teamId,
        createdBy: integration.createdBy,
        createdByEmail: "webhook@kintify.cloud",
      });
    } catch (incidentError) {
      console.error("[Webhook] Failed to create incident:", incidentError);
      // Don't fail the webhook if incident creation fails
    }

    // If Slack integration exists for this team, push the result
    await maybePushToSlack(integration.teamId, fixInput, fixResult);

    return NextResponse.json(
      {
        received: true,
        autoTrigger: true,
        fix: fixResult,
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error("[Webhook API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Run fix analysis via internal API
 */
async function runFixAnalysis(input: string): Promise<{
  answer: string;
  trace: string;
  classification?: string;
}> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://kintify.cloud"}/api/fix`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kintify-Priority": "true",
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error(`Fix API error: ${response.status}`);
    }

    const data = await response.json();
    const classification = response.headers.get("X-Fix-Classification");
    return {
      answer: data.answer as string,
      trace: data.trace as string,
      ...(classification ? { classification } : {}),
    };
  } catch (error) {
    console.error("[Webhook] Fix analysis failed:", error);
    return {
      answer: "Unable to analyze. Please try again manually.",
      trace: "Auto-analysis failed",
    };
  }
}

/**
 * Push fix result to connected Slack channels
 */
async function maybePushToSlack(
  teamId: string | null,
  issue: string,
  result: { answer: string; trace: string }
): Promise<void> {
  if (!teamId || !supabaseAdmin) return;

  try {
    // Find connected Slack integration
    const { data } = await supabaseAdmin
      .from("integrations")
      .select("id, settings")
      .eq("team_id", teamId)
      .eq("type", "slack")
      .eq("status", "connected")
      .maybeSingle();

    if (!data) return;

    // Import Slack utilities dynamically to avoid issues
    const { sendSlackMessage, buildFixMessageBlocks } = await import("@/lib/integrations/slack");

    const integration = {
      id: data.id as string,
      type: "slack" as const,
      name: "Slack" as string,
      status: "connected" as const,
      teamId: null as string | null,
      organizationId: null as string | null,
      createdBy: "" as string,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: {
        botToken: (data.settings as { botToken?: string }).botToken || "",
        signingSecret: (data.settings as { signingSecret?: string }).signingSecret || "",
        defaultChannel: (data.settings as { defaultChannel?: string }).defaultChannel,
        autoPushEnabled: (data.settings as { autoPushEnabled?: boolean }).autoPushEnabled ?? true,
        slashCommandEnabled: (data.settings as { slashCommandEnabled?: boolean }).slashCommandEnabled ?? true,
      } as { botToken: string; signingSecret: string; defaultChannel?: string; autoPushEnabled: boolean; slashCommandEnabled: boolean },
    };

    const channel = integration.settings.defaultChannel;
    if (!channel) return;

    const blocks = buildFixMessageBlocks(issue, result, false);
    await sendSlackMessage(integration, channel, blocks, `Fix for: ${issue.slice(0, 100)}`);
  } catch (error) {
    console.error("[Webhook] Slack push failed:", error);
  }
}

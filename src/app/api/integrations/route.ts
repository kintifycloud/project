/**
 * Integrations Management API
 * 
 * GET: List integrations for the authenticated user/team
 * POST: Create a new integration
 * PATCH: Update an integration
 * DELETE: Remove an integration
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { IntegrationType } from "@/lib/integrations";
import { hasTeamAccess, type KintifyPlan } from "@/lib/monetization";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Get authenticated user from request
 */
async function getAuthUser(req: NextRequest): Promise<{ userId: string; plan: KintifyPlan } | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  // Get user's plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    plan: (profile?.plan as KintifyPlan) || "free",
  };
}

/**
 * GET - List integrations
 */
export async function GET(req: NextRequest): Promise<Response> {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const teamId = url.searchParams.get("teamId");

  try {
    if (!supabase) throw new Error("Supabase not configured");

    let query = supabase
      .from("integrations")
      .select("id, type, name, status, team_id, organization_id, created_at, updated_at, settings");

    if (teamId) {
      // Check team access
      const { data: membership } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", auth.userId)
        .maybeSingle();

      if (!membership) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      query = query.eq("team_id", teamId);
    } else {
      // Personal integrations
      query = query.eq("created_by", auth.userId).is("team_id", null);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ integrations: data || [] });
  } catch (error) {
    console.error("[Integrations API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create integration
 */
export async function POST(req: NextRequest): Promise<Response> {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, name, teamId, settings } = body;

    if (!type || !name) {
      return NextResponse.json(
        { error: "Type and name are required" },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes: IntegrationType[] = ["slack", "github", "webhook", "datadog", "cloudflare"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid integration type" }, { status: 400 });
    }

    if (!supabase) throw new Error("Supabase not configured");

    // Check team access if teamId provided
    if (teamId) {
      const { data: membership } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", auth.userId)
        .maybeSingle();

      if (!membership || membership.role !== "owner") {
        return NextResponse.json(
          { error: "Only team owners can add integrations" },
          { status: 403 }
        );
      }

      if (!hasTeamAccess(auth.plan)) {
        return NextResponse.json(
          { error: "Team plan required" },
          { status: 403 }
        );
      }
    }

    // Create integration
    const { data, error } = await supabase
      .from("integrations")
      .insert({
        type,
        name,
        team_id: teamId || null,
        created_by: auth.userId,
        settings: maskSensitiveSettings(type, settings),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ integration: data }, { status: 201 });
  } catch (error) {
    console.error("[Integrations API] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create integration" },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update integration
 */
export async function PATCH(req: NextRequest): Promise<Response> {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, status, settings } = body;

    if (!id) {
      return NextResponse.json({ error: "Integration ID required" }, { status: 400 });
    }

    if (!supabase) throw new Error("Supabase not configured");

    // Check ownership
    const { data: existing } = await supabase
      .from("integrations")
      .select("created_by, team_id, type")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const canUpdate =
      existing.created_by === auth.userId ||
      (existing.team_id && await isTeamOwner(existing.team_id, auth.userId));

    if (!canUpdate) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name) update.name = name;
    if (status) update.status = status;
    if (settings) {
      update.settings = maskSensitiveSettings(existing.type as IntegrationType, settings);
    }

    const { data, error } = await supabase
      .from("integrations")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ integration: data });
  } catch (error) {
    console.error("[Integrations API] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update integration" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove integration
 */
export async function DELETE(req: NextRequest): Promise<Response> {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Integration ID required" }, { status: 400 });
  }

  try {
    if (!supabase) throw new Error("Supabase not configured");

    // Check ownership
    const { data: existing } = await supabase
      .from("integrations")
      .select("created_by, team_id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const canDelete =
      existing.created_by === auth.userId ||
      (existing.team_id && await isTeamOwner(existing.team_id, auth.userId));

    if (!canDelete) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { error } = await supabase.from("integrations").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Integrations API] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete integration" },
      { status: 500 }
    );
  }
}

/**
 * Check if user is team owner
 */
async function isTeamOwner(teamId: string, userId: string): Promise<boolean> {
  if (!supabase) return false;

  const { data } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .maybeSingle();

  return data?.role === "owner";
}

/**
 * Mask sensitive settings
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
      if (typeof masked.signingSecret === "string") {
        masked.signingSecret = "***";
      }
      break;
    case "webhook":
      if (typeof masked.secret === "string") {
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

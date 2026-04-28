import { type User } from "@supabase/supabase-js";

import { hasTeamAccess, type KintifyPlan } from "@/lib/monetization";

import { supabaseAuth } from "./supabase-auth";

export const PERSONAL_WORKSPACE_ID = "personal";

export type WorkspaceRole = "owner" | "member";
export type WorkspaceKind = "personal" | "team";
export type IncidentStatus = "open" | "resolved";

export type WorkspaceSummary = {
  id: string;
  name: string;
  kind: WorkspaceKind;
  role: WorkspaceRole;
  memberCount: number;
  organizationId: string | null;
};

export type IncidentRecord = {
  id: string;
  input: string;
  output: string;
  trace: string | null;
  createdBy: string;
  createdByEmail: string;
  createdAt: number;
  updatedAt: number;
  status: IncidentStatus;
  teamId: string | null;
  organizationId: string | null;
  isPublic: boolean;
};

export type InviteLinkResult = {
  token: string;
  url: string;
  teamId: string;
  teamName: string;
  email: string | null;
};

type ProfileRow = {
  active_team_id: string | null;
};

type TeamRow = {
  id?: string;
  name?: string;
  organization_id?: string | null;
};

type TeamMembershipRow = {
  team_id: string;
  role: WorkspaceRole;
  team: TeamRow | TeamRow[] | null;
};

type TeamCountRow = {
  team_id: string;
};

type TeamInviteRow = {
  id: string;
  team_id: string;
  email: string | null;
  role: WorkspaceRole;
  accepted_at: string | null;
  expires_at: string | null;
  team: Pick<TeamRow, "name"> | Pick<TeamRow, "name">[] | null;
};

type IncidentRow = {
  id: string;
  input: string;
  output: string;
  trace: string | null;
  created_by: string;
  created_by_email: string;
  created_at: string;
  updated_at: string;
  status: IncidentStatus;
  team_id: string | null;
  organization_id: string | null;
  is_public: boolean;
};

function getClient() {
  if (!supabaseAuth) {
    throw new Error("Supabase authentication is not configured.");
  }

  return supabaseAuth;
}

function asSingleRow<T extends object>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function getUserEmail(user: User): string {
  return typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
}

function getUserName(user: User): string {
  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";

  return metadataName.trim();
}

function createToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function normalizeWorkspaceName(value: string): string {
  return value.trim().slice(0, 80);
}

function buildInviteUrl(token: string): string {
  if (typeof window === "undefined") {
    return `/join?invite=${encodeURIComponent(token)}`;
  }

  return `${window.location.origin}/join?invite=${encodeURIComponent(token)}`;
}

function toTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : Date.now();
}

function mapIncidentRow(row: IncidentRow): IncidentRecord {
  return {
    id: row.id,
    input: row.input,
    output: row.output,
    trace: row.trace,
    createdBy: row.created_by,
    createdByEmail: row.created_by_email,
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at),
    status: row.status,
    teamId: row.team_id,
    organizationId: row.organization_id,
    isPublic: row.is_public,
  };
}

export function normalizeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

export function extractInviteToken(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    const fromQuery = parsed.searchParams.get("invite");

    if (fromQuery) {
      return fromQuery.trim();
    }

    const lastSegment = parsed.pathname.split("/").filter(Boolean).at(-1);
    return lastSegment?.trim() ?? trimmed;
  } catch {
    return trimmed;
  }
}

export function buildPersonalWorkspace(): WorkspaceSummary {
  return {
    id: PERSONAL_WORKSPACE_ID,
    name: "Personal",
    kind: "personal",
    role: "owner",
    memberCount: 1,
    organizationId: null,
  };
}

export async function ensureProfile(user: User): Promise<string | null> {
  const client = getClient();
  const { data, error } = await client
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: getUserEmail(user),
        full_name: getUserName(user) || null,
      },
      { onConflict: "id" },
    )
    .select("active_team_id")
    .single<ProfileRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data?.active_team_id ?? null;
}

export async function loadWorkspaceState(
  user: User,
  plan: KintifyPlan,
): Promise<{ workspaces: WorkspaceSummary[]; activeWorkspaceId: string }> {
  const client = getClient();
  const activeTeamId = await ensureProfile(user);
  const { data, error } = await client
    .from("team_members")
    .select("team_id, role, team:teams(id, name, organization_id)")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  const memberships = (data ?? []) as TeamMembershipRow[];
  const teamIds = memberships.map((membership) => membership.team_id).filter((teamId) => teamId.length > 0);
  const memberCountByTeam = new Map<string, number>();

  if (teamIds.length > 0) {
    const { data: countRows, error: countError } = await client
      .from("team_members")
      .select("team_id")
      .in("team_id", teamIds);

    if (countError) {
      throw new Error(countError.message);
    }

    for (const row of (countRows ?? []) as TeamCountRow[]) {
      memberCountByTeam.set(row.team_id, (memberCountByTeam.get(row.team_id) ?? 0) + 1);
    }
  }

  const teamWorkspaces: WorkspaceSummary[] = [];

  for (const membership of memberships) {
    const team = asSingleRow(membership.team);

    if (!team?.id || !team?.name) {
      continue;
    }

    teamWorkspaces.push({
      id: team.id,
      name: team.name,
      kind: "team",
      role: membership.role,
      memberCount: memberCountByTeam.get(team.id) ?? 1,
      organizationId: team.organization_id ?? null,
    });
  }

  teamWorkspaces.sort((left, right) => left.name.localeCompare(right.name));

  const workspaces = [buildPersonalWorkspace(), ...teamWorkspaces];
  const activeWorkspaceId =
    hasTeamAccess(plan) && activeTeamId && teamWorkspaces.some((workspace) => workspace.id === activeTeamId)
      ? activeTeamId
      : PERSONAL_WORKSPACE_ID;

  return {
    workspaces,
    activeWorkspaceId,
  };
}

export async function persistActiveWorkspace(
  userId: string,
  workspaceId: string,
  plan: KintifyPlan,
): Promise<void> {
  const client = getClient();
  const nextTeamId = workspaceId === PERSONAL_WORKSPACE_ID ? null : workspaceId;

  if (nextTeamId && !hasTeamAccess(plan)) {
    throw new Error("Upgrade to Team to switch into shared workspaces.");
  }

  const { error } = await client
    .from("profiles")
    .update({ active_team_id: nextTeamId })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createTeamWorkspace(
  user: User,
  name: string,
  plan: KintifyPlan,
): Promise<WorkspaceSummary> {
  if (!hasTeamAccess(plan)) {
    throw new Error("Upgrade to Team to create a shared workspace.");
  }

  const teamName = normalizeWorkspaceName(name);

  if (!teamName) {
    throw new Error("Add a team name.");
  }

  const client = getClient();
  await ensureProfile(user);

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("active_organization_id")
    .eq("id", user.id)
    .maybeSingle<{ active_organization_id: string | null }>();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data, error } = await client
    .from("teams")
    .insert({
      name: teamName,
      owner_id: user.id,
      organization_id: profile?.active_organization_id ?? null,
    })
    .select("id, name")
    .single<{ id: string; name: string }>();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create team.");
  }

  const { error: membershipError } = await client.from("team_members").upsert(
    {
      team_id: data.id,
      user_id: user.id,
      role: "owner" satisfies WorkspaceRole,
    },
    { onConflict: "team_id,user_id" },
  );

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  await persistActiveWorkspace(user.id, data.id, plan);

  return {
    id: data.id,
    name: data.name,
    kind: "team",
    role: "owner",
    memberCount: 1,
    organizationId: profile?.active_organization_id ?? null,
  };
}

export async function createTeamInviteLink(
  user: User,
  teamId: string,
  email?: string,
): Promise<InviteLinkResult> {
  const client = getClient();
  const { data: membership, error: membershipError } = await client
    .from("team_members")
    .select("role, team:teams(id, name)")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle<{ role: WorkspaceRole; team: TeamRow | TeamRow[] | null }>();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership || membership.role !== "owner") {
    throw new Error("Only team owners can invite members.");
  }

  const token = createToken();
  const normalizedEmail = email?.trim().toLowerCase() || null;
  const { error } = await client.from("team_invites").insert({
    team_id: teamId,
    created_by: user.id,
    email: normalizedEmail,
    token,
    role: "member" satisfies WorkspaceRole,
  });

  if (error) {
    throw new Error(error.message);
  }

  const team = asSingleRow(membership.team);

  return {
    token,
    url: buildInviteUrl(token),
    teamId,
    teamName: team?.name?.trim() || "Team",
    email: normalizedEmail,
  };
}

export async function joinTeamWorkspace(
  user: User,
  rawInviteToken: string,
  plan: KintifyPlan,
): Promise<{ teamId: string; teamName: string }> {
  if (!hasTeamAccess(plan)) {
    throw new Error("Upgrade to Team to join a shared workspace.");
  }

  const token = extractInviteToken(rawInviteToken);

  if (!token) {
    throw new Error("Paste an invite link or token.");
  }

  const client = getClient();
  await ensureProfile(user);

  const { data, error } = await client
    .from("team_invites")
    .select("id, team_id, email, role, accepted_at, expires_at, team:teams(name)")
    .eq("token", token)
    .maybeSingle<TeamInviteRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Invite not found.");
  }

  const userEmail = getUserEmail(user);

  if (data.email && data.email.toLowerCase() !== userEmail) {
    throw new Error("This invite is restricted to a different email address.");
  }

  if (data.expires_at && Date.parse(data.expires_at) <= Date.now()) {
    throw new Error("This invite has expired.");
  }

  const { error: membershipError } = await client.from("team_members").upsert(
    {
      team_id: data.team_id,
      user_id: user.id,
      role: data.role,
    },
    { onConflict: "team_id,user_id" },
  );

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!data.accepted_at) {
    const { error: inviteError } = await client
      .from("team_invites")
      .update({
        accepted_at: new Date().toISOString(),
        accepted_by: user.id,
      })
      .eq("id", data.id);

    if (inviteError) {
      throw new Error(inviteError.message);
    }
  }

  await persistActiveWorkspace(user.id, data.team_id, plan);

  const team = asSingleRow(data.team);

  return {
    teamId: data.team_id,
    teamName: team?.name?.trim() || "Team",
  };
}

export async function listWorkspaceIncidents(
  userId: string,
  workspaceId: string,
): Promise<IncidentRecord[]> {
  const client = getClient();
  const baseQuery = client
    .from("incidents")
    .select("id, input, output, trace, created_by, created_by_email, created_at, updated_at, status, team_id, organization_id")
    .order("created_at", { ascending: false });

  const { data, error } =
    workspaceId === PERSONAL_WORKSPACE_ID
      ? await baseQuery.is("team_id", null).eq("created_by", userId)
      : await baseQuery.eq("team_id", workspaceId);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as IncidentRow[]).map(mapIncidentRow);
}

export async function createWorkspaceIncident(
  user: User,
  workspaceId: string,
  plan: KintifyPlan,
  payload: {
    input: string;
    output: string;
    trace?: string | null;
  },
): Promise<IncidentRecord> {
  const client = getClient();
  const input = payload.input.trim();
  const output = payload.output.trim();

  if (!input || !output) {
    throw new Error("Both the incident input and output are required.");
  }

  if (workspaceId !== PERSONAL_WORKSPACE_ID && !hasTeamAccess(plan)) {
    throw new Error("Upgrade to Team to save shared incidents.");
  }

  await ensureProfile(user);

  let organizationId: string | null = null;

  if (workspaceId !== PERSONAL_WORKSPACE_ID) {
    const { data: teamRow, error: teamError } = await client
      .from("teams")
      .select("organization_id")
      .eq("id", workspaceId)
      .maybeSingle<{ organization_id: string | null }>();

    if (teamError) {
      throw new Error(teamError.message);
    }

    organizationId = teamRow?.organization_id ?? null;
  }

  const { data, error } = await client
    .from("incidents")
    .insert({
      team_id: workspaceId === PERSONAL_WORKSPACE_ID ? null : workspaceId,
      organization_id: organizationId,
      created_by: user.id,
      created_by_email: getUserEmail(user),
      input,
      output,
      trace: payload.trace ?? null,
      status: "open" satisfies IncidentStatus,
    })
    .select("id, input, output, trace, created_by, created_by_email, created_at, updated_at, status, team_id, organization_id")
    .single<IncidentRow>();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not save incident.");
  }

  return mapIncidentRow(data);
}

export async function updateIncidentStatus(
  incidentId: string,
  status: IncidentStatus,
): Promise<IncidentRecord> {
  const client = getClient();
  const { data, error } = await client
    .from("incidents")
    .update({ status })
    .eq("id", incidentId)
    .select("id, input, output, trace, created_by, created_by_email, created_at, updated_at, status, team_id, organization_id")
    .single<IncidentRow>();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update incident status.");
  }

  return mapIncidentRow(data);
}

export async function getIncidentById(incidentId: string): Promise<IncidentRecord | null> {
  const client = getClient();
  const { data, error } = await client
    .from("incidents")
    .select("id, input, output, trace, created_by, created_by_email, created_at, updated_at, status, team_id, organization_id, is_public")
    .eq("id", incidentId)
    .maybeSingle<IncidentRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapIncidentRow(data) : null;
}

export async function getPublicIncidentById(incidentId: string): Promise<IncidentRecord | null> {
  const client = getClient();
  const { data, error } = await client
    .from("incidents")
    .select("id, input, output, trace, created_by, created_by_email, created_at, updated_at, status, team_id, organization_id, is_public")
    .eq("id", incidentId)
    .eq("is_public", true)
    .maybeSingle<IncidentRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapIncidentRow(data) : null;
}

export async function updateIncidentPrivacy(incidentId: string, isPublic: boolean): Promise<IncidentRecord> {
  const client = getClient();
  const { data, error } = await client
    .from("incidents")
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("id", incidentId)
    .select("id, input, output, trace, created_by, created_by_email, created_at, updated_at, status, team_id, organization_id, is_public")
    .single<IncidentRow>();

  if (error) {
    throw new Error(error.message);
  }

  return mapIncidentRow(data);
}

export async function createWebhookIncident(params: {
  input: string;
  output: string;
  trace: string | null;
  teamId: string | null;
  createdBy: string;
  createdByEmail: string;
}): Promise<IncidentRecord> {
  const client = getClient();
  const { input, output, trace, teamId, createdBy, createdByEmail } = params;

  const { data, error } = await client
    .from("incidents")
    .insert({
      input: input.trim(),
      output: output.trim(),
      trace,
      created_by: createdBy,
      created_by_email: createdByEmail,
      status: "open",
      team_id: teamId,
      organization_id: null,
      is_public: false,
    })
    .select("id, input, output, trace, created_by, created_by_email, created_at, updated_at, status, team_id, organization_id, is_public")
    .single<IncidentRow>();

  if (error) {
    throw new Error(error.message);
  }

  return mapIncidentRow(data);
}

export async function getPublicIncidents(limit = 20): Promise<IncidentRecord[]> {
  const client = getClient();
  const { data, error } = await client
    .from("incidents")
    .select("id, input, output, trace, created_by, created_by_email, created_at, updated_at, status, team_id, organization_id, is_public")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapIncidentRow);
}

export async function getRecentIncidents(user: User, limit = 10): Promise<IncidentRecord[]> {
  const client = getClient();
  const { data, error } = await client
    .from("incidents")
    .select("id, input, output, trace, created_by, created_by_email, created_at, updated_at, status, team_id, organization_id, is_public")
    .or(`created_by.eq.${user.id},team_id.in.(select team_id from team_members where user_id = ${user.id})`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapIncidentRow);
}

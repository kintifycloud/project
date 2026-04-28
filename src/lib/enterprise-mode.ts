import { type User } from "@supabase/supabase-js";

import { type IncidentRecord, ensureProfile, normalizeError } from "@/lib/team-mode";

import { supabaseAuth } from "./supabase-auth";

export type EnterpriseRole = "admin" | "engineer" | "viewer";

export type OrganizationSummary = {
  id: string;
  name: string;
  userCount: number;
  teamCount: number;
  incidentCount: number;
};

export type OrganizationMemberRecord = {
  userId: string;
  email: string;
  fullName: string;
  role: EnterpriseRole;
};

export type AuditLogRecord = {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  timestamp: number;
  metadata: Record<string, unknown>;
  organizationId: string | null;
  teamId: string | null;
  incidentId: string | null;
};

export type EnterpriseDashboardMetrics = {
  averageResolutionHours: number;
  incidentsPerWeek: number;
  activeIncidents: number;
  resolvedIncidents: number;
  totalIncidents: number;
};

export type EnterpriseState = {
  organization: OrganizationSummary | null;
  role: EnterpriseRole | null;
  members: OrganizationMemberRecord[];
};

export type EnterpriseDashboardData = {
  organization: OrganizationSummary;
  metrics: EnterpriseDashboardMetrics;
  incidents: IncidentRecord[];
  recentActivity: AuditLogRecord[];
};

type ProfileRow = {
  active_organization_id: string | null;
};

type OrganizationRow = {
  id?: string;
  name?: string;
};

type OrganizationMembershipRow = {
  organization_id: string;
  role: EnterpriseRole;
  organization: OrganizationRow | OrganizationRow[] | null;
};

type OrganizationMemberRow = {
  user_id: string;
  role: EnterpriseRole;
  profile: { email?: string; full_name?: string | null } | { email?: string; full_name?: string | null }[] | null;
};

type CountRow = {
  organization_id: string;
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
  status: "open" | "resolved";
  team_id: string | null;
  organization_id: string | null;
  is_public: boolean;
};

type AuditLogRow = {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
  organization_id: string | null;
  team_id: string | null;
  incident_id: string | null;
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

function toTimestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function redactString(value: string): string {
  const trimmed = value.trim().slice(0, 4000);

  return trimmed
    .replace(/(bearer\s+)[a-z0-9._-]+/gi, "$1[REDACTED]")
    .replace(/(api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi, "$1=[REDACTED]")
    .replace(/-----BEGIN[\s\S]+?-----END[\s\S]+?-----/g, "[REDACTED_CERTIFICATE]");
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, sanitizeValue(nestedValue)]);
    return Object.fromEntries(entries);
  }

  return value;
}

function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> {
  if (!metadata) {
    return {};
  }

  return sanitizeValue(metadata) as Record<string, unknown>;
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

function mapAuditLogRow(row: AuditLogRow): AuditLogRecord {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    action: row.action,
    timestamp: toTimestamp(row.created_at),
    metadata: row.metadata ?? {},
    organizationId: row.organization_id,
    teamId: row.team_id,
    incidentId: row.incident_id,
  };
}

async function getOrganizationCounts(client: ReturnType<typeof getClient>, organizationId: string) {
  const [memberRows, teamRows, incidentRows] = await Promise.all([
    client.from("organization_members").select("organization_id").eq("organization_id", organizationId),
    client.from("teams").select("organization_id").eq("organization_id", organizationId),
    client.from("incidents").select("organization_id").eq("organization_id", organizationId),
  ]);

  if (memberRows.error) {
    throw new Error(memberRows.error.message);
  }

  if (teamRows.error) {
    throw new Error(teamRows.error.message);
  }

  if (incidentRows.error) {
    throw new Error(incidentRows.error.message);
  }

  return {
    userCount: ((memberRows.data ?? []) as CountRow[]).length,
    teamCount: ((teamRows.data ?? []) as CountRow[]).length,
    incidentCount: ((incidentRows.data ?? []) as CountRow[]).length,
  };
}

async function listOrganizationMembersInternal(client: ReturnType<typeof getClient>, organizationId: string): Promise<OrganizationMemberRecord[]> {
  const { data, error } = await client
    .from("organization_members")
    .select("user_id, role, profile:profiles(email, full_name)")
    .eq("organization_id", organizationId)
    .order("role", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as OrganizationMemberRow[])
    .map((row) => {
      const profile = asSingleRow(row.profile);
      return {
        userId: row.user_id,
        email: typeof profile?.email === "string" ? profile.email : "",
        fullName: typeof profile?.full_name === "string" ? profile.full_name : "",
        role: row.role,
      } satisfies OrganizationMemberRecord;
    })
    .sort((left, right) => left.email.localeCompare(right.email));
}

export async function loadEnterpriseState(user: User): Promise<EnterpriseState> {
  const client = getClient();
  await ensureProfile(user);

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("active_organization_id")
    .eq("id", user.id)
    .single<ProfileRow>();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data, error } = await client
    .from("organization_members")
    .select("organization_id, role, organization:organizations(id, name)")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  const memberships = (data ?? []) as OrganizationMembershipRow[];
  const activeOrganizationId =
    profile?.active_organization_id && memberships.some((membership) => membership.organization_id === profile.active_organization_id)
      ? profile.active_organization_id
      : memberships[0]?.organization_id ?? null;

  if (!activeOrganizationId) {
    return {
      organization: null,
      role: null,
      members: [],
    };
  }

  const membership = memberships.find((entry) => entry.organization_id === activeOrganizationId);
  const organizationRow = asSingleRow(membership?.organization ?? null);

  if (!membership || !organizationRow?.id || !organizationRow?.name) {
    return {
      organization: null,
      role: null,
      members: [],
    };
  }

  const counts = await getOrganizationCounts(client, organizationRow.id);
  const members = await listOrganizationMembersInternal(client, organizationRow.id);

  return {
    organization: {
      id: organizationRow.id,
      name: organizationRow.name,
      userCount: counts.userCount,
      teamCount: counts.teamCount,
      incidentCount: counts.incidentCount,
    },
    role: membership.role,
    members,
  };
}

export async function createOrganizationWithTeam(
  user: User,
  organizationName: string,
  initialTeamName: string,
): Promise<EnterpriseState> {
  const client = getClient();
  const nextOrganizationName = organizationName.trim().slice(0, 100);
  const nextTeamName = initialTeamName.trim().slice(0, 80) || `${nextOrganizationName} Team`;

  if (!nextOrganizationName) {
    throw new Error("Add an organization name.");
  }

  await ensureProfile(user);

  const { data: organization, error: organizationError } = await client
    .from("organizations")
    .insert({
      name: nextOrganizationName,
      owner_id: user.id,
    })
    .select("id, name")
    .single<{ id: string; name: string }>();

  if (organizationError || !organization) {
    throw new Error(organizationError?.message ?? "Could not create organization.");
  }

  const { error: orgMembershipError } = await client.from("organization_members").upsert(
    {
      organization_id: organization.id,
      user_id: user.id,
      role: "admin" satisfies EnterpriseRole,
    },
    { onConflict: "organization_id,user_id" },
  );

  if (orgMembershipError) {
    throw new Error(orgMembershipError.message);
  }

  const { data: team, error: teamError } = await client
    .from("teams")
    .insert({
      organization_id: organization.id,
      owner_id: user.id,
      name: nextTeamName,
    })
    .select("id")
    .single<{ id: string }>();

  if (teamError || !team) {
    throw new Error(teamError?.message ?? "Could not create initial team.");
  }

  const { error: teamMembershipError } = await client.from("team_members").upsert(
    {
      team_id: team.id,
      user_id: user.id,
      role: "owner",
    },
    { onConflict: "team_id,user_id" },
  );

  if (teamMembershipError) {
    throw new Error(teamMembershipError.message);
  }

  const { error: profileUpdateError } = await client
    .from("profiles")
    .update({ active_organization_id: organization.id, active_team_id: team.id })
    .eq("id", user.id);

  if (profileUpdateError) {
    throw new Error(profileUpdateError.message);
  }

  return loadEnterpriseState(user);
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  role: EnterpriseRole,
): Promise<void> {
  const client = getClient();
  const { error } = await client
    .from("organization_members")
    .update({ role })
    .eq("organization_id", organizationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function recordEnterpriseAuditLog(payload: {
  userId: string;
  userEmail: string;
  action: string;
  organizationId?: string | null;
  teamId?: string | null;
  incidentId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const client = getClient();
  const { error } = await client.from("audit_logs").insert({
    user_id: payload.userId,
    user_email: payload.userEmail,
    action: payload.action,
    organization_id: payload.organizationId ?? null,
    team_id: payload.teamId ?? null,
    incident_id: payload.incidentId ?? null,
    metadata: sanitizeMetadata(payload.metadata),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function listIncidentTimeline(incidentId: string): Promise<AuditLogRecord[]> {
  const client = getClient();
  const { data, error } = await client
    .from("audit_logs")
    .select("id, user_id, user_email, action, created_at, metadata, organization_id, team_id, incident_id")
    .eq("incident_id", incidentId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as AuditLogRow[]).map(mapAuditLogRow);
}

export async function getEnterpriseDashboardData(organizationId: string): Promise<EnterpriseDashboardData> {
  const client = getClient();
  const [{ data: organizationRows, error: organizationError }, { data: incidentRows, error: incidentError }, { data: auditRows, error: auditError }] = await Promise.all([
    client.from("organizations").select("id, name").eq("id", organizationId).maybeSingle<{ id: string; name: string }>(),
    client
      .from("incidents")
      .select("id, input, output, trace, created_by, created_by_email, created_at, updated_at, status, team_id, organization_id")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),
    client
      .from("audit_logs")
      .select("id, user_id, user_email, action, created_at, metadata, organization_id, team_id, incident_id")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (organizationError || !organizationRows) {
    throw new Error(organizationError?.message ?? "Could not load organization.");
  }

  if (incidentError) {
    throw new Error(incidentError.message);
  }

  if (auditError) {
    throw new Error(auditError.message);
  }

  const incidents = ((incidentRows ?? []) as IncidentRow[]).map(mapIncidentRow);
  const counts = await getOrganizationCounts(client, organizationId);
  const resolvedIncidents = incidents.filter((incident) => incident.status === "resolved");
  const averageResolutionHours = resolvedIncidents.length
    ? resolvedIncidents.reduce((total, incident) => total + (incident.updatedAt - incident.createdAt) / 3_600_000, 0) / resolvedIncidents.length
    : 0;
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const incidentsPerWeek = incidents.filter((incident) => incident.createdAt >= oneWeekAgo).length;

  return {
    organization: {
      id: organizationRows.id,
      name: organizationRows.name,
      userCount: counts.userCount,
      teamCount: counts.teamCount,
      incidentCount: counts.incidentCount,
    },
    metrics: {
      averageResolutionHours,
      incidentsPerWeek,
      activeIncidents: incidents.filter((incident) => incident.status === "open").length,
      resolvedIncidents: resolvedIncidents.length,
      totalIncidents: incidents.length,
    },
    incidents,
    recentActivity: ((auditRows ?? []) as AuditLogRow[]).map(mapAuditLogRow),
  };
}

export function exportIncidentsAsJson(incidents: IncidentRecord[]): string {
  return JSON.stringify(incidents, null, 2);
}

function escapeCsvValue(value: string): string {
  const normalized = value.replace(/\r?\n/g, " ").replace(/"/g, '""');
  return `"${normalized}"`;
}

export function exportIncidentsAsCsv(incidents: IncidentRecord[]): string {
  const headers = ["id", "input", "output", "createdByEmail", "status", "createdAt"];
  const rows = incidents.map((incident) => {
    return [
      incident.id,
      incident.input,
      incident.output,
      incident.createdByEmail,
      incident.status,
      new Date(incident.createdAt).toISOString(),
    ]
      .map((value) => escapeCsvValue(String(value)))
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function buildWeeklyReport(organizationName: string, metrics: EnterpriseDashboardMetrics, incidents: IncidentRecord[]): string {
  const topOpenIncidents = incidents
    .filter((incident) => incident.status === "open")
    .slice(0, 5)
    .map((incident) => `- ${incident.input} — ${incident.createdByEmail}`)
    .join("\n");

  return [
    `${organizationName} weekly incident report`,
    "",
    `Average resolution time: ${metrics.averageResolutionHours.toFixed(1)} hours`,
    `Incidents this week: ${metrics.incidentsPerWeek}`,
    `Active incidents: ${metrics.activeIncidents}`,
    `Resolved incidents: ${metrics.resolvedIncidents}`,
    "",
    "Open incidents:",
    topOpenIncidents || "- None",
  ].join("\n");
}

export { normalizeError };

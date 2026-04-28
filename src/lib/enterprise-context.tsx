"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { hasEnterpriseAccess, readKintifyPlan, type KintifyPlan } from "@/lib/monetization";
import { supabaseAuth } from "@/lib/supabase-auth";
import {
  buildWeeklyReport,
  createOrganizationWithTeam,
  exportIncidentsAsCsv,
  exportIncidentsAsJson,
  getEnterpriseDashboardData,
  listIncidentTimeline,
  loadEnterpriseState,
  normalizeError,
  recordEnterpriseAuditLog,
  updateOrganizationMemberRole,
  type AuditLogRecord,
  type EnterpriseDashboardData,
  type EnterpriseRole,
  type EnterpriseState,
} from "@/lib/enterprise-mode";
import { useTeam } from "@/lib/team-context";

type EnterpriseContextType = {
  plan: KintifyPlan;
  enterpriseEnabled: boolean;
  loading: boolean;
  state: EnterpriseState;
  canCreateIncidents: boolean;
  canResolveIncidents: boolean;
  canViewEnterprise: boolean;
  refresh: () => Promise<void>;
  createOrganization: (organizationName: string, initialTeamName: string) => Promise<string | null>;
  updateMemberRole: (userId: string, role: EnterpriseRole) => Promise<string | null>;
  loadDashboard: () => Promise<{ error: string | null; data: EnterpriseDashboardData | null }>;
  loadIncidentTimeline: (incidentId: string) => Promise<{ error: string | null; entries: AuditLogRecord[] }>;
  trackAudit: (payload: {
    action: string;
    incidentId?: string | null;
    teamId?: string | null;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
  exportDashboard: (format: "csv" | "json" | "report", data: EnterpriseDashboardData) => { filename: string; content: string };
};

const defaultState: EnterpriseState = {
  organization: null,
  role: null,
  members: [],
};

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export function EnterpriseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { activeWorkspace } = useTeam();
  const [plan, setPlan] = useState<KintifyPlan>(() => readKintifyPlan());
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<EnterpriseState>(defaultState);

  const refresh = useCallback(async () => {
    if (!user || !hasEnterpriseAccess(plan)) {
      setState(defaultState);
      setLoading(false);
      return;
    }

    // Check if Supabase is configured before attempting to load enterprise state
    if (!supabaseAuth) {
      console.warn("[Enterprise Context] Supabase not configured - enterprise features disabled");
      setState(defaultState);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const nextState = await loadEnterpriseState(user);
      setState(nextState);
    } catch {
      setState(defaultState);
    } finally {
      setLoading(false);
    }
  }, [plan, user]);

  useEffect(() => {
    const syncPlan = () => setPlan(readKintifyPlan());
    syncPlan();
    window.addEventListener("storage", syncPlan);
    window.addEventListener("kintify:plan-change", syncPlan as EventListener);

    return () => {
      window.removeEventListener("storage", syncPlan);
      window.removeEventListener("kintify:plan-change", syncPlan as EventListener);
    };
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const canCreateIncidents = state.role === "admin" || state.role === "engineer" || !state.organization;
  const canResolveIncidents = state.role === "admin" || state.role === "engineer" || !state.organization;
  const canViewEnterprise = state.role === "admin" || state.role === "engineer" || state.role === "viewer";

  const createOrganization = useCallback(async (organizationName: string, initialTeamName: string) => {
    if (!user) {
      return "Sign in to create an organization.";
    }

    try {
      const nextState = await createOrganizationWithTeam(user, organizationName, initialTeamName);
      setState(nextState);
      return null;
    } catch (error) {
      return normalizeError(error, "Could not create organization.");
    }
  }, [user]);

  const updateMemberRole = useCallback(async (userId: string, role: EnterpriseRole) => {
    if (!state.organization) {
      return "Create an organization first.";
    }

    try {
      await updateOrganizationMemberRole(state.organization.id, userId, role);
      await refresh();
      return null;
    } catch (error) {
      return normalizeError(error, "Could not update role.");
    }
  }, [refresh, state.organization]);

  const loadDashboard = useCallback(async () => {
    if (!state.organization) {
      return { error: "No organization selected.", data: null };
    }

    try {
      const data = await getEnterpriseDashboardData(state.organization.id);
      return { error: null, data };
    } catch (error) {
      return { error: normalizeError(error, "Could not load dashboard."), data: null };
    }
  }, [state.organization]);

  const loadIncidentTimeline = useCallback(async (incidentId: string) => {
    try {
      const entries = await listIncidentTimeline(incidentId);
      return { error: null, entries };
    } catch (error) {
      return { error: normalizeError(error, "Could not load incident timeline."), entries: [] };
    }
  }, []);

  const trackAudit = useCallback(async (payload: {
    action: string;
    incidentId?: string | null;
    teamId?: string | null;
    metadata?: Record<string, unknown>;
  }) => {
    if (!user || !state.organization) {
      return;
    }

    try {
      await recordEnterpriseAuditLog({
        userId: user.id,
        userEmail: user.email ?? "",
        action: payload.action,
        organizationId: state.organization.id,
        teamId: payload.teamId ?? (activeWorkspace.kind === "team" ? activeWorkspace.id : null),
        incidentId: payload.incidentId ?? null,
        ...(payload.metadata ? { metadata: payload.metadata } : {}),
      });
    } catch {
      return;
    }
  }, [activeWorkspace, state.organization, user]);

  const exportDashboard = useCallback((format: "csv" | "json" | "report", data: EnterpriseDashboardData) => {
    if (format === "csv") {
      return {
        filename: `${data.organization.name.toLowerCase().replace(/\s+/g, "-")}-incidents.csv`,
        content: exportIncidentsAsCsv(data.incidents),
      };
    }

    if (format === "json") {
      return {
        filename: `${data.organization.name.toLowerCase().replace(/\s+/g, "-")}-incidents.json`,
        content: exportIncidentsAsJson(data.incidents),
      };
    }

    return {
      filename: `${data.organization.name.toLowerCase().replace(/\s+/g, "-")}-weekly-report.txt`,
      content: buildWeeklyReport(data.organization.name, data.metrics, data.incidents),
    };
  }, []);

  const value = useMemo(() => {
    return {
      plan,
      enterpriseEnabled: hasEnterpriseAccess(plan),
      loading,
      state,
      canCreateIncidents,
      canResolveIncidents,
      canViewEnterprise,
      refresh,
      createOrganization,
      updateMemberRole,
      loadDashboard,
      loadIncidentTimeline,
      trackAudit,
      exportDashboard,
    } satisfies EnterpriseContextType;
  }, [canCreateIncidents, canResolveIncidents, canViewEnterprise, createOrganization, exportDashboard, loadDashboard, loadIncidentTimeline, loading, plan, refresh, state, trackAudit, updateMemberRole]);

  return <EnterpriseContext.Provider value={value}>{children}</EnterpriseContext.Provider>;
}

export function useEnterprise() {
  const context = useContext(EnterpriseContext);

  if (context === undefined) {
    throw new Error("useEnterprise must be used within an EnterpriseProvider");
  }

  return context;
}

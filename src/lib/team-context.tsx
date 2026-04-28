"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { hasTeamAccess, readKintifyPlan, type KintifyPlan } from "@/lib/monetization";
import { supabaseAuth } from "@/lib/supabase-auth";
import {
  PERSONAL_WORKSPACE_ID,
  buildPersonalWorkspace,
  createTeamInviteLink,
  createTeamWorkspace,
  joinTeamWorkspace,
  loadWorkspaceState,
  normalizeError,
  persistActiveWorkspace,
  type InviteLinkResult,
  type WorkspaceSummary,
} from "@/lib/team-mode";

type TeamContextType = {
  plan: KintifyPlan;
  workspaces: WorkspaceSummary[];
  activeWorkspace: WorkspaceSummary;
  loading: boolean;
  teamLocked: boolean;
  refresh: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<string | null>;
  createTeam: (name: string) => Promise<string | null>;
  joinTeam: (invite: string) => Promise<string | null>;
  createInvite: (email?: string) => Promise<{ error: string | null; invite: InviteLinkResult | null }>;
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<KintifyPlan>(() => readKintifyPlan());
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([buildPersonalWorkspace()]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(PERSONAL_WORKSPACE_ID);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setWorkspaces([buildPersonalWorkspace()]);
      setActiveWorkspaceId(PERSONAL_WORKSPACE_ID);
      setLoading(false);
      return;
    }

    // Check if Supabase is configured before attempting to load workspace state
    if (!supabaseAuth) {
      console.warn("[Team Context] Supabase not configured - using personal workspace");
      setWorkspaces([buildPersonalWorkspace()]);
      setActiveWorkspaceId(PERSONAL_WORKSPACE_ID);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const nextState = await loadWorkspaceState(user, plan);
      setWorkspaces(nextState.workspaces);
      setActiveWorkspaceId(nextState.activeWorkspaceId);
    } catch {
      setWorkspaces([buildPersonalWorkspace()]);
      setActiveWorkspaceId(PERSONAL_WORKSPACE_ID);
    } finally {
      setLoading(false);
    }
  }, [plan, user]);

  useEffect(() => {
    const syncPlan = () => {
      setPlan(readKintifyPlan());
    };

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

  const switchWorkspace = useCallback(
    async (workspaceId: string) => {
      if (!user) {
        return "Sign in to switch workspaces.";
      }

      try {
        await persistActiveWorkspace(user.id, workspaceId, plan);
        setActiveWorkspaceId(workspaceId);
        await refresh();
        return null;
      } catch (error) {
        return normalizeError(error, "Could not switch workspaces.");
      }
    },
    [plan, refresh, user],
  );

  const createTeam = useCallback(
    async (name: string) => {
      if (!user) {
        return "Sign in to create a team.";
      }

      try {
        const workspace = await createTeamWorkspace(user, name, plan);
        setActiveWorkspaceId(workspace.id);
        await refresh();
        return null;
      } catch (error) {
        return normalizeError(error, "Could not create team.");
      }
    },
    [plan, refresh, user],
  );

  const joinTeam = useCallback(
    async (invite: string) => {
      if (!user) {
        return "Sign in to join a team.";
      }

      try {
        const result = await joinTeamWorkspace(user, invite, plan);
        setActiveWorkspaceId(result.teamId);
        await refresh();
        return null;
      } catch (error) {
        return normalizeError(error, "Could not join team.");
      }
    },
    [plan, refresh, user],
  );

  const activeWorkspace = useMemo(() => {
    return workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? buildPersonalWorkspace();
  }, [activeWorkspaceId, workspaces]);

  const createInvite = useCallback(
    async (email?: string) => {
      if (!user) {
        return {
          error: "Sign in to create an invite.",
          invite: null,
        };
      }

      if (activeWorkspace.kind !== "team") {
        return {
          error: "Switch into a team workspace first.",
          invite: null,
        };
      }

      try {
        const invite = await createTeamInviteLink(user, activeWorkspace.id, email);
        return {
          error: null,
          invite,
        };
      } catch (error) {
        return {
          error: normalizeError(error, "Could not create invite."),
          invite: null,
        };
      }
    },
    [activeWorkspace, user],
  );

  return (
    <TeamContext.Provider
      value={{
        plan,
        workspaces,
        activeWorkspace,
        loading,
        teamLocked: !hasTeamAccess(plan),
        refresh,
        switchWorkspace,
        createTeam,
        joinTeam,
        createInvite,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);

  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }

  return context;
}

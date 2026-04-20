"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, Download, Gauge, Shield, Users, Clock3, FileText } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useEnterprise } from "@/lib/enterprise-context";
import { useTeam } from "@/lib/team-context";

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-400">{hint}</p>
    </div>
  );
}

export default function EnterpriseDashboardPage() {
  const { user } = useAuth();
  const { activeWorkspace } = useTeam();
  const {
    canViewEnterprise,
    enterpriseEnabled,
    exportDashboard,
    loadDashboard,
    state,
    createOrganization,
  } = useEnterprise();
  const [organizationName, setOrganizationName] = useState("");
  const [initialTeamName, setInitialTeamName] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<Awaited<ReturnType<typeof loadDashboard>>["data"]>(null);

  useEffect(() => {
    if (!enterpriseEnabled || !canViewEnterprise || !state.organization) {
      setDashboardData(null);
      return;
    }

    setDashboardLoading(true);
    setDashboardError(null);

    void loadDashboard().then((result) => {
      setDashboardData(result.data);
      setDashboardError(result.error);
      setDashboardLoading(false);
    });
  }, [canViewEnterprise, enterpriseEnabled, loadDashboard, state.organization]);

  const complianceItems = useMemo(() => {
    return [
      "No data resale",
      "Secure processing",
      "Production-safe outputs",
    ];
  }, []);

  const handleCreateOrganization = async () => {
    setFeedback(null);
    const error = await createOrganization(organizationName, initialTeamName);
    if (!error) {
      setOrganizationName("");
      setInitialTeamName("");
      setFeedback("Organization created. Your enterprise workspace is ready.");
      return;
    }

    setFeedback(error);
  };

  const downloadExport = (format: "csv" | "json" | "report") => {
    if (!dashboardData) {
      return;
    }

    const file = exportDashboard(format, dashboardData);
    const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
              <Building2 className="h-3.5 w-3.5" />
              Enterprise Mode
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Incident resolution acceleration system</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
              Measure resolution time, review production-safe incident workflows, and keep audit visibility across your organization.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
            >
              Contact Sales
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              View plans
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Enterprise status</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="text-sm text-zinc-400">Current user</p>
                <p className="mt-2 font-medium text-white">{user?.email ?? "Not signed in"}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="text-sm text-zinc-400">Active workspace</p>
                <p className="mt-2 font-medium text-white">{activeWorkspace.name}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="text-sm text-zinc-400">Organization</p>
                <p className="mt-2 font-medium text-white">{state.organization?.name ?? "Not created yet"}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="text-sm text-zinc-400">Role</p>
                <p className="mt-2 font-medium capitalize text-white">{state.role ?? "No enterprise role"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Compliance posture</h2>
            </div>
            <div className="mt-4 space-y-3">
              {complianceItems.map((item) => (
                <div key={item} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {!enterpriseEnabled ? (
          <div className="mt-8 rounded-3xl border border-indigo-500/20 bg-indigo-500/[0.06] p-6">
            <p className="text-sm font-medium text-white">Enterprise is sold through sales, not self-serve alone.</p>
            <p className="mt-2 text-sm text-zinc-300">
              Upgrade to Enterprise for organizations, audit logs, SLA visibility, exports, and production-safe incident workflows.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400">
                Contact Sales
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white">
                See Enterprise pricing
              </Link>
            </div>
          </div>
        ) : null}

        {enterpriseEnabled && !state.organization ? (
          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Create your organization</h2>
            </div>
            <p className="mt-3 text-sm text-zinc-400">Start with one organization and one default team, then layer teams and users underneath it.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                placeholder="Acme Infrastructure"
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-indigo-500"
              />
              <input
                value={initialTeamName}
                onChange={(event) => setInitialTeamName(event.target.value)}
                placeholder="Platform Team"
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-indigo-500"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleCreateOrganization()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
              >
                Create organization
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {feedback ? <p className="mt-4 text-sm text-zinc-300">{feedback}</p> : null}
          </div>
        ) : null}

        {enterpriseEnabled && canViewEnterprise && state.organization ? (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Average resolution"
                value={dashboardData ? `${dashboardData.metrics.averageResolutionHours.toFixed(1)}h` : "--"}
                hint="Measured from incident created to resolved"
              />
              <MetricCard
                label="Incidents per week"
                value={dashboardData ? String(dashboardData.metrics.incidentsPerWeek) : "--"}
                hint="Rolling seven-day incident volume"
              />
              <MetricCard
                label="Active incidents"
                value={dashboardData ? String(dashboardData.metrics.activeIncidents) : "--"}
                hint="Currently unresolved incidents"
              />
              <MetricCard
                label="Resolved incidents"
                value={dashboardData ? String(dashboardData.metrics.resolvedIncidents) : "--"}
                hint="Closed incidents in this organization"
              />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Recent enterprise activity</h2>
                    <p className="mt-1 text-sm text-zinc-400">Audit-backed visibility into who ran fixes and changed incidents.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => downloadExport("csv")} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white">
                      <Download className="h-4 w-4" /> CSV
                    </button>
                    <button type="button" onClick={() => downloadExport("json")} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white">
                      <Download className="h-4 w-4" /> JSON
                    </button>
                    <button type="button" onClick={() => downloadExport("report")} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white">
                      <FileText className="h-4 w-4" /> Weekly report
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {dashboardLoading ? <p className="text-sm text-zinc-400">Loading dashboard...</p> : null}
                  {dashboardError ? <p className="text-sm text-red-300">{dashboardError}</p> : null}
                  {!dashboardLoading && !dashboardError && dashboardData?.recentActivity.length === 0 ? (
                    <p className="text-sm text-zinc-500">No audit activity yet. Run `/fix` inside your organization to start building the trail.</p>
                  ) : null}
                  {dashboardData?.recentActivity.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">{entry.action}</p>
                          <p className="mt-1 text-xs text-zinc-500">{entry.userEmail}</p>
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="text-lg font-semibold text-white">Organization members</h2>
                <p className="mt-1 text-sm text-zinc-400">RBAC keeps admins in control while viewers stay read-only.</p>
                <div className="mt-5 space-y-3">
                  {state.members.map((member) => (
                    <div key={member.userId} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                      <p className="text-sm font-medium text-white">{member.fullName || member.email}</p>
                      <p className="mt-1 text-xs text-zinc-500">{member.email}</p>
                      <p className="mt-2 text-xs uppercase tracking-wide text-indigo-300">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

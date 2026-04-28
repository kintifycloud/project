"use client";

import { useEffect, useState } from "react";

type Metrics = {
  avgScore: number;
  successRate: number;
  fallbackRate: number;
  totalEvaluations: number;
  modelPerformance: Array<{
    modelName: string;
    successRate: number;
    avgScore: number;
  }>;
};

export default function EvaluationDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const response = await fetch('/api/admin/evaluation');
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to load metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="text-zinc-400">Loading evaluation metrics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="text-red-400">Failed to load metrics</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">Evaluation Dashboard</h1>
        
        {/* Overview Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Evaluations" value={metrics.totalEvaluations} />
          <StatCard label="Average Score" value={`${metrics.avgScore.toFixed(1)}/100`} />
          <StatCard label="Success Rate" value={`${metrics.successRate.toFixed(1)}%`} />
          <StatCard label="Fallback Rate" value={`${metrics.fallbackRate.toFixed(1)}%`} />
        </div>

        {/* Model Performance */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Model Performance</h2>
          <div className="space-y-4">
            {metrics.modelPerformance.map((model) => (
              <ModelPerformanceCard key={model.modelName} model={model} />
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            Refresh Metrics
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-2 text-2xl font-bold text-zinc-100">{value}</div>
    </div>
  );
}

function ModelPerformanceCard({ model }: { model: { modelName: string; successRate: number; avgScore: number } }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/30 p-4">
      <div>
        <div className="font-medium text-zinc-100">{model.modelName}</div>
        <div className="text-sm text-zinc-400">Avg Score: {model.avgScore.toFixed(1)}</div>
      </div>
      <div className="text-right">
        <div className={`text-lg font-semibold ${model.successRate >= 70 ? 'text-green-400' : model.successRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
          {model.successRate.toFixed(1)}%
        </div>
        <div className="text-xs text-zinc-500">Success Rate</div>
      </div>
    </div>
  );
}

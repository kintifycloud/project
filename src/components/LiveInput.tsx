"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play, Square } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import type { LiveResult, LiveRisk } from "@/lib/live";

import { LiveOutput } from "./LiveOutput";

// Mock generator with trend-based values
function generateMockMetrics(): LiveResult {
  const trafficOptions = ["Low", "Moderate", "High", "Very High"];
  const cpuOptions = ["Stable", "Rising", "Falling", "Spike"];
  const memoryOptions = ["Stable", "Rising", "Falling", "Pressure"];
  const errorsOptions = ["Low", "Moderate", "High", "Critical"];

  // Trend-based: not pure random
  const random = Math.random();
  const trend = random > 0.6 ? "increasing" : random > 0.3 ? "stable" : "decreasing";

  const traffic: string = trend === "increasing" ? trafficOptions[Math.min(2 + Math.floor(Math.random() * 2), 3)] ?? "High" : trend === "decreasing" ? trafficOptions[Math.min(0 + Math.floor(Math.random() * 2), 1)] ?? "Low" : trafficOptions[1] ?? "Moderate";
  const cpu: string = trend === "increasing" ? cpuOptions[Math.min(1 + Math.floor(Math.random() * 3), 3)] ?? "Rising" : trend === "decreasing" ? cpuOptions[2] ?? "Falling" : cpuOptions[0] ?? "Stable";
  const memory: string = trend === "increasing" ? memoryOptions[Math.min(1 + Math.floor(Math.random() * 3), 3)] ?? "Rising" : trend === "decreasing" ? memoryOptions[2] ?? "Falling" : memoryOptions[0] ?? "Stable";
  const errors: string = trend === "increasing" ? errorsOptions[Math.min(1 + Math.floor(Math.random() * 3), 3)] ?? "High" : errorsOptions[0] ?? "Low";

  // Determine status and risk based on metrics
  let status = "Stable";
  let risk: LiveRisk = "low";

  if (errors === "Critical" || cpu === "Spike" || memory === "Pressure") {
    status = "Critical";
    risk = "high";
  } else if (traffic === "Very High" || errors === "High" || cpu === "Rising") {
    status = "At Risk";
    risk = "medium";
  } else if (memory === "Rising" || traffic === "High") {
    status = "Degrading";
    risk = "medium";
  }

  const insights = [
    "System is operating within normal parameters. No immediate concerns.",
    "Memory usage is gradually increasing under sustained load. Monitor for pressure.",
    "Traffic spike detected. System is handling the load but may need scaling.",
    "CPU is showing elevated activity. Check for resource-intensive processes.",
    "Error rate is stable. System health is good.",
    "System is experiencing moderate stress but remains functional.",
  ];

  const insight = insights[Math.floor(Math.random() * insights.length)] ?? "System is operating within normal parameters.";

  return {
    metrics: {
      traffic,
      cpu,
      memory,
      errors,
    },
    status,
    insight,
    risk,
  };
};

export function LiveInput() {
  const [input, setInput] = useState("");
  const [liveData, setLiveData] = useState<LiveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function scrollToOutput() {
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  function stopLiveAnalysis() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }

  async function startLiveAnalysis() {
    const trimmed = input.trim();
    setLoading(true);
    setError(null);

    try {
      // If user provided input, try to get insight from API
      let result: LiveResult;
      
      if (trimmed) {
        const res = await fetch("/api/live", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: trimmed }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            // Combine API insight with mock metrics
            const mockMetrics = generateMockMetrics();
            result = {
              ...mockMetrics,
              status: data.status || mockMetrics.status,
              insight: data.insight || mockMetrics.insight,
              risk: data.risk || mockMetrics.risk,
            };
          } else {
            result = generateMockMetrics();
          }
        } else {
          result = generateMockMetrics();
        }
      } else {
        result = generateMockMetrics();
      }

      setLiveData(result);
      setIsRunning(true);
      scrollToOutput();

      // Start auto-refresh every 4 seconds
      intervalRef.current = setInterval(() => {
        const updatedMetrics = generateMockMetrics();
        setLiveData(updatedMetrics);
      }, 4000);

    } catch (err) {
      console.error("Live API error:", err);
      setError("Failed to start live analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const isDisabled = loading;

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-colors focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.07)]">
        <textarea
          className="min-h-[148px] w-full resize-none bg-transparent px-5 py-4 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
          disabled={loading || isRunning}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            "Optional: Paste system description or leave empty for simulated live data…\n\nExample: Production web server cluster handling 5k requests/min"
          }
          value={input}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/60 px-5 py-3">
          <span className="font-mono text-[11px] text-zinc-600">
            {isRunning ? "● Live analysis running" : input.length > 0 ? `${input.length} chars` : "Leave empty for simulation"}
          </span>

          <div className="flex gap-2">
            {isRunning ? (
              <Button
                className="bg-red-600 text-white hover:bg-red-500"
                onClick={stopLiveAnalysis}
                size="sm"
              >
                <Square className="mr-1.5 h-3.5 w-3.5" />
                Stop
              </Button>
            ) : (
              <Button
                className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
                disabled={isDisabled}
                onClick={() => void startLiveAnalysis()}
                size="sm"
              >
                {loading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                )}
                {loading ? "Starting…" : "Start Live Analysis"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div ref={outputRef}>
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="loading"
              transition={{ duration: 0.2 }}
            >
              <LiveOutput loading />
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="error"
              transition={{ duration: 0.2 }}
            >
              <ErrorState message={error} onRetry={() => void startLiveAnalysis()} />
            </motion.div>
          )}

          {!loading && !error && liveData && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="output"
              transition={{ duration: 0.3 }}
            >
              <LiveOutput liveData={liveData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

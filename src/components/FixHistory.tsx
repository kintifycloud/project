"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { getHistory, type HistoryItem } from "@/lib/history";
import { cn } from "@/lib/utils";

type FixHistoryProps = {
  className?: string;
};

export function FixHistory({ className }: FixHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-slate-500" />
        <p className="text-sm font-medium text-slate-400">Recent fixes</p>
      </div>
      <div className="grid gap-2">
        {history.map((entry) => (
          <Link key={entry.id} href={`/history` as never}>
            <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm transition-colors hover:border-white/15 hover:bg-white/[0.06]">
              <CardContent className="p-3 sm:p-4">
                <p className="text-sm text-slate-200">{entry.output}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{entry.input}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

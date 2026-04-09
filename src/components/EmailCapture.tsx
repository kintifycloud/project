"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/analyzer";

type EmailCaptureProps = {
  result: AnalysisResult;
};

export function EmailCapture({ result }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValidEmail || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, result }),
      });

      if (!response.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="rounded-xl border-emerald-400/20 bg-emerald-400/5 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-6">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <p className="text-sm text-emerald-200">
              Saved. We&apos;ll notify you when better fixes are available.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <Mail className="h-4 w-4 text-slate-400" />
          <p className="text-sm font-medium text-white">Want to save this result?</p>
        </div>
        <p className="mb-4 text-xs text-slate-400">Get a copy + future fixes directly.</p>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <input
            aria-label="Email address"
            className="flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/40"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            type="email"
            value={email}
          />
          <Button aria-label="Save result" className="w-full sm:w-auto" disabled={!isValidEmail || submitting} size="sm" type="submit">
            Save &amp; Continue
          </Button>
        </form>
        {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        <p className="mt-3 text-xs text-slate-600">No spam. Only useful fixes.</p>
      </CardContent>
    </Card>
  );
}

"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = "Something went wrong. Try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-col items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-400" />

        <div className="space-y-1">
          <p className="text-sm font-medium text-red-300">{message}</p>
          <p className="font-mono text-xs text-zinc-600">
            Check your input and try again, or paste a different error.
          </p>
        </div>

        {onRetry && (
          <Button
            className="border-red-500/30 bg-transparent text-red-400 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300"
            onClick={onRetry}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Try Again
          </Button>
        )}
      </div>
    </motion.div>
  );
}

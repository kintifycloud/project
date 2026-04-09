"use client";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message = "Something went wrong. Try again.", onRetry }: ErrorStateProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 text-center">
        <p className="text-sm text-rose-300">{message}</p>
        {onRetry && (
          <Button className="mt-4" onClick={onRetry} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

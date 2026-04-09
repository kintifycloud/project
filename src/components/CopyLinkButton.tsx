"use client";

import { useState } from "react";
import { Check, Link } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API may be blocked in some contexts
    }
  }

  return (
    <Button aria-label="Copy link to clipboard" onClick={handleCopy} size="sm" variant="outline">
      {copied ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}

"use client";

import { useEffect } from "react";

function buildStorageKey(slug: string, type: "pageView" | "conversion") {
  return `kintify.generated.${type}.${slug}`;
}

async function sendEvent(slug: string, type: "pageView" | "conversion") {
  await fetch("/api/analytics/fix-page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slug, type }),
    keepalive: true,
  }).catch(() => undefined);
}

export function GeneratedIssueTracker({
  slug,
  source,
  trackConversion = false,
}: {
  slug: string;
  source?: "generated";
  trackConversion?: boolean;
}) {
  useEffect(() => {
    if (source !== "generated" || typeof window === "undefined") {
      return;
    }

    const storageKey = buildStorageKey(slug, "pageView");
    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    window.sessionStorage.setItem(storageKey, "1");
    void sendEvent(slug, "pageView");
  }, [slug, source]);

  useEffect(() => {
    if (!trackConversion || source !== "generated" || typeof window === "undefined") {
      return;
    }

    const storageKey = buildStorageKey(slug, "conversion");
    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    window.sessionStorage.setItem(storageKey, "1");
    void sendEvent(slug, "conversion");
  }, [slug, source, trackConversion]);

  return null;
}

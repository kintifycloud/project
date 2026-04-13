import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Fix Cloud and API Issues | Kintify",
  description:
    "Paste logs, errors, or symptoms to diagnose cloud, API, infrastructure, and runtime issues with Kintify.",
  alternates: {
    canonical: "/fix",
  },
  openGraph: {
    title: "Fix Cloud and API Issues | Kintify",
    description:
      "Paste logs, errors, or symptoms to diagnose cloud, API, infrastructure, and runtime issues with Kintify.",
    url: "https://kintify.cloud/fix",
    siteName: "Kintify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fix Cloud and API Issues | Kintify",
    description:
      "Paste logs, errors, or symptoms to diagnose cloud, API, infrastructure, and runtime issues with Kintify.",
  },
};

export default function FixLayout({ children }: { children: ReactNode }) {
  return children;
}

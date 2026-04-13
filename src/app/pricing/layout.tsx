import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pricing | Kintify",
  description:
    "View Kintify pricing plans for cloud diagnostics, root cause analysis, and infrastructure troubleshooting.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing | Kintify",
    description:
      "View Kintify pricing plans for cloud diagnostics, root cause analysis, and infrastructure troubleshooting.",
    url: "https://kintify.cloud/pricing",
    siteName: "Kintify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Kintify",
    description:
      "View Kintify pricing plans for cloud diagnostics, root cause analysis, and infrastructure troubleshooting.",
  },
};

export default function PricingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

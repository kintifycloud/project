import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Kintify | Cloud Infrastructure Diagnostics",
  description:
    "Learn what Kintify builds for cloud diagnostics, incident response, and infrastructure verification.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Kintify | Cloud Infrastructure Diagnostics",
    description:
      "Learn what Kintify builds for cloud diagnostics, incident response, and infrastructure verification.",
    url: "https://kintify.cloud/about",
    siteName: "Kintify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Kintify | Cloud Infrastructure Diagnostics",
    description:
      "Learn what Kintify builds for cloud diagnostics, incident response, and infrastructure verification.",
  },
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

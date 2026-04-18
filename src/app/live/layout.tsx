import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Live System Signals | Kintify",
  description: "Real-time incident feed showing what needs attention right now.",
  alternates: {
    canonical: "/live",
  },
  openGraph: {
    title: "Live System Signals | Kintify",
    description: "Real-time incident feed showing what needs attention right now.",
    url: "https://kintify.cloud/live",
    siteName: "Kintify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live System Signals | Kintify",
    description: "Real-time incident feed showing what needs attention right now.",
  },
};

export default function LiveLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

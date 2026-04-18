import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "History | Kintify",
  description: "View and reuse past fixes from your incident history.",
  alternates: {
    canonical: "/history",
  },
  openGraph: {
    title: "History | Kintify",
    description: "View and reuse past fixes from your incident history.",
    url: "https://kintify.cloud/history",
    siteName: "Kintify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "History | Kintify",
    description: "View and reuse past fixes from your incident history.",
  },
};

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Execution Steps | Kintify",
  description: "Step-by-step guidance for executing production fixes safely and systematically.",
  alternates: {
    canonical: "/flow",
  },
  openGraph: {
    title: "Execution Steps | Kintify",
    description: "Step-by-step guidance for executing production fixes safely and systematically.",
    url: "https://kintify.cloud/flow",
    siteName: "Kintify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Execution Steps | Kintify",
    description: "Step-by-step guidance for executing production fixes safely and systematically.",
  },
};

export default function FlowLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

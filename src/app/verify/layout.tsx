import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Verify Action | Kintify",
  description: "Validate whether a suggested fix or action is safe before executing it in production.",
  alternates: {
    canonical: "/verify",
  },
  openGraph: {
    title: "Verify Action | Kintify",
    description: "Validate whether a suggested fix or action is safe before executing it in production.",
    url: "https://kintify.cloud/verify",
    siteName: "Kintify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify Action | Kintify",
    description: "Validate whether a suggested fix or action is safe before executing it in production.",
  },
};

export default function VerifyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

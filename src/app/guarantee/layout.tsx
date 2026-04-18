import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Safety Guarantee | Kintify",
  description: "Understand what protects you if a fix fails, before you execute it in production.",
  alternates: {
    canonical: "/guarantee",
  },
  openGraph: {
    title: "Safety Guarantee | Kintify",
    description: "Understand what protects you if a fix fails, before you execute it in production.",
    url: "https://kintify.cloud/guarantee",
    siteName: "Kintify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Safety Guarantee | Kintify",
    description: "Understand what protects you if a fix fails, before you execute it in production.",
  },
};

export default function GuaranteeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

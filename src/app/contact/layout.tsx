import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact Kintify | Infrastructure Support",
  description:
    "Contact Kintify for product questions, support, partnerships, or infrastructure diagnostics inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Kintify | Infrastructure Support",
    description:
      "Contact Kintify for product questions, support, partnerships, or infrastructure diagnostics inquiries.",
    url: "https://kintify.cloud/contact",
    siteName: "Kintify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Kintify | Infrastructure Support",
    description:
      "Contact Kintify for product questions, support, partnerships, or infrastructure diagnostics inquiries.",
  },
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

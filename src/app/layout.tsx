import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kintify.cloud"),
  icons: {
    icon: "/kintify-icone.ico",
  },
  title: "Kintify | Fix, Trace, and Verify Systems Instantly",
  description:
    "Find root cause, apply exact fixes, and verify outcomes instantly. Kintify turns system complexity into provable truth.",
  keywords: [
    "system debugging",
    "root cause analysis",
    "infrastructure verification",
    "log analysis",
    "error fixing",
    "DevOps tools",
    "cloud verification",
    "Verisig",
  ],
  authors: [{ name: "Kintify" }],
  openGraph: {
    title: "Kintify | Fix, Trace and Verify Systems Instantly",
    description:
      "Find root cause, apply exact fixes, and verify outcomes instantly. Kintify turns system complexity into provable truth.",
    url: "https://kintify.cloud",
    siteName: "Kintify",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kintify VeriKernel",
    description:
      "Find root cause, apply exact fixes, and verify outcomes instantly.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://kintify.cloud/#organization",
      name: "Kintify",
      url: "https://kintify.cloud",
      sameAs: ["https://github.com/kintify", "https://x.com/kintify"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://kintify.cloud/#software",
      name: "Kintify VeriKernel",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "0",
        highPrice: "199",
        priceCurrency: "USD",
      },
      description:
        "Cloud system verification platform that makes systems instantly verifiable, explainable, and controllable.",
      featureList: [
        "Root cause analysis",
        "Fix generation",
        "Verisig verification",
        "DNS verification",
        "HTTP header verification",
        "JSON proof generation",
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://kintify.cloud/#webpage",
      url: "https://kintify.cloud",
      name: "Kintify VeriKernel | Fix, Trace, and Verify Systems Instantly",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://kintify.cloud/#website",
        url: "https://kintify.cloud",
        name: "Kintify",
        publisher: { "@id": "https://kintify.cloud/#organization" },
      },
      about: { "@id": "https://kintify.cloud/#software" },
      description:
        "Find root cause, apply exact fixes, and verify outcomes instantly. Kintify turns system complexity into provable truth.",
    },
    {
      "@type": "FAQPage",
      "@id": "https://kintify.cloud/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "How does Kintify find root cause?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Kintify uses advanced AI analysis to parse logs, errors, and system workflows. It identifies patterns and correlations to pinpoint the exact root cause of issues, not just symptoms.",
          },
        },
        {
          "@type": "Question",
          name: "Is this real or AI-generated?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Kintify combines AI analysis with real system verification. Every result is backed by verifiable proofs through our Verisig system, ensuring the analysis is grounded in actual system state.",
          },
        },
        {
          "@type": "Question",
          name: "Can I trust the output?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Kintify provides cryptographic verification through Verisig. Each result includes verifiable proofs that can be checked against your actual system state.",
          },
        },
        {
          "@type": "Question",
          name: "Does it work with production systems?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Kintify works with logs, errors, and workflow descriptions from any system. It analyzes the data you provide and generates verifiable fixes without requiring access to your infrastructure.",
          },
        },
        {
          "@type": "Question",
          name: "What makes Kintify different?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Unlike traditional debugging tools, Kintify provides not just analysis but also verifiable proofs of the fix outcome. Our Verisig system ensures you can always confirm the solution works.",
          },
        },
        {
          "@type": "Question",
          name: "What is Verisig?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Verisig is Kintify's verification layer that generates cryptographic proofs for every fix. It can verify DNS records, HTTP headers, and JSON responses to confirm outcomes.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}

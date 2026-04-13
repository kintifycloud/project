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
  title: "Kintify | Fix Cloud & API Issues Instantly",
  description:
    "Paste logs or errors. Get the most likely cause and next best step instantly. Built for developers fixing real systems.",
  keywords: [
    "cloud debugging",
    "API error fix",
    "root cause analysis",
    "log analysis",
    "Kubernetes debugging",
    "DevOps tools",
    "incident triage",
    "production debugging",
  ],
  authors: [{ name: "Kintify" }],
  creator: "Kintify",
  publisher: "Kintify",
  category: "Technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://kintify.cloud",
  },
  openGraph: {
    title: "Kintify | Fix Cloud & API Issues Instantly",
    description:
      "Paste logs or errors. Get the most likely cause and next best step instantly. Built for developers fixing real systems.",
    url: "https://kintify.cloud",
    siteName: "Kintify",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kintify | Fix Cloud & API Issues Instantly",
    description:
      "Paste logs or errors. Get the most likely cause and next best step instantly.",
    creator: "@kintify",
    site: "@kintify",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Kintify",
      url: "https://kintify.cloud",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description:
        "Paste logs or errors. Get the most likely cause and next best step instantly. Built for developers fixing real systems.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "WebSite",
      url: "https://kintify.cloud",
      name: "Kintify",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}

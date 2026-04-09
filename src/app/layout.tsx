import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";

import "@/app/globals.css";
import { defaultOgImage, siteDescription, siteSchemas, siteTitle, siteUrl } from "@/lib/schemas";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Kintify VeriKernel",
  },
  description: siteDescription,
  applicationName: "Kintify VeriKernel",
  keywords: [
    "Kintify VeriKernel",
    "kintify.cloud",
    "VeriKernel by Kintify",
    "cryptographic cloud trust",
    ".cloud proof injection",
    "live DNS + HTTP proofs",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Kintify VeriKernel",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    creator: "@cloudkintify",
    site: "@cloudkintify",
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/kintify-icone.ico",
    shortcut: "/kintify-icone.ico",
    apple: "/logo.svg",
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060b17",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans text-foreground`}>
        <div className="flex min-h-screen justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-5xl">{children}</div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteSchemas),
          }}
        />
      </body>
    </html>
  );
}

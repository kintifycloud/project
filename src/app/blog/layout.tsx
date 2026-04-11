import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kintify Blog | Cloud Trust, Infrastructure Intelligence, and Reliability Insights",
  description: "Deep technical articles on cloud trust, incident response, verification, and modern infrastructure.",
  openGraph: {
    title: "Kintify Blog | Cloud Trust, Infrastructure Intelligence, and Reliability Insights",
    description: "Deep technical articles on cloud trust, incident response, verification, and modern infrastructure.",
    url: "https://kintify.cloud/blog",
    siteName: "Kintify",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kintify Blog",
    description: "Deep technical articles on cloud trust, incident response, verification, and modern infrastructure.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Kintify Blog",
  description: "Deep technical articles on cloud trust, incident response, verification, and modern infrastructure.",
  url: "https://kintify.cloud/blog",
  publisher: {
    "@type": "Organization",
    name: "Kintify",
    url: "https://kintify.cloud",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}

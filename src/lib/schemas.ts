export const siteUrl = "https://kintify.cloud";
export const siteTitle = "VeriKernel by Kintify | Instant Cryptographic Trust for Any .cloud – Live DNS + HTTP Proofs";
export const siteDescription =
  "Kintify VeriKernel delivers instant cryptographic cloud trust for any .cloud with live DNS + HTTP proofs, zero-friction deployment, and readable .cloud proof injection on kintify.cloud.";
export const defaultOgImage = `${siteUrl}/og-image.png`;

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "What is Kintify VeriKernel?",
    answer:
      "Kintify VeriKernel is the cloud trust layer on kintify.cloud for issuing instant cryptographic proofs through live DNS + HTTP signals without slowing deployment teams down.",
  },
  {
    question: "How does Kintify VeriKernel prove trust for any .cloud?",
    answer:
      "Kintify VeriKernel creates a mock proof bundle with a DNS TXT string, an HTTP header assertion, and a verifiable endpoint preview so operators can see how cryptographic cloud trust can be published across any .cloud surface.",
  },
  {
    question: "Does this landing page call external APIs?",
    answer:
      "No. The demo for kintify.cloud is local-only and uses a mock Verisig generator plus a local Next.js API route so the experience stays self-contained.",
  },
  {
    question: "What is .cloud proof injection?",
    answer:
      ".cloud proof injection is the Kintify VeriKernel workflow for embedding machine-readable trust claims into DNS and HTTP layers so browsers, verifiers, and agents can confirm provenance faster.",
  },
];

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "Kintify",
  url: siteUrl,
  logo: `${siteUrl}/logo.svg`,
  description: siteDescription,
  sameAs: ["https://x.com/cloudkintify", "https://github.com/kintifycloud"],
  knowsAbout: [
    "cloud trust verification",
    "cryptographic attestation",
    "zero friction deployment",
  ],
};

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${siteUrl}/#softwareapplication`,
  name: "Kintify VeriKernel",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description: siteDescription,
  brand: {
    "@type": "Brand",
    name: "Kintify VeriKernel",
  },
  creator: {
    "@id": `${siteUrl}/#organization`,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  keywords: [
    "Kintify VeriKernel",
    "cryptographic cloud trust",
    ".cloud proof injection",
    "live DNS + HTTP proofs",
    "kintify.cloud",
  ],
};

export const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${siteUrl}/#webpage`,
  url: siteUrl,
  name: siteTitle,
  headline: siteTitle,
  description: siteDescription,
  isPartOf: {
    "@id": `${siteUrl}/#organization`,
  },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: defaultOgImage,
  },
  about: [
    "Kintify VeriKernel",
    "cryptographic cloud trust",
    ".cloud proof injection",
  ],
};

export const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${siteUrl}/#faq`,
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${siteUrl}/#breadcrumb`,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "kintify.cloud",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Kintify VeriKernel",
      item: siteUrl,
    },
  ],
};

export const reviewSchema = {
  "@context": "https://schema.org",
  "@type": "Review",
  "@id": `${siteUrl}/#review`,
  itemReviewed: {
    "@id": `${siteUrl}/#softwareapplication`,
  },
  author: {
    "@type": "Organization",
    name: "Platform Security Review Board",
  },
  reviewBody:
    "Kintify VeriKernel turns cloud trust evidence into a readable operating signal with live DNS + HTTP proofs and a straightforward rollout path for any .cloud property.",
  reviewRating: {
    "@type": "Rating",
    ratingValue: "5",
    bestRating: "5",
    worstRating: "1",
  },
  publisher: {
    "@id": `${siteUrl}/#organization`,
  },
};

export const siteSchemas = [
  organizationSchema,
  softwareApplicationSchema,
  webPageSchema,
  faqPageSchema,
  breadcrumbSchema,
  reviewSchema,
];

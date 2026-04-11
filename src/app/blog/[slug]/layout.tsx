import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  // In production, fetch article data based on slug
  const article = {
    title: "Introducing Verisig: Cryptographic Proofs for System Verification",
    description: "Learn how our new verification layer provides mathematical certainty that your fixes actually work in production environments.",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Person",
      name: "Alex Chen",
    },
    datePublished: "2024-01-15T00:00:00Z",
    dateModified: "2024-01-15T00:00:00Z",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://kintify.cloud/blog/${slug}`,
    },
  };

  return {
    title: `${article.title} | Kintify Blog`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://kintify.cloud/blog/${slug}`,
      siteName: "Kintify",
      locale: "en_US",
      type: "article",
      publishedTime: "2024-01-15T00:00:00Z",
      authors: ["Alex Chen"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
    other: {
      "application/ld+json": JSON.stringify(jsonLd),
    },
  };
}

export default function BlogArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: "Introducing Verisig: Cryptographic Proofs for System Verification",
            description: "Learn how our new verification layer provides mathematical certainty that your fixes actually work in production environments.",
            author: {
              "@type": "Person",
              name: "Alex Chen",
            },
            datePublished: "2024-01-15T00:00:00Z",
            dateModified: "2024-01-15T00:00:00Z",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://kintify.cloud/blog/1",
            },
          }),
        }}
      />
      {children}
    </>
  );
}

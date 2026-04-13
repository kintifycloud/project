import type { Metadata } from "next";
import type { ReactNode } from "react";

import { blogPosts, findBlogPost } from "@/lib/blogPosts";
import { siteUrl } from "@/lib/schemas";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = findBlogPost(slug);

  if (!article) {
    return { title: "Not Found" };
  }

  const canonical = `${siteUrl}/blog/${article.slug}`;

  return {
    title: `${article.title} | Kintify Blog`,
    description: article.excerpt,
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonical,
      siteName: "Kintify",
      locale: "en_US",
      type: "article",
      publishedTime: `${article.date}T00:00:00Z`,
      authors: [article.author],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function BlogArticleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = findBlogPost(slug);

  if (!article) {
    return children;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    datePublished: `${article.date}T00:00:00Z`,
    dateModified: `${article.date}T00:00:00Z`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${article.slug}`,
    },
  };

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

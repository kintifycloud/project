import type { MetadataRoute } from "next";

import { blogPosts } from "@/lib/blogPosts";
import { fixProblems } from "@/lib/fixProblems";
import { getIssueCatalog } from "@/lib/issueCatalog";
import { seoEntries } from "@/lib/seoData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://kintify.cloud";
  const issueCatalog = await getIssueCatalog();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/fix`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/api-docs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const seoRoutes: MetadataRoute.Sitemap = seoEntries.map((entry) => ({
    url: `${baseUrl}/fix/${entry.category}/${entry.issue}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const fixProblemRoutes: MetadataRoute.Sitemap = fixProblems.map((p) => ({
    url: `${baseUrl}/fix/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const issueRoutes: MetadataRoute.Sitemap = issueCatalog.allSlugs.map((slug) => ({
    url: `${baseUrl}/fix/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  // Dedupe by URL in case of slug collisions between issues.ts and fixProblems.ts
  const allFixRoutes = [...issueRoutes, ...fixProblemRoutes];
  const seen = new Set<string>();
  const dedupedFixRoutes = allFixRoutes.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  return [
    ...staticRoutes,
    ...seoRoutes,
    ...dedupedFixRoutes,
    ...blogRoutes,
  ];
}

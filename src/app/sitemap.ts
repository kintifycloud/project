import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/schemas";
import { seoEntries } from "@/lib/seoData";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/fix`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/api-docs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const seoRoutes: MetadataRoute.Sitemap = seoEntries.map((entry) => ({
    url: `${siteUrl}/fix/${entry.category}/${entry.issue}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...seoRoutes];
}

import type { MetadataRoute } from "next";

import { seoEntries } from "@/lib/seoData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://kintify.cloud";

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
      url: `${baseUrl}/api-docs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const seoRoutes: MetadataRoute.Sitemap = seoEntries.map((entry) => ({
    url: `${baseUrl}/fix/${entry.category}/${entry.issue}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...seoRoutes];
}

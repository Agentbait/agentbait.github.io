import type { MetadataRoute } from "next";
import { primarySiteUrl } from "./site-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: primarySiteUrl,
      lastModified: "2026-10-07",
      changeFrequency: "monthly",
      priority: 1,
      images: [new URL("og.png", primarySiteUrl).toString()],
    },
    {
      url: new URL("agentbait-paper.pdf", primarySiteUrl).toString(),
      lastModified: "2026-10-06",
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}

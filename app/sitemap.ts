import type { MetadataRoute } from "next";
import { primarySiteUrl } from "./site-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: primarySiteUrl,
    },
  ];
}

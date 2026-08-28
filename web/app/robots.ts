import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

// Allow all crawlers, including AI answer-engine bots, and point them at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

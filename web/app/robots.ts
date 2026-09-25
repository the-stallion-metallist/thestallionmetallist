import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

// Allow all crawlers, including AI answer-engine bots, and point them at the sitemap.
// The team panel (/admin) is private and stays out of search.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

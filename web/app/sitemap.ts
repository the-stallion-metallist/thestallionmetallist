import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { products } from "@/lib/products";
import { allGuides } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "/",
    "/aluminium-can-collection-dehradun",
    "/pet-bottle-collection-dehradun",
    "/bar-restaurant-can-bottle-collection-dehradun",
    "/learn",
    "/non-ferrous-scrap",
    "/services",
    "/about",
    "/contact",
  ];
  const productPaths = products.map((p) => `/${p.slug}`);
  const guidePaths = allGuides.map((g) => `/${g.slug}`);

  return [...staticPaths, ...guidePaths, ...productPaths].map((path) => ({
    url: `${site.url}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}

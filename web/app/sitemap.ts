import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { products } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "/",
    "/aluminium-can-collection-dehradun",
    "/pet-bottle-collection-dehradun",
    "/bar-restaurant-can-bottle-collection-dehradun",
    "/learn/what-is-ubc-scrap",
    "/learn/how-to-recycle-pet-bottles-dehradun",
    "/non-ferrous-scrap",
    "/services",
    "/about",
    "/contact",
  ];
  const productPaths = products.map((p) => `/${p.slug}`);

  return [...staticPaths, ...productPaths].map((path) => ({
    url: `${site.url}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}

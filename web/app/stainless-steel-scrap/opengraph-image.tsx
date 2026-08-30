import { renderOgCard, ogSize, ogContentType } from "@/lib/og";

export const alt = "Stainless steel scrap supplier in India · The Stallion Metallist";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard({ heading: "Stainless scrap", sub: "304 & 316 grades · Supplier in India" });
}

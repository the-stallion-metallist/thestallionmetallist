import { renderOgCard, ogSize, ogContentType } from "@/lib/og";

export const alt = "Copper scrap supplier in India · The Stallion Metallist";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard({ heading: "Copper scrap", sub: "Millberry & bare bright · Supplier in India" });
}

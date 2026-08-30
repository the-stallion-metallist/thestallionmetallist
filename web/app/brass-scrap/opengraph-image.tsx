import { renderOgCard, ogSize, ogContentType } from "@/lib/og";

export const alt = "Brass scrap supplier in India · The Stallion Metallist";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard({ heading: "Brass scrap", sub: "Honey & yellow brass · Supplier in India" });
}

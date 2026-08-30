import { renderOgCard, ogSize, ogContentType } from "@/lib/og";

export const alt = "Aluminium scrap supplier in India · The Stallion Metallist";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard({ heading: "Aluminium scrap", sub: "UBC, Zorba & Twitch · Supplier in India" });
}

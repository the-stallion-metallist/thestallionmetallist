import { renderOgCard, ogSize, ogContentType } from "@/lib/og";

export const alt = "Can and bottle collection for bars and restaurants in Dehradun · The Stallion Metallist";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard({ heading: "Bars & cafes", sub: "Free bins · Paid on the spot" });
}

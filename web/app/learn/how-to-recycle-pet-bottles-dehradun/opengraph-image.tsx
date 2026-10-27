import { renderOgCard, ogSize, ogContentType } from "@/lib/og";

export const alt = "How to recycle PET bottles in Dehradun · The Stallion Metallist";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard({ heading: "Recycle PET", sub: "How it works in Dehradun" });
}

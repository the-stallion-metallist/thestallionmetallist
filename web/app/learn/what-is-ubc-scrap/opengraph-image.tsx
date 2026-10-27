import { renderOgCard, ogSize, ogContentType } from "@/lib/og";

export const alt = "What is UBC scrap? Used beverage cans explained · The Stallion Metallist";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard({ heading: "What is UBC?", sub: "Used beverage cans explained" });
}

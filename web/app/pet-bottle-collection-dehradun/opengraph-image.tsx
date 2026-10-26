import { renderOgCard, ogSize, ogContentType } from "@/lib/og";

export const alt = "Sell PET bottles in Dehradun · The Stallion Metallist";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard({ heading: "PET bottles", sub: "Doorstep pickup in Dehradun · Paid by weight" });
}

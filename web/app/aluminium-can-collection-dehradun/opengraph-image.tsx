import { renderOgCard, ogSize, ogContentType } from "@/lib/og";

export const alt = "Aluminium can collection in Dehradun · The Stallion Metallist";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard({ heading: "Recycle cans in Dehradun", sub: "Doorstep pickup · Paid on collection" });
}

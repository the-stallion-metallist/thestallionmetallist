import { renderOgCard, ogSize, ogContentType } from "@/lib/og";
import { RATE_CAN } from "@/lib/rates";

export const alt = "Aluminium can collection in Dehradun · The Stallion Metallist";
export const size = ogSize;
export const contentType = ogContentType;

// "Rs" not the rupee sign: the card font has no rupee glyph, and a missing glyph
// makes the build fetch an extra font from Google.
export default function Image() {
  return renderOgCard({
    heading: "Recycle cans in Dehradun",
    sub: `${RATE_CAN.replace("₹", "Rs ")} per can · Paid on collection`,
  });
}

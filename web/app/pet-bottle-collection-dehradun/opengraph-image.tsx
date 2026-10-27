import { renderOgCard, ogSize, ogContentType } from "@/lib/og";
import { RATE_PET } from "@/lib/rates";

export const alt = "Sell PET bottles in Dehradun · The Stallion Metallist";
export const size = ogSize;
export const contentType = ogContentType;

// "Rs" not the rupee sign: the card font has no rupee glyph, and a missing glyph
// makes the build fetch an extra font from Google.
export default function Image() {
  return renderOgCard({
    heading: "PET bottles",
    sub: `${RATE_PET.replace("₹", "Rs ")} per kg · Doorstep pickup in Dehradun`,
  });
}

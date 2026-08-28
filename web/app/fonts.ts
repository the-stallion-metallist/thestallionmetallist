import localFont from "next/font/local";

/**
 * Self-hosted brand fonts (same as the UBC PWA): Clash Display for display type,
 * Satoshi for body. Exposed as CSS variables --font-clash / --font-satoshi that
 * globals.css maps to --f-disp / --f-body.
 */
export const clashDisplay = localFont({
  variable: "--font-clash",
  display: "swap",
  src: [
    { path: "./fonts/ClashDisplay-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ClashDisplay-Bold.woff2", weight: "700", style: "normal" },
    // 800 isn't shipped as a file; browsers fall back to the 700 face (matches the mockup).
    { path: "./fonts/ClashDisplay-Bold.woff2", weight: "800", style: "normal" },
  ],
});

export const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [
    { path: "./fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
});

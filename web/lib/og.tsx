import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { site } from "@/lib/content";

/* ============================================================================
 * Shared social-share (Open Graph) card generator — 1200x630.
 * Used by per-page opengraph-image files so links to each grade show a branded
 * card with that grade's name instead of the generic homepage card.
 * ========================================================================== */

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export async function renderOgCard({ heading, sub }: { heading: string; sub: string }) {
  // Manrope (bold + medium) stands in for the display face (Clash/Satoshi are woff2 only,
  // which the image renderer can't use). Fetched at build from Fontsource's stable TTF CDN.
  const [bold, medium] = await Promise.all([
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/manrope@latest/latin-800-normal.ttf").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/manrope@latest/latin-500-normal.ttf").then((r) => r.arrayBuffer()),
  ]);

  const logo = readFileSync(join(process.cwd(), "public/brand/logo-mark.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  // Scale the headline down a little for longer titles so it never wraps oddly.
  const headingSize = heading.length > 16 ? 108 : 132;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 88px",
          background: "#131417",
          position: "relative",
        }}
      >
        {/* copper glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 640,
            height: 640,
            borderRadius: 640,
            background: "radial-gradient(circle, rgba(143,97,58,0.55), rgba(19,20,23,0) 70%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={72} height={73} alt="" />
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, fontWeight: 500, color: "#a99f92" }}>
            THE STALLION METALLIST
          </div>
        </div>

        <div style={{ display: "flex", fontSize: headingSize, lineHeight: 1, fontWeight: 800, letterSpacing: -4, color: "#ece8e0" }}>
          {heading}
        </div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 500, marginTop: 24, color: "#c79363" }}>
          {sub}
        </div>

        <div style={{ display: "flex", width: 132, height: 5, background: "#8f613a", borderRadius: 5, marginTop: 44 }} />
        <div style={{ display: "flex", fontSize: 27, fontWeight: 500, color: "#a99f92", marginTop: 26 }}>
          International non-ferrous scrap trading · {site.location}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Manrope", data: bold, weight: 800, style: "normal" },
        { name: "Manrope", data: medium, weight: 500, style: "normal" },
      ],
    }
  );
}

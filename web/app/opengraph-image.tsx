import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { site } from "@/lib/content";

// Branded 1200x630 card shown when the site is shared on WhatsApp/LinkedIn/X/etc.
export const alt = "The Stallion Metallist · International Non-Ferrous Scrap Trading";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // Manrope (bold + medium) as a stand-in display face for the card (Clash/Satoshi ship only as woff2,
  // which the image renderer can't use). Fetched at build time from Fontsource's stable TTF CDN.
  const [bold, medium] = await Promise.all([
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/manrope@latest/latin-800-normal.ttf").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/manrope@latest/latin-500-normal.ttf").then((r) => r.arrayBuffer()),
  ]);

  const logo = readFileSync(join(process.cwd(), "public/brand/logo-mark.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

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
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 34 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={84} height={85} alt="" />
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, fontWeight: 500, color: "#a99f92" }}>
            THE STALLION METALLIST
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 168, lineHeight: 1, fontWeight: 800, letterSpacing: -4, color: "#ece8e0" }}>
          STALLION
        </div>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 500, marginTop: 22 }}>
          <span style={{ color: "#f3ede4" }}>Raw scrap.&nbsp;</span>
          <span style={{ color: "#c79363" }}>Refined trade.</span>
        </div>

        <div style={{ display: "flex", width: 132, height: 5, background: "#8f613a", borderRadius: 5, marginTop: 40 }} />
        <div style={{ display: "flex", fontSize: 27, fontWeight: 500, color: "#a99f92", marginTop: 26 }}>
          International non-ferrous scrap trading · {site.location}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Manrope", data: bold, weight: 800, style: "normal" },
        { name: "Manrope", data: medium, weight: 500, style: "normal" },
      ],
    }
  );
}

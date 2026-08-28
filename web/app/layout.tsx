import type { Metadata, Viewport } from "next";
import { clashDisplay, satoshi } from "./fonts";
import { site } from "@/lib/content";
import { organizationJsonLd } from "@/lib/jsonld";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — International Metal Scrap Trading`,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "metal scrap trading",
    "ferrous scrap",
    "non-ferrous scrap",
    "HMS 1&2",
    "aluminium UBC",
    "copper scrap India",
    "scrap importer Dehradun",
    "scrap supplier India",
  ],
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#131417",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${clashDisplay.variable} ${satoshi.variable}`}>
      <head>
        {/* Without JS, scroll-reveal elements must still be visible. */}
        <noscript>
          {/* eslint-disable-next-line react/no-danger */}
          <style dangerouslySetInnerHTML={{ __html: ".reveal{opacity:1 !important;transform:none !important}" }} />
        </noscript>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

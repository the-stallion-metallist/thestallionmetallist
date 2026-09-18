import type { Metadata, Viewport } from "next";
import { clashDisplay, satoshi } from "./fonts";
import { site } from "@/lib/content";
import { organizationJsonLd } from "@/lib/jsonld";
import "./globals.css";

// Homepage title + description. The homepage now leads with the can-collection
// service, so its metadata covers BOTH that and the trade, and matches the H1
// ("Cans into cash"). Every other page sets its own title/description, so this
// default only affects the homepage.
const homeTitle = `${site.name} · Cans for Cash & Non-Ferrous Scrap`;
const homeDescription =
  "Get paid for used aluminium cans in Dehradun with doorstep pickup, paid on collection. The Stallion Metallist also trades non-ferrous scrap (aluminium, copper, brass, stainless) internationally.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: homeTitle,
    template: `%s · ${site.shortName}`,
  },
  description: homeDescription,
  applicationName: site.name,
  keywords: [
    "aluminium can collection Dehradun",
    "sell used cans Dehradun",
    "cash for cans",
    "non-ferrous scrap trading",
    "aluminium scrap",
    "aluminium UBC",
    "copper scrap India",
    "brass scrap",
    "stainless steel scrap",
    "scrap importer Dehradun",
    "scrap supplier India",
  ],
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: homeTitle,
    description: homeDescription,
    url: site.url,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: homeDescription,
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

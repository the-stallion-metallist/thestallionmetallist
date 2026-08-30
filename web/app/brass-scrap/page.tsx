import type { Metadata } from "next";
import SiteFrame from "@/components/SiteFrame";
import ProductPage from "@/components/ProductPage";
import { getProduct } from "@/lib/products";

const p = getProduct("brass-scrap");

export const metadata: Metadata = {
  title: { absolute: p.title },
  description: p.description,
  alternates: { canonical: `/${p.slug}` },
  openGraph: { title: p.title, description: p.description, url: `/${p.slug}`, type: "website" },
};

export default function Page() {
  return (
    <SiteFrame>
      <ProductPage slug="brass-scrap" />
    </SiteFrame>
  );
}

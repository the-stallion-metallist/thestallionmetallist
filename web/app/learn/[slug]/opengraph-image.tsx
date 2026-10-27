import { renderOgCard, ogSize, ogContentType } from "@/lib/og";
import { posts, postBySlug } from "@/lib/posts";

export const alt = "A guide from The Stallion Metallist";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug.replace("learn/", "") }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = postBySlug(slug);
  return renderOgCard({ heading: d?.ogHeading ?? "Guides", sub: d?.ogSub ?? "Cans and PET bottles" });
}

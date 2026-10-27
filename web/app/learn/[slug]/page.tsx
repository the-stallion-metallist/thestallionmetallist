import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/GuidePage";
import { guideMetadata } from "@/lib/guides";
import { posts, postBySlug } from "@/lib/posts";

// Posts live in lib/posts.ts. The two older guides keep their own folders.
export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug.replace("learn/", "") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = postBySlug(slug);
  return d ? guideMetadata(d) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = postBySlug(slug);
  if (!d) notFound();
  return <GuidePage d={d} />;
}

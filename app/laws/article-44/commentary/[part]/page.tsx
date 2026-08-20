import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { commentaryParts } from "@/app/legal-data";
import { Article44 } from "@/components/article-44";

export function generateStaticParams() {
  return commentaryParts.map((part) => ({ part: part.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ part: string }> }): Promise<Metadata> {
  const { part: slug } = await params;
  const part = commentaryParts.find((item) => item.slug === slug);
  if (!part) return {};
  const canonical = `/laws/article-44/commentary/${part.slug}/`;
  return {
    title: part.title,
    description: part.description,
    alternates: { canonical },
    robots: part.available ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: part.available ? {
      title: `${part.title} | رقابت‌نامه`,
      description: part.description,
      url: canonical,
      siteName: "رقابت‌نامه",
      locale: "fa_IR",
      type: "article",
      images: [],
    } : undefined,
  };
}

export default async function CommentaryPartPage({ params }: { params: Promise<{ part: string }> }) {
  const { part } = await params;
  if (!commentaryParts.some((item) => item.slug === part)) notFound();
  return <Article44 active="commentary" commentaryPart={part} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { commentaryParts } from "@/app/legal-data";
import { Article44 } from "@/components/article-44";
import { CONTENT_UPDATED_ISO } from "@/lib/site";

export function generateStaticParams() {
  return commentaryParts.filter((part) => part.available).map((part) => ({ part: part.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ part: string }> }): Promise<Metadata> {
  const { part: slug } = await params;
  const part = commentaryParts.find((item) => item.slug === slug);
  if (!part?.available) return {};
  const canonical = `/laws/article-44/commentary/${part.slug}`;
  const title = part.slug === "chapeau" ? part.title : `شرح ${part.shortLabel} ماده ۴۴ | ${part.title}`;
  return {
    title,
    description: part.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | رقابت‌نامه`,
      description: part.description,
      url: canonical,
      siteName: "رقابت‌نامه",
      locale: "fa_IR",
      type: "article",
      modifiedTime: CONTENT_UPDATED_ISO,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${title} | رقابت‌نامه` }],
    },
    twitter: { card: "summary_large_image", title: `${title} | رقابت‌نامه`, description: part.description, images: ["/og.jpg"] },
  };
}

export default async function CommentaryPartPage({ params }: { params: Promise<{ part: string }> }) {
  const { part } = await params;
  if (!commentaryParts.some((item) => item.slug === part && item.available)) notFound();
  return <Article44 active="commentary" commentaryPart={part} />;
}

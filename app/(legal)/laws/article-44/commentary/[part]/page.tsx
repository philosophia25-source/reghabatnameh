import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { commentaryParts } from "@/app/legal-data";
import { LegacyRedirect } from "@/components/legacy-redirect";

export function generateStaticParams() {
  return commentaryParts.filter((part) => part.available).map((part) => ({ part: part.slug }));
}

export const dynamicParams = false;

function destination(part: string) {
  return `/laws/general-policies-44/article-44/commentary/${part}`;
}

export async function generateMetadata({ params }: { params: Promise<{ part: string }> }): Promise<Metadata> {
  const { part } = await params;
  if (!commentaryParts.some((item) => item.slug === part && item.available)) return {};
  return {
    title: "انتقال شرح ماده ۴۴",
    alternates: { canonical: destination(part) },
    robots: { index: false, follow: true },
  };
}

export default async function LegacyCommentaryPartPage({ params }: { params: Promise<{ part: string }> }) {
  const { part } = await params;
  if (!commentaryParts.some((item) => item.slug === part && item.available)) notFound();
  return <LegacyRedirect destination={destination(part)} />;
}

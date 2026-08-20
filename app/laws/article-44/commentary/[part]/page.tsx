import { notFound } from "next/navigation";
import { commentaryParts } from "@/app/legal-data";
import { Article44 } from "@/components/article-44";

export function generateStaticParams() {
  return commentaryParts.map((part) => ({ part: part.slug }));
}

export default async function CommentaryPartPage({ params }: { params: Promise<{ part: string }> }) {
  const { part } = await params;
  if (!commentaryParts.some((item) => item.slug === part)) notFound();
  return <Article44 active="commentary" commentaryPart={part} />;
}

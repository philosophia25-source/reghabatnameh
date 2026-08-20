import { notFound } from "next/navigation";
import { DecisionPage, decisionSlugs, type DecisionSlug } from "@/components/decision-page";

export function generateStaticParams() {
  return decisionSlugs.map((slug) => ({ slug }));
}

export default async function DecisionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!decisionSlugs.includes(slug as DecisionSlug)) notFound();
  return <DecisionPage slug={slug as DecisionSlug} />;
}

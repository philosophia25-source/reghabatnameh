import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DecisionPage, decisionRecords, decisionSlugs, type DecisionSlug } from "@/components/decision-page";

export function generateStaticParams() {
  return decisionSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!decisionSlugs.includes(slug as DecisionSlug)) return {};
  const decision = decisionRecords[slug as DecisionSlug];
  const canonical = `/decisions/${slug}/`;
  return {
    title: decision.title,
    description: decision.relation,
    alternates: { canonical },
    openGraph: {
      title: `${decision.title} | رقابت‌نامه`,
      description: decision.relation,
      url: canonical,
      siteName: "رقابت‌نامه",
      locale: "fa_IR",
      type: "article",
      images: [],
    },
  };
}

export default async function DecisionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!decisionSlugs.includes(slug as DecisionSlug)) notFound();
  return <DecisionPage slug={slug as DecisionSlug} />;
}

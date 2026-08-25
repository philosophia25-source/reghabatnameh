import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decisionDescription, decisionRecords, decisionSlugs } from "@/app/decision-data";
import { DecisionPage } from "@/components/decision-page";
import { CONTENT_UPDATED_ISO } from "@/lib/site";

export function generateStaticParams() {
  return decisionSlugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!decisionSlugs.includes(slug)) return {};
  const decision = decisionRecords[slug];
  const canonical = `/decisions/${slug}`;
  return {
    title: decision.title,
    description: decisionDescription(decision),
    alternates: { canonical },
    openGraph: {
      title: `${decision.title} | رقابت‌نامه`,
      description: decisionDescription(decision),
      url: canonical,
      siteName: "رقابت‌نامه",
      locale: "fa_IR",
      type: "article",
      modifiedTime: CONTENT_UPDATED_ISO,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${decision.title} | رقابت‌نامه` }],
    },
    twitter: { card: "summary_large_image", title: `${decision.title} | رقابت‌نامه`, description: decisionDescription(decision), images: ["/og.jpg"] },
  };
}

export default async function DecisionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!decisionSlugs.includes(slug)) notFound();
  return <DecisionPage slug={slug} />;
}

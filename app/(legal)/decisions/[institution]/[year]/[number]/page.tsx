import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  decisionDescription,
  decisionRecordForRoute,
  decisionStaticParams,
  type DecisionRouteParams,
} from "@/app/decision-data";
import { DecisionPage } from "@/components/decision-page";

export function generateStaticParams() {
  return decisionStaticParams;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<DecisionRouteParams> }): Promise<Metadata> {
  const routeParams = await params;
  const decision = decisionRecordForRoute(routeParams);
  if (!decision) return {};
  const canonical = decision.route;
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
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${decision.title} | رقابت‌نامه` }],
    },
    twitter: { card: "summary_large_image", title: `${decision.title} | رقابت‌نامه`, description: decisionDescription(decision), images: ["/og.jpg"] },
  };
}

export default async function DecisionDetailPage({ params }: { params: Promise<DecisionRouteParams> }) {
  const routeParams = await params;
  const decision = decisionRecordForRoute(routeParams);
  if (!decision) notFound();
  return <DecisionPage slug={decision.slug} />;
}

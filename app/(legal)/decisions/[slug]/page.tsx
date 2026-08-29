import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { legacyDecisionRoutes } from "@/app/decision-data";
import { LegacyRedirect } from "@/components/legacy-redirect";

export function generateStaticParams() {
  return legacyDecisionRoutes.map(({ slug }) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const redirect = legacyDecisionRoutes.find((item) => item.slug === slug);
  if (!redirect) return {};
  return {
    title: "انتقال به نشانی تازه",
    alternates: { canonical: redirect.destination },
    robots: { index: false, follow: true },
  };
}

export default async function DecisionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const redirect = legacyDecisionRoutes.find((item) => item.slug === slug);
  if (!redirect) notFound();
  return <LegacyRedirect destination={redirect.destination} />;
}

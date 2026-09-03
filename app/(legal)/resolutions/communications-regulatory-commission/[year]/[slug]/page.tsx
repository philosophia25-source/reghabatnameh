import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyRedirect } from "@/components/legacy-redirect";
import {
  craResolutionForPath,
  craResolutions,
} from "@/lib/cra/data";

type Params = { year: string; slug: string };

export function generateStaticParams(): Params[] {
  return craResolutions.map((resolution) => ({
    year: resolution.year,
    slug: resolution.slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const resolution = craResolutionForPath(resolved);
  if (!resolution) return {};
  return {
    title: "انتقال به نشانی تازه",
    alternates: { canonical: resolution.route },
    robots: { index: false, follow: true },
  };
}

export default async function LegacyResolutionRoute({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const resolution = craResolutionForPath(resolved);
  if (!resolution) notFound();
  return <LegacyRedirect destination={resolution.route} />;
}

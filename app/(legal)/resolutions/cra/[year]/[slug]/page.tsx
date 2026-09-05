import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyRedirect } from "@/components/legacy-redirect";
import { ResolutionPage } from "@/components/resolution-page";
import {
  craDuplicateResolutionDestinationForPath,
  craResolutionDescription,
  craResolutionForPath,
  craResolutionRouteParams,
} from "@/lib/cra/data";

type Params = { year: string; slug: string };

export function generateStaticParams(): Params[] {
  return craResolutionRouteParams;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const duplicateDestination = craDuplicateResolutionDestinationForPath(resolved);
  if (duplicateDestination) {
    return {
      title: "انتقال به نسخه کامل مصوبه",
      alternates: { canonical: duplicateDestination },
      robots: { index: false, follow: true },
    };
  }
  const resolution = craResolutionForPath(resolved);
  if (!resolution) return {};
  return {
    title: resolution.title,
    description: craResolutionDescription(resolution),
    alternates: { canonical: resolution.route },
  };
}

export default async function ResolutionRoute({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const duplicateDestination = craDuplicateResolutionDestinationForPath(resolved);
  if (duplicateDestination) return <LegacyRedirect destination={duplicateDestination} />;
  const resolution = craResolutionForPath(resolved);
  if (!resolution) notFound();
  return <ResolutionPage resolution={resolution} />;
}

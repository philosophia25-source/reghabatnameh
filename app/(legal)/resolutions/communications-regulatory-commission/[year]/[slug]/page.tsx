import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyRedirect } from "@/components/legacy-redirect";
import {
  craDuplicateResolutionDestinationForPath,
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
  const resolution = craResolutionForPath(resolved);
  const destination = resolution?.route ?? craDuplicateResolutionDestinationForPath(resolved);
  if (!destination) return {};
  return {
    title: "انتقال به نشانی تازه",
    alternates: { canonical: destination },
    robots: { index: false, follow: true },
  };
}

export default async function LegacyResolutionRoute({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const resolution = craResolutionForPath(resolved);
  const destination = resolution?.route ?? craDuplicateResolutionDestinationForPath(resolved);
  if (!destination) notFound();
  return <LegacyRedirect destination={destination} />;
}

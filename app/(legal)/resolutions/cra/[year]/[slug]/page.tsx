import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResolutionPage } from "@/components/resolution-page";
import {
  craResolutionDescription,
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
    title: resolution.title,
    description: craResolutionDescription(resolution),
    alternates: { canonical: resolution.route },
  };
}

export default async function ResolutionRoute({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const resolution = craResolutionForPath(resolved);
  if (!resolution) notFound();
  return <ResolutionPage resolution={resolution} />;
}

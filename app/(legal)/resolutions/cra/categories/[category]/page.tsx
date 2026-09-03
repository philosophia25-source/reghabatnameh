import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResolutionArchive } from "@/components/resolution-archive";
import {
  CRA_ORGANIZATION_ROUTE,
  craCategories,
  craCategoryForSlug,
  craCategoryRoute,
} from "@/lib/cra/categories";
import { craResolutions } from "@/lib/cra/data";

type Params = { category: string };

export function generateStaticParams(): Params[] {
  return craCategories.map((category) => ({ category: category.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = craCategoryForSlug(slug);
  if (!category) return {};
  return {
    title: `${category.name}، مصوبات کمیسیون تنظیم مقررات ارتباطات`,
    description: category.description,
    alternates: { canonical: craCategoryRoute(category) },
  };
}

export default async function CraCategoryPage({ params }: { params: Promise<Params> }) {
  const { category: slug } = await params;
  const category = craCategoryForSlug(slug);
  if (!category) notFound();
  const resolutions = craResolutions.filter((resolution) => resolution.category === category.name);

  return (
    <section className="shell listing-page resolutions-page resolution-category-page">
      <div className="breadcrumbs"><Link href="/resolutions">مصوبات تنظیم‌گران</Link><span>←</span><Link href={CRA_ORGANIZATION_ROUTE}>سازمان تنظیم مقررات</Link><span>←</span><b>{category.name}</b></div>
      <p className="kicker">مصوبات کمیسیون تنظیم مقررات ارتباطات</p>
      <h1>{category.name}</h1>
      <p className="lead">{category.description}. متن مصوبات و روابط ثبت‌شده میان آنها از همین فهرست در دسترس است.</p>
      <ResolutionArchive resolutions={resolutions} showCategoryFilter={false} />
    </section>
  );
}

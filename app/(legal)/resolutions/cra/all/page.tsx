import type { Metadata } from "next";
import Link from "next/link";
import { ResolutionArchive } from "@/components/resolution-archive";
import { CRA_ALL_RESOLUTIONS_ROUTE, CRA_ORGANIZATION_ROUTE } from "@/lib/cra/categories";
import { craResolutions } from "@/lib/cra/data";

export const metadata: Metadata = {
  title: "همه مصوبات کمیسیون تنظیم مقررات ارتباطات",
  description: "فهرست یکپارچه و قابل جست‌وجوی همه مصوبات گردآوری‌شده کمیسیون تنظیم مقررات ارتباطات",
  alternates: { canonical: CRA_ALL_RESOLUTIONS_ROUTE },
};

export default function AllCraResolutionsPage() {
  return (
    <section className="shell listing-page resolutions-page resolution-archive-page">
      <div className="breadcrumbs"><Link href="/resolutions">مصوبات تنظیم‌گران</Link><span>←</span><Link href={CRA_ORGANIZATION_ROUTE}>سازمان تنظیم مقررات</Link></div>
      <p className="kicker">فهرست یکپارچه</p>
      <h1>همه مصوبات کمیسیون تنظیم مقررات ارتباطات</h1>
      <p className="lead">جست‌وجوی هم‌زمان در همه دسته‌ها، سال‌ها و وضعیت‌های مراجعه به سند</p>
      <ResolutionArchive resolutions={craResolutions} />
    </section>
  );
}

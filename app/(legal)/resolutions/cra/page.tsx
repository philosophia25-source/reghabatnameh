import type { Metadata } from "next";
import Link from "next/link";
import { toFaDigits } from "@/app/text";
import {
  CRA_ALL_RESOLUTIONS_ROUTE,
  CRA_ORGANIZATION_ROUTE,
  craCategories,
  craCategoryRoute,
} from "@/lib/cra/categories";
import { craResolutions } from "@/lib/cra/data";

export const metadata: Metadata = {
  title: "سازمان تنظیم مقررات و ارتباطات رادیویی",
  description: "مصوبات کمیسیون تنظیم مقررات ارتباطات بر پایه هفت دسته ثبت‌شده در سامانه اسناد سازمان تنظیم مقررات",
  alternates: { canonical: CRA_ORGANIZATION_ROUTE },
};

export default function CraResolutionsPage() {
  return (
    <section className="shell listing-page knowledge-index-page resolutions-hub-page">
      <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/resolutions">مصوبات تنظیم‌گران</Link></div>
      <p className="kicker">تنظیم‌گر بخشی</p>
      <h1>سازمان تنظیم مقررات و ارتباطات رادیویی</h1>
      <p className="resolution-hub-subtitle">مصوبات کمیسیون تنظیم مقررات ارتباطات</p>
      <p className="lead">دسته‌ها عین پوشه‌های سامانه اسناد سازمان تنظیم مقررات‌اند. با انتخاب هر دسته فقط مصوبات همان بخش نمایش داده می‌شوند.</p>

      <div className="knowledge-card-grid knowledge-card-grid-three cra-category-grid">
        {craCategories.map((category) => {
          const count = craResolutions.filter((resolution) => resolution.category === category.name).length;
          return (
            <Link className="knowledge-card cra-category-card" href={craCategoryRoute(category)} key={category.slug}>
              <small>{toFaDigits(count)} مصوبه</small>
              <h2>{category.name}</h2>
              <p>{category.description}</p>
              <b>مشاهده مصوبات این دسته ←</b>
            </Link>
          );
        })}
      </div>

      <div className="resolution-hub-actions">
        <Link className="read-all-commentary" href={CRA_ALL_RESOLUTIONS_ROUTE}>مشاهده همه مصوبات ←</Link>
      </div>
    </section>
  );
}

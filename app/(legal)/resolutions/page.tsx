import type { Metadata } from "next";
import Link from "next/link";
import { toFaDigits } from "@/app/text";
import { CRA_ORGANIZATION_ROUTE, craCategories } from "@/lib/cra/categories";

export const metadata: Metadata = {
  title: "مصوبات تنظیم‌گران",
  description: "دسترسی به آرشیو مصوبات تنظیم‌گران ایران بر پایه نهاد صادرکننده و دسته‌بندی منبع",
  alternates: { canonical: "/resolutions" },
};

export default function ResolutionsPage() {
  return (
    <section className="shell listing-page knowledge-index-page resolutions-landing-page">
      <p className="kicker">اسناد تنظیم‌گری</p>
      <h1>مصوبات تنظیم‌گران</h1>
      <p className="lead">ابتدا تنظیم‌گر را انتخاب کنید. در صفحه هر تنظیم‌گر، مصوبات بر پایه دسته‌بندی همان منبع رسمی تفکیک شده‌اند.</p>
      <div className="knowledge-card-grid resolution-regulator-grid">
        <Link className="knowledge-card resolution-regulator-card" href={CRA_ORGANIZATION_ROUTE}>
          <small>تنظیم‌گر بخشی</small>
          <h2>سازمان تنظیم مقررات و ارتباطات رادیویی</h2>
          <p>مصوبات کمیسیون تنظیم مقررات ارتباطات در {toFaDigits(craCategories.length)} دسته منبع، همراه با متن قابل جست‌وجو و روابط میان اسناد</p>
          <b>ورود به آرشیو سازمان ←</b>
        </Link>
      </div>
    </section>
  );
}

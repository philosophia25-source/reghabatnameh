import type { Metadata } from "next";
import { SiteSearch } from "@/components/site-search";

export const metadata: Metadata = {
  title: "جست‌وجو",
  description: "جست‌وجو در قوانین، شرح‌ها، آرای منتخب، مصوبات تنظیم‌گری، نهادها، موضوعات و بازارهای رقابت‌نامه",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <section className="shell listing-page search-page">
      <p className="kicker">جست‌وجو در همه منابع</p>
      <h1>جست‌وجو در رقابت‌نامه</h1>
      <p className="lead">قوانین، شرح‌ها، متن آرای منتخب، مصوبات تنظیم‌گری، نهادها، موضوعات و بازارها در یک جست‌وجوی واحد قابل دسترسی‌اند.</p>
      <SiteSearch />
    </section>
  );
}

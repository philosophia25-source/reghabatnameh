import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "قوانین و مقررات",
  description: "متن، ساختار و شرح قوانین و مقررات مرتبط با حقوق رقابت و تنظیم‌گری ایران",
  alternates: { canonical: "/laws" },
};

export default function LawsPage() {
  return (
    <section className="shell listing-page laws-index-page">
      <p className="kicker">پایگاه قوانین</p>
      <h1>قوانین و مقررات</h1>
      <p className="lead">هر قانون به‌عنوان یک مجموعه مستقل منتشر می‌شود و مواد منتخب، شرح‌ها و اسناد مرتبط را در شبکه خود جمع می‌کند.</p>
      <div className="law-index-grid">
        <Link className="law-index-card" href="/laws/general-policies-44">
          <small>قانون اجرای سیاست‌های کلی اصل چهل‌وچهار قانون اساسی</small>
          <span>ق</span>
          <h2>قانون اجرای سیاست‌های کلی اصل ۴۴</h2>
          <p>مواد منتخب مرتبط با رقابت، شرح ماده‌به‌ماده و آرای دارای ارزش تحلیلی</p>
          <b>ورود به مجموعه قانون ←</b>
        </Link>
      </div>
    </section>
  );
}

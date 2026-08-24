import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "قوانین و مقررات",
  description: "متن، ساختار و شرح قوانین و مقررات مرتبط با حقوق رقابت و تنظیم‌گری ایران",
  alternates: { canonical: "/laws/" },
};

export default function LawsPage() {
  return (
    <section className="shell listing-page laws-index-page">
      <p className="kicker">پایگاه قوانین</p>
      <h1>قوانین و مقررات</h1>
      <p className="lead">دسترسی به متن قوانین و شرح ماده‌به‌ماده آن‌ها، همراه با آرای مرتبط شورای رقابت</p>
      <div className="law-index-grid">
        <Link className="law-index-card" href="/laws/article-44/">
          <small>قانون اجرای سیاست‌های کلی اصل چهل‌وچهار قانون اساسی</small>
          <span>۴۴</span>
          <h2>ماده ۴۴</h2>
          <p>توافق‌ها و هماهنگی‌های اخلال‌گر در رقابت، با شرح صدر ماده، هفت بند، تبصره و آرای مرتبط</p>
          <b>ورود به متن و شرح ماده ←</b>
        </Link>
      </div>
    </section>
  );
}

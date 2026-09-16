import type { Metadata } from "next";
import Link from "next/link";
import { COMPETITION_PRINCIPLES_ROUTE } from "@/lib/competition-principles";

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
      <p className="lead">متن کامل قوانین در کنار راهنمای موضوعی، شرح مواد و اسناد مرتبط در دسترس قرار می‌گیرد.</p>
      <div className="law-index-grid">
        <Link className="law-index-card" href="/laws/general-policies-44">
          <small>قانون اجرای سیاست‌های کلی اصل چهل‌وچهار قانون اساسی</small>
          <span>ق</span>
          <h2>قانون اجرای سیاست‌های کلی اصل ۴۴</h2>
          <p>متن کامل و جاری قانون، راهنمای مواد مرتبط با رقابت، شرح‌های تحلیلی و آرای منتخب</p>
          <b>ورود به مجموعه قانون ←</b>
        </Link>
        <Link className="law-index-card principles-index-card" href={COMPETITION_PRINCIPLES_ROUTE}>
          <small>مبانی مشترک شرح و تحلیل مقررات رقابت</small>
          <span>۸</span>
          <h2>اصول عمومی تفسیر و اجرای حقوق رقابت</h2>
          <p>هشت اصل راهنما برای تفسیر مقررات، احراز مسئولیت و انتخاب مداخله متناسب</p>
          <b>مطالعه اصول عمومی ←</b>
        </Link>
      </div>
    </section>
  );
}

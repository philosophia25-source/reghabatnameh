import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "آرای شورای رقابت",
  description: "متن و تحلیل آرای منتخب شورای رقابت و هیئت تجدیدنظر با ارتباط به مواد قانونی",
  alternates: { canonical: "/decisions/" },
  openGraph: {
    title: "آرای شورای رقابت",
    description: "متن و تحلیل آرای منتخب شورای رقابت و هیئت تجدیدنظر",
    url: "/decisions/",
    siteName: "رقابت‌نامه",
    locale: "fa_IR",
    type: "website",
  },
};

const decisions = [
  { href: "/decisions/631/", number: "رأی شماره ۶۳۱", title: "تفاهم انحصاری در زنجیره نخ تایر", relation: "ماده ۴۴ و توافق محدودکننده" },
  { href: "/decisions/437/", number: "رأی شماره ۴۳۷", title: "امتناع ایرانسل از همکاری", relation: "تفکیک رفتار یک‌جانبه از تبانی" },
  { href: "/decisions/sugar/", number: "آرای ۲۹۶ و ۲۹/۹۶/هـ‌ت", title: "بازار شکر و انحصار واردات", relation: "رابطه تصمیم بدوی و تجدیدنظر" },
];

export default function DecisionsPage() {
  return (
    <section className="shell listing-page">
      <p className="kicker">رویه</p>
      <h1>آرای شورای رقابت</h1>
      <p className="lead">آرای منتخب با موضوع، بازار، مواد قانونی مرتبط و پیوند به شرح تحلیلی بررسی می‌شوند.</p>
      <div className="decision-grid">
        {decisions.map((decision) => (
          <Link className="decision-card" href={decision.href} key={decision.href}>
            <span>شورای رقابت</span>
            <h2>{decision.number}</h2>
            <p>{decision.title}<br />{decision.relation}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

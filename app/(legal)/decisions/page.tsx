import type { Metadata } from "next";
import Link from "next/link";
import { decisionIndexRecords } from "@/app/decision-data";
import { toFaDate, toFaDigits } from "@/app/text";

export const metadata: Metadata = {
  title: "آرای شورای رقابت",
  description: "متن و تحلیل آرای منتخب شورای رقابت و هیئت تجدیدنظر با ارتباط به مواد قانونی",
  alternates: { canonical: "/decisions" },
  openGraph: {
    title: "آرای شورای رقابت",
    description: "متن و تحلیل آرای منتخب شورای رقابت و هیئت تجدیدنظر",
    url: "/decisions",
    siteName: "رقابت‌نامه",
    locale: "fa_IR",
    type: "website",
  },
};

export default function DecisionsPage() {
  return (
    <section className="shell listing-page">
      <p className="kicker">رویه</p>
      <h1>آرای شورای رقابت</h1>
      <p className="lead">۲۶ پرونده منتخب مرتبط با ماده ۴۴ با متن کامل، مشخصات تصمیم، نتیجه و پیوند به شرح اجزای ماده در دسترس است.</p>
      <div className="decision-grid">
        {decisionIndexRecords.map((decision) => (
          <Link className="decision-card" href={decision.href} key={decision.href}>
            <span>{decision.authority}</span>
            <h2>{toFaDigits(decision.number)}</h2>
            <p>{decision.title}<br />{toFaDigits(decision.type)} · {toFaDate(decision.date)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

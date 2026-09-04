import type { Metadata } from "next";
import { decisionIndexRecords } from "@/app/decision-data";
import { DecisionExplorer, type DecisionExplorerItem } from "@/components/decision-explorer";

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
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "آرای شورای رقابت | رقابت‌نامه" }],
  },
  twitter: { card: "summary_large_image", title: "آرای شورای رقابت | رقابت‌نامه", description: "متن و تحلیل آرای منتخب شورای رقابت و هیئت تجدیدنظر", images: ["/og.jpg"] },
};

export default function DecisionsPage() {
  const items: DecisionExplorerItem[] = decisionIndexRecords.map((decision) => ({
    href: decision.href,
    title: decision.title,
    number: decision.number,
    authority: decision.authority,
    date: decision.date,
    type: decision.type,
    provisionLabels: decision.provisionLabels,
    topicLabels: decision.topicLabels,
    marketLabels: decision.marketLabels,
  }));
  return (
    <section className="shell listing-page decisions-index-page">
      <p className="kicker">رویه</p>
      <h1>آرای شورای رقابت</h1>
      <p className="lead">مجموعه‌ای گزینشی از آرای دارای ارزش تحلیلی، با متن کامل، نتیجه، منبع رسمی و پیوند به مواد، موضوعات، بازارها و نهاد صادرکننده.</p>
      <DecisionExplorer items={items} />
    </section>
  );
}

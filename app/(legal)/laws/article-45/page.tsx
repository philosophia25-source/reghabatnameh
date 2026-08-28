import type { Metadata } from "next";
import { Article45 } from "@/components/article-45";

export const metadata: Metadata = {
  title: "ماده ۴۵",
  description: "متن و ساختار شرح تحلیلی ماده ۴۵ قانون اجرای سیاست‌های کلی اصل چهل‌وچهار قانون اساسی",
  alternates: { canonical: "/laws/article-45" },
  openGraph: { title: "ماده ۴۵ | رقابت‌نامه", description: "متن، ساختار شرح و آرای مرتبط با ماده ۴۵", url: "/laws/article-45", siteName: "رقابت‌نامه", locale: "fa_IR", type: "article", images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "ماده ۴۵ | رقابت‌نامه" }] },
  twitter: { card: "summary_large_image", title: "ماده ۴۵ | رقابت‌نامه", description: "متن، ساختار شرح و آرای مرتبط با ماده ۴۵", images: ["/og.jpg"] },
};

export default function Article45TextPage() {
  return <Article45 active="text" />;
}

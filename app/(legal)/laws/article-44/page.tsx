import type { Metadata } from "next";
import { Article44 } from "@/components/article-44";

export const metadata: Metadata = {
  title: "ماده ۴۴",
  description: "متن و شرح تحلیلی ماده ۴۴ قانون اجرای سیاست‌های کلی اصل چهل‌وچهار قانون اساسی",
  alternates: { canonical: "/laws/article-44" },
  openGraph: { title: "ماده ۴۴ | رقابت‌نامه", description: "متن، شرح و آرای مرتبط با ماده ۴۴", url: "/laws/article-44", siteName: "رقابت‌نامه", locale: "fa_IR", type: "article", images: [] },
  twitter: { card: "summary", title: "ماده ۴۴ | رقابت‌نامه", description: "متن، شرح و آرای مرتبط با ماده ۴۴", images: [] },
};

export default function Article44TextPage() {
  return <Article44 active="text" />;
}

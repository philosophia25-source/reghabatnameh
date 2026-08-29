import type { Metadata } from "next";
import { Article44 } from "@/components/article-44";

const canonical = "/laws/general-policies-44/article-44";

export const metadata: Metadata = {
  title: "ماده ۴۴",
  description: "متن و شرح تحلیلی ماده ۴۴ قانون اجرای سیاست‌های کلی اصل چهل‌وچهار قانون اساسی",
  alternates: { canonical },
  openGraph: { title: "ماده ۴۴ | رقابت‌نامه", description: "متن، شرح و آرای مرتبط با ماده ۴۴", url: canonical, siteName: "رقابت‌نامه", locale: "fa_IR", type: "article", images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "ماده ۴۴ | رقابت‌نامه" }] },
  twitter: { card: "summary_large_image", title: "ماده ۴۴ | رقابت‌نامه", description: "متن، شرح و آرای مرتبط با ماده ۴۴", images: ["/og.jpg"] },
};

export default function Article44TextPage() {
  return <Article44 active="text" />;
}

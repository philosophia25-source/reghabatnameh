import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article45 } from "@/components/article-45";

const tabMetadata = {
  commentary: {
    title: "شرح ماده ۴۵",
    description: "نقشه جزءبه‌جزء شرح صدر، بندها، اجزا و تبصره ماده ۴۵ قانون اجرای سیاست‌های کلی اصل چهل‌وچهار",
  },
  decisions: {
    title: "آرای مرتبط با ماده ۴۵",
    description: "آرای شورای رقابت و هیئت تجدیدنظر مرتبط با اعمال یک‌جانبه اخلال‌گر موضوع ماده ۴۵",
  },
};

export function generateStaticParams() {
  return [{ tab: "commentary" }, { tab: "decisions" }];
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ tab: string }> }): Promise<Metadata> {
  const { tab } = await params;
  if (tab !== "commentary" && tab !== "decisions") return {};
  const current = tabMetadata[tab];
  const canonical = `/laws/general-policies-44/article-45/${tab}`;
  return {
    title: current.title,
    description: current.description,
    alternates: { canonical },
    openGraph: {
      title: `${current.title} | رقابت‌نامه`,
      description: current.description,
      url: canonical,
      siteName: "رقابت‌نامه",
      locale: "fa_IR",
      type: "article",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${current.title} | رقابت‌نامه` }],
    },
    twitter: { card: "summary_large_image", title: `${current.title} | رقابت‌نامه`, description: current.description, images: ["/og.jpg"] },
  };
}

export default async function Article45TabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  if (tab !== "commentary" && tab !== "decisions") notFound();
  return <Article45 active={tab} />;
}

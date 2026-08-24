import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article44 } from "@/components/article-44";

const tabMetadata = {
  commentary: {
    title: "شرح ماده ۴۴",
    description: "شرح جزءبه‌جزء صدر، بندهای هفت‌گانه و تبصره ماده ۴۴ قانون اجرای سیاست‌های کلی اصل چهل‌وچهار",
  },
  decisions: {
    title: "آرای مرتبط با ماده ۴۴",
    description: "آرای شورای رقابت و هیئت تجدیدنظر مرتبط با توافق‌ها و هماهنگی‌های موضوع ماده ۴۴",
  },
};

export function generateStaticParams() {
  return [{ tab: "commentary" }, { tab: "decisions" }];
}

export async function generateMetadata({ params }: { params: Promise<{ tab: string }> }): Promise<Metadata> {
  const { tab } = await params;
  if (tab !== "commentary" && tab !== "decisions") return {};
  const current = tabMetadata[tab];
  const canonical = `/laws/article-44/${tab}/`;
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
      images: [],
    },
  };
}

export default async function Article44TabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  if (tab !== "commentary" && tab !== "decisions") notFound();
  return <Article44 active={tab} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyRedirect } from "@/components/legacy-redirect";

const tabs = ["commentary", "decisions"] as const;

export function generateStaticParams() {
  return tabs.map((tab) => ({ tab }));
}

export const dynamicParams = false;

function destination(tab: string) {
  return `/laws/general-policies-44/article-45/${tab}`;
}

export async function generateMetadata({ params }: { params: Promise<{ tab: string }> }): Promise<Metadata> {
  const { tab } = await params;
  if (!tabs.includes(tab as typeof tabs[number])) return {};
  return {
    title: "انتقال صفحه ماده ۴۵",
    alternates: { canonical: destination(tab) },
    robots: { index: false, follow: true },
  };
}

export default async function LegacyArticle45TabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  if (!tabs.includes(tab as typeof tabs[number])) notFound();
  return <LegacyRedirect destination={destination(tab)} />;
}

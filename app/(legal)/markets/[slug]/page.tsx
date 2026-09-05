import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedJournalArticles } from "@/components/related-journal-articles";
import { DecisionCollection } from "@/components/decision-collection";
import { documentsForMarket, marketBySlug, publishedMarkets, topicById } from "@/lib/knowledge/queries";

export function generateStaticParams() { return publishedMarkets.map((market) => ({ slug: market.slug })); }

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const market = marketBySlug(slug); if (!market) return {};
  return { title: market.title, description: market.description, alternates: { canonical: market.route } };
}

export default async function MarketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const market = marketBySlug(slug); if (!market) notFound();
  const documents = documentsForMarket(market.id);
  const topics = Array.from(new Set(documents.flatMap((document) => document.topicIds))).map(topicById).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return <><section className="decision-hero knowledge-hero"><div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/markets">بازارها</Link><span>←</span><b>بازار</b></div><p className="eyebrow">بازار و صنعت</p><h1>{market.title}</h1><p>{market.description}</p></section><section className="shell knowledge-detail"><div className="knowledge-summary-grid single"><section><span>موضوعات مرتبط</span><div>{topics.map((topic) => <Link href={topic.route} key={topic.id}>{topic.title}</Link>)}</div></section></div><div className="collection-heading"><p className="eyebrow">اسناد منتخب</p><h2>پرونده‌های این بازار</h2></div><DecisionCollection documentIds={documents.map((document) => document.id)} /></section><RelatedJournalArticles kind="market" id={market.id} /></>;
}

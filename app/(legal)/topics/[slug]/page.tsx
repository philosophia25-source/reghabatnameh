import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DecisionCollection } from "@/components/decision-collection";
import { RelatedJournalArticles } from "@/components/related-journal-articles";
import { documentsForTopic, provisionById, publishedTopics, topicBySlug } from "@/lib/knowledge/queries";

export function generateStaticParams() { return publishedTopics.map((topic) => ({ slug: topic.slug })); }

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const topic = topicBySlug(slug); if (!topic) return {};
  return { title: topic.title, description: topic.description, alternates: { canonical: topic.route } };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const topic = topicBySlug(slug); if (!topic) notFound();
  const documents = documentsForTopic(topic.id);
  const provisions = Array.from(new Set(documents.flatMap((document) => document.provisionLinks.map((link) => link.provisionId))))
    .map(provisionById).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return <>
    <section className="decision-hero knowledge-hero"><div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/topics">موضوعات</Link><span>←</span><b>موضوع</b></div><p className="eyebrow">موضوع حقوقی</p><h1>{topic.title}</h1><p>{topic.description}</p></section>
    <section className="shell knowledge-detail"><div className="knowledge-summary-grid single"><section><span>مواد و اجزای مرتبط</span><div>{provisions.map((provision) => provision.status === "published" ? <Link href={provision.route} key={provision.id}>{provision.label}</Link> : <i key={provision.id}>{provision.label}</i>)}</div></section></div><div className="collection-heading"><p className="eyebrow">اسناد منتخب</p><h2>پرونده‌های مرتبط با این موضوع</h2></div><DecisionCollection documentIds={documents.map((document) => document.id)} /></section>
    <RelatedJournalArticles kind="topic" id={topic.id} />
  </>;
}

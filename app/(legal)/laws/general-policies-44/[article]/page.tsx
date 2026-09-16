import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toFaDigits } from "@/app/text";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { LawArticleText } from "@/components/law-article-text";
import {
  adjacentLawArticles,
  generalPolicies44Law,
  lawArticleBySlug,
  lawArticleRoute,
  lawChapterForArticle,
} from "@/lib/laws/general-policies-44";

type Params = { article: string };

function slugFromParam(value: string) {
  return value.startsWith("article-") ? value.slice("article-".length) : "";
}

export function generateStaticParams(): Params[] {
  return generalPolicies44Law.articleSlugs
    .filter((slug) => slug !== "44" && slug !== "45")
    .map((slug) => ({ article: `article-${slug}` }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { article: param } = await params;
  const article = lawArticleBySlug(slugFromParam(param));
  if (!article) return {};
  const route = lawArticleRoute(article.slug);
  return {
    title: `${toFaDigits(article.label)} قانون اجرای سیاست‌های کلی اصل ۴۴`,
    description: `متن جاری ${toFaDigits(article.label)} قانون اجرای سیاست‌های کلی اصل چهل‌وچهارم قانون اساسی`,
    alternates: { canonical: route },
  };
}

export default async function GeneralPoliciesLawArticlePage({ params }: { params: Promise<Params> }) {
  const { article: param } = await params;
  const article = lawArticleBySlug(slugFromParam(param));
  if (!article || article.slug === "44" || article.slug === "45") notFound();
  const chapter = lawChapterForArticle(article.slug);
  const adjacent = adjacentLawArticles(article.slug);
  const route = lawArticleRoute(article.slug);

  return <>
    <BreadcrumbJsonLd items={[
      { name: "خانه", href: "/" },
      { name: "قوانین و شرح", href: "/laws" },
      { name: generalPolicies44Law.shortTitle, href: "/laws/general-policies-44" },
      { name: toFaDigits(article.label), href: route },
    ]} />
    <section className="legal-hero law-article-hero">
      <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/laws/general-policies-44">{generalPolicies44Law.shortTitle}</Link><span>←</span><b>{toFaDigits(article.label)}</b></div>
      <p className="eyebrow">{chapter?.title}</p>
      <h1>{toFaDigits(article.label)}</h1>
      <p>{generalPolicies44Law.editionLabel}</p>
    </section>
    <section className="legal-content generic-law-article">
      <LawArticleText article={article} standalone />
      <div className="generic-law-meta">
        <span>تصویب قانون <b>{generalPolicies44Law.enactedAt}</b></span>
        <a href={article.sourceUrl} target="_blank" rel="noreferrer">مشاهده منبع متن ↗</a>
      </div>
    </section>
    <nav className="law-pagination" aria-label="حرکت میان مواد">
      {adjacent.previous ? <Link href={lawArticleRoute(adjacent.previous.slug)}><small>ماده قبلی</small><strong>{toFaDigits(adjacent.previous.label)}</strong></Link> : <span />}
      <Link href={`/laws/general-policies-44#article-${article.slug}`}>جایگاه ماده در متن کامل قانون</Link>
      {adjacent.next ? <Link href={lawArticleRoute(adjacent.next.slug)}><small>ماده بعدی</small><strong>{toFaDigits(adjacent.next.label)}</strong></Link> : <span />}
    </nav>
  </>;
}

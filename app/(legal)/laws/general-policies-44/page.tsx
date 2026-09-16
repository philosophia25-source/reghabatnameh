import type { Metadata } from "next";
import Link from "next/link";
import { toFaDigits } from "@/app/text";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { LawArticleText } from "@/components/law-article-text";
import { LawSearch } from "@/components/law-search";
import { legalSources } from "@/lib/knowledge/registry";
import {
  allGeneralPolicies44Articles,
  generalPolicies44Law,
  lawArticleRoute,
} from "@/lib/laws/general-policies-44";

const law = legalSources.find((item) => item.id === "general-policies-44-law")!;
const articles = allGeneralPolicies44Articles();
const articleBySlug = new Map(articles.map((article) => [article.slug, article]));

export const metadata: Metadata = {
  title: law.title,
  description: "متن کامل و جاری قانون اجرای سیاست‌های کلی اصل ۴۴، راهنمای مواد رقابتی، شرح‌ها و آرای مرتبط",
  alternates: { canonical: law.route },
};

export default function GeneralPoliciesLawPage() {
  return <>
    <BreadcrumbJsonLd items={[
      { name: "خانه", href: "/" },
      { name: "قوانین و شرح", href: "/laws" },
      { name: law.shortTitle, href: law.route },
    ]} />
    <section className="decision-hero knowledge-hero law-collection-hero">
      <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/laws">قوانین و شرح</Link><span>←</span><b>متن قانون</b></div>
      <p className="eyebrow">متن کامل قانون</p>
      <h1>{law.shortTitle}</h1>
      <p>متن جاری قانون، همراه با دسترسی مستقیم به مواد و راهنمای موضوعی حقوق رقابت</p>
      <div className="law-meta">
        <span>تاریخ تصویب <b>{generalPolicies44Law.enactedAt}</b></span>
        <span>نسخه متن <b>اصلاحات تا ۱۴۰۲</b></span>
        <span>مواد فعال <b>{toFaDigits(articles.length)}</b></span>
      </div>
    </section>

    <section className="shell law-collection">
      <section className="competition-guide" aria-labelledby="competition-guide-title">
        <div className="competition-guide-intro">
          <p className="eyebrow">راهنمای موضوعی رقابت‌نامه</p>
          <h2 id="competition-guide-title">مسیر مطالعه حقوق رقابت در قانون</h2>
          <p>این راهنما انتخاب تحریریه رقابت‌نامه است و جای فصل‌بندی رسمی قانون را نمی‌گیرد.</p>
        </div>
        <div className="competition-guide-grid">
          {generalPolicies44Law.competitionGuide.map((group) => <article id={`guide-${group.id}`} key={group.id}>
            <h3>{group.title}</h3>
            <p>{group.description}</p>
            <details>
              <summary>مشاهده {toFaDigits(group.articleSlugs.length)} ماده</summary>
              <div className="guide-article-links">
                {group.articleSlugs.map((slug) => {
                  const article = articleBySlug.get(slug);
                  return article ? <a href={`#article-${slug}`} key={slug}>{toFaDigits(article.label)}</a> : null;
                })}
              </div>
            </details>
          </article>)}
        </div>
      </section>

      <LawSearch total={articles.length} />

      <div className="law-reading-layout">
        <aside className="law-table-of-contents">
          <p>فهرست فصل‌ها</p>
          <nav aria-label="فهرست فصل‌های قانون">
            {generalPolicies44Law.chapters.map((chapter) => <a href={`#${chapter.id}`} key={chapter.id}>{chapter.title}</a>)}
          </nav>
          <Link href="/principles/competition-law">اصول عمومی تفسیر حقوق رقابت ←</Link>
        </aside>

        <div className="law-full-text">
          {generalPolicies44Law.chapters.map((chapter) => <section id={chapter.id} data-law-chapter={chapter.id} key={chapter.id}>
            <header className="law-chapter-heading">
              <p>فصل قانون</p>
              <h2>{chapter.title}</h2>
            </header>
            {chapter.articleSlugs.map((slug) => {
              const article = articleBySlug.get(slug);
              return article ? <LawArticleText article={article} key={slug} /> : null;
            })}
          </section>)}
        </div>
      </div>

      <footer className="law-source-note">
        <p>{generalPolicies44Law.editionLabel}</p>
        <a href={generalPolicies44Law.source.url} target="_blank" rel="noreferrer">مشاهده منبع متن در {generalPolicies44Law.source.title} ↗</a>
      </footer>
    </section>
  </>;
}

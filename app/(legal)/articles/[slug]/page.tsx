import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readArticleHtml } from "@/lib/articles";
import { publishedArticles, publishedDocuments, publishedInstitutions, publishedMarkets, publishedTopics } from "@/lib/knowledge/queries";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() { return publishedArticles.map(a => ({ slug: a.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = publishedArticles.find(a => a.slug === slug);
  if (!a) return {};
  return { title: a.title, description: a.abstract.slice(0,180), authors: a.authors.map(x => ({name:x.name})), alternates: { canonical: a.route }, other: { citation_title: a.title, citation_author: a.authors.map(x => x.name), citation_journal_title: a.publication.journal, citation_volume: "13", citation_issue: "3", citation_firstpage: "189", citation_lastpage: "212", citation_doi: a.publication.doi, citation_pdf_url: `${SITE_URL}${a.pdfFile}` } };
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = publishedArticles.find(a => a.slug === slug);
  if (!a) notFound();
  const html = readArticleHtml(a);
  const headings = [...html.matchAll(/<h([23]) id="([^"]+)">([^<]+)<\/h[23]>/g)];
  const p = a.publication;
  const citation = `${a.authors.map(x => x.name).join("؛ ")} (${p.year}). ${a.title}. ${p.journal}، دوره ${p.volume}، شماره ${p.issue}، صص ${p.pages}.`;
  const documents = publishedDocuments.filter(d => a.documentIds.includes(d.id));
  const related = [...publishedInstitutions.filter(x=>a.institutionIds.includes(x.id)).map(x=>({id:x.id,title:x.name,route:x.route})), ...publishedMarkets.filter(x=>a.marketIds.includes(x.id)), ...publishedTopics.filter(x=>a.topicIds.includes(x.id))];
  const toc = <nav aria-label="فهرست مقاله"><a href="#abstract">چکیده</a>{headings.map(h=><a key={h[2]} href={`#${h[2]}`} className={h[1]==="3"?"subheading":""}>{h[3]}</a>)}</nav>;
  return <article className="shell journal-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context":"https://schema.org","@type":"ScholarlyArticle",headline:a.title,abstract:a.abstract,inLanguage:"fa",url:`${SITE_URL}${a.route}`,identifier:p.doi,author:a.authors.map(x=>({"@type":"Person",name:x.name})),isPartOf:{"@type":"PublicationIssue",issueNumber:"3",isPartOf:{"@type":"PublicationVolume",volumeNumber:"13",isPartOf:{"@type":"Periodical",name:p.journal}}}}).replace(/</g,"\\u003c")}} />
    <header className="journal-heading">
      <div className="breadcrumbs"><Link href="/articles">مقالات</Link><span>←</span><b>مقاله پژوهشی</b></div>
      <h1>{a.title}</h1>
      <p className="journal-authors">{a.authors.map(x=>x.name).join(" · ")}</p>
      <p className="journal-origin">بازنشر از فصلنامه {p.journal} · {p.season} {p.year} · دوره {p.volume}، شماره {p.issue} · صفحات {p.pages}</p>
      <div className="journal-actions"><a href={`https://doi.org/${p.doi}`}>نسخه ناشر</a><a href={a.pdfFile}>دریافت PDF مقاله</a><a href="#introduction">متن مقاله</a></div>
      <details className="journal-meta"><summary>مشخصات انتشار و شیوه استناد</summary>
        {a.authors.map(x=><p key={x.name}><strong>{x.name}</strong> · {x.affiliation}{x.corresponding?" · نویسنده مسئول":""}</p>)}
        <p>وابستگی‌های دانشگاهی مطابق زمان انتشار مقاله درج شده‌اند.</p>
        <p>تاریخ دریافت <bdi dir="ltr">{p.received}</bdi> · تاریخ پذیرش <bdi dir="ltr">{p.accepted}</bdi> · شماره پیاپی {p.serial}</p>
        <p>{citation}</p><a href={`https://doi.org/${p.doi}`}><bdi dir="ltr">{p.doi}</bdi></a>
        <p>نسخه چاپی دارای نشان CC BY است. متن برای مطالعه در وب قالب‌بندی شده و با تأیید نویسنده، شماره‌گذاری و محل ارجاع پانوشت‌ها با محتوای آن‌ها هماهنگ شده است. فایل PDF همان نسخه چاپ‌شده است.</p>
      </details>
    </header>
    <div className="journal-layout">
      <aside className="journal-toc"><span>در این مقاله</span>{toc}</aside>
      <div className="journal-reading">
        <details className="journal-mobile-toc"><summary>فهرست مطالب</summary>{toc}</details>
        <section id="abstract"><h2>چکیده</h2><p>{a.abstract}</p><p className="journal-keywords">{a.keywords.join(" · ")}</p></section>
        <div dangerouslySetInnerHTML={{__html:html}} />
      </div>
    </div>
    <section className="journal-related"><h2>مطالعه مرتبط در رقابت‌نامه</h2><div>{related.map(x=><Link key={x.id} href={x.route}>{x.title}</Link>)}</div>
      {documents.length>0 && <><h3>مصوبات مورد بحث مقاله</h3>{documents.map(d=><p key={d.id}><Link href={d.route}>{d.title}</Link></p>)}</>}
    </section>
  </article>;
}

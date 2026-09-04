import type { Metadata } from "next";
import Link from "next/link";
import heroImage from "../../public/hero-tehran.jpg";
import { decisionIndexRecords } from "@/app/decision-data";
import { toFaDigits } from "@/app/text";
import { craResolutions } from "@/lib/cra/data";
import { commentaryParts } from "@/lib/knowledge/article44";
import { documentsForCase, publishedCases, publishedInstitutions } from "@/lib/knowledge/queries";
import { SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "رقابت‌نامه | نادر جعفری",
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "رقابت‌نامه",
    locale: "fa_IR",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "رقابت‌نامه، حقوق رقابت و تنظیم‌گری ایران" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "رقابت‌نامه | نادر جعفری",
    description: SITE_DESCRIPTION,
    images: ["/og.jpg"],
  },
};

const Arrow = () => <span aria-hidden="true">←</span>;

const publishedCommentaryCount = commentaryParts.filter((part) => part.available).length;
const quickAccess = [
  { label: "شرح ماده ۴۴", detail: `${toFaDigits(publishedCommentaryCount)} بخش شرح منتشرشده`, href: "/laws/general-policies-44/article-44" },
  { label: "آرای منتخب", detail: `${toFaDigits(decisionIndexRecords.length)} رأی و پرونده گزینشی`, href: "/decisions" },
  { label: "نهادها", detail: `${toFaDigits(publishedInstitutions.length)} نهاد دارای سند`, href: "/institutions" },
  { label: "مصوبات تنظیم‌گری", detail: `${toFaDigits(craResolutions.length)} مصوبه در آرشیو جامع کمیسیون`, href: "/resolutions/cra" },
];

const articleTones = ["arch-one", "arch-two", "arch-three"];
const articles = ["clause-3", "clause-4", "clause-5"].flatMap((slug, index) => {
  const part = commentaryParts.find((item) => item.slug === slug && item.available);
  return part ? [{
    tone: articleTones[index],
    category: `شرح ${part.shortLabel}`,
    title: part.title,
    summary: part.description,
    type: "شرح ماده",
    context: "ماده ۴۴",
    href: `/laws/general-policies-44/article-44/commentary/${part.slug}`,
  }] : [];
});

const featuredDecisions = ["631", "437"].flatMap((slug) => {
  const decision = decisionIndexRecords.find((item) => item.slug === slug);
  return decision ? [{
    href: decision.href,
    label: `رأی شماره ${toFaDigits(decision.number)}`,
    title: decision.title,
    detail: decision.provisionLabels.slice(0, 2).join(" · ") || decision.authority,
  }] : [];
});

const featuredCase = publishedCases.find((item) => item.slug === "sugar-import-market");
const featuredCaseDecisions = featuredCase
  ? documentsForCase(featuredCase.id).flatMap((document) => {
      const decision = decisionIndexRecords.find((item) => item.id === document.id);
      return decision ? [decision] : [];
    })
  : [];
const featuredCaseNumbers = featuredCaseDecisions
  .map((decision) => decision.number.replace(/^رأی\s*/u, ""))
  .join(" و ");
const featuredCaseItem = featuredCase && featuredCaseNumbers ? {
  href: featuredCase.route,
  label: `آرای ${toFaDigits(featuredCaseNumbers)}`,
  title: featuredCase.title,
  detail: Array.from(new Set(featuredCaseDecisions.flatMap((decision) => decision.provisionLabels))).join(" · "),
} : undefined;
const decisionFeatures = [...featuredDecisions, ...(featuredCaseItem ? [featuredCaseItem] : [])];

export default function HomePage() {
  return (
    <>
      <section className="hero" id="top">
        <div className="hero-backdrop" aria-hidden="true" style={{ backgroundImage: `url(${heroImage.src})` }} />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="hero-kicker">پایگاه یکپارچه حقوق رقابت و تنظیم‌گری ایران</p>
          <h1>رقابت‌نامه</h1>
          <h2>قانون، رأی، مصوبه و تحلیل مرتبط را یکجا پیدا کنید</h2>
          <p>متون رسمی قابل جست‌وجو، آرای منتخب، شرح مواد قانونی و ارتباط هر سند با موضوعات، بازارها و نهادهای مرتبط</p>
          <form className="hero-search" action="/search" method="get" role="search">
            <label htmlFor="home-search">جست‌وجو در همه منابع</label>
            <div>
              <input id="home-search" name="q" type="search" placeholder="موضوع، شماره رأی، مصوبه یا ماده قانونی" />
              <button type="submit">جست‌وجو</button>
            </div>
          </form>
        </div>
        <nav className="hero-access" aria-label="دسترسی سریع به محتوای حقوقی">
          {quickAccess.map((item) => (
            <Link href={item.href} key={item.href}>
              <small>{item.detail}</small>
              <strong>{item.label}</strong>
              <Arrow />
            </Link>
          ))}
        </nav>
        <a className="scroll-cue" href="#analysis"><span>مشاهده مطالب</span><i>⌄</i></a>
      </section>

      <section className="insights shell" id="analysis">
        <div className="latest">
          <div className="section-title section-title-with-link"><span>شرح‌های منتخب</span><i /><Link href="/search">جست‌وجو در همه منابع <Arrow /></Link></div>
          <div className="article-grid">
            {articles.map((article) => (
              <Link className="article-card" href={article.href} key={article.title}>
                <div className={`article-image ${article.tone}`}><span>{article.category}</span></div>
                <div className="article-copy">
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <div className="article-meta"><span>{article.type}</span><span>{article.context}</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="decision-section shell" id="decisions">
        <div className="decision-heading">
          <p>پرونده‌خوانی‌های منتخب</p><h2>آرای شورای رقابت، با زمینه و تحلیل</h2>
          <span>متن رأی به‌تنهایی کافی نیست. هر پرونده با کلیدواژه‌ها، سابقه و یادداشت تحلیلی خوانده می‌شود.</span>
        </div>
        <div className="decision-list">
          {decisionFeatures.map((item) => (
            <Link href={item.href} key={item.href}><small>{item.label}</small><strong>{item.title}</strong><span>{item.detail}</span><Arrow /></Link>
          ))}
        </div>
      </section>

      <section className="research shell">
        <p>پژوهش جاری</p>
        <h2>محشی قانون اجرای سیاست‌های کلی اصل چهل‌وچهار</h2>
        <span>خوانشی ماده‌به‌ماده از حقوق رقابت ایران، با اتصال هر شرح به آرای منتخب، موضوعات و بازارهای مرتبط</span>
        <Link href="/laws/general-policies-44/article-44">مطالعه ماده ۴۴ <Arrow /></Link>
      </section>
    </>
  );
}

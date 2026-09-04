import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import {
  article45Chapeau,
  article45CommentaryParts,
  article45Sections,
  type Article45Part,
} from "@/lib/knowledge/article45";
import { article45DecisionIndexRecords } from "@/app/decision-data";
import { toFaDigits } from "@/app/text";
import { Article45Commentary } from "@/components/article-45-commentary";

type Tab = "text" | "commentary" | "decisions";

const publishedCommentaryCount = article45CommentaryParts.filter((part) => part.available).length;

const tabs: { key: Tab; label: string; href: string; count?: string }[] = [
  { key: "text", label: "متن ماده", href: "/laws/general-policies-44/article-45" },
  { key: "commentary", label: "شرح", href: "/laws/general-policies-44/article-45/commentary", count: toFaDigits(publishedCommentaryCount) },
  { key: "decisions", label: "آرای ماده ۴۵", href: "/laws/general-policies-44/article-45/decisions", count: toFaDigits(article45DecisionIndexRecords.length) },
];

function partBySlug(slug: string) {
  return article45CommentaryParts.find((part) => part.slug === slug);
}

function LawUnit({ part, children, className = "" }: { part: Article45Part; children: React.ReactNode; className?: string }) {
  const classes = `law-unit ${className} ${part.available ? "" : "unavailable"}`.trim();
  if (part.available) {
    return <Link className={classes} href={`/laws/general-policies-44/article-45/commentary/${part.slug}`}>
      <span>{children}</span>
      <small>مطالعه شرح {part.shortLabel} ←</small>
    </Link>;
  }
  return <span className={classes} aria-disabled="true">
    <span>{children}</span>
    <small>شرح {part.shortLabel} هنوز منتشر نشده است</small>
  </span>;
}

function LawText() {
  const chapeau = partBySlug("chapeau")!;
  return (
    <article className="law-text-card clickable-law article-45-text">
      <div className="law-number">۴۵</div>
      <div>
        <LawUnit part={chapeau} className="law-lead">
          <strong>ماده ۴۵</strong> ـ {article45Chapeau}
        </LawUnit>
        <div className="article-45-sections">
          {article45Sections.map((section) => {
            const sectionPart = partBySlug(section.slug)!;
            return <section className="article-45-section" key={section.slug}>
              <LawUnit part={sectionPart} className="article-45-section-head">
                <strong>{section.letter}</strong> ـ {section.title}
                {section.lead ? <em>{section.lead}</em> : null}
              </LawUnit>
              {section.items?.length ? <ol className="article-45-items">
                {section.items.map((item) => {
                  const itemPart = partBySlug(item.slug)!;
                  return <li key={item.slug}>
                    <LawUnit part={itemPart}>
                      <b>{item.number}</b> ـ {item.text}
                    </LawUnit>
                  </li>;
                })}
              </ol> : null}
              {section.note ? <LawUnit part={partBySlug(section.note.slug)!} className="law-note article-45-note">
                <strong>تبصره</strong> ـ {section.note.text}
              </LawUnit> : null}
            </section>;
          })}
        </div>
      </div>
    </article>
  );
}

function PartCard({ part, index }: { part: Article45Part; index: number }) {
  const content = <>
    <span className="part-index">{toFaDigits(index + 1)}</span>
    <small>{part.shortLabel}</small>
    <h3>{part.title}</h3>
    <p>{part.description}</p>
    <b>{part.available ? "مطالعه شرح ←" : "شرح هنوز منتشر نشده است"}</b>
  </>;
  return part.available
    ? <Link className="part-card available" href={`/laws/general-policies-44/article-45/commentary/${part.slug}`}>{content}</Link>
    : <article className="part-card" aria-disabled="true">{content}</article>;
}

function CommentaryIndex() {
  const chapeau = partBySlug("chapeau")!;
  let runningIndex = 1;
  return <div className="commentary-index article-45-commentary-index">
    <div className="index-intro">
      <p className="eyebrow">شرح جزءبه‌جزء</p>
      <h2>نقشه شرح ماده ۴۵</h2>
      <p>ساختار ماده در قالب صدر، بندها، اجزا و تبصره نمایش داده شده است. صفحه مستقل هر بخش پس از تکمیل محشی و احراز استقلال تحلیلی آن منتشر می‌شود.</p>
    </div>
    <section className="article-45-commentary-group">
      <h3>صدر ماده</h3>
      <div className="part-grid part-grid-single"><PartCard part={chapeau} index={0} /></div>
    </section>
    {article45Sections.map((section) => {
      const parts = article45CommentaryParts.filter((part) => part.slug === section.slug || part.parentSlug === section.slug);
      const startIndex = runningIndex;
      runningIndex += parts.length;
      return <section className="article-45-commentary-group" key={section.slug}>
        <div className="article-45-commentary-heading"><small>بند {section.letter}</small><h3>{section.title}</h3></div>
        <div className="part-grid">
          {parts.map((part, index) => <PartCard part={part} index={startIndex + index} key={part.slug} />)}
        </div>
      </section>;
    })}
  </div>;
}

function Decisions() {
  return <div className="related-decisions">
    <div className="decisions-intro">
      <p>آرای ماده ۴۵ به‌تدریج پس از دسته‌بندی و کنترل جایگاه هر رأی به اجزای دقیق ماده متصل می‌شوند.</p>
      <span>در حال حاضر {toFaDigits(article45DecisionIndexRecords.length)} پرونده طبقه‌بندی‌شده در دسترس است.</span>
    </div>
    <div className="decision-cards">
      {article45DecisionIndexRecords.map((decision) => <Link className="decision-reference ready" href={decision.href} key={decision.slug}>
        <small>رأی {toFaDigits(decision.number)}</small>
        <h3>{decision.title}</h3>
        <p>{toFaDigits(decision.type)} · {decision.authority}</p>
        <span>مشاهده پرونده ←</span>
      </Link>)}
    </div>
  </div>;
}

export function Article45({ active, commentaryPart }: { active: Tab; commentaryPart?: string }) {
  const currentPart = commentaryPart ? article45CommentaryParts.find((part) => part.slug === commentaryPart) : undefined;
  const currentRoute = currentPart
    ? `/laws/general-policies-44/article-45/commentary/${currentPart.slug}`
    : active === "commentary"
      ? "/laws/general-policies-44/article-45/commentary"
      : active === "decisions"
        ? "/laws/general-policies-44/article-45/decisions"
        : "/laws/general-policies-44/article-45";
  const currentLabel = currentPart
    ? (currentPart.slug === "chapeau" ? currentPart.title : `شرح ${currentPart.shortLabel} ماده ۴۵`)
    : active === "commentary" ? "شرح ماده ۴۵" : active === "decisions" ? "آرای ماده ۴۵" : "ماده ۴۵";
  return <>
    <BreadcrumbJsonLd items={[
      { name: "خانه", href: "/" },
      { name: "قوانین و شرح", href: "/laws" },
      { name: "قانون اجرای سیاست‌های کلی اصل ۴۴", href: "/laws/general-policies-44" },
      { name: currentLabel, href: currentRoute },
    ]} />
    <section className="legal-hero">
      <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/laws/general-policies-44">قانون اجرای سیاست‌های کلی اصل ۴۴</Link><span>←</span><b>ماده ۴۵</b></div>
      <p className="eyebrow">قانون اجرای سیاست‌های کلی اصل چهل‌وچهار قانون اساسی</p>
      <h1>ماده ۴۵</h1>
      <p>اعمال یک‌جانبه اخلال‌گر در رقابت</p>
      <div className="law-meta"><span>نوع محتوا <b>قانون و شرح</b></span><span>نویسنده شرح <b>نادر جعفری</b></span><span>شرح منتشرشده <b>{toFaDigits(publishedCommentaryCount)} بخش</b></span></div>
    </section>
    <nav className="legal-tabs" aria-label="بخش‌های ماده ۴۵">
      {tabs.map((tab) => <Link className={active === tab.key ? "active" : ""} aria-current={active === tab.key ? "page" : undefined} href={tab.href} key={tab.key}>{tab.label}{tab.count ? <small>{tab.count}</small> : null}</Link>)}
    </nav>
    <section className="legal-content">
      {active === "text" ? <LawText /> : null}
      {active === "commentary" && !commentaryPart ? <CommentaryIndex /> : null}
      {active === "commentary" && commentaryPart ? <Article45Commentary slug={commentaryPart} /> : null}
      {active === "decisions" ? <Decisions /> : null}
    </section>
    <nav className="law-pagination" aria-label="حرکت میان مواد"><Link href="/laws/general-policies-44/article-44">ماده ۴۴</Link><Link href="/laws/general-policies-44">بازگشت به مجموعه قانون</Link><span>ماده بعدی</span></nav>
  </>;
}

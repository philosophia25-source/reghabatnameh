import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  article44Note,
  article44Paragraphs,
  commentaryParts,
} from "@/app/legal-data";
import { article44DecisionIndexRecords, decisionRouteByMention } from "@/app/decision-data";
import { toFaDigits } from "@/app/text";
import { EditorialMeta } from "@/components/editorial-meta";
import { JsonLd } from "@/components/json-ld";
import { AUTHOR, CONTENT_UPDATED_FA, CONTENT_UPDATED_ISO, SITE_NAME, SITE_URL } from "@/lib/site";

function commentaryFile(slug: string) {
  return slug === "chapeau" ? "commentary44.md" : `commentary44-${slug}.md`;
}

type Tab = "text" | "commentary" | "decisions";

const tabs: { key: Tab; label: string; href: string; count?: string }[] = [
  { key: "text", label: "متن ماده", href: "/laws/article-44" },
  { key: "commentary", label: "شرح", href: "/laws/article-44/commentary", count: "۹" },
  { key: "decisions", label: "آرای ماده ۴۴", href: "/laws/article-44/decisions", count: toFaDigits(article44DecisionIndexRecords.length) },
];

function clean(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/\\([*])/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

function plainHeading(text: string) {
  return toFaDigits(clean(text).replace(/\[\\?\[(\d+)\\?\]\]\(#_ftn\d+\)/g, "").trim());
}

function linkedText(text: string) {
  const mentions = Object.keys(decisionRouteByMention).sort((a, b) => b.length - a.length);
  const normalized = clean(text).replace(/\[\\?\[(\d+)\\?\]\]\(#_ftn\d+\)/g, "[[FN:$1]]");
  const markdownLink = "\\[[^\\]]+\\]\\((?:https?:\\/\\/|\\/)[^\\s)]+\\)";
  const escapedMentions = mentions.map((mention) => mention.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(\\[\\[FN:\\d+\\]\\]|${markdownLink}|${escapedMentions.join("|")})`, "g");
  return normalized.split(pattern).map((part, index) => {
    const footnote = part.match(/^\[\[FN:(\d+)\]\]$/);
    if (footnote) {
      return <sup className="footnote-ref" id={`footnote-ref-${footnote[1]}`} key={`${part}-${index}`}><a href={`#footnote-${footnote[1]}`} aria-label={`رفتن به زیرنویس ${toFaDigits(footnote[1])}`}>{toFaDigits(footnote[1])}</a></sup>;
    }
    const source = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)$/);
    if (source) {
      if (source[2].startsWith("/")) {
        return <Link className="inline-decision" href={source[2]} key={`${part}-${index}`}>{toFaDigits(source[1].trim())}</Link>;
      }
      return <a className="inline-source" href={source[2]} target="_blank" rel="noreferrer" key={`${part}-${index}`}>{toFaDigits(source[1].trim())}</a>;
    }
    const href = decisionRouteByMention[part];
    return href ? <Link className="inline-decision" href={href} key={`${part}-${index}`}>{toFaDigits(part)}</Link> : toFaDigits(part);
  });
}

function referencedDecisionCount(commentary: string) {
  const routes = new Set(
    Array.from(commentary.matchAll(/\]\((\/decisions\/[^)\s]+)\)/g), (match) => match[1]),
  );
  Object.entries(decisionRouteByMention).forEach(([mention, route]) => {
    if (commentary.includes(mention)) routes.add(route);
  });
  return article44DecisionIndexRecords.filter((decision) => routes.has(decision.href)).length;
}

function PartsNav({ current }: { current?: string }) {
  return (
    <aside className="parts-nav">
      <p>اجزای ماده ۴۴</p>
      <ol>
        {commentaryParts.map((part, index) => (
          <li className={current === part.slug ? "active" : ""} key={part.slug}>
            {part.available ? <Link className="parts-nav-link" href={`/laws/article-44/commentary/${part.slug}`}>
              <span>{toFaDigits(index + 1)}</span>
              <div><small>{part.shortLabel}</small><strong>{part.title}</strong></div>
            </Link> : <span className="parts-nav-link unavailable" aria-disabled="true">
              <span>{toFaDigits(index + 1)}</span>
              <div><small>{part.shortLabel}</small><strong>{part.title}</strong></div>
              <i>به‌زودی</i>
            </span>}
          </li>
        ))}
      </ol>
    </aside>
  );
}

function CommentaryBody({ slug }: { slug: string }) {
  const part = commentaryParts.find((item) => item.slug === slug);
  if (!part) return null;
  const commentary = readFileSync(join(process.cwd(), "content", commentaryFile(slug)), "utf8");
  const [commentaryMain, commentaryFootnotes = ""] = commentary.split(/\n---\n/, 2);
  const sections = commentaryMain.split(/\n(?=\*\*\d+\.)/).map((section) => section.trim()).filter(Boolean);
  const tocSections = sections.slice(1, 11);
  const footnotes = Array.from(commentaryFootnotes.matchAll(/\[\\?\[(\d+)\\?\]\]\(#_ftnref\d+\)\s*([\s\S]*?)(?=\n\n\[\\?\[\d+|$)/g)).map((match) => ({
    number: match[1],
    text: match[2].trim(),
  }));
  const decisionCount = referencedDecisionCount(commentaryMain);
  const displayTitle = slug === "chapeau" ? "شرح صدر ماده ۴۴" : `شرح ${part.shortLabel} ماده ۴۴`;

  return (
    <article className="commentary-body">
      <div className="commentary-title-row">
        <p className="commentary-kicker">شرح نادر جعفری</p>
        <h2>{displayTitle}</h2>
        <p>{part.title}، {part.description}</p>
      </div>
      <EditorialMeta citation={`${AUTHOR.name}، «${displayTitle}»، ${SITE_NAME}، آخرین به‌روزرسانی ${CONTENT_UPDATED_FA}، ${SITE_URL}/laws/article-44/commentary/${slug}`} />
      {decisionCount ? <div className="commentary-decision-count">
        <span>آرای پیوندشده در این شرح</span>
        <strong>{toFaDigits(decisionCount)} پرونده</strong>
        <small>فقط پرونده‌های دارای صفحه در رقابت‌نامه شمرده شده‌اند</small>
      </div> : null}
      {tocSections.length ? <details className="commentary-on-page">
        <summary>فهرست مطالب این شرح</summary>
        <ol>
          {tocSections.map((section) => {
            const heading = clean(section.split("\n")[0]);
            const id = `section-${heading.match(/^\d+/)?.[0] ?? "intro"}`;
            return <li key={id}><a href={`#${id}`}>{plainHeading(heading.replace(/^\d+\.\s*/, ""))}</a></li>;
          })}
        </ol>
      </details> : null}
      {sections.map((section, index) => {
        const lines = section.split("\n").filter((line) => line.trim());
        const headingLine = lines[0];
        const hasHeading = /^\*\*/.test(headingLine);
        const heading = hasHeading ? clean(headingLine) : "شرح صدر ماده ۴۴";
        const id = index === 0 ? "commentary-start" : `section-${heading.match(/^\d+/)?.[0] ?? index}`;
        const paragraphs = (hasHeading ? lines.slice(1) : lines).filter((line) => line !== "---");
        return (
          <section id={id} key={id}>
            {index > 0 ? <h2>{linkedText(heading.replace(/^\d+\.\s*/, ""))}</h2> : null}
            {paragraphs.map((paragraph, pIndex) => <p key={pIndex}>{linkedText(paragraph)}</p>)}
          </section>
        );
      })}
      {footnotes.length ? (
        <section className="footnotes" aria-labelledby="footnotes-title">
          <div className="footnotes-heading"><span>ارجاعات</span><h2 id="footnotes-title">یادداشت‌ها و منابع</h2></div>
          <ol>
            {footnotes.map((footnote) => (
              <li id={`footnote-${footnote.number}`} key={footnote.number}>
                <span className="footnote-number">{toFaDigits(footnote.number)}</span>
                <p>{linkedText(footnote.text)}</p>
                <a className="footnote-back" href={`#footnote-ref-${footnote.number}`} aria-label={`بازگشت از زیرنویس ${toFaDigits(footnote.number)} به متن`}>بازگشت ↑</a>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </article>
  );
}

function CommentaryIndex() {
  return (
    <div className="commentary-index">
      <div className="index-intro">
        <p className="eyebrow">شرح جزءبه‌جزء</p>
        <h2>شرح ماده ۴۴ در ۹ بخش</h2>
        <p>صدر ماده، هفت بند و تبصره هرکدام صفحه مستقل دارند. این تفکیک امکان ارجاع مستقیم به هر بخش و اتصال دقیق آرا را فراهم می‌کند.</p>
      </div>
      <div className="part-grid">
        {commentaryParts.map((part, index) => {
          const content = <>
            <span className="part-index">{toFaDigits(index + 1)}</span>
            <small>{part.shortLabel}</small>
            <h3>{part.title}</h3>
            <p>{part.description}</p>
            <b>{part.available ? "مطالعه شرح ←" : "شرح هنوز منتشر نشده است"}</b>
          </>;
          return part.available
            ? <Link className="part-card available" href={`/laws/article-44/commentary/${part.slug}`} key={part.slug}>{content}</Link>
            : <article className="part-card" aria-disabled="true" key={part.slug}>{content}</article>;
        })}
      </div>
      <Link className="read-all-commentary" href="/laws/article-44/commentary/chapeau">شروع مطالعه از صدر ماده ←</Link>
    </div>
  );
}

function CommentaryPart({ slug }: { slug: string }) {
  const part = commentaryParts.find((item) => item.slug === slug);
  if (!part?.available) return null;
  const index = commentaryParts.findIndex((item) => item.slug === slug);
  const previous = commentaryParts.slice(0, index).reverse().find((item) => item.available);
  const next = commentaryParts.slice(index + 1).find((item) => item.available);

  return (
    <>
      <div className="commentary-layout part-layout">
        <PartsNav current={slug} />
        <CommentaryBody slug={slug} />
      </div>
      <nav className="part-pagination" aria-label="حرکت میان اجزای شرح">
        {previous ? <Link href={`/laws/article-44/commentary/${previous.slug}`}><small>بخش قبلی</small><strong>{previous.shortLabel}</strong></Link> : <span />}
        <Link className="parts-home" href="/laws/article-44/commentary">فهرست ۹ بخش</Link>
        {next ? <Link href={`/laws/article-44/commentary/${next.slug}`}><small>بخش بعدی</small><strong>{next.shortLabel}</strong></Link> : <span />}
      </nav>
    </>
  );
}

function LawText() {
  return (
    <article className="law-text-card clickable-law">
      <div className="law-number">۴۴</div>
      <div>
        <Link className="law-unit law-lead" href="/laws/article-44/commentary/chapeau">
          <span><strong>ماده ۴۴</strong> ـ {article44Paragraphs[0]}</span><small>مطالعه شرح صدر ماده ←</small>
        </Link>
        <ol>
          {article44Paragraphs.slice(1).map((paragraph, index) => (
            <li key={paragraph}>
              {commentaryParts.find((part) => part.slug === `clause-${index + 1}`)?.available ? <Link className="law-unit" href={`/laws/article-44/commentary/clause-${index + 1}`}>
                <span>{toFaDigits(paragraph.replace(/^[۰-۹0-9]+ـ\s*/, ""))}</span><small>مطالعه شرح بند {toFaDigits(index + 1)} ←</small>
              </Link> : <span className="law-unit unavailable" aria-disabled="true">
                <span>{toFaDigits(paragraph.replace(/^[۰-۹0-9]+ـ\s*/, ""))}</span><small>شرح این بند هنوز منتشر نشده است</small>
              </span>}
            </li>
          ))}
        </ol>
        <div className="law-unit law-note unavailable" aria-disabled="true">
          <span><strong>تبصره</strong> ـ {article44Note}</span><small>مطالعه شرح تبصره ←</small>
        </div>
      </div>
    </article>
  );
}

function Decisions() {
  return (
    <div className="related-decisions">
      <div className="decisions-intro">
        <p>این فهرست مجموعه آرای منتخب مرتبط با ماده ۴۴ است. هر پرونده صفحه مستقل و پیوند به اجزای مرتبط ماده دارد.</p>
        <span>{toFaDigits(article44DecisionIndexRecords.length)} پرونده با متن کامل، مشخصات تصمیم، نتیجه و منبع رسمی در دسترس است.</span>
      </div>
      <div className="decision-cards">
        {article44DecisionIndexRecords.map((decision) => (
          <Link className="decision-reference ready" href={decision.href} key={decision.slug}>
            <small>رأی {toFaDigits(decision.number)}</small>
            <h3>{decision.title}</h3>
            <p>{toFaDigits(decision.type)} · {decision.authority}</p>
            <span>مشاهده پرونده ←</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Article44({ active, commentaryPart }: { active: Tab; commentaryPart?: string }) {
  const currentPart = commentaryPart ? commentaryParts.find((part) => part.slug === commentaryPart) : undefined;
  const commentaryTitle = currentPart
    ? (currentPart.slug === "chapeau" ? currentPart.title : `شرح ${currentPart.shortLabel} ماده ۴۴`)
    : undefined;
  return (
    <>
      {currentPart && commentaryTitle ? <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: commentaryTitle,
        description: currentPart.description,
        inLanguage: "fa-IR",
        dateModified: CONTENT_UPDATED_ISO,
        mainEntityOfPage: `${SITE_URL}/laws/article-44/commentary/${currentPart.slug}`,
        author: { "@id": `${SITE_URL}/about#person` },
        publisher: { "@type": "Person", name: AUTHOR.name },
        isPartOf: { "@type": "CreativeWork", name: "شرح ماده ۴۴ قانون اجرای سیاست‌های کلی اصل چهل‌وچهار", url: `${SITE_URL}/laws/article-44` },
      }} /> : null}
      <section className="legal-hero">
        <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/laws/general-policies-44">قانون اجرای سیاست‌های کلی اصل ۴۴</Link><span>←</span><b>ماده ۴۴</b></div>
        <p className="eyebrow">قانون اجرای سیاست‌های کلی اصل چهل‌وچهار قانون اساسی</p>
        <h1>ماده ۴۴</h1>
        <p>توافق‌ها و هماهنگی‌های اخلال‌گر در رقابت</p>
        <div className="law-meta"><span>نوع محتوا <b>قانون و شرح</b></span><span>نویسنده شرح <b>نادر جعفری</b></span><span>اجزای شرح <b>۹ بخش</b></span></div>
      </section>

      <nav className="legal-tabs" aria-label="بخش‌های ماده ۴۴">
        {tabs.map((tab) => <Link className={active === tab.key ? "active" : ""} href={tab.href} key={tab.key}>{tab.label}{tab.count ? <small>{tab.count}</small> : null}</Link>)}
      </nav>

      <section className="legal-content">
        {active === "text" ? <LawText /> : null}
        {active === "commentary" && !commentaryPart ? <CommentaryIndex /> : null}
        {active === "commentary" && commentaryPart ? <CommentaryPart slug={commentaryPart} /> : null}
        {active === "decisions" ? <Decisions /> : null}
      </section>

      <nav className="law-pagination" aria-label="حرکت میان مواد"><span>ماده پیشین</span><Link href="/laws/general-policies-44">بازگشت به مجموعه قانون</Link><span>ماده بعدی</span></nav>
    </>
  );
}

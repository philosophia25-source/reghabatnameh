import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  article44Note,
  article44Paragraphs,
  commentaryParts,
} from "@/app/legal-data";
import { article44DecisionIndexRecords, decisionRouteByMention } from "@/app/decision-data";
import { toFaDate, toFaDigits } from "@/app/text";
import { EditorialMeta } from "@/components/editorial-meta";
import { JsonLd } from "@/components/json-ld";
import { AUTHOR, CONTENT_UPDATED_FA, CONTENT_UPDATED_ISO, SITE_NAME, SITE_URL } from "@/lib/site";

function commentaryFile(slug: string) {
  return slug === "chapeau" ? "commentary44.md" : `commentary44-${slug}.md`;
}

type Tab = "text" | "commentary" | "decisions";

const commentaryPartCount = commentaryParts.length;
const publishedCommentaryCount = commentaryParts.filter((part) => part.available).length;

const tabs: { key: Tab; label: string; href: string; count?: string }[] = [
  { key: "text", label: "متن ماده", href: "/laws/general-policies-44/article-44" },
  { key: "commentary", label: "شرح", href: "/laws/general-policies-44/article-44/commentary", count: toFaDigits(publishedCommentaryCount) },
  { key: "decisions", label: "آرای ماده ۴۴", href: "/laws/general-policies-44/article-44/decisions", count: toFaDigits(article44DecisionIndexRecords.length) },
];

function clean(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/\\([*])/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

function plainHeading(text: string) {
  return toFaDate(clean(text).replace(/\[\\?\[(\d+)\\?\]\]\(#_ftn\d+\)/g, "").trim());
}

function isCommentaryHeading(line: string) {
  return /^\*\*[^*]+\*\*$/.test(line.trim()) || /^\d+\.\s+\*\*[^*]+\*\*$/.test(line.trim());
}

function commentarySections(commentary: string) {
  const sections: string[] = [];
  let current: string[] = [];

  commentary.split("\n").forEach((line) => {
    if (isCommentaryHeading(line) && current.length) {
      sections.push(current.join("\n").trim());
      current = [];
    }
    current.push(line);
  });

  if (current.length) sections.push(current.join("\n").trim());
  return sections.filter(Boolean);
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
        return <Link className="inline-decision" href={source[2]} key={`${part}-${index}`}>{toFaDate(source[1].trim())}</Link>;
      }
      return <a className="inline-source" href={source[2]} target="_blank" rel="noreferrer" key={`${part}-${index}`}>{toFaDate(source[1].trim())}</a>;
    }
    const href = decisionRouteByMention[part];
    return href ? <Link className="inline-decision" href={href} key={`${part}-${index}`}>{toFaDate(part)}</Link> : toFaDate(part);
  });
}

type CommentaryDecisionReference = {
  href: string;
  title: string;
  detail: string;
  external: boolean;
  position: number;
};

function commentaryDecisionReferences(commentary: string) {
  const references: CommentaryDecisionReference[] = [];
  const recordByRoute = new Map(article44DecisionIndexRecords.map((decision) => [decision.href, decision]));

  for (const match of commentary.matchAll(/\[([^\]]+)\]\(((?:https?:\/\/|\/decisions\/)[^)\s]+)\)/g)) {
    const label = toFaDate(clean(match[1]).trim());
    const href = match[2];
    const internalDecision = recordByRoute.get(href);
    if (internalDecision) {
      references.push({
        href,
        title: internalDecision.title,
        detail: label,
        external: false,
        position: match.index ?? 0,
      });
    } else if (/(?:تصمیم|رأی|پرونده)/.test(label)) {
      references.push({
        href,
        title: label,
        detail: label.includes("پرونده") ? "پرونده خارجی" : "منبع رسمی",
        external: true,
        position: match.index ?? 0,
      });
    }
  }

  Object.entries(decisionRouteByMention).forEach(([mention, route]) => {
    const position = commentary.indexOf(mention);
    const decision = recordByRoute.get(route);
    if (position < 0 || !decision) return;
    references.push({
      href: route,
      title: decision.title,
      detail: toFaDate(mention),
      external: false,
      position,
    });
  });

  references.sort((first, second) => first.position - second.position);
  const seen = new Set<string>();
  return references.filter((reference) => {
    if (seen.has(reference.href)) return false;
    seen.add(reference.href);
    return true;
  });
}

function PartsNav({ current }: { current?: string }) {
  return (
    <aside className="parts-nav">
      <p>اجزای ماده ۴۴</p>
      <ol>
        {commentaryParts.map((part, index) => (
          <li className={current === part.slug ? "active" : ""} aria-current={current === part.slug ? "page" : undefined} key={part.slug}>
            {part.available ? <Link className="parts-nav-link" href={`/laws/general-policies-44/article-44/commentary/${part.slug}`}>
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
  const sections = commentarySections(commentaryMain);
  const tocSections = sections.slice(1, 11);
  const footnotes = Array.from(commentaryFootnotes.matchAll(/\[\\?\[(\d+)\\?\]\]\(#_ftnref\d+\)\s*([\s\S]*?)(?=\n\n\[\\?\[\d+|$)/g)).map((match) => ({
    number: match[1],
    text: match[2].trim(),
  }));
  const decisionReferences = commentaryDecisionReferences(commentaryMain);
  const displayTitle = slug === "chapeau" ? "شرح صدر ماده ۴۴" : `شرح ${part.shortLabel} ماده ۴۴`;

  return (
    <article className="commentary-body">
      <div className="commentary-title-row">
        <p className="commentary-kicker">شرح نادر جعفری</p>
        <h2>{displayTitle}</h2>
        <p>{part.title}، {part.description}</p>
      </div>
      <EditorialMeta citation={`${AUTHOR.name}، «${displayTitle}»، ${SITE_NAME}، آخرین به‌روزرسانی ${CONTENT_UPDATED_FA}، ${SITE_URL}/laws/general-policies-44/article-44/commentary/${slug}`} />
      {decisionReferences.length ? <details className="commentary-decision-count">
        <summary>
          <span>آرا و پرونده‌های مورد بررسی در این شرح</span>
          <strong>{toFaDigits(decisionReferences.length)} پرونده</strong>
          <small>مشاهده فهرست و دسترسی به پرونده‌ها</small>
        </summary>
        <div className="commentary-decision-list">
          {decisionReferences.map((reference) => {
            const content = <>
              <small>{reference.detail}</small>
              <strong>{reference.title}</strong>
              <span>{reference.external ? "مشاهده منبع بیرونی ↗" : "مشاهده پرونده ←"}</span>
            </>;
            return reference.external
              ? <a href={reference.href} target="_blank" rel="noreferrer" key={reference.href}>{content}</a>
              : <Link href={reference.href} key={reference.href}>{content}</Link>;
          })}
        </div>
      </details> : null}
      {tocSections.length ? <details className="commentary-on-page">
        <summary>فهرست مطالب این شرح</summary>
        <ol>
          {tocSections.map((section, tocIndex) => {
            const heading = clean(section.split("\n")[0]);
            const id = `section-${heading.match(/^\d+/)?.[0] ?? tocIndex + 1}`;
            return <li key={id}><a href={`#${id}`}>{plainHeading(heading.replace(/^\d+\.\s*/, ""))}</a></li>;
          })}
        </ol>
      </details> : null}
      {sections.map((section, index) => {
        const lines = section.split("\n").filter((line) => line.trim());
        const headingLine = lines[0];
        const hasHeading = isCommentaryHeading(headingLine);
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
        <h2>شرح ماده ۴۴ در {toFaDigits(commentaryPartCount)} بخش</h2>
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
            ? <Link className="part-card available" href={`/laws/general-policies-44/article-44/commentary/${part.slug}`} key={part.slug}>{content}</Link>
            : <article className="part-card" aria-disabled="true" key={part.slug}>{content}</article>;
        })}
      </div>
      <Link className="read-all-commentary" href="/laws/general-policies-44/article-44/commentary/chapeau">شروع مطالعه از صدر ماده ←</Link>
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
        {previous ? <Link href={`/laws/general-policies-44/article-44/commentary/${previous.slug}`}><small>بخش قبلی</small><strong>{previous.shortLabel}</strong></Link> : <span />}
        <Link className="parts-home" href="/laws/general-policies-44/article-44/commentary">فهرست {toFaDigits(commentaryPartCount)} بخش</Link>
        {next ? <Link href={`/laws/general-policies-44/article-44/commentary/${next.slug}`}><small>بخش بعدی</small><strong>{next.shortLabel}</strong></Link> : <span />}
      </nav>
    </>
  );
}

function LawText() {
  const noteAvailable = commentaryParts.find((part) => part.slug === "note")?.available;

  return (
    <article className="law-text-card clickable-law">
      <div className="law-number">۴۴</div>
      <div>
        <Link className="law-unit law-lead" href="/laws/general-policies-44/article-44/commentary/chapeau">
          <span><strong>ماده ۴۴</strong> ـ {article44Paragraphs[0]}</span><small>مطالعه شرح صدر ماده ←</small>
        </Link>
        <ol>
          {article44Paragraphs.slice(1).map((paragraph, index) => (
            <li key={paragraph}>
              {commentaryParts.find((part) => part.slug === `clause-${index + 1}`)?.available ? <Link className="law-unit" href={`/laws/general-policies-44/article-44/commentary/clause-${index + 1}`}>
                <span>{toFaDigits(paragraph.replace(/^[۰-۹0-9]+ـ\s*/, ""))}</span><small>مطالعه شرح بند {toFaDigits(index + 1)} ←</small>
              </Link> : <span className="law-unit unavailable" aria-disabled="true">
                <span>{toFaDigits(paragraph.replace(/^[۰-۹0-9]+ـ\s*/, ""))}</span><small>شرح این بند هنوز منتشر نشده است</small>
              </span>}
            </li>
          ))}
        </ol>
        {noteAvailable ? <Link className="law-unit law-note" href="/laws/general-policies-44/article-44/commentary/note">
          <span><strong>تبصره</strong> ـ {article44Note}</span><small>مطالعه شرح تبصره ←</small>
        </Link> : <div className="law-unit law-note unavailable" aria-disabled="true">
          <span><strong>تبصره</strong> ـ {article44Note}</span><small>شرح تبصره هنوز منتشر نشده است</small>
        </div>}
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
        mainEntityOfPage: `${SITE_URL}/laws/general-policies-44/article-44/commentary/${currentPart.slug}`,
        author: { "@id": `${SITE_URL}/about#person` },
        publisher: { "@type": "Person", name: AUTHOR.name },
        isPartOf: { "@type": "CreativeWork", name: "شرح ماده ۴۴ قانون اجرای سیاست‌های کلی اصل چهل‌وچهار", url: `${SITE_URL}/laws/general-policies-44/article-44` },
      }} /> : null}
      <section className="legal-hero">
        <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/laws/general-policies-44">قانون اجرای سیاست‌های کلی اصل ۴۴</Link><span>←</span><b>ماده ۴۴</b></div>
        <p className="eyebrow">قانون اجرای سیاست‌های کلی اصل چهل‌وچهار قانون اساسی</p>
        <h1>ماده ۴۴</h1>
        <p>توافق‌ها و هماهنگی‌های اخلال‌گر در رقابت</p>
        <div className="law-meta"><span>نوع محتوا <b>قانون و شرح</b></span><span>نویسنده شرح <b>نادر جعفری</b></span><span>اجزای شرح <b>{toFaDigits(commentaryPartCount)} بخش</b></span></div>
      </section>

      <nav className="legal-tabs" aria-label="بخش‌های ماده ۴۴">
        {tabs.map((tab) => <Link className={active === tab.key ? "active" : ""} aria-current={active === tab.key ? "page" : undefined} href={tab.href} key={tab.key}>{tab.label}{tab.count ? <small>{tab.count}</small> : null}</Link>)}
      </nav>

      <section className="legal-content">
        {active === "text" ? <LawText /> : null}
        {active === "commentary" && !commentaryPart ? <CommentaryIndex /> : null}
        {active === "commentary" && commentaryPart ? <CommentaryPart slug={commentaryPart} /> : null}
        {active === "decisions" ? <Decisions /> : null}
      </section>

      <nav className="law-pagination" aria-label="حرکت میان مواد"><span>ماده پیشین</span><Link href="/laws/general-policies-44">بازگشت به مجموعه قانون</Link><Link href="/laws/general-policies-44/article-45">ماده ۴۵</Link></nav>
    </>
  );
}

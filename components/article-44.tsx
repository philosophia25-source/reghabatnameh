import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  article44Note,
  article44Paragraphs,
  commentaryParts,
  decisionRouteByMention,
  referencedDecisions,
} from "@/app/legal-data";
import { LegalShell } from "@/components/legal-shell";
import { toFaDigits } from "@/app/text";

const commentary = readFileSync(join(process.cwd(), "content/commentary44.md"), "utf8");

type Tab = "text" | "commentary" | "decisions";

const tabs: { key: Tab; label: string; href: string; count?: string }[] = [
  { key: "text", label: "متن ماده", href: "/laws/article-44" },
  { key: "commentary", label: "شرح", href: "/laws/article-44/commentary", count: "۹" },
  { key: "decisions", label: "آرای مرتبط", href: "/laws/article-44/decisions", count: "۱۷" },
];

const [commentaryMain, commentaryFootnotes = ""] = commentary.split(/\n---\n/, 2);
const sections = commentaryMain.split(/\n(?=\*\*\d+\.)/).map((part) => part.trim()).filter(Boolean);
const footnotes = Array.from(commentaryFootnotes.matchAll(/\[\\?\[(\d+)\\?\]\]\(#_ftnref\d+\)\s*([\s\S]*?)(?=\n\n\[\\?\[\d+|$)/g)).map((match) => ({
  number: match[1],
  text: match[2].trim(),
}));

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
  const pattern = new RegExp(`(\\[\\[FN:\\d+\\]\\]|${mentions.join("|")})`, "g");
  return normalized.split(pattern).map((part, index) => {
    const footnote = part.match(/^\[\[FN:(\d+)\]\]$/);
    if (footnote) {
      return <sup className="footnote-ref" id={`footnote-ref-${footnote[1]}`} key={`${part}-${index}`}><a href={`#footnote-${footnote[1]}`} aria-label={`رفتن به زیرنویس ${toFaDigits(footnote[1])}`}>{toFaDigits(footnote[1])}</a></sup>;
    }
    const href = decisionRouteByMention[part];
    return href ? <Link className="inline-decision" href={href} key={`${part}-${index}`}>{toFaDigits(part)}</Link> : toFaDigits(part);
  });
}

function PartsNav({ current }: { current?: string }) {
  return (
    <aside className="parts-nav">
      <p>اجزای ماده ۴۴</p>
      <ol>
        {commentaryParts.map((part, index) => (
          <li className={current === part.slug ? "active" : ""} key={part.slug}>
            <Link href={`/laws/article-44/commentary/${part.slug}`}>
              <span>{toFaDigits(index + 1)}</span>
              <div><small>{part.shortLabel}</small><strong>{part.title}</strong></div>
              {!part.available ? <i>به‌زودی</i> : null}
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function CommentaryBody() {
  return (
    <article className="commentary-body">
      <div className="commentary-title-row">
        <p className="commentary-kicker">شرح نادر جعفری</p>
        <h2>شرح صدر ماده ۴۴</h2>
        <p>قرارداد، توافق و تفاهم میان اشخاص و قابلیت اخلال در رقابت</p>
      </div>
      <details className="commentary-on-page">
        <summary>فهرست مطالب این شرح</summary>
        <ol>
          {sections.slice(1, 11).map((section) => {
            const heading = clean(section.split("\n")[0]);
            const id = `section-${heading.match(/^\d+/)?.[0] ?? "intro"}`;
            return <li key={id}><a href={`#${id}`}>{plainHeading(heading.replace(/^\d+\.\s*/, ""))}</a></li>;
          })}
        </ol>
      </details>
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
        {commentaryParts.map((part, index) => (
          <Link className={`part-card ${part.available ? "available" : ""}`} href={`/laws/article-44/commentary/${part.slug}`} key={part.slug}>
            <span className="part-index">{toFaDigits(index + 1)}</span>
            <small>{part.shortLabel}</small>
            <h3>{part.title}</h3>
            <p>{part.description}</p>
            <b>{part.available ? "مطالعه شرح ←" : "شرح هنوز منتشر نشده است"}</b>
          </Link>
        ))}
      </div>
      <Link className="read-all-commentary" href="/laws/article-44/commentary/chapeau">شروع مطالعه از صدر ماده ←</Link>
    </div>
  );
}

function CommentaryPart({ slug }: { slug: string }) {
  const part = commentaryParts.find((item) => item.slug === slug);
  if (!part) return null;
  const index = commentaryParts.findIndex((item) => item.slug === slug);
  const previous = commentaryParts[index - 1];
  const next = commentaryParts[index + 1];

  return (
    <>
      <div className="commentary-layout part-layout">
        <PartsNav current={slug} />
        {part.available ? (
          <CommentaryBody />
        ) : (
          <article className="empty-commentary">
            <p className="eyebrow">{part.shortLabel}</p>
            <h2>{part.title}</h2>
            <p>{part.description}</p>
            <div><strong>شرح این بخش هنوز منتشر نشده است.</strong><span>پس از دریافت متن نهایی، شرح و آرای مورد استناد در همین صفحه قرار می‌گیرند.</span></div>
            <Link href="/laws/article-44">بازگشت به متن ماده ←</Link>
          </article>
        )}
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
              <Link className="law-unit" href={`/laws/article-44/commentary/clause-${index + 1}`}>
                <span>{toFaDigits(paragraph.replace(/^[۰-۹0-9]+ـ\s*/, ""))}</span><small>مطالعه شرح بند {toFaDigits(index + 1)} ←</small>
              </Link>
            </li>
          ))}
        </ol>
        <Link className="law-unit law-note" href="/laws/article-44/commentary/note">
          <span><strong>تبصره</strong> ـ {article44Note}</span><small>مطالعه شرح تبصره ←</small>
        </Link>
      </div>
    </article>
  );
}

function Decisions() {
  return (
    <div className="related-decisions">
      <div className="decisions-intro">
        <p>این فهرست از آرایی تشکیل شده است که در شرح صدر ماده ۴۴ مورد استفاده یا نقد قرار گرفته‌اند.</p>
        <span>صفحات کامل سه پرونده اکنون در دسترس است و سایر پرونده‌ها به‌تدریج با متن، نتیجه و سرنوشت اعتراض تکمیل می‌شوند.</span>
      </div>
      <div className="decision-cards">
        {referencedDecisions.map((decision) => {
          const content = <><small>رأی {decision.number}</small><h3>{decision.title}</h3><p>{decision.role}</p><span>{decision.href ? "مشاهده پرونده ←" : "در صف تکمیل"}</span></>;
          return decision.href
            ? <Link className="decision-reference ready" href={decision.href} key={decision.number}>{content}</Link>
            : <article className="decision-reference" key={decision.number}>{content}</article>;
        })}
      </div>
    </div>
  );
}

export function Article44({ active, commentaryPart }: { active: Tab; commentaryPart?: string }) {
  return (
    <LegalShell>
      <section className="legal-hero">
        <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/laws/article-44">قوانین و مقررات</Link><span>←</span><b>ماده ۴۴</b></div>
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

      <nav className="law-pagination" aria-label="حرکت میان مواد"><span>ماده پیشین</span><Link href="/laws/article-44">بازگشت به ابتدای ماده ۴۴</Link><span>ماده بعدی</span></nav>
    </LegalShell>
  );
}

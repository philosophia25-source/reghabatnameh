import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { article45CommentaryParts } from "@/lib/knowledge/article45";
import { decisionIndexRecords, decisionRouteByMention } from "@/app/decision-data";
import { toFaDate, toFaDigits } from "@/app/text";
import { EditorialMeta } from "@/components/editorial-meta";
import { AUTHOR, CONTENT_UPDATED_FA, SITE_NAME, SITE_URL } from "@/lib/site";

function commentaryFile(slug: string) {
  return slug === "chapeau" ? "commentary45.md" : `commentary45-${slug}.md`;
}

function clean(text: string) {
  return text.replace(/\*\*/g, "").replace(/\\([*])/g, "$1").replace(/\*([^*]+)\*/g, "$1");
}

function plainHeading(text: string) {
  return toFaDate(clean(text).replace(/\[\\?\[(\d+)\\?\]\]\(#_ftn\d+\)/g, "").trim());
}

function isHeading(line: string) {
  return /^\*\*[^*]+\*\*$/.test(line.trim()) || /^\d+\.\s+\*\*[^*]+\*\*$/.test(line.trim());
}

function sectionsOf(commentary: string) {
  const sections: string[] = [];
  let current: string[] = [];
  commentary.split("\n").forEach((line) => {
    if (isHeading(line) && current.length) {
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
    if (footnote) return <sup className="footnote-ref" id={`footnote-ref-${footnote[1]}`} key={`${part}-${index}`}><a href={`#footnote-${footnote[1]}`}>{toFaDigits(footnote[1])}</a></sup>;
    const source = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)$/);
    if (source) {
      return source[2].startsWith("/")
        ? <Link className="inline-decision" href={source[2]} key={`${part}-${index}`}>{toFaDate(source[1].trim())}</Link>
        : <a className="inline-source" href={source[2]} target="_blank" rel="noreferrer" key={`${part}-${index}`}>{toFaDate(source[1].trim())}</a>;
    }
    const href = decisionRouteByMention[part];
    return href ? <Link className="inline-decision" href={href} key={`${part}-${index}`}>{toFaDate(part)}</Link> : toFaDate(part);
  });
}

function PartsNav({ current }: { current: string }) {
  return <aside className="parts-nav">
    <p>اجزای ماده ۴۵</p>
    <ol>
      {article45CommentaryParts.map((part, index) => <li className={current === part.slug ? "active" : ""} key={part.slug}>
        {part.available ? <Link className="parts-nav-link" href={`/laws/article-45/commentary/${part.slug}`}>
          <span>{toFaDigits(index + 1)}</span><div><small>{part.shortLabel}</small><strong>{part.title}</strong></div>
        </Link> : <span className="parts-nav-link unavailable" aria-disabled="true">
          <span>{toFaDigits(index + 1)}</span><div><small>{part.shortLabel}</small><strong>{part.title}</strong></div><i>به‌زودی</i>
        </span>}
      </li>)}
    </ol>
  </aside>;
}

function decisionReferences(commentary: string) {
  const references: { href: string; title: string; detail: string; position: number }[] = [];
  const recordByRoute = new Map(decisionIndexRecords.map((decision) => [decision.href, decision]));
  for (const match of commentary.matchAll(/\[([^\]]+)\]\((\/decisions\/[^)\s]+)\)/g)) {
    const decision = recordByRoute.get(match[2]);
    if (decision) references.push({ href: match[2], title: decision.title, detail: toFaDate(clean(match[1]).trim()), position: match.index ?? 0 });
  }
  Object.entries(decisionRouteByMention).forEach(([mention, route]) => {
    const position = commentary.indexOf(mention);
    const decision = recordByRoute.get(route);
    if (position >= 0 && decision) references.push({ href: route, title: decision.title, detail: toFaDate(mention), position });
  });
  references.sort((a, b) => a.position - b.position);
  const seen = new Set<string>();
  return references.filter((reference) => !seen.has(reference.href) && Boolean(seen.add(reference.href)));
}

export function Article45Commentary({ slug }: { slug: string }) {
  const part = article45CommentaryParts.find((item) => item.slug === slug);
  if (!part?.available) return null;
  const commentary = readFileSync(join(process.cwd(), "content", commentaryFile(slug)), "utf8");
  const [main, footnoteText = ""] = commentary.split(/\n---\n/, 2);
  const sections = sectionsOf(main);
  const tocSections = sections.slice(1, 11);
  const footnotes = Array.from(footnoteText.matchAll(/\[\\?\[(\d+)\\?\]\]\(#_ftnref\d+\)\s*([\s\S]*?)(?=\n\n\[\\?\[\d+|$)/g)).map((match) => ({ number: match[1], text: match[2].trim() }));
  const references = decisionReferences(main);
  const displayTitle = slug === "chapeau" ? "شرح صدر ماده ۴۵" : `شرح ${part.shortLabel} ماده ۴۵`;
  const index = article45CommentaryParts.findIndex((item) => item.slug === slug);
  const previous = article45CommentaryParts.slice(0, index).reverse().find((item) => item.available);
  const next = article45CommentaryParts.slice(index + 1).find((item) => item.available);

  return <>
    <div className="commentary-layout part-layout">
      <PartsNav current={slug} />
      <article className="commentary-body">
        <div className="commentary-title-row"><p className="commentary-kicker">شرح نادر جعفری</p><h2>{displayTitle}</h2><p>{part.title}، {part.description}</p></div>
        <EditorialMeta citation={`${AUTHOR.name}، «${displayTitle}»، ${SITE_NAME}، آخرین به‌روزرسانی ${CONTENT_UPDATED_FA}، ${SITE_URL}/laws/article-45/commentary/${slug}`} />
        {references.length ? <details className="commentary-decision-count"><summary><span>آرا و پرونده‌های مورد بررسی در این شرح</span><strong>{toFaDigits(references.length)} پرونده</strong><small>مشاهده فهرست و دسترسی به پرونده‌ها</small></summary><div className="commentary-decision-list">{references.map((reference) => <Link href={reference.href} key={reference.href}><small>{reference.detail}</small><strong>{reference.title}</strong><span>مشاهده پرونده ←</span></Link>)}</div></details> : null}
        {tocSections.length ? <details className="commentary-on-page"><summary>فهرست مطالب این شرح</summary><ol>{tocSections.map((section, tocIndex) => {
          const heading = clean(section.split("\n")[0]);
          const id = `section-${heading.match(/^\d+/)?.[0] ?? tocIndex + 1}`;
          return <li key={id}><a href={`#${id}`}>{plainHeading(heading.replace(/^\d+\.\s*/, ""))}</a></li>;
        })}</ol></details> : null}
        {sections.map((section, sectionIndex) => {
          const lines = section.split("\n").filter((line) => line.trim());
          const headingLine = lines[0];
          const hasHeading = isHeading(headingLine);
          const heading = hasHeading ? clean(headingLine) : displayTitle;
          const id = sectionIndex === 0 ? "commentary-start" : `section-${heading.match(/^\d+/)?.[0] ?? sectionIndex}`;
          const paragraphs = (hasHeading ? lines.slice(1) : lines).filter((line) => line !== "---");
          return <section id={id} key={id}>{sectionIndex > 0 ? <h2>{linkedText(heading.replace(/^\d+\.\s*/, ""))}</h2> : null}{paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{linkedText(paragraph)}</p>)}</section>;
        })}
        {footnotes.length ? <section className="footnotes" aria-labelledby="footnotes-title"><div className="footnotes-heading"><span>ارجاعات</span><h2 id="footnotes-title">یادداشت‌ها و منابع</h2></div><ol>{footnotes.map((footnote) => <li id={`footnote-${footnote.number}`} key={footnote.number}><span className="footnote-number">{toFaDigits(footnote.number)}</span><p>{linkedText(footnote.text)}</p><a className="footnote-back" href={`#footnote-ref-${footnote.number}`}>بازگشت ↑</a></li>)}</ol></section> : null}
      </article>
    </div>
    <nav className="part-pagination" aria-label="حرکت میان اجزای شرح">
      {previous ? <Link href={`/laws/article-45/commentary/${previous.slug}`}><small>بخش قبلی</small><strong>{previous.shortLabel}</strong></Link> : <span />}
      <Link className="parts-home" href="/laws/article-45/commentary">فهرست ۳۶ بخش</Link>
      {next ? <Link href={`/laws/article-45/commentary/${next.slug}`}><small>بخش بعدی</small><strong>{next.shortLabel}</strong></Link> : <span />}
    </nav>
  </>;
}

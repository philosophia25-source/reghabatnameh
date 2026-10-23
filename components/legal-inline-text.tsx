import Link from "next/link";
import { decisionRouteByMention } from "@/app/decision-data";
import { toFaDate, toFaDigits } from "@/app/text";

function clean(text: string) {
  return text.replace(/\*\*/g, "").replace(/\\([*])/g, "$1").replace(/\*([^*]+)\*/g, "$1");
}

export function linkedText(text: string) {
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

import { toFaDigits } from "@/app/text";
import type { CraResolution } from "./types";

export function craResolutionPageTitle(resolution: Pick<CraResolution, "title" | "resolutionNumber" | "sessionNumber">) {
  const number = toFaDigits(resolution.resolutionNumber.trim());
  const session = toFaDigits(resolution.sessionNumber.trim());
  const identifier = [number ? `مصوبه شماره ${number}` : "مصوبه", session ? `جلسه ${session}` : ""]
    .filter(Boolean).join(" ");
  let subject = toFaDigits(resolution.title).trim();

  // Only remove a leading reference to this resolution. References to other
  // resolutions in amendment titles are part of the subject and must remain.
  const fullReference = subject.match(/^مصوبه\s+شماره\s*\(?\s*([۰-۹]+)\s*\)?\s+جلسه\s+(?:شماره\s*)?\(?\s*([۰-۹]+)\s*\)?(?=\s|$)/);
  const sessionOnlyReference = subject.match(/^مصوبه\s+شماره\s+جلسه\s+(?:شماره\s*)?([۰-۹]+)(?:\s+کمیسیون)?(?=\s|$)/);
  const ownReference = fullReference?.[1] === number && fullReference?.[2] === session
    ? fullReference
    : sessionOnlyReference?.[1] === session ? sessionOnlyReference : null;
  if (ownReference) {
    subject = subject.slice(ownReference[0].length).trim()
      .replace(/^(?:با\s*موضوع|در\s+خصوص|درباره|با\s*عنوان)\s+/u, "");
  }

  return subject ? `${identifier} | ${subject}` : identifier;
}

/** Display-only isolation. Never reverse clause numbers or rewrite legal text. */
export function formatCraReadingHtml(html: string) {
  // These leaf spans add no information inside an already-RTL document, but
  // split parentheses from their English abbreviation into separate bidi runs.
  const flattened = html.replace(/<span dir="rtl">([^<]*)<\/span>/g, "$1")
    .replace(/<p>\s*<strong>([^<]*)<\/strong>\s*<\/p>/g, (paragraph, text: string) => (
      /^ماده\s*[۰-۹0-9]{1,2}\s*[-ـ–]/.test(text) && text.length < 110
        ? `<h3>${text}</h3>` : paragraph
    ));
  const stack: { tag: string; protected: boolean }[] = [];
  const voidTags = new Set(["br", "hr", "img", "input", "meta", "link", "wbr", "col", "source"]);
  const protectedTags = new Set(["bdi", "math", "svg", "script", "style", "code", "pre"]);
  const runs = /\([A-Za-z][A-Za-z0-9 .,+/&;_–−-]*\)|(?<![۰-۹0-9])[۰-۹0-9]{4}\/[۰-۹0-9]{1,2}\/[۰-۹0-9]{1,2}(?![۰-۹0-9])|(?<![۰-۹0-9])[۰-۹0-9]+(?:[\/\-–−][۰-۹0-9]+)+(?![۰-۹0-9])|[A-Za-z][A-Za-z0-9]*(?:[ .+/_–−-]+[A-Za-z0-9]+)*/g;
  return flattened.split(/(<[^>]+>)/g).map((part) => {
    if (part.startsWith("<")) {
      const closing = part.match(/^<\/([a-z][\w:-]*)/i);
      if (closing) {
        const i = stack.map((entry) => entry.tag).lastIndexOf(closing[1].toLowerCase());
        if (i >= 0) stack.splice(i);
      } else {
        const opening = part.match(/^<([a-z][\w:-]*)/i);
        if (opening && !voidTags.has(opening[1].toLowerCase()) && !/\/\s*>$/.test(part)) {
          const tag = opening[1].toLowerCase();
          stack.push({ tag, protected: protectedTags.has(tag) || /\bdir=["']ltr["']/i.test(part) });
        }
      }
      return part;
    }
    if (stack.some((entry) => entry.protected)) return part;
    // Do not wrap entity names, and leave their encoded characters unchanged.
    return part.split(/(&#?(?:x[0-9a-f]+|[a-z0-9]+);)/gi).map((text) => (
      text.startsWith("&") ? text : text.replace(runs, (run) => `<bdi dir="ltr">${run}</bdi>`)
    )).join("");
  }).join("");
}

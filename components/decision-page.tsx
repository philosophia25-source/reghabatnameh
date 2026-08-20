import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LegalShell } from "@/components/legal-shell";
import { toFaDigits } from "@/app/text";

const readDecision = (name: string) => readFileSync(join(process.cwd(), "content/decisions", name), "utf8");
const decision437 = readDecision("437.txt");
const decision631 = readDecision("631.txt");
const sugar296 = readDecision("sugar-296.txt");
const sugarAppeal = readDecision("sugar-appeal.txt");

type ParsedDecision = {
  meta: Record<string, string>;
  body: string;
};

function parseDecision(raw: string): ParsedDecision {
  const [head, ...bodyParts] = raw.replace(/^﻿/, "").split(/={20,}/);
  const meta: Record<string, string> = {};
  head.split("\n").forEach((line) => {
    const separator = line.indexOf(":");
    if (separator > 0) meta[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  });
  return { meta, body: bodyParts.join("\n").replace(/^\s*متن کامل موضوع\s*/m, "").trim() };
}

export const decisionRecords = {
  "437": {
    title: "امتناع ایرانسل از همکاری",
    relation: "رد تبانی و تفکیک رفتار هماهنگ از استنکاف یک‌جانبه",
    stages: [parseDecision(decision437)],
  },
  "631": {
    title: "تفاهم انحصاری در زنجیره نخ تایر",
    relation: "احراز توافق محدودکننده و بررسی رابطه شرکت مادر و شرکت‌های وابسته",
    stages: [parseDecision(decision631)],
  },
  sugar: {
    title: "بازار شکر و انحصار واردات",
    relation: "نمونه تعارض تحلیلی میان تصمیم بدوی و رأی هیئت تجدیدنظر",
    stages: [parseDecision(sugar296), parseDecision(sugarAppeal)],
  },
};

export type DecisionSlug = keyof typeof decisionRecords;
export const decisionSlugs = Object.keys(decisionRecords) as DecisionSlug[];

function Stage({ record, index, total }: { record: ParsedDecision; index: number; total: number }) {
  const { meta, body } = record;
  return (
    <article className="decision-stage">
      {total > 1 ? <div className="stage-label">{index === 0 ? "مرحله بدوی" : "مرحله تجدیدنظر"}<span>{toFaDigits(index + 1)}</span></div> : null}
      <div className="decision-facts">
        <div><small>مرجع</small><strong>{toFaDigits(meta["مرجع"])}</strong></div>
        <div><small>شماره رأی</small><strong>{toFaDigits(meta["شماره جلسه/رأی"])}</strong></div>
        <div><small>تاریخ</small><strong>{toFaDigits(meta["تاریخ"])}</strong></div>
        <div><small>نوع تصمیم</small><strong>{toFaDigits(meta["نوع تصمیم"])}</strong></div>
      </div>
      <section className="decision-summary">
        <div><h2>قاعده و دلیل اهمیت</h2><p>{toFaDigits(meta["قاعده/دلیل انتخاب"])}</p></div>
        <div><h2>نتیجه</h2><p>{toFaDigits(meta["نتیجه واقعی"])}</p></div>
        {meta["احتیاط پژوهشی"] && meta["احتیاط پژوهشی"] !== "—" ? <div className="research-caution"><h2>احتیاط پژوهشی</h2><p>{toFaDigits(meta["احتیاط پژوهشی"])}</p></div> : null}
      </section>
      <details className="decision-fulltext">
        <summary>متن کامل تصمیم</summary>
        <div>{body.split(/\n{2,}/).map((paragraph, pIndex) => <p key={pIndex}>{toFaDigits(paragraph)}</p>)}</div>
      </details>
      {meta["نشانی رسمی"] ? <a className="official-source" href={meta["نشانی رسمی"]} target="_blank" rel="noreferrer">مشاهده منبع رسمی در شورای رقابت ←</a> : null}
    </article>
  );
}

export function DecisionPage({ slug }: { slug: DecisionSlug }) {
  const decision = decisionRecords[slug];
  return (
    <LegalShell>
      <section className="decision-hero">
        <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/laws/article-44/decisions">آرای مرتبط ماده ۴۴</Link><span>←</span><b>پرونده</b></div>
        <p className="eyebrow">پرونده‌خوانی حقوق رقابت</p>
        <h1>{decision.title}</h1>
        <p>{decision.relation}</p>
        <Link className="back-to-commentary" href="/laws/article-44/commentary">بازگشت به شرح صدر ماده ۴۴ ←</Link>
      </section>
      <section className="decision-content">
        {decision.stages.map((stage, index) => <Stage record={stage} index={index} total={decision.stages.length} key={`${slug}-${index}`} />)}
      </section>
    </LegalShell>
  );
}

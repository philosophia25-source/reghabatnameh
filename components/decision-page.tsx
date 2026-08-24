import Link from "next/link";
import { decisionRecords, type DecisionRecord, type ParsedDecision } from "@/app/decision-data";
import { toFaDate, toFaDigits } from "@/app/text";

function Stage({ record, index, total }: { record: ParsedDecision; index: number; total: number }) {
  const { meta, body } = record;
  return (
    <article className="decision-stage">
      {total > 1 ? <div className="stage-label">{index === 0 ? "مرحله بدوی" : "مرحله تجدیدنظر"}<span>{toFaDigits(index + 1)}</span></div> : null}
      <div className="decision-facts">
        <div><small>مرجع</small><strong>{toFaDigits(meta["مرجع"])}</strong></div>
        <div><small>شماره رأی</small><strong>{toFaDigits(meta["شماره جلسه/رأی"])}</strong></div>
        <div><small>تاریخ</small><strong>{toFaDate(meta["تاریخ"])}</strong></div>
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

const commentaryLabels: Record<string, string> = {
  chapeau: "شرح صدر ماده ۴۴",
  "clause-1": "شرح بند ۱",
  "clause-2": "شرح بند ۲",
  "clause-3": "شرح بند ۳",
  "clause-4": "شرح بند ۴",
  "clause-5": "شرح بند ۵",
  "clause-6": "شرح بند ۶",
  "clause-7": "شرح بند ۷",
  note: "شرح تبصره",
};

function RelatedCommentary({ decision }: { decision: DecisionRecord }) {
  if (!decision.commentaryParts.length) return null;
  return (
    <nav className="decision-commentary-links" aria-label="شرح‌های مرتبط با این رأی">
      <span>شرح‌های مرتبط</span>
      <div>{decision.commentaryParts.map((part) => (
        <Link href={`/laws/article-44/commentary/${part}`} key={part}>{commentaryLabels[part] ?? part}</Link>
      ))}</div>
    </nav>
  );
}

export function DecisionPage({ slug }: { slug: string }) {
  const decision = decisionRecords[slug];
  return (
    <>
      <section className="decision-hero">
        <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/laws/article-44/decisions">آرای مرتبط ماده ۴۴</Link><span>←</span><b>پرونده</b></div>
        <p className="eyebrow">پرونده‌خوانی حقوق رقابت</p>
        <h1>{decision.title}</h1>
        <p>{decision.relation}</p>
        <Link className="back-to-commentary" href="/laws/article-44/decisions">بازگشت به آرای مرتبط ماده ۴۴ ←</Link>
      </section>
      <section className="decision-content">
        {decision.stages.map((stage, index) => <Stage record={stage} index={index} total={decision.stages.length} key={`${slug}-${index}`} />)}
        <RelatedCommentary decision={decision} />
      </section>
    </>
  );
}

import Link from "next/link";
import { decisionRecords, type DecisionRecord, type ParsedDecision } from "@/app/decision-data";
import { toFaDate, toFaDigits } from "@/app/text";
import {
  institutionsForDocument,
  marketsForDocument,
  provisionsForDocument,
  topicsForDocument,
} from "@/lib/knowledge/queries";
import { EditorialMeta } from "@/components/editorial-meta";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { JsonLd } from "@/components/json-ld";
import { AUTHOR, SITE_NAME, SITE_URL } from "@/lib/site";

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
      {meta["نشانی رسمی"] ? <a className="official-source" href={meta["نشانی رسمی"]} target="_blank" rel="noreferrer">مشاهده منبع رسمی ←</a> : null}
    </article>
  );
}

function KnowledgeConnections({ decision }: { decision: DecisionRecord }) {
  const institutions = institutionsForDocument(decision.id);
  const provisions = provisionsForDocument(decision.id);
  const topics = topicsForDocument(decision.id);
  const markets = marketsForDocument(decision.id);
  return (
    <section className="knowledge-connections" aria-labelledby="connections-title">
      <div className="knowledge-connections-heading">
        <p className="eyebrow">ارتباطات حقوقی</p>
        <h2 id="connections-title">ارتباطات این پرونده</h2>
      </div>
      <div className="connection-groups">
        <div><span>نهاد صادرکننده</span><div>{institutions.map((institution) => <Link href={institution.route} key={institution.id}>{institution.shortName}</Link>)}</div></div>
        <div><span>مواد و اجزای مرتبط</span><div>{provisions.map(({ provision }) => provision.status === "published" ? <Link href={provision.route} key={provision.id}>{provision.label}</Link> : <span className="connection-pending" key={provision.id}>{provision.label}</span>)}</div></div>
        <div><span>موضوعات</span><div>{topics.map((topic) => <Link href={topic.route} key={topic.id}>{topic.title}</Link>)}</div></div>
        <div><span>بازارها</span><div>{markets.map((market) => <Link href={market.route} key={market.id}>{market.title}</Link>)}</div></div>
      </div>
    </section>
  );
}

export function DecisionPage({ slug }: { slug: string }) {
  const decision = decisionRecords[slug];
  const first = decision.stages[0];
  const decisionNumber = toFaDigits(decision.stages.map((stage) => stage.meta["شماره جلسه/رأی"]).filter(Boolean).join(" و "));
  const citation = `${AUTHOR.name}، «${decision.title}»، پرونده‌خوانی رأی ${decisionNumber}، ${SITE_NAME}، ${SITE_URL}${decision.route}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: decision.title,
    description: decision.relation,
    inLanguage: "fa-IR",
    mainEntityOfPage: `${SITE_URL}${decision.route}`,
    author: { "@id": `${SITE_URL}/about#person` },
    publisher: { "@type": "Person", name: AUTHOR.name },
    about: topicsForDocument(decision.id).map((topic) => topic.title),
    isBasedOn: first.meta["نشانی رسمی"] || undefined,
  };
  return (
    <>
      <JsonLd data={jsonLd} />
      <BreadcrumbJsonLd items={[
        { name: "خانه", href: "/" },
        { name: "آرای منتخب", href: "/decisions" },
        { name: decision.title, href: decision.route },
      ]} />
      <section className="decision-hero">
        <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/decisions">آرای منتخب</Link><span>←</span><b>پرونده</b></div>
        <p className="eyebrow">پرونده‌خوانی حقوق رقابت</p>
        <h1>{decision.title}</h1>
        <p>{decision.relation}</p>
        <Link className="back-to-commentary" href="/decisions">بازگشت به فهرست آرا ←</Link>
      </section>
      <section className="decision-content">
        {decision.stages.map((stage, index) => <Stage record={stage} index={index} total={decision.stages.length} key={`${slug}-${index}`} />)}
        <EditorialMeta citation={citation} />
        <KnowledgeConnections decision={decision} />
      </section>
    </>
  );
}

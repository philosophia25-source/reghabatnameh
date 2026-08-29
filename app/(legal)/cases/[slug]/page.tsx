import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toFaDate, toFaDigits } from "@/app/text";
import { decisionRecords } from "@/app/decision-data";
import { caseBySlug, documentsForCase, publishedCases } from "@/lib/knowledge/queries";

export function generateStaticParams() {
  return publishedCases.map((caseRecord) => ({ slug: caseRecord.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const caseRecord = caseBySlug(slug);
  if (!caseRecord) return {};
  return {
    title: caseRecord.title,
    description: caseRecord.description,
    alternates: { canonical: caseRecord.route },
  };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caseRecord = caseBySlug(slug);
  if (!caseRecord) notFound();
  const documents = documentsForCase(caseRecord.id);

  return (
    <>
      <section className="decision-hero knowledge-hero">
        <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/decisions">آرای منتخب</Link><span>←</span><b>پرونده</b></div>
        <p className="eyebrow">زنجیره رسیدگی</p>
        <h1>{caseRecord.title}</h1>
        <p>{caseRecord.description}</p>
        <div className="law-meta"><span>مراحل منتشرشده <b>{toFaDigits(documents.length)}</b></span></div>
      </section>
      <section className="shell knowledge-detail">
        <div className="collection-heading">
          <p className="eyebrow">تصمیم‌های مستقل</p>
          <h2>مسیر بدوی و تجدیدنظر</h2>
          <span>هر رأی صفحه و نشانی مستقل خود را دارد.</span>
        </div>
        <div className="decision-grid">
          {documents.map((document) => {
            const decision = decisionRecords[document.slug];
            const stage = decision.stages[0];
            return <Link className="decision-card" href={document.route} key={document.id}>
              <span>{stage.meta["مرجع"]}</span>
              <h2>{toFaDigits(stage.meta["شماره جلسه/رأی"])}</h2>
              <p>{document.title}<br />{toFaDigits(stage.meta["نوع تصمیم"])} · {toFaDate(stage.meta["تاریخ"])}</p>
            </Link>;
          })}
        </div>
      </section>
    </>
  );
}

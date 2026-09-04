import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toFaDigits } from "@/app/text";
import { DecisionCollection } from "@/components/decision-collection";
import { ResolutionCollection } from "@/components/resolution-collection";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import {
  documentsForInstitution,
  domainById,
  institutionBySlug,
  provisionById,
  publishedInstitutions,
  topicById,
} from "@/lib/knowledge/queries";

export function generateStaticParams() {
  return publishedInstitutions.map((institution) => ({ slug: institution.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const institution = institutionBySlug(slug);
  if (!institution) return {};
  return {
    title: institution.name,
    description: institution.description,
    alternates: { canonical: institution.route },
  };
}

export default async function InstitutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const institution = institutionBySlug(slug);
  if (!institution) notFound();
  const documents = documentsForInstitution(institution.id);
  const decisions = documents.filter((document) => document.documentType === "decision");
  const resolutions = documents.filter((document) => document.documentType === "resolution");
  const domain = domainById(institution.domainId);
  const provisions = Array.from(new Set(documents.flatMap((document) => document.provisionLinks.map((link) => link.provisionId))))
    .map(provisionById).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const topics = Array.from(new Set(documents.flatMap((document) => document.topicIds)))
    .map(topicById).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const resolutionArchiveRoute = institution.id === "communications-regulatory-commission"
    ? "/resolutions/cra"
    : "/resolutions";
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "خانه", href: "/" },
        { name: "نهادها", href: "/institutions" },
        { name: institution.name, href: institution.route },
      ]} />
      <section className="decision-hero knowledge-hero">
        <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/institutions">نهادها</Link><span>←</span><b>{domain?.name}</b></div>
        <p className="eyebrow">نهاد</p>
        <h1>{institution.name}</h1>
        <p>{institution.description}</p>
        <div className="law-meta"><span>حوزه <b>{domain?.name}</b></span><span>اسناد منتشرشده <b>{toFaDigits(documents.length)}</b></span></div>
      </section>
      <section className="shell knowledge-detail">
        {provisions.length || topics.length ? (
          <div className="knowledge-summary-grid">
            <section><span>مواد مرتبط</span><div>{provisions.map((provision) => provision.status === "published" ? <Link href={provision.route} key={provision.id}>{provision.label}</Link> : <i key={provision.id}>{provision.label}</i>)}</div></section>
            <section><span>موضوعات پرتکرار</span><div>{topics.map((topic) => <Link href={topic.route} key={topic.id}>{topic.title}</Link>)}</div></section>
          </div>
        ) : null}
        {resolutions.length ? (
          <>
            <div className="collection-heading"><p className="eyebrow">آرشیو مصوبات</p><h2>تازه‌ترین مصوبات این نهاد</h2><span>متن کامل مصوبات و روابط ثبت‌شده میان اسناد در آرشیو تنظیم‌گری در دسترس است.</span></div>
            <ResolutionCollection documentIds={resolutions.map((document) => document.id)} />
            <Link className="collection-all-link" href={resolutionArchiveRoute}>ورود به آرشیو مصوبات ←</Link>
          </>
        ) : null}
        {decisions.length ? (
          <>
            <div className="collection-heading"><p className="eyebrow">اسناد منتخب</p><h2>آرا و تصمیمات مرتبط</h2><span>این فهرست گزینشی است و فقط اسناد دارای ارزش تحلیلی را در بر می‌گیرد.</span></div>
            <DecisionCollection documentIds={decisions.map((document) => document.id)} />
          </>
        ) : null}
      </section>
    </>
  );
}

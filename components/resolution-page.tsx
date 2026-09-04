import Link from "next/link";
import { toFaDate, toFaDigits } from "@/app/text";
import { JsonLd } from "@/components/json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { ResolutionActions } from "@/components/resolution-actions";
import {
  craConsolidationFor,
  craOcrOverrideFor,
  craOfficialRelationsFor,
  craResolutionByGuid,
  craSameSessionResolutionsFor,
  craSupplementalTextBacklinksFor,
  craSupplementalTextReferencesFor,
  readCraResolutionHtml,
} from "@/lib/cra/data";
import {
  CRA_ALL_RESOLUTIONS_ROUTE,
  CRA_ORGANIZATION_ROUTE,
  craCategoryForName,
  craCategoryRoute,
} from "@/lib/cra/categories";
import type {
  CraRelationTarget,
  CraResolution,
  CraTextReferenceTarget,
} from "@/lib/cra/types";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const relationLabels = {
  related: "اسناد مرتبط در سامانه رسمی",
  affects: "اسناد تاثیرپذیر در سامانه رسمی",
  influencedBy: "اسناد تاثیرگذار در سامانه رسمی",
  versions: "نسخه‌های ثبت‌شده در سامانه رسمی",
};

function ResolutionTargetLink({ target }: { target: CraRelationTarget }) {
  const local = craResolutionByGuid.get(target.targetGuid);
  if (!local) return null;
  return <Link href={local.route}>{toFaDigits(target.title || local.title)}</Link>;
}

function RelationLinks({ targets }: { targets: CraRelationTarget[] }) {
  return targets.map((target) => (
    <ResolutionTargetLink target={target} key={target.targetGuid} />
  ));
}

function TextReferenceLinks({ targets }: { targets: CraTextReferenceTarget[] }) {
  return (
    <ul className="resolution-text-reference-list">
      {targets.map((target) => (
        <li key={target.targetGuid}>
          <ResolutionTargetLink target={target} />
          <small>عبارت شناسایی‌شده در متن&nbsp; {toFaDigits(target.evidence)}</small>
        </li>
      ))}
    </ul>
  );
}

export function ResolutionPage({ resolution }: { resolution: CraResolution }) {
  const category = craCategoryForName(resolution.category);
  const categoryHref = category ? craCategoryRoute(category) : CRA_ALL_RESOLUTIONS_ROUTE;
  const body = resolution.contentAvailable ? readCraResolutionHtml(resolution) : "";
  const ocrOverride = craOcrOverrideFor(resolution);
  const hasEditorialConsolidation = Boolean(ocrOverride?.hasEditorialConsolidation);
  const consolidation = craConsolidationFor(resolution);
  const { relations, additions } = craOfficialRelationsFor(resolution);
  const relationGroups = Object.entries(relations)
    .filter(([, targets]) => targets.length) as [keyof typeof relationLabels, CraRelationTarget[]][];
  const reverseAdditionCount = Object.values(additions).reduce((count, targets) => count + targets.length, 0);
  const textReferences = craSupplementalTextReferencesFor(resolution);
  const textBacklinks = craSupplementalTextBacklinksFor(resolution);
  const sameSession = craSameSessionResolutionsFor(resolution);
  const sameSessionTargets = sameSession.map((item) => ({ targetGuid: item.guid, title: item.title }));
  const hasRelations = Boolean(
    consolidation.hasConsolidatedAttachment
    || consolidation.amendments.length
    || consolidation.bases.length
    || relationGroups.length
    || textReferences.length
    || textBacklinks.length
    || sameSession.length,
  );
  const relationSummary = [
    consolidation.hasConsolidatedAttachment ? "دارای پیوست تنقیحی" : "",
    consolidation.amendments.length ? `${toFaDigits(consolidation.amendments.length)} اصلاح بعدی` : "",
    consolidation.bases.length ? `${toFaDigits(consolidation.bases.length)} مصوبه پایه` : "",
    sameSession.length ? `${toFaDigits(sameSession.length)} مصوبه دیگر در همین جلسه` : "",
  ].filter(Boolean).join(" · ") || "روابط رسمی، ارجاعات متنی و مصوبات همین جلسه";
  const number = resolution.resolutionNumber ? `مصوبه شماره ${resolution.resolutionNumber}` : "مصوبه";
  const citation = `${number} جلسه شماره ${resolution.sessionNumber} کمیسیون تنظیم مقررات ارتباطات، مصوب ${resolution.approvalDate}، ${SITE_NAME}، ${SITE_URL}${resolution.route}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Legislation",
    name: resolution.title,
    legislationIdentifier: resolution.code,
    inLanguage: "fa-IR",
    mainEntityOfPage: `${SITE_URL}${resolution.route}`,
    isBasedOn: resolution.sourceUrl,
    legislationPassedBy: { "@type": "Organization", name: "کمیسیون تنظیم مقررات ارتباطات" },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <BreadcrumbJsonLd items={[
        { name: "خانه", href: "/" },
        { name: "مصوبات تنظیم‌گران", href: "/resolutions" },
        { name: "سازمان تنظیم مقررات", href: CRA_ORGANIZATION_ROUTE },
        { name: resolution.category, href: categoryHref },
        { name: toFaDigits(number), href: resolution.route },
      ]} />
      <section className="decision-hero resolution-hero">
        <div className="breadcrumbs">
          <Link href="/">خانه</Link><span>←</span>
          <Link href="/resolutions">مصوبات تنظیم‌گران</Link><span>←</span>
          <Link href={CRA_ORGANIZATION_ROUTE}>سازمان تنظیم مقررات</Link><span>←</span>
          <Link href={categoryHref}>{resolution.category}</Link><span>←</span>
          <b>{toFaDigits(number)}</b>
        </div>
        <p className="eyebrow">مصوبه کمیسیون تنظیم مقررات ارتباطات</p>
        <h1>{toFaDigits(resolution.title)}</h1>
        <p>{toFaDigits(resolution.code)}</p>
      </section>

      <section className="resolution-content">
        <ResolutionActions citation={toFaDigits(citation)} hasRelations={hasRelations} />

        <div className="resolution-disclosures">
          <details className="resolution-disclosure">
            <summary>
              <span>مشخصات مصوبه</span>
              <small>جلسه {toFaDigits(resolution.sessionNumber)} · {resolution.resolutionNumber ? `مصوبه ${toFaDigits(resolution.resolutionNumber)}` : "شماره مصوبه ثبت نشده"} · {resolution.approvalDate ? toFaDate(resolution.approvalDate) : "تاریخ ثبت نشده"}</small>
            </summary>
            <div className="resolution-disclosure-body">
              <div className="resolution-facts">
                <div><small>شماره جلسه</small><strong>{toFaDigits(resolution.sessionNumber)}</strong></div>
                <div><small>شماره مصوبه</small><strong>{resolution.resolutionNumber ? toFaDigits(resolution.resolutionNumber) : "ثبت نشده"}</strong></div>
                <div><small>تاریخ تصویب</small><strong>{resolution.approvalDate ? toFaDate(resolution.approvalDate) : "ثبت نشده"}</strong></div>
                <div><small>نسخه</small><strong>{toFaDigits(resolution.version)}</strong></div>
                <div><small>حوزه سند</small><strong>{resolution.category}</strong></div>
                <div><small>کد رسمی</small><strong>{toFaDigits(resolution.code)}</strong></div>
              </div>
              {resolution.keywords.length ? (
                <div className="resolution-keywords"><span>کلیدواژه‌های منبع</span><div>{resolution.keywords.map((keyword) => <i key={keyword}>{toFaDigits(keyword)}</i>)}</div></div>
              ) : null}
            </div>
          </details>

          <details className="resolution-disclosure" id="document-relations">
            <summary>
              <span>ارتباطات مصوبه</span>
              <small>{relationSummary}</small>
            </summary>
            <section className="resolution-connections" aria-label="روابط قابل اتکای مصوبه">
              {consolidation.hasConsolidatedAttachment ? (
                <div className="resolution-consolidated-status">
                  <strong>پیوست تنقیحی در منبع رسمی موجود است</strong>
                  <span>{hasEditorialConsolidation
                    ? "نسخه تنقیحی بازبینی‌شده نیز در ادامه همین صفحه با برچسب جدا نمایش داده می‌شود."
                    : "این تشخیص از نام رسمی پیوست گرفته شده است."}</span>
                </div>
              ) : null}

              {consolidation.amendments.length || consolidation.bases.length ? (
                <div className="resolution-relation-groups resolution-curated-relations">
                  {consolidation.amendments.length ? (
                    <div><span>این مصوبه به موجب اسناد زیر اصلاح شده است</span><div><RelationLinks targets={consolidation.amendments} /></div></div>
                  ) : null}
                  {consolidation.bases.length ? (
                    <div><span>این مصوبه، اسناد زیر را اصلاح کرده است</span><div><RelationLinks targets={consolidation.bases} /></div></div>
                  ) : null}
                </div>
              ) : null}

              {relationGroups.length ? (
                <div className="resolution-official-relations">
                  <p>روابط زیر عیناً از دسته‌بندی سامانه رسمی CRA گرفته شده‌اند و با روابط اصلاحی بالا یکی نیستند.</p>
                  <div className="resolution-relation-groups">
                    {relationGroups.map(([relation, targets]) => (
                      <div key={relation}><span>{relationLabels[relation]}</span><div><RelationLinks targets={targets} /></div></div>
                    ))}
                  </div>
                  {reverseAdditionCount ? <p className="resolution-relation-note">{toFaDigits(reverseAdditionCount)} رابطه از سمت دیگر همان رابطه تکمیل شده است.</p> : null}
                </div>
              ) : null}

              {textReferences.length || textBacklinks.length ? (
                <div className="resolution-text-relations">
                  {textReferences.length ? <div><h3>مصوباتی که در متن این سند نام برده شده‌اند</h3><TextReferenceLinks targets={textReferences} /></div> : null}
                  {textBacklinks.length ? <div><h3>مصوباتی که در متن خود به این سند اشاره کرده‌اند</h3><TextReferenceLinks targets={textBacklinks} /></div> : null}
                </div>
              ) : null}

              {sameSessionTargets.length ? (
                <div className="resolution-same-session">
                  <span>سایر مصوبات جلسه {toFaDigits(resolution.sessionNumber)}</span>
                  <div><RelationLinks targets={sameSessionTargets} /></div>
                </div>
              ) : null}
            </section>
          </details>
        </div>

        <article className="resolution-document" id="official-text">
          <div className="resolution-document-heading">
            <p className="eyebrow">{hasEditorialConsolidation ? "متن‌های سند" : "متن رسمی"}</p>
            <h2>متن مصوبه و پیوست‌ها</h2>
            <span>{hasEditorialConsolidation
              ? "متن‌های رسمی از فایل‌های منبع استخراج شده‌اند. نسخه تنقیحی غیررسمی جداگانه و با برچسب مشخص ارائه شده است."
              : ocrOverride
                ? "متن از فایل‌های منتشرشده در سامانه رسمی استخراج شده و تصاویر متن‌دار با نسخه متنی جایگزین شده‌اند."
                : "متن زیر بدون بازنویسی محتوایی از فایل‌های منتشرشده در سامانه رسمی استخراج شده است."}</span>
          </div>
          {body
            ? <div className="cra-document-html" dangerouslySetInnerHTML={{ __html: body }} />
            : <div className="resolution-no-text"><h3>این رکورد متن پیوست ندارد</h3><p>در صفحه رسمی این مصوبه فایل Word یا PDF قابل استخراج قرار نگرفته است.</p></div>}
        </article>

        <section className="resolution-source-box" id="official-source">
          <div><span>منبع رسمی</span><p>سامانه مدیریت اسناد سازمان تنظیم مقررات و ارتباطات رادیویی</p></div>
          <a href={resolution.sourceUrl} target="_blank" rel="noreferrer">مشاهده صفحه رسمی ←</a>
          {resolution.attachments.length ? (
            <div className="resolution-source-files">
              {resolution.attachments.map((attachment, index) => (
                <a href={attachment.url} target="_blank" rel="noreferrer" key={attachment.url}>
                  {/تنقیح/.test(attachment.name) ? "دریافت پیوست تنقیحی" : `دریافت پیوست ${toFaDigits(index + 1)}`} · {attachment.format.toLowerCase() === "pdf" ? "فایل PDF" : "فایل Word"}
                </a>
              ))}
            </div>
          ) : null}
        </section>

        <details className="resolution-citation"><summary>شیوه استناد به این صفحه</summary><p>{toFaDigits(citation)}</p></details>
      </section>
    </>
  );
}

import Link from "next/link";
import { toFaDate, toFaDigits } from "@/app/text";
import { JsonLd } from "@/components/json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { ResolutionActions } from "@/components/resolution-actions";
import {
  craInfluencePathFor,
  craNewerVersionFor,
  craOfficialRelationsFor,
  craResolutionByGuid,
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
  related: "اسناد مرتبط",
  affects: "اسناد تاثیرپذیر از این مصوبه",
  influencedBy: "اسناد تاثیرگذار بر این مصوبه",
  versions: "نسخه‌های دیگر",
};

function ResolutionTargetLink({ target }: { target: CraRelationTarget }) {
  const local = craResolutionByGuid.get(target.targetGuid);
  const label = target.title || local?.title || "مشاهده سند در سامانه رسمی";
  return local
    ? <Link href={local.route}>{toFaDigits(label)}</Link>
    : <a href={`https://asnad.cra.gov.ir/fa/Public/Documents/Details/${target.targetGuid}`} target="_blank" rel="noreferrer">{toFaDigits(label)}</a>;
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
  const { relations, additions } = craOfficialRelationsFor(resolution);
  const relationGroups = Object.entries(relations)
    .filter(([, targets]) => targets.length) as [keyof typeof relationLabels, CraRelationTarget[]][];
  const reverseAdditionCount = Object.values(additions).reduce((count, targets) => count + targets.length, 0);
  const textReferences = craSupplementalTextReferencesFor(resolution);
  const textBacklinks = craSupplementalTextBacklinksFor(resolution);
  const influencePath = craInfluencePathFor(resolution);
  const directInfluenceCount = influencePath.filter((item) => item.direct).length;
  const newerVersion = craNewerVersionFor(resolution);
  const hasRelations = Boolean(relationGroups.length || textReferences.length || textBacklinks.length);
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
        <Link className="back-to-commentary" href={categoryHref}>بازگشت به مصوبات {resolution.category} ←</Link>
      </section>

      <section className="resolution-content">
        <ResolutionActions citation={toFaDigits(citation)} hasRelations={hasRelations} />

        <div className="resolution-facts">
          <div><small>شماره جلسه</small><strong>{toFaDigits(resolution.sessionNumber)}</strong></div>
          <div><small>شماره مصوبه</small><strong>{resolution.resolutionNumber ? toFaDigits(resolution.resolutionNumber) : "ثبت نشده"}</strong></div>
          <div><small>تاریخ تصویب</small><strong>{resolution.approvalDate ? toFaDate(resolution.approvalDate) : "ثبت نشده"}</strong></div>
          <div><small>نسخه</small><strong>{toFaDigits(resolution.version)}</strong></div>
          <div><small>حوزه سند</small><strong>{resolution.category}</strong></div>
          <div><small>کد رسمی</small><strong>{toFaDigits(resolution.code)}</strong></div>
        </div>

        <section className="resolution-overview" aria-labelledby="resolution-overview-title">
          <div className="knowledge-connections-heading">
            <p className="eyebrow">در یک نگاه</p>
            <h2 id="resolution-overview-title">وضعیت مراجعه به سند</h2>
          </div>
          <div className="resolution-overview-grid">
            <div>
              <span>وضعیت نسخه</span>
              <strong>{newerVersion ? "نسخه جدیدتری در سامانه وجود دارد" : relations.versions.length ? "نسخه جدیدتری شناسایی نشد" : "نسخه دیگری در سامانه ثبت نشده"}</strong>
              {newerVersion ? <ResolutionTargetLink target={newerVersion} /> : <small>این عبارت فقط ناظر به نسخه‌های ثبت‌شده در داده منبع است</small>}
            </div>
            <div>
              <span>اسناد تاثیرگذار</span>
              <strong>{influencePath.length ? `${toFaDigits(influencePath.length)} سند در زنجیره تاثیرگذاری` : "سندی ثبت نشده است"}</strong>
              <small>{directInfluenceCount ? `${toFaDigits(directInfluenceCount)} رابطه مستقیم و ${toFaDigits(influencePath.length - directInfluenceCount)} رابطه ادامه زنجیره` : "نبود رابطه ثبت‌شده به معنی تایید اعتبار جاری مصوبه نیست"}</small>
            </div>
            <div>
              <span>ساختار متن</span>
              <strong>{resolution.contentAvailable ? `${toFaDigits(resolution.readingMeta.wordCount)} واژه در ${toFaDigits(resolution.readingMeta.attachmentSectionCount)} پیوست` : "پیوست متنی در منبع موجود نیست"}</strong>
              <small>{`${toFaDigits(resolution.readingMeta.tableCount)} جدول و ${toFaDigits(resolution.readingMeta.imageCount)} تصویر`}</small>
            </div>
            <div>
              <span>وضعیت تنقیح</span>
              <strong>{influencePath.length ? "متن تنقیح‌شده تاییدشده موجود نیست" : "نیاز به تنقیح از داده منبع احراز نشد"}</strong>
              <small>{influencePath.length ? "متن پایه و زنجیره اسناد تاثیرگذار جداگانه ارائه شده‌اند" : "برای استناد حقوقی، بررسی منابع دیگر همچنان لازم است"}</small>
            </div>
          </div>

          {influencePath.length ? (
            <div className="resolution-reading-path">
              <div>
                <h3>مسیر مطالعه برای بررسی آخرین وضعیت</h3>
                <p>این مسیر از برچسب «اسناد تاثیرگذار» سامانه CRA ساخته شده است. ترتیب زیر جای متن تنقیح‌شده یا احراز اعتبار حقوقی را نمی‌گیرد.</p>
              </div>
              <ol>
                <li className="current"><span>متن پایه</span><strong>{toFaDigits(resolution.title)}</strong><small>{resolution.approvalDate ? toFaDate(resolution.approvalDate) : "تاریخ ثبت نشده"}</small></li>
                {influencePath.map((item) => {
                  const local = craResolutionByGuid.get(item.target.targetGuid);
                  return (
                    <li key={item.target.targetGuid}>
                      <span>{item.direct ? "سند تاثیرگذار مستقیم" : `ادامه زنجیره در سطح ${toFaDigits(item.depth)}`}</span>
                      <strong><ResolutionTargetLink target={item.target} /></strong>
                      <small>{local?.approvalDate ? toFaDate(local.approvalDate) : "جزئیات در منبع رسمی"}</small>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}
        </section>

        {resolution.keywords.length ? (
          <div className="resolution-keywords"><span>کلیدواژه‌های منبع</span><div>{resolution.keywords.map((keyword) => <i key={keyword}>{toFaDigits(keyword)}</i>)}</div></div>
        ) : null}

        <article className="resolution-document" id="official-text">
          <div className="resolution-document-heading">
            <p className="eyebrow">متن رسمی</p>
            <h2>متن مصوبه و پیوست‌ها</h2>
            <span>متن زیر بدون بازنویسی محتوایی از فایل‌های منتشرشده در سامانه رسمی استخراج شده است.</span>
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
              {resolution.attachments.map((attachment) => (
                <a href={attachment.url} target="_blank" rel="noreferrer" key={attachment.url}>{attachment.format} · {toFaDigits(attachment.name)}</a>
              ))}
            </div>
          ) : null}
        </section>

        {hasRelations ? (
          <section className="resolution-relations" id="document-relations" aria-labelledby="resolution-relations-title">
            <div className="knowledge-connections-heading">
              <p className="eyebrow">ارتباطات مصوبات</p>
              <h2 id="resolution-relations-title">روابط و ارجاعات قابل ردیابی</h2>
              <p>روابط رسمی از برچسب‌های CRA گرفته شده‌اند. ارجاعات متنی فقط وجود اشاره صریح به شماره مصوبه و جلسه را نشان می‌دهند و نوع اثر حقوقی را تعیین نمی‌کنند.</p>
            </div>
            {relationGroups.length ? (
              <div className="resolution-relation-groups">
                {relationGroups.map(([relation, targets]) => (
                  <div key={relation}><span>{relationLabels[relation]}</span><div><RelationLinks targets={targets} /></div></div>
                ))}
              </div>
            ) : null}
            {reverseAdditionCount ? <p className="resolution-relation-note">{toFaDigits(reverseAdditionCount)} رابطه با خواندن دوسویه صفحات منبع تکمیل شده است.</p> : null}
            {textReferences.length || textBacklinks.length ? (
              <div className="resolution-text-relations">
                {textReferences.length ? <div><h3>ارجاع‌های افزوده‌شده از متن این سند</h3><TextReferenceLinks targets={textReferences} /></div> : null}
                {textBacklinks.length ? <div><h3>اسنادی که در متن خود به این مصوبه اشاره کرده‌اند</h3><TextReferenceLinks targets={textBacklinks} /></div> : null}
              </div>
            ) : null}
          </section>
        ) : null}

        <details className="resolution-citation"><summary>شیوه استناد به این صفحه</summary><p>{toFaDigits(citation)}</p></details>
      </section>
    </>
  );
}

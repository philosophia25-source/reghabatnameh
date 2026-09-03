import type { Metadata } from "next";
import { toFaDigits } from "@/app/text";
import { ResolutionExplorer, type ResolutionExplorerItem } from "@/components/resolution-explorer";
import {
  craInfluencePathFor,
  craNewerVersionFor,
  craResolutions,
  craSupplementalTextReferencesFor,
} from "@/lib/cra/data";

export const metadata: Metadata = {
  title: "مصوبات کمیسیون تنظیم مقررات ارتباطات",
  description: "متن قابل جست‌وجوی مصوبات کمیسیون تنظیم مقررات ارتباطات همراه با وضعیت نسخه، زنجیره تاثیرگذاری و ارجاعات میان اسناد",
  alternates: { canonical: "/resolutions" },
};

export default function ResolutionsPage() {
  const items: ResolutionExplorerItem[] = craResolutions.map((resolution) => ({
    href: resolution.route,
    title: resolution.title,
    code: resolution.code,
    category: resolution.category,
    year: resolution.year,
    sessionNumber: resolution.sessionNumber,
    resolutionNumber: resolution.resolutionNumber,
    approvalDate: resolution.approvalDate,
    version: resolution.version,
    keywords: resolution.keywords,
    influenceCount: craInfluencePathFor(resolution).length,
    hasNewerVersion: Boolean(craNewerVersionFor(resolution)),
    supplementalReferenceCount: craSupplementalTextReferencesFor(resolution).length,
    tableCount: resolution.readingMeta.tableCount,
  }));
  return (
    <section className="shell listing-page resolutions-page">
      <p className="kicker">تنظیم‌گری ارتباطات</p>
      <h1>مصوبات کمیسیون تنظیم مقررات ارتباطات</h1>
      <p className="lead">آرشیو {toFaDigits(craResolutions.length)} مصوبه با متن خوانا و قابل جست‌وجو، وضعیت نسخه، زنجیره اسناد تاثیرگذار و ارجاع‌های صریحی که از داخل متن مصوبات شناسایی شده‌اند.</p>
      <ResolutionExplorer items={items} />
    </section>
  );
}

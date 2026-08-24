import type { Metadata } from "next";
import Link from "next/link";
import { toFaDigits } from "@/app/text";
import { decisionIndexRecords } from "@/app/decision-data";
import { commentaryParts } from "@/lib/knowledge/article44";
import { legalSources } from "@/lib/knowledge/registry";

const law = legalSources.find((item) => item.id === "general-policies-44-law")!;

export const metadata: Metadata = { title: law.title, description: "مواد منتخب مرتبط با رقابت، شرح تحلیلی و آرای مرتبط", alternates: { canonical: law.route } };

export default function GeneralPoliciesLawPage() {
  const publishedCommentaries = commentaryParts.filter((part) => part.available).length;
  return <><section className="decision-hero knowledge-hero"><div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><Link href="/laws">قوانین</Link><span>←</span><b>قانون</b></div><p className="eyebrow">مجموعه قانونی</p><h1>{law.shortTitle}</h1><p>مواد دارای اهمیت برای حقوق رقابت به‌تدریج همراه با شرح، آرای منتخب و ارتباطات موضوعی در این مجموعه منتشر می‌شوند.</p><div className="law-meta"><span>مواد منتشرشده <b>۱</b></span><span>شرح‌های منتشرشده <b>{toFaDigits(publishedCommentaries)}</b></span><span>پرونده‌های مرتبط <b>{toFaDigits(decisionIndexRecords.length)}</b></span></div></section><section className="shell knowledge-detail"><div className="knowledge-card-grid"><Link className="knowledge-card law-knowledge-card" href="/laws/article-44"><small>ماده منتشرشده</small><h2>ماده ۴۴</h2><p>توافق‌ها و هماهنگی‌های اخلال‌گر در رقابت، با شرح جزءبه‌جزء و آرای منتخب</p><b>ورود به متن، شرح و آرا ←</b></Link></div></section></>;
}

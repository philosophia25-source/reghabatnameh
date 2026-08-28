import type { CommentaryRecord, Provision } from "./types";
import { CONTENT_UPDATED_ISO } from "@/lib/site";

export const ARTICLE_44_ID = "general-policies-44:article-44";

export const article44Paragraphs = [
  "هرگونه تبانی از طریق قرارداد، توافق و یا تفاهم (اعم از کتبی، الکترونیکی، شفاهی و یا عملی) بین اشخاص که یک یا چند اثر زیر را به دنبال داشته باشد به نحوی که نتیجه آن بتواند اخلال در رقابت باشد ممنوع است",
  "۱ـ مشخص کردن قیمت‌های خرید یا فروش کالا یا خدمت و نحوه تعیین آن در بازار به طور مستقیم یا غیرمستقیم.",
  "۲ـ محدود کردن یا تحت کنترل درآوردن مقدار تولید، خرید یا فروش کالا یا خدمت در بازار.",
  "۳ـ تحمیل شرایط تبعیض‌آمیز در معاملات همسان به طرف‌های تجاری.",
  "۴ـ ملزم کردن طرف معامله به عقد قرارداد با اشخاص ثالث یا تحمیل کردن شروط قرارداد به آنها.",
  "۵ـ موکول کردن انعقاد قرارداد به قبول تعهدات تکمیلی توسط طرف‌های دیگر که بنا بر عرف تجاری با موضوع قرارداد ارتباطی ندارد.",
  "۶ـ تقسیم یا تسهیم بازار کالا یا خدمت بین دو یا چند شخص.",
  "۷ـ محدود کردن دسترسی اشخاص خارج از قرارداد، توافق یا تفاهم به بازار.",
];

export const article44Note = "قراردادهای میان تشکل‌های کارگری و کارفرمایی به‌منظور تعیین دستمزد و مزایا، تابع قانون کار است.";

export type CommentaryPart = {
  slug: string;
  shortLabel: string;
  title: string;
  description: string;
  available: boolean;
  provisionId: string;
};

export const commentaryParts: CommentaryPart[] = [
  { slug: "chapeau", shortLabel: "صدر ماده", title: "شرح صدر ماده ۴۴", description: "مفهوم هماهنگی، انواع توافق، قلمرو اشخاص و قابلیت اخلال در رقابت", available: true, provisionId: `${ARTICLE_44_ID}:chapeau` },
  { slug: "clause-1", shortLabel: "بند ۱", title: "تعیین قیمت", description: "مشخص‌کردن مستقیم یا غیرمستقیم قیمت خرید یا فروش", available: true, provisionId: `${ARTICLE_44_ID}:clause-1` },
  { slug: "clause-2", shortLabel: "بند ۲", title: "محدودکردن تولید، خرید یا فروش", description: "کنترل مقدار کالا یا خدمت در بازار", available: true, provisionId: `${ARTICLE_44_ID}:clause-2` },
  { slug: "clause-3", shortLabel: "بند ۳", title: "شرایط تبعیض‌آمیز", description: "تحمیل شرایط متفاوت در معاملات همسان", available: true, provisionId: `${ARTICLE_44_ID}:clause-3` },
  { slug: "clause-4", shortLabel: "بند ۴", title: "الزام به معامله با شخص ثالث", description: "تحمیل طرف قرارداد یا شروط قراردادی به دیگران", available: true, provisionId: `${ARTICLE_44_ID}:clause-4` },
  { slug: "clause-5", shortLabel: "بند ۵", title: "تعهدات تکمیلی نامرتبط", description: "موکول‌کردن قرارداد به پذیرش تعهدات خارج از موضوع", available: true, provisionId: `${ARTICLE_44_ID}:clause-5` },
  { slug: "clause-6", shortLabel: "بند ۶", title: "تقسیم یا تسهیم بازار", description: "تقسیم بازار کالا یا خدمت میان اشخاص", available: true, provisionId: `${ARTICLE_44_ID}:clause-6` },
  { slug: "clause-7", shortLabel: "بند ۷", title: "محدودکردن دسترسی به بازار", description: "ممانعت از دسترسی اشخاص خارج از توافق", available: true, provisionId: `${ARTICLE_44_ID}:clause-7` },
  { slug: "note", shortLabel: "تبصره", title: "قراردادهای کارگری و کارفرمایی", description: "قلمرو استثنا و ارتباط آن با قانون کار", available: true, provisionId: `${ARTICLE_44_ID}:note` },
];

export const article44Provisions: Provision[] = [
  {
    id: ARTICLE_44_ID,
    legalSourceId: "general-policies-44-law",
    slug: "article-44",
    label: "ماده ۴۴",
    title: "توافق‌ها و هماهنگی‌های اخلال‌گر در رقابت",
    description: "متن ماده، شرح جزءبه‌جزء و آرای منتخب مرتبط",
    route: "/laws/article-44",
    status: "published",
  },
  ...commentaryParts.map((part) => ({
    id: part.provisionId,
    legalSourceId: "general-policies-44-law",
    parentId: ARTICLE_44_ID,
    slug: part.slug,
    label: part.shortLabel,
    title: part.title,
    description: part.description,
    route: `/laws/article-44/commentary/${part.slug}`,
    status: (part.available ? "published" : "draft") as "published" | "draft",
  })),
];

export const article44Commentaries: CommentaryRecord[] = commentaryParts.map((part) => ({
  id: `commentary:${part.provisionId}`,
  provisionId: part.provisionId,
  title: part.title,
  route: `/laws/article-44/commentary/${part.slug}`,
  contentFile: part.available ? (part.slug === "chapeau" ? "commentary44.md" : `commentary44-${part.slug}.md`) : undefined,
  updatedAt: part.available ? CONTENT_UPDATED_ISO : undefined,
  status: part.available ? "published" : "draft",
}));

export const provisionIdByCommentarySlug = Object.fromEntries(commentaryParts.map((part) => [part.slug, part.provisionId]));
export const commentarySlugByProvisionId = Object.fromEntries(commentaryParts.map((part) => [part.provisionId, part.slug]));

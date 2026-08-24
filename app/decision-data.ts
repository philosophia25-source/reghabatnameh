import { readFileSync } from "node:fs";
import { join } from "node:path";

export type ParsedDecision = {
  meta: Record<string, string>;
  body: string;
};

export type DecisionRecord = {
  slug: string;
  title: string;
  relation: string;
  commentaryParts: string[];
  stages: ParsedDecision[];
};

type DecisionManifestItem = {
  slug: string;
  title: string;
  files: string[];
  commentaryParts?: string[];
  relation?: string;
};

const manifest: DecisionManifestItem[] = [
  { slug: "821", title: "الزام سایپا به قرارداد با شرکت منتخب پسماند", files: ["821.txt"], commentaryParts: ["clause-4", "clause-6", "clause-7"] },
  { slug: "779", title: "عرضه مجدد برند در پلتفرم ترب", files: ["779.txt"] },
  { slug: "776", title: "انحصار تهیه طرح‌های توجیهی بانکی", files: ["776.txt"], commentaryParts: ["clause-6", "clause-7"] },
  { slug: "722", title: "امتناع اپراتورها از ارائه بستر خدمات صوتی", files: ["722.txt"], commentaryParts: ["clause-2"] },
  { slug: "641", title: "محدودیت مهندسان ناظر جدیدالورود", files: ["641.txt"], commentaryParts: ["clause-6"] },
  { slug: "624", title: "سهمیه‌بندی بازار نصب آسانسور", files: ["624.txt"], commentaryParts: ["clause-2", "clause-6"] },
  { slug: "appeal-162-02", title: "محدودیت واردات قطعات آسانسور", files: ["appeal-162-02.txt"], commentaryParts: ["clause-2"] },
  { slug: "606", title: "سقف حق‌التحریر دفاتر اسناد رسمی", files: ["606.txt"] },
  { slug: "599", title: "لزوم انتساب رفتار به بنگاه مسلط", files: ["599.txt"], commentaryParts: ["clause-7"] },
  { slug: "580", title: "انحصار واردات نهاده‌های دامی", files: ["580.txt"], commentaryParts: ["clause-7"] },
  { slug: "562", title: "رد شکایت سامانه سوئیچ بیمه", files: ["562.txt"] },
  { slug: "522", title: "واگذاری طرح‌های پژوهشی صنعت نفت", files: ["522.txt"], commentaryParts: ["clause-7"] },
  { slug: "631", title: "تفاهم انحصاری در زنجیره نخ تایر", files: ["631.txt"], commentaryParts: ["clause-7"], relation: "احراز توافق محدودکننده و بررسی رابطه شرکت مادر و شرکت‌های وابسته" },
  { slug: "504", title: "تعیین قیمت و سهمیه لباس مدارس", files: ["504.txt"], commentaryParts: ["clause-1"] },
  { slug: "476", title: "ارجاع کار مهندسی در استان سمنان", files: ["476.txt"], commentaryParts: ["chapeau", "clause-2", "clause-6"] },
  { slug: "466", title: "انحصار نرم‌افزار LIMS آزمایشگاهی", files: ["466.txt"], commentaryParts: ["clause-7"] },
  { slug: "445", title: "امحای جوجه یک‌روزه برای کنترل قیمت", files: ["445.txt"], commentaryParts: ["clause-2"] },
  { slug: "437", title: "شکایت از ایرانسل بابت امتناع از همکاری", files: ["437.txt"], commentaryParts: ["clause-2"], relation: "رد تبانی و تفکیک رفتار هماهنگ از استنکاف یک‌جانبه" },
  { slug: "429", title: "قدرت مسلط و قیمت‌گذاری تهاجمی در خرید توتون", files: ["429.txt"], commentaryParts: ["clause-1", "clause-2"] },
  { slug: "421", title: "ظرفیت وکالت و دامنه ماده ۷", files: ["421.txt"], commentaryParts: ["clause-2", "clause-7"] },
  { slug: "403", title: "قراردادهای جایگاه‌داری سوخت", files: ["403.txt"], commentaryParts: ["clause-3"] },
  { slug: "354", title: "تبعیض در مزایده تبلیغات شهری", files: ["354.txt"], commentaryParts: ["clause-3"] },
  { slug: "sugar", title: "بازار شکر و انحصار واردات", files: ["sugar-296.txt", "sugar-appeal.txt"], commentaryParts: ["clause-6"], relation: "نمونه تعارض تحلیلی میان تصمیم بدوی و رأی هیئت تجدیدنظر" },
  { slug: "270", title: "پرونده جامع بازار فولاد", files: ["270.txt"] },
  { slug: "236", title: "پرونده ارزی ۶۵۰ میلیون یورویی", files: ["236.txt"], commentaryParts: ["clause-3", "clause-7"] },
  { slug: "232", title: "تعیین قیمت صنفی لوح فشرده", files: ["232.txt"], commentaryParts: ["clause-2", "clause-6", "clause-7"] },
];

function parseDecision(raw: string): ParsedDecision {
  const [head, ...bodyParts] = raw.replace(/^﻿/, "").split(/={20,}/);
  const meta: Record<string, string> = {};
  head.split("\n").forEach((line) => {
    const separator = line.indexOf(":");
    if (separator > 0) meta[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  });
  return {
    meta,
    body: bodyParts.join("\n").replace(/^\s*متن کامل موضوع\s*/m, "").trim(),
  };
}

function readDecision(name: string) {
  return parseDecision(readFileSync(join(process.cwd(), "content/decisions", name), "utf8"));
}

export const decisionRecords: Record<string, DecisionRecord> = Object.fromEntries(
  manifest.map((item) => {
    const stages = item.files.map(readDecision);
    return [item.slug, {
      slug: item.slug,
      title: item.title,
      relation: item.relation ?? "متن کامل تصمیم، مشخصات پرونده و ارتباط آن با ماده ۴۴",
      commentaryParts: item.commentaryParts ?? [],
      stages,
    }];
  }),
);

export const decisionSlugs = manifest.map((item) => item.slug);

export const decisionIndexRecords = manifest.map((item) => {
  const record = decisionRecords[item.slug];
  const first = record.stages[0].meta;
  const numbers = record.stages.map((stage) => stage.meta["شماره جلسه/رأی"]).filter(Boolean);
  return {
    slug: item.slug,
    href: `/decisions/${item.slug}`,
    title: item.title,
    number: numbers.join(" و "),
    authority: first["مرجع"],
    date: first["تاریخ"],
    type: first["نوع تصمیم"],
    regulations: record.stages.map((stage) => stage.meta["مقررات مرتبط"]).filter(Boolean).join("، "),
    relation: record.relation,
  };
});

function faDigits(value: string) {
  return value.replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export const decisionRouteByMention: Record<string, string> = Object.fromEntries(
  manifest.flatMap((item) => decisionRecords[item.slug].stages.flatMap((stage) => {
    const raw = stage.meta["شماره جلسه/رأی"] ?? "";
    const number = faDigits(raw.replace(/^رأی\s*/, "").trim());
    const href = `/decisions/${item.slug}`;
    return [
      [`رأی شماره ${number}`, href],
      [`رأی ${number}`, href],
      [`تصمیم شماره ${number}`, href],
      [`تصمیم ${number}`, href],
    ];
  })),
);

export function decisionDescription(record: DecisionRecord) {
  const first = record.stages[0].meta;
  return `${record.title}، ${first["مرجع"]}، ${first["نوع تصمیم"]} و ارتباط با ماده ۴۴ قانون اجرای سیاست‌های کلی اصل ۴۴`;
}

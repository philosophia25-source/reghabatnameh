import {
  ARTICLE_44_ID,
  article44Commentaries,
  article44Provisions,
  provisionIdByCommentarySlug,
} from "./article44";
import {
  article45Commentaries,
  article45Provisions,
  article45ProvisionIdBySlug,
} from "./article45";
import type {
  InstitutionalDomain,
  Institution,
  KnowledgeArticle,
  KnowledgeDocument,
  LegalSource,
  Market,
  Topic,
} from "./types";
import { validateKnowledgeRegistry } from "./validate";
import { CONTENT_UPDATED_ISO } from "@/lib/site";

export const institutionalDomains: InstitutionalDomain[] = [
  {
    id: "competition-regulation",
    name: "نظام رقابت",
    description: "شورای رقابت، هیئت تجدیدنظر و اسناد منتخب مرتبط با اجرای حقوق رقابت",
    memberIds: ["competition-council", "competition-appeal-board"],
    status: "published",
  },
  {
    id: "communications-regulation",
    name: "تنظیم‌گری ارتباطات",
    description: "سازمان تنظیم مقررات و ارتباطات رادیویی و کمیسیون تنظیم مقررات ارتباطات",
    memberIds: ["communications-regulatory-authority", "communications-regulatory-commission"],
    status: "draft",
  },
];

export const institutions: Institution[] = [
  {
    id: "competition-council",
    slug: "competition-council",
    name: "شورای رقابت",
    shortName: "شورای رقابت",
    kind: "competition-authority",
    domainId: "competition-regulation",
    description: "مرجع صادرکننده آرای منتخب گردآوری‌شده در رقابت‌نامه",
    route: "/institutions/competition-council",
    status: "published",
  },
  {
    id: "competition-appeal-board",
    slug: "competition-appeal-board",
    name: "هیئت تجدیدنظر شورای رقابت",
    shortName: "هیئت تجدیدنظر",
    kind: "appeal-body",
    domainId: "competition-regulation",
    description: "مرجع رسیدگی تجدیدنظر به تصمیمات شورای رقابت در پرونده‌های منتخب",
    route: "/institutions/competition-appeal-board",
    status: "published",
  },
  {
    id: "communications-regulatory-authority",
    slug: "communications-regulatory-authority",
    name: "سازمان تنظیم مقررات و ارتباطات رادیویی",
    shortName: "سازمان تنظیم مقررات",
    kind: "sector-regulator",
    domainId: "communications-regulation",
    description: "نهاد اجرایی تنظیم‌گری بخش ارتباطات و رادیویی",
    route: "/institutions/communications-regulatory-authority",
    status: "draft",
  },
  {
    id: "communications-regulatory-commission",
    slug: "communications-regulatory-commission",
    name: "کمیسیون تنظیم مقررات ارتباطات",
    shortName: "کمیسیون تنظیم مقررات",
    kind: "regulatory-commission",
    domainId: "communications-regulation",
    description: "رکن تصویب مصوبات منتخب تنظیم‌گری ارتباطات",
    route: "/institutions/communications-regulatory-commission",
    status: "draft",
  },
];

export const legalSources: LegalSource[] = [
  {
    id: "general-policies-44-law",
    slug: "general-policies-44",
    title: "قانون اجرای سیاست‌های کلی اصل چهل‌وچهار قانون اساسی",
    shortTitle: "قانون اجرای سیاست‌های کلی اصل ۴۴",
    kind: "law",
    route: "/laws/general-policies-44",
    status: "published",
  },
];

export const provisions = [...article44Provisions, ...article45Provisions];
export const commentaries = [...article44Commentaries, ...article45Commentaries];

export const topics: Topic[] = [
  { id: "anti-competitive-coordination", slug: "anti-competitive-coordination", title: "توافق و هماهنگی ضدرقابتی", description: "مفهوم توافق، تفاهم، تبانی و رفتار هماهنگ موضوع ماده ۴۴", route: "/topics/anti-competitive-coordination", status: "published" },
  { id: "price-fixing", slug: "price-fixing", title: "تعیین قیمت", description: "تعیین مستقیم یا غیرمستقیم قیمت خرید یا فروش", route: "/topics/price-fixing", status: "published" },
  { id: "output-restriction", slug: "output-restriction", title: "محدودکردن تولید یا عرضه", description: "کنترل مقدار تولید، خرید یا فروش کالا و خدمت", route: "/topics/output-restriction", status: "published" },
  { id: "discriminatory-conditions", slug: "discriminatory-conditions", title: "شرایط تبعیض‌آمیز", description: "تحمیل شرایط متفاوت در معاملات همسان", route: "/topics/discriminatory-conditions", status: "published" },
  { id: "third-party-dealing", slug: "third-party-dealing", title: "الزام به معامله با شخص ثالث", description: "تحمیل طرف قرارداد یا شروط قراردادی به دیگران", route: "/topics/third-party-dealing", status: "published" },
  { id: "supplementary-obligations", slug: "supplementary-obligations", title: "تعهدات تکمیلی نامرتبط", description: "موکول‌کردن قرارداد به پذیرش تعهداتی که بنا بر عرف تجاری با موضوع آن ارتباط ندارند", route: "/topics/supplementary-obligations", status: "published" },
  { id: "market-allocation", slug: "market-allocation", title: "تقسیم بازار", description: "تقسیم یا تسهیم بازار کالا و خدمت میان اشخاص", route: "/topics/market-allocation", status: "published" },
  { id: "market-access", slug: "market-access", title: "دسترسی و ورود به بازار", description: "محدودیت ورود، مجوز، حذف رقیب و دسترسی به بازار", route: "/topics/market-access", status: "published" },
];

export const markets: Market[] = [
  { id: "communications", slug: "communications", title: "ارتباطات", description: "بازارهای ارتباطی، اپراتورها و دسترسی به زیرساخت", route: "/markets/communications", status: "published" },
  { id: "digital-markets", slug: "digital-markets", title: "بازارهای دیجیتال", description: "پلتفرم‌ها، نرم‌افزارها و خدمات داده‌محور", route: "/markets/digital-markets", status: "published" },
  { id: "professional-services", slug: "professional-services", title: "خدمات حرفه‌ای", description: "وکالت، مهندسی، دفاتر اسناد رسمی و سایر خدمات حرفه‌ای", route: "/markets/professional-services", status: "published" },
  { id: "agriculture-food", slug: "agriculture-food", title: "کشاورزی و غذا", description: "شکر، نهاده‌های دامی، طیور و محصولات کشاورزی", route: "/markets/agriculture-food", status: "published" },
  { id: "industry", slug: "industry", title: "صنعت و تولید", description: "فولاد، تایر، تجهیزات و محصولات صنعتی", route: "/markets/industry", status: "published" },
  { id: "finance-insurance", slug: "finance-insurance", title: "مالی، بانکی و بیمه", description: "خدمات بانکی، ارزی و بیمه‌ای", route: "/markets/finance-insurance", status: "published" },
  { id: "energy", slug: "energy", title: "انرژی", description: "سوخت، نفت و فعالیت‌های پژوهشی و قراردادی مرتبط", route: "/markets/energy", status: "published" },
  { id: "public-local-markets", slug: "public-local-markets", title: "بازارهای عمومی و محلی", description: "مزایده‌ها، مدارس، تبلیغات شهری و خدمات عمومی", route: "/markets/public-local-markets", status: "published" },
];

const topicByPart: Record<string, string> = {
  chapeau: "anti-competitive-coordination",
  "clause-1": "price-fixing",
  "clause-2": "output-restriction",
  "clause-3": "discriminatory-conditions",
  "clause-4": "third-party-dealing",
  "clause-5": "supplementary-obligations",
  "clause-6": "market-allocation",
  "clause-7": "market-access",
};

function links(parts: string[]) {
  if (!parts.length) return [{ provisionId: ARTICLE_44_ID, relation: "concerns" as const }];
  return parts.map((part) => ({
    provisionId: provisionIdByCommentarySlug[part],
    relation: "commentary-reference" as const,
  }));
}

function topicIds(parts: string[], additional: string[] = []) {
  return Array.from(new Set([
    "anti-competitive-coordination",
    ...parts.map((part) => topicByPart[part]).filter(Boolean),
    ...additional,
  ]));
}

type DecisionInput = {
  slug: string;
  title: string;
  files: string[];
  parts?: string[];
  includeInArticle44?: boolean;
  issuerIds?: string[];
  markets: string[];
  additionalTopics?: string[];
  relation?: string;
  article45Parts?: string[];
};

function decision(input: DecisionInput): KnowledgeDocument {
  const parts = input.parts ?? [];
  const includeInArticle44 = input.includeInArticle44 ?? true;
  return {
    id: `decision:${input.slug}`,
    slug: input.slug,
    title: input.title,
    documentType: "decision",
    route: `/decisions/${input.slug}`,
    files: input.files,
    issuerIds: input.issuerIds ?? ["competition-council"],
    provisionLinks: [
      ...(includeInArticle44 ? links(parts) : []),
      ...(input.article45Parts ?? []).map((part) => ({
        provisionId: article45ProvisionIdBySlug[part],
        relation: "applies" as const,
      })),
    ],
    topicIds: includeInArticle44 ? topicIds(parts, input.additionalTopics) : (input.additionalTopics ?? []),
    marketIds: input.markets,
    documentLinks: [],
    relation: input.relation ?? "متن کامل تصمیم، مشخصات پرونده و جایگاه آن در شبکه حقوق رقابت",
    curated: true,
    updatedAt: CONTENT_UPDATED_ISO,
    status: "published",
  };
}

export const documents: KnowledgeDocument[] = [
  decision({ slug: "821", title: "الزام سایپا به قرارداد با شرکت منتخب پسماند", files: ["821.txt"], parts: ["clause-4", "clause-6", "clause-7"], markets: ["industry", "public-local-markets"] }),
  decision({ slug: "779", title: "عرضه مجدد برند در پلتفرم ترب", files: ["779.txt"], markets: ["digital-markets"] }),
  decision({ slug: "776", title: "انحصار تهیه طرح‌های توجیهی بانکی", files: ["776.txt"], parts: ["clause-6", "clause-7"], markets: ["finance-insurance"] }),
  decision({ slug: "722", title: "امتناع اپراتورها از ارائه بستر خدمات صوتی", files: ["722.txt"], parts: ["clause-2"], markets: ["communications"] }),
  decision({ slug: "641", title: "محدودیت مهندسان ناظر جدیدالورود", files: ["641.txt"], parts: ["clause-6"], markets: ["professional-services"] }),
  decision({ slug: "624", title: "سهمیه‌بندی بازار نصب آسانسور", files: ["624.txt"], parts: ["clause-2", "clause-6"], markets: ["professional-services", "industry"] }),
  decision({ slug: "appeal-162-02", title: "محدودیت واردات قطعات آسانسور", files: ["appeal-162-02.txt"], parts: ["clause-2"], issuerIds: ["competition-appeal-board"], markets: ["industry"] }),
  decision({ slug: "606", title: "سقف حق‌التحریر دفاتر اسناد رسمی", files: ["606.txt"], markets: ["professional-services"] }),
  decision({ slug: "599", title: "لزوم انتساب رفتار به بنگاه مسلط", files: ["599.txt"], parts: ["clause-7"], markets: ["digital-markets"] }),
  decision({ slug: "580", title: "انحصار واردات نهاده‌های دامی", files: ["580.txt"], parts: ["clause-7"], markets: ["agriculture-food"] }),
  decision({ slug: "562", title: "رد شکایت سامانه سوئیچ بیمه", files: ["562.txt"], markets: ["finance-insurance", "digital-markets"] }),
  decision({ slug: "522", title: "واگذاری طرح‌های پژوهشی صنعت نفت", files: ["522.txt"], parts: ["clause-7"], markets: ["energy"] }),
  decision({ slug: "631", title: "تفاهم انحصاری در زنجیره نخ تایر", files: ["631.txt"], parts: ["clause-7"], markets: ["industry"], relation: "احراز توافق محدودکننده و بررسی رابطه شرکت مادر و شرکت‌های وابسته" }),
  decision({ slug: "504", title: "تعیین قیمت و سهمیه لباس مدارس", files: ["504.txt"], parts: ["clause-1", "clause-6"], markets: ["public-local-markets"] }),
  decision({ slug: "476", title: "ارجاع کار مهندسی در استان سمنان", files: ["476.txt"], parts: ["chapeau", "clause-2", "clause-6"], markets: ["professional-services"] }),
  decision({ slug: "466", title: "انحصار نرم‌افزار LIMS آزمایشگاهی", files: ["466.txt"], parts: ["clause-7"], markets: ["digital-markets"] }),
  decision({ slug: "445", title: "امحای جوجه یک‌روزه برای کنترل قیمت", files: ["445.txt"], parts: ["clause-2"], markets: ["agriculture-food"] }),
  decision({ slug: "437", title: "شکایت از ایرانسل بابت امتناع از همکاری", files: ["437.txt"], parts: ["clause-2"], markets: ["communications"], relation: "رد تبانی و تفکیک رفتار هماهنگ از استنکاف یک‌جانبه" }),
  decision({ slug: "429", title: "قدرت مسلط و قیمت‌گذاری تهاجمی در خرید توتون", files: ["429.txt"], parts: ["clause-1", "clause-2"], markets: ["agriculture-food"] }),
  decision({ slug: "421", title: "ظرفیت وکالت و دامنه ماده ۷", files: ["421.txt"], parts: ["clause-2", "clause-7"], markets: ["professional-services"] }),
  decision({ slug: "403", title: "قراردادهای جایگاه‌داری سوخت", files: ["403.txt"], includeInArticle44: false, article45Parts: ["clause-vav-2", "clause-ta-2"], markets: ["energy"], additionalTopics: ["third-party-dealing"], relation: "احراز تحمیل معامله با شخص ثالث و شرایط قراردادی غیرمنصفانه در قراردادهای جایگاه‌داری" }),
  decision({ slug: "354", title: "تبعیض در مزایده تبلیغات شهری", files: ["354.txt"], parts: ["clause-3"], markets: ["public-local-markets"] }),
  decision({ slug: "sugar", title: "بازار شکر و انحصار واردات", files: ["sugar-296.txt", "sugar-appeal.txt"], parts: ["clause-6"], issuerIds: ["competition-council", "competition-appeal-board"], markets: ["agriculture-food"], relation: "نمونه تعارض تحلیلی میان تصمیم بدوی و رأی هیئت تجدیدنظر" }),
  decision({ slug: "270", title: "پرونده جامع بازار فولاد", files: ["270.txt"], parts: ["clause-5"], markets: ["industry"] }),
  decision({ slug: "236", title: "پرونده ارزی ۶۵۰ میلیون یورویی", files: ["236.txt"], parts: ["clause-3", "clause-7"], markets: ["finance-insurance"] }),
  decision({ slug: "232", title: "تعیین قیمت صنفی لوح فشرده", files: ["232.txt"], parts: ["clause-2", "clause-6", "clause-7"], markets: ["industry"] }),
];

export const articles: KnowledgeArticle[] = [];

validateKnowledgeRegistry({
  institutionalDomains,
  institutions,
  legalSources,
  provisions,
  commentaries,
  topics,
  markets,
  documents,
  articles,
});

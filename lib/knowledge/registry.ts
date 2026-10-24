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
  KnowledgeCase,
  KnowledgeDocument,
  LegalSource,
  Market,
  Topic,
} from "./types";
import { validateKnowledgeRegistry } from "./validate";
import { CONTENT_UPDATED_ISO } from "@/lib/site";
import { craKnowledgeDocuments } from "@/lib/cra/data";
import { generalPolicies44ArticleProvisions } from "@/lib/laws/general-policies-44";
import telecomAbstract from "@/content/articles/telecom-abstract.json";

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
    description: "مصوبات کمیسیون تنظیم مقررات ارتباطات و روابط ثبت‌شده میان آنها در سامانه اسناد سازمان تنظیم مقررات",
    memberIds: ["communications-regulatory-authority", "communications-regulatory-commission"],
    status: "published",
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
    description: "نهاد اجرایی تنظیم‌گری بخش ارتباطات رادیویی",
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
    description: "مرجع تصویب مقررات ارتباطی با آرشیو کامل مصوبات گردآوری‌شده از سامانه اسناد سازمان تنظیم مقررات",
    route: "/institutions/communications-regulatory-commission",
    status: "published",
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

export const provisions = [
  ...generalPolicies44ArticleProvisions,
  ...article44Provisions,
  ...article45Provisions,
];
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
  article45ReferenceParts?: string[];
  article44ReferenceParts?: string[];
  year: string;
  numberSlug?: string;
  legacyRoutes?: string[];
  documentLinks?: KnowledgeDocument["documentLinks"];
};

function decision(input: DecisionInput): KnowledgeDocument {
  const parts = input.parts ?? [];
  const includeInArticle44 = input.includeInArticle44 ?? true;
  const issuerIds = input.issuerIds ?? ["competition-council"];
  return {
    id: `decision:${input.slug}`,
    slug: input.slug,
    title: input.title,
    documentType: "decision",
    route: `/decisions/${issuerIds[0]}/${input.year}/${input.numberSlug ?? input.slug}`,
    legacyRoutes: input.legacyRoutes ?? [`/decisions/${input.slug}`],
    files: input.files,
    issuerIds,
    provisionLinks: [
      ...(includeInArticle44 ? links(parts) : []),
      ...(input.article44ReferenceParts ?? []).map((part) => ({
        provisionId: provisionIdByCommentarySlug[part],
        relation: "commentary-reference" as const,
      })),
      ...(input.article45Parts ?? []).map((part) => ({
        provisionId: article45ProvisionIdBySlug[part],
        relation: "applies" as const,
      })),
      ...(input.article45ReferenceParts ?? []).map((part) => ({
        provisionId: article45ProvisionIdBySlug[part],
        relation: "commentary-reference" as const,
      })),
    ],
    topicIds: includeInArticle44 ? topicIds(parts, input.additionalTopics) : (input.additionalTopics ?? []),
    marketIds: input.markets,
    documentLinks: input.documentLinks ?? [],
    relation: input.relation ?? "متن کامل تصمیم، مشخصات پرونده و ارتباطات آن در حقوق رقابت",
    curated: true,
    updatedAt: CONTENT_UPDATED_ISO,
    status: "published",
  };
}

export const documents: KnowledgeDocument[] = [
  decision({"slug":"821","year":"1404","title":"الزام سایپا به قرارداد با شرکت منتخب پسماند","files":["821.txt"],"parts":["clause-4","clause-6","clause-7"],"markets":["industry","public-local-markets"],"article44ReferenceParts":["chapeau"]}),
  decision({"slug":"779","year":"1404","title":"عرضه مجدد برند در پلتفرم ترب","files":["779.txt"],"markets":["digital-markets"],"article44ReferenceParts":["clause-1"],"article45ReferenceParts":["clause-be"]}),
  decision({"slug":"776","year":"1404","title":"انحصار تهیه طرح‌های توجیهی بانکی","files":["776.txt"],"parts":["clause-6","clause-7"],"markets":["finance-insurance"],"article44ReferenceParts":["chapeau"]}),
  decision({"slug":"722","year":"1403","title":"امتناع اپراتورها از ارائه بستر خدمات صوتی","files":["722.txt"],"parts":["clause-2"],"article45Parts":["clause-alef-1"],"markets":["communications"],"article45ReferenceParts":["clause-alef","clause-alef-3"]}),
  decision({"slug":"641","year":"1402","title":"محدودیت مهندسان ناظر جدیدالورود","files":["641.txt"],"parts":["clause-6"],"markets":["professional-services"],"article44ReferenceParts":["clause-2"]}),
  decision({"slug":"624","year":"1402","title":"سهمیه‌بندی بازار نصب آسانسور","files":["624.txt"],"parts":["clause-2","clause-6"],"markets":["professional-services","industry"],"article44ReferenceParts":["chapeau"]}),
  decision({"slug":"appeal-162-02","year":"1402","numberSlug":"162-02","title":"محدودیت واردات قطعات آسانسور","files":["appeal-162-02.txt"],"parts":["clause-2"],"issuerIds":["competition-appeal-board"],"markets":["industry"],"article44ReferenceParts":["chapeau"]}),
  decision({"slug":"606","year":"1402","title":"سقف حق‌التحریر دفاتر اسناد رسمی","files":["606.txt"],"markets":["professional-services"],"article44ReferenceParts":["clause-1","clause-2","chapeau"]}),
  decision({"slug":"599","year":"1402","title":"لزوم انتساب رفتار به بنگاه مسلط","files":["599.txt"],"parts":["clause-7"],"markets":["digital-markets"],"article44ReferenceParts":["chapeau"],"documentLinks":[{"targetDocumentId":"decision:appeal-171-02","relation":"related"}]}),
  decision({"slug":"580","year":"1402","title":"انحصار واردات نهاده‌های دامی","files":["580.txt"],"parts":["clause-7"],"markets":["agriculture-food"],"article44ReferenceParts":["chapeau"],"documentLinks":[{"targetDocumentId":"decision:appeal-158-02","relation":"related"}]}),
  decision({"slug":"562","year":"1402","title":"رد شکایت سامانه سوئیچ بیمه","files":["562.txt"],"markets":["finance-insurance","digital-markets"],"article44ReferenceParts":["clause-7","chapeau"]}),
  decision({"slug":"522","year":"1401","title":"واگذاری طرح‌های پژوهشی صنعت نفت","files":["522.txt"],"parts":["clause-7"],"article45Parts":["clause-alef-1"],"markets":["energy"]}),
  decision({"slug":"631","year":"1401","title":"تفاهم انحصاری در زنجیره نخ تایر","files":["631.txt"],"parts":["clause-7"],"article45Parts":["clause-alef-1"],"markets":["industry"],"relation":"احراز توافق محدودکننده و بررسی رابطه شرکت مادر و شرکت‌های وابسته","article44ReferenceParts":["chapeau"]}),
  decision({"slug":"504","year":"1401","title":"تعیین قیمت و سهمیه لباس مدارس","files":["504.txt"],"parts":["clause-1","clause-6"],"markets":["public-local-markets"],"article44ReferenceParts":["clause-2","chapeau"]}),
  decision({"slug":"476","year":"1400","title":"ارجاع کار مهندسی در استان سمنان","files":["476.txt"],"parts":["chapeau","clause-2","clause-6"],"markets":["professional-services"]}),
  decision({"slug":"466","year":"1400","title":"انحصار نرم‌افزار LIMS آزمایشگاهی","files":["466.txt"],"parts":["clause-7"],"markets":["digital-markets"],"article44ReferenceParts":["chapeau"]}),
  decision({"slug":"445","year":"1399","title":"امحای جوجه یک‌روزه برای کنترل قیمت","files":["445.txt"],"parts":["clause-2"],"markets":["agriculture-food"],"article44ReferenceParts":["clause-1","chapeau"]}),
  decision({"slug":"437","year":"1399","title":"شکایت از ایرانسل بابت امتناع از همکاری","files":["437.txt"],"parts":["clause-2"],"article45Parts":["clause-alef-1"],"markets":["communications"],"relation":"رد تبانی و تفکیک رفتار هماهنگ از استنکاف یک‌جانبه","article44ReferenceParts":["chapeau"],"documentLinks":[{"targetDocumentId":"decision:appeal-148-02","relation":"related"}]}),
  decision({"slug":"429","year":"1399","title":"قدرت مسلط و قیمت‌گذاری تهاجمی در خرید توتون","files":["429.txt"],"parts":["clause-1","clause-2"],"markets":["agriculture-food"]}),
  decision({"slug":"421","year":"1399","title":"ظرفیت وکالت و دامنه ماده ۷","files":["421.txt"],"parts":["clause-2","clause-7"],"markets":["professional-services"],"article44ReferenceParts":["chapeau"]}),
  decision({"slug":"403","year":"1398","title":"قراردادهای جایگاه‌داری سوخت","files":["403.txt"],"includeInArticle44":false,"article45Parts":["clause-vav-2","clause-ta-2"],"markets":["energy"],"additionalTopics":["third-party-dealing"],"relation":"احراز تحمیل معامله با شخص ثالث و شرایط قراردادی غیرمنصفانه در قراردادهای جایگاه‌داری"}),
  decision({"slug":"354","year":"1397","title":"تبعیض در مزایده تبلیغات شهری","files":["354.txt"],"parts":["clause-3"],"article45ReferenceParts":["clause-jim","clause-be"],"markets":["public-local-markets"]}),
  decision({"slug":"sugar-296","year":"1396","numberSlug":"296","title":"بازار شکر و مجوز واردات","files":["sugar-296.txt"],"parts":["clause-6"],"article45ReferenceParts":["clause-jim"],"markets":["agriculture-food"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:sugar-appeal","relation":"related"}],"relation":"تصمیم بدوی درباره تبانی، تبعیض و تقسیم بازار در اعطای مجوز واردات شکر","article44ReferenceParts":["chapeau"]}),
  decision({"slug":"sugar-appeal","year":"1396","numberSlug":"29-96","title":"انحصار واردات شکر در تجدیدنظر","files":["sugar-appeal.txt"],"parts":["clause-6"],"article45ReferenceParts":["clause-jim"],"issuerIds":["competition-appeal-board"],"markets":["agriculture-food"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:sugar-296","relation":"appeals"}],"relation":"نقض تصمیم ۲۹۶ شورا و الزام به رفع انحصار واردات شکر","article44ReferenceParts":["chapeau"]}),
  decision({"slug":"270","year":"1395","title":"پرونده جامع بازار فولاد","files":["270.txt"],"parts":["clause-5"],"markets":["industry"],"article44ReferenceParts":["clause-1","clause-2"],"article45ReferenceParts":["clause-be"]}),
  decision({"slug":"236","year":"1394","title":"پرونده ارزی ۶۵۰ میلیون یورویی","files":["236.txt"],"parts":["clause-3","clause-7"],"markets":["finance-insurance"]}),
  decision({"slug":"232","year":"1394","title":"تعیین قیمت صنفی لوح فشرده","files":["232.txt"],"parts":["clause-2","clause-6","clause-7"],"markets":["industry"],"article44ReferenceParts":["clause-1","chapeau"]}),
  decision({"slug":"229","year":"1394","title":"تبعیض در واگذاری پژوهش‌های نفت","files":["229.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-jim","clause-alef-1"],"markets":["energy"],"additionalTopics":["discriminatory-conditions","market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:appeal-9-95","relation":"related"}],"article44ReferenceParts":["clause-7"]}),
  decision({"slug":"appeal-9-95","year":"1395","numberSlug":"9-95","title":"واگذاری پروژه‌های پژوهشی وزارت نفت در تجدیدنظر","files":["appeal-9-95.txt"],"includeInArticle44":false,"issuerIds":["competition-appeal-board"],"article45ReferenceParts":["clause-jim","clause-alef-1"],"markets":["energy"],"additionalTopics":["discriminatory-conditions","market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:229","relation":"affirms"}],"article44ReferenceParts":["clause-7"]}),
  decision({"slug":"265","year":"1395","title":"استنکاف و تبعیض در خدمات IN مخابرات","files":["265.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-jim","clause-alef-1"],"markets":["communications"],"additionalTopics":["discriminatory-conditions"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:appeal-17-96","relation":"related"}]}),
  decision({"slug":"appeal-17-96","year":"1396","numberSlug":"17-96","title":"خدمات IN مخابرات در تجدیدنظر","files":["appeal-17-96.txt"],"includeInArticle44":false,"issuerIds":["competition-appeal-board"],"article45ReferenceParts":["clause-jim","clause-alef-1"],"markets":["communications"],"additionalTopics":["discriminatory-conditions"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:265","relation":"appeals"}]}),
  decision({"slug":"817","year":"1404","title":"الزام فروشندگان پرریسک ترب به درگاه امن","files":["817.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-jim"],"markets":["digital-markets"],"additionalTopics":["discriminatory-conditions"],"legacyRoutes":[]}),
  decision({"slug":"311","year":"1396","title":"انحصار و تبعیض در وکیوم‌باتوم","files":["311.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-jim"],"markets":["energy"],"additionalTopics":["discriminatory-conditions","market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:appeal-26-96","relation":"related"}]}),
  decision({"slug":"appeal-26-96","year":"1396","numberSlug":"26-96","title":"تجدیدنظرخواهی نفت جی در پرونده وکیوم‌باتوم","files":["appeal-26-96.txt"],"includeInArticle44":false,"issuerIds":["competition-appeal-board"],"article45ReferenceParts":["clause-jim"],"markets":["energy"],"additionalTopics":["discriminatory-conditions","market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:311","relation":"appeals"}]}),
  decision({"slug":"369","year":"1397","title":"تبعیض در ظرفیت انتقال برق","files":["369.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-jim"],"markets":["energy"],"additionalTopics":["discriminatory-conditions","market-access"],"legacyRoutes":[]}),
  decision({"slug":"728","year":"1403","title":"بازار استایرن منومر و تبعیض در عرضه","files":["728.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-jim"],"markets":["energy"],"additionalTopics":["discriminatory-conditions","market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:appeal-217-05","relation":"related"}]}),
  decision({"slug":"appeal-217-05","year":"1405","numberSlug":"217-05","title":"قراردادهای خوراک استایرن منومر در تجدیدنظر","files":["appeal-217-05.txt"],"includeInArticle44":false,"issuerIds":["competition-appeal-board"],"article45ReferenceParts":["clause-jim"],"markets":["energy"],"additionalTopics":["discriminatory-conditions","market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:728","relation":"reverses"}]}),
  decision({"slug":"839","year":"1405","title":"تکمیل رأی قراردادهای تبلیغاتی صداوسیما","files":["839.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-jim","clause-be"],"markets":["public-local-markets"],"additionalTopics":["discriminatory-conditions"],"legacyRoutes":[],"article44ReferenceParts":["clause-4"],"documentLinks":[{"targetDocumentId":"decision:714","relation":"related"}]}),
  decision({"slug":"715","year":"1403","title":"حذف آگهی در پلتفرم دیوار","files":["715.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-jim"],"markets":["digital-markets"],"additionalTopics":["discriminatory-conditions"],"legacyRoutes":[]}),
  decision({"slug":"328","year":"1396","title":"تبعیض و سقف مالکیت در آواپزشک","files":["328.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-jim"],"markets":["industry"],"additionalTopics":["discriminatory-conditions","market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:appeal-34-97","relation":"related"}]}),
  decision({"slug":"appeal-34-97","year":"1397","numberSlug":"34-97","title":"استثنای حوزه سلامت از شمول قانون در تجدیدنظر","files":["appeal-34-97.txt"],"includeInArticle44":false,"issuerIds":["competition-appeal-board"],"article45ReferenceParts":["clause-jim"],"markets":["industry"],"additionalTopics":["discriminatory-conditions","market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:328","relation":"reverses"}]}),
  decision({"slug":"appeal-27-96","year":"1396","numberSlug":"27-96","title":"تپسی علیه اسنپ؛ استفاده هم‌زمان رانندگان","files":["appeal-27-96.txt"],"includeInArticle44":false,"issuerIds":["competition-appeal-board"],"article45ReferenceParts":["clause-alef-2"],"markets":["digital-markets"],"additionalTopics":["market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:318","relation":"affirms"}]}),
  decision({"slug":"395","year":"1398","title":"انحصار قراردادی اسنپ‌فود","files":["395.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-2"],"markets":["digital-markets"],"additionalTopics":["market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:appeal-58-98","relation":"related"}]}),
  decision({"slug":"appeal-58-98","year":"1398","numberSlug":"58-98","title":"قراردادهای انحصاری اسنپ‌فود","files":["appeal-58-98.txt"],"includeInArticle44":false,"issuerIds":["competition-appeal-board"],"article45ReferenceParts":["clause-alef-2"],"markets":["digital-markets"],"additionalTopics":["market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:395","relation":"affirms"}]}),
  decision({"slug":"621","year":"1402","title":"انحصار قراردادی فیدیبو و چند پرونده ادغام‌شده","files":["621.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-2"],"markets":["digital-markets"],"additionalTopics":["market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:appeal-182-02","relation":"related"}]}),
  decision({"slug":"appeal-182-02","year":"1402","numberSlug":"182-02","title":"شرط انحصاری فیدیبو با ناشران","files":["appeal-182-02.txt"],"includeInArticle44":false,"issuerIds":["competition-appeal-board"],"article45ReferenceParts":["clause-alef-2"],"markets":["digital-markets"],"additionalTopics":["market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:621","relation":"affirms"}]}),
  decision({"slug":"303","year":"1396","title":"انحصار در پلتفرم کتاب","files":["303.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-2"],"markets":["digital-markets"],"additionalTopics":["market-access"],"legacyRoutes":[]}),
  decision({"slug":"740","year":"1404","title":"قراردادهای انحصاری اسنپ‌فود با رستوران‌ها","files":["740.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-2"],"markets":["digital-markets"],"additionalTopics":["market-access"],"legacyRoutes":[]}),
  decision({"slug":"742","year":"1404","title":"انحصار قراردادی اسنپ‌پی با پذیرندگان","files":["742.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-2"],"markets":["digital-markets"],"additionalTopics":["market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:appeal-216-04","relation":"related"}]}),
  decision({"slug":"appeal-216-04","year":"1404","numberSlug":"216-04","title":"تأیید قراردادهای ویژه اسنپ‌پی در تجدیدنظر","files":["appeal-216-04.txt"],"includeInArticle44":false,"issuerIds":["competition-appeal-board"],"article45ReferenceParts":["clause-alef-2"],"markets":["digital-markets"],"additionalTopics":["market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:742","relation":"affirms"}]}),
  decision({"slug":"564","year":"1402","title":"اجبار صندوق‌های قرض‌الحسنه به نرم‌افزار واحد","files":["564.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-2"],"markets":["finance-insurance"],"additionalTopics":["market-access"],"legacyRoutes":[]}),
  decision({"slug":"531","year":"1401","title":"تملک و انحصار در پلتفرم‌های تخفیف","files":["531.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-2"],"markets":["digital-markets"],"additionalTopics":["market-access"],"legacyRoutes":[]}),
  decision({"slug":"494","year":"1401","title":"نام تجاری گمراه‌کننده فروشگاه فرش","files":["494.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-2"],"markets":["public-local-markets"],"additionalTopics":["market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:appeal-109-01","relation":"related"}]}),
  decision({"slug":"appeal-109-01","year":"1401","numberSlug":"109-01","title":"نام تجاری «بازار فرش ایران»","files":["appeal-109-01.txt"],"includeInArticle44":false,"issuerIds":["competition-appeal-board"],"article45ReferenceParts":["clause-alef-2"],"markets":["public-local-markets"],"additionalTopics":["market-access"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:494","relation":"reverses"}]}),
  decision({"slug":"551","year":"1401","title":"قطع شماره تجاری و اجبار به پیمانکار","files":["551.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-1"],"markets":["communications"],"legacyRoutes":[]}),
  decision({"slug":"250","year":"1395","title":"اظهارات گمراه‌کننده و استنکاف از معامله","files":["250.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-1"],"markets":["energy","industry"],"legacyRoutes":[]}),
  decision({"slug":"appeal-148-02","year":"1402","numberSlug":"148-02","issuerIds":["competition-appeal-board"],"title":"نقض بخش مربوط به استنکاف ایرانسل در تجدیدنظر","files":["appeal-148-02.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-1"],"markets":["communications"],"legacyRoutes":[],"documentLinks":[{"targetDocumentId":"decision:437","relation":"appeals"}],"relation":"نقض جزء ۳ تصمیم ۴۳۷ درباره استنکاف ایرانسل از معامله، با متن موجود در نسخه آرشیوی"}),
  decision({"slug":"339","year":"1397","title":"محدودیت عرضه آلومینیوم","files":["339.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-1","clause-alef-3"],"markets":["industry"],"legacyRoutes":[]}),
  decision({"slug":"378","year":"1398","title":"قراردادهای گزینشی بیمه سلامت","files":["378.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-1"],"markets":["finance-insurance"],"legacyRoutes":[]}),
  decision({"slug":"710","year":"1403","title":"حمل خودروهای توقیفی توسط بنیاد تعاون فراجا","files":["710.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-1"],"markets":["public-local-markets"],"legacyRoutes":[]}),
  decision({"slug":"827","year":"1404","title":"انحصار پهنای باند و تعرفه ابرانتقال","files":["827.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-1"],"markets":["communications"],"legacyRoutes":[]}),
  decision({"slug":"834","year":"1405","title":"شکایت ماپرا از اسنپ‌فود درباره دسترسی به API","files":["834.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-1"],"markets":["digital-markets"],"legacyRoutes":[]}),
  decision({"slug":"845","year":"1405","title":"درخواست تخصیص آرد به نانوایی آزادپز","files":["845.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-1"],"markets":["agriculture-food"],"legacyRoutes":[]}),
  decision({"slug":"851","year":"1405","title":"درخواست توقف انحصار توزیع و حمل آرد آزاد","files":["851.txt"],"includeInArticle44":false,"article45ReferenceParts":["clause-alef-1"],"markets":["agriculture-food"],"legacyRoutes":[]}),
  decision({"slug":"519","year":"1401","title":"هزینه اضافی در قبوض تلفن ثابت","files":["519.txt"],"includeInArticle44":false,"markets":["communications"],"additionalTopics":["price-fixing"],"legacyRoutes":[],"article44ReferenceParts":["clause-1"]}),
  decision({"slug":"appeal-158-02","year":"1402","numberSlug":"158-02","issuerIds":["competition-appeal-board"],"title":"تجدیدنظر واگذاری انحصاری واردات نهاده‌های دامی","files":["appeal-158-02.txt"],"includeInArticle44":false,"markets":["agriculture-food"],"additionalTopics":["market-access"],"legacyRoutes":[],"article44ReferenceParts":["clause-7"],"documentLinks":[{"targetDocumentId":"decision:580","relation":"affirms"}]}),
  decision({"slug":"253","year":"1395","title":"بازار تبلیغات رسانه‌ای و تبعیض قیمتی","files":["253.txt"],"includeInArticle44":false,"markets":["public-local-markets"],"additionalTopics":["discriminatory-conditions"],"legacyRoutes":[],"article45ReferenceParts":["clause-be"],"documentLinks":[{"targetDocumentId":"decision:appeal-14-95","relation":"related"}]}),
  decision({"slug":"appeal-14-95","year":"1395","numberSlug":"14-95","issuerIds":["competition-appeal-board"],"title":"شبکه گستران سبز علیه صداوسیما","files":["appeal-14-95.txt"],"includeInArticle44":false,"markets":["public-local-markets"],"additionalTopics":["discriminatory-conditions"],"legacyRoutes":[],"article45ReferenceParts":["clause-be"],"documentLinks":[{"targetDocumentId":"decision:253","relation":"appeals"}]}),
  decision({"slug":"714","year":"1403","title":"قراردادهای تبلیغاتی صداوسیما","files":["714.txt"],"includeInArticle44":false,"markets":["public-local-markets"],"additionalTopics":["discriminatory-conditions"],"legacyRoutes":[],"article45ReferenceParts":["clause-be"],"documentLinks":[{"targetDocumentId":"decision:839","relation":"related"}]}),
  decision({"slug":"818","year":"1404","title":"هزینه و جریمه فروشندگان دیجی‌کالا","files":["818.txt"],"includeInArticle44":false,"markets":["digital-markets"],"additionalTopics":["discriminatory-conditions"],"legacyRoutes":[],"article45ReferenceParts":["clause-be"]}),
  decision({"slug":"appeal-188-03","year":"1403","numberSlug":"188-03","issuerIds":["competition-appeal-board"],"title":"کروز و ایران‌خودرو پس از اعاده دیوان","files":["appeal-188-03.txt"],"includeInArticle44":false,"markets":["industry"],"additionalTopics":["market-access"],"legacyRoutes":[]}),
  decision({"slug":"497","year":"1401","title":"رد ادعای انحصار در امداد خودرو","files":["497.txt"],"includeInArticle44":false,"markets":["public-local-markets"],"additionalTopics":["market-access"],"legacyRoutes":[]}),
  decision({"slug":"appeal-171-02","year":"1402","numberSlug":"171-02","issuerIds":["competition-appeal-board"],"includeInArticle44":false,"markets":["digital-markets"],"additionalTopics":["market-access"],"legacyRoutes":[],"article44ReferenceParts":["clause-7"],"documentLinks":[{"targetDocumentId":"decision:599","relation":"appeals"}],"title":"نقض تصمیم اعطای امتیاز تبعیض‌آمیز در تاکسی اینترنتی کیش","files":["appeal-171-02.txt"]}),
  decision({"slug":"318","year":"1396","includeInArticle44":false,"markets":["digital-markets"],"additionalTopics":["market-access"],"legacyRoutes":[],"article45ReferenceParts":["clause-alef-2"],"documentLinks":[{"targetDocumentId":"decision:appeal-27-96","relation":"related"}],"title":"شکایت تپسی از اسنپ درباره همکاری هم‌زمان رانندگان","files":["318.txt"]}),
  ...craKnowledgeDocuments,
];

export const cases: KnowledgeCase[] = [
  {
    id: "case:sugar-import-market",
    slug: "sugar-import-market",
    title: "پرونده بازار شکر و انحصار واردات",
    description: "زنجیره تصمیم ۲۹۶ شورای رقابت و رأی ۲۹/۹۶/هـ‌ت هیئت تجدیدنظر درباره مجوز و انحصار واردات شکر",
    route: "/cases/sugar-import-market",
    legacyRoutes: ["/decisions/sugar"],
    documentIds: ["decision:sugar-296", "decision:sugar-appeal"],
    status: "published",
  },
];

export const articles: KnowledgeArticle[] = [{
  id: "article:competition-council-and-telecom-regulator",
  slug: "competition-council-and-telecom-regulator",
  title: "موازنه صلاحیت شورای رقابت و نهاد تنظیم‌گر بخشی در صنعت مخابرات (مطالعه تطبیقی نظام‌های حقوقی ایالات متحده امریکا و ایران)",
  route: "/articles/competition-council-and-telecom-regulator",
  contentFile: "articles/competition-council-and-telecom-regulator.html",
  abstract: telecomAbstract,
  authors: [
    { name: "مرتضی شهبازی‌نیا", affiliation: "دانشیار دانشکده حقوق دانشگاه تربیت مدرس، تهران، ایران", corresponding: true },
    { name: "نادر جعفری", affiliation: "دانشجوی دکترا دانشکده حقوق دانشگاه تربیت مدرس، تهران، ایران" },
    { name: "ولی رستمی", affiliation: "استاد گروه حقوق عمومی دانشکده حقوق و علوم سیاسی دانشگاه تهران، تهران، ایران" },
    { name: "بیژن عباسی‌ارند", affiliation: "استادیار دانشکده برق و کامپیوتر دانشگاه تربیت مدرس، تهران، ایران" },
  ],
  publication: { journal: "دانش حقوق عمومی", year: "۱۴۰۳", volume: "۱۳", issue: "۳", serial: "۴۵", pages: "۱۸۹ تا ۲۱۲", season: "پاییز", doi: "10.22034/qjplk.2024.1969.1770", received: "۱۴۰۲/۱۱/۲۱", accepted: "۱۴۰۳/۰۶/۱۷" },
  keywords: ["تعارض صلاحیت", "تنظیم‌گر بخشی", "شورای رقابت", "مخابرات"],
  pdfFile: "/articles/competition-council-and-telecom-regulator.pdf",
  institutionIds: ["competition-council", "communications-regulatory-commission"],
  provisionIds: [],
  // Resolve explicit citations by full route. Session 466 already in the
  // decision archive concerns LIMS and must not be linked merely by number.
  documentIds: craKnowledgeDocuments.filter(d => ["/resolutions/cra/1395/252-3", "/resolutions/cra/1401/338-1"].includes(d.route)).map(d => d.id),
  topicIds: ["market-access"], marketIds: ["communications"], status: "published",
}];

validateKnowledgeRegistry({
  institutionalDomains,
  institutions,
  legalSources,
  provisions,
  commentaries,
  topics,
  markets,
  documents,
  cases,
  articles,
});

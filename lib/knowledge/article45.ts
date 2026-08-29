import type { CommentaryRecord, Provision } from "./types";

export const ARTICLE_45_ID = "general-policies-44:article-45";

export type Article45Part = {
  slug: string;
  shortLabel: string;
  title: string;
  description: string;
  available: boolean;
  provisionId: string;
  parentSlug?: string;
};

export type Article45Item = {
  slug: string;
  number: string;
  text: string;
};

export type Article45Section = {
  slug: string;
  letter: string;
  title: string;
  lead?: string;
  items?: Article45Item[];
  note?: {
    slug: string;
    text: string;
  };
};

export const article45Chapeau = "اعمال ذیل که منجر به اخلال در رقابت می‌‌شود، ممنوع است:";

export const article45Sections: Article45Section[] = [
  {
    slug: "clause-alef",
    letter: "الف",
    title: "احتکار و استنکاف از معامله",
    items: [
      { slug: "clause-alef-1", number: "۱", text: "استنکاف فردی یا جمعی از انجام معامله و یا محدود کردن مقدار کالا یا خدمت موضوع معامله." },
      { slug: "clause-alef-2", number: "۲", text: "وادار کردن اشخاص دیگر به استنکاف از معامله و یا محدود کردن معاملات آنها با رقیب." },
      { slug: "clause-alef-3", number: "۳", text: "ذخیره یا نابود کردن کالا یا امتناع از فروش آن و نیز امتناع از ارائه خدمت به نحوی که این ذخیره‌سازی، اقدام یا امتناع منجر به بالا رفتن ساختگی قیمت کالا یا خدمت در بازار شود، اعم از این‌که به طور مستقیم یا با واسطه انجام گیرد" },
    ],
  },
  {
    slug: "clause-be",
    letter: "ب",
    title: "قیمت‌گذاری تبعیض‌آمیز",
    lead: "عرضه و یا تقاضای کالا یا خدمت مشابه به قیمتهایی که حاکی از تبعیض بین دو یا چند طرف معامله و یا تبعیض قیمت بین مناطق مختلف به رغم یکسان بودن شرایط معامله و هزینه‌های حمل و سایر هزینه‌های جانبی آن باشد.",
  },
  {
    slug: "clause-jim",
    letter: "ج",
    title: "تبعیض در شرایط معامله",
    lead: "قائل شدن شرایط تبعیض‌آمیز در معامله با اشخاص مختلف در وضعیت یکسان.",
  },
  {
    slug: "clause-dal",
    letter: "د",
    title: "قیمت‌گذاری تهاجمی‌",
    items: [
      { slug: "clause-dal-1", number: "۱", text: "عرضه کالا یا خدمت به قیمتی پائین‌تر از هزینه تمام شده آن به نحوی که لطمه جدی به دیگران وارد کند یا مانع ورود اشخاص جدید به بازار شود." },
      { slug: "clause-dal-2", number: "۲", text: "ارائه هدیه، جایزه، تخفیف یا امثال آن که موجب وارد شدن لطمه جدی به دیگران شود." },
    ],
    note: { slug: "clause-dal-note", text: "تشخیص لطمه جدی، بر عهده شورای رقابت است" },
  },
  {
    slug: "clause-he",
    letter: "هـ",
    title: "اظهارات گمراه‌کننده",
    lead: "هر اظهار شفاهی، کتبی یا هر عملی که:",
    items: [
      { slug: "clause-he-1", number: "۱", text: "کالا یا خدمت را به صورت غیرواقعی با کیفیت، مقدار، درجه، وصف، مدل یا استاندارد خاص نشان دهد و یا کالا و یا خدمت رقبا را نازل جلوه دهد." },
      { slug: "clause-he-2", number: "۲", text: "کالای تجدید ساخت شده یا دست دوم، تعمیری یا کهنه را نو معرفی کند." },
      { slug: "clause-he-3", number: "۳", text: "وجود خدمات پس از فروش، ضمانتنامه تعهد به تعویض، نگهداری، تعمیر کالا یا هر قسمتی از آن و یا تکرار یا تداوم خدمت تا حصول نتیجه معینی را القاء کند، در حالی که چنین امکاناتی وجود نداشته باشد." },
      { slug: "clause-he-4", number: "۴", text: "اشخاص را از حیث قیمت کالا یا خدمتی که فروخته یا ارائه شده است یا می‌‌شود، فریب دهد." },
    ],
  },
  {
    slug: "clause-vav",
    letter: "و",
    title: "فروش یا خرید اجباری",
    items: [
      { slug: "clause-vav-1", number: "۱", text: "منوط کردن فروش یک کالا یا خدمت به خرید کالا یا خدمت دیگر یا بالعکس." },
      { slug: "clause-vav-2", number: "۲", text: "وادار کردن طرف مقابل به معامله با شخص ثالث به صورتی که اتمام معامله به عرضه یا تقاضای کالا یا خدمت دیگری ارتباط داده شود." },
      { slug: "clause-vav-3", number: "۳", text: "معامله با طرف مقابل با این شرط که طرف مذکور از انجام معامله با رقیب امتناع ورزد." },
    ],
  },
  {
    slug: "clause-ze",
    letter: "ز",
    title: "عرضه کالا یا خدمت غیراستاندارد",
    lead: "عرضه کالا و یا خدمت مغایر با استانداردهای اجباری اعلام‌شده توسط مراجع ذی‌صلاح از جمله راجع به کاربرد، ترکیب، کیفیت، محتویات، طراحی، ساخت، تکمیل و یا بسته‌بندی.",
  },
  {
    slug: "clause-ha",
    letter: "ح",
    title: "مداخله در امور داخلی و یا معاملات بنگاه یا شرکت رقیب",
    lead: "ترغیب، تحریک و یا وادار ساختن یک یا چند سهامدار، صاحب سرمایه، مدیر یا کارکنان یک بنگاه و یا شرکت رقیب از طریق اعمال حق رأی، انتقال سهام، افشاء اسرار، مداخـله در معاملات بـنگاهها و یا شرکتها یا روش‌های مـشابه دیگر بـه انجام عملی که به ضرر رقیب باشد.",
  },
  {
    slug: "clause-ta",
    letter: "ط",
    title: "سوء استفاده از وضعیت اقتصادی مسلط",
    lead: "سوءاستفاده از وضعیت اقتصادی مسلط به یکی از روش‌های زیر:",
    items: [
      { slug: "clause-ta-1", number: "۱", text: "تعیین، حفظ و یا تغییر قیمت یک کالا یا خدمت به صورتی غیرمتعارف،" },
      { slug: "clause-ta-2", number: "۲", text: "تحمیل شرایط قراردادی غیرمنصفانه،" },
      { slug: "clause-ta-3", number: "۳", text: "تحدید مقدار عرضه و یا تقاضا به‌منظور افزایش و یا کاهش قیمت بازار،" },
      { slug: "clause-ta-4", number: "۴", text: "ایجاد مانع به‌منظور مشکل کردن ورود رقبای جدید یا حذف بنگاهها یا شرکتهای رقیب در یک فعالیت خاص" },
      { slug: "clause-ta-5", number: "۵", text: "مشروط کردن قراردادها به پذیرش شرایطی که از نظر ماهیتی یا عرف تجاری، ارتباطی با موضوع چنین قراردادهایی نداشته باشد،" },
      { slug: "clause-ta-6", number: "۶", text: "تملک سرمایه و سهام شرکتها به‌صورتی که منجر به اخلال در رقابت شود." },
    ],
  },
  {
    slug: "clause-ye",
    letter: "ی",
    title: "محدود کردن قیمت فروش مجدد",
    lead: "مشروط کردن عرضه کالا یا خدمت به خریدار به پذیرش شرایط زیر:",
    items: [
      { slug: "clause-ye-1", number: "۱", text: "اجبار خریدار به قبول قیمت فروش تعیین شده یا محدود کردن وی در تعیین قیمت فروش به هر شکلی." },
      { slug: "clause-ye-2", number: "۲", text: "مقید کردن خریدار به حفظ قیمت فروش کالا یا خدمتی معین، برای بنگاه یا شرکتی که از او کالا یا خدمت خریداری می‌کند یا محدود کردن بنگاه یا شرکت مزبور در تعیین قیمت به هر شکلی." },
    ],
  },
  {
    slug: "clause-kaf",
    letter: "ک",
    title: "کسب غیرمجاز، سوء استفاده از اطلاعات و موقعیت اشخاص",
    items: [
      { slug: "clause-kaf-1", number: "۱", text: "کسب و بهره‌برداری غیرمجاز از هرگونه اطلاعات داخلی رقبا در زمینه تجاری، مالی، فنی و نظایر آن به نفع خود یا اشخاص ثالث." },
      { slug: "clause-kaf-2", number: "۲", text: "کسب و بهره‌برداری غیرمجاز از اطلاعات و تصمیمات مراجع رسمی‌، قبل از افشاء یا اعلان عمومی آنها و یا کتمان آنها به نفع خود یا اشخاص ثالث." },
      { slug: "clause-kaf-3", number: "۳", text: "سوء استفاده از موقعیت اشخاص به نفع خود یا اشخاص ثالث." },
    ],
  },
];

const descriptions: Record<string, string> = {
  chapeau: "شرط اخلال در رقابت و قلمرو عمومی رفتارهای ممنوع",
  "clause-alef": "مفهوم عمومی احتکار، استنکاف از معامله و محدودکردن مقدار",
  "clause-alef-1": "استنکاف فردی یا جمعی و محدودکردن مقدار معامله",
  "clause-alef-2": "وادارکردن دیگران به استنکاف یا محدودکردن معامله با رقیب",
  "clause-alef-3": "ذخیره، نابودی یا امتناع منتهی به افزایش ساختگی قیمت",
  "clause-be": "تبعیض قیمتی میان طرف‌های معامله یا مناطق مختلف",
  "clause-jim": "شرایط متفاوت برای اشخاص مختلف در وضعیت یکسان",
  "clause-dal": "مفهوم و عناصر عمومی قیمت‌گذاری تهاجمی",
  "clause-dal-1": "عرضه پایین‌تر از هزینه تمام‌شده با اثر حذف‌کننده",
  "clause-dal-2": "هدیه، جایزه یا تخفیف موجب لطمه جدی",
  "clause-dal-note": "صلاحیت شورای رقابت در تشخیص لطمه جدی",
  "clause-he": "قلمرو عمومی اظهار یا عمل گمراه‌کننده",
  "clause-he-1": "معرفی غیرواقعی کالا یا خدمت و نازل جلوه‌دادن رقیب",
  "clause-he-2": "معرفی کالای تجدیدساخت، دست دوم، تعمیری یا کهنه به‌عنوان نو",
  "clause-he-3": "القای خدمات، ضمانت یا تعهدی که وجود ندارد",
  "clause-he-4": "فریب اشخاص درباره قیمت کالا یا خدمت",
  "clause-vav": "مفهوم عمومی فروش یا خرید اجباری",
  "clause-vav-1": "منوط‌کردن فروش یا خرید یک محصول به محصول دیگر",
  "clause-vav-2": "وادارکردن طرف معامله به معامله با شخص ثالث",
  "clause-vav-3": "شرط خودداری طرف معامله از معامله با رقیب",
  "clause-ze": "عرضه مغایر با استانداردهای اجباری اعلام‌شده",
  "clause-ha": "مداخله زیان‌بار در امور داخلی یا معاملات رقیب",
  "clause-ta": "مفهوم وضعیت اقتصادی مسلط و عناصر عمومی سوءاستفاده",
  "clause-ta-1": "تعیین، حفظ یا تغییر غیرمتعارف قیمت",
  "clause-ta-2": "تحمیل شرایط قراردادی غیرمنصفانه",
  "clause-ta-3": "تحدید عرضه یا تقاضا برای تغییر قیمت بازار",
  "clause-ta-4": "ایجاد مانع ورود یا حذف رقیب",
  "clause-ta-5": "مشروط‌کردن قرارداد به شرایط نامرتبط",
  "clause-ta-6": "تملک سرمایه یا سهام اخلال‌گر در رقابت",
  "clause-ye": "قلمرو عمومی محدودکردن قیمت فروش مجدد",
  "clause-ye-1": "اجبار خریدار به قیمت تعیین‌شده یا محدودکردن اختیار قیمت‌گذاری",
  "clause-ye-2": "الزام خریدار به حفظ قیمت برای بنگاه بعدی زنجیره",
  "clause-kaf": "قلمرو اطلاعات داخلی، تصمیمات رسمی و موقعیت اشخاص",
  "clause-kaf-1": "کسب و بهره‌برداری غیرمجاز از اطلاعات داخلی رقبا",
  "clause-kaf-2": "بهره‌برداری پیش از افشای اطلاعات و تصمیمات رسمی یا کتمان آنها",
  "clause-kaf-3": "سوءاستفاده از موقعیت اشخاص",
};

function provisionId(slug: string) {
  return `${ARTICLE_45_ID}:${slug}`;
}

export const article45CommentaryParts: Article45Part[] = [
  {
    slug: "chapeau",
    shortLabel: "صدر ماده",
    title: "شرح صدر ماده ۴۵",
    description: descriptions.chapeau,
    available: false,
    provisionId: provisionId("chapeau"),
  },
  ...article45Sections.flatMap((section) => {
    const sectionPart: Article45Part = {
      slug: section.slug,
      shortLabel: `بند ${section.letter}`,
      title: section.title,
      description: descriptions[section.slug],
      available: false,
      provisionId: provisionId(section.slug),
    };
    const itemParts = (section.items ?? []).map<Article45Part>((item) => ({
      slug: item.slug,
      shortLabel: `جزء ${item.number} بند ${section.letter}`,
      title: descriptions[item.slug],
      description: item.text,
      available: item.slug === "clause-alef-1",
      provisionId: provisionId(item.slug),
      parentSlug: section.slug,
    }));
    const notePart: Article45Part[] = section.note ? [{
      slug: section.note.slug,
      shortLabel: `تبصره بند ${section.letter}`,
      title: section.note.text,
      description: descriptions[section.note.slug],
      available: false,
      provisionId: provisionId(section.note.slug),
      parentSlug: section.slug,
    }] : [];
    return [sectionPart, ...itemParts, ...notePart];
  }),
];

export const article45Provisions: Provision[] = [
  {
    id: ARTICLE_45_ID,
    legalSourceId: "general-policies-44-law",
    slug: "article-45",
    label: "ماده ۴۵",
    title: "اعمال یک‌جانبه اخلال‌گر در رقابت",
    description: "متن ماده و ساختار شرح جزءبه‌جزء رفتارهای ممنوع",
    route: "/laws/general-policies-44/article-45",
    status: "published",
  },
  ...article45CommentaryParts.map((part) => ({
    id: part.provisionId,
    legalSourceId: "general-policies-44-law",
    parentId: part.parentSlug ? provisionId(part.parentSlug) : ARTICLE_45_ID,
    slug: part.slug,
    label: part.shortLabel,
    title: part.title,
    description: part.description,
    route: `/laws/general-policies-44/article-45/commentary/${part.slug}`,
    status: (part.available ? "published" : "draft") as "published" | "draft",
  })),
];

export const article45Commentaries: CommentaryRecord[] = article45CommentaryParts.map((part) => ({
  id: `commentary:${part.provisionId}`,
  provisionId: part.provisionId,
  title: part.title,
  route: `/laws/general-policies-44/article-45/commentary/${part.slug}`,
  contentFile: part.available ? (part.slug === "chapeau" ? "commentary45.md" : `commentary45-${part.slug}.md`) : undefined,
  status: part.available ? "published" : "draft",
}));

export const article45ProvisionIdBySlug = Object.fromEntries(
  article45CommentaryParts.map((part) => [part.slug, part.provisionId]),
);

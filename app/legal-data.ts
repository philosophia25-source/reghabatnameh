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
};

export const commentaryParts: CommentaryPart[] = [
  { slug: "chapeau", shortLabel: "صدر ماده", title: "شرح صدر ماده ۴۴", description: "مفهوم هماهنگی، انواع توافق، قلمرو اشخاص و قابلیت اخلال در رقابت", available: true },
  { slug: "clause-1", shortLabel: "بند ۱", title: "تعیین قیمت", description: "مشخص‌کردن مستقیم یا غیرمستقیم قیمت خرید یا فروش", available: true },
  { slug: "clause-2", shortLabel: "بند ۲", title: "محدودکردن تولید، خرید یا فروش", description: "کنترل مقدار کالا یا خدمت در بازار", available: true },
  { slug: "clause-3", shortLabel: "بند ۳", title: "شرایط تبعیض‌آمیز", description: "تحمیل شرایط متفاوت در معاملات همسان", available: false },
  { slug: "clause-4", shortLabel: "بند ۴", title: "الزام به معامله با شخص ثالث", description: "تحمیل طرف قرارداد یا شروط قراردادی به دیگران", available: false },
  { slug: "clause-5", shortLabel: "بند ۵", title: "تعهدات تکمیلی نامرتبط", description: "موکول‌کردن قرارداد به پذیرش تعهدات خارج از موضوع", available: false },
  { slug: "clause-6", shortLabel: "بند ۶", title: "تقسیم یا تسهیم بازار", description: "تقسیم بازار کالا یا خدمت میان اشخاص", available: false },
  { slug: "clause-7", shortLabel: "بند ۷", title: "محدودکردن دسترسی به بازار", description: "ممانعت از دسترسی اشخاص خارج از توافق", available: false },
  { slug: "note", shortLabel: "تبصره", title: "قراردادهای کارگری و کارفرمایی", description: "قلمرو استثنا و ارتباط آن با قانون کار", available: false },
];

export type DecisionReference = {
  number: string;
  title: string;
  role: string;
  href?: string;
};

export const referencedDecisions: DecisionReference[] = [
  { number: "۴۳۷", title: "امتناع ایرانسل از همکاری", role: "رد تبانی و تفکیک رفتار یک‌جانبه", href: "/decisions/437" },
  { number: "۴۴۵", title: "امحای جوجه یک‌روزه برای کنترل قیمت", role: "تصمیم انجمن به‌عنوان ابزار هماهنگی" },
  { number: "۶۳۱", title: "تفاهم انحصاری در زنجیره نخ تایر", role: "احراز توافق و نقد استقلال درون‌گروهی", href: "/decisions/631" },
];

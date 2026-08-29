import type { Metadata } from "next";
import Link from "next/link";
import heroImage from "../../public/hero-tehran.jpg";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "رقابت‌نامه | نادر جعفری",
    description: "حقوق رقابت و تنظیم‌گری در بازارهای ایران",
    url: "/",
    siteName: "رقابت‌نامه",
    locale: "fa_IR",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "رقابت‌نامه، حقوق رقابت و تنظیم‌گری ایران" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "رقابت‌نامه | نادر جعفری",
    description: "حقوق رقابت و تنظیم‌گری در بازارهای ایران",
    images: ["/og.jpg"],
  },
};

const Arrow = () => <span aria-hidden="true">←</span>;

const quickAccess = [
  { label: "قوانین و شرح", detail: "مجموعه‌های قانونی", href: "/laws" },
  { label: "آرای منتخب", detail: "پرونده‌های قاعده‌ساز", href: "/decisions" },
  { label: "نهادها", detail: "مراجع و اسناد", href: "/institutions" },
  { label: "موضوعات", detail: "شبکه مفهومی", href: "/topics" },
];

const articles = [
  {
    tone: "arch-one",
    category: "شرح بند ۳",
    title: "شرایط تبعیض‌آمیز در معاملات همسان",
    summary: "مرز تبعیض قراردادی با تفاوت موجه و معیار قابلیت اخلال در رقابت",
    type: "شرح ماده",
    status: "منتشر شده",
    href: "/laws/general-policies-44/article-44/commentary/clause-3",
  },
  {
    tone: "arch-two",
    category: "شرح بند ۴",
    title: "الزام به معامله با شخص ثالث",
    summary: "تحمیل طرف قرارداد یا شروط قراردادی به دیگران و مرز آن با فشار یک‌جانبه",
    type: "شرح ماده",
    status: "منتشر شده",
    href: "/laws/general-policies-44/article-44/commentary/clause-4",
  },
  {
    tone: "arch-three",
    category: "شرح بند ۵",
    title: "تعهدات تکمیلی نامرتبط",
    summary: "شرط‌کردن قرارداد به پذیرش تعهد اضافی و معیار ارتباط عرفی آن با معامله",
    type: "شرح ماده",
    status: "منتشر شده",
    href: "/laws/general-policies-44/article-44/commentary/clause-5",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero" id="top">
        <div className="hero-backdrop" aria-hidden="true" style={{ backgroundImage: `url(${heroImage.src})` }} />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="hero-kicker">پایگاه تحلیلی حقوق رقابت و تنظیم‌گری</p>
          <h1>رقابت‌نامه</h1>
          <h2>حقوق رقابت و تنظیم‌گری در بازارهای ایران</h2>
          <p>تحلیل قوانین، رویه‌ها و سیاست‌های مرتبط با رقابت، تمرکزهای اقتصادی و تنظیم‌گری در بخش‌های مختلف اقتصاد ایران</p>
          <Link href="/about">درباره رقابت‌نامه <Arrow /></Link>
        </div>
        <nav className="hero-access" aria-label="دسترسی سریع به محتوای حقوقی">
          {quickAccess.map((item) => (
            <Link href={item.href} key={item.href}>
              <small>{item.detail}</small>
              <strong>{item.label}</strong>
              <Arrow />
            </Link>
          ))}
        </nav>
        <a className="scroll-cue" href="#analysis"><span>مشاهده مطالب</span><i>⌄</i></a>
      </section>

      <section className="insights shell" id="analysis">
        <div className="latest">
          <div className="section-title section-title-with-link"><span>تازه‌های شبکه</span><i /><Link href="/search">جست‌وجو در همه محتوا <Arrow /></Link></div>
          <div className="article-grid">
            {articles.map((article) => (
              <Link className="article-card" href={article.href} key={article.title}>
                <div className={`article-image ${article.tone}`}><span>{article.category}</span></div>
                <div className="article-copy">
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <div className="article-meta"><span>{article.type}</span><span>{article.status}</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="decision-section shell" id="decisions">
        <div className="decision-heading">
          <p>پرونده‌خوانی</p><h2>آرای شورای رقابت، با زمینه و تحلیل</h2>
          <span>متن رأی به‌تنهایی کافی نیست. هر پرونده با کلیدواژه‌ها، سابقه و یادداشت تحلیلی خوانده می‌شود.</span>
        </div>
        <div className="decision-list">
          <Link href="/decisions/competition-council/1401/631"><small>رأی شماره ۶۳۱</small><strong>بازار نخ تایر و مسئله توافق رقابتی</strong><span>ماده ۴۴ · توافق و تفاهم</span><Arrow /></Link>
          <Link href="/decisions/competition-council/1399/437"><small>رأی شماره ۴۳۷</small><strong>ایرانسل و حدود رفتار ضدرقابتی</strong><span>ماده ۴۵ · رویه یک‌جانبه</span><Arrow /></Link>
          <Link href="/cases/sugar-import-market"><small>آرای ۲۹۶ و ۲۹/۹۶/هـ‌ت</small><strong>بازار شکر و زنجیره بدوی و تجدیدنظر</strong><span>ماده ۴۴ · ماده ۵۲</span><Arrow /></Link>
        </div>
      </section>

      <section className="research shell">
        <p>پژوهش جاری</p>
        <h2>محشی قانون اجرای سیاست‌های کلی اصل چهل‌وچهار</h2>
        <span>خوانشی ماده‌به‌ماده از حقوق رقابت ایران، با اتصال هر شرح به آرای منتخب، موضوعات و بازارهای مرتبط</span>
        <Link href="/laws/general-policies-44/article-44">مطالعه ماده ۴۴ <Arrow /></Link>
      </section>
    </>
  );
}

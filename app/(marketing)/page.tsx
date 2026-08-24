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
  { label: "قوانین و مقررات", detail: "متن قوانین", href: "/laws/" },
  { label: "شرح مواد", detail: "شرح جزءبه‌جزء ماده ۴۴", href: "/laws/article-44/commentary/" },
  { label: "آرای مهم", detail: "پرونده‌های شورای رقابت", href: "/decisions/" },
];

const articles = [
  {
    tone: "arch-one",
    category: "شرح قانون",
    title: "شرح صدر ماده ۴۴",
    summary: "قرارداد، توافق و تفاهم میان اشخاص و معیار قابلیت اخلال در رقابت",
    type: "شرح ماده",
    status: "منتشر شده",
    href: "/laws/article-44/commentary/chapeau/",
  },
  {
    tone: "arch-two",
    category: "شرح بند ۱",
    title: "توافق بر تعیین قیمت",
    summary: "تعیین مستقیم و غیرمستقیم قیمت و مرز آن با رفتارهای یک‌جانبه و تنظیم‌گری",
    type: "شرح ماده",
    status: "منتشر شده",
    href: "/laws/article-44/commentary/clause-1/",
  },
  {
    tone: "arch-three",
    category: "پرونده‌خوانی",
    title: "رأی شماره ۶۳۱ شورای رقابت",
    summary: "بازار نخ تایر و مسئله توافق رقابتی در زنجیره تولید و تأمین",
    type: "رأی شورای رقابت",
    status: "پرونده کامل",
    href: "/decisions/631/",
  },
];

const topics = [
  ["قوانین و مقررات", "/laws/"],
  ["شرح ماده ۴۴", "/laws/article-44/commentary/"],
  ["آرای شورای رقابت", "/decisions/"],
];

export default function HomePage() {
  return (
    <>
      <section className="hero" id="top" style={{ backgroundImage: `url(${heroImage.src})` }}>
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="hero-kicker">دفتر مستقل حقوق رقابت ایران</p>
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
        <aside className="topics">
          <div className="section-title"><span>موضوعات اصلی</span><i /></div>
          <ul>
            {topics.map(([name, href]) => (
              <li key={name}><Link href={href}><span className="topic-icon">□</span><strong>{name}</strong><Arrow /></Link></li>
            ))}
          </ul>
          <Link className="all-link" href="/laws/article-44">ورود به پایگاه ماده ۴۴ <Arrow /></Link>
        </aside>

        <div className="latest">
          <div className="section-title"><span>تازه‌های رقابت‌نامه</span><i /></div>
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

      <section className="statement shell">
        <div className="statement-lines" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="quote-mark">”</div>
        <div>
          <blockquote>رقابت سالم، موتور پیشرفت اقتصاد و تضمین‌کننده رفاه مصرف‌کننده است.</blockquote>
          <p>تحلیل دقیق قوانین و رویه‌ها، نخستین گام برای ارتقای رقابت‌پذیری اقتصاد ایران است.</p>
        </div>
      </section>

      <section className="decision-section shell" id="decisions">
        <div className="decision-heading">
          <p>پرونده‌خوانی</p><h2>آرای شورای رقابت، با زمینه و تحلیل</h2>
          <span>متن رأی به‌تنهایی کافی نیست. هر پرونده با کلیدواژه‌ها، سابقه و یادداشت تحلیلی خوانده می‌شود.</span>
        </div>
        <div className="decision-list">
          <Link href="/decisions/631"><small>رأی شماره ۶۳۱</small><strong>بازار نخ تایر و مسئله توافق رقابتی</strong><span>ماده ۴۴ · توافق و تفاهم</span><Arrow /></Link>
          <Link href="/decisions/437"><small>رأی شماره ۴۳۷</small><strong>ایرانسل و حدود رفتار ضدرقابتی</strong><span>ماده ۴۵ · رویه یک‌جانبه</span><Arrow /></Link>
          <Link href="/decisions/sugar"><small>آرای ۲۹۶ و ۲۹/۹۶/هـ‌ت</small><strong>بازار شکر و زنجیره بدوی و تجدیدنظر</strong><span>ماده ۴۴ · ماده ۵۲</span><Arrow /></Link>
        </div>
      </section>

      <section className="research shell">
        <p>پژوهش جاری</p>
        <h2>محشی قانون اجرای سیاست‌های کلی اصل چهل‌وچهار</h2>
        <span>خوانشی ماده‌به‌ماده از حقوق رقابت ایران، با تکیه بر آرای شورای رقابت و رویه قضایی</span>
        <Link href="/laws/article-44">مطالعه ماده ۴۴ <Arrow /></Link>
      </section>
    </>
  );
}

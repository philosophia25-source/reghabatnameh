import type { Metadata } from "next";
import Link from "next/link";
import heroImage from "../public/hero-tehran.jpg";

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

const articles = [
  {
    tone: "arch-one",
    category: "تمرکزهای اقتصادی",
    title: "تمرکزهای اقتصادی در بازار پلتفرم‌های دیجیتال",
    summary: "تحلیل چارچوب حقوقی تمرکزهای اقتصادی در حوزه پلتفرم‌های دیجیتال و چالش‌های تنظیم‌گری آن",
    date: "۰۵/۰۳/۱۴۰۵",
    time: "۱۰ دقیقه مطالعه",
  },
  {
    tone: "arch-two",
    category: "آرای شورای رقابت",
    title: "بررسی رأی شماره ۶۲۳ شورای رقابت درباره رویه ضدرقابتی",
    summary: "تحلیل یکی از پرونده‌های مهم مربوط به رویه‌های ضدرقابتی و آثار آن بر ساختار بازار",
    date: "۱۰/۰۳/۱۴۰۵",
    time: "۱۲ دقیقه مطالعه",
  },
  {
    tone: "arch-three",
    category: "سیاست رقابتی",
    title: "سیاست‌های صنعتی و آثار آن بر ساختار رقابتی بازار",
    summary: "بررسی ارتباط میان سیاست‌های صنعتی دولت و سطح رقابت‌پذیری در بازارهای مختلف ایران",
    date: "۱۴/۰۳/۱۴۰۵",
    time: "۸ دقیقه مطالعه",
  },
];

const topics = [
  ["قوانین و مقررات", "۱۲"],
  ["آرای شورای رقابت", "۳۷"],
  ["سیاست‌های رقابتی", "۱۸"],
  ["تمرکزهای اقتصادی", "۱۴"],
  ["صنایع و بخش‌ها", "۲۲"],
  ["اقتصاد دیجیتال", "۹"],
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
          <Link href="/about/">درباره رقابت‌نامه <Arrow /></Link>
        </div>
        <a className="scroll-cue" href="#analysis"><span>مشاهده مطالب</span><i>⌄</i></a>
      </section>

      <section className="insights shell" id="analysis">
        <aside className="topics">
          <div className="section-title"><span>موضوعات اصلی</span><i /></div>
          <ul>
            {topics.map(([name, count]) => (
              <li key={name}><Link href="/articles/"><span className="topic-icon">□</span><strong>{name}</strong><small>({count})</small></Link></li>
            ))}
          </ul>
          <Link className="all-link" href="/articles/">مشاهده همه موضوعات <Arrow /></Link>
        </aside>

        <div className="latest">
          <div className="section-title"><span>آخرین تحلیل‌ها</span><i /></div>
          <div className="article-grid">
            {articles.map((article) => (
              <Link className="article-card" href="/articles/" key={article.title}>
                <div className={`article-image ${article.tone}`}><span>{article.category}</span></div>
                <div className="article-copy">
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <div className="article-meta"><time>{article.date}</time><span>{article.time}</span></div>
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
          <Link href="/decisions/631/"><small>رأی شماره ۶۳۱</small><strong>بازار نخ تایر و مسئله توافق رقابتی</strong><span>ماده ۴۴ · توافق و تفاهم</span><Arrow /></Link>
          <Link href="/decisions/437/"><small>رأی شماره ۴۳۷</small><strong>ایرانسل و حدود رفتار ضدرقابتی</strong><span>ماده ۴۵ · رویه یک‌جانبه</span><Arrow /></Link>
          <Link href="/decisions/sugar/"><small>آرای ۲۹۶ و ۲۹/۹۶/هـ‌ت</small><strong>بازار شکر و زنجیره بدوی و تجدیدنظر</strong><span>ماده ۴۴ · ماده ۵۲</span><Arrow /></Link>
        </div>
      </section>

      <section className="research shell">
        <p>پژوهش جاری</p>
        <h2>محشی قانون اجرای سیاست‌های کلی اصل چهل‌وچهار</h2>
        <span>خوانشی ماده‌به‌ماده از حقوق رقابت ایران، با تکیه بر آرای شورای رقابت و رویه قضایی</span>
        <Link href="/laws/article-44/">مطالعه ماده ۴۴ <Arrow /></Link>
      </section>
    </>
  );
}

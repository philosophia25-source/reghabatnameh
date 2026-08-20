import Link from "next/link";

const featured = [
  {
    eyebrow: "حقوق رقابت",
    title: "تحلیل مواد قانونی، نه صرفاً بازگویی متن قانون",
    text: "بررسی ساختار قواعد رقابتی، نسبت مواد با یکدیگر و جایگاه رویه شورای رقابت در تفسیر آنها.",
    href: "/articles/",
  },
  {
    eyebrow: "رویه",
    title: "آرای شورای رقابت در بستر موضوع و بازار",
    text: "آرای مهم با اطلاعات استاندارد، موضوعات مرتبط و پیوند به تحلیل‌های تفصیلی.",
    href: "/decisions/",
  },
  {
    eyebrow: "تنظیم‌گری",
    title: "از مخابرات تا پلتفرم‌ها و بازارهای تنظیم‌شده",
    text: "تحلیل حقوقی تنظیم‌گری بخشی و مرز آن با قواعد عمومی رقابت.",
    href: "/articles/",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-grid shell">
          <div className="hero-copy">
            <p className="kicker">حقوق رقابت و تنظیم‌گری ایران</p>
            <h1>بازار، قانون و رویه<br />در یک نقشه واحد</h1>
            <p className="hero-lead">
              رقابت‌نامه پایگاهی تخصصی برای تحلیل حقوق رقابت، آرای شورای رقابت و تنظیم‌گری بازارهاست.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/articles/">مطالعه تحلیل‌ها</Link>
              <Link className="button ghost" href="/decisions/">مرور آرا</Link>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="orb orb-a" />
            <div className="orb orb-b" />
            <div className="mesh-plane plane-one" />
            <div className="mesh-plane plane-two" />
            <div className="glass-card card-one"><span>ماده ۴۴</span><b>توافقات ضد رقابتی</b></div>
            <div className="glass-card card-two"><span>رویه</span><b>شورای رقابت</b></div>
            <div className="glass-card card-three"><span>تنظیم‌گری</span><b>بازارهای بخشی</b></div>
          </div>
        </div>
      </section>

      <section className="shell section">
        <div className="section-heading">
          <p className="kicker">ساختار دانش</p>
          <h2>از قاعده تا پرونده</h2>
          <p>هر مطلب قرار است به قانون، رأی، موضوع و بازار مرتبط خودش متصل شود.</p>
        </div>
        <div className="feature-grid">
          {featured.map((item) => (
            <Link className="feature-card" href={item.href} key={item.title}>
              <span>{item.eyebrow}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <b>مشاهده ←</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell section split-section">
        <div>
          <p className="kicker">رویکرد</p>
          <h2>قانون اصل است، رأی شاهد</h2>
        </div>
        <p className="large-copy">
          رقابت‌نامه قرار نیست آرشیوی از متن‌های پراکنده باشد. هدف، ساختن یک مجموعه پیوسته است که در آن تحلیل قانونی، رویه تصمیم‌گیری و ساختار واقعی بازار کنار هم خوانده شوند.
        </p>
      </section>
    </>
  );
}

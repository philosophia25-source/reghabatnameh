import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-identity">
        <Link className="brand footer-brand" href="/" aria-label="رقابت‌نامه، صفحه اصلی">
          <span className="brand-seal"><img src="/mark.svg" alt="" /></span>
          <strong>رقابت‌نامه</strong>
        </Link>
        <p>پایگاه یکپارچه حقوق رقابت و تنظیم‌گری ایران</p>
      </div>
      <div className="footer-author">
        <strong>مدیریت علمی و گردآوری: نادر جعفری</strong>
        <span>وکیل پایه یک دادگستری و پژوهشگر حقوق رقابت و تنظیم‌گری</span>
      </div>
      <nav className="footer-contact" aria-label="پیوندهای تکمیلی و راه‌های ارتباط">
        <Link href="/markets">بازارها</Link>
        <Link href="/about">درباره</Link>
        <Link href="/contact">ارتباط</Link>
        <a href="mailto:nader.jafari@modares.ac.ir">ایمیل</a>
        <a href="https://wa.me/989123084826" target="_blank" rel="noreferrer">واتس‌اپ</a>
      </nav>
      <span className="copyright">© ۱۴۰۵ نادر جعفری</span>
    </footer>
  );
}

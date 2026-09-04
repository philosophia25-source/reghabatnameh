import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="رقابت‌نامه، صفحه اصلی">
          <span className="brand-seal"><img src="/mark.svg" alt="" /></span>
          <span><strong>رقابت‌نامه</strong><small>حقوق رقابت و تنظیم‌گری ایران</small></span>
        </Link>
        <SiteNavigation className="main-nav" items={PRIMARY_NAV_ITEMS} label="ناوبری اصلی" />
      </header>
      <main id="main-content">{children}</main>
      <footer>
        <div className="footer-identity">
          <Link className="brand footer-brand" href="/"><span className="brand-seal"><img src="/mark.svg" alt="" /></span><strong>رقابت‌نامه</strong></Link>
          <p>پایگاه تحلیلی حقوق رقابت و تنظیم‌گری ایران</p>
        </div>
        <nav className="footer-contact" aria-label="راه‌های ارتباط با نادر جعفری">
          <a href="mailto:nader.jafari@modares.ac.ir">ایمیل</a>
          <a href="https://wa.me/989123084826" target="_blank" rel="noreferrer">واتس‌اپ</a>
          <Link href="/contact">نشانی دفتر</Link>
        </nav>
        <span className="copyright">© ۱۴۰۵ نادر جعفری</span>
      </footer>
    </>
  );
}

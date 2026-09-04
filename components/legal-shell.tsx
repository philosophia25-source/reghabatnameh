import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation";

export function LegalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal-site">
      <header className="legal-header">
        <Link className="brand" href="/" aria-label="رقابت‌نامه، صفحه اصلی">
          <span className="brand-seal"><img src="/mark.svg" alt="" /></span>
          <span><strong>رقابت‌نامه</strong><small>حقوق رقابت و تنظیم‌گری ایران</small></span>
        </Link>
        <SiteNavigation items={PRIMARY_NAV_ITEMS} label="ناوبری پایگاه حقوقی" />
      </header>
      <main id="main-content">{children}</main>
      <footer className="legal-footer">
        <Link href="/">رقابت‌نامه</Link>
        <span>پایگاه تحلیلی حقوق رقابت و تنظیم‌گری ایران</span>
      </footer>
    </div>
  );
}

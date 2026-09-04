import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation";

export function SiteHeader({ variant = "marketing" }: { variant?: "marketing" | "legal" }) {
  return (
    <header className={variant === "legal" ? "legal-header" : "site-header"}>
      <Link className="brand" href="/" aria-label="رقابت‌نامه، صفحه اصلی">
        <span className="brand-seal"><img src="/mark.svg" alt="" /></span>
        <span><strong>رقابت‌نامه</strong><small>حقوق رقابت و تنظیم‌گری ایران</small></span>
      </Link>
      <div className="header-links">
        <SiteNavigation className="main-nav" items={PRIMARY_NAV_ITEMS} label="ناوبری اصلی" />
        <Link className="header-search" href="/search" aria-label="جست‌وجو در همه منابع رقابت‌نامه">
          <span aria-hidden="true" />
          <b>جست‌وجو</b>
        </Link>
      </div>
    </header>
  );
}

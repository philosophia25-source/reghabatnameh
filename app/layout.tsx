import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource-variable/estedad/wght.css";
import "@fontsource-variable/vazirmatn/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://naderjafari.com"),
  title: { default: "رقابت‌نامه | نادر جعفری", template: "%s | رقابت‌نامه" },
  description: "یادداشت‌ها، آرا و تحلیل‌های نادر جعفری درباره حقوق رقابت و تنظیم‌گری ایران",
  alternates: { canonical: "/" },
  openGraph: {
    title: "رقابت‌نامه | نادر جعفری",
    description: "حقوق رقابت و تنظیم‌گری ایران",
    url: "/",
    siteName: "رقابت‌نامه",
    locale: "fa_IR",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "رقابت‌نامه، حقوق رقابت و تنظیم‌گری ایران" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "رقابت‌نامه | نادر جعفری",
    description: "حقوق رقابت و تنظیم‌گری ایران",
    images: ["/og.jpg"],
  },
};

const nav = [
  ["خانه", "/"],
  ["تحلیل‌ها", "/articles/"],
  ["آرای شورای رقابت", "/decisions/"],
  ["درباره رقابت‌نامه", "/about/"],
  ["ارتباط", "/contact/"],
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="رقابت‌نامه، صفحه اصلی">
            <span className="brand-seal"><img src="/mark.svg" alt="" /></span>
            <span><strong>رقابت‌نامه</strong><small>حقوق رقابت و تنظیم‌گری ایران</small></span>
          </Link>
          <nav className="main-nav" aria-label="ناوبری اصلی">
            {nav.map(([label, href], index) => <Link className={index === 0 ? "active" : ""} href={href} key={href}>{label}</Link>)}
          </nav>
          <div className="header-tools">
            <button type="button" aria-label="باز کردن فهرست"><i /><i /></button>
            <button className="search-icon" type="button" aria-label="جست‌وجو"><span /></button>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <div className="footer-identity">
            <Link className="brand footer-brand" href="/"><span className="brand-seal"><img src="/mark.svg" alt="" /></span><strong>رقابت‌نامه</strong></Link>
            <p>دفتر شخصی نادر جعفری برای حقوق رقابت و تنظیم‌گری</p>
          </div>
          <div className="footer-contact" aria-label="راه‌های ارتباط با نادر جعفری">
            <a href="mailto:nader.jafari@modares.ac.ir">ایمیل</a>
            <a href="https://wa.me/989123084826" target="_blank" rel="noreferrer">واتس‌اپ</a>
            <Link href="/contact/">نشانی دفتر</Link>
          </div>
          <span className="copyright">© ۱۴۰۵ نادر جعفری</span>
        </footer>
      </body>
    </html>
  );
}

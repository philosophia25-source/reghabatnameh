import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://naderjafari.com"),
  title: {
    default: "رقابت‌نامه | نادر جعفری",
    template: "%s | رقابت‌نامه",
  },
  description: "حقوق رقابت و تنظیم‌گری ایران؛ تحلیل قوانین، آرای شورای رقابت و تحولات تنظیم‌گری بازارها.",
  alternates: { canonical: "/" },
};

const nav = [
  ["تحلیل‌ها", "/articles/"],
  ["آرا", "/decisions/"],
  ["درباره", "/about/"],
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <header className="site-header">
          <div className="shell header-inner">
            <Link className="brand" href="/" aria-label="رقابت‌نامه، صفحه اصلی">
              <strong>رقابت‌نامه</strong>
              <span>نادر جعفری</span>
            </Link>
            <nav aria-label="ناوبری اصلی">
              {nav.map(([label, href]) => (
                <Link href={href} key={href}>{label}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="shell footer-inner">
            <div>
              <strong>رقابت‌نامه</strong>
              <p>حقوق رقابت و تنظیم‌گری ایران</p>
            </div>
            <p>© نادر جعفری</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

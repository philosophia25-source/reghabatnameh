import Link from "next/link";

export function LegalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal-site">
      <header className="legal-header">
        <Link className="brand" href="/" aria-label="رقابت‌نامه، صفحه اصلی">
          <span className="brand-seal">ر</span>
          <span><strong>رقابت‌نامه</strong><small>حقوق رقابت و تنظیم‌گری ایران</small></span>
        </Link>
        <nav aria-label="ناوبری پایگاه حقوقی">
          <Link href="/">خانه</Link>
          <Link href="/laws">قوانین و شرح</Link>
          <Link href="/institutions">نهادها</Link>
          <Link href="/topics">موضوعات</Link>
          <Link href="/markets">بازارها</Link>
          <Link href="/decisions">آرای منتخب</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="legal-footer">
        <Link href="/">رقابت‌نامه</Link>
        <span>شبکه تحلیلی حقوق رقابت و تنظیم‌گری ایران</span>
      </footer>
    </div>
  );
}

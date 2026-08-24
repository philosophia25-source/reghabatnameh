import Link from "next/link";

export function LegalShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="legal-site">
      <header className="legal-header">
        <Link className="brand" href="/" aria-label="رقابت‌نامه، صفحه اصلی">
          <span className="brand-seal">ر</span>
          <span><strong>رقابت‌نامه</strong><small>حقوق رقابت و تنظیم‌گری ایران</small></span>
        </Link>
        <nav aria-label="ناوبری پایگاه حقوقی">
          <Link href="/">خانه</Link>
          <Link className="active" href="/laws">قوانین</Link>
          <Link href="/laws/article-44/commentary">شرح مواد</Link>
          <Link href="/decisions">آرای مهم</Link>
        </nav>
      </header>
      {children}
      <footer className="legal-footer">
        <Link href="/">رقابت‌نامه</Link>
        <span>شرح تحلیلی حقوق رقابت ایران</span>
      </footer>
    </main>
  );
}

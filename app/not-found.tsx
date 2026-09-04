import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found-page" id="main-content">
      <Link className="brand" href="/" aria-label="رقابت‌نامه، صفحه اصلی">
        <span className="brand-seal"><img src="/mark.svg" alt="" /></span>
        <span><strong>رقابت‌نامه</strong><small>حقوق رقابت و تنظیم‌گری ایران</small></span>
      </Link>
      <div className="not-found-copy">
        <span>۴۰۴</span>
        <p className="eyebrow">نشانی پیدا نشد</p>
        <h1>این صفحه در دسترس نیست</h1>
        <p>ممکن است نشانی تغییر کرده باشد یا پیوند به‌درستی نوشته نشده باشد.</p>
        <div>
          <Link href="/search">جست‌وجو در رقابت‌نامه</Link>
          <Link href="/">بازگشت به صفحه اصلی</Link>
        </div>
      </div>
    </section>
  );
}

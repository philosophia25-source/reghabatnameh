import Link from "next/link";

export const metadata = { title: "تحلیل‌ها" };

const placeholders = [
  ["ماده ۴۴", "عناصر سازنده توافق ضد رقابتی", "حقوق رقابت"],
  ["ماده ۴۴", "الزام طرف معامله به قرارداد با اشخاص ثالث", "حقوق رقابت"],
  ["تنظیم‌گری", "مرز تنظیم‌گری بخشی و حقوق رقابت", "تنظیم‌گری"],
];

export default function ArticlesPage() {
  return (
    <section className="shell listing-page">
      <p className="kicker">تحلیل‌ها</p>
      <h1>تحلیل حقوقی</h1>
      <p className="lead">این صفحه محل انتشار متن‌های تحلیلی نهایی خواهد بود.</p>
      <div className="list-stack">
        {placeholders.map(([eyebrow, title, tag]) => (
          <article className="list-item" key={title}>
            <div><span>{eyebrow}</span><h2>{title}</h2></div>
            <div className="meta"><span>{tag}</span><span>در حال آماده‌سازی</span></div>
          </article>
        ))}
      </div>
      <Link className="text-link" href="/">بازگشت به صفحه اصلی</Link>
    </section>
  );
}

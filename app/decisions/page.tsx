export const metadata = { title: "آرای شورای رقابت" };

const decisions = ["رأی شماره ۲۳۶", "رأی شماره ۳۵۴", "رأی شماره ۴۳۷", "رأی شماره ۶۳۱"];

export default function DecisionsPage() {
  return (
    <section className="shell listing-page">
      <p className="kicker">رویه</p>
      <h1>آرای شورای رقابت</h1>
      <p className="lead">آرای منتخب در نسخه نهایی با موضوع، بازار، مواد مرتبط و تحلیل‌های متصل نمایش داده می‌شوند.</p>
      <div className="decision-grid">
        {decisions.map((decision) => (
          <article className="decision-card" key={decision}>
            <span>شورای رقابت</span>
            <h2>{decision}</h2>
            <p>اطلاعات پرونده و برچسب‌های موضوعی پس از ورود محتوای نهایی افزوده می‌شود.</p>
          </article>
        ))}
      </div>
    </section>
  );
}

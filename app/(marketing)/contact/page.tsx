import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ارتباط",
  description: "راه‌های ارتباط با نادر جعفری و نشانی دفتر",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "ارتباط با نادر جعفری",
    description: "راه‌های ارتباط و نشانی دفتر",
    url: "/contact",
    siteName: "رقابت‌نامه",
    locale: "fa_IR",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "ارتباط با نادر جعفری | رقابت‌نامه" }],
  },
  twitter: { card: "summary_large_image", title: "ارتباط با نادر جعفری | رقابت‌نامه", description: "راه‌های ارتباط و نشانی دفتر", images: ["/og.jpg"] },
};

const officeMap = "https://maps.app.goo.gl/3XFQqVikcWvp4p9F9";

export default function ContactPage() {
  return (
    <article className="shell prose-page contact-page">
      <p className="kicker">ارتباط</p>
      <h1>راه‌های ارتباطی</h1>
      <p className="lead">برای مکاتبات و هماهنگی مراجعه حضوری می‌توانید از راه‌های زیر استفاده کنید.</p>

      <div className="contact-grid">
        <section className="contact-card">
          <small>نشانی دفتر</small>
          <address>تهران، سرو، بزرگراه آیت‌الله هاشمی رفسنجانی، بلوار فرحزادی، ۱۰ متری تقاطع بوستان چهارم، پلاک ۵۱، واحد ۲</address>
          <a className="map-link" href={officeMap} target="_blank" rel="noreferrer">مشاهده روی نقشه <span aria-hidden="true">←</span></a>
        </section>

        <section className="contact-card contact-links" aria-label="اطلاعات تماس">
          <a href="mailto:nader.jafari@modares.ac.ir"><small>ایمیل</small><span dir="ltr">nader.jafari@modares.ac.ir</span></a>
          <a href="tel:+989123084826"><small>تلفن</small><span dir="ltr">۰۹۱۲۳۰۸۴۸۲۶</span></a>
          <a href="https://wa.me/989123084826" target="_blank" rel="noreferrer"><small>پیام‌رسان</small>واتس‌اپ</a>
        </section>
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import "@fontsource-variable/estedad/wght.css";
import "@fontsource-variable/vazirmatn/wght.css";
import "./globals.css";
import { JsonLd } from "@/components/json-ld";
import { AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "رقابت‌نامه | نادر جعفری", template: "%s | رقابت‌نامه" },
  description: "یادداشت‌ها، آرا و تحلیل‌های نادر جعفری درباره حقوق رقابت و تنظیم‌گری ایران",
  openGraph: {
    siteName: SITE_NAME,
    locale: "fa_IR",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${SITE_NAME}، ${SITE_DESCRIPTION}` }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "fa-IR",
      author: { "@id": `${SITE_URL}/about#person` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${SITE_URL}/about#person`,
      name: AUTHOR.name,
      url: `${SITE_URL}${AUTHOR.route}`,
      email: AUTHOR.email,
      jobTitle: "وکیل پایه یک دادگستری و پژوهشگر حقوق رقابت و تنظیم‌گری",
    },
  ];
  return (
    <html lang="fa" dir="rtl">
      <body>
        <JsonLd data={jsonLd} />
        <a className="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
        {children}
      </body>
    </html>
  );
}

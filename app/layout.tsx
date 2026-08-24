import type { Metadata } from "next";
import "@fontsource-variable/estedad/wght.css";
import "@fontsource-variable/vazirmatn/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://naderjafari.com"),
  title: { default: "رقابت‌نامه | نادر جعفری", template: "%s | رقابت‌نامه" },
  description: "یادداشت‌ها، آرا و تحلیل‌های نادر جعفری درباره حقوق رقابت و تنظیم‌گری ایران",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

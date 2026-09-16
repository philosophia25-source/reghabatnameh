import type { Metadata } from "next";
import { CompetitionPrinciplesPage } from "@/components/competition-principles-page";
import {
  COMPETITION_PRINCIPLES_DESCRIPTION,
  COMPETITION_PRINCIPLES_ROUTE,
  COMPETITION_PRINCIPLES_TITLE,
} from "@/lib/competition-principles";

export const metadata: Metadata = {
  title: COMPETITION_PRINCIPLES_TITLE,
  description: COMPETITION_PRINCIPLES_DESCRIPTION,
  alternates: { canonical: COMPETITION_PRINCIPLES_ROUTE },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${COMPETITION_PRINCIPLES_TITLE} | رقابت‌نامه`,
    description: COMPETITION_PRINCIPLES_DESCRIPTION,
    url: COMPETITION_PRINCIPLES_ROUTE,
    siteName: "رقابت‌نامه",
    locale: "fa_IR",
    type: "article",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${COMPETITION_PRINCIPLES_TITLE} | رقابت‌نامه` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPETITION_PRINCIPLES_TITLE} | رقابت‌نامه`,
    description: COMPETITION_PRINCIPLES_DESCRIPTION,
    images: ["/og.jpg"],
  },
};

export default function CompetitionLawPrinciplesRoute() {
  return <CompetitionPrinciplesPage />;
}

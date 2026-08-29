import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";

const destination = "/laws/general-policies-44/article-44";

export const metadata: Metadata = {
  title: "انتقال ماده ۴۴",
  alternates: { canonical: destination },
  robots: { index: false, follow: true },
};

export default function LegacyArticle44Page() {
  return <LegacyRedirect destination={destination} />;
}

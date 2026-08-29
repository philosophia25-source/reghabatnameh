import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/legacy-redirect";

const destination = "/laws/general-policies-44/article-45";

export const metadata: Metadata = {
  title: "انتقال ماده ۴۵",
  alternates: { canonical: destination },
  robots: { index: false, follow: true },
};

export default function LegacyArticle45Page() {
  return <LegacyRedirect destination={destination} />;
}

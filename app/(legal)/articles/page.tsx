import type { Metadata } from "next";
import Link from "next/link";
import { publishedArticles } from "@/lib/knowledge/queries";
import { JournalCollection } from "@/components/journal-collection";

export const metadata: Metadata = { title: "مقالات", description: "مقالات پژوهشی حقوق رقابت و تنظیم‌گری با متن کامل و مشخصات انتشار", alternates: { canonical: "/articles" } };
export default function ArticlesPage() {
  return <div className="shell journal-index">
    <div className="breadcrumbs"><Link href="/">خانه</Link><span>←</span><b>مقالات</b></div>
    <h1>مقالات</h1>
    <JournalCollection articles={publishedArticles} />
  </div>;
}

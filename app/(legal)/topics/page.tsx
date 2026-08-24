import type { Metadata } from "next";
import Link from "next/link";
import { toFaDigits } from "@/app/text";
import { documentsForTopic, publishedTopics } from "@/lib/knowledge/queries";

export const metadata: Metadata = {
  title: "موضوعات حقوق رقابت و تنظیم‌گری",
  description: "دسترسی موضوعی به مواد، آرا و تحلیل‌های حقوق رقابت و تنظیم‌گری",
  alternates: { canonical: "/topics" },
};

export default function TopicsPage() {
  return (
    <section className="shell listing-page knowledge-index-page">
      <p className="kicker">شبکه موضوعی</p><h1>موضوعات حقوقی</h1>
      <p className="lead">هر موضوع، مواد قانونی و اسناد منتخب مربوط را بدون وابستگی به یک قانون یا نهاد خاص کنار هم قرار می‌دهد.</p>
      <div className="knowledge-card-grid knowledge-card-grid-three">
        {publishedTopics.map((topic) => (
          <Link className="knowledge-card" href={topic.route} key={topic.id}>
            <small>موضوع</small><h2>{topic.title}</h2><p>{topic.description}</p><b>{toFaDigits(documentsForTopic(topic.id).length)} سند منتخب ←</b>
          </Link>
        ))}
      </div>
    </section>
  );
}

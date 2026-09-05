import Link from "next/link";
import type { KnowledgeArticle } from "@/lib/knowledge/types";

export function JournalCollection({ articles }: { articles: KnowledgeArticle[] }) {
  if (!articles.length) return null;
  return <section className="journal-collection" aria-label="مقالات">
    {articles.map(article => <Link className="journal-card" href={article.route} key={article.id}>
      <span>مقاله پژوهشی · {article.publication.journal} · {article.publication.year}</span>
      <h2>{article.title}</h2>
      <p>{article.authors.map(a => a.name).join("، ")}</p>
      <span>مطالعه مقاله ←</span>
    </Link>)}
  </section>;
}

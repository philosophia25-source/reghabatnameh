import Link from "next/link";
import { toFaDigits } from "@/app/text";
import { lawArticleRoute } from "@/lib/laws/general-policies-44";
import type { LawArticle } from "@/lib/laws/types";

export function LawArticleText({ article, standalone = false }: { article: LawArticle; standalone?: boolean }) {
  const researchPage = article.slug === "44" || article.slug === "45";
  return (
    <article
      id={standalone ? undefined : `article-${article.slug}`}
      className={`law-reader-article${standalone ? " standalone" : ""}`}
      data-law-article={standalone ? undefined : article.slug}
    >
      <header>
        <h2><Link href={lawArticleRoute(article.slug)}>{toFaDigits(article.label)}</Link></h2>
        {researchPage ? <Link className="law-research-link" href={lawArticleRoute(article.slug)}>متن، شرح و آرای مرتبط ←</Link> : null}
      </header>
      <div className="law-reader-text">
        {article.blocks.map((block) => {
          const content = toFaDigits(block.text);
          if (block.kind === "note") return <aside className="law-reader-note" id={block.id} key={block.id}>{content}</aside>;
          return <p className={block.kind === "clause" ? "law-reader-clause" : ""} id={block.id} key={block.id}>{content}</p>;
        })}
      </div>
    </article>
  );
}

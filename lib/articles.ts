import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { KnowledgeArticle } from "@/lib/knowledge/types";

export function readArticleHtml(article: KnowledgeArticle) {
  return readFileSync(join(process.cwd(), "content", article.contentFile), "utf8");
}

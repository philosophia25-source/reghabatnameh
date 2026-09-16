import { readFileSync } from "node:fs";
import { join } from "node:path";
import { toFaDigits } from "@/app/text";
import {
  ARTICLE_44_ID,
  article44Note,
  article44Paragraphs,
} from "@/lib/knowledge/article44";
import {
  ARTICLE_45_ID,
  article45Chapeau,
  article45CommentaryParts,
  article45Sections,
} from "@/lib/knowledge/article45";
import type { Provision } from "@/lib/knowledge/types";
import type { LawArticle, LawManifest, LawTextBlock } from "@/lib/laws/types";

const contentRoot = join(process.cwd(), "content", "laws", "general-policies-44");

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export const generalPolicies44Law = readJson<LawManifest>(join(contentRoot, "law.json"));

function article44(): LawArticle {
  const blocks: LawTextBlock[] = [
    { id: `${ARTICLE_44_ID}:chapeau`, kind: "paragraph", text: article44Paragraphs[0] },
    ...article44Paragraphs.slice(1).map((text, index) => ({
      id: `${ARTICLE_44_ID}:clause-${index + 1}`,
      kind: "clause" as const,
      text,
    })),
    { id: `${ARTICLE_44_ID}:note`, kind: "note", text: `تبصره ـ ${article44Note}` },
  ];
  return {
    id: ARTICLE_44_ID,
    slug: "44",
    label: "ماده ۴۴",
    sourceUrl: "https://davoudabadi.ir/page/1387526",
    blocks,
  };
}

function article45(): LawArticle {
  const partId = (slug: string) => article45CommentaryParts.find((part) => part.slug === slug)?.provisionId
    ?? `${ARTICLE_45_ID}:${slug}`;
  const blocks: LawTextBlock[] = [
    { id: partId("chapeau"), kind: "paragraph", text: article45Chapeau },
  ];
  article45Sections.forEach((section) => {
    blocks.push({ id: partId(section.slug), kind: "clause", text: `${section.letter} ـ ${section.title}` });
    if (section.lead) {
      blocks.push({ id: `${partId(section.slug)}:lead`, kind: "paragraph", text: section.lead });
    }
    section.items?.forEach((item) => {
      blocks.push({ id: partId(item.slug), kind: "clause", text: `${item.number} ـ ${item.text}` });
    });
    if (section.note) {
      blocks.push({ id: partId(section.note.slug), kind: "note", text: `تبصره ـ ${section.note.text}` });
    }
  });
  return {
    id: ARTICLE_45_ID,
    slug: "45",
    label: "ماده ۴۵",
    sourceUrl: "https://davoudabadi.ir/page/1847653",
    blocks,
  };
}

const curatedArticles = new Map<string, LawArticle>([
  ["44", article44()],
  ["45", article45()],
]);

const articleCache = new Map<string, LawArticle>();

export function lawArticleBySlug(slug: string): LawArticle | undefined {
  if (!generalPolicies44Law.articleSlugs.includes(slug)) return undefined;
  const curated = curatedArticles.get(slug);
  if (curated) return curated;
  const cached = articleCache.get(slug);
  if (cached) return cached;
  const article = readJson<LawArticle>(join(contentRoot, "articles", `${slug}.json`));
  articleCache.set(slug, article);
  return article;
}

export function allGeneralPolicies44Articles() {
  return generalPolicies44Law.articleSlugs
    .map(lawArticleBySlug)
    .filter((article): article is LawArticle => Boolean(article));
}

export function lawChapterForArticle(slug: string) {
  return generalPolicies44Law.chapters.find((chapter) => chapter.articleSlugs.includes(slug));
}

export function lawArticleRoute(slug: string) {
  return `/laws/general-policies-44/article-${slug}`;
}

export function adjacentLawArticles(slug: string) {
  const index = generalPolicies44Law.articleSlugs.indexOf(slug);
  return {
    previous: index > 0 ? lawArticleBySlug(generalPolicies44Law.articleSlugs[index - 1]) : undefined,
    next: index >= 0 && index < generalPolicies44Law.articleSlugs.length - 1
      ? lawArticleBySlug(generalPolicies44Law.articleSlugs[index + 1])
      : undefined,
  };
}

function validateGeneralPolicies44Law() {
  const articleSlugs = generalPolicies44Law.articleSlugs;
  const chapterSlugs = generalPolicies44Law.chapters.flatMap((chapter) => chapter.articleSlugs);
  if (new Set(articleSlugs).size !== articleSlugs.length) {
    throw new Error("Duplicate article slug in the General Policies Article 44 Act");
  }
  if (chapterSlugs.join("|") !== articleSlugs.join("|")) {
    throw new Error("Law chapter articles do not match the canonical article order");
  }

  const knownSlugs = new Set(articleSlugs);
  for (const group of generalPolicies44Law.competitionGuide) {
    for (const slug of group.articleSlugs) {
      if (!knownSlugs.has(slug)) {
        throw new Error(`Unknown article ${slug} in competition guide ${group.id}`);
      }
    }
  }

  const articles = allGeneralPolicies44Articles();
  if (articles.length !== articleSlugs.length) {
    throw new Error("One or more law article files could not be loaded");
  }
  const articleIds = new Set<string>();
  const blockIds = new Set<string>();
  articles.forEach((article, index) => {
    if (article.slug !== articleSlugs[index]) {
      throw new Error(`Article ${article.slug} is out of canonical order`);
    }
    if (articleIds.has(article.id)) {
      throw new Error(`Duplicate law article id ${article.id}`);
    }
    articleIds.add(article.id);
    if (!article.blocks.length) {
      throw new Error(`Article ${article.slug} has no text blocks`);
    }
    article.blocks.forEach((block) => {
      if (blockIds.has(block.id)) {
        throw new Error(`Duplicate law text block id ${block.id}`);
      }
      blockIds.add(block.id);
      if (!block.text.trim()) {
        throw new Error(`Empty text block ${block.id}`);
      }
    });
  });
}

validateGeneralPolicies44Law();

export const generalPolicies44ArticleProvisions: Provision[] = allGeneralPolicies44Articles()
  .filter((article) => !curatedArticles.has(article.slug))
  .map((article) => {
    const chapter = lawChapterForArticle(article.slug);
    return {
      id: article.id,
      legalSourceId: "general-policies-44-law",
      slug: `article-${article.slug}`,
      label: toFaDigits(article.label),
      title: `متن ${toFaDigits(article.label)}`,
      description: chapter?.title ?? generalPolicies44Law.shortTitle,
      route: lawArticleRoute(article.slug),
      status: "published",
    };
  });

export function lawArticleForProvision(id: string) {
  return allGeneralPolicies44Articles().find((article) => article.id === id);
}

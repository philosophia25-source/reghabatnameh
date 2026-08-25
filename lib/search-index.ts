import { readFileSync } from "node:fs";
import { join } from "node:path";
import { decisionRecords } from "@/app/decision-data";
import {
  institutionsForDocument,
  marketsForDocument,
  provisionById,
  publishedCommentaries,
  publishedDocuments,
  publishedInstitutions,
  publishedLegalSources,
  publishedMarkets,
  publishedProvisions,
  publishedTopics,
  topicsForDocument,
} from "@/lib/knowledge/queries";

export type SearchEntry = {
  id: string;
  title: string;
  category: string;
  href: string;
  summary: string;
  searchText: string;
};

function cleanMarkdown(value: string) {
  return value
    .replace(/\[\\?\[(\d+)\\?\]\]\(#_ftn\w+\)/g, " ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[\\*_#>`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function concise(value: string, length = 190) {
  const normalized = cleanMarkdown(value);
  return normalized.length > length ? `${normalized.slice(0, length).trim()}…` : normalized;
}

export function buildSearchIndex(): SearchEntry[] {
  const commentaryRoutes = new Set(publishedCommentaries.map((item) => item.route));

  const legalSourceEntries = publishedLegalSources.map((source) => ({
    id: `law:${source.id}`,
    title: source.title,
    category: "قانون و مقرره",
    href: source.route,
    summary: `متن و شرح مواد منتخب ${source.shortTitle}`,
    searchText: `${source.title} ${source.shortTitle}`,
  }));

  const provisionEntries = publishedProvisions
    .filter((provision) => !commentaryRoutes.has(provision.route))
    .map((provision) => ({
      id: `provision:${provision.id}`,
      title: `${provision.label}، ${provision.title}`,
      category: "ماده قانونی",
      href: provision.route,
      summary: provision.description,
      searchText: `${provision.label} ${provision.title} ${provision.description}`,
    }));

  const commentaryEntries = publishedCommentaries.map((commentary) => {
    const provision = provisionById(commentary.provisionId);
    const raw = commentary.contentFile
      ? readFileSync(join(process.cwd(), "content", commentary.contentFile), "utf8")
      : "";
    return {
      id: commentary.id,
      title: commentary.title,
      category: "شرح قانون",
      href: commentary.route,
      summary: provision?.description ?? "شرح تحلیلی قانون رقابت",
      searchText: cleanMarkdown(`${commentary.title} ${provision?.label ?? ""} ${provision?.description ?? ""} ${raw}`),
    };
  });

  const decisionEntries = publishedDocuments.map((document) => {
    const record = decisionRecords[document.slug];
    const stageText = record.stages.map((stage) => [
      ...Object.values(stage.meta),
      stage.body,
    ].join(" ")).join(" ");
    const relations = [
      ...institutionsForDocument(document.id).map((item) => item.name),
      ...topicsForDocument(document.id).map((item) => item.title),
      ...marketsForDocument(document.id).map((item) => item.title),
      ...document.provisionLinks.map((link) => provisionById(link.provisionId)?.label ?? ""),
    ].join(" ");
    const first = record.stages[0];
    return {
      id: document.id,
      title: document.title,
      category: document.documentType === "decision" ? "رأی منتخب" : "سند تنظیم‌گری",
      href: document.route,
      summary: concise(`${first.meta["قاعده/دلیل انتخاب"] ?? document.relation}`),
      searchText: cleanMarkdown(`${document.title} ${document.relation} ${relations} ${stageText}`),
    };
  });

  const institutionEntries = publishedInstitutions.map((institution) => ({
    id: `institution:${institution.id}`,
    title: institution.name,
    category: "نهاد",
    href: institution.route,
    summary: institution.description,
    searchText: `${institution.name} ${institution.shortName} ${institution.description}`,
  }));

  const topicEntries = publishedTopics.map((topic) => ({
    id: `topic:${topic.id}`,
    title: topic.title,
    category: "موضوع حقوقی",
    href: topic.route,
    summary: topic.description,
    searchText: `${topic.title} ${topic.description}`,
  }));

  const marketEntries = publishedMarkets.map((market) => ({
    id: `market:${market.id}`,
    title: market.title,
    category: "بازار و صنعت",
    href: market.route,
    summary: market.description,
    searchText: `${market.title} ${market.description}`,
  }));

  return [
    ...commentaryEntries,
    ...decisionEntries,
    ...legalSourceEntries,
    ...provisionEntries,
    ...institutionEntries,
    ...topicEntries,
    ...marketEntries,
  ];
}

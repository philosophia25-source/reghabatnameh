import { readFileSync } from "node:fs";
import { join } from "node:path";
import { decisionRecords } from "@/app/decision-data";
import { craResolutions, readCraResolutionHtml } from "@/lib/cra/data";
import { compactSearchText, normalizeSearchText } from "@/lib/search-normalize";
import {
  documentsForCase,
  institutionsForDocument,
  marketsForDocument,
  provisionById,
  publishedCommentaries,
  publishedCases,
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
  titleSearchText: string;
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

function cleanHtml(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
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

  const decisionEntries = publishedDocuments
    .filter((document) => document.documentType === "decision")
    .map((document) => {
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

  const resolutionEntries = craResolutions.map((resolution) => {
    const fullText = resolution.contentAvailable
      ? cleanHtml(readCraResolutionHtml(resolution))
      : "";
    const number = resolution.resolutionNumber
      ? `مصوبه شماره ${resolution.resolutionNumber} جلسه ${resolution.sessionNumber}`
      : `جلسه ${resolution.sessionNumber}`;
    const relationText = [
      ...Object.values(resolution.relations).flat().map((target) => target.title),
      ...resolution.textReferences.flatMap((target) => [target.title, target.evidence]),
    ].join(" ");
    return {
      id: resolution.id,
      title: resolution.title,
      category: "مصوبه تنظیم‌گری",
      href: resolution.route,
      summary: `${number}، ${resolution.approvalDate || "بدون تاریخ"}، ${resolution.category}`,
      searchText: cleanMarkdown([
        resolution.title,
        resolution.code,
        resolution.sessionNumber,
        resolution.resolutionNumber,
        resolution.approvalDate,
        resolution.category,
        resolution.keywords.join(" "),
        relationText,
        fullText,
      ].join(" ")),
    };
  });

  const caseEntries = publishedCases.map((caseRecord) => {
    const relatedDocuments = documentsForCase(caseRecord.id);
    const relatedText = relatedDocuments.map((document) => {
      const record = decisionRecords[document.slug];
      return record.stages.map((stage) => Object.values(stage.meta).join(" ")).join(" ");
    }).join(" ");
    return {
      id: caseRecord.id,
      title: caseRecord.title,
      category: "پرونده",
      href: caseRecord.route,
      summary: caseRecord.description,
      searchText: cleanMarkdown(`${caseRecord.title} ${caseRecord.description} ${relatedText}`),
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

  const entries = [
    ...commentaryEntries,
    ...decisionEntries,
    ...resolutionEntries,
    ...caseEntries,
    ...legalSourceEntries,
    ...provisionEntries,
    ...institutionEntries,
    ...topicEntries,
    ...marketEntries,
  ];

  return entries.map((entry) => ({
    ...entry,
    titleSearchText: normalizeSearchText(entry.title),
    searchText: compactSearchText(`${entry.title} ${entry.summary} ${entry.searchText}`),
  }));
}

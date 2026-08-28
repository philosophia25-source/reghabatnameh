import { readFileSync } from "node:fs";
import { join } from "node:path";
import { documents } from "@/lib/knowledge/registry";
import { ARTICLE_44_ID } from "@/lib/knowledge/article44";
import { ARTICLE_45_ID } from "@/lib/knowledge/article45";
import type { KnowledgeDocument } from "@/lib/knowledge/types";
import {
  institutionById,
  marketById,
  provisionById,
  topicById,
} from "@/lib/knowledge/queries";

export type ParsedDecision = {
  meta: Record<string, string>;
  body: string;
};

export type DecisionRecord = KnowledgeDocument & {
  stages: ParsedDecision[];
};

function parseDecision(raw: string): ParsedDecision {
  const [head, ...bodyParts] = raw.replace(/^﻿/, "").split(/={20,}/);
  const meta: Record<string, string> = {};
  head.split("\n").forEach((line) => {
    const separator = line.indexOf(":");
    if (separator > 0) meta[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  });
  return {
    meta,
    body: bodyParts.join("\n").replace(/^\s*متن کامل موضوع\s*/m, "").trim(),
  };
}

function readDecision(name: string) {
  return parseDecision(readFileSync(join(process.cwd(), "content/decisions", name), "utf8"));
}

const decisionDocuments = documents.filter(
  (document) => document.documentType === "decision" && document.status === "published",
);

export const decisionRecords: Record<string, DecisionRecord> = Object.fromEntries(
  decisionDocuments.map((document) => [
    document.slug,
    {
      ...document,
      stages: document.files.map(readDecision),
    },
  ]),
);

export const decisionSlugs = decisionDocuments.map((document) => document.slug);

export const decisionIndexRecords = decisionDocuments.map((document) => {
  const record = decisionRecords[document.slug];
  const first = record.stages[0].meta;
  const numbers = record.stages.map((stage) => stage.meta["شماره جلسه/رأی"]).filter(Boolean);
  return {
    id: document.id,
    slug: document.slug,
    href: document.route,
    title: document.title,
    number: numbers.join(" و "),
    authority: first["مرجع"],
    date: first["تاریخ"],
    type: first["نوع تصمیم"],
    regulations: record.stages.map((stage) => stage.meta["مقررات مرتبط"]).filter(Boolean).join("، "),
    relation: document.relation,
    issuerIds: document.issuerIds,
    provisionLinks: document.provisionLinks,
    topicIds: document.topicIds,
    marketIds: document.marketIds,
    institutionLabels: document.issuerIds.map((id) => institutionById(id)?.shortName).filter((value): value is string => Boolean(value)),
    provisionLabels: document.provisionLinks.map((link) => provisionById(link.provisionId)?.label).filter((value): value is string => Boolean(value)),
    topicLabels: document.topicIds.map((id) => topicById(id)?.title).filter((value): value is string => Boolean(value)),
    marketLabels: document.marketIds.map((id) => marketById(id)?.title).filter((value): value is string => Boolean(value)),
  };
});

export const article44DecisionIndexRecords = decisionIndexRecords.filter((decision) =>
  decision.provisionLinks.some((link) => link.provisionId === ARTICLE_44_ID || link.provisionId.startsWith(`${ARTICLE_44_ID}:`)),
);

export const article45DecisionIndexRecords = decisionIndexRecords.filter((decision) =>
  decision.provisionLinks.some((link) => link.provisionId === ARTICLE_45_ID || link.provisionId.startsWith(`${ARTICLE_45_ID}:`)),
);

function faDigits(value: string) {
  return value.replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export const decisionRouteByMention: Record<string, string> = Object.fromEntries(
  decisionDocuments.flatMap((document) => decisionRecords[document.slug].stages.flatMap((stage) => {
    const raw = stage.meta["شماره جلسه/رأی"] ?? "";
    const number = faDigits(raw.replace(/^رأی\s*/, "").trim());
    return [
      [`رأی شماره ${number}`, document.route],
      [`رأی ${number}`, document.route],
      [`تصمیم شماره ${number}`, document.route],
      [`تصمیم جلسه شماره ${number}`, document.route],
      [`تصمیم جلسه ${number}`, document.route],
      [`تصمیم ${number}`, document.route],
    ];
  })),
);

export function decisionDescription(record: DecisionRecord) {
  const first = record.stages[0].meta;
  return `${record.title}، ${first["مرجع"]}، ${first["نوع تصمیم"]} و ارتباط آن با شبکه حقوق رقابت و تنظیم‌گری`;
}

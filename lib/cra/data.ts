import { readFileSync } from "node:fs";
import { join } from "node:path";
import rawResolutions from "@/content/cra/index.json";
import type {
  CraRelationTarget,
  CraRelations,
  CraResolution,
  CraTextReferenceTarget,
} from "./types";
import type { KnowledgeDocument } from "@/lib/knowledge/types";
import { CONTENT_UPDATED_ISO } from "@/lib/site";
import { craCategories } from "@/lib/cra/categories";
import { toFaDate, toFaDigits } from "@/app/text";

const craWordJoinArtifact = /([\u0621-\u063A\u0641-\u064A\u066E-\u06D3\u06FA-\u06FF])[ \t]*[\u00AD\u200E\u200F\u2060][ \t]*([\u0621-\u063A\u0641-\u064A\u066E-\u06D3\u06FA-\u06FF])/g;
const craEmptyTableNumber = /<td([^>]*)>\s*<ol\b([^>]*)\bstart=(["'])(\d+)\3([^>]*)>\s*<li(?:\s[^>]*)?>\s*(?:<\/li>)?\s*<\/ol>\s*<\/td>/gi;
const craInlineFormattedDayFirstDate = /(\d{1,2})\/(\d{1,2})\/<(em|strong|b|i|u)(?:\s[^>]*)?>(\d{4})<\/\3>/gi;
const craSourceLabel = /(<section class="cra-source-text" data-format="([^"]+)">)<div class="cra-source-label">متن پیوست <span>[^<]*<\/span><\/div>/gi;
const craMarkupNumberSeparator = /([۰-۹])((?:<[^>]+>)*)[,،]((?:<[^>]+>)*)(?=[۰-۹])/g;
const craMarkupWordJoinArtifact = /([\u0621-\u063A\u0641-\u064A\u066E-\u06D3\u06FA-\u06FF])((?:<[^>]+>)*)[\u00AD\u200E\u200F\u2060]((?:<[^>]+>)*)(?=[\u0621-\u063A\u0641-\u064A\u066E-\u06D3\u06FA-\u06FF])/g;

function normalizeCraWordArtifacts(text: string) {
  return text
    .replace(craWordJoinArtifact, "$1‌$2")
    .replace(/\u00AD/g, "‌");
}

function normalizeCraRelationTarget(target: CraRelationTarget): CraRelationTarget {
  return { ...target, title: normalizeCraWordArtifacts(target.title) };
}

const sourceCraResolutions = rawResolutions as CraResolution[];

export const craResolutions: CraResolution[] = sourceCraResolutions.map((resolution) => ({
  ...resolution,
  title: normalizeCraWordArtifacts(resolution.title),
  keywords: resolution.keywords.map(normalizeCraWordArtifacts),
  relations: {
    related: resolution.relations.related.map(normalizeCraRelationTarget),
    affects: resolution.relations.affects.map(normalizeCraRelationTarget),
    influencedBy: resolution.relations.influencedBy.map(normalizeCraRelationTarget),
    versions: resolution.relations.versions.map(normalizeCraRelationTarget),
  },
  textReferences: resolution.textReferences.map((target) => ({
    ...normalizeCraRelationTarget(target),
    evidence: normalizeCraWordArtifacts(target.evidence),
  })),
}));

const registeredCategoryNames = new Set(craCategories.map((category) => category.name));
const unknownCategoryNames = Array.from(new Set(
  craResolutions
    .map((resolution) => resolution.category)
    .filter((category) => !registeredCategoryNames.has(category)),
));
const emptyCategoryNames = craCategories
  .filter((category) => !craResolutions.some((resolution) => resolution.category === category.name))
  .map((category) => category.name);

if (unknownCategoryNames.length || emptyCategoryNames.length) {
  throw new Error(`CRA category registry mismatch. Unknown: ${unknownCategoryNames.join(", ") || "none"}. Empty: ${emptyCategoryNames.join(", ") || "none"}.`);
}

export const craResolutionByGuid = new Map(
  craResolutions.map((resolution) => [resolution.guid, resolution]),
);

export const craResolutionByRoute = new Map(
  craResolutions.map((resolution) => [resolution.route, resolution]),
);

const craResolutionByPath = new Map(
  craResolutions.map((resolution) => [`${resolution.year}/${resolution.slug}`, resolution]),
);

const relationNames: (keyof CraRelations)[] = ["related", "affects", "influencedBy", "versions"];
const reverseRelation: Record<keyof CraRelations, keyof CraRelations> = {
  related: "related",
  affects: "influencedBy",
  influencedBy: "affects",
  versions: "versions",
};

function emptyRelations(): CraRelations {
  return { related: [], affects: [], influencedBy: [], versions: [] };
}

function appendUnique(targets: CraRelationTarget[], target: CraRelationTarget) {
  if (!targets.some((item) => item.targetGuid === target.targetGuid)) targets.push(target);
}

const reverseOfficialRelations = new Map(
  craResolutions.map((resolution) => [resolution.guid, emptyRelations()]),
);

for (const source of craResolutions) {
  for (const relationName of relationNames) {
    for (const target of source.relations[relationName]) {
      const reverseTargets = reverseOfficialRelations.get(target.targetGuid);
      if (!reverseTargets) continue;
      appendUnique(reverseTargets[reverseRelation[relationName]], {
        targetGuid: source.guid,
        title: source.title,
      });
    }
  }
}

export function craOfficialRelationsFor(resolution: CraResolution) {
  const relations = emptyRelations();
  const additions = emptyRelations();
  const reverse = reverseOfficialRelations.get(resolution.guid) ?? emptyRelations();
  for (const relationName of relationNames) {
    resolution.relations[relationName].forEach((target) => appendUnique(relations[relationName], target));
    reverse[relationName].forEach((target) => {
      if (!relations[relationName].some((item) => item.targetGuid === target.targetGuid)) {
        relations[relationName].push(target);
        additions[relationName].push(target);
      }
    });
  }
  return { relations, additions };
}

const supplementalTextReferences = new Map<string, CraTextReferenceTarget[]>();
const supplementalTextBacklinks = new Map<string, CraTextReferenceTarget[]>();

for (const source of craResolutions) {
  const officialTargets = new Set(
    relationNames.flatMap((relationName) => source.relations[relationName].map((target) => target.targetGuid)),
  );
  const supplemental = source.textReferences.filter((target) => !officialTargets.has(target.targetGuid));
  supplementalTextReferences.set(source.guid, supplemental);
  for (const target of supplemental) {
    if (!craResolutionByGuid.has(target.targetGuid)) continue;
    const backlinks = supplementalTextBacklinks.get(target.targetGuid) ?? [];
    if (!backlinks.some((item) => item.targetGuid === source.guid)) {
      backlinks.push({ targetGuid: source.guid, title: source.title, evidence: target.evidence });
      supplementalTextBacklinks.set(target.targetGuid, backlinks);
    }
  }
}

export function craSupplementalTextReferencesFor(resolution: CraResolution) {
  return supplementalTextReferences.get(resolution.guid) ?? [];
}

export function craSupplementalTextBacklinksFor(resolution: CraResolution) {
  return supplementalTextBacklinks.get(resolution.guid) ?? [];
}

function targetVersion(target: CraRelationTarget) {
  const local = craResolutionByGuid.get(target.targetGuid);
  if (local) return Number(local.version) || 0;
  const match = target.title.trim().match(/(?:^|\s)(\d+)$/);
  return match ? Number(match[1]) : 0;
}

export function craNewerVersionFor(resolution: CraResolution) {
  const currentVersion = Number(resolution.version) || 0;
  return craOfficialRelationsFor(resolution).relations.versions
    .filter((target) => targetVersion(target) > currentVersion)
    .sort((first, second) => targetVersion(second) - targetVersion(first))[0];
}

export type CraInfluencePathItem = {
  target: CraRelationTarget;
  depth: number;
  direct: boolean;
};

export function craInfluencePathFor(resolution: CraResolution): CraInfluencePathItem[] {
  const queue = craOfficialRelationsFor(resolution).relations.influencedBy.map((target) => ({ target, depth: 1 }));
  const visited = new Set([resolution.guid]);
  const result: CraInfluencePathItem[] = [];

  while (queue.length) {
    const item = queue.shift();
    if (!item || visited.has(item.target.targetGuid)) continue;
    visited.add(item.target.targetGuid);
    result.push({ ...item, direct: item.depth === 1 });
    const local = craResolutionByGuid.get(item.target.targetGuid);
    if (!local) continue;
    for (const target of craOfficialRelationsFor(local).relations.influencedBy) {
      if (!visited.has(target.targetGuid)) queue.push({ target, depth: item.depth + 1 });
    }
  }

  return result.sort((first, second) => {
    if (first.depth !== second.depth) return first.depth - second.depth;
    const firstDate = craResolutionByGuid.get(first.target.targetGuid)?.approvalDate ?? "";
    const secondDate = craResolutionByGuid.get(second.target.targetGuid)?.approvalDate ?? "";
    return firstDate.localeCompare(secondDate, "fa");
  });
}

export const craKnowledgeDocuments: KnowledgeDocument[] = craResolutions.map((resolution) => ({
  id: resolution.id,
  slug: resolution.guid,
  title: resolution.title,
  documentType: "resolution",
  route: resolution.route,
  legacyRoutes: [`/resolutions/communications-regulatory-commission/${resolution.year}/${resolution.slug}`],
  files: [resolution.contentFile],
  issuerIds: ["communications-regulatory-commission"],
  provisionLinks: [],
  topicIds: [],
  marketIds: [],
  documentLinks: [],
  relation: "متن مصوبه، مشخصات رسمی و روابط ثبت‌شده در سامانه اسناد سازمان تنظیم مقررات",
  curated: false,
  updatedAt: CONTENT_UPDATED_ISO,
  status: "published",
}));

export function craResolutionForPath(params: { year: string; slug: string }) {
  return craResolutionByPath.get(`${params.year}/${params.slug}`);
}

function localizeCraTextNode(text: string) {
  return normalizeCraWordArtifacts(toFaDate(text))
    .replace(/([۰-۹])[,،](?=[۰-۹])/g, "$1٬");
}

function localizeCraDocumentText(html: string) {
  let attachmentNumber = 0;
  const withCleanSourceLabels = html.replace(
    craSourceLabel,
    (_match, sectionStart: string, format: string) => {
      attachmentNumber += 1;
      const formatLabel = format.toLowerCase() === "pdf" ? "فایل PDF" : "فایل Word";
      return `${sectionStart}<div class="cra-source-label"><strong>پیوست ${toFaDigits(attachmentNumber)}</strong><span>${formatLabel}</span></div>`;
    },
  );
  const withPlainTableNumbers = withCleanSourceLabels.replace(
    craEmptyTableNumber,
    (_match, cellAttributes: string, _beforeStart: string, _quote: string, start: string) => (
      `<td${cellAttributes}><span class="cra-row-number">${toFaDigits(start)}</span></td>`
    ),
  );
  const withUnifiedDates = withPlainTableNumbers.replace(
    craInlineFormattedDayFirstDate,
    "$4/$2/$1",
  );

  const localized = withUnifiedDates
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (part.startsWith("<")) return part;
      return part
        .split(/(&#(?:[0-9]+|x[0-9a-f]+);)/gi)
        .map((text) => text.startsWith("&#") ? text : localizeCraTextNode(text))
        .join("");
    })
    .join("");

  return localized
    .replace(craMarkupNumberSeparator, "$1$2٬$3")
    .replace(craMarkupWordJoinArtifact, "$1$2‌$3");
}

export function readCraResolutionHtml(resolution: CraResolution) {
  const html = readFileSync(join(process.cwd(), "content", resolution.contentFile), "utf8");
  return localizeCraDocumentText(html);
}

export function craResolutionDescription(resolution: CraResolution) {
  const number = resolution.resolutionNumber ? `مصوبه شماره ${resolution.resolutionNumber}` : "مصوبه";
  const session = resolution.sessionNumber ? ` جلسه ${resolution.sessionNumber}` : "";
  return `${number}${session} کمیسیون تنظیم مقررات ارتباطات با عنوان ${resolution.title}`;
}

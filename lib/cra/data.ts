import { readFileSync } from "node:fs";
import { join } from "node:path";
import rawResolutions from "@/content/cra/index.json";
import rawOcrOverrides from "@/content/cra/ocr-overrides/manifest.json";
import rawRelationshipCuration from "@/content/cra/relationship-curation.json";
import type {
  CraReadingMeta,
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
const craSourceLabel = /(<section class="cra-source-text" data-format="([^"]+)">)<div class="cra-source-label">متن پیوست <span>([^<]*)<\/span><\/div>/gi;
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
type CraRelationshipCuration = {
  aliases: Record<string, string>;
  ignoredTargets: string[];
  consolidations: { baseGuid: string; amendmentGuid: string }[];
};

const sourceCraRelationshipCuration = rawRelationshipCuration as CraRelationshipCuration;
const sourceCraResolutionByGuid = new Map(
  sourceCraResolutions.map((resolution) => [resolution.guid, resolution]),
);
const ignoredRelationTargetGuids = new Set(sourceCraRelationshipCuration.ignoredTargets);

for (const ignoredGuid of ignoredRelationTargetGuids) {
  if (sourceCraResolutionByGuid.has(ignoredGuid)) {
    throw new Error(`CRA ignored relation target is now a local document and needs review: ${ignoredGuid}.`);
  }
}

for (const [aliasGuid, canonicalGuid] of Object.entries(sourceCraRelationshipCuration.aliases)) {
  if (sourceCraResolutionByGuid.has(aliasGuid)) {
    throw new Error(`CRA relation alias unexpectedly points from a local GUID: ${aliasGuid}.`);
  }
  if (!sourceCraResolutionByGuid.has(canonicalGuid)) {
    throw new Error(`CRA relation alias points to an unknown canonical GUID: ${canonicalGuid}.`);
  }
}

function curateRelationTargets(targets: CraRelationTarget[], sourceGuid: string) {
  const curated: CraRelationTarget[] = [];
  for (const target of targets) {
    if (ignoredRelationTargetGuids.has(target.targetGuid)) continue;
    const targetGuid = sourceCraRelationshipCuration.aliases[target.targetGuid] ?? target.targetGuid;
    const local = sourceCraResolutionByGuid.get(targetGuid);
    if (!local || targetGuid === sourceGuid || curated.some((item) => item.targetGuid === targetGuid)) continue;
    curated.push(normalizeCraRelationTarget({
      targetGuid,
      title: local.title || target.title,
    }));
  }
  return curated;
}

type CraOcrOverride = {
  route: string;
  contentFile: string;
  readingMeta: CraReadingMeta;
  textReferences: CraTextReferenceTarget[];
  hasEditorialConsolidation?: boolean;
};

const sourceCraOcrOverrides = (rawOcrOverrides as {
  items: Record<string, CraOcrOverride>;
}).items;
const sourceCraResolutionGuids = new Set(sourceCraResolutions.map((resolution) => resolution.guid));
const unknownOcrOverrideGuids = Object.keys(sourceCraOcrOverrides)
  .filter((guid) => !sourceCraResolutionGuids.has(guid));

if (unknownOcrOverrideGuids.length) {
  throw new Error(`CRA OCR override points to unknown GUIDs: ${unknownOcrOverrideGuids.join(", ")}.`);
}

export const craResolutions: CraResolution[] = sourceCraResolutions.map((resolution) => {
  const ocrOverride = sourceCraOcrOverrides[resolution.guid];
  if (ocrOverride && ocrOverride.route !== resolution.route) {
    throw new Error(`CRA OCR route mismatch for ${resolution.guid}.`);
  }
  const textReferences = ocrOverride?.textReferences ?? resolution.textReferences;

  return {
    ...resolution,
    contentFile: ocrOverride?.contentFile ?? resolution.contentFile,
    contentAvailable: ocrOverride ? true : resolution.contentAvailable,
    readingMeta: ocrOverride?.readingMeta ?? resolution.readingMeta,
    title: normalizeCraWordArtifacts(resolution.title),
    keywords: resolution.keywords.map(normalizeCraWordArtifacts),
    relations: {
      related: curateRelationTargets(resolution.relations.related, resolution.guid),
      affects: curateRelationTargets(resolution.relations.affects, resolution.guid),
      influencedBy: curateRelationTargets(resolution.relations.influencedBy, resolution.guid),
      versions: curateRelationTargets(resolution.relations.versions, resolution.guid),
    },
    textReferences: curateRelationTargets(textReferences, resolution.guid).map((target) => {
      const source = textReferences.find((item) => (
        (sourceCraRelationshipCuration.aliases[item.targetGuid] ?? item.targetGuid) === target.targetGuid
      ));
      return {
        ...target,
        evidence: normalizeCraWordArtifacts(source?.evidence ?? ""),
      };
    }),
  };
});

export function craOcrOverrideFor(resolution: CraResolution) {
  return sourceCraOcrOverrides[resolution.guid];
}

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

const consolidationAmendmentsByBase = new Map<string, CraRelationTarget[]>();
const consolidationBasesByAmendment = new Map<string, CraRelationTarget[]>();

for (const pair of sourceCraRelationshipCuration.consolidations) {
  const base = craResolutionByGuid.get(pair.baseGuid);
  const amendment = craResolutionByGuid.get(pair.amendmentGuid);
  if (!base || !amendment) {
    throw new Error(`CRA consolidation points to an unknown document: ${pair.baseGuid} -> ${pair.amendmentGuid}.`);
  }
  if (!base.attachments.some((attachment) => /تنقیح/.test(attachment.name))) {
    throw new Error(`CRA consolidation has no supporting consolidated attachment: ${pair.baseGuid}.`);
  }
  const amendments = consolidationAmendmentsByBase.get(base.guid) ?? [];
  appendUnique(amendments, { targetGuid: amendment.guid, title: amendment.title });
  consolidationAmendmentsByBase.set(base.guid, amendments);

  const bases = consolidationBasesByAmendment.get(amendment.guid) ?? [];
  appendUnique(bases, { targetGuid: base.guid, title: base.title });
  consolidationBasesByAmendment.set(amendment.guid, bases);
}

export function craConsolidationFor(resolution: CraResolution) {
  const attachmentNames = resolution.attachments
    .filter((attachment) => /تنقیح/.test(attachment.name))
    .map((attachment) => normalizeCraWordArtifacts(attachment.name));
  return {
    attachmentNames,
    hasConsolidatedAttachment: attachmentNames.length > 0,
    amendments: consolidationAmendmentsByBase.get(resolution.guid) ?? [],
    bases: consolidationBasesByAmendment.get(resolution.guid) ?? [],
  };
}

const craResolutionsBySession = new Map<string, CraResolution[]>();
for (const resolution of craResolutions) {
  if (!resolution.sessionNumber) continue;
  const session = craResolutionsBySession.get(resolution.sessionNumber) ?? [];
  session.push(resolution);
  craResolutionsBySession.set(resolution.sessionNumber, session);
}

for (const session of craResolutionsBySession.values()) {
  session.sort((first, second) => {
    const numberDifference = (Number(first.resolutionNumber) || 0) - (Number(second.resolutionNumber) || 0);
    if (numberDifference) return numberDifference;
    return (Number(first.version) || 0) - (Number(second.version) || 0);
  });
}

export function craSameSessionResolutionsFor(resolution: CraResolution) {
  return (craResolutionsBySession.get(resolution.sessionNumber) ?? [])
    .filter((item) => item.guid !== resolution.guid);
}

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
    (_match, sectionStart: string, format: string, sourceName: string) => {
      attachmentNumber += 1;
      const formatLabel = format.toLowerCase() === "pdf" ? "فایل PDF" : "فایل Word";
      const consolidated = /تنقیح/.test(sourceName);
      const label = consolidated ? "پیوست تنقیحی" : `پیوست ${toFaDigits(attachmentNumber)}`;
      const className = consolidated ? "cra-source-label cra-consolidated-label" : "cra-source-label";
      return `${sectionStart}<div class="${className}"><strong>${label}</strong><span>${formatLabel}</span></div>`;
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

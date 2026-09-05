import { readFileSync } from "node:fs";
import { join } from "node:path";
import rawResolutions from "@/content/cra/index.json";
import rawDisplayCuration from "@/content/cra/display-curation.json";
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
import { formatCraReadingHtml } from "./presentation";

const craWordJoinArtifact = /([\u0621-\u063A\u0641-\u064A\u066E-\u06D3\u06FA-\u06FF])[ \t]*[\u00AD\u200E\u200F\u2060][ \t]*([\u0621-\u063A\u0641-\u064A\u066E-\u06D3\u06FA-\u06FF])/g;
const craEmptyTableNumber = /<td([^>]*)>\s*<ol\b([^>]*)\bstart=(["'])(\d+)\3([^>]*)>\s*<li(?:\s[^>]*)?>\s*(?:<\/li>)?\s*<\/ol>\s*<\/td>/gi;
const craInlineFormattedDayFirstDate = /(\d{1,2})\/(\d{1,2})\/<(em|strong|b|i|u)(?:\s[^>]*)?>(\d{4})<\/\3>/gi;
const craSourceLabel = /(<section class="cra-source-text" data-format="([^"]+)">)<div class="cra-source-label">متن پیوست <span>([^<]*)<\/span><\/div>/gi;
const craMarkupNumberSeparator = /([۰-۹])((?:<[^>]+>)*)[,،]((?:<[^>]+>)*)(?=[۰-۹])/g;
const craMarkupWordJoinArtifact = /([\u0621-\u063A\u0641-\u064A\u066E-\u06D3\u06FA-\u06FF])((?:<[^>]+>)*)[\u00AD\u200E\u200F\u2060]((?:<[^>]+>)*)(?=[\u0621-\u063A\u0641-\u064A\u066E-\u06D3\u06FA-\u06FF])/g;
const craTextBlock = /<(p|h[2-5])([^>]*)>([\s\S]*?)<\/\1>/gi;
const craSourceSection = /<section class="cra-source-text[^"]*"[^>]*>[\s\S]*?<\/section>/gi;
const craSourceName = /<div class="cra-source-label">متن پیوست <span>([^<]*)<\/span><\/div>/i;
const craTable = /<table\b[^>]*>[\s\S]*?<\/table>/gi;
const craParagraph = /<p>([\s\S]*?)<\/p>/gi;
const craArabicLetter = "[\\u0621-\\u063A\\u0641-\\u064A\\u066E-\\u06D3\\u06FA-\\u06FF]";
const craInWordTatweel = new RegExp(`(${craArabicLetter})\\u0640+(?=${craArabicLetter})`, "g");
const craArabicIndicDigits = "٠١٢٣٤٥٦٧٨٩";
const craPersianDigits = "۰۱۲۳۴۵۶۷۸۹";

function normalizeCraWordArtifacts(text: string) {
  return text
    .replace(craWordJoinArtifact, "$1‌$2")
    .replace(/\u00AD/g, "‌")
    .replace(/ابالغ/g, "ابلاغ")
    .replace(/اطالعات/g, "اطلاعات")
    .replace(/اصالح/g, "اصلاح")
    .replace(/اعالم/g, "اعلام")
    .replace(/کالن/g, "کلان")
    .replace(/بالمانع/g, "بلامانع")
    .replace(/باال/g, "بالا")
    .replace(/اصطالحات/g, "اصطلاحات")
    .replace(/اطالع/g, "اطلاع")
    .replace(/انحالل/g, "انحلال")
    .replace(/اسالمی/g, "اسلامی")
    .replace(/تسهیالت/g, "تسهیلات")
    .replace(/دالیل/g, "دلایل")
    .replace(/الزم/g, "لازم");
}

function normalizeCraRelationTarget(target: CraRelationTarget): CraRelationTarget {
  return { ...target, title: normalizeCraWordArtifacts(target.title) };
}

const sourceCraResolutions = rawResolutions as CraResolution[];
type CraRelationshipCuration = {
  aliases: Record<string, string>;
  duplicateRecords: Record<string, string>;
  ignoredTargets: string[];
  consolidations: { baseGuid: string; amendmentGuid: string }[];
};

const sourceCraRelationshipCuration = rawRelationshipCuration as CraRelationshipCuration;
const sourceCraResolutionByGuid = new Map(
  sourceCraResolutions.map((resolution) => [resolution.guid, resolution]),
);
const sourceCraDisplayCuration = rawDisplayCuration as {
  redundantTextSections: Record<string, string[]>;
  htmlReplacements: Record<string, { from: string; to: string }[]>;
};
const ignoredRelationTargetGuids = new Set(sourceCraRelationshipCuration.ignoredTargets);
const duplicateRecordGuids = new Set(Object.keys(sourceCraRelationshipCuration.duplicateRecords));

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

for (const [duplicateGuid, canonicalGuid] of Object.entries(sourceCraRelationshipCuration.duplicateRecords)) {
  const duplicate = sourceCraResolutionByGuid.get(duplicateGuid);
  const canonical = sourceCraResolutionByGuid.get(canonicalGuid);
  if (!duplicate || !canonical) {
    throw new Error(`CRA duplicate record points to an unknown document: ${duplicateGuid} -> ${canonicalGuid}.`);
  }
  if (duplicateGuid === canonicalGuid || duplicate.contentAvailable || !canonical.contentAvailable) {
    throw new Error(`CRA duplicate record is not a valid empty-to-complete redirect: ${duplicateGuid} -> ${canonicalGuid}.`);
  }
}

for (const [guid, sourceNames] of Object.entries(sourceCraDisplayCuration.redundantTextSections)) {
  const resolution = sourceCraResolutionByGuid.get(guid);
  if (!resolution) throw new Error(`CRA display curation points to an unknown document: ${guid}.`);
  const contentPath = join(process.cwd(), "content", resolution.contentFile);
  const sourceHtml = readFileSync(contentPath, "utf8");
  for (const sourceName of sourceNames) {
    if (!sourceHtml.includes(`<span>${sourceName}</span>`)) {
      throw new Error(`CRA redundant text section is missing from ${guid}: ${sourceName}.`);
    }
  }
}

for (const [guid, replacements] of Object.entries(sourceCraDisplayCuration.htmlReplacements)) {
  const resolution = sourceCraResolutionByGuid.get(guid);
  if (!resolution) throw new Error(`CRA display replacement points to an unknown document: ${guid}.`);
  const contentPath = join(process.cwd(), "content", resolution.contentFile);
  const sourceHtml = readFileSync(contentPath, "utf8");
  for (const replacement of replacements) {
    if (!replacement.from || replacement.from === replacement.to || !sourceHtml.includes(replacement.from)) {
      throw new Error(`CRA display replacement is invalid or stale for ${guid}: ${replacement.from}.`);
    }
  }
}

function canonicalCraGuid(guid: string) {
  return sourceCraRelationshipCuration.duplicateRecords[guid]
    ?? sourceCraRelationshipCuration.aliases[guid]
    ?? guid;
}

function curateRelationTargets(targets: CraRelationTarget[], sourceGuid: string) {
  const curated: CraRelationTarget[] = [];
  for (const target of targets) {
    if (ignoredRelationTargetGuids.has(target.targetGuid)) continue;
    const targetGuid = canonicalCraGuid(target.targetGuid);
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

export const craResolutionRouteParams = sourceCraResolutions.map((resolution) => ({
  year: resolution.year,
  slug: resolution.slug,
}));

const duplicateDestinationByPath = new Map(
  sourceCraResolutions
    .filter((resolution) => duplicateRecordGuids.has(resolution.guid))
    .map((resolution) => {
      const canonicalGuid = sourceCraRelationshipCuration.duplicateRecords[resolution.guid];
      const canonical = sourceCraResolutionByGuid.get(canonicalGuid);
      if (!canonical) throw new Error(`CRA duplicate destination is missing: ${canonicalGuid}.`);
      return [`${resolution.year}/${resolution.slug}`, canonical.route];
    }),
);

export const craResolutions: CraResolution[] = sourceCraResolutions
  .filter((resolution) => !duplicateRecordGuids.has(resolution.guid))
  .map((resolution) => {
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
        const source = textReferences.find((item) => canonicalCraGuid(item.targetGuid) === target.targetGuid);
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

export function craDuplicateResolutionDestinationForPath(params: { year: string; slug: string }) {
  return duplicateDestinationByPath.get(`${params.year}/${params.slug}`);
}

function localizeCraTextNode(text: string) {
  const normalizedCompatibilityText = /[\uFB50-\uFDFF\uFE70-\uFEFE]/.test(text)
    ? text.normalize("NFKC")
    : text;
  return normalizeCraWordArtifacts(normalizedCompatibilityText)
    .replace(/[\u200E\u200F\u202A-\u202E\u2060\u2066-\u2069]/g, "")
    .replace(/[٠-٩]/g, (digit) => craPersianDigits[craArabicIndicDigits.indexOf(digit)])
    .replace(/\u200C{2,}/g, "‌")
    .replace(/\u200C(?=[.,،؛:!?؟])/g, "")
    .replace(craInWordTatweel, "$1")
    .replace(/\u200C(?=\s)/g, "")
    .replace(/(?<=\s)\u200C/g, "")
    .replace(/([۰-۹])[,،](?=[۰-۹])/g, "$1٬");
}

function normalizeCraDateText(text: string) {
  return toFaDate(text)
    .replace(/([۰-۹])[,،](?=[۰-۹])/g, "$1٬");
}

function craSectionComparisonText(section: string) {
  return section
    .replace(/<div class="cra-source-label[^"]*">[\s\S]*?<\/div>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function deduplicateCraSourceSections(html: string) {
  const seen = new Set<string>();
  return html.replace(craSourceSection, (section) => {
    const comparisonText = craSectionComparisonText(section);
    if (!comparisonText) return section;
    if (seen.has(comparisonText)) return "";
    seen.add(comparisonText);
    return section;
  });
}

function removeCuratedRedundantCraSections(html: string, guid: string) {
  const redundantSourceNames = new Set(sourceCraDisplayCuration.redundantTextSections[guid] ?? []);
  if (!redundantSourceNames.size) return html;
  return html.replace(craSourceSection, (section) => {
    const sourceName = section.match(craSourceName)?.[1];
    return sourceName && redundantSourceNames.has(sourceName) ? "" : section;
  });
}

function applyCuratedCraHtmlReplacements(html: string, guid: string) {
  return (sourceCraDisplayCuration.htmlReplacements[guid] ?? [])
    .reduce((result, replacement) => result.replaceAll(replacement.from, replacement.to), html);
}

function cleanCraConsolidatedPdfSections(html: string) {
  return html.replace(craSourceSection, (section) => {
    const sourceName = section.match(craSourceName)?.[1];
    if (!sourceName || !/تنقیح/.test(sourceName)) return section;

    const notes: string[] = [];
    const withoutPageFurniture = section.replace(craParagraph, (paragraph) => {
      const plainText = craSectionComparisonText(paragraph);
      if (/مصوبه شماره[\s\S]*کمیسیون تنظیم مقررات ارتباطات صفحه\s*[۰-۹]+\s*از\s*[۰-۹]+/.test(plainText)) {
        return "";
      }
      if (/^[۰-۹]{1,2}\s+[A-Za-z]/.test(plainText) && plainText.length < 600) {
        notes.push(paragraph);
        return "";
      }
      return paragraph;
    });

    // Persian digits also belong to U+0600–U+06FF. Treating that entire
    // range as letters split ۳۳۶ and every date into individual digits.
    if (!notes.length) return withoutPageFurniture;
    const noteDrawer = `<details class="cra-pdf-notes"><summary>پانوشت‌های نسخه تنقیحی</summary><div>${notes.join("")}</div></details>`;
    return withoutPageFurniture.replace(/<\/section>$/i, `${noteDrawer}</section>`);
  });
}

function markFullyLatinCraBlocks(html: string) {
  return html.replace(craTextBlock, (block, tag: string, attributes: string, content: string) => {
    if (/\bdir\s*=/i.test(attributes)) return block;
    const plainText = content
      .replace(/<[^>]+>/g, " ")
      .replace(/&(?:#(?:x[0-9a-f]+|\d+)|[a-z][a-z0-9]+);/gi, " ");
    if (!/[A-Za-z]/.test(plainText) || /[\u0600-\u06FF]/.test(plainText)) return block;
    return `<${tag}${attributes} dir="ltr">${content}</${tag}>`;
  });
}

function wrapCraTables(html: string) {
  return html.replace(craTable, (table) => `<div class="cra-table-scroll">${table}</div>`);
}

function localizeCraDocumentText(html: string, guid: string) {
  const curatedHtml = applyCuratedCraHtmlReplacements(
    removeCuratedRedundantCraSections(html, guid),
    guid,
  );
  const withPlainTableNumbers = curatedHtml.replace(
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
        .map((text) => text.startsWith("&#") ? text : normalizeCraDateText(localizeCraTextNode(text)))
        .join("");
    })
    .join("");

  const normalized = localized
    .replace(craMarkupNumberSeparator, "$1$2٬$3")
    .replace(craMarkupWordJoinArtifact, "$1$2‌$3");

  let attachmentNumber = 0;
  const withoutDuplicateSections = deduplicateCraSourceSections(normalized);
  const withCleanConsolidatedPdf = cleanCraConsolidatedPdfSections(withoutDuplicateSections);
  const withCleanSourceLabels = withCleanConsolidatedPdf.replace(
    craSourceLabel,
    (_match, sectionStart: string, format: string, sourceName: string) => {
      attachmentNumber += 1;
      const formatLabel = format.toLowerCase() === "pdf" ? "فایل PDF" : "فایل Word";
      const consolidated = /تنقیح/.test(sourceName);
      const label = consolidated ? "پیوست تنقیحی" : `پیوست ${toFaDigits(attachmentNumber)}`;
      const className = consolidated ? "cra-source-label cra-consolidated-label" : "cra-source-label";
      const decoratedSectionStart = consolidated
        ? sectionStart.replace('class="cra-source-text"', 'class="cra-source-text cra-consolidated-text"')
        : sectionStart;
      return `${decoratedSectionStart}<div class="${className}"><strong>${label}</strong><span>${formatLabel}</span></div>`;
    },
  );

  return wrapCraTables(formatCraReadingHtml(markFullyLatinCraBlocks(withCleanSourceLabels)));
}

export function readCraResolutionHtml(resolution: CraResolution) {
  const html = readFileSync(join(process.cwd(), "content", resolution.contentFile), "utf8");
  return localizeCraDocumentText(html, resolution.guid);
}

export function craResolutionDescription(resolution: CraResolution) {
  const number = resolution.resolutionNumber ? `مصوبه شماره ${resolution.resolutionNumber}` : "مصوبه";
  const session = resolution.sessionNumber ? ` جلسه ${resolution.sessionNumber}` : "";
  return `${number}${session} کمیسیون تنظیم مقررات ارتباطات با عنوان ${resolution.title}`;
}

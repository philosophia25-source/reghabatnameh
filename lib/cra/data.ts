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

export const craResolutions = rawResolutions as CraResolution[];

export const craResolutionByGuid = new Map(
  craResolutions.map((resolution) => [resolution.guid, resolution]),
);

export const craResolutionByRoute = new Map(
  craResolutions.map((resolution) => [resolution.route, resolution]),
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
  legacyRoutes: [],
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

export function craResolutionForRoute(params: { institution: string; year: string; slug: string }) {
  if (params.institution !== "communications-regulatory-commission") return undefined;
  return craResolutionByRoute.get(`/resolutions/${params.institution}/${params.year}/${params.slug}`);
}

export function readCraResolutionHtml(resolution: CraResolution) {
  return readFileSync(join(process.cwd(), "content", resolution.contentFile), "utf8");
}

export function craResolutionDescription(resolution: CraResolution) {
  const number = resolution.resolutionNumber ? `مصوبه شماره ${resolution.resolutionNumber}` : "مصوبه";
  const session = resolution.sessionNumber ? ` جلسه ${resolution.sessionNumber}` : "";
  return `${number}${session} کمیسیون تنظیم مقررات ارتباطات با عنوان ${resolution.title}`;
}

import { ResolutionExplorer, type ResolutionExplorerItem } from "@/components/resolution-explorer";
import {
  craInfluencePathFor,
  craNewerVersionFor,
  craSupplementalTextReferencesFor,
} from "@/lib/cra/data";
import type { CraResolution } from "@/lib/cra/types";

export function ResolutionArchive({
  resolutions,
  showCategoryFilter = true,
}: {
  resolutions: CraResolution[];
  showCategoryFilter?: boolean;
}) {
  const items: ResolutionExplorerItem[] = resolutions.map((resolution) => ({
    href: resolution.route,
    title: resolution.title,
    code: resolution.code,
    category: resolution.category,
    year: resolution.year,
    sessionNumber: resolution.sessionNumber,
    resolutionNumber: resolution.resolutionNumber,
    approvalDate: resolution.approvalDate,
    version: resolution.version,
    keywords: resolution.keywords,
    influenceCount: craInfluencePathFor(resolution).length,
    hasNewerVersion: Boolean(craNewerVersionFor(resolution)),
    supplementalReferenceCount: craSupplementalTextReferencesFor(resolution).length,
    tableCount: resolution.readingMeta.tableCount,
  }));

  return <ResolutionExplorer items={items} showCategoryFilter={showCategoryFilter} />;
}

import { ResolutionExplorer, type ResolutionExplorerItem } from "@/components/resolution-explorer";
import {
  craConsolidationFor,
  craOfficialRelationsFor,
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
  const items: ResolutionExplorerItem[] = resolutions.map((resolution) => {
    const consolidation = craConsolidationFor(resolution);
    const officialRelations = craOfficialRelationsFor(resolution).relations;
    return {
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
      hasConsolidatedAttachment: consolidation.hasConsolidatedAttachment,
      amendmentCount: consolidation.amendments.length,
      baseCount: consolidation.bases.length,
      officialRelationCount: Object.values(officialRelations).reduce((count, targets) => count + targets.length, 0),
      supplementalReferenceCount: craSupplementalTextReferencesFor(resolution).length,
      tableCount: resolution.readingMeta.tableCount,
    };
  });

  return <ResolutionExplorer items={items} showCategoryFilter={showCategoryFilter} />;
}

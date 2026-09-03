export type CraAttachment = {
  name: string;
  format: string;
  url: string;
};

export type CraRelationTarget = {
  targetGuid: string;
  title: string;
};

export type CraTextReferenceTarget = CraRelationTarget & {
  evidence: string;
};

export type CraReadingMeta = {
  wordCount: number;
  tableCount: number;
  imageCount: number;
  attachmentSectionCount: number;
};

export type CraRelations = {
  related: CraRelationTarget[];
  affects: CraRelationTarget[];
  influencedBy: CraRelationTarget[];
  versions: CraRelationTarget[];
};

export type CraResolution = {
  id: string;
  guid: string;
  slug: string;
  route: string;
  title: string;
  code: string;
  documentType: string;
  category: string;
  sessionNumber: string;
  resolutionNumber: string;
  approvalDate: string;
  year: string;
  version: string;
  keywords: string[];
  sourceUrl: string;
  contentFile: string;
  attachments: CraAttachment[];
  relations: CraRelations;
  textReferences: CraTextReferenceTarget[];
  readingMeta: CraReadingMeta;
  localAttachmentCount: number;
  contentAvailable: boolean;
};

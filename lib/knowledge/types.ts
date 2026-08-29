export type PublicationStatus = "published" | "draft";

export type InstitutionKind =
  | "competition-authority"
  | "appeal-body"
  | "sector-regulator"
  | "regulatory-commission"
  | "professional-self-regulator"
  | "ministry"
  | "judicial-body"
  | "other";

export type Institution = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  kind: InstitutionKind;
  domainId: string;
  description: string;
  route: string;
  status: PublicationStatus;
};

export type InstitutionalDomain = {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  status: PublicationStatus;
};

export type LegalSource = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  kind: "law" | "regulation" | "bylaw" | "directive";
  route: string;
  status: PublicationStatus;
};

export type Provision = {
  id: string;
  legalSourceId: string;
  parentId?: string;
  slug: string;
  label: string;
  title: string;
  description: string;
  route: string;
  status: PublicationStatus;
};

export type CommentaryRecord = {
  id: string;
  provisionId: string;
  title: string;
  route: string;
  contentFile?: string;
  updatedAt?: string;
  status: PublicationStatus;
};

export type Topic = {
  id: string;
  slug: string;
  title: string;
  description: string;
  route: string;
  status: PublicationStatus;
};

export type Market = {
  id: string;
  slug: string;
  title: string;
  description: string;
  route: string;
  status: PublicationStatus;
};

export type ProvisionRelationType =
  | "commentary-reference"
  | "applies"
  | "interprets"
  | "cites"
  | "concerns";

export type ProvisionLink = {
  provisionId: string;
  relation: ProvisionRelationType;
};

export type DocumentRelationType =
  | "appeals"
  | "affirms"
  | "reverses"
  | "amends"
  | "repeals"
  | "related";

export type DocumentLink = {
  targetDocumentId: string;
  relation: DocumentRelationType;
};

export type KnowledgeDocument = {
  id: string;
  slug: string;
  title: string;
  documentType: "decision" | "resolution" | "regulation" | "directive" | "article";
  route: string;
  legacyRoutes: string[];
  files: string[];
  issuerIds: string[];
  provisionLinks: ProvisionLink[];
  topicIds: string[];
  marketIds: string[];
  documentLinks: DocumentLink[];
  relation: string;
  curated: boolean;
  updatedAt?: string;
  status: PublicationStatus;
};

export type KnowledgeCase = {
  id: string;
  slug: string;
  title: string;
  description: string;
  route: string;
  legacyRoutes: string[];
  documentIds: string[];
  status: PublicationStatus;
};

export type KnowledgeArticle = {
  id: string;
  slug: string;
  title: string;
  route: string;
  contentFile: string;
  institutionIds: string[];
  provisionIds: string[];
  documentIds: string[];
  topicIds: string[];
  marketIds: string[];
  status: PublicationStatus;
};

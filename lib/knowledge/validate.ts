import type {
  CommentaryRecord,
  InstitutionalDomain,
  Institution,
  KnowledgeArticle,
  KnowledgeCase,
  KnowledgeDocument,
  LegalSource,
  Market,
  Provision,
  Topic,
} from "./types";

type Registry = {
  institutionalDomains: InstitutionalDomain[];
  institutions: Institution[];
  legalSources: LegalSource[];
  provisions: Provision[];
  commentaries: CommentaryRecord[];
  topics: Topic[];
  markets: Market[];
  documents: KnowledgeDocument[];
  cases: KnowledgeCase[];
  articles: KnowledgeArticle[];
};

function assertUnique(values: string[], label: string) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length) throw new Error(`Duplicate ${label}: ${Array.from(new Set(duplicates)).join(", ")}`);
}

function assertReferences(values: string[], known: Set<string>, label: string) {
  const missing = values.filter((value) => !known.has(value));
  if (missing.length) throw new Error(`Unknown ${label}: ${Array.from(new Set(missing)).join(", ")}`);
}

export function validateKnowledgeRegistry(registry: Registry) {
  const domainIds = new Set(registry.institutionalDomains.map((item) => item.id));
  const institutionIds = new Set(registry.institutions.map((item) => item.id));
  const legalSourceIds = new Set(registry.legalSources.map((item) => item.id));
  const provisionIds = new Set(registry.provisions.map((item) => item.id));
  const topicIds = new Set(registry.topics.map((item) => item.id));
  const marketIds = new Set(registry.markets.map((item) => item.id));
  const documentIds = new Set(registry.documents.map((item) => item.id));
  const documentById = new Map(registry.documents.map((item) => [item.id, item]));

  const collections = [
    [registry.institutionalDomains, "institutional domain id"],
    [registry.institutions, "institution id"],
    [registry.legalSources, "legal source id"],
    [registry.provisions, "provision id"],
    [registry.commentaries, "commentary id"],
    [registry.topics, "topic id"],
    [registry.markets, "market id"],
    [registry.documents, "document id"],
    [registry.cases, "case id"],
    [registry.articles, "article id"],
  ] as const;

  collections.forEach(([items, label]) => assertUnique(items.map((item) => item.id), label));
  assertUnique(registry.documents.map((item) => item.slug), "document slug");
  assertUnique(registry.documents.map((item) => item.route), "document route");
  assertUnique(registry.cases.map((item) => item.route), "case route");
  assertUnique(
    [...registry.documents.flatMap((item) => item.legacyRoutes), ...registry.cases.flatMap((item) => item.legacyRoutes)],
    "legacy route",
  );
  assertUnique(registry.institutions.map((item) => item.route), "institution route");
  assertUnique(registry.topics.map((item) => item.route), "topic route");
  assertUnique(registry.markets.map((item) => item.route), "market route");

  registry.institutionalDomains.forEach((domain) => assertReferences(domain.memberIds, institutionIds, `institution in domain ${domain.id}`));
  registry.institutions.forEach((institution) => assertReferences([institution.domainId], domainIds, `domain for institution ${institution.id}`));
  registry.provisions.forEach((provision) => {
    assertReferences([provision.legalSourceId], legalSourceIds, `legal source for provision ${provision.id}`);
    if (provision.parentId) assertReferences([provision.parentId], provisionIds, `parent for provision ${provision.id}`);
  });
  registry.commentaries.forEach((commentary) => assertReferences([commentary.provisionId], provisionIds, `provision for commentary ${commentary.id}`));
  registry.documents.forEach((document) => {
    if (!document.files.length) throw new Error(`Document has no content file: ${document.id}`);
    assertReferences(document.issuerIds, institutionIds, `issuer for document ${document.id}`);
    assertReferences(document.provisionLinks.map((link) => link.provisionId), provisionIds, `provision for document ${document.id}`);
    assertReferences(document.topicIds, topicIds, `topic for document ${document.id}`);
    assertReferences(document.marketIds, marketIds, `market for document ${document.id}`);
    assertReferences(document.documentLinks.map((link) => link.targetDocumentId), documentIds, `related document for ${document.id}`);
  });
  registry.cases.forEach((caseRecord) => {
    assertReferences(caseRecord.documentIds, documentIds, `document for case ${caseRecord.id}`);
    const unsupported = caseRecord.documentIds.filter(
      (documentId) => documentById.get(documentId)?.documentType !== "decision",
    );
    if (unsupported.length) {
      throw new Error(`Case ${caseRecord.id} contains non-decision documents: ${unsupported.join(", ")}`);
    }
  });
  registry.articles.forEach((article) => {
    assertReferences(article.institutionIds, institutionIds, `institution for article ${article.id}`);
    assertReferences(article.provisionIds, provisionIds, `provision for article ${article.id}`);
    assertReferences(article.documentIds, documentIds, `document for article ${article.id}`);
    assertReferences(article.topicIds, topicIds, `topic for article ${article.id}`);
    assertReferences(article.marketIds, marketIds, `market for article ${article.id}`);
  });
}

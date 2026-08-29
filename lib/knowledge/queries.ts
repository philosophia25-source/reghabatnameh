import {
  articles,
  cases,
  commentaries,
  documents,
  institutionalDomains,
  institutions,
  legalSources,
  markets,
  provisions,
  topics,
} from "./registry";

export const publishedDocuments = documents.filter((item) => item.status === "published");
export const publishedCases = cases.filter((item) => item.status === "published");
export const publishedArticles = articles.filter((item) => item.status === "published");
export const publishedLegalSources = legalSources.filter((item) => item.status === "published");
export const publishedProvisions = provisions.filter((item) => item.status === "published");
export const publishedCommentaries = commentaries.filter((item) => item.status === "published");

export function documentsForInstitution(institutionId: string) {
  return publishedDocuments.filter((document) => document.issuerIds.includes(institutionId));
}

export const publishedInstitutions = institutions.filter(
  (institution) => institution.status === "published" && documentsForInstitution(institution.id).length > 0,
);

export const publishedInstitutionalDomains = institutionalDomains.filter(
  (domain) => domain.status === "published" && domain.memberIds.some((id) => publishedInstitutions.some((item) => item.id === id)),
);

export function documentsForProvision(provisionId: string) {
  return publishedDocuments.filter((document) => document.provisionLinks.some((link) => link.provisionId === provisionId));
}

export function documentsForTopic(topicId: string) {
  return publishedDocuments.filter((document) => document.topicIds.includes(topicId));
}

export function documentsForMarket(marketId: string) {
  return publishedDocuments.filter((document) => document.marketIds.includes(marketId));
}

export const publishedTopics = topics.filter((topic) => topic.status === "published" && documentsForTopic(topic.id).length > 0);
export const publishedMarkets = markets.filter((market) => market.status === "published" && documentsForMarket(market.id).length > 0);

export function institutionById(id: string) {
  return institutions.find((item) => item.id === id);
}

export function institutionBySlug(slug: string) {
  return publishedInstitutions.find((item) => item.slug === slug);
}

export function domainById(id: string) {
  return institutionalDomains.find((item) => item.id === id);
}

export function legalSourceById(id: string) {
  return legalSources.find((item) => item.id === id);
}

export function provisionById(id: string) {
  return provisions.find((item) => item.id === id);
}

export function topicById(id: string) {
  return topics.find((item) => item.id === id);
}

export function topicBySlug(slug: string) {
  return publishedTopics.find((item) => item.slug === slug);
}

export function marketById(id: string) {
  return markets.find((item) => item.id === id);
}

export function marketBySlug(slug: string) {
  return publishedMarkets.find((item) => item.slug === slug);
}

export function caseBySlug(slug: string) {
  return publishedCases.find((item) => item.slug === slug);
}

export function documentsForCase(caseId: string) {
  const caseRecord = publishedCases.find((item) => item.id === caseId);
  if (!caseRecord) return [];
  return caseRecord.documentIds
    .map((id) => publishedDocuments.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function institutionsForDocument(documentId: string) {
  const document = publishedDocuments.find((item) => item.id === documentId);
  if (!document) return [];
  return document.issuerIds.map(institutionById).filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function provisionsForDocument(documentId: string) {
  const document = publishedDocuments.find((item) => item.id === documentId);
  if (!document) return [];
  return document.provisionLinks
    .map((link) => ({ ...link, provision: provisionById(link.provisionId) }))
    .filter((item): item is typeof item & { provision: NonNullable<typeof item.provision> } => Boolean(item.provision));
}

export function topicsForDocument(documentId: string) {
  const document = publishedDocuments.find((item) => item.id === documentId);
  if (!document) return [];
  return document.topicIds.map(topicById).filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function marketsForDocument(documentId: string) {
  const document = publishedDocuments.find((item) => item.id === documentId);
  if (!document) return [];
  return document.marketIds.map(marketById).filter((item): item is NonNullable<typeof item> => Boolean(item));
}

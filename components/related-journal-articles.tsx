import { articlesForDocument, articlesForInstitution, articlesForMarket, articlesForTopic } from "@/lib/knowledge/queries";
import { JournalCollection } from "@/components/journal-collection";

export function RelatedJournalArticles({ kind, id }: { kind: "document" | "institution" | "market" | "topic"; id: string }) {
  const articles = ({document:articlesForDocument,institution:articlesForInstitution,market:articlesForMarket,topic:articlesForTopic})[kind](id);
  if (!articles.length) return null;
  return <section className="shell journal-related"><h2>مقالات مرتبط</h2><JournalCollection articles={articles} /></section>;
}

export type LawTextBlockKind = "paragraph" | "clause" | "note";

export type LawTextBlock = {
  id: string;
  kind: LawTextBlockKind;
  text: string;
};

export type LawArticle = {
  id: string;
  slug: string;
  label: string;
  sourceUrl: string;
  blocks: LawTextBlock[];
};

export type LawChapter = {
  id: string;
  title: string;
  articleSlugs: string[];
};

export type LawGuideGroup = {
  id: string;
  title: string;
  description: string;
  articleSlugs: string[];
};

export type LawManifest = {
  id: string;
  title: string;
  shortTitle: string;
  enactedAt: string;
  editionLabel: string;
  source: { title: string; url: string };
  articleSlugs: string[];
  chapters: LawChapter[];
  competitionGuide: LawGuideGroup[];
};

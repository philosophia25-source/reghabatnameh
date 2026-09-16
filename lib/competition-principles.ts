import { readFileSync } from "node:fs";
import { join } from "node:path";

export const COMPETITION_PRINCIPLES_ROUTE = "/principles/competition-law";
export const COMPETITION_PRINCIPLES_TITLE = "اصول عمومی تفسیر و اجرای حقوق رقابت";
export const COMPETITION_PRINCIPLES_DESCRIPTION =
  "هشت اصل راهنما برای تفسیر منسجم مقررات، احراز مسئولیت و انتخاب مداخله متناسب در حقوق رقابت";

const sectionIds = [
  "introduction",
  "principle-1",
  "principle-2",
  "principle-3",
  "principle-4",
  "principle-5",
  "principle-6",
  "principle-7",
  "principle-8",
] as const;

export type CompetitionPrincipleSection = {
  id: (typeof sectionIds)[number];
  title: string;
  paragraphs: string[];
};

export function readCompetitionPrinciples(): CompetitionPrincipleSection[] {
  const raw = readFileSync(
    join(process.cwd(), "content", "competition-law-principles.md"),
    "utf8",
  ).trim();

  const sections = raw.split(/\n(?=## )/).map((block, index) => {
    const [headingLine, ...bodyLines] = block.split("\n");
    const title = headingLine.replace(/^##\s+/, "").trim();
    const paragraphs = bodyLines
      .join("\n")
      .trim()
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
      .filter(Boolean);

    return { id: sectionIds[index], title, paragraphs };
  });

  if (sections.length !== sectionIds.length || sections.some((section) => !section.id)) {
    throw new Error("ساختار فایل اصول عمومی حقوق رقابت باید شامل مقدمه و هشت اصل باشد.");
  }

  return sections as CompetitionPrincipleSection[];
}

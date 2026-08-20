import { notFound } from "next/navigation";
import { Article44 } from "@/components/article-44";

export function generateStaticParams() {
  return [{ tab: "commentary" }, { tab: "decisions" }];
}

export default async function Article44TabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  if (tab !== "commentary" && tab !== "decisions") notFound();
  return <Article44 active={tab} />;
}

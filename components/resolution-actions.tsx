"use client";

import { useState } from "react";

export function ResolutionActions({ citation, hasRelations }: { citation: string; hasRelations: boolean }) {
  const [copied, setCopied] = useState(false);

  const copyCitation = async () => {
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <nav className="resolution-actions" aria-label="دسترسی سریع به بخش‌های مصوبه">
      <a href="#official-text">متن رسمی</a>
      {hasRelations ? <a href="#document-relations">روابط سند</a> : null}
      <a href="#official-source">فایل‌های رسمی</a>
      <button type="button" onClick={copyCitation}>{copied ? "استناد کپی شد" : "کپی شیوه استناد"}</button>
      <button type="button" onClick={() => window.print()}>چاپ صفحه</button>
    </nav>
  );
}

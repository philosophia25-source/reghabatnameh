"use client";

import { useState } from "react";

export function ResolutionActions({ citation, hasRelations }: { citation: string; hasRelations: boolean }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const copyCitation = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API is unavailable");
      await navigator.clipboard.writeText(citation);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    window.setTimeout(() => setCopyState("idle"), 2200);
  };

  return (
    <nav className="resolution-actions" aria-label="دسترسی سریع به بخش‌های مصوبه">
      <a href="#official-text">متن رسمی</a>
      {hasRelations ? <a href="#document-relations">روابط سند</a> : null}
      <a href="#official-source">فایل‌های رسمی</a>
      <button type="button" onClick={copyCitation} aria-live="polite">
        {copyState === "copied" ? "استناد کپی شد" : copyState === "failed" ? "کپی انجام نشد" : "کپی شیوه استناد"}
      </button>
      <button type="button" onClick={() => window.print()}>چاپ صفحه</button>
    </nav>
  );
}

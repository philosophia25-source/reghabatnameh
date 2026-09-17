"use client";

import { useEffect, useState } from "react";
import { toFaDigits } from "@/app/text";
import { normalizeSearchText } from "@/lib/search-normalize";

function normalizeLawSearchText(value: string) {
  return normalizeSearchText(value).replace(/[أإٱ]/g, "ا");
}

export function LawSearch({ total }: { total: number }) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState(total);

  useEffect(() => {
    const needle = normalizeLawSearchText(query);
    const articles = Array.from(document.querySelectorAll<HTMLElement>("[data-law-article]"));
    let visible = 0;
    articles.forEach((article) => {
      const matchesQuery = !needle || normalizeLawSearchText(article.textContent ?? "").includes(needle);
      article.classList.toggle("law-search-hidden", !matchesQuery);
      if (matchesQuery) visible += 1;
    });
    document.querySelectorAll<HTMLElement>("[data-law-chapter]").forEach((chapter) => {
      chapter.classList.toggle("law-search-hidden", !chapter.querySelector("[data-law-article]:not(.law-search-hidden)"));
    });
    setMatches(visible);
  }, [query]);

  return (
    <div className="law-search-box" role="search">
      <label htmlFor="law-search">جست‌وجو در متن قانون</label>
      <div>
        <input
          id="law-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="برای نمونه انحصار، مجوز یا شورای رقابت"
          autoComplete="off"
        />
        {query ? <button type="button" onClick={() => setQuery("")}>پاک‌کردن</button> : null}
      </div>
      <p aria-live="polite">{query ? `${toFaDigits(matches)} ماده مطابق جست‌وجو` : `جست‌وجو در ${toFaDigits(total)} ماده فعال`}</p>
    </div>
  );
}

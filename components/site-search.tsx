"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { SearchEntry } from "@/lib/search-index";
import { toFaDigits } from "@/app/text";

function normalize(value: string) {
  return value
    .toLocaleLowerCase("fa")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[َُِّْٰ]/g, "")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function SiteSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("همه");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q") ?? "";
    if (initial) setQuery(initial);
  }, []);

  useEffect(() => {
    if (normalize(query).length < 2 || entries.length) return;
    let active = true;
    setLoading(true);
    fetch("/search-index.json")
      .then((response) => response.json())
      .then((data: SearchEntry[]) => { if (active) setEntries(data); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, entries.length]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    const suffix = params.toString();
    window.history.replaceState(null, "", suffix ? `/search?${suffix}` : "/search");
  }, [query]);

  const categories = useMemo(
    () => ["همه", ...Array.from(new Set(entries.map((entry) => entry.category)))],
    [entries],
  );

  const results = useMemo(() => {
    const normalizedQuery = normalize(query);
    const tokens = normalizedQuery.split(" ").filter(Boolean);
    if (tokens.join("").length < 2) return [];
    return entries
      .map((entry) => {
        const title = normalize(entry.title);
        const haystack = normalize(`${entry.title} ${entry.summary} ${entry.searchText}`);
        if (!tokens.every((token) => haystack.includes(token))) return null;
        const score = tokens.reduce((total, token) => total + (title.includes(token) ? 5 : 1), 0);
        return { entry, score };
      })
      .filter((item): item is { entry: SearchEntry; score: number } => Boolean(item))
      .filter(({ entry }) => category === "همه" || entry.category === category)
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, "fa"))
      .slice(0, 60)
      .map(({ entry }) => entry);
  }, [category, entries, query]);

  const ready = normalize(query).length >= 2;

  return (
    <section className="search-tool" aria-label="جست‌وجوی رقابت‌نامه">
      <label className="search-field">
        <span>عبارت موردنظر</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="برای نمونه ماده ۴۴، تقسیم بازار یا رأی ۶۳۱"
          autoComplete="off"
        />
      </label>

      {categories.length > 1 ? (
        <label className="search-category">
          <span>نوع محتوا</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
      ) : null}

      <div className="search-status" aria-live="polite">
        {!ready ? "برای جست‌وجو دست‌کم دو حرف بنویسید." : null}
        {ready && loading ? "در حال آماده‌سازی جست‌وجو…" : null}
        {ready && !loading && entries.length ? `${toFaDigits(results.length)} نتیجه` : null}
      </div>

      {ready && !loading && entries.length && !results.length ? (
        <div className="search-empty"><h2>نتیجه‌ای پیدا نشد</h2><p>عبارت کوتاه‌تر یا یکی از نام‌های ماده، رأی، نهاد یا بازار را امتحان کنید.</p></div>
      ) : null}

      <div className="search-results">
        {results.map((entry) => (
          <Link href={entry.href} className="search-result" key={entry.id}>
            <span>{entry.category}</span>
            <h2>{entry.title}</h2>
            <p>{entry.summary}</p>
            <b>مطالعه ←</b>
          </Link>
        ))}
      </div>
    </section>
  );
}

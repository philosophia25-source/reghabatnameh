"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { SearchEntry } from "@/lib/search-index";
import { toFaDigits } from "@/app/text";
import { CONTENT_UPDATED_ISO } from "@/lib/site";
import { normalizeSearchText } from "@/lib/search-normalize";

export function SiteSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("همه");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q") ?? "";
    if (initial) setQuery(initial);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 180);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (normalizeSearchText(query).length < 2 || entries.length) return;
    let active = true;
    setLoading(true);
    setLoadError(false);
    fetch(`/search-index.json?v=${CONTENT_UPDATED_ISO}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Search index returned ${response.status}`);
        return response.json();
      })
      .then((data: SearchEntry[]) => { if (active) setEntries(data); })
      .catch(() => { if (active) setLoadError(true); })
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
    const normalizedQuery = normalizeSearchText(debouncedQuery);
    const tokens = normalizedQuery.split(" ").filter(Boolean);
    if (tokens.join("").length < 2) return [];
    return entries
      .map((entry) => {
        if (!tokens.every((token) => entry.searchText.includes(token))) return null;
        const score = tokens.reduce((total, token) => total + (entry.titleSearchText.includes(token) ? 5 : 1), 0);
        return { entry, score };
      })
      .filter((item): item is { entry: SearchEntry; score: number } => Boolean(item))
      .filter(({ entry }) => category === "همه" || entry.category === category)
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, "fa"))
      .slice(0, 60)
      .map(({ entry }) => entry);
  }, [category, debouncedQuery, entries]);

  const ready = normalizeSearchText(query).length >= 2;
  const settling = ready && normalizeSearchText(query) !== normalizeSearchText(debouncedQuery);

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
        {ready && (loading || settling) ? "در حال آماده‌سازی جست‌وجو…" : null}
        {ready && loadError ? "جست‌وجو بارگیری نشد. صفحه را تازه کنید و دوباره امتحان کنید." : null}
        {ready && !loading && !settling && !loadError && entries.length ? `${toFaDigits(results.length)} نتیجه` : null}
      </div>

      {ready && !loading && !settling && !loadError && entries.length && !results.length ? (
        <div className="search-empty"><h2>نتیجه‌ای پیدا نشد</h2><p>عبارت کوتاه‌تر یا یکی از نام‌های ماده، رأی، نهاد یا بازار را امتحان کنید.</p></div>
      ) : null}

      <div className="search-results" aria-busy={loading || settling}>
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

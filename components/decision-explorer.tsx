"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toFaDate, toFaDigits } from "@/app/text";

export type DecisionExplorerItem = {
  href: string;
  title: string;
  number: string;
  authority: string;
  date: string;
  type: string;
  provisionLabels: string[];
  topicLabels: string[];
  marketLabels: string[];
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("fa")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function options(items: DecisionExplorerItem[], key: "authority" | "type" | "provisionLabels" | "topicLabels" | "marketLabels") {
  return Array.from(new Set(items.flatMap((item) => {
    const value = item[key];
    return Array.isArray(value) ? value : [value];
  }).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fa"));
}

export function DecisionExplorer({ items }: { items: DecisionExplorerItem[] }) {
  const [query, setQuery] = useState("");
  const [authority, setAuthority] = useState("");
  const [provision, setProvision] = useState("");
  const [topic, setTopic] = useState("");
  const [market, setMarket] = useState("");
  const [type, setType] = useState("");

  const filters = useMemo(() => ({
    authorities: options(items, "authority"),
    provisions: options(items, "provisionLabels"),
    topics: options(items, "topicLabels"),
    markets: options(items, "marketLabels"),
    types: options(items, "type"),
  }), [items]);

  const results = useMemo(() => {
    const needle = normalize(query);
    return items.filter((item) => {
      const haystack = normalize([
        item.title,
        item.number,
        item.authority,
        item.type,
        ...item.provisionLabels,
        ...item.topicLabels,
        ...item.marketLabels,
      ].join(" "));
      return (!needle || haystack.includes(needle))
        && (!authority || item.authority === authority)
        && (!provision || item.provisionLabels.includes(provision))
        && (!topic || item.topicLabels.includes(topic))
        && (!market || item.marketLabels.includes(market))
        && (!type || item.type === type);
    });
  }, [authority, items, market, provision, query, topic, type]);

  const hasFilters = Boolean(query || authority || provision || topic || market || type);
  const reset = () => {
    setQuery("");
    setAuthority("");
    setProvision("");
    setTopic("");
    setMarket("");
    setType("");
  };

  return (
    <div className="decision-explorer">
      <div className="decision-filters" aria-label="فیلتر آرای منتخب">
        <label className="decision-query"><span>جست‌وجو در فهرست</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="شماره رأی یا عبارت کلیدی" /></label>
        <label><span>مرجع</span><select value={authority} onChange={(event) => setAuthority(event.target.value)}><option value="">همه مراجع</option>{filters.authorities.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
        <label><span>ماده یا جزء</span><select value={provision} onChange={(event) => setProvision(event.target.value)}><option value="">همه مواد</option>{filters.provisions.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
        <label><span>موضوع</span><select value={topic} onChange={(event) => setTopic(event.target.value)}><option value="">همه موضوعات</option>{filters.topics.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
        <label><span>بازار</span><select value={market} onChange={(event) => setMarket(event.target.value)}><option value="">همه بازارها</option>{filters.markets.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
        <label><span>نوع تصمیم</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="">همه نتایج</option>{filters.types.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
      </div>
      <div className="decision-filter-status" aria-live="polite">
        <span>{toFaDigits(results.length)} پرونده</span>
        {hasFilters ? <button type="button" onClick={reset}>پاک‌کردن فیلترها</button> : null}
      </div>
      {results.length ? (
        <div className="decision-grid">
          {results.map((decision) => (
            <Link className="decision-card" href={decision.href} key={decision.href}>
              <span>{decision.authority}</span>
              <h2>{toFaDigits(decision.number)}</h2>
              <p>{decision.title}<br />{toFaDigits(decision.type)} · {toFaDate(decision.date)}</p>
            </Link>
          ))}
        </div>
      ) : <div className="search-empty"><h2>پرونده‌ای با این ترکیب پیدا نشد</h2><p>یک یا چند فیلتر را پاک کنید.</p></div>}
    </div>
  );
}

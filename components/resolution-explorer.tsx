"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toFaDate, toFaDigits } from "@/app/text";

export type ResolutionExplorerItem = {
  href: string;
  title: string;
  code: string;
  category: string;
  year: string;
  sessionNumber: string;
  resolutionNumber: string;
  approvalDate: string;
  version: string;
  keywords: string[];
  influenceCount: number;
  hasNewerVersion: boolean;
  supplementalReferenceCount: number;
  tableCount: number;
};

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

export function ResolutionExplorer({ items }: { items: ResolutionExplorerItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [readingStatus, setReadingStatus] = useState("");
  const [visible, setVisible] = useState(40);

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))).sort((a, b) => a.localeCompare(b, "fa")),
    [items],
  );
  const years = useMemo(
    () => Array.from(new Set(items.map((item) => item.year))).sort((a, b) => b.localeCompare(a, "fa")),
    [items],
  );
  const results = useMemo(() => {
    const needle = normalize(query);
    return items.filter((item) => {
      const haystack = normalize([
        item.title,
        item.code,
        item.sessionNumber,
        item.resolutionNumber,
        item.approvalDate,
        item.category,
        ...item.keywords,
      ].join(" "));
      return (!needle || haystack.includes(needle))
        && (!category || item.category === category)
        && (!year || item.year === year)
        && (!readingStatus
          || (readingStatus === "influenced" && item.influenceCount > 0)
          || (readingStatus === "newer-version" && item.hasNewerVersion)
          || (readingStatus === "text-reference" && item.supplementalReferenceCount > 0)
          || (readingStatus === "table" && item.tableCount > 0));
    });
  }, [category, items, query, readingStatus, year]);

  const updateQuery = (value: string) => {
    setQuery(value);
    setVisible(40);
  };
  const reset = () => {
    setQuery("");
    setCategory("");
    setYear("");
    setReadingStatus("");
    setVisible(40);
  };
  const hasFilters = Boolean(query || category || year || readingStatus);

  return (
    <div className="resolution-explorer">
      <div className="resolution-filters" aria-label="فیلتر مصوبات کمیسیون">
        <label className="resolution-query">
          <span>جست‌وجو در مصوبات</span>
          <input
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="عنوان، شماره جلسه، کد یا کلیدواژه"
          />
        </label>
        <label>
          <span>حوزه سند</span>
          <select value={category} onChange={(event) => { setCategory(event.target.value); setVisible(40); }}>
            <option value="">همه حوزه‌ها</option>
            {categories.map((value) => <option value={value} key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>سال تصویب</span>
          <select value={year} onChange={(event) => { setYear(event.target.value); setVisible(40); }}>
            <option value="">همه سال‌ها</option>
            {years.map((value) => <option value={value} key={value}>{value === "undated" ? "بدون تاریخ" : toFaDigits(value)}</option>)}
          </select>
        </label>
        <label>
          <span>وضعیت مراجعه</span>
          <select value={readingStatus} onChange={(event) => { setReadingStatus(event.target.value); setVisible(40); }}>
            <option value="">همه وضعیت‌ها</option>
            <option value="influenced">دارای سند تاثیرگذار</option>
            <option value="newer-version">دارای نسخه جدیدتر</option>
            <option value="text-reference">دارای ارجاع متنی افزوده</option>
            <option value="table">دارای جدول</option>
          </select>
        </label>
      </div>

      <div className="resolution-filter-status" aria-live="polite">
        <span>{toFaDigits(results.length)} مصوبه</span>
        {hasFilters ? <button type="button" onClick={reset}>پاک‌کردن فیلترها</button> : null}
      </div>

      {results.length ? (
        <>
          <div className="resolution-list">
            {results.slice(0, visible).map((resolution) => (
              <Link className="resolution-row" href={resolution.href} key={resolution.href}>
                <div className="resolution-number">
                  <small>جلسه {toFaDigits(resolution.sessionNumber)}</small>
                  <strong>{resolution.resolutionNumber ? `مصوبه ${toFaDigits(resolution.resolutionNumber)}` : "مصوبه"}</strong>
                </div>
                <div className="resolution-row-copy">
                  <div className="resolution-row-badges">
                    <span>{resolution.category}</span>
                    {resolution.hasNewerVersion ? <i>نسخه جدیدتر</i> : null}
                    {resolution.influenceCount ? <i>دارای سند تاثیرگذار</i> : null}
                    {resolution.supplementalReferenceCount ? <i>ارجاع متنی افزوده</i> : null}
                  </div>
                  <h2>{toFaDigits(resolution.title)}</h2>
                  <p>{toFaDigits(resolution.code)} · {resolution.approvalDate ? toFaDate(resolution.approvalDate) : "تاریخ ثبت نشده"}{resolution.version !== "1" ? ` · نسخه ${toFaDigits(resolution.version)}` : ""}</p>
                </div>
                <b aria-hidden="true">←</b>
              </Link>
            ))}
          </div>
          {visible < results.length ? (
            <button className="resolution-more" type="button" onClick={() => setVisible((count) => count + 40)}>
              نمایش مصوبات بیشتر
            </button>
          ) : null}
        </>
      ) : (
        <div className="search-empty"><h2>مصوبه‌ای با این مشخصات پیدا نشد</h2><p>عبارت کوتاه‌تر یا حوزه و سال دیگری را امتحان کنید.</p></div>
      )}
    </div>
  );
}

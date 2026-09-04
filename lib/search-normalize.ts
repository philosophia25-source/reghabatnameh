const SEARCH_DIGITS = "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩";

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("fa")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[۰-۹٠-٩]/g, (digit) => String(SEARCH_DIGITS.indexOf(digit) % 10))
    .replace(/[ـ‌]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function compactSearchText(value: string) {
  return Array.from(new Set(normalizeSearchText(value).split(" ").filter(Boolean))).join(" ");
}

export function toFaDigits(value: string | number) {
  return String(value).replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function toFaDate(value: string) {
  return toFaDigits(value).replace(
    /(^|[^۰-۹])([۰-۹]{1,2})\/([۰-۹]{1,2})\/([۰-۹]{4})(?=$|[^۰-۹])/g,
    (_, prefix: string, day: string, month: string, year: string) => `${prefix}${year}/${month}/${day}`,
  );
}

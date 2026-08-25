export function toFaDigits(value: string | number) {
  return String(value).replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function toFaDate(value: string) {
  return toFaDigits(value);
}

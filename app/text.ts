export function toFaDigits(value: string | number) {
  return String(value).replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function toFaDate(value: string) {
  const match = value.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!match) return toFaDigits(value);
  return toFaDigits(`${match[3]}/${match[2]}/${match[1]}`);
}

export function toFaDigits(value: string | number) {
  return String(value).replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function toFaDate(value: string) {
  return toFaDigits(value).replace(
    /(^|[^۰-۹])([۰-۹]{1,2})\/([۰-۹]{1,2})\/([۰-۹]{4})(?=$|[^۰-۹])/g,
    (_, prefix: string, first: string, second: string, year: string) => {
      const firstNumber = Number(toLatinDigits(first));
      const secondNumber = Number(toLatinDigits(second));
      const isMonthFirst = firstNumber <= 12 && secondNumber > 12;
      const month = isMonthFirst ? first : second;
      const day = isMonthFirst ? second : first;
      return `${prefix}${year}/${month}/${day}`;
    },
  );
}

function toLatinDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

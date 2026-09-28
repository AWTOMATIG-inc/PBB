// Bangladeshi Taka (BDT) Currency & Amount-in-Words Engine
// Converts numbers into standard South Asian commercial denominations:
// Crore (1,00,00,000), Lakh (1,00,000), Thousand (1,000), Hundred (100).
// Example: 4750000 -> "Bangladeshi Taka Forty-Seven Lakh Fifty Thousand Only"

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigits(num: number): string {
  if (num < 20) return ONES[num];
  const ten = Math.floor(num / 10);
  const one = num % 10;
  return one > 0 ? `${TENS[ten]}-${ONES[one]}` : TENS[ten];
}

function threeDigits(num: number): string {
  const hundred = Math.floor(num / 100);
  const rest = num % 100;
  if (hundred > 0 && rest > 0) {
    return `${ONES[hundred]} Hundred ${twoDigits(rest)}`;
  }
  if (hundred > 0) {
    return `${ONES[hundred]} Hundred`;
  }
  return twoDigits(rest);
}

/**
 * Converts a numeric amount into words using the Bangladeshi (South Asian) system:
 * Crore, Lakh, Thousand, Hundred.
 *
 * @param amount - Number to convert (e.g. 4750000)
 * @returns Formal words string, e.g. "Bangladeshi Taka Forty-Seven Lakh Fifty Thousand Only"
 */
export function numberToBdtWords(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "";
  }

  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  if (rounded === 0) {
    return "Bangladeshi Taka Zero Only";
  }

  const isNegative = rounded < 0;
  const absAmount = Math.abs(rounded);
  const integerPart = Math.floor(absAmount);
  const decimalPart = Math.round((absAmount - integerPart) * 100);

  let remaining = integerPart;
  const parts: string[] = [];

  // Crores (10,000,000)
  if (remaining >= 10000000) {
    const crore = Math.floor(remaining / 10000000);
    remaining %= 10000000;
    // Recursive call if crore exceeds 100 (e.g., 500 Crore)
    if (crore >= 100) {
      parts.push(`${convertUnderCrore(crore)} Crore`);
    } else {
      parts.push(`${twoDigits(crore)} Crore`);
    }
  }

  function convertUnderCrore(num: number): string {
    const subParts: string[] = [];
    let rem = num;
    if (rem >= 100000) {
      const lakh = Math.floor(rem / 100000);
      rem %= 100000;
      subParts.push(`${twoDigits(lakh)} Lakh`);
    }
    if (rem >= 1000) {
      const thousand = Math.floor(rem / 1000);
      rem %= 1000;
      subParts.push(`${twoDigits(thousand)} Thousand`);
    }
    if (rem > 0) {
      subParts.push(threeDigits(rem));
    }
    return subParts.join(" ");
  }

  // Lakhs (1,00,000)
  if (remaining >= 100000) {
    const lakh = Math.floor(remaining / 100000);
    remaining %= 100000;
    parts.push(`${twoDigits(lakh)} Lakh`);
  }

  // Thousands (1,000)
  if (remaining >= 1000) {
    const thousand = Math.floor(remaining / 1000);
    remaining %= 1000;
    parts.push(`${twoDigits(thousand)} Thousand`);
  }

  // Hundreds & Below
  if (remaining > 0) {
    parts.push(threeDigits(remaining));
  }

  let words = parts.filter(Boolean).join(" ");
  if (isNegative) {
    words = `Minus ${words}`;
  }

  let result = `Bangladeshi Taka ${words}`;

  if (decimalPart > 0) {
    result += ` and ${twoDigits(decimalPart)} Paisa`;
  }

  result += " Only";
  return result;
}

/**
 * Formats a numeric amount with Bangladeshi / South Asian comma separation:
 * e.g., 4750000 -> "47,50,000/-"
 * e.g., 150000  -> "1,50,000/-"
 * e.g., 4600000 -> "46,00,000/-"
 */
export function formatBdtCurrency(amount: number | null | undefined, suffix: boolean = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return suffix ? "0/-" : "0";
  }

  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const numStr = Math.abs(rounded).toString();

  // If number is 3 digits or fewer, no South Asian grouping needed
  if (numStr.length <= 3) {
    const res = (isNegative ? "-" : "") + numStr;
    return suffix ? `${res}/-` : res;
  }

  // Last 3 digits
  const lastThree = numStr.slice(-3);
  // Remaining digits grouped in pairs of 2 from right to left
  const otherDigits = numStr.slice(0, -3);
  const formattedOthers = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  const formatted = `${formattedOthers},${lastThree}`;
  const res = (isNegative ? "-" : "") + formatted;
  return suffix ? `${res}/-` : res;
}

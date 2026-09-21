// Shared server-side field validation for admin forms that submit FormData
// straight to PocketBase (see lib/products.ts). PocketBase's own schema
// validation still runs after this (surfaced via describePbError) — this
// catches bad input earlier, with messages tailored to each field, since
// PocketBase's generic "number"/"text" field types don't enforce shape
// (e.g. a "number" field just rejects non-numeric strings with a generic
// error; it can't express "non-negative" or "one of these formats").

export type FieldValidation = { value?: string; error?: string };

const NUMBER_RE = /^-?\d+(\.\d+)?$/;
const INTEGER_RE = /^-?\d+$/;

export function parseOptionalNumber(
  raw: string,
  label: string,
  { allowNegative = false }: { allowNegative?: boolean } = {}
): FieldValidation {
  if (!raw) return {};
  if (!NUMBER_RE.test(raw) || (!allowNegative && Number(raw) < 0)) {
    return { error: `${label} must be a ${allowNegative ? "" : "non-negative "}number.` };
  }
  return { value: raw };
}

export function parseOptionalInteger(raw: string, label: string): FieldValidation {
  if (!raw) return {};
  if (!INTEGER_RE.test(raw)) {
    return { error: `${label} must be a whole number.` };
  }
  return { value: raw };
}

// Fuel tank capacity as shown in the catalog: either a single value ("160")
// or a range ("70-160"), both optionally with decimals — the catalog data
// genuinely contains ranges, so this can't be a plain number field, but it
// should never accept arbitrary free text either.
const FUEL_TANK_RE = /^\d+(\.\d+)?(-\d+(\.\d+)?)?$/;

export function parseFuelTank(raw: string): FieldValidation {
  if (!raw) return { value: "" };
  if (!FUEL_TANK_RE.test(raw)) {
    return { error: "Fuel tank must be a number or a range like 70-160." };
  }
  return { value: raw };
}

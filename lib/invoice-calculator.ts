// Invoice Calculation Engine
// Pure, deterministic money math shared by the dashboard form (live preview),
// the server actions (source of truth on save) and the PDF renderer.

import { numberToBdtWords } from "./format-bdt-words";
import { calculateLineTotal } from "./quotation-calculator";
import type { AdjustmentType, InvoiceLineItem } from "./invoices";

export { calculateLineTotal };

function safeNumber(value: number): number {
  return Math.max(0, Number.isFinite(value) ? value : 0);
}

/** A flat BDT amount, or a percentage (capped at 100) of `base`, in whole taka. */
function resolveAdjustment(base: number, type: AdjustmentType | "", value: number): number {
  const v = safeNumber(value);
  return type === "percent" ? Math.round((base * Math.min(v, 100)) / 100) : Math.round(v);
}

/**
 * Subtotal = sum of line totals (each qty x unit price, whole taka).
 * Discount comes off the subtotal and is never more than it.
 * VAT is charged on the amount after discount.
 * Total = Subtotal - Discount + VAT.
 */
export function calculateInvoiceTotals({
  items,
  discountType = "amount",
  discount = 0,
  vatType = "amount",
  vat = 0,
}: {
  items: Pick<InvoiceLineItem, "qty" | "unitPrice">[];
  discountType?: AdjustmentType | "";
  discount?: number;
  vatType?: AdjustmentType | "";
  vat?: number;
}): {
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
  amountInWords: string;
} {
  const subtotal = items.reduce(
    (sum, item) => sum + calculateLineTotal(item.qty, item.unitPrice),
    0
  );

  const discountAmount = Math.min(resolveAdjustment(subtotal, discountType, discount), subtotal);
  const afterDiscount = subtotal - discountAmount;
  const vatAmount = resolveAdjustment(afterDiscount, vatType, vat);
  const total = afterDiscount + vatAmount;

  return {
    subtotal,
    discountAmount,
    vatAmount,
    total,
    amountInWords: numberToBdtWords(total),
  };
}

// Quotation Calculation Engine & Standard Commercial Presets
// Pure, deterministic business logic used by both the Admin UI and Server Actions.

import { numberToBdtWords, formatBdtCurrency } from "./format-bdt-words";
import type {
  QuotationLineItem,
  ScopeOfSupplyItem,
  CommercialTerms,
} from "./quotations";

export { numberToBdtWords, formatBdtCurrency };

/**
 * Calculates a single line item's total.
 */
export function calculateLineTotal(qty: number, unitPrice: number): number {
  const safeQty = Math.max(0, isNaN(qty) ? 0 : qty);
  const safePrice = Math.max(0, isNaN(unitPrice) ? 0 : unitPrice);
  return Math.round(safeQty * safePrice);
}

/**
 * Recalculates full quotation totals server-side:
 * Subtotal = Sum of line totals
 * Grand Total = Subtotal + VAT/AIT + Delivery - Discount
 * Auto-generates formal BDT amount in words.
 */
export function calculateQuotationTotals({
  items,
  vatAit = 0,
  discount = 0,
  deliveryCharge = 0,
}: {
  items: QuotationLineItem[];
  vatAit?: number;
  discount?: number;
  deliveryCharge?: number;
}): {
  subtotal: number;
  grandTotal: number;
  amountInWords: string;
} {
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const safeVat = Math.max(0, isNaN(vatAit) ? 0 : vatAit);
  const safeDiscount = Math.max(0, isNaN(discount) ? 0 : discount);
  const safeDelivery = Math.max(0, isNaN(deliveryCharge) ? 0 : deliveryCharge);

  const grandTotal = Math.max(0, subtotal + safeVat + safeDelivery - safeDiscount);
  const amountInWords = numberToBdtWords(grandTotal);

  return {
    subtotal,
    grandTotal,
    amountInWords,
  };
}

/**
 * Standard Scope of Supply checklist items (Unified Page 2).
 */
export const DEFAULT_SCOPE_OF_SUPPLY: ScopeOfSupplyItem[] = [
  { item: "Foreign Canopied Soundproof Diesel Generator Set", included: true },
  { item: "Digital Automatic Control Panel with complete safety protections", included: true },
  { item: "Electric Starting System with Heavy Duty Battery & Battery Cable", included: true },
  { item: "Automatic Static Battery Charger", included: true },
  { item: "Standard Air, Fuel, and Lubricating Oil Filters", included: true },
  { item: "Industrial Exhaust Silencer & Flexible Stainless Steel Bellows", included: true },
  { item: "Built-in / Base Daily Fuel Tank", included: true },
  { item: "Standard Tool Kit, Circuit Breaker (MCCB), Operation & Maintenance Manual", included: true },
];

/**
 * Standard Commercial Terms matching PBB historical quotation standards verbatim.
 */
export const DEFAULT_COMMERCIAL_TERMS: CommercialTerms = {
  paymentTerms:
    "50% Payment will made in advance and rest of the Amount will be pay after the shipment.",
  offerValidity: "The offered price is valid for 30 days only from the issuing date.",
  deliveryTerms: "Ready stock / Delivery within 60 days from the date of confirmed work order.",
  shipping: "Delivery in Dhaka / at actual cost as agreed.",
  installation:
    "The quoted price herein is including the supervision of Installation & commissioning.",
  warranty:
    "12 Months or 1000 running hours from the date of supply of generator, whichever occurs first. Warranty covers replacement of defective parts due to manufacturing defects.",
  afterSales: "We assure prompt 24/7 after sales service at any time required.",
  training:
    "Training for improving the skill of operators will be provided free of charge at the time of commissioning (one day only).",
};

/**
 * Standard legal exclusions covering civil works, external cabling, etc.
 */
export const DEFAULT_STANDARD_EXCLUSIONS =
  "The scope of work excludes civil engineering works, foundation, cement, sand, manual labor, all external power cables with materials for cable laying, earthing system, ducting (if required), extension silencer pipe fitting and fixing, fuel (diesel), distilled water, coolant & lubricating oil which is mandatory for installation and commissioning.";

/**
 * Standard warranty exclusions.
 */
export const DEFAULT_WARRANTY_EXCLUSIONS =
  "Warranty excludes improper operation or maintenance, consumable items (filters, belts, fuses), normal wear and tear, unauthorized alteration or repair by third parties, and damage outside manufacturer warranty conditions.";

/**
 * Authorized Signatory block defaults.
 */
export const DEFAULT_SIGNATORY = {
  name: "Md Tawfikur Rahman",
  title: "Manager (CEO)",
  phone: "+88 (0) 1989 474 447",
  company: "Power Bank Bangladesh",
};

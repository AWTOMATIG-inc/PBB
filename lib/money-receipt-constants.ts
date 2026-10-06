// Client-safe constants for money receipts (no server code), shared by the
// dashboard form, the server actions and the data layer.

export type PaymentMode = "cash" | "cheque";

export const PAYMENT_MODES: PaymentMode[] = ["cash", "cheque"];

/** Whole taka, up to 99,99,99,999 (just under 100 crore). */
export const MAX_RECEIPT_AMOUNT = 9_999_999_999;

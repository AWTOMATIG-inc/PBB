// Admin data layer for the `money_receipts` PocketBase collection.
// Talks to PocketBase's REST API directly with the superuser token from
// the admin session cookie, adhering to the project's zero-SDK convention.

import { nextSequentialNumber } from "./doc-number";
import { MAX_RECEIPT_AMOUNT, PAYMENT_MODES, type PaymentMode } from "./money-receipt-constants";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

export { MAX_RECEIPT_AMOUNT, PAYMENT_MODES, type PaymentMode };

export type MoneyReceiptRecord = {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  receivedFrom: string;
  amount: number;
  amountInWords?: string;
  onAccountOf?: string;
  onAccountOf2?: string;
  paymentMode: PaymentMode;
  chequeNo?: string;
  chequeBank?: string;
  chequeDate?: string;
  note?: string;
  created: string;
  updated: string;
};

function pbAuthedFetch(token: string, path: string, init: RequestInit = {}) {
  return fetch(`${POCKETBASE_URL}${path}`, {
    ...init,
    headers: { Authorization: token, ...init.headers },
    cache: "no-store",
  });
}

export async function listMoneyReceipts(
  token: string,
  {
    page = 1,
    perPage = 20,
    search = "",
    mode = "",
  }: { page?: number; perPage?: number; search?: string; mode?: string } = {}
): Promise<{ items: MoneyReceiptRecord[]; totalPages: number; totalItems: number; page: number }> {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    sort: "-created",
  });

  const filterParts: string[] = [];
  const q = search.trim();
  if (q) {
    const safe = q.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    filterParts.push(
      `(receiptNumber ~ "${safe}" || receivedFrom ~ "${safe}" || onAccountOf ~ "${safe}")`
    );
  }
  if (mode && (PAYMENT_MODES as string[]).includes(mode)) {
    filterParts.push(`paymentMode = "${mode}"`);
  }
  if (filterParts.length > 0) {
    params.set("filter", filterParts.join(" && "));
  }

  const res = await pbAuthedFetch(token, `/api/collections/money_receipts/records?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load money receipts");
  const data = await res.json();
  return { items: data.items, totalPages: data.totalPages, totalItems: data.totalItems, page: data.page };
}

export async function getMoneyReceipt(
  token: string,
  id: string
): Promise<MoneyReceiptRecord | null> {
  const res = await pbAuthedFetch(token, `/api/collections/money_receipts/records/${id}`);
  if (!res.ok) return null;
  return res.json();
}

/** Next sequential number for the given year, e.g. "PBB-MR-2026-0007". */
export function nextReceiptNumber(token: string, year: number): Promise<string> {
  return nextSequentialNumber(token, {
    collection: "money_receipts",
    field: "receiptNumber",
    prefix: `PBB-MR-${year}-`,
  });
}

export function createMoneyReceipt(token: string, data: Record<string, unknown>) {
  return pbAuthedFetch(token, "/api/collections/money_receipts/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function updateMoneyReceipt(token: string, id: string, data: Record<string, unknown>) {
  return pbAuthedFetch(token, `/api/collections/money_receipts/records/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteMoneyReceipt(token: string, id: string) {
  return pbAuthedFetch(token, `/api/collections/money_receipts/records/${id}`, { method: "DELETE" });
}

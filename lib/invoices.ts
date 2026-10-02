// Admin data layer for the `invoices` PocketBase collection.
// Talks to PocketBase's REST API directly with the superuser token from
// the admin session cookie, adhering to the project's zero-SDK convention.

import { listProducts } from "./products";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

export type InvoiceStatus = "draft" | "issued" | "paid" | "cancelled";

export const INVOICE_STATUSES: InvoiceStatus[] = ["draft", "issued", "paid", "cancelled"];

/** How a discount or VAT value is entered: flat BDT amount or a percentage. */
export type AdjustmentType = "amount" | "percent";

export type InvoiceLineItem = {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
};

export type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;

  // Bill To
  customerName: string;
  companyName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;

  // Items & Pricing
  items: InvoiceLineItem[];
  subtotal: number;
  discountType?: AdjustmentType | "";
  discount?: number;
  // VAT as entered; `taxType` says Tk or %. Applied after discount.
  taxType?: AdjustmentType | "";
  tax?: number;
  total: number;
  amountInWords?: string;

  issuedDate: string;
  notes?: string;

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

export async function listInvoices(
  token: string,
  {
    page = 1,
    perPage = 20,
    search = "",
    status = "",
  }: { page?: number; perPage?: number; search?: string; status?: string } = {}
): Promise<{ items: InvoiceRecord[]; totalPages: number; totalItems: number; page: number }> {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    sort: "-created",
  });

  const filterParts: string[] = [];
  const q = search.trim();
  if (q) {
    const safe = q.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    filterParts.push(`(invoiceNumber ~ "${safe}" || customerName ~ "${safe}" || companyName ~ "${safe}")`);
  }
  if (status && (INVOICE_STATUSES as string[]).includes(status)) {
    filterParts.push(`status = "${status}"`);
  }
  if (filterParts.length > 0) {
    params.set("filter", filterParts.join(" && "));
  }

  const res = await pbAuthedFetch(token, `/api/collections/invoices/records?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load invoices");
  const data = await res.json();
  return { items: data.items, totalPages: data.totalPages, totalItems: data.totalItems, page: data.page };
}

export async function getInvoice(token: string, id: string): Promise<InvoiceRecord | null> {
  const res = await pbAuthedFetch(token, `/api/collections/invoices/records/${id}`);
  if (!res.ok) return null;
  return res.json();
}

/**
 * Next sequential number for the given year, e.g. "INV-2026-0007".
 * The unique index on invoiceNumber is the real guard against duplicates;
 * callers retry when two saves race for the same number.
 */
export async function nextInvoiceNumber(token: string, year: number): Promise<string> {
  const prefix = `INV-${year}-`;
  const params = new URLSearchParams({
    page: "1",
    perPage: "1",
    sort: "-invoiceNumber",
    filter: `invoiceNumber ~ "${prefix}%"`,
    fields: "invoiceNumber",
    skipTotal: "1",
  });
  const res = await pbAuthedFetch(token, `/api/collections/invoices/records?${params.toString()}`);
  let last = 0;
  if (res.ok) {
    const data = await res.json();
    const match = String(data.items?.[0]?.invoiceNumber ?? "").match(/-(\d+)$/);
    if (match) last = Number(match[1]);
  }
  return `${prefix}${String(last + 1).padStart(4, "0")}`;
}

export function createInvoice(token: string, data: Record<string, unknown>) {
  return pbAuthedFetch(token, "/api/collections/invoices/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function updateInvoice(token: string, id: string, data: Record<string, unknown>) {
  return pbAuthedFetch(token, `/api/collections/invoices/records/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/**
 * Generator models for the invoice form's "Add from catalog" picker.
 * Only BDT prices are pre-filled; USD-priced models come through unpriced.
 */
export async function listInvoiceCatalog(
  token: string
): Promise<{ id: string; label: string; price: number }[]> {
  try {
    const { items } = await listProducts(token, { perPage: 500, sort: "brand" });
    return items.map((p) => {
      const brand = p.expand?.brand?.name ?? "";
      const kva = p.standbyKva || p.primeKva;
      const label = [kva ? `${kva} kVA` : "", brand, p.model, "Diesel Generator"]
        .filter(Boolean)
        .join(" ");
      const isBdt = p.currency === "" || p.currency === "BDT";
      return { id: p.id, label, price: isBdt && p.price > 0 ? p.price : 0 };
    });
  } catch {
    return [];
  }
}

export function deleteInvoice(token: string, id: string) {
  return pbAuthedFetch(token, `/api/collections/invoices/records/${id}`, { method: "DELETE" });
}

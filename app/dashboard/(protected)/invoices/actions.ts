"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSessionToken } from "@/lib/session";
import {
  INVOICE_STATUSES,
  createInvoice,
  deleteInvoice,
  nextInvoiceNumber,
  updateInvoice,
  type AdjustmentType,
  type InvoiceLineItem,
  type InvoiceStatus,
} from "@/lib/invoices";
import { calculateInvoiceTotals, calculateLineTotal } from "@/lib/invoice-calculator";
import { describePbError } from "@/lib/pb-error";

export type InvoiceFormState = { error?: string } | undefined;

const MAX_ITEMS = 200;

function parseItems(raw: string): InvoiceLineItem[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  return parsed
    .map((it) => {
      const name = String(it?.name ?? "").trim().slice(0, 300);
      const qty = Number(it?.qty);
      const unitPrice = Number(it?.unitPrice);
      const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 0;
      const safePrice = Number.isFinite(unitPrice) && unitPrice > 0 ? unitPrice : 0;
      return {
        name,
        qty: safeQty,
        unitPrice: safePrice,
        total: calculateLineTotal(safeQty, safePrice),
      };
    })
    // Fully blank rows are dropped silently; half-filled rows are rejected below.
    .filter((it) => it.name || it.qty || it.unitPrice);
}

function readAdjustment(formData: FormData, typeKey: string, valueKey: string) {
  const type: AdjustmentType = formData.get(typeKey) === "percent" ? "percent" : "amount";
  const raw = Number(formData.get(valueKey));
  return { type, value: Number.isFinite(raw) && raw > 0 ? raw : 0 };
}

function buildInvoicePayload(formData: FormData): {
  payload: Record<string, unknown>;
  error?: string;
} {
  const customerName = String(formData.get("customerName") ?? "").trim();

  if (!customerName) {
    return { payload: {}, error: "Customer name is required." };
  }

  const items = parseItems(String(formData.get("items") ?? "[]"));
  if (!items) {
    return { payload: {}, error: "Invoice items could not be read. Please try again." };
  }
  if (items.length === 0) {
    return { payload: {}, error: "Add at least one item." };
  }
  if (items.length > MAX_ITEMS) {
    return { payload: {}, error: `An invoice can have at most ${MAX_ITEMS} items.` };
  }
  const incomplete = items.findIndex((it) => !it.name || it.qty <= 0);
  if (incomplete !== -1) {
    return {
      payload: {},
      error: `Item ${incomplete + 1} needs a name and a quantity above zero.`,
    };
  }

  const { type: discountType, value: discount } = readAdjustment(formData, "discountType", "discount");
  if (discountType === "percent" && discount > 100) {
    return { payload: {}, error: "Discount percentage cannot be more than 100." };
  }

  const { type: vatType, value: vat } = readAdjustment(formData, "vatType", "vat");
  if (vatType === "percent" && vat > 100) {
    return { payload: {}, error: "VAT percentage cannot be more than 100." };
  }

  const { subtotal, discountAmount, vatAmount, total, amountInWords } = calculateInvoiceTotals({
    items,
    discountType,
    discount,
    vatType,
    vat,
  });
  if (discountType === "amount" && discount > subtotal) {
    return { payload: {}, error: "Discount cannot be more than the subtotal." };
  }

  return {
    payload: {
      customerName,
      companyName: String(formData.get("companyName") ?? "").trim(),
      customerPhone: String(formData.get("customerPhone") ?? "").trim(),
      customerEmail: String(formData.get("customerEmail") ?? "").trim(),
      customerAddress: String(formData.get("customerAddress") ?? "").trim(),
      items,
      subtotal,
      discountType,
      discount: discountAmount > 0 ? discount : 0,
      taxType: vatType,
      tax: vatAmount > 0 ? vat : 0,
      total,
      amountInWords,
      notes: String(formData.get("notes") ?? "").trim(),
    },
  };
}

// Today's date in Bangladesh (UTC+6, no DST), so an invoice created after
// midnight Dhaka time isn't dated the previous day on a UTC server.
function todayInDhaka() {
  return new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().split("T")[0];
}

function isDuplicateNumberError(body: unknown) {
  const data = (body as { data?: Record<string, { code?: string }> })?.data;
  return data?.invoiceNumber?.code === "validation_not_unique";
}

export async function createInvoiceAction(
  _state: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const { payload, error } = buildInvoicePayload(formData);
  if (error) return { error };

  // New invoices are always dated today and start as drafts; status is
  // changed afterwards from the invoices table.
  const issuedDate = todayInDhaka();
  const year = Number(issuedDate.slice(0, 4));

  // Two invoices saved at the same moment can be handed the same number;
  // the unique index rejects the second, so fetch a fresh number and retry.
  for (let attempt = 0; attempt < 3; attempt++) {
    const invoiceNumber = await nextInvoiceNumber(token, year);
    const res = await createInvoice(token, {
      ...payload,
      invoiceNumber,
      issuedDate,
      status: "draft",
    });
    if (res.ok) {
      revalidatePath("/dashboard/invoices");
      revalidatePath("/dashboard");
      redirect("/dashboard/invoices");
    }
    const body = await res.json().catch(() => ({}));
    if (!isDuplicateNumberError(body)) {
      return { error: describePbError(res.status, body) };
    }
  }

  return { error: "Could not assign an invoice number. Please try again." };
}

export async function updateInvoiceAction(
  id: string,
  _state: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const { payload, error } = buildInvoicePayload(formData);
  if (error) return { error };

  const res = await updateInvoice(token, id, payload);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: describePbError(res.status, body) };
  }

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
  redirect("/dashboard/invoices");
}

export async function deleteInvoiceAction(id: string): Promise<{ error?: string }> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const res = await deleteInvoice(token, id);
  if (!res.ok) {
    return { error: "Failed to delete invoice." };
  }

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
  return {};
}

export async function updateInvoiceStatusAction(
  id: string,
  status: InvoiceStatus
): Promise<{ error?: string }> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  if (!INVOICE_STATUSES.includes(status)) {
    return { error: "Unknown invoice status." };
  }

  const res = await updateInvoice(token, id, { status });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: describePbError(res.status, body) };
  }

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${id}/edit`);
  revalidatePath("/dashboard");
  return {};
}

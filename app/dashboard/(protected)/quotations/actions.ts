"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSessionToken } from "@/lib/session";
import {
  createQuotation,
  deleteQuotation,
  getQuotation,
  updateQuotation,
  type QuotationLineItem,
  type ScopeOfSupplyItem,
  type CommercialTerms,
  type TechnicalSpecsSnapshot,
} from "@/lib/quotations";
import { calculateQuotationTotals } from "@/lib/quotation-calculator";
import { describePbError } from "@/lib/pb-error";

export type QuotationFormState = { error?: string } | undefined;

function parseJsonSafe<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function buildQuotationPayload(formData: FormData): {
  payload: Record<string, unknown>;
  error?: string;
} {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const contactPerson = String(formData.get("contactPerson") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const quotationNumber = String(formData.get("quotationNumber") ?? "").trim();
  const status = String(formData.get("status") ?? "draft");

  if (!companyName || !contactPerson || !phone || !address) {
    return { payload: {}, error: "Company name, contact person, phone, and address are required." };
  }

  if (!subject) {
    return { payload: {}, error: "Quotation subject is required." };
  }

  const rawItems = String(formData.get("items") ?? "[]");
  const items: QuotationLineItem[] = parseJsonSafe(rawItems, []);

  if (status === "finalized" && items.length === 0) {
    return { payload: {}, error: "At least one price line item is required to finalize." };
  }

  const vatAit = Number(formData.get("vatAit")) || 0;
  const discount = Number(formData.get("discount")) || 0;
  const deliveryCharge = Number(formData.get("deliveryCharge")) || 0;

  // Server-side recalculation of financial totals & words
  const { subtotal, grandTotal, amountInWords } = calculateQuotationTotals({
    items,
    vatAit,
    discount,
    deliveryCharge,
  });

  const technicalSpecs: TechnicalSpecsSnapshot = parseJsonSafe(
    String(formData.get("technicalSpecs") ?? "{}"),
    {
      generatorBrand: "",
      generatorModel: "",
      primeKva: null,
      standbyKva: null,
      engineBrand: "",
      engineModel: "",
      alternatorBrand: "",
      alternatorModel: "",
      controllerBrand: "",
      controllerType: "",
      shipment: "",
      stockStatus: "",
    }
  );

  const scopeOfSupply: ScopeOfSupplyItem[] = parseJsonSafe(
    String(formData.get("scopeOfSupply") ?? "[]"),
    []
  );

  const commercialTerms: CommercialTerms = parseJsonSafe(
    String(formData.get("commercialTerms") ?? "{}"),
    {
      paymentTerms: "",
      offerValidity: "30 days",
      deliveryTerms: "",
      shipping: "",
      installation: "",
      warranty: "",
      afterSales: "",
      training: "",
    }
  );

  const quotationDate =
    String(formData.get("quotationDate") ?? "").trim() ||
    new Date().toISOString().split("T")[0];

  const validUntil =
    String(formData.get("validUntil") ?? "").trim() ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const payload: Record<string, unknown> = {
    quotationNumber: quotationNumber || `PBB-${Date.now().toString().slice(-4)}`,
    revision: Number(formData.get("revision")) || 0,
    parentQuotationId: String(formData.get("parentQuotationId") ?? "").trim() || undefined,
    status,
    companyName,
    contactPerson,
    designation: String(formData.get("designation") ?? "").trim(),
    phone,
    email: String(formData.get("email") ?? "").trim(),
    address,
    binVatNumber: String(formData.get("binVatNumber") ?? "").trim(),
    product: String(formData.get("productId") ?? "").trim() || undefined,
    technicalSpecs,
    subject,
    items,
    subtotal,
    vatAit,
    discount,
    deliveryCharge,
    grandTotal,
    amountInWords,
    scopeOfSupply,
    commercialTerms,
    standardExclusions: String(formData.get("standardExclusions") ?? "").trim(),
    warrantyExclusions: String(formData.get("warrantyExclusions") ?? "").trim(),
    signatoryName: String(formData.get("signatoryName") ?? "Md Tawfikur Rahman").trim(),
    signatoryTitle: String(formData.get("signatoryTitle") ?? "Manager (CEO)").trim(),
    signatoryPhone: String(formData.get("signatoryPhone") ?? "+88 (0) 1989 474 447").trim(),
    quotationDate,
    validUntil,
    preparedBy: String(formData.get("preparedBy") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  };

  return { payload };
}

export async function createQuotationAction(
  _state: QuotationFormState,
  formData: FormData
): Promise<QuotationFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const { payload, error } = buildQuotationPayload(formData);
  if (error) return { error };

  const res = await createQuotation(token, payload);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    return { error: describePbError(errorBody, "Failed to create quotation.") };
  }

  revalidatePath("/dashboard/quotations");
  redirect("/dashboard/quotations");
}

export async function updateQuotationAction(
  id: string,
  _state: QuotationFormState,
  formData: FormData
): Promise<QuotationFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const { payload, error } = buildQuotationPayload(formData);
  if (error) return { error };

  const res = await updateQuotation(token, id, payload);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    return { error: describePbError(errorBody, "Failed to update quotation.") };
  }

  revalidatePath("/dashboard/quotations");
  redirect("/dashboard/quotations");
}

export async function deleteQuotationAction(id: string): Promise<{ error?: string }> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const res = await deleteQuotation(token, id);
  if (!res.ok) {
    return { error: "Failed to delete quotation." };
  }

  revalidatePath("/dashboard/quotations");
  return {};
}

export async function createRevisionAction(id: string): Promise<{ success: boolean; newId?: string; error?: string }> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const original = await getQuotation(token, id);
  if (!original) {
    return { success: false, error: "Original quotation not found." };
  }

  const nextRevision = (original.revision || 0) + 1;
  const baseNumber = original.quotationNumber.replace(/-R\d+$/, "");
  const revisionNumber = `${baseNumber}-R${nextRevision}`;

  const payload: Record<string, unknown> = {
    ...original,
    id: undefined,
    quotationNumber: revisionNumber,
    revision: nextRevision,
    parentQuotationId: original.parentQuotationId || original.id,
    status: "draft",
    quotationDate: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf: undefined,
  };

  const res = await createQuotation(token, payload);
  if (!res.ok) {
    return { success: false, error: "Failed to create revision." };
  }

  const created = await res.json();
  revalidatePath("/dashboard/quotations");
  return { success: true, newId: created.id };
}

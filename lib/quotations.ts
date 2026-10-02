// Admin data layer for the `quotations` PocketBase collection.
// Talks to PocketBase's REST API directly with the superuser token from
// the admin session cookie, adhering to the project's zero-SDK convention.

import type { ProductRecord } from "./products";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

const PB_FILES_URL =
  process.env.NEXT_PUBLIC_PB_FILES_URL || `${POCKETBASE_URL}/api/files`;

export type QuotationStatus =
  | "draft"
  | "finalized"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";

export type QuotationLineItem = {
  sl: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
};

export type ScopeOfSupplyItem = {
  item: string;
  included: boolean;
};

export type CommercialTerms = {
  paymentTerms: string;
  offerValidity: string;
  deliveryTerms: string;
  shipping: string;
  installation: string;
  warranty: string;
  afterSales: string;
  training: string;
};

export type TechnicalSpecsSnapshot = {
  generatorBrand: string;
  generatorModel: string;
  primeKva: number | null;
  standbyKva: number | null;
  engineBrand: string;
  engineModel: string;
  alternatorBrand: string;
  alternatorModel: string;
  controllerBrand: string;
  controllerType: string;
  shipment?: string;
  stockStatus: string;
  canopyType?: string;
  voltage?: string;
  frequency?: string;
};

export type QuotationRecord = {
  id: string;
  quotationNumber: string;
  revision: number;
  parentQuotationId?: string;
  status: QuotationStatus;

  // Direct Client Information
  companyName: string;
  contactPerson: string;
  designation?: string;
  phone: string;
  email?: string;
  address: string;
  binVatNumber?: string;

  // Generator & Technical Snapshot
  product?: string;
  technicalSpecs: TechnicalSpecsSnapshot;

  // Commercial Line Items & Pricing
  subject: string;
  items: QuotationLineItem[];
  subtotal: number;
  // VAT/AIT and discount as entered; the *Type fields say Tk or %.
  // Missing type (older records) means a flat BDT amount.
  vatAit?: number;
  vatAitType?: "amount" | "percent" | "";
  discount?: number;
  discountType?: "amount" | "percent" | "";
  deliveryCharge?: number;
  grandTotal: number;
  amountInWords: string;

  // Terms, Scope & Exclusions
  scopeOfSupply?: ScopeOfSupplyItem[];
  commercialTerms?: CommercialTerms;
  standardExclusions?: string;
  warrantyExclusions?: string;

  // Signatory & Dates
  signatoryName?: string;
  signatoryTitle?: string;
  signatoryPhone?: string;
  quotationDate: string;
  validUntil: string;
  preparedBy?: string;
  notes?: string;
  pdf?: string;

  created: string;
  updated: string;
  expand?: {
    product?: ProductRecord;
  };
};

function pbAuthedFetch(token: string, path: string, init: RequestInit = {}) {
  return fetch(`${POCKETBASE_URL}${path}`, {
    ...init,
    headers: { Authorization: token, ...init.headers },
    cache: "no-store",
  });
}

export function quotationPdfUrl(quotation: Pick<QuotationRecord, "id" | "pdf">) {
  if (!quotation.pdf) return null;
  return `${PB_FILES_URL}/quotations/${quotation.id}/${quotation.pdf}`;
}

export async function listQuotations(
  token: string,
  {
    page = 1,
    perPage = 20,
    search = "",
    status = "",
  }: { page?: number; perPage?: number; search?: string; status?: string } = {}
): Promise<{ items: QuotationRecord[]; totalPages: number; totalItems: number; page: number }> {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    sort: "-created",
    expand: "product,product.brand",
  });

  const filterParts: string[] = [];
  const q = search.trim();
  if (q) {
    const safe = q.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    filterParts.push(`(quotationNumber ~ "${safe}" || companyName ~ "${safe}" || contactPerson ~ "${safe}")`);
  }
  if (status) {
    filterParts.push(`status = "${status}"`);
  }
  if (filterParts.length > 0) {
    params.set("filter", filterParts.join(" && "));
  }

  const res = await pbAuthedFetch(token, `/api/collections/quotations/records?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load quotations");
  const data = await res.json();
  return { items: data.items, totalPages: data.totalPages, totalItems: data.totalItems, page: data.page };
}

export async function getQuotation(token: string, id: string): Promise<QuotationRecord | null> {
  const res = await pbAuthedFetch(
    token,
    `/api/collections/quotations/records/${id}?expand=product,product.brand`
  );
  if (!res.ok) return null;
  return res.json();
}

export function createQuotation(token: string, data: Record<string, unknown> | FormData) {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  return pbAuthedFetch(token, "/api/collections/quotations/records", {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  });
}

export function updateQuotation(token: string, id: string, data: Record<string, unknown> | FormData) {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  return pbAuthedFetch(token, `/api/collections/quotations/records/${id}`, {
    method: "PATCH",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  });
}

export function deleteQuotation(token: string, id: string) {
  return pbAuthedFetch(token, `/api/collections/quotations/records/${id}`, { method: "DELETE" });
}

"use client";

import { useState, useTransition, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, CheckCircle2, XCircle, Calculator, FileCheck, Save, Search, ChevronDown, X } from "lucide-react";
import type { QuotationRecord, QuotationLineItem, ScopeOfSupplyItem, CommercialTerms, TechnicalSpecsSnapshot } from "@/lib/quotations";
import type { ProductRecord } from "@/lib/products";
import type { AdjustmentType } from "@/lib/invoices";
import AdjustmentField from "./adjustment-field";
import {
  DEFAULT_SCOPE_OF_SUPPLY,
  DEFAULT_COMMERCIAL_TERMS,
  DEFAULT_STANDARD_EXCLUSIONS,
  DEFAULT_WARRANTY_EXCLUSIONS,
  DEFAULT_SIGNATORY,
  calculateLineTotal,
  calculateQuotationTotals,
  formatBdtCurrency,
} from "@/lib/quotation-calculator";

const INPUT_CLASS =
  "w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 bg-white";
const LABEL_CLASS = "text-xs font-semibold text-ink-700 uppercase tracking-wide";
const CARD_CLASS = "rounded-xl border border-ink-100 bg-white p-6 shadow-sm";

type FormLineItem = {
  sl: string;
  description: string;
  qty: number | "";
  unitPrice: number | "";
  total: number;
};

interface QuotationFormProps {
  products: ProductRecord[];
  quotation?: QuotationRecord;
  action: (state: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string } | undefined>;
}

export default function QuotationForm({ products, quotation, action }: QuotationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  // Client Details
  const [companyName, setCompanyName] = useState(quotation?.companyName ?? "");
  const [contactPerson, setContactPerson] = useState(quotation?.contactPerson ?? "");
  const [designation, setDesignation] = useState(quotation?.designation ?? "");
  const [phone, setPhone] = useState(quotation?.phone ?? "");
  const [email, setEmail] = useState(quotation?.email ?? "");
  const [address, setAddress] = useState(quotation?.address ?? "");
  const [binVatNumber, setBinVatNumber] = useState(quotation?.binVatNumber ?? "");

  // Metadata
  const [quotationNumber, setQuotationNumber] = useState(
    quotation?.quotationNumber ?? `PBB-${Date.now().toString().slice(-4)}`
  );
  const [subject, setSubject] = useState(
    quotation?.subject ?? "QUOTATION FOR SUPPLY OF DIESEL GENERATOR"
  );
  const [quotationDate, setQuotationDate] = useState(
    quotation?.quotationDate?.split("T")[0] ?? new Date().toISOString().split("T")[0]
  );
  const [validUntil, setValidUntil] = useState(
    quotation?.validUntil?.split("T")[0] ??
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Technical Specs
  const [selectedProductId, setSelectedProductId] = useState(quotation?.product ?? "");
  const [productSearch, setProductSearch] = useState(() => {
    if (quotation?.product) {
      const p = products.find((prod) => prod.id === quotation.product);
      if (p) return `${p.expand?.brand?.name || p.brand} — ${p.model}`;
    }
    return "";
  });
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setComboboxOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase().trim();
    return products.filter((p) => {
      const brand = (p.expand?.brand?.name || p.brand || "").toLowerCase();
      const model = (p.model || "").toLowerCase();
      const engine = (p.engineModel || "").toLowerCase();
      const alt = (p.alternator || "").toLowerCase();
      const ctrl = (p.controller || "").toLowerCase();
      const kva = `${p.standbyKva || ""} ${p.primeKva || ""}`.toLowerCase();
      return (
        brand.includes(q) ||
        model.includes(q) ||
        engine.includes(q) ||
        alt.includes(q) ||
        ctrl.includes(q) ||
        kva.includes(q)
      );
    });
  }, [products, productSearch]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const [technicalSpecs, setTechnicalSpecs] = useState<TechnicalSpecsSnapshot>(
    quotation?.technicalSpecs ?? {
      generatorBrand: "",
      generatorModel: "",
      primeKva: null,
      standbyKva: null,
      engineBrand: "",
      engineModel: "",
      alternatorBrand: "",
      alternatorModel: "",
      controllerBrand: "",
      controllerType: "Digital Auto Start",
      voltage: "400V / 230V, 50Hz, 1500 RPM",
      canopyType: "Foreign Canopied Soundproof",
      stockStatus: "Ready Stock / Within 60 Days",
    }
  );

  // Line items
  const [items, setItems] = useState<FormLineItem[]>(
    quotation?.items?.map((it) => ({
      sl: it.sl,
      description: it.description,
      qty: it.qty,
      unitPrice: it.unitPrice === 0 ? "" : it.unitPrice,
      total: it.total,
    })) ?? [
      {
        sl: "01",
        description: "Foreign Canopied Soundproof Diesel Generator Set",
        qty: 1,
        unitPrice: "",
        total: 0,
      },
      {
        sl: "02",
        description: "Foreign Made Automatic Transfer Switch (ATS)",
        qty: 1,
        unitPrice: "",
        total: 0,
      },
    ]
  );

  // Commercial financial totals
  const [vatAit, setVatAit] = useState<number | "">(
    quotation?.vatAit && quotation.vatAit > 0 ? quotation.vatAit : ""
  );
  const [discount, setDiscount] = useState<number | "">(
    quotation?.discount && quotation.discount > 0 ? quotation.discount : ""
  );
  const [vatAitType, setVatAitType] = useState<AdjustmentType>(
    quotation?.vatAitType === "percent" ? "percent" : "amount"
  );
  const [discountType, setDiscountType] = useState<AdjustmentType>(
    quotation?.discountType === "percent" ? "percent" : "amount"
  );
  const [deliveryCharge, setDeliveryCharge] = useState<number | "">(
    quotation?.deliveryCharge && quotation.deliveryCharge > 0
      ? quotation.deliveryCharge
      : ""
  );

  // Scope & Terms
  const [scopeOfSupply, setScopeOfSupply] = useState<ScopeOfSupplyItem[]>(
    quotation?.scopeOfSupply ?? DEFAULT_SCOPE_OF_SUPPLY
  );
  const [commercialTerms, setCommercialTerms] = useState<CommercialTerms>(
    quotation?.commercialTerms ?? DEFAULT_COMMERCIAL_TERMS
  );
  const [standardExclusions, setStandardExclusions] = useState<string>(
    quotation?.standardExclusions ?? DEFAULT_STANDARD_EXCLUSIONS
  );

  // Signatory
  const [signatoryName, setSignatoryName] = useState(quotation?.signatoryName ?? DEFAULT_SIGNATORY.name);
  const [signatoryTitle, setSignatoryTitle] = useState(quotation?.signatoryTitle ?? DEFAULT_SIGNATORY.title);
  const [signatoryPhone, setSignatoryPhone] = useState(quotation?.signatoryPhone ?? DEFAULT_SIGNATORY.phone);

  // Recalculate totals dynamically
  const normalizedItems: QuotationLineItem[] = items.map((it) => ({
    sl: it.sl,
    description: it.description,
    qty: it.qty === "" ? 0 : Number(it.qty),
    unitPrice: it.unitPrice === "" ? 0 : Number(it.unitPrice),
    total: it.total,
  }));

  const { subtotal, discountAmount, vatAitAmount, grandTotal, amountInWords } =
    calculateQuotationTotals({
      items: normalizedItems,
      vatAit: vatAit === "" ? 0 : Number(vatAit),
      vatAitType,
      discount: discount === "" ? 0 : Number(discount),
      discountType,
      deliveryCharge: deliveryCharge === "" ? 0 : Number(deliveryCharge),
    });

  const discountError =
    discountType === "percent" && Number(discount || 0) > 100
      ? "Percentage cannot be more than 100."
      : undefined;
  const vatAitError =
    vatAitType === "percent" && Number(vatAit || 0) > 100
      ? "Percentage cannot be more than 100."
      : undefined;
  const hasAdjustmentError = Boolean(discountError || vatAitError);

  // Handler: Selecting a generator model from master data
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const brandName = prod.expand?.brand?.name || prod.brand || "";
    const kvaOutput = prod.standbyKva || prod.primeKva || "";

    setSubject(
      `QUOTATION FOR SUPPLY OF ${kvaOutput ? `${kvaOutput} KVA ` : ""}${brandName.toUpperCase()} DIESEL GENERATOR`
    );

    setTechnicalSpecs({
      generatorBrand: brandName,
      generatorModel: prod.model,
      primeKva: prod.primeKva,
      standbyKva: prod.standbyKva,
      engineBrand: brandName,
      engineModel: prod.engineModel || "",
      alternatorBrand: prod.alternator || "Leroy Somer / Stamford",
      alternatorModel: prod.alternator || "",
      controllerBrand: prod.controller || "Deep Sea Electronics, UK",
      controllerType: "Digital Auto Start",
      voltage: "400V / 230V, 50Hz, 1500 RPM",
      canopyType: "Foreign Canopied Soundproof",
      stockStatus: "Ready Stock / Within 60 Days",
    });

    // Populate item 1 with generator description and unit price if set
    setItems((prev) => {
      const copy = [...prev];
      if (copy.length > 0) {
        const uPrice = prod.price > 0 ? prod.price : "";
        const uQty = copy[0].qty === "" ? 1 : Number(copy[0].qty);
        copy[0] = {
          ...copy[0],
          description: `${kvaOutput ? `${kvaOutput} KVA ` : ""}${prod.model} (Foreign Canopied Diesel Generator Set)\nEngine: ${prod.engineModel || brandName}`,
          unitPrice: uPrice,
          total: calculateLineTotal(uQty, Number(uPrice) || 0),
        };
      }
      return copy;
    });
  };

  // Line item manipulation
  const updateLineItem = (index: number, field: keyof FormLineItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };
      if (field === "qty" || field === "unitPrice") {
        const q = current.qty === "" ? 0 : Number(current.qty);
        const p = current.unitPrice === "" ? 0 : Number(current.unitPrice);
        current.total = calculateLineTotal(q, p);
      }
      updated[index] = current;
      return updated;
    });
  };

  const addLineItem = () => {
    setItems((prev) => [
      ...prev,
      {
        sl: String(prev.length + 1).padStart(2, "0"),
        description: "",
        qty: 1,
        unitPrice: "",
        total: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleScope = (index: number) => {
    setScopeOfSupply((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], included: !updated[index].included };
      return updated;
    });
  };

  const handleClearSelection = () => {
    setSelectedProductId("");
    setProductSearch("");
    setSubject("QUOTATION FOR SUPPLY OF DIESEL GENERATOR");
    setTechnicalSpecs({
      generatorBrand: "",
      generatorModel: "",
      primeKva: null,
      standbyKva: null,
      engineBrand: "",
      engineModel: "",
      alternatorBrand: "",
      alternatorModel: "",
      controllerBrand: "",
      controllerType: "Digital Auto Start",
      voltage: "400V / 230V, 50Hz, 1500 RPM",
      canopyType: "Foreign Canopied Soundproof",
      stockStatus: "Ready Stock / Within 60 Days",
    });
    setItems((prev) => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[0] = {
          ...copy[0],
          description: "Foreign Canopied Soundproof Diesel Generator Set",
          unitPrice: "",
          total: 0,
        };
      }
      return copy;
    });
  };

  // Form submission
  const handleSubmit = (status: "draft" | "finalized") => {
    setServerError(null);
    const formData = new FormData();
    formData.set("status", status);
    formData.set("quotationNumber", quotationNumber);
    formData.set("subject", subject);
    formData.set("quotationDate", quotationDate);
    formData.set("validUntil", validUntil);

    // Client
    formData.set("companyName", companyName);
    formData.set("contactPerson", contactPerson);
    formData.set("designation", designation);
    formData.set("phone", phone);
    formData.set("email", email);
    formData.set("address", address);
    formData.set("binVatNumber", binVatNumber);

    // Generator & Technical
    formData.set("productId", selectedProductId);
    formData.set("technicalSpecs", JSON.stringify(technicalSpecs));

    // Pricing
    formData.set("items", JSON.stringify(normalizedItems));
    formData.set("vatAit", String(vatAit === "" ? 0 : Number(vatAit)));
    formData.set("vatAitType", vatAitType);
    formData.set("discountType", discountType);
    formData.set("discount", String(discount === "" ? 0 : Number(discount)));
    formData.set("deliveryCharge", String(deliveryCharge === "" ? 0 : Number(deliveryCharge)));

    // Terms & Scope
    formData.set("scopeOfSupply", JSON.stringify(scopeOfSupply));
    formData.set("commercialTerms", JSON.stringify(commercialTerms));
    formData.set("standardExclusions", standardExclusions);

    // Signatory
    formData.set("signatoryName", signatoryName);
    formData.set("signatoryTitle", signatoryTitle);
    formData.set("signatoryPhone", signatoryPhone);

    startTransition(async () => {
      const result = await action(undefined, formData);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {serverError}
        </div>
      )}

      {/* 1. Client Details Section */}
      <div className={CARD_CLASS}>
        <div className="flex items-center justify-between border-b border-ink-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-ink-900">Client Details (Direct Input)</h2>
            <p className="text-xs text-ink-500">Submitted to information that appears on Page 1 of the PDF</p>
          </div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
            Step 1
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={LABEL_CLASS}>Company / Organization Name *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Bashundhara Training and Testing center"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>Contact Person *</label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Engr. Md. Rahim"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>Designation</label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Project Director / Manager"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>Phone / Mobile *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +880-1711-000000"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. procurement@company.com"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={LABEL_CLASS}>Address / Site Location *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Charshingharchar, Amtola, Polash, Narshingdi"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>BIN / VAT Number (Optional)</label>
            <input
              type="text"
              value={binVatNumber}
              onChange={(e) => setBinVatNumber(e.target.value)}
              placeholder="e.g. 001234567-0101"
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </div>

      {/* 2. Generator Master Selection & Technical Data */}
      <div className={CARD_CLASS}>
        <div className="flex items-center justify-between border-b border-ink-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-ink-900">Generator & Technical Specifications</h2>
            <p className="text-xs text-ink-500">Pick any generator model to auto-fill technical specs</p>
          </div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
            Step 2
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {/* Searchable Combobox for Generator Master */}
          <div className="flex flex-col gap-1.5" ref={comboboxRef}>
            <div className="flex items-center justify-between">
              <label className={LABEL_CLASS}>Auto-Fill from Generator Master</label>
              {(selectedProductId || productSearch || technicalSpecs.generatorModel || technicalSpecs.generatorBrand) && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                  title="Reset all fields in Step 2"
                >
                  <X className="size-3" />
                  Clear Selection
                </button>
              )}
            </div>

            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 size-4 text-ink-400 pointer-events-none" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    if (!comboboxOpen) setComboboxOpen(true);
                  }}
                  onFocus={() => setComboboxOpen(true)}
                  placeholder="Search by brand, model, kVA, or engine (e.g. Perkins, PW-500, 500kVA)..."
                  className={`${INPUT_CLASS} pl-9 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setComboboxOpen((prev) => !prev)}
                  className="absolute right-2 p-1.5 text-ink-400 hover:text-ink-600"
                  tabIndex={-1}
                >
                  <ChevronDown className={`size-4 transition-transform ${comboboxOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {/* Floating Dropdown Results */}
              {comboboxOpen && (
                <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-ink-200 bg-white shadow-xl divide-y divide-ink-100">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-ink-500">
                      No generator models found matching &quot;{productSearch}&quot;
                    </div>
                  ) : (
                    filteredProducts.map((p) => {
                      const brandName = p.expand?.brand?.name || p.brand;
                      const isSelected = p.id === selectedProductId;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            handleProductSelect(p.id);
                            setProductSearch(`${brandName} — ${p.model}`);
                            setComboboxOpen(false);
                          }}
                          className={`w-full text-left p-3 hover:bg-brand-50/60 transition-colors flex items-center justify-between gap-3 ${
                            isSelected ? "bg-brand-50/80" : ""
                          }`}
                        >
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] font-semibold text-ink-800">
                                {brandName}
                              </span>
                              <span className="font-bold text-sm text-ink-900 truncate">
                                {p.model}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-500">
                              <span>
                                Output:{" "}
                                <strong className="text-ink-700">
                                  {p.standbyKva || p.primeKva || "N/A"} kVA
                                </strong>
                              </span>
                              {p.engineModel && (
                                <span>
                                  Engine:{" "}
                                  <strong className="text-ink-700">{p.engineModel}</strong>
                                </span>
                              )}
                              {p.alternator && <span>Alt: {p.alternator}</span>}
                            </div>
                          </div>

                          {p.price > 0 && (
                            <span className="shrink-0 text-xs font-bold text-brand-600 tabular-nums">
                              BDT {formatBdtCurrency(p.price)}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>Quotation Subject Title *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>Generator Brand</label>
              <input
                type="text"
                value={technicalSpecs.generatorBrand}
                onChange={(e) =>
                  setTechnicalSpecs({ ...technicalSpecs, generatorBrand: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>Generator Model</label>
              <input
                type="text"
                value={technicalSpecs.generatorModel}
                onChange={(e) =>
                  setTechnicalSpecs({ ...technicalSpecs, generatorModel: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>Prime Capacity (kVA)</label>
              <input
                type="number"
                value={technicalSpecs.primeKva ?? ""}
                onChange={(e) =>
                  setTechnicalSpecs({
                    ...technicalSpecs,
                    primeKva: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>Standby Capacity (kVA)</label>
              <input
                type="number"
                value={technicalSpecs.standbyKva ?? ""}
                onChange={(e) =>
                  setTechnicalSpecs({
                    ...technicalSpecs,
                    standbyKva: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>Engine Brand & Model</label>
              <input
                type="text"
                value={technicalSpecs.engineModel}
                onChange={(e) =>
                  setTechnicalSpecs({ ...technicalSpecs, engineModel: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>Alternator Brand</label>
              <input
                type="text"
                value={technicalSpecs.alternatorBrand}
                onChange={(e) =>
                  setTechnicalSpecs({ ...technicalSpecs, alternatorBrand: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>Controller</label>
              <input
                type="text"
                value={technicalSpecs.controllerBrand}
                onChange={(e) =>
                  setTechnicalSpecs({ ...technicalSpecs, controllerBrand: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>Stock & Delivery Time</label>
              <input
                type="text"
                value={technicalSpecs.stockStatus}
                onChange={(e) =>
                  setTechnicalSpecs({ ...technicalSpecs, stockStatus: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Pricing Summary Table */}
      <div className={CARD_CLASS}>
        <div className="flex items-center justify-between border-b border-ink-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-ink-900">Price Summary (BDT)</h2>
            <p className="text-xs text-ink-500">Commercial line items and automatic currency conversion</p>
          </div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
            Step 3
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-xs font-semibold uppercase text-ink-700">
                <tr>
                  <th className="py-2.5 pl-3 pr-2 w-12 text-center">SL</th>
                  <th className="py-2.5 px-3">Description of Goods</th>
                  <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                  <th className="py-2.5 px-3 w-40 text-right">Unit Price (BDT)</th>
                  <th className="py-2.5 px-3 w-40 text-right">Total (BDT)</th>
                  <th className="py-2.5 pr-3 pl-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pl-3 pr-2 text-center font-medium text-ink-500">
                      {item.sl}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                        placeholder="Item description"
                        className={INPUT_CLASS}
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) =>
                          updateLineItem(
                            idx,
                            "qty",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="1"
                        className={`${INPUT_CLASS} text-center`}
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(
                            idx,
                            "unitPrice",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="0"
                        className={`${INPUT_CLASS} text-right font-medium tabular-nums`}
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-ink-900 tabular-nums">
                      {formatBdtCurrency(item.total)}
                    </td>
                    <td className="py-2 pr-3 pl-2 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          className="text-ink-400 hover:text-red-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right-aligned Add Line Item Button directly below the lines */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 shadow-2xs hover:border-brand-300 hover:text-brand-600 transition-colors"
            >
              <Plus className="size-3.5 text-brand-500" />
              Add Line Item
            </button>
          </div>

          {/* Totals & Commercial Breakdown Block (same design as invoices) */}
          <div className="flex justify-end pt-2">
            <div className="flex w-full flex-col gap-3 rounded-lg border border-ink-100 bg-ink-50 p-4 sm:w-[22rem]">
              <div className="flex justify-between text-sm text-ink-700">
                <span>Subtotal</span>
                <span className="font-semibold tabular-nums">{formatBdtCurrency(subtotal)}</span>
              </div>

              <AdjustmentField
                label="Discount"
                type={discountType}
                onTypeChange={setDiscountType}
                value={discount}
                onValueChange={setDiscount}
                amount={discountAmount}
                sign="-"
                error={discountError}
              />

              <AdjustmentField
                label="VAT / AIT"
                type={vatAitType}
                onTypeChange={setVatAitType}
                value={vatAit}
                onValueChange={setVatAit}
                amount={vatAitAmount}
                sign="+"
                error={vatAitError}
              />

              <AdjustmentField
                label="Delivery"
                value={deliveryCharge}
                onValueChange={setDeliveryCharge}
                amount={deliveryCharge === "" ? 0 : Number(deliveryCharge)}
                sign="+"
              />

              <div className="flex justify-between border-t border-ink-200 pt-3 text-base font-bold text-ink-900">
                <span>Grand Total</span>
                <span className="text-brand-600 tabular-nums">{formatBdtCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border-l-4 border-brand-500 bg-brand-50 p-3 text-xs font-semibold text-brand-900">
            <span className="mr-2 uppercase text-brand-700">In Words:</span>
            {amountInWords}
          </div>
        </div>
      </div>

      {/* 4. Scope of Supply & Commercial Terms */}
      <div className={CARD_CLASS}>
        <div className="flex items-center justify-between border-b border-ink-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-ink-900">Terms, Scope & Signatory (Page 2)</h2>
            <p className="text-xs text-ink-500">Preset commercial clauses and authorization</p>
          </div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
            Step 4
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-6">
          {/* Scope Checklist */}
          <div>
            <label className={`${LABEL_CLASS} mb-2 block`}>Scope of Supply Inclusions</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {scopeOfSupply.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleScope(idx)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-xs font-medium transition-colors ${
                    s.included
                      ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                      : "border-red-200 bg-red-50/50 text-red-900"
                  }`}
                >
                  <span>{s.item}</span>
                  {s.included ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="size-3" /> INCLUDED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                      <XCircle className="size-3" /> EXCLUDED
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Terms */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>1. Terms of Payment</label>
              <textarea
                rows={2}
                value={commercialTerms.paymentTerms}
                onChange={(e) =>
                  setCommercialTerms({ ...commercialTerms, paymentTerms: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>2. Offer Validity</label>
              <textarea
                rows={2}
                value={commercialTerms.offerValidity}
                onChange={(e) =>
                  setCommercialTerms({ ...commercialTerms, offerValidity: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>3. Warranty</label>
              <textarea
                rows={2}
                value={commercialTerms.warranty}
                onChange={(e) =>
                  setCommercialTerms({ ...commercialTerms, warranty: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>4. Installation & Commissioning</label>
              <textarea
                rows={2}
                value={commercialTerms.installation}
                onChange={(e) =>
                  setCommercialTerms({ ...commercialTerms, installation: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {/* Signatory */}
          <div className="border-t border-ink-100 pt-4">
            <label className={`${LABEL_CLASS} mb-3 block`}>Authorized Signatory</label>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-ink-500">Officer Name</label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-ink-500">Designation / Title</label>
                <input
                  type="text"
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-ink-500">Phone</label>
                <input
                  type="text"
                  value={signatoryPhone}
                  onChange={(e) => setSignatoryPhone(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <Link
          href="/dashboard/quotations"
          className="text-sm font-semibold text-ink-600 hover:text-ink-900"
        >
          Cancel &amp; return
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isPending || hasAdjustmentError}
            onClick={() => handleSubmit("draft")}
            className="inline-flex items-center gap-2 rounded-full border border-ink-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50 disabled:opacity-50"
          >
            <Save className="size-4" />
            {isPending ? "Saving..." : "Save as Draft"}
          </button>

          <button
            type="button"
            disabled={isPending || hasAdjustmentError}
            onClick={() => handleSubmit("finalized")}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50 shadow-sm"
          >
            <FileCheck className="size-4" />
            {isPending ? "Finalizing..." : "Finalize Quotation"}
          </button>
        </div>
      </div>
    </div>
  );
}

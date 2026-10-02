"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Trash2, Save } from "lucide-react";
import type { AdjustmentType, InvoiceRecord } from "@/lib/invoices";
import { calculateInvoiceTotals, calculateLineTotal } from "@/lib/invoice-calculator";
import { formatBdtCurrency } from "@/lib/format-bdt-words";
import AdjustmentField from "./adjustment-field";

const INPUT_CLASS =
  "w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 bg-white";
const LABEL_CLASS = "text-xs font-semibold text-ink-700 uppercase tracking-wide";
const CARD_CLASS = "rounded-xl border border-ink-100 bg-white p-4 shadow-sm sm:p-6";

export type CatalogOption = { id: string; label: string; price: number };

type FormLineItem = {
  key: number;
  name: string;
  qty: number | "";
  unitPrice: number | "";
};

interface InvoiceFormProps {
  invoice?: InvoiceRecord;
  catalog: CatalogOption[];
  action: (
    state: { error?: string } | undefined,
    formData: FormData
  ) => Promise<{ error?: string } | undefined>;
}

// Frequently billed items, pre-filled on a new invoice. Every row stays
// editable and removable.
const DEFAULT_ITEM_NAMES = ["Engine Oil", "Engine Oil Filter", "Diesel Filter", "Air Filter", "Service Charge"];

let nextKey = 1;
const newKey = () => nextKey++;

function toNumber(value: number | "") {
  return value === "" ? 0 : Number(value);
}

function SectionHeader({ title, hint, step }: { title: string; hint: string; step: number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-100 pb-3">
      <div>
        <h2 className="text-base font-bold text-ink-900">{title}</h2>
        <p className="text-xs text-ink-500">{hint}</p>
      </div>
      <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
        Step {step}
      </span>
    </div>
  );
}

export default function InvoiceForm({ invoice, catalog, action }: InvoiceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  // Bill To
  const [customerName, setCustomerName] = useState(invoice?.customerName ?? "");
  const [companyName, setCompanyName] = useState(invoice?.companyName ?? "");
  const [customerPhone, setCustomerPhone] = useState(invoice?.customerPhone ?? "");
  const [customerEmail, setCustomerEmail] = useState(invoice?.customerEmail ?? "");
  const [customerAddress, setCustomerAddress] = useState(invoice?.customerAddress ?? "");

  // Items
  const [items, setItems] = useState<FormLineItem[]>(
    invoice?.items?.length
      ? invoice.items.map((it) => ({
          key: newKey(),
          name: it.name,
          qty: it.qty,
          unitPrice: it.unitPrice === 0 ? "" : it.unitPrice,
        }))
      : DEFAULT_ITEM_NAMES.map((name) => ({ key: newKey(), name, qty: 1, unitPrice: "" as const }))
  );

  // Discount & notes
  const [discountType, setDiscountType] = useState<AdjustmentType>(
    invoice?.discountType === "percent" ? "percent" : "amount"
  );
  const [discount, setDiscount] = useState<number | "">(
    invoice?.discount && invoice.discount > 0 ? invoice.discount : ""
  );
  const [vatType, setVatType] = useState<AdjustmentType>(
    invoice?.taxType === "percent" ? "percent" : "amount"
  );
  const [vat, setVat] = useState<number | "">(invoice?.tax && invoice.tax > 0 ? invoice.tax : "");
  const [notes, setNotes] = useState(invoice?.notes ?? "");

  const normalizedItems = items.map((it) => ({
    name: it.name.trim(),
    qty: toNumber(it.qty),
    unitPrice: toNumber(it.unitPrice),
  }));

  const { subtotal, discountAmount, vatAmount, total, amountInWords } = calculateInvoiceTotals({
    items: normalizedItems,
    discountType,
    discount: toNumber(discount),
    vatType,
    vat: toNumber(vat),
  });

  const discountError =
    discountType === "percent"
      ? toNumber(discount) > 100
        ? "Percentage cannot be more than 100."
        : undefined
      : toNumber(discount) > subtotal
        ? "Discount cannot be more than the subtotal."
        : undefined;
  const vatError =
    vatType === "percent" && toNumber(vat) > 100 ? "Percentage cannot be more than 100." : undefined;
  const hasAdjustmentError = Boolean(discountError || vatError);

  const updateItem = (key: number, patch: Partial<FormLineItem>) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { key: newKey(), name: "", qty: 1, unitPrice: "" }]);
  };

  const removeItem = (key: number) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((it) => it.key !== key)));
  };

  const addFromCatalog = (productId: string) => {
    const product = catalog.find((p) => p.id === productId);
    if (!product) return;
    const line: FormLineItem = {
      key: newKey(),
      name: product.label,
      qty: 1,
      unitPrice: product.price > 0 ? product.price : "",
    };
    setItems((prev) => {
      // Replace the starter row if it is still empty.
      if (prev.length === 1 && !prev[0].name.trim() && prev[0].unitPrice === "") return [line];
      return [...prev, line];
    });
  };

  const handleSubmit = () => {
    setServerError(null);
    const formData = new FormData();
    formData.set("customerName", customerName);
    formData.set("companyName", companyName);
    formData.set("customerPhone", customerPhone);
    formData.set("customerEmail", customerEmail);
    formData.set("customerAddress", customerAddress);
    formData.set("items", JSON.stringify(normalizedItems));
    formData.set("discountType", discountType);
    formData.set("discount", String(toNumber(discount)));
    formData.set("vatType", vatType);
    formData.set("vat", String(toNumber(vat)));
    formData.set("notes", notes);

    startTransition(async () => {
      const result = await action(undefined, formData);
      if (result?.error) {
        setServerError(result.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <form
      className="flex flex-col gap-6 pb-12 sm:gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          {serverError}
        </div>
      )}

      {/* 1. Bill To */}
      <div className={CARD_CLASS}>
        <SectionHeader title="Bill To" hint="Customer details printed on the invoice" step={1} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Customer Name *</span>
            <input
              type="text"
              required
              maxLength={150}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Md. Rahim Uddin"
              className={INPUT_CLASS}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Company / Organization</span>
            <input
              type="text"
              maxLength={200}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Optional"
              className={INPUT_CLASS}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Phone</span>
            <input
              type="tel"
              maxLength={50}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="e.g. +880 1711 000000"
              className={INPUT_CLASS}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Email</span>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Optional"
              className={INPUT_CLASS}
            />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={LABEL_CLASS}>Address</span>
            <input
              type="text"
              maxLength={500}
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="e.g. Savar, Dhaka"
              className={INPUT_CLASS}
            />
          </label>
        </div>
      </div>

      {/* 2. Items */}
      <div className={CARD_CLASS}>
        <SectionHeader title="Items" hint="Common items are pre-filled. Edit, remove or add as needed" step={2} />

        {catalog.length > 0 && (
          <label className="mt-4 flex flex-col gap-1.5 sm:max-w-md">
            <span className={LABEL_CLASS}>Add from catalog (optional)</span>
            <select
              value=""
              onChange={(e) => addFromCatalog(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Pick a generator model…</option>
              {catalog.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {p.price > 0 ? ` (BDT ${formatBdtCurrency(p.price, false)})` : ""}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Column headings (tablet and up) */}
        <div className="mt-4 hidden grid-cols-[2rem_1fr_5.5rem_9rem_8rem_2rem] gap-3 border-b border-ink-200 bg-ink-50 px-3 py-2.5 text-xs font-semibold uppercase text-ink-700 sm:grid">
          <span className="text-center">SL</span>
          <span>Item Name</span>
          <span className="text-center">Quantity</span>
          <span className="text-right">Unit Price (BDT)</span>
          <span className="text-right">Total Price</span>
          <span />
        </div>

        <ul className="mt-3 flex flex-col gap-3 sm:mt-0 sm:gap-0 sm:divide-y sm:divide-ink-100">
          {items.map((item, idx) => {
            const lineTotal = calculateLineTotal(toNumber(item.qty), toNumber(item.unitPrice));
            return (
              <li
                key={item.key}
                className="grid grid-cols-3 gap-3 rounded-lg border border-ink-100 p-3 sm:grid-cols-[2rem_1fr_5.5rem_9rem_8rem_2rem] sm:items-center sm:rounded-none sm:border-0 sm:px-3 sm:py-2"
              >
                <div className="col-span-3 flex items-center justify-between sm:col-span-1 sm:justify-center">
                  <span className="text-xs font-semibold text-ink-500 sm:text-sm">
                    <span className="sm:hidden">Item </span>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="p-1 text-ink-400 transition-colors hover:text-red-600 sm:hidden"
                      aria-label={`Remove item ${idx + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                <label className="col-span-3 flex flex-col gap-1 sm:col-span-1">
                  <span className="text-[11px] font-semibold uppercase text-ink-500 sm:sr-only">
                    Item Name
                  </span>
                  <input
                    type="text"
                    maxLength={300}
                    value={item.name}
                    onChange={(e) => updateItem(item.key, { name: e.target.value })}
                    placeholder="e.g. 100 kVA Perkins Diesel Generator"
                    className={INPUT_CLASS}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase text-ink-500 sm:sr-only">
                    Quantity
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="any"
                    value={item.qty}
                    onChange={(e) =>
                      updateItem(item.key, {
                        qty: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    placeholder="1"
                    className={`${INPUT_CLASS} text-center tabular-nums`}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase text-ink-500 sm:sr-only">
                    Unit Price
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(item.key, {
                        unitPrice: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    placeholder="0"
                    className={`${INPUT_CLASS} text-right tabular-nums`}
                  />
                </label>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase text-ink-500 sm:hidden">
                    Total
                  </span>
                  <span className="py-2 text-right text-sm font-semibold text-ink-900 tabular-nums">
                    {formatBdtCurrency(lineTotal)}
                  </span>
                </div>

                <div className="hidden justify-center sm:flex">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="p-1 text-ink-400 transition-colors hover:text-red-600"
                      aria-label={`Remove item ${idx + 1}`}
                      title="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 shadow-2xs transition-colors hover:border-brand-300 hover:text-brand-600"
          >
            <Plus className="size-3.5 text-brand-500" />
            Add Item
          </button>
        </div>
      </div>

      {/* 3. Totals, Discount & VAT */}
      <div className={CARD_CLASS}>
        <SectionHeader title="Total, Discount & VAT" hint="Totals update as you type. VAT is charged after discount" step={3} />

        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Notes (printed on invoice)</span>
            <textarea
              rows={5}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Payment received in cash. Warranty as per quotation."
              className={INPUT_CLASS}
            />
          </label>

          <div className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-ink-50 p-4">
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
              label="VAT"
              type={vatType}
              onTypeChange={setVatType}
              value={vat}
              onValueChange={setVat}
              amount={vatAmount}
              sign="+"
              error={vatError}
            />

            <div className="flex justify-between border-t border-ink-200 pt-3 text-base font-bold text-ink-900">
              <span>Grand Total</span>
              <span className="text-brand-600 tabular-nums">{formatBdtCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-md border-l-4 border-brand-500 bg-brand-50 p-3 text-xs font-semibold text-brand-900">
          <span className="mr-2 uppercase text-brand-700">In Words:</span>
          {amountInWords}
        </div>
      </div>

      {/* Action Footer */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <Link
          href="/dashboard/invoices"
          className="text-sm font-semibold text-ink-600 hover:text-ink-900"
        >
          Cancel &amp; return
        </Link>

        <button
          type="submit"
          disabled={isPending || hasAdjustmentError}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          <Save className="size-4" />
          {isPending ? "Saving..." : invoice ? "Save Changes" : "Create Invoice"}
        </button>
      </div>
    </form>
  );
}

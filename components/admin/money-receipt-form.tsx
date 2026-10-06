"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import type { MoneyReceiptRecord } from "@/lib/money-receipts";
import { MAX_RECEIPT_AMOUNT, type PaymentMode } from "@/lib/money-receipt-constants";
import { formatBdtCurrency, numberToTakaWords } from "@/lib/format-bdt-words";

const INPUT_CLASS =
  "w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 bg-white";
const LABEL_CLASS = "text-xs font-semibold text-ink-700 uppercase tracking-wide";
const CARD_CLASS = "rounded-xl border border-ink-100 bg-white p-4 shadow-sm sm:p-6";

interface MoneyReceiptFormProps {
  receipt?: MoneyReceiptRecord;
  action: (
    state: { error?: string } | undefined,
    formData: FormData
  ) => Promise<{ error?: string } | undefined>;
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

export default function MoneyReceiptForm({ receipt, action }: MoneyReceiptFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const [receivedFrom, setReceivedFrom] = useState(receipt?.receivedFrom ?? "");
  const [amount, setAmount] = useState<number | "">(receipt?.amount ? receipt.amount : "");
  const [onAccountOf, setOnAccountOf] = useState(receipt?.onAccountOf ?? "");
  const [onAccountOf2, setOnAccountOf2] = useState(receipt?.onAccountOf2 ?? "");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(receipt?.paymentMode ?? "cash");
  const [chequeNo, setChequeNo] = useState(receipt?.chequeNo ?? "");
  const [chequeBank, setChequeBank] = useState(receipt?.chequeBank ?? "");
  const [chequeDate, setChequeDate] = useState(receipt?.chequeDate?.split(/[ T]/)[0] ?? "");
  const [note, setNote] = useState(receipt?.note ?? "");

  const amountNumber = amount === "" ? 0 : Math.round(Number(amount));
  const amountTooLarge = amountNumber > MAX_RECEIPT_AMOUNT;
  const showWords = amountNumber > 0 && !amountTooLarge;

  const handleSubmit = () => {
    setServerError(null);
    const formData = new FormData();
    formData.set("receivedFrom", receivedFrom);
    formData.set("amount", String(amountNumber));
    formData.set("onAccountOf", onAccountOf);
    formData.set("onAccountOf2", onAccountOf2);
    formData.set("paymentMode", paymentMode);
    formData.set("chequeNo", chequeNo);
    formData.set("chequeBank", chequeBank);
    formData.set("chequeDate", chequeDate);
    formData.set("note", note);

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

      {/* 1. Received from */}
      <div className={CARD_CLASS}>
        <SectionHeader
          title="Received From"
          hint="Printed after “Received with thanks from”"
          step={1}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={LABEL_CLASS}>Name / Company *</span>
            <input
              type="text"
              required
              maxLength={120}
              value={receivedFrom}
              onChange={(e) => setReceivedFrom(e.target.value)}
              placeholder="e.g. Bashundhara Training and Testing Center"
              className={INPUT_CLASS}
            />
          </label>
        </div>
      </div>

      {/* 2. Amount & purpose */}
      <div className={CARD_CLASS}>
        <SectionHeader title="Amount & Purpose" hint="The sum received and what it is for" step={2} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Amount (Tk) *</span>
            <input
              type="number"
              required
              inputMode="numeric"
              min={1}
              max={MAX_RECEIPT_AMOUNT}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              aria-invalid={amountTooLarge}
              className={`${INPUT_CLASS} text-right tabular-nums ${
                amountTooLarge ? "border-red-400 focus:border-red-500" : ""
              }`}
            />
            {amountTooLarge && (
              <span className="text-xs font-medium text-red-600">
                Too large for a receipt (maximum 99,99,99,999).
              </span>
            )}
          </label>

          <div className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Printed in the Tk. box</span>
            <div className="rounded-md border border-ink-100 bg-ink-50 px-3 py-2 text-right text-sm font-bold tabular-nums text-ink-900">
              {showWords ? formatBdtCurrency(amountNumber) : "-"}
            </div>
          </div>

          <div className="rounded-md border-l-4 border-brand-500 bg-brand-50 p-3 text-xs font-semibold text-brand-900 sm:col-span-2">
            <span className="mr-2 uppercase text-brand-700">A sum of taka:</span>
            {showWords ? numberToTakaWords(amountNumber) : "Enter an amount to see it in words."}
          </div>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={LABEL_CLASS}>On account of (line 1)</span>
            <input
              type="text"
              maxLength={120}
              value={onAccountOf}
              onChange={(e) => setOnAccountOf(e.target.value)}
              placeholder="e.g. Advance payment for 100 kVA Perkins diesel generator"
              className={INPUT_CLASS}
            />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={LABEL_CLASS}>On account of (line 2, optional)</span>
            <input
              type="text"
              maxLength={120}
              value={onAccountOf2}
              onChange={(e) => setOnAccountOf2(e.target.value)}
              placeholder="e.g. Order no. PBB-1234"
              className={INPUT_CLASS}
            />
          </label>
        </div>
      </div>

      {/* 3. Payment */}
      <div className={CARD_CLASS}>
        <SectionHeader title="Mode of Payment" hint="Cash, or cheque with its details" step={3} />
        <div className="mt-4 flex flex-col gap-4">
          <div
            role="radiogroup"
            aria-label="Mode of payment"
            className="flex w-fit rounded-md border border-ink-200 bg-white p-0.5"
          >
            {(["cash", "cheque"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={paymentMode === mode}
                onClick={() => setPaymentMode(mode)}
                className={`rounded px-5 py-1.5 text-sm font-semibold transition-colors ${
                  paymentMode === mode
                    ? "bg-brand-500 text-white"
                    : "text-ink-600 hover:text-ink-900"
                }`}
              >
                {mode === "cash" ? "Cash" : "Cheque"}
              </button>
            ))}
          </div>

          {paymentMode === "cheque" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className={LABEL_CLASS}>Cheque No. *</span>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={LABEL_CLASS}>Drawn on (bank)</span>
                <input
                  type="text"
                  maxLength={150}
                  value={chequeBank}
                  onChange={(e) => setChequeBank(e.target.value)}
                  placeholder="e.g. Brac Bank Ltd, Savar Branch"
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={LABEL_CLASS}>Dated</span>
                <input
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                  className={INPUT_CLASS}
                />
              </label>
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Note (printed on the tear-off stub only)</span>
            <textarea
              rows={2}
              maxLength={120}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional"
              className={INPUT_CLASS}
            />
          </label>
        </div>
      </div>

      {/* Action Footer */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <Link
          href="/dashboard/money-receipts"
          className="text-sm font-semibold text-ink-600 hover:text-ink-900"
        >
          Cancel &amp; return
        </Link>

        <button
          type="submit"
          disabled={isPending || amountTooLarge}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          <Save className="size-4" />
          {isPending ? "Saving..." : receipt ? "Save Changes" : "Create Receipt"}
        </button>
      </div>
    </form>
  );
}

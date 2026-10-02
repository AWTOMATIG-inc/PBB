"use client";

import { formatBdtCurrency } from "@/lib/format-bdt-words";
import type { AdjustmentType } from "@/lib/invoices";

const INPUT_CLASS =
  "w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 bg-white";

/**
 * Optional money adjustment row for the totals box on quotation and invoice
 * forms (discount, VAT, delivery...). With `onTypeChange` the value can be
 * entered as Tk or %; without it the row is a fixed Tk amount.
 * Shows the resulting BDT amount with its sign underneath.
 */
export default function AdjustmentField({
  label,
  type = "amount",
  onTypeChange,
  value,
  onValueChange,
  amount,
  sign,
  error,
}: {
  label: string;
  type?: AdjustmentType;
  onTypeChange?: (type: AdjustmentType) => void;
  value: number | "";
  onValueChange: (value: number | "") => void;
  amount: number;
  sign: "+" | "-";
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-ink-700">
        {label} <span className="text-xs text-ink-400">(optional)</span>
      </span>
      <div className="flex items-center gap-2">
        {onTypeChange ? (
          <div
            role="radiogroup"
            aria-label={`${label} type`}
            className="flex shrink-0 rounded-md border border-ink-200 bg-white p-0.5"
          >
            {(["amount", "percent"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={type === t}
                onClick={() => onTypeChange(t)}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  type === t ? "bg-brand-500 text-white" : "text-ink-600 hover:text-ink-900"
                }`}
              >
                {t === "amount" ? "Tk" : "%"}
              </button>
            ))}
          </div>
        ) : (
          // Same footprint as the Tk/% switch so all inputs line up.
          <div className="flex shrink-0 rounded-md border border-ink-200 bg-white p-0.5">
            <span className="flex-1 rounded bg-ink-100 px-2.5 py-1 text-center text-xs font-semibold text-ink-700">
              Tk
              {/* Invisible "%" keeps the width equal to the Tk/% switch. */}
              <span aria-hidden className="invisible px-2.5">%</span>
            </span>
          </div>
        )}
        <input
          type="number"
          inputMode="decimal"
          min="0"
          max={type === "percent" ? 100 : undefined}
          step="any"
          value={value}
          onChange={(e) => onValueChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="0"
          aria-label={`${label} ${type === "percent" ? "percent" : "amount"}`}
          aria-invalid={Boolean(error)}
          className={`${INPUT_CLASS} text-right tabular-nums ${
            error ? "border-red-400 focus:border-red-500" : ""
          }`}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : amount > 0 ? (
        <p className="text-right text-xs text-ink-500 tabular-nums">
          {sign} {formatBdtCurrency(amount)}
        </p>
      ) : null}
    </div>
  );
}

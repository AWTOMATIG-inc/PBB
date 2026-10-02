"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { INVOICE_STATUSES, type InvoiceStatus } from "@/lib/invoices";
import { updateInvoiceStatusAction } from "@/app/dashboard/(protected)/invoices/actions";

const STATUS_STYLES: Record<InvoiceStatus, { className: string; label: string }> = {
  draft: { className: "bg-ink-100 text-ink-700", label: "Draft" },
  issued: { className: "bg-blue-100 text-blue-800", label: "Issued" },
  paid: { className: "bg-emerald-100 text-emerald-800", label: "Paid" },
  cancelled: { className: "bg-red-100 text-red-800", label: "Cancelled" },
};

/** Status badge that doubles as a dropdown; saves as soon as it changes. */
export default function InvoiceStatusSelect({
  id,
  invoiceNumber,
  status,
}: {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState<InvoiceStatus>(status);
  const style = STATUS_STYLES[value] ?? STATUS_STYLES.draft;

  const handleChange = (next: InvoiceStatus) => {
    const previous = value;
    setValue(next);
    startTransition(async () => {
      const res = await updateInvoiceStatusAction(id, next);
      if (res.error) {
        setValue(previous);
        alert(res.error);
      }
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as InvoiceStatus)}
        aria-label={`Status of ${invoiceNumber}`}
        className={`cursor-pointer appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-wait disabled:opacity-60 ${style.className}`}
      >
        {INVOICE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_STYLES[s].label}
          </option>
        ))}
      </select>
      {isPending ? (
        <Loader2 className="pointer-events-none absolute right-2 size-3 animate-spin" />
      ) : (
        <ChevronDown className="pointer-events-none absolute right-2 size-3" />
      )}
    </div>
  );
}

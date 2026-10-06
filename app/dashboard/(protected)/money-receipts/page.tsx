import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search, HandCoins, Download, Edit3 } from "lucide-react";
import { getAdminSessionToken } from "@/lib/session";
import { listMoneyReceipts } from "@/lib/money-receipts";
import { PAYMENT_MODES } from "@/lib/money-receipt-constants";
import { formatBdtCurrency } from "@/lib/format-bdt-words";
import { formatQuotationDateTime } from "@/lib/format-date";
import DeleteMoneyReceiptButton from "@/components/admin/delete-money-receipt-button";

export const metadata: Metadata = {
  title: "Money Receipts | Admin",
};

const PER_PAGE = 20;

const MODE_LABELS = { cash: "Cash", cheque: "Cheque" } as const;

export default async function AdminMoneyReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; mode?: string }>;
}) {
  const { page: pageParam, q: qParam, mode: modeParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const search = typeof qParam === "string" ? qParam : "";
  const mode = typeof modeParam === "string" ? modeParam : "";

  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const { items, totalPages, totalItems } = await listMoneyReceipts(token, {
    page,
    perPage: PER_PAGE,
    search,
    mode,
  });

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (search) params.set("q", search);
    if (mode) params.set("mode", mode);
    return `/dashboard/money-receipts?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Money Receipts</h1>
          <p className="mt-1 text-sm text-ink-500">{totalItems} {totalItems === 1 ? "receipt" : "receipts"} recorded.</p>
        </div>
        <Link
          href="/dashboard/money-receipts/new"
          className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 shadow-sm"
        >
          <Plus className="size-4" />
          New Receipt
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <form className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex w-full items-center gap-2 rounded-md border border-ink-200 bg-white px-3 py-2 sm:w-auto sm:max-w-sm sm:flex-1">
          <Search className="size-4 shrink-0 text-ink-400" />
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search by receipt # or name..."
            aria-label="Search money receipts"
            className="w-full text-sm text-ink-900 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="mode" className="text-sm font-medium text-ink-600">
            Payment
          </label>
          <select
            id="mode"
            name="mode"
            defaultValue={mode}
            className="rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
          >
            <option value="">All</option>
            {PAYMENT_MODES.map((m) => (
              <option key={m} value={m}>
                {MODE_LABELS[m]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600"
        >
          Filter
        </button>
      </form>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white px-4 py-16 text-center">
          <HandCoins className="size-10 text-ink-300" />
          <p className="mt-3 text-base font-semibold text-ink-800">No money receipts found</p>
          <p className="mt-1 text-sm text-ink-500">
            {search || mode
              ? "Try a different search or payment filter."
              : "Create your first money receipt to get started."}
          </p>
          <Link
            href="/dashboard/money-receipts/new"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
          >
            <Plus className="size-3.5" />
            Create Receipt
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50 text-xs font-semibold uppercase tracking-wider text-ink-600">
                <tr>
                  <th className="py-3.5 pl-4 pr-3">Receipt No</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Received From</th>
                  <th className="py-3.5 px-3 text-center">Payment</th>
                  <th className="py-3.5 px-3 text-right">Amount</th>
                  <th className="py-3.5 pr-4 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {items.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-50/60 transition-colors">
                    <td className="py-3.5 pl-4 pr-3 font-semibold text-ink-900 whitespace-nowrap">
                      {r.receiptNumber}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs font-semibold text-ink-900">
                      {formatQuotationDateTime(r.receiptDate).date}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-ink-900">{r.receivedFrom}</div>
                      {r.onAccountOf && (
                        <div className="max-w-xs truncate text-xs text-ink-500" title={r.onAccountOf}>
                          {r.onAccountOf}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          r.paymentMode === "cheque"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {MODE_LABELS[r.paymentMode] ?? r.paymentMode}
                      </span>
                      {r.paymentMode === "cheque" && r.chequeNo && (
                        <div className="mt-0.5 text-[11px] text-ink-500">No. {r.chequeNo}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-ink-900 tabular-nums whitespace-nowrap">
                      {formatBdtCurrency(r.amount)}
                    </td>
                    <td className="py-3.5 pr-4 pl-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/dashboard/money-receipts/${r.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded border border-ink-200 bg-white px-2 py-1 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600 shadow-2xs"
                          title="Open & download receipt PDF"
                        >
                          <Download className="size-3.5" />
                          PDF
                        </a>
                        <Link
                          href={`/dashboard/money-receipts/${r.id}/edit`}
                          className="inline-flex items-center gap-1 rounded border border-ink-200 bg-white px-2 py-1 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600 shadow-2xs"
                          title="Edit receipt"
                        >
                          <Edit3 className="size-3.5" />
                          Edit
                        </Link>
                        <DeleteMoneyReceiptButton id={r.id} receiptNumber={r.receiptNumber} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-xs text-ink-500">
              <div>
                Page <span className="font-semibold text-ink-900">{page}</span> of{" "}
                <span className="font-semibold text-ink-900">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={pageHref(page - 1)}
                    className="rounded border border-ink-200 px-3 py-1 font-medium hover:border-brand-300 hover:text-brand-600"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={pageHref(page + 1)}
                    className="rounded border border-ink-200 px-3 py-1 font-medium hover:border-brand-300 hover:text-brand-600"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

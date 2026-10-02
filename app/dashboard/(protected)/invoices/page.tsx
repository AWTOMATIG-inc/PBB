import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search, Receipt, Download, Edit3 } from "lucide-react";
import { getAdminSessionToken } from "@/lib/session";
import { listInvoices, INVOICE_STATUSES, type InvoiceStatus } from "@/lib/invoices";
import { formatBdtCurrency } from "@/lib/format-bdt-words";
import { formatQuotationDateTime } from "@/lib/format-date";
import DeleteInvoiceButton from "@/components/admin/delete-invoice-button";
import InvoiceStatusSelect from "@/components/admin/invoice-status-select";

export const metadata: Metadata = {
  title: "Invoices | Admin",
};

const PER_PAGE = 20;

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  paid: "Paid",
  cancelled: "Cancelled",
};

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const { page: pageParam, q: qParam, status: statusParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const search = typeof qParam === "string" ? qParam : "";
  const status = typeof statusParam === "string" ? statusParam : "";

  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const { items, totalPages, totalItems } = await listInvoices(token, {
    page,
    perPage: PER_PAGE,
    search,
    status,
  });

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (search) params.set("q", search);
    if (status) params.set("status", status);
    return `/dashboard/invoices?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Invoices</h1>
          <p className="mt-1 text-sm text-ink-500">{totalItems} invoices recorded.</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 shadow-sm"
        >
          <Plus className="size-4" />
          New Invoice
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
            placeholder="Search by invoice # or customer..."
            aria-label="Search invoices"
            className="w-full text-sm text-ink-900 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="status" className="text-sm font-medium text-ink-600">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
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
          <Receipt className="size-10 text-ink-300" />
          <p className="mt-3 text-base font-semibold text-ink-800">No invoices found</p>
          <p className="mt-1 text-sm text-ink-500">
            {search || status
              ? "Try a different search or status."
              : "Create your first invoice to get started."}
          </p>
          <Link
            href="/dashboard/invoices/new"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
          >
            <Plus className="size-3.5" />
            Create Invoice
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50 text-xs font-semibold uppercase tracking-wider text-ink-600">
                <tr>
                  <th className="py-3.5 pl-4 pr-3">Invoice No</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Customer</th>
                  <th className="py-3.5 px-3 text-center">Items</th>
                  <th className="py-3.5 px-3 text-right">Total</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 pr-4 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {items.map((inv) => {
                  return (
                    <tr key={inv.id} className="hover:bg-ink-50/60 transition-colors">
                      <td className="py-3.5 pl-4 pr-3 font-semibold text-ink-900 whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-xs font-semibold text-ink-900">
                        {formatQuotationDateTime(inv.issuedDate).date}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-ink-900">
                          {inv.companyName || inv.customerName}
                        </div>
                        {inv.companyName && (
                          <div className="text-xs text-ink-500">{inv.customerName}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center text-xs text-ink-700 tabular-nums">
                        {inv.items?.length ?? 0}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-ink-900 tabular-nums whitespace-nowrap">
                        {formatBdtCurrency(inv.total)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <InvoiceStatusSelect
                          key={`${inv.id}-${inv.status}`}
                          id={inv.id}
                          invoiceNumber={inv.invoiceNumber}
                          status={inv.status}
                        />
                      </td>
                      <td className="py-3.5 pr-4 pl-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/api/dashboard/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded border border-ink-200 bg-white px-2 py-1 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600 shadow-2xs"
                            title="Open & Download A4 PDF"
                          >
                            <Download className="size-3.5" />
                            PDF
                          </a>
                          <Link
                            href={`/dashboard/invoices/${inv.id}/edit`}
                            className="inline-flex items-center gap-1 rounded border border-ink-200 bg-white px-2 py-1 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600 shadow-2xs"
                            title="Edit Invoice"
                          >
                            <Edit3 className="size-3.5" />
                            Edit
                          </Link>
                          <DeleteInvoiceButton id={inv.id} invoiceNumber={inv.invoiceNumber} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

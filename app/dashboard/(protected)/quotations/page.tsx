import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search, FileText, Download, Edit3 } from "lucide-react";
import { getAdminSessionToken } from "@/lib/session";
import { listQuotations, type QuotationRecord, type QuotationStatus } from "@/lib/quotations";
import { formatBdtCurrency } from "@/lib/format-bdt-words";
import { formatQuotationDateTime } from "@/lib/format-date";
import ReviseQuotationButton from "@/components/admin/revise-quotation-button";
import DeleteQuotationButton from "@/components/admin/delete-quotation-button";

export const metadata: Metadata = {
  title: "Quotations | Admin | Power Bank Bangladesh",
};

const PER_PAGE = 20;

const STATUS_BADGES: Record<QuotationStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-ink-100", text: "text-ink-700", label: "Draft" },
  finalized: { bg: "bg-blue-100", text: "text-blue-800", label: "Finalized" },
  sent: { bg: "bg-amber-100", text: "text-amber-800", label: "Sent" },
  accepted: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Accepted" },
  rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
  expired: { bg: "bg-ink-100", text: "text-ink-500", label: "Expired" },
};

export default async function AdminQuotationsPage({
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

  const { items, totalPages, totalItems } = await listQuotations(token, {
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
    return `/dashboard/quotations?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Quotations</h1>
          <p className="mt-1 text-sm text-ink-500">
            {totalItems} total commercial quotations recorded.
          </p>
        </div>
        <Link
          href="/dashboard/quotations/new"
          className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 shadow-sm"
        >
          <Plus className="size-4" />
          New Quotation
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <form className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-ink-200 bg-white px-3 py-2 sm:max-w-sm sm:flex-1">
          <Search className="size-4 shrink-0 text-ink-400" />
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search by quote # or client name..."
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
            <option value="draft">Draft</option>
            <option value="finalized">Finalized</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600"
        >
          Filter
        </button>
      </form>

      {/* Quotation Table */}
      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white py-16 text-center">
          <FileText className="size-10 text-ink-300" />
          <p className="mt-3 text-base font-semibold text-ink-800">No quotations found</p>
          <p className="mt-1 text-sm text-ink-500">
            Create your first unified 2-page quotation to get started.
          </p>
          <Link
            href="/dashboard/quotations/new"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
          >
            <Plus className="size-3.5" />
            Create Quotation
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50 text-xs font-semibold uppercase tracking-wider text-ink-600">
                <tr>
                  <th className="py-3.5 pl-4 pr-3">Quotation No</th>
                  <th className="py-3.5 px-3">Date & Time</th>
                  <th className="py-3.5 px-3">Client / Organization</th>
                  <th className="py-3.5 px-3">Quoted Model</th>
                  <th className="py-3.5 px-3 text-right">Grand Total</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 pr-4 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {items.map((q) => {
                  const badge = STATUS_BADGES[q.status] || STATUS_BADGES.draft;
                  const dt = formatQuotationDateTime(q.quotationDate, q.created || q.updated);
                  return (
                    <tr key={q.id} className="hover:bg-ink-50/60 transition-colors">
                      <td className="py-3.5 pl-4 pr-3 font-semibold text-ink-900">
                        <div className="flex items-center gap-2">
                          <span>{q.quotationNumber}</span>
                          {q.revision > 0 && (
                            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-800">
                              R{q.revision}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-ink-900">{dt.date}</span>
                          {dt.time ? (
                            <span className="text-[11px] font-medium text-ink-500">{dt.time}</span>
                          ) : (
                            <span className="text-[11px] text-ink-400">Standard</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-medium text-ink-900">{q.companyName}</div>
                        <div className="text-xs text-ink-500">{q.contactPerson}</div>
                      </td>

                      <td className="py-3.5 px-3 text-xs font-medium text-ink-700">
                        {q.technicalSpecs?.generatorModel ||
                          q.technicalSpecs?.generatorBrand ||
                          "Custom Set"}
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-ink-900 tabular-nums">
                        {formatBdtCurrency(q.grandTotal)}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 pr-4 pl-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/api/dashboard/quotations/${q.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded border border-ink-200 bg-white px-2 py-1 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600 shadow-2xs"
                            title="Open & Download 2-Page A4 PDF"
                          >
                            <Download className="size-3.5" />
                            PDF
                          </a>

                          <Link
                            href={`/dashboard/quotations/${q.id}/edit`}
                            className="inline-flex items-center gap-1 rounded border border-ink-200 bg-white px-2 py-1 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600 shadow-2xs"
                            title="Edit Quotation"
                          >
                            <Edit3 className="size-3.5" />
                            Edit
                          </Link>

                          {q.status === "finalized" && (
                            <ReviseQuotationButton id={q.id} />
                          )}

                          <DeleteQuotationButton id={q.id} quotationNumber={q.quotationNumber} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

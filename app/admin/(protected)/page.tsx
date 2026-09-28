import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Handshake,
  Home,
  Package,
  SlidersHorizontal,
  Plus,
  ChevronRight,
  ExternalLink,
  Download,
  Edit3,
  Sparkles,
} from "lucide-react";
import { verifyAdminSession } from "@/lib/auth";
import { getAdminSessionToken } from "@/lib/session";
import { listQuotations, type QuotationRecord, type QuotationStatus } from "@/lib/quotations";
import { listProducts, listBrands, listClients } from "@/lib/products";
import { formatBdtCurrency } from "@/lib/format-bdt-words";
import { formatQuotationDateTime } from "@/lib/format-date";

export const metadata: Metadata = {
  title: "Dashboard | Admin | Power Bank Bangladesh",
};

const STATUS_BADGES: Record<QuotationStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-ink-100", text: "text-ink-700", label: "Draft" },
  finalized: { bg: "bg-blue-100", text: "text-blue-800", label: "Finalized" },
  sent: { bg: "bg-amber-100", text: "text-amber-800", label: "Sent" },
  accepted: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Accepted" },
  rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
  expired: { bg: "bg-ink-100", text: "text-ink-500", label: "Expired" },
};

export default async function AdminDashboardPage() {
  const admin = await verifyAdminSession();
  const token = await getAdminSessionToken();

  let totalQuotations = 0;
  let recentQuotations: QuotationRecord[] = [];
  let totalProducts = 0;
  let totalBrands = 0;
  let totalClients = 0;

  if (token) {
    try {
      const qRes = await listQuotations(token, { page: 1, perPage: 8 });
      recentQuotations = qRes.items;
      totalQuotations = qRes.totalItems;
    } catch {
      // quotations collection fallback
    }

    try {
      const pRes = await listProducts(token, { page: 1, perPage: 1 });
      totalProducts = pRes.totalItems;
    } catch {
      // products collection fallback
    }

    try {
      const brands = await listBrands(token);
      totalBrands = brands.length;
    } catch {
      // brands fallback
    }

    try {
      const clients = await listClients(token);
      totalClients = clients.length;
    } catch {
      // clients fallback
    }
  }

  const username = admin.email ? admin.email.split("@")[0] : "Admin";

  return (
    <div className="space-y-8">
      {/* ============================================================== */}
      {/* DASHBOARD HEADER & QUICK ACTIONS                               */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              Dashboard Overview
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink-700 shadow-xs transition hover:bg-ink-50 hover:text-ink-900"
          >
            <Plus className="size-4 text-ink-500" />
            Add Product
          </Link>
          <Link
            href="/admin/quotations/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-600"
          >
            <Plus className="size-4" />
            New Quotation
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STATS METRIC CARDS (4-COL RESPONSIVE GRID)                     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Quotations */}
        <Link
          href="/admin/quotations"
          className="group relative flex flex-col justify-between rounded-xl border border-ink-100 bg-white p-5 shadow-xs transition-all hover:border-brand-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Quotations
            </span>
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
              <FileText className="size-4.5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-ink-900">
              {totalQuotations}
            </div>
            <p className="mt-0.5 text-xs text-ink-500">Customer offers & proposals</p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:text-brand-700">
            <span>View quotations</span>
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Metric 2: Catalog Products */}
        <Link
          href="/admin/products"
          className="group relative flex flex-col justify-between rounded-xl border border-ink-100 bg-white p-5 shadow-xs transition-all hover:border-brand-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Products
            </span>
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
              <Package className="size-4.5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-ink-900">
              {totalProducts}
            </div>
            <p className="mt-0.5 text-xs text-ink-500">Active generator units</p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:text-brand-700">
            <span>Manage products</span>
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Metric 3: Brands & Filters */}
        <Link
          href="/admin/filters"
          className="group relative flex flex-col justify-between rounded-xl border border-ink-100 bg-white p-5 shadow-xs transition-all hover:border-brand-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Brands & Filters
            </span>
            <span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
              <SlidersHorizontal className="size-4.5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-ink-900">
              {totalBrands}
            </div>
            <p className="mt-0.5 text-xs text-ink-500">Engine brands & power bands</p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:text-brand-700">
            <span>Manage filters</span>
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Metric 4: Clients */}
        <Link
          href="/admin/clients"
          className="group relative flex flex-col justify-between rounded-xl border border-ink-100 bg-white p-5 shadow-xs transition-all hover:border-brand-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Client Partners
            </span>
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
              <Handshake className="size-4.5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-ink-900">
              {totalClients}
            </div>
            <p className="mt-0.5 text-xs text-ink-500">Trust marquee showcase</p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:text-brand-700">
            <span>Partner logos</span>
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>

      {/* ============================================================== */}
      {/* RECENT QUOTATIONS (FULL-WIDTH MODERN CARD)                      */}
      {/* ============================================================== */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-ink-900">Recent Quotations</h2>
            <p className="text-xs text-ink-500">
              Latest customer quotes and generated proposals
            </p>
          </div>
          <Link
            href="/admin/quotations"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View all ({totalQuotations})</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {recentQuotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
              <FileText className="size-6" />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-ink-900">No quotations found</h3>
            <p className="mt-1 text-xs text-ink-500 max-w-sm">
              Generate standardized 2-page customer quotations with live pricing, technical
              specs, and PDF downloads.
            </p>
            <Link
              href="/admin/quotations/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-600"
            >
              <Plus className="size-3.5" />
              Create First Quotation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-100 bg-ink-50/50 text-ink-500">
                <tr>
                  <th className="py-3.5 pl-6 pr-3 font-semibold">Quote #</th>
                  <th className="py-3.5 px-4 font-semibold">Customer / Company</th>
                  <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Grand Total</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 pr-6 pl-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {recentQuotations.map((q) => {
                  const badge = STATUS_BADGES[q.status] || STATUS_BADGES.draft;
                  const dt = formatQuotationDateTime(q.quotationDate, q.created || q.updated);
                  return (
                    <tr key={q.id} className="hover:bg-ink-50/50 transition-colors">
                      <td className="py-3.5 pl-6 pr-3 font-semibold text-ink-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{q.quotationNumber}</span>
                          {q.revision > 0 && (
                            <span className="rounded bg-brand-100 px-1 py-0.2 text-[9px] font-bold text-brand-800">
                              R{q.revision}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="truncate font-medium text-ink-900" title={q.companyName}>
                          {q.companyName}
                        </div>
                        {q.contactPerson && (
                          <div
                            className="truncate text-[11px] text-ink-500"
                            title={q.contactPerson}
                          >
                            {q.contactPerson}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-[11px] font-semibold text-ink-900">{dt.date}</div>
                        {dt.time && <div className="text-[10px] text-ink-500">{dt.time}</div>}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-ink-900 whitespace-nowrap">
                        {formatBdtCurrency(q.grandTotal)}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 pr-6 pl-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/api/admin/quotations/${q.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-700 shadow-2xs hover:border-brand-300 hover:text-brand-600"
                            title="Open PDF"
                          >
                            <Download className="size-3" />
                            PDF
                          </a>
                          <Link
                            href={`/admin/quotations/${q.id}/edit`}
                            className="inline-flex items-center gap-1 rounded border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-700 shadow-2xs hover:border-brand-300 hover:text-brand-600"
                            title="Edit"
                          >
                            <Edit3 className="size-3" />
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

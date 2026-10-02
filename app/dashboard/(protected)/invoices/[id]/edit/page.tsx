import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getAdminSessionToken } from "@/lib/session";
import { getInvoice, listInvoiceCatalog } from "@/lib/invoices";
import InvoiceForm from "@/components/admin/invoice-form";
import { formatQuotationDateTime } from "@/lib/format-date";
import { updateInvoiceAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Invoice | Admin",
};

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const [invoice, catalog] = await Promise.all([
    getInvoice(token, id),
    listInvoiceCatalog(token),
  ]);

  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to invoices
        </Link>
      </div>

      <div className="mt-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-ink-900">Edit Invoice {invoice.invoiceNumber}</h1>
          <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700 uppercase">
            {invoice.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-500">
          Billed to{" "}
          <span className="font-semibold text-ink-700">
            {invoice.companyName || invoice.customerName}
          </span>{" "}
          on {formatQuotationDateTime(invoice.issuedDate).date}. Change the status from the
          invoices table.
        </p>
      </div>

      <InvoiceForm
        invoice={invoice}
        catalog={catalog}
        action={updateInvoiceAction.bind(null, invoice.id)}
      />
    </div>
  );
}

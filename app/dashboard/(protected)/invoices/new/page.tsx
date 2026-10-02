import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getAdminSessionToken } from "@/lib/session";
import { listInvoiceCatalog } from "@/lib/invoices";
import InvoiceForm from "@/components/admin/invoice-form";
import { createInvoiceAction } from "../actions";

export const metadata: Metadata = {
  title: "New Invoice | Admin",
};

export default async function NewInvoicePage() {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const catalog = await listInvoiceCatalog(token);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/dashboard/invoices"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to invoices
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Create Invoice</h1>
        <p className="mt-1 text-sm text-ink-500">
          Add the customer and items. The invoice is dated today, numbered automatically and
          saved as a draft. Change its status later from the invoices table.
        </p>
      </div>

      <InvoiceForm catalog={catalog} action={createInvoiceAction} />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getAdminSessionToken } from "@/lib/session";
import { getQuotation } from "@/lib/quotations";
import { listProducts } from "@/lib/products";
import QuotationForm from "@/components/admin/quotation-form";
import { updateQuotationAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Quotation | Admin | Power Bank Bangladesh",
};

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const [quotation, { items: products }] = await Promise.all([
    getQuotation(token, id),
    listProducts(token, { perPage: 200, sort: "brand" }),
  ]);

  if (!quotation) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/quotations"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to quotations
        </Link>

        <a
          href={`/api/admin/quotations/${quotation.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 shadow-sm transition-colors hover:bg-ink-50"
        >
          <Download className="size-3.5 text-ink-500" />
          Download / Preview PDF
        </a>
      </div>

      <div className="mt-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-ink-900">
            Edit Quotation {quotation.quotationNumber}
          </h1>
          <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700 uppercase">
            {quotation.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-500">
          Prepared for <span className="font-semibold text-ink-700">{quotation.companyName}</span> ({quotation.contactPerson})
        </p>
      </div>

      <QuotationForm
        products={products}
        quotation={quotation}
        action={updateQuotationAction.bind(null, quotation.id)}
      />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getAdminSessionToken } from "@/lib/session";
import { listProducts } from "@/lib/products";
import QuotationForm from "@/components/admin/quotation-form";
import { createQuotationAction } from "../actions";

export const metadata: Metadata = {
  title: "New Quotation | Admin | Power Bank Bangladesh",
};

export default async function NewQuotationPage() {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const { items: products } = await listProducts(token, {
    perPage: 200,
    sort: "brand",
  });

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/dashboard/quotations"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to quotations
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Create Quotation</h1>
        <p className="mt-1 text-sm text-ink-500">
          Prepare a formal 2-page commercial diesel generator quotation with BDT currency in words and A4 print standard.
        </p>
      </div>

      <QuotationForm products={products} action={createQuotationAction} />
    </div>
  );
}

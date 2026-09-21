import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getAdminSessionToken } from "@/lib/session";
import { listBrands, listPowerBands } from "@/lib/products";
import ProductForm from "@/components/admin/product-form";
import { createProductAction } from "../actions";

export const metadata: Metadata = {
  title: "New Product | Admin | Power Bank Bangladesh",
};

export default async function NewProductPage() {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const [brands, powerBands] = await Promise.all([listBrands(token), listPowerBands(token)]);

  return (
    <div>
      <Link
        href="/admin/products"
        className="flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-ink-900">New product</h1>

      <div className="mt-6 max-w-3xl rounded-lg border border-ink-100 bg-white p-6">
        <ProductForm
          brands={brands}
          powerBands={powerBands}
          action={createProductAction}
          submitLabel="Create product"
        />
      </div>
    </div>
  );
}

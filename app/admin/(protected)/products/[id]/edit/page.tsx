import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getAdminSessionToken } from "@/lib/session";
import {
  getProduct,
  listBrands,
  listOptions,
  listPowerBands,
  productImageUrl,
} from "@/lib/products";
import ProductForm from "@/components/admin/product-form";
import DeleteProductButton from "@/components/admin/delete-product-button";
import { updateProductAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Product | Admin | Power Bank Bangladesh",
};

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;

  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const [product, brands, powerBands, alternatorMakes, controllers] = await Promise.all([
    getProduct(token, id),
    listBrands(token),
    listPowerBands(token),
    listOptions(token, "alternator_makes"),
    listOptions(token, "controllers"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/products"
          className="flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
        <DeleteProductButton id={product.id} model={product.model} redirectTo="/admin/products" />
      </div>

      <h1 className="mt-4 text-2xl font-bold text-ink-900">Edit {product.model}</h1>

      <div className="mt-6 max-w-3xl rounded-lg border border-ink-100 bg-white p-6">
        <ProductForm
          brands={brands}
          powerBands={powerBands}
          alternatorMakes={alternatorMakes}
          controllers={controllers}
          product={product}
          currentImageUrl={productImageUrl(product)}
          action={updateProductAction.bind(null, product.id)}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}

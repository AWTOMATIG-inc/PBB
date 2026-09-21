import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search, SquarePen } from "lucide-react";
import { getAdminSessionToken } from "@/lib/session";
import { listProducts, productImageUrl, type ProductSort } from "@/lib/products";
import DeleteProductButton from "@/components/admin/delete-product-button";

export const metadata: Metadata = {
  title: "Products | Admin | Power Bank Bangladesh",
};

const PER_PAGE = 20;

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "model", label: "Model (A–Z)" },
  { value: "brand", label: "Brand (A–Z)" },
];
const SORT_VALUES = SORT_OPTIONS.map((o) => o.value);

function isProductSort(value: unknown): value is ProductSort {
  return typeof value === "string" && (SORT_VALUES as string[]).includes(value);
}

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const { page: pageParam, q: qParam, sort: sortParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const search = typeof qParam === "string" ? qParam : "";
  const sort: ProductSort = isProductSort(sortParam) ? sortParam : "newest";

  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");
  const { items, totalPages, totalItems } = await listProducts(token, {
    page,
    perPage: PER_PAGE,
    search,
    sort,
  });

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (search) params.set("q", search);
    if (sort !== "newest") params.set("sort", sort);
    return `/admin/products?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Products</h1>
          <p className="mt-1 text-sm text-ink-500">{totalItems} generator models.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="size-4" />
          New product
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-ink-200 px-3 py-2.5 sm:max-w-sm sm:flex-1">
          <Search className="size-4 shrink-0 text-ink-400" />
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search by model..."
            className="w-full text-sm text-ink-900 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-ink-500">
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="rounded-md border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600"
        >
          Apply
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-ink-100 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Power band</th>
              <th className="px-4 py-3">Standby kVA</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => {
              const imageUrl = productImageUrl(product);
              return (
                <tr key={product.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={product.model}
                          className="size-10 shrink-0 rounded-md border border-ink-100 object-cover"
                        />
                      ) : (
                        <div className="size-10 shrink-0 rounded-md border border-dashed border-ink-200" />
                      )}
                      <span className="font-medium text-ink-900">{product.model}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {product.expand?.brand?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {product.expand?.powerBand?.label ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{product.standbyKva ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-ink-100 text-ink-500"
                      }`}
                    >
                      {product.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        title="Edit product"
                        className="rounded-md p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
                      >
                        <SquarePen className="size-4" />
                      </Link>
                      <DeleteProductButton id={product.id} model={product.model} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                p === page
                  ? "bg-brand-500 text-white"
                  : "text-ink-500 hover:bg-ink-100 hover:text-ink-900"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

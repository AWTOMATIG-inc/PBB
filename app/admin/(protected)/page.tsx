import type { Metadata } from "next";
import Link from "next/link";
import { Home, Package, SlidersHorizontal } from "lucide-react";
import { verifyAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin | Power Bank Bangladesh",
};

export default async function AdminDashboardPage() {
  const admin = await verifyAdminSession();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
      <p className="mt-2 text-ink-500">Signed in as {admin.email}.</p>

      <div className="mt-8 flex flex-col gap-4 sm:max-w-sm">
        <Link
          href="/admin/products"
          className="flex items-center gap-4 rounded-lg border border-ink-100 bg-white p-6 transition-colors hover:border-brand-200"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <Package className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-ink-900">Products</span>
            <span className="block text-sm text-ink-500">
              Manage the generator catalog: create, edit, and remove models.
            </span>
          </span>
        </Link>

        <Link
          href="/admin/filters"
          className="flex items-center gap-4 rounded-lg border border-ink-100 bg-white p-6 transition-colors hover:border-brand-200"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <SlidersHorizontal className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-ink-900">Filters</span>
            <span className="block text-sm text-ink-500">
              Manage brands and kVA power bands used by the Products filters.
            </span>
          </span>
        </Link>

        <Link
          href="/admin/home"
          className="flex items-center gap-4 rounded-lg border border-ink-100 bg-white p-6 transition-colors hover:border-brand-200"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <Home className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-ink-900">Home Page</span>
            <span className="block text-sm text-ink-500">
              Choose and order the New Products and Featured Models sections.
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}

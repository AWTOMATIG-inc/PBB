"use client";

import { useState } from "react";
import { Plus, SquarePen } from "lucide-react";
import type { BrandRecord } from "@/lib/products";
import {
  createBrandAction,
  deleteBrandAction,
  updateBrandAction,
} from "@/app/admin/(protected)/filters/actions";
import BrandForm from "./brand-form";
import DeleteFilterButton from "./delete-filter-button";

export default function BrandsManager({
  brands,
  logoUrls,
}: {
  brands: BrandRecord[];
  logoUrls: Record<string, string | null>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addKey, setAddKey] = useState(0);

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">Brands</h2>
          <p className="mt-1 text-sm text-ink-500">{brands.length} brands.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="size-4" />
          {showAdd ? "Cancel" : "New brand"}
        </button>
      </div>

      {showAdd && (
        <div className="mt-4 rounded-lg border border-ink-100 bg-white p-4">
          <BrandForm
            key={addKey}
            action={createBrandAction}
            submitLabel="Add brand"
            onSuccess={() => {
              setAddKey((k) => k + 1);
              setShowAdd(false);
            }}
          />
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border border-ink-100 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Sort order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) =>
              editingId === brand.id ? (
                <tr key={brand.id} className="border-b border-ink-100 last:border-0">
                  <td colSpan={4} className="px-4 py-4">
                    <BrandForm
                      brand={brand}
                      currentLogoUrl={logoUrls[brand.id]}
                      action={updateBrandAction.bind(null, brand.id)}
                      submitLabel="Save changes"
                      onSuccess={() => setEditingId(null)}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={brand.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {logoUrls[brand.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoUrls[brand.id]!}
                          alt={brand.name}
                          className="size-10 shrink-0 rounded-md border border-ink-100 bg-white object-contain"
                        />
                      ) : (
                        <div className="size-10 shrink-0 rounded-md border border-dashed border-ink-200" />
                      )}
                      <span className="font-medium text-ink-900">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{brand.slug}</td>
                  <td className="px-4 py-3 text-ink-600">{brand.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(brand.id)}
                        title="Edit brand"
                        className="rounded-md p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
                      >
                        <SquarePen className="size-4" />
                      </button>
                      <DeleteFilterButton
                        label={brand.name}
                        onDelete={() => deleteBrandAction(brand.id)}
                      />
                    </div>
                  </td>
                </tr>
              )
            )}
            {brands.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-400">
                  No brands yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

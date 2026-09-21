"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import type { HomePlacementRecord, HomeSection, ProductRecord } from "@/lib/products";
import { HOME_SECTION_LIMITS } from "@/lib/home-section-limits";
import {
  addHomePlacementAction,
  deleteHomePlacementAction,
  moveHomePlacementAction,
} from "@/app/admin/(protected)/home/actions";
import DeleteFilterButton from "./delete-filter-button";

export default function HomePlacementManager({
  section,
  title,
  description,
  placements,
  productsById,
  availableProducts,
  imageUrls,
}: {
  section: HomeSection;
  title: string;
  description: string;
  placements: HomePlacementRecord[];
  productsById: Record<string, ProductRecord>;
  availableProducts: ProductRecord[];
  imageUrls: Record<string, string | null>;
}) {
  const addAction = addHomePlacementAction.bind(null, section);
  const [state, formAction, pending] = useActionState(addAction, undefined);
  const wasPending = useRef(false);
  const [addKey, setAddKey] = useState(0);

  const limit = HOME_SECTION_LIMITS[section];
  const atLimit = placements.length >= limit;

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) setAddKey((k) => k + 1);
    wasPending.current = pending;
  }, [pending, state]);

  const [isMoving, startMoving] = useTransition();
  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  function move(id: string, direction: "up" | "down") {
    setMoveError(null);
    setMovingId(id);
    startMoving(async () => {
      try {
        await moveHomePlacementAction(section, id, direction);
      } catch (err) {
        setMoveError(err instanceof Error ? err.message : "Failed to reorder.");
      } finally {
        setMovingId(null);
      }
    });
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            atLimit ? "bg-amber-50 text-amber-700" : "bg-ink-100 text-ink-600"
          }`}
        >
          {placements.length} / {limit} used
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-ink-100 bg-white">
        <ul>
          {placements.map((placement, index) => {
            const product = productsById[placement.product];
            const rowMoving = isMoving && movingId === placement.id;
            return (
              <li
                key={placement.id}
                className="flex items-center gap-4 border-b border-ink-100 px-4 py-3 last:border-0"
              >
                <span className="w-6 shrink-0 text-sm font-medium text-ink-400">{index + 1}</span>
                {imageUrls[placement.product] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrls[placement.product]!}
                    alt={product?.model ?? "Product"}
                    className="size-10 shrink-0 rounded-md border border-ink-100 bg-white object-contain"
                  />
                ) : (
                  <div className="size-10 shrink-0 rounded-md border border-dashed border-ink-200" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">
                    {product ? product.model : "Unknown product"}
                  </p>
                  <p className="truncate text-sm text-ink-500">
                    {product?.expand?.brand?.name ?? "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0 || rowMoving}
                    onClick={() => move(placement.id, "up")}
                    title="Move up"
                    className="rounded-md p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === placements.length - 1 || rowMoving}
                    onClick={() => move(placement.id, "down")}
                    title="Move down"
                    className="rounded-md p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <DeleteFilterButton
                    label={product?.model ?? "this placement"}
                    onDelete={() => deleteHomePlacementAction(placement.id)}
                  />
                </div>
              </li>
            );
          })}
          {placements.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-ink-400">
              No products placed in this section yet.
            </li>
          )}
        </ul>
      </div>
      {moveError && <p className="mt-2 text-sm text-red-600">{moveError}</p>}

      {atLimit ? (
        <p className="mt-4 text-sm text-ink-400">
          This section is limited to {limit} products. Remove one below to add another.
        </p>
      ) : (
        <>
          <form key={addKey} action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`add-${section}`} className="text-sm font-medium text-ink-700">
                Add a product
              </label>
              <select
                id={`add-${section}`}
                name="product"
                required
                defaultValue=""
                disabled={availableProducts.length === 0}
                className="min-w-[280px] rounded-md border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="" disabled>
                  Choose a product…
                </option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.expand?.brand?.name ?? "—"} — {product.model}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={pending || availableProducts.length === 0}
              className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="size-4" />
              {pending ? "Adding..." : "Add"}
            </button>
          </form>
          {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
          {availableProducts.length === 0 && (
            <p className="mt-2 text-sm text-ink-400">
              All active products are already placed in this section.
            </p>
          )}
        </>
      )}
    </section>
  );
}

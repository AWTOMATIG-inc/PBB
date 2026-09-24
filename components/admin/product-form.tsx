"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ProductFormState } from "@/app/admin/(protected)/products/actions";
import type {
  BrandRecord,
  OptionListRecord,
  PowerBandRecord,
  ProductRecord,
} from "@/lib/products";

const INPUT_CLASS =
  "w-full rounded-md border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500";
const LABEL_CLASS = "text-sm font-medium text-ink-700";

export default function ProductForm({
  brands,
  powerBands,
  alternatorMakes,
  controllers,
  action,
  product,
  currentImageUrl,
  submitLabel = "Save product",
}: {
  brands: BrandRecord[];
  powerBands: PowerBandRecord[];
  alternatorMakes: OptionListRecord[];
  controllers: OptionListRecord[];
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  product?: ProductRecord;
  currentImageUrl?: string | null;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const specsText = product?.specs ? JSON.stringify(product.specs, null, 2) : "";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="brand" className={LABEL_CLASS}>
            Brand
          </label>
          <select
            id="brand"
            name="brand"
            required
            defaultValue={product?.brand ?? ""}
            className={INPUT_CLASS}
          >
            <option value="" disabled>
              Select a brand
            </option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="model" className={LABEL_CLASS}>
            Model
          </label>
          <input
            id="model"
            name="model"
            type="text"
            required
            maxLength={150}
            defaultValue={product?.model ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="powerBand" className={LABEL_CLASS}>
            Power band
          </label>
          <select
            id="powerBand"
            name="powerBand"
            required
            defaultValue={product?.powerBand ?? ""}
            className={INPUT_CLASS}
          >
            <option value="" disabled>
              Select a power band
            </option>
            {powerBands.map((band) => (
              <option key={band.id} value={band.id}>
                {band.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2 pb-2.5">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={product ? product.isActive : true}
            className="size-4 accent-brand-500"
          />
          <label htmlFor="isActive" className={LABEL_CLASS}>
            Active (visible on the public site)
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="standbyKva" className={LABEL_CLASS}>
            Standby kVA
          </label>
          <input
            id="standbyKva"
            name="standbyKva"
            type="number"
            step="any"
            min={0}
            defaultValue={product?.standbyKva ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="primeKva" className={LABEL_CLASS}>
            Prime kVA
          </label>
          <input
            id="primeKva"
            name="primeKva"
            type="number"
            step="any"
            min={0}
            defaultValue={product?.primeKva ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="engineModel" className={LABEL_CLASS}>
            Engine model
          </label>
          <input
            id="engineModel"
            name="engineModel"
            type="text"
            maxLength={150}
            defaultValue={product?.engineModel ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="alternator" className={LABEL_CLASS}>
            Alternator part no.
          </label>
          <input
            id="alternator"
            name="alternator"
            type="text"
            maxLength={150}
            placeholder="e.g. UCI224E"
            defaultValue={product?.alternator ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="alternatorMake" className={LABEL_CLASS}>
            Alternator make
          </label>
          <select
            id="alternatorMake"
            name="alternatorMake"
            defaultValue={product?.alternatorMake ?? ""}
            className={INPUT_CLASS}
          >
            <option value="">Not listed</option>
            {alternatorMakes.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="controller" className={LABEL_CLASS}>
            Controller
          </label>
          <select
            id="controller"
            name="controller"
            defaultValue={product?.controller ?? ""}
            className={INPUT_CLASS}
          >
            <option value="">Not listed</option>
            {controllers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-ink-400">
            Add new makes and controllers under{" "}
            <Link href="/admin/filters" className="font-medium text-brand-600 hover:underline">
              Filters
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="fuelTank" className={LABEL_CLASS}>
            Fuel tank (L)
          </label>
          <input
            id="fuelTank"
            name="fuelTank"
            type="text"
            inputMode="decimal"
            pattern="\d+(\.\d+)?(-\d+(\.\d+)?)?"
            title="A number or a range, e.g. 160 or 70-160"
            placeholder="e.g. 160 or 70-160"
            maxLength={20}
            defaultValue={product?.fuelTank ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="weightKg" className={LABEL_CLASS}>
            Weight (kg)
          </label>
          <input
            id="weightKg"
            name="weightKg"
            type="number"
            step="any"
            min={0}
            defaultValue={product?.weightKg ?? ""}
            className={INPUT_CLASS}
          />
        </div>

      </div>

      <fieldset className="flex flex-col gap-4 rounded-md border border-ink-100 p-4">
        <legend className="px-1 text-sm font-semibold text-ink-900">Pricing (optional)</legend>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="price" className={LABEL_CLASS}>
              Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="any"
              min={0}
              defaultValue={product?.price || ""}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="currency" className={LABEL_CLASS}>
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue={product?.currency || "BDT"}
              className={INPUT_CLASS}
            >
              <option value="BDT">BDT</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="showPrice"
            name="showPrice"
            type="checkbox"
            defaultChecked={product?.showPrice ?? false}
            className="size-4 accent-brand-500"
          />
          <label htmlFor="showPrice" className={LABEL_CLASS}>
            Show price on the public site
          </label>
        </div>
        <p className="text-xs text-ink-400">
          When unchecked or empty, the price is hidden and visitors see &quot;Request
          Quotation&quot; instead.
        </p>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className={LABEL_CLASS}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          maxLength={500}
          defaultValue={product?.notes ?? ""}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="specs" className={LABEL_CLASS}>
          Full specs (JSON)
        </label>
        <textarea
          id="specs"
          name="specs"
          rows={8}
          defaultValue={specsText}
          placeholder="{}"
          className={`${INPUT_CLASS} font-mono text-xs`}
        />
        <p className="text-xs text-ink-400">
          Brand-specific spec columns from the original catalog, as key/value JSON.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>Image</span>
        {currentImageUrl && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImageUrl}
              alt={product?.model ?? "Current product image"}
              className="h-20 w-20 rounded-md border border-ink-100 object-cover"
            />
            <label className="flex items-center gap-2 text-sm text-ink-500">
              <input type="checkbox" name="removeImage" className="size-4 accent-brand-500" />
              Remove current image
            </label>
          </div>
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/png,image/webp,image/jpeg"
          className="text-sm text-ink-700 file:mr-3 file:rounded-md file:border-0 file:bg-ink-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink-700 hover:file:bg-ink-200"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

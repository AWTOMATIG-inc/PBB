"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FilterFormState } from "@/app/admin/(protected)/filters/actions";
import type { BrandRecord } from "@/lib/products";

const INPUT_CLASS =
  "w-full rounded-md border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500";
const LABEL_CLASS = "text-sm font-medium text-ink-700";

type BrandAction = (state: FilterFormState, formData: FormData) => Promise<FilterFormState>;

export default function BrandForm({
  action,
  brand,
  currentLogoUrl,
  submitLabel = "Save",
  onSuccess,
  onCancel,
}: {
  action: BrandAction;
  brand?: BrandRecord;
  currentLogoUrl?: string | null;
  submitLabel?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const wasPending = useRef(false);
  const fieldId = brand?.id ?? "new";

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) onSuccess?.();
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`name-${fieldId}`} className={LABEL_CLASS}>
            Name
          </label>
          <input
            id={`name-${fieldId}`}
            name="name"
            type="text"
            required
            maxLength={100}
            defaultValue={brand?.name ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`slug-${fieldId}`} className={LABEL_CLASS}>
            Slug
          </label>
          <input
            id={`slug-${fieldId}`}
            name="slug"
            type="text"
            required
            maxLength={100}
            defaultValue={brand?.slug ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`sortOrder-${fieldId}`} className={LABEL_CLASS}>
            Sort order
          </label>
          <input
            id={`sortOrder-${fieldId}`}
            name="sortOrder"
            type="number"
            step="1"
            defaultValue={brand?.sortOrder ?? 0}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>Logo</span>
        {currentLogoUrl && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentLogoUrl}
              alt={brand?.name ?? "Current logo"}
              className="h-12 w-12 rounded-md border border-ink-100 bg-white object-contain"
            />
            <label className="flex items-center gap-2 text-sm text-ink-500">
              <input type="checkbox" name="removeLogo" className="size-4 accent-brand-500" />
              Remove current logo
            </label>
          </div>
        )}
        <input
          name="logo"
          type="file"
          accept="image/png,image/webp,image/jpeg,image/svg+xml"
          className="text-sm text-ink-700 file:mr-3 file:rounded-md file:border-0 file:bg-ink-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink-700 hover:file:bg-ink-200"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-ink-500 hover:text-ink-900"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FilterFormState } from "@/app/admin/(protected)/filters/actions";
import type { PowerBandRecord } from "@/lib/products";

const INPUT_CLASS =
  "w-full rounded-md border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500";
const LABEL_CLASS = "text-sm font-medium text-ink-700";

type PowerBandAction = (state: FilterFormState, formData: FormData) => Promise<FilterFormState>;

export default function PowerBandForm({
  action,
  powerBand,
  submitLabel = "Save",
  onSuccess,
  onCancel,
}: {
  action: PowerBandAction;
  powerBand?: PowerBandRecord;
  submitLabel?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const wasPending = useRef(false);
  const fieldId = powerBand?.id ?? "new";

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) onSuccess?.();
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`label-${fieldId}`} className={LABEL_CLASS}>
            Label
          </label>
          <input
            id={`label-${fieldId}`}
            name="label"
            type="text"
            required
            maxLength={100}
            placeholder="e.g. Medium (50-149 kVA)"
            defaultValue={powerBand?.label ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`value-${fieldId}`} className={LABEL_CLASS}>
            Value
          </label>
          <input
            id={`value-${fieldId}`}
            name="value"
            type="text"
            required
            maxLength={50}
            placeholder="e.g. medium"
            defaultValue={powerBand?.value ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`minKva-${fieldId}`} className={LABEL_CLASS}>
            Min kVA
          </label>
          <input
            id={`minKva-${fieldId}`}
            name="minKva"
            type="number"
            step="any"
            min={0}
            defaultValue={powerBand?.minKva ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`maxKva-${fieldId}`} className={LABEL_CLASS}>
            Max kVA
          </label>
          <input
            id={`maxKva-${fieldId}`}
            name="maxKva"
            type="number"
            step="any"
            min={0}
            defaultValue={powerBand?.maxKva ?? ""}
            placeholder="Leave blank for no upper limit"
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
            defaultValue={powerBand?.sortOrder ?? 0}
            className={INPUT_CLASS}
          />
        </div>
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

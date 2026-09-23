"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ClientFormState } from "@/app/admin/(protected)/clients/actions";
import type { ClientRecord } from "@/lib/products";

const INPUT_CLASS =
  "w-full rounded-md border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500";
const LABEL_CLASS = "text-sm font-medium text-ink-700";

type ClientAction = (state: ClientFormState, formData: FormData) => Promise<ClientFormState>;

export default function ClientForm({
  action,
  client,
  currentLogoUrl,
  submitLabel = "Save",
  onSuccess,
  onCancel,
}: {
  action: ClientAction;
  client?: ClientRecord;
  currentLogoUrl?: string | null;
  submitLabel?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const wasPending = useRef(false);
  const fieldId = client?.id ?? "new";

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) onSuccess?.();
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`name-${fieldId}`} className={LABEL_CLASS}>
            Client name
          </label>
          <input
            id={`name-${fieldId}`}
            name="name"
            type="text"
            required
            maxLength={150}
            defaultValue={client?.name ?? ""}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`sortOrder-${fieldId}`} className={LABEL_CLASS}>
            Display order
          </label>
          <input
            id={`sortOrder-${fieldId}`}
            name="sortOrder"
            type="number"
            step="1"
            defaultValue={client?.sortOrder ?? 0}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id={`featured-${fieldId}`}
            name="featured"
            type="checkbox"
            defaultChecked={client ? client.featured : true}
            className="size-4 accent-brand-500"
          />
          <label htmlFor={`featured-${fieldId}`} className={LABEL_CLASS}>
            Featured (shown in the Home page &quot;Our Clients&quot; strip)
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            id={`isActive-${fieldId}`}
            name="isActive"
            type="checkbox"
            defaultChecked={client ? client.isActive : true}
            className="size-4 accent-brand-500"
          />
          <label htmlFor={`isActive-${fieldId}`} className={LABEL_CLASS}>
            Active (unchecked hides it from the public site)
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>Logo</span>
        {currentLogoUrl && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentLogoUrl}
              alt={client?.name ?? "Current logo"}
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
        <p className="text-xs text-ink-400">
          Without a logo, the client&apos;s name is shown as text instead.
        </p>
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

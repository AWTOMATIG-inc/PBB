"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, SquarePen } from "lucide-react";
import { Rise } from "cube-motion/react";
import type { OptionList, OptionListRecord } from "@/lib/products";
import {
  createOptionAction,
  deleteOptionAction,
  updateOptionAction,
  type FilterFormState,
} from "@/app/admin/(protected)/filters/actions";
import DeleteFilterButton from "./delete-filter-button";

const INPUT_CLASS =
  "w-full rounded-md border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500";

function OptionForm({
  action,
  option,
  placeholder,
  submitLabel,
  onSuccess,
  onCancel,
}: {
  action: (state: FilterFormState, formData: FormData) => Promise<FilterFormState>;
  option?: OptionListRecord;
  placeholder: string;
  submitLabel: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) onSuccess?.();
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          name="name"
          type="text"
          required
          maxLength={100}
          aria-label="Name"
          placeholder={placeholder}
          defaultValue={option?.name ?? ""}
          className={`${INPUT_CLASS} sm:max-w-sm`}
        />
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
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

export default function OptionListManager({
  list,
  title,
  noun,
  placeholder,
  options,
  usage,
}: {
  list: OptionList;
  title: string;
  noun: string;
  placeholder: string;
  options: OptionListRecord[];
  usage: Record<string, number>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addKey, setAddKey] = useState(0);

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
          <p className="mt-1 text-sm text-ink-500">
            {options.length} {options.length === 1 ? noun : `${noun}s`}. Shown in the product
            form dropdown and the Products page filter.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex shrink-0 items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="size-4" />
          {showAdd ? "Cancel" : `New ${noun}`}
        </button>
      </div>

      <Rise show={showAdd} className="mt-4 rounded-lg border border-ink-100 bg-white p-4">
        <OptionForm
          key={addKey}
          action={createOptionAction.bind(null, list)}
          placeholder={placeholder}
          submitLabel={`Add ${noun}`}
          onSuccess={() => {
            setAddKey((k) => k + 1);
            setShowAdd(false);
          }}
        />
      </Rise>

      <div className="mt-4 overflow-x-auto rounded-lg border border-ink-100 bg-white">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {options.map((option) => {
              const count = usage[option.id] ?? 0;
              return editingId === option.id ? (
                <Rise
                  as="tr"
                  key={`${option.id}-edit`}
                  targets="children"
                  className="border-b border-ink-100 last:border-0"
                >
                  <td colSpan={3} className="px-4 py-4">
                    <OptionForm
                      option={option}
                      action={updateOptionAction.bind(null, list, option.id)}
                      placeholder={placeholder}
                      submitLabel="Save changes"
                      onSuccess={() => setEditingId(null)}
                      onCancel={() => setEditingId(null)}
                    />
                    {count > 0 && (
                      <p className="mt-2 text-xs text-ink-400">
                        Renaming updates all {count} product{count === 1 ? "" : "s"} using it.
                      </p>
                    )}
                  </td>
                </Rise>
              ) : (
                <Rise
                  as="tr"
                  key={`${option.id}-view`}
                  targets="children"
                  className="border-b border-ink-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-ink-900">{option.name}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-600">{count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(option.id)}
                        title={`Edit ${noun}`}
                        className="rounded-md p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
                      >
                        <SquarePen className="size-4" />
                      </button>
                      {count === 0 ? (
                        <DeleteFilterButton
                          label={option.name}
                          onDelete={async () => {
                            const result = await deleteOptionAction(list, option.id);
                            if (result?.error) throw new Error(result.error);
                          }}
                        />
                      ) : (
                        <span
                          title={`Used by ${count} product${count === 1 ? "" : "s"}, so it can't be deleted. Change those products first.`}
                          className="w-[2.75rem] cursor-help text-center text-xs text-ink-300"
                        >
                          In use
                        </span>
                      )}
                    </div>
                  </td>
                </Rise>
              );
            })}
            {options.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-ink-400">
                  No {noun}s yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

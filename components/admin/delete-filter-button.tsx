"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteFilterButton({
  label,
  onDelete,
}: {
  label: string;
  onDelete: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
          setError(null);
          startTransition(async () => {
            try {
              await onDelete();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to delete.");
            }
          });
        }}
        title={`Delete ${label}`}
        className="rounded-md p-2 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 className="size-4" />
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

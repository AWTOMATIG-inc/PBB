"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { leave } from "cube-motion";
import { Morph } from "cube-motion/react";

const CONFIRM_TIMEOUT_MS = 3000;

export default function DeleteFilterButton({
  label,
  onDelete,
}: {
  label: string;
  onDelete: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const cancelConfirm = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setConfirming(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={(e) => {
          if (!confirming) {
            setConfirming(true);
            resetTimer.current = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS);
            return;
          }
          cancelConfirm();
          setError(null);
          const row = e.currentTarget.closest("tr, li");
          startTransition(async () => {
            try {
              if (row) {
                await Promise.all(leave(row).map((a) => a.finished)).catch(() => {});
              }
              await onDelete();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to delete.");
            }
          });
        }}
        onBlur={cancelConfirm}
        title={confirming ? `Confirm delete ${label}` : `Delete ${label}`}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          confirming
            ? "bg-red-600 text-white hover:bg-red-700"
            : "text-ink-400 hover:bg-red-50 hover:text-red-600"
        }`}
      >
        <Morph
          active={confirming}
          off={<Trash2 className="size-4" />}
          on={
            <span className="inline-flex items-center gap-1.5">
              <Trash2 className="size-4" />
              Confirm?
            </span>
          }
        />
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

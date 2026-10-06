"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteMoneyReceiptAction } from "@/app/dashboard/(protected)/money-receipts/actions";

const CONFIRM_TIMEOUT_MS = 3000;

export default function DeleteMoneyReceiptButton({
  id,
  receiptNumber,
}: {
  id: string;
  receiptNumber: string;
}) {
  const [isPending, startTransition] = useTransition();
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
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirming) {
          setConfirming(true);
          resetTimer.current = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS);
          return;
        }
        cancelConfirm();
        startTransition(async () => {
          const res = await deleteMoneyReceiptAction(id);
          if (res.error) alert(res.error);
        });
      }}
      onBlur={cancelConfirm}
      title={confirming ? `Confirm delete "${receiptNumber}"` : "Delete receipt"}
      aria-label={confirming ? `Confirm delete ${receiptNumber}` : `Delete ${receiptNumber}`}
      className={`inline-flex items-center gap-1 rounded p-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
        confirming
          ? "bg-red-600 text-white px-2 py-1 shadow-2xs"
          : "text-ink-400 hover:text-red-600"
      }`}
    >
      <Trash2 className="size-3.5" />
      {confirming && <span>Confirm</span>}
    </button>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Morph } from "cube-motion/react";
import { deleteProductAction } from "@/app/admin/(protected)/products/actions";

const CONFIRM_TIMEOUT_MS = 3000;

export default function DeleteProductButton({
  id,
  model,
  redirectTo,
}: {
  id: string;
  model: string;
  redirectTo?: string;
}) {
  const router = useRouter();
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
          await deleteProductAction(id);
          if (redirectTo) router.push(redirectTo);
        });
      }}
      onBlur={cancelConfirm}
      title={confirming ? `Confirm delete "${model}"` : "Delete product"}
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
  );
}

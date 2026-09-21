"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProductAction } from "@/app/admin/(protected)/products/actions";

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

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (window.confirm(`Delete "${model}"? This cannot be undone.`)) {
          startTransition(async () => {
            await deleteProductAction(id);
            if (redirectTo) router.push(redirectTo);
          });
        }
      }}
      title="Delete product"
      className="rounded-md p-2 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

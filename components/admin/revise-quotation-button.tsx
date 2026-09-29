"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { GitFork, Loader2 } from "lucide-react";
import { createRevisionAction } from "@/app/dashboard/(protected)/quotations/actions";

export default function ReviseQuotationButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRevise = () => {
    startTransition(async () => {
      const res = await createRevisionAction(id);
      if (res.success && res.newId) {
        router.push(`/dashboard/quotations/${res.newId}/edit`);
      }
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleRevise}
      className="inline-flex items-center gap-1 rounded border border-ink-200 bg-white px-2 py-1 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600 shadow-2xs transition-colors disabled:opacity-50"
      title="Create Revision (R1, R2...)"
    >
      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <GitFork className="size-3.5" />}
      Revise
    </button>
  );
}

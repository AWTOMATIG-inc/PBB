import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MoneyReceiptForm from "@/components/admin/money-receipt-form";
import { createMoneyReceiptAction } from "../actions";

export const metadata: Metadata = {
  title: "New Money Receipt | Admin",
};

export default function NewMoneyReceiptPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/dashboard/money-receipts"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to money receipts
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Create Money Receipt</h1>
        <p className="mt-1 text-sm text-ink-500">
          The receipt is dated today and numbered automatically. The PDF prints the receipt with
          its tear-off stub.
        </p>
      </div>

      <MoneyReceiptForm action={createMoneyReceiptAction} />
    </div>
  );
}

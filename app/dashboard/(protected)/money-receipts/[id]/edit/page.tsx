import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getAdminSessionToken } from "@/lib/session";
import { getMoneyReceipt } from "@/lib/money-receipts";
import { formatQuotationDateTime } from "@/lib/format-date";
import MoneyReceiptForm from "@/components/admin/money-receipt-form";
import { updateMoneyReceiptAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Money Receipt | Admin",
};

export default async function EditMoneyReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const receipt = await getMoneyReceipt(token, id);
  if (!receipt) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard/money-receipts"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to money receipts
        </Link>

        <a
          href={`/api/dashboard/money-receipts/${receipt.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 shadow-sm transition-colors hover:bg-ink-50"
        >
          <Download className="size-3.5 text-ink-500" />
          Download / Preview PDF
        </a>
      </div>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Edit Receipt {receipt.receiptNumber}</h1>
        <p className="mt-1 text-sm text-ink-500">
          Received from <span className="font-semibold text-ink-700">{receipt.receivedFrom}</span>{" "}
          on {formatQuotationDateTime(receipt.receiptDate).date}. The number and date stay as
          issued.
        </p>
      </div>

      <MoneyReceiptForm receipt={receipt} action={updateMoneyReceiptAction.bind(null, receipt.id)} />
    </div>
  );
}

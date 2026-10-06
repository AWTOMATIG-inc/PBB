"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSessionToken } from "@/lib/session";
import {
  MAX_RECEIPT_AMOUNT,
  PAYMENT_MODES,
  createMoneyReceipt,
  deleteMoneyReceipt,
  nextReceiptNumber,
  updateMoneyReceipt,
  type PaymentMode,
} from "@/lib/money-receipts";
import { numberToTakaWords } from "@/lib/format-bdt-words";
import { describePbError } from "@/lib/pb-error";
import { isDuplicateNumberError, todayInDhaka } from "@/lib/doc-number";

export type MoneyReceiptFormState = { error?: string } | undefined;

const text = (formData: FormData, key: string, max: number) =>
  String(formData.get(key) ?? "").trim().slice(0, max);

function buildReceiptPayload(formData: FormData): {
  payload: Record<string, unknown>;
  error?: string;
} {
  const receivedFrom = text(formData, "receivedFrom", 120);
  if (!receivedFrom) {
    return { payload: {}, error: "Enter who the money was received from." };
  }

  const amount = Math.round(Number(formData.get("amount")));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { payload: {}, error: "Enter an amount above zero." };
  }
  if (amount > MAX_RECEIPT_AMOUNT) {
    return { payload: {}, error: "The amount is too large for a receipt (maximum 99,99,99,999)." };
  }

  const modeRaw = String(formData.get("paymentMode") ?? "cash");
  const paymentMode: PaymentMode = (PAYMENT_MODES as string[]).includes(modeRaw)
    ? (modeRaw as PaymentMode)
    : "cash";

  // Cheque details only mean something for a cheque payment.
  let chequeNo = "";
  let chequeBank = "";
  let chequeDate = "";
  if (paymentMode === "cheque") {
    chequeNo = text(formData, "chequeNo", 100);
    if (!chequeNo) {
      return { payload: {}, error: "Enter the cheque number for a cheque payment." };
    }
    chequeBank = text(formData, "chequeBank", 150);
    const rawDate = text(formData, "chequeDate", 10);
    chequeDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : "";
  }

  return {
    payload: {
      receivedFrom,
      amount,
      amountInWords: numberToTakaWords(amount),
      onAccountOf: text(formData, "onAccountOf", 120),
      onAccountOf2: text(formData, "onAccountOf2", 120),
      paymentMode,
      chequeNo,
      chequeBank,
      chequeDate,
      note: text(formData, "note", 120),
    },
  };
}

export async function createMoneyReceiptAction(
  _state: MoneyReceiptFormState,
  formData: FormData
): Promise<MoneyReceiptFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const { payload, error } = buildReceiptPayload(formData);
  if (error) return { error };

  // New receipts are dated today; editing never changes the date or number.
  const receiptDate = todayInDhaka();
  const year = Number(receiptDate.slice(0, 4));

  // Two receipts saved at the same moment can be handed the same number;
  // the unique index rejects the second, so fetch a fresh number and retry.
  for (let attempt = 0; attempt < 3; attempt++) {
    const receiptNumber = await nextReceiptNumber(token, year);
    const res = await createMoneyReceipt(token, { ...payload, receiptNumber, receiptDate });
    if (res.ok) {
      revalidatePath("/dashboard/money-receipts");
      redirect("/dashboard/money-receipts");
    }
    const body = await res.json().catch(() => ({}));
    if (!isDuplicateNumberError(body, "receiptNumber")) {
      return { error: describePbError(res.status, body) };
    }
  }

  return { error: "Could not assign a receipt number. Please try again." };
}

export async function updateMoneyReceiptAction(
  id: string,
  _state: MoneyReceiptFormState,
  formData: FormData
): Promise<MoneyReceiptFormState> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const { payload, error } = buildReceiptPayload(formData);
  if (error) return { error };

  const res = await updateMoneyReceipt(token, id, payload);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: describePbError(res.status, body) };
  }

  revalidatePath("/dashboard/money-receipts");
  redirect("/dashboard/money-receipts");
}

export async function deleteMoneyReceiptAction(id: string): Promise<{ error?: string }> {
  const token = await getAdminSessionToken();
  if (!token) redirect("/dashboard/login");

  const res = await deleteMoneyReceipt(token, id);
  if (!res.ok) {
    return { error: "Failed to delete money receipt." };
  }

  revalidatePath("/dashboard/money-receipts");
  return {};
}

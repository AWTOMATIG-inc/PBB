import React from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { MoneyReceiptPdfDocument } from "../../components/pdf/money-receipt-pdf-document";
import type { MoneyReceiptRecord } from "../money-receipts";
import { pdfLogoDataUri, streamToBuffer } from "./logo";

/** Renders a money receipt to a PDF Buffer (headless, server-side). */
export async function generateMoneyReceiptPdfBuffer(
  receipt: MoneyReceiptRecord
): Promise<Buffer> {
  const element = React.createElement(MoneyReceiptPdfDocument, {
    receipt,
    logoSrc: pdfLogoDataUri,
  }) as unknown as React.ReactElement<DocumentProps>;

  const stream = await pdf(element).toBuffer();
  return await streamToBuffer(stream);
}

import React from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { InvoicePdfDocument } from "../../components/pdf/invoice-pdf-document";
import type { InvoiceRecord } from "../invoices";
import { pdfLogoDataUri, streamToBuffer } from "./logo";

/** Renders an invoice to an A4 PDF Buffer (headless, server-side). */
export async function generateInvoicePdfBuffer(invoice: InvoiceRecord): Promise<Buffer> {
  const element = React.createElement(InvoicePdfDocument, {
    invoice,
    logoSrc: pdfLogoDataUri,
  }) as unknown as React.ReactElement<DocumentProps>;

  const stream = await pdf(element).toBuffer();
  return await streamToBuffer(stream);
}

import React from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { QuotationPdfDocument } from "../../components/pdf/quotation-pdf-document";
import type { QuotationRecord } from "../quotations";
import { pdfLogoDataUri, streamToBuffer } from "./logo";

/**
 * Generates an A4 PDF Buffer on the server side using @react-pdf/renderer.
 * Runs completely headless in Node.js without Puppeteer or browser instances.
 */
export async function generateQuotationPdfBuffer(
  quotation: QuotationRecord,
  logoSrc?: string
): Promise<Buffer> {
  const resolvedLogo = logoSrc || pdfLogoDataUri;
  const element = React.createElement(QuotationPdfDocument, {
    quotation,
    logoSrc: resolvedLogo,
  }) as unknown as React.ReactElement<DocumentProps>;

  const instance = pdf(element);
  const stream = await instance.toBuffer();
  return await streamToBuffer(stream);
}

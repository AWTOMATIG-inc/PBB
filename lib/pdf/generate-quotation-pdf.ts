import fs from "fs";
import path from "path";
import React from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { QuotationPdfDocument } from "../../components/pdf/quotation-pdf-document";
import type { QuotationRecord } from "../quotations";

function getLogoDataUri(): string {
  try {
    const cleanLogoPath = path.join(process.cwd(), "public", "logo.png");
    const fallbackPath = path.join(process.cwd(), "public", "pbb-logo.png");
    const targetPath = fs.existsSync(cleanLogoPath) ? cleanLogoPath : fallbackPath;
    if (fs.existsSync(targetPath)) {
      const buffer = fs.readFileSync(targetPath);
      return `data:image/png;base64,${buffer.toString("base64")}`;
    }
  } catch (err) {
    console.error("Error reading PBB logo for PDF:", err);
  }
  return "";
}

const cachedLogoDataUri = getLogoDataUri();

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Buffer | Uint8Array) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    );
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err: Error) => reject(err));
  });
}

/**
 * Generates an A4 PDF Buffer on the server side using @react-pdf/renderer.
 * Runs completely headless in Node.js without Puppeteer or browser instances.
 */
export async function generateQuotationPdfBuffer(
  quotation: QuotationRecord,
  logoSrc?: string
): Promise<Buffer> {
  const resolvedLogo = logoSrc || cachedLogoDataUri;
  const element = React.createElement(QuotationPdfDocument, {
    quotation,
    logoSrc: resolvedLogo,
  }) as unknown as React.ReactElement<DocumentProps>;

  const instance = pdf(element);
  const stream = await instance.toBuffer();
  return await streamToBuffer(stream);
}

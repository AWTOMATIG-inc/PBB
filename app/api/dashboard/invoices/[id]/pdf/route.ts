import { NextResponse, type NextRequest } from "next/server";
import { getAdminSessionToken } from "@/lib/session";
import { getInvoice } from "@/lib/invoices";
import { generateInvoicePdfBuffer } from "@/lib/pdf/generate-invoice-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAdminSessionToken();
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const invoice = await getInvoice(token, id);
  if (!invoice) {
    return new NextResponse("Invoice Not Found", { status: 404 });
  }

  try {
    const pdfBuffer = await generateInvoicePdfBuffer(invoice);
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Invoice_${invoice.invoiceNumber}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Invoice PDF generation error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}

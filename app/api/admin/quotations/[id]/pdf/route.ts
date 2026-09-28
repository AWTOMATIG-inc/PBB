import { NextResponse, type NextRequest } from "next/server";
import { getAdminSessionToken } from "@/lib/session";
import { getQuotation } from "@/lib/quotations";
import { generateQuotationPdfBuffer } from "@/lib/pdf/generate-quotation-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAdminSessionToken();
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const quotation = await getQuotation(token, id);
  if (!quotation) {
    return new NextResponse("Quotation Not Found", { status: 404 });
  }

  try {
    const pdfBuffer = await generateQuotationPdfBuffer(quotation);
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Quotation_${quotation.quotationNumber}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}

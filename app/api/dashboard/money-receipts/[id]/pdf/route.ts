import { NextResponse, type NextRequest } from "next/server";
import { getAdminSessionToken } from "@/lib/session";
import { getMoneyReceipt } from "@/lib/money-receipts";
import { generateMoneyReceiptPdfBuffer } from "@/lib/pdf/generate-money-receipt-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAdminSessionToken();
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const receipt = await getMoneyReceipt(token, id);
  if (!receipt) {
    return new NextResponse("Money Receipt Not Found", { status: 404 });
  }

  try {
    const pdfBuffer = await generateMoneyReceiptPdfBuffer(receipt);
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="MoneyReceipt_${receipt.receiptNumber}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Money receipt PDF generation error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}

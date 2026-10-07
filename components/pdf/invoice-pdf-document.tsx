import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { InvoiceRecord } from "../../lib/invoices";
import { formatBdtCurrency } from "../../lib/format-bdt-words";
import { formatQuotationDateTime } from "../../lib/format-date";
import { calculateInvoiceTotals } from "../../lib/invoice-calculator";
import { DEFAULT_SIGNATORY, formatBdPhone } from "../../lib/quotation-calculator";
import {
  PDF_COLORS as COLORS,
  PdfFooter,
  PdfHeader,
  PdfSignature,
  PdfWatermark,
  letterheadStyles,
} from "./pdf-letterhead";

const styles = StyleSheet.create({
  // Title & Metadata Ribbon
  titleSection: {
    marginTop: 10,
    marginBottom: 6,
    textAlign: "center",
  },
  invoiceTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navyHeader,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  metadataRibbon: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.navyHeader,
    paddingVertical: 3.5,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginTop: 5,
    marginBottom: 8,
  },
  ribbonText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  // Bill To
  clientBox: {
    backgroundColor: COLORS.ink50,
    borderWidth: 1,
    borderColor: COLORS.ink100,
    borderRadius: 3,
    padding: 7,
    marginBottom: 10,
  },
  clientLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.brandOrange,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  clientName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink900,
  },
  clientDetails: {
    fontSize: 7.5,
    color: COLORS.ink700,
    marginTop: 1.5,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navyHeader,
    textTransform: "uppercase",
    marginBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.brandOrange,
    paddingBottom: 2,
  },
  // Items Table
  priceTable: {
    display: "flex",
    flexDirection: "column",
    borderWidth: 1,
    borderColor: COLORS.navyHeader,
    borderRadius: 2,
    marginBottom: 6,
  },
  priceHeaderRow: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: COLORS.navyHeader,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  priceHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  priceRow: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ink100,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  priceCell: {
    fontSize: 7.5,
    color: COLORS.ink900,
  },
  colSl: { width: "7%", textAlign: "center" },
  colName: { width: "51%", paddingRight: 8 },
  colQty: { width: "10%", textAlign: "center" },
  colUnit: { width: "16%", textAlign: "right" },
  colTotal: { width: "16%", textAlign: "right" },
  // Totals
  totalsBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  totalsLine: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: 210,
    paddingVertical: 2.5,
    paddingHorizontal: 8,
  },
  totalsLabel: {
    fontSize: 7.5,
    color: COLORS.ink700,
  },
  totalsValue: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink900,
  },
  grandTotalRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: COLORS.yellowBg,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    borderRadius: 2,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navyHeader,
    textTransform: "uppercase",
  },
  grandTotalAmount: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.brandDark,
  },
  inWordsBox: {
    alignSelf: "stretch",
    marginTop: 4,
    padding: 4,
    backgroundColor: COLORS.ink50,
    borderRadius: 2,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.brandOrange,
  },
  inWordsText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink800,
  },
  // Notes
  notesBox: {
    marginTop: 10,
    backgroundColor: COLORS.ink50,
    borderWidth: 1,
    borderColor: COLORS.ink100,
    borderRadius: 2,
    padding: 5,
  },
  notesText: {
    fontSize: 7.2,
    color: COLORS.ink700,
    lineHeight: 1.3,
  },
  // Signatory Area
  signatorySection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.ink100,
  },
  signatoryLeft: {
    display: "flex",
    flexDirection: "column",
  },
  signatoryRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    width: 170,
  },
  signatureSpace: {
    height: 52,
  },
  signatureLine: {
    width: 145,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ink800,
    marginBottom: 4,
  },
  signatoryName: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink900,
  },
  signatoryRole: {
    fontSize: 7.5,
    color: COLORS.ink700,
  },
});

// Shown in the ribbon so a draft or cancelled copy can't pass as a live bill.
const STATUS_RIBBON: Partial<Record<InvoiceRecord["status"], string>> = {
  draft: "DRAFT",
  paid: "PAID",
  cancelled: "CANCELLED",
};

interface InvoicePdfProps {
  invoice: InvoiceRecord;
  logoSrc?: string;
}

export function InvoicePdfDocument({ invoice, logoSrc }: InvoicePdfProps) {
  const items = invoice.items ?? [];
  const { subtotal, discountAmount, vatAmount, total, amountInWords } = calculateInvoiceTotals({
    items,
    discountType: invoice.discountType,
    discount: invoice.discount ?? 0,
    vatType: invoice.taxType,
    vat: invoice.tax ?? 0,
  });
  const discountLabel =
    invoice.discountType === "percent" ? `Discount (${invoice.discount}%)` : "Discount";
  const vatLabel = invoice.taxType === "percent" ? `VAT (${invoice.tax}%)` : "VAT";
  const statusLabel = STATUS_RIBBON[invoice.status];
  const contactLine = [
    invoice.companyName && invoice.customerName ? `Attn: ${invoice.customerName}` : "",
    invoice.customerPhone ? `Phone: ${invoice.customerPhone}` : "",
    invoice.customerEmail ? `Email: ${invoice.customerEmail}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <Document
      title={`Invoice_${invoice.invoiceNumber}`}
      author="Power Bank Bangladesh"
      subject={`Invoice ${invoice.invoiceNumber}`}
    >
      <Page size="A4" style={letterheadStyles.page}>
        <PdfWatermark logoSrc={logoSrc} />
        <PdfHeader logoSrc={logoSrc} fixed />
        {/* Keeps overflow-page content off the repeated header rule */}
        <View style={{ height: 6 }} fixed />

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.invoiceTitle}>Invoice</Text>
        </View>

        {/* Metadata Ribbon */}
        <View style={styles.metadataRibbon}>
          <Text style={styles.ribbonText}>INVOICE NO: {invoice.invoiceNumber}</Text>
          <Text style={styles.ribbonText}>
            DATE: {formatQuotationDateTime(invoice.issuedDate).date}
          </Text>
          {statusLabel ? <Text style={styles.ribbonText}>STATUS: {statusLabel}</Text> : null}
        </View>

        {/* Bill To */}
        <View style={styles.clientBox}>
          <Text style={styles.clientLabel}>BILL TO:</Text>
          <Text style={styles.clientName}>{invoice.companyName || invoice.customerName}</Text>
          {contactLine ? <Text style={styles.clientDetails}>{contactLine}</Text> : null}
          {invoice.customerAddress ? (
            <Text style={styles.clientDetails}>Address: {invoice.customerAddress}</Text>
          ) : null}
        </View>

        {/* Items Table */}
        <Text style={styles.sectionTitle}>Item Details (BDT)</Text>
        <View style={styles.priceTable}>
          <View style={styles.priceHeaderRow}>
            <Text style={[styles.priceHeaderCell, styles.colSl]}>SL</Text>
            <Text style={[styles.priceHeaderCell, styles.colName]}>Item Name</Text>
            <Text style={[styles.priceHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.priceHeaderCell, styles.colUnit]}>Unit Price</Text>
            <Text style={[styles.priceHeaderCell, styles.colTotal]}>Total Price</Text>
          </View>
          {items.map((item, idx) => (
            <View key={idx} style={styles.priceRow} wrap={false}>
              <Text style={[styles.priceCell, styles.colSl]}>
                {String(idx + 1).padStart(2, "0")}
              </Text>
              <Text style={[styles.priceCell, styles.colName]}>{item.name}</Text>
              <Text style={[styles.priceCell, styles.colQty]}>{item.qty}</Text>
              <Text style={[styles.priceCell, styles.colUnit]}>
                {formatBdtCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.priceCell, styles.colTotal]}>
                {formatBdtCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBlock} wrap={false}>
          <View style={styles.totalsLine}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatBdtCurrency(subtotal)}</Text>
          </View>
          {discountAmount > 0 ? (
            <View style={styles.totalsLine}>
              <Text style={styles.totalsLabel}>{discountLabel}</Text>
              <Text style={styles.totalsValue}>- {formatBdtCurrency(discountAmount)}</Text>
            </View>
          ) : null}
          {vatAmount > 0 ? (
            <View style={styles.totalsLine}>
              <Text style={styles.totalsLabel}>{vatLabel}</Text>
              <Text style={styles.totalsValue}>+ {formatBdtCurrency(vatAmount)}</Text>
            </View>
          ) : null}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalAmount}>{formatBdtCurrency(total)}</Text>
          </View>
          <View style={styles.inWordsBox}>
            <Text style={styles.inWordsText}>In Words: {amountInWords}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes ? (
          <View style={styles.notesBox} wrap={false}>
            <Text style={styles.notesText}>Note: {invoice.notes}</Text>
          </View>
        ) : null}

        {/* Signatory Area */}
        <View style={styles.signatorySection} wrap={false}>
          <View style={styles.signatoryLeft}>
            <Text style={{ fontSize: 7.5, color: COLORS.ink500 }}>Thank you for your business,</Text>
            <Text
              style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: COLORS.ink900, marginTop: 2 }}
            >
              {DEFAULT_SIGNATORY.company}
            </Text>
          </View>
          <View style={styles.signatoryRight}>
            <PdfSignature />
            <View style={styles.signatureLine} />
            <Text style={styles.signatoryName}>{DEFAULT_SIGNATORY.name}</Text>
            <Text style={styles.signatoryRole}>{DEFAULT_SIGNATORY.title}</Text>
            <Text style={styles.signatoryRole}>{formatBdPhone(DEFAULT_SIGNATORY.phone)}</Text>
          </View>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}

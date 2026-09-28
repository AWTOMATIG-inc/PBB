import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { QuotationRecord } from "../../lib/quotations";
import { formatBdtCurrency } from "../../lib/format-bdt-words";
import path from "path";

// Color Palette matching PBB Brand & Commercial Guidelines
const COLORS = {
  brandOrange: "#ED7423",
  brandDark: "#D45F11",
  ink900: "#14181B",
  ink800: "#1E2327",
  ink700: "#2B3136",
  ink500: "#5B6368",
  ink400: "#7D8489",
  ink100: "#E7E8E9",
  ink50: "#F5F5F6",
  navyHeader: "#1E293B",
  navyLight: "#F1F5F9",
  yellowBg: "#FEF9C3",
  yellowBorder: "#FACC15",
  greenIncluded: "#15803D",
  greenBg: "#DCFCE7",
  redExcluded: "#B91C1C",
  redBg: "#FEE2E2",
};

const styles = StyleSheet.create({
  page: {
    size: "A4",
    paddingTop: 36,     // Top margin (e.g. 0.5 inch / 36 pt)
    paddingBottom: 36,  // Bottom margin
    paddingLeft: 72,    // Left margin
    paddingRight: 72,   // Right margin
    // paddingHorizontal: 28,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.ink900,
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  watermarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
    transform: "rotate(-45deg)",
  },
  watermarkImage: {
    width: 440,
    height: 350,
    opacity: 0.05,
    objectFit: "contain",
  },
  // Top Header
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ink100,
    paddingBottom: 8,
  },
  headerContactCol: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  headerContactItem: {
    fontSize: 7.5,
    color: COLORS.ink700,
  },
  headerLogo: {
    width: 95,
    height: 48,
    objectFit: "contain",
  },
  // Title & Metadata Ribbon
  titleSection: {
    marginTop: 8,
    marginBottom: 6,
    textAlign: "center",
  },
  quotationTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navyHeader,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
    marginBottom: 6,
  },
  ribbonText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  // Client & Intro
  clientBox: {
    backgroundColor: COLORS.ink50,
    borderWidth: 1,
    borderColor: COLORS.ink100,
    borderRadius: 3,
    padding: 7,
    marginBottom: 7,
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
  // Technical Matrix Table
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
  techTable: {
    display: "flex",
    flexDirection: "column",
    borderWidth: 1,
    borderColor: COLORS.ink100,
    borderRadius: 2,
    marginBottom: 7,
  },
  techRow: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ink100,
  },
  techRowLast: {
    display: "flex",
    flexDirection: "row",
  },
  techCellLabel: {
    width: "25%",
    backgroundColor: COLORS.ink50,
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink700,
    borderRightWidth: 1,
    borderRightColor: COLORS.ink100,
  },
  techCellValue: {
    width: "25%",
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 7,
    color: COLORS.ink900,
    borderRightWidth: 1,
    borderRightColor: COLORS.ink100,
  },
  techCellValueLast: {
    width: "25%",
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 7,
    color: COLORS.ink900,
  },
  // Price Summary Table
  priceTable: {
    display: "flex",
    flexDirection: "column",
    borderWidth: 1,
    borderColor: COLORS.navyHeader,
    borderRadius: 2,
    marginBottom: 5,
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
  colDesc: { width: "55%", paddingRight: 8 },
  colQty: { width: "8%", textAlign: "center" },
  colUnit: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },
  // Grand Total & In Words
  grandTotalRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.yellowBg,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    borderRadius: 2,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 2,
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
  // Scope of Supply on Page 2
  scopeGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: COLORS.ink100,
    borderRadius: 2,
    marginBottom: 7,
  },
  scopeItem: {
    width: "50%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ink100,
  },
  scopeBadgeIncluded: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.greenIncluded,
    backgroundColor: COLORS.greenBg,
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  scopeBadgeExcluded: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.redExcluded,
    backgroundColor: COLORS.redBg,
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  scopeItemText: {
    fontSize: 7,
    color: COLORS.ink900,
    flex: 1,
  },
  // Terms & Conditions Block
  termsList: {
    display: "flex",
    flexDirection: "column",
    gap: 3.5,
    marginBottom: 7,
  },
  termRow: {
    display: "flex",
    flexDirection: "row",
  },
  termTitle: {
    fontSize: 7.2,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navyHeader,
    width: "25%",
  },
  termDesc: {
    fontSize: 7,
    color: COLORS.ink700,
    width: "75%",
    lineHeight: 1.25,
  },
  // Exclusions Text
  exclusionsBox: {
    backgroundColor: COLORS.ink50,
    borderWidth: 1,
    borderColor: COLORS.ink100,
    borderRadius: 2,
    padding: 5,
    marginBottom: 8,
  },
  exclusionsText: {
    fontSize: 6.8,
    color: COLORS.ink500,
    lineHeight: 1.2,
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
  // Bottom Brand Footer Strip
  footerStrip: {
    position: "absolute",
    bottom: 12,
    left: 28,
    right: 28,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.ink100,
    paddingTop: 4,
  },
  footerBrandText: {
    fontSize: 6.5,
    color: COLORS.ink400,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pageNumber: {
    fontSize: 7,
    color: COLORS.ink500,
    fontFamily: "Helvetica-Bold",
  },
});

interface QuotationPdfProps {
  quotation: QuotationRecord;
  logoSrc?: string;
}

export function QuotationPdfDocument({ quotation, logoSrc }: QuotationPdfProps) {
  let resolvedLogo = logoSrc;
  if (!resolvedLogo) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require("path");
      const cleanLogoPath = path.join(process.cwd(), "public", "logo.png");
      const fallbackPath = path.join(process.cwd(), "public", "pbb-logo.png");
      const targetPath = fs.existsSync(cleanLogoPath) ? cleanLogoPath : fallbackPath;
      if (fs.existsSync(targetPath)) {
        resolvedLogo = `data:image/png;base64,${fs.readFileSync(targetPath).toString("base64")}`;
      }
    } catch {
      // Ignore if running in pure browser or fs unavailable
    }
  }

  const specs = quotation.technicalSpecs || {};

  return (
    <Document
      title={`Quotation_${quotation.quotationNumber}`}
      author="Power Bank Bangladesh"
      subject={quotation.subject}
    >
      {/* ============================================================== */}
      {/* PAGE 1: COMMERCIAL & TECHNICAL SPECIFICATION OFFER             */}
      {/* ============================================================== */}
      <Page size="A4" style={styles.page}>
        {/* Background Watermark */}
        {resolvedLogo ? (
          <View style={styles.watermarkContainer}>
            <Image src={resolvedLogo} style={styles.watermarkImage} />
          </View>
        ) : null}

        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerContactCol}>
            <Text style={styles.headerContactItem}>
              Email: powerbankbd23@gmail.com
            </Text>
            <Text style={styles.headerContactItem}>
              Address: Kamalapur, Biruliya, Savar, Dhaka
            </Text>
            <Text style={styles.headerContactItem}>
              Hotline: +88 (0) 1989 474 447 | Office: +88 (0) 1625 181 403
            </Text>
          </View>
          {resolvedLogo ? (
            <Image src={resolvedLogo} style={styles.headerLogo} />
          ) : null}
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.quotationTitle}>{quotation.subject}</Text>
        </View>

        {/* Metadata Ribbon */}
        <View style={styles.metadataRibbon}>
          <Text style={styles.ribbonText}>
            OFFER NO: {quotation.quotationNumber}
            {quotation.revision > 0 ? `-R${quotation.revision}` : ""}
          </Text>
          <Text style={styles.ribbonText}>
            DATE: {quotation.quotationDate?.split("T")[0] || "N/A"}
          </Text>
          <Text style={styles.ribbonText}>
            VALIDITY: {quotation.commercialTerms?.offerValidity || "30 DAYS"}
          </Text>
        </View>

        {/* Client Box */}
        <View style={styles.clientBox}>
          <Text style={styles.clientLabel}>SUBMITTED TO:</Text>
          <Text style={styles.clientName}>{quotation.companyName}</Text>
          <Text style={styles.clientDetails}>
            Attn: {quotation.contactPerson}
            {quotation.designation ? ` (${quotation.designation})` : ""} | Phone:{" "}
            {quotation.phone}
            {quotation.email ? ` | Email: ${quotation.email}` : ""}
          </Text>
          <Text style={styles.clientDetails}>
            Address: {quotation.address}
            {quotation.binVatNumber ? ` | BIN/VAT: ${quotation.binVatNumber}` : ""}
          </Text>
        </View>

        {/* Technical Data Table */}
        <Text style={styles.sectionTitle}>
          Technical Specifications & General Data
        </Text>
        <View style={styles.techTable}>
          <View style={styles.techRow}>
            <Text style={styles.techCellLabel}>Generator Brand</Text>
            <Text style={styles.techCellValue}>
              {specs.generatorBrand || "Powerwatt / PBB"}
            </Text>
            <Text style={styles.techCellLabel}>Generator Model</Text>
            <Text style={styles.techCellValueLast}>
              {specs.generatorModel || "N/A"}
            </Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techCellLabel}>Prime Capacity</Text>
            <Text style={styles.techCellValue}>
              {specs.primeKva ? `${specs.primeKva} kVA` : "As Quoted"}
            </Text>
            <Text style={styles.techCellLabel}>Standby Capacity</Text>
            <Text style={styles.techCellValueLast}>
              {specs.standbyKva ? `${specs.standbyKva} kVA` : "As Quoted"}
            </Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techCellLabel}>Engine Brand & Model</Text>
            <Text style={styles.techCellValue}>
              {specs.engineBrand || "N/A"} {specs.engineModel ? `(${specs.engineModel})` : ""}
            </Text>
            <Text style={styles.techCellLabel}>Alternator Brand</Text>
            <Text style={styles.techCellValueLast}>
              {specs.alternatorBrand || "Leroy Somer / Stamford"}
            </Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techCellLabel}>Controller</Text>
            <Text style={styles.techCellValue}>
              {specs.controllerBrand || "Deep Sea / Smartgen (Digital)"}
            </Text>
            <Text style={styles.techCellLabel}>Electrical Rating</Text>
            <Text style={styles.techCellValueLast}>
              {specs.voltage || "400V / 230V, 50Hz, 1500 RPM"}
            </Text>
          </View>
          <View style={styles.techRowLast}>
            <Text style={styles.techCellLabel}>Canopy / Origin</Text>
            <Text style={styles.techCellValue}>
              {specs.canopyType || "Soundproof Weatherproof"}
            </Text>
            <Text style={styles.techCellLabel}>Stock & Delivery</Text>
            <Text style={styles.techCellValueLast}>
              {specs.stockStatus || "Ready Stock / Within 60 Days"}
            </Text>
          </View>
        </View>

        {/* Price Summary Table */}
        <Text style={styles.sectionTitle}>Price Summary (BDT)</Text>
        <View style={styles.priceTable}>
          <View style={styles.priceHeaderRow}>
            <Text style={[styles.priceHeaderCell, styles.colSl]}>SL</Text>
            <Text style={[styles.priceHeaderCell, styles.colDesc]}>
              Description of Goods & Services
            </Text>
            <Text style={[styles.priceHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.priceHeaderCell, styles.colUnit]}>
              Unit Price
            </Text>
            <Text style={[styles.priceHeaderCell, styles.colTotal]}>
              Total Price
            </Text>
          </View>
          {quotation.items?.map((item, idx) => (
            <View key={idx} style={styles.priceRow}>
              <Text style={[styles.priceCell, styles.colSl]}>{item.sl}</Text>
              <Text style={[styles.priceCell, styles.colDesc]}>
                {item.description}
              </Text>
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

        {/* Grand Total Row */}
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>
            GRAND TOTAL (EXCLUDING VAT & AIT)
          </Text>
          <Text style={styles.grandTotalAmount}>
            {formatBdtCurrency(quotation.grandTotal)}
          </Text>
        </View>

        {/* In Words */}
        <View style={styles.inWordsBox}>
          <Text style={styles.inWordsText}>
            In Words: {quotation.amountInWords}
          </Text>
        </View>

        {/* Page 1 Footer */}
        <View style={styles.footerStrip}>
          <Text style={styles.footerBrandText}>
            Powered by: CAT | DOOSAN | CUMMINS | PERKINS | RICARDO | VOLVO PENTA | JOHN DEERE
          </Text>
          <Text style={styles.pageNumber}>Page 1 of 2</Text>
        </View>
      </Page>

      {/* ============================================================== */}
      {/* PAGE 2: TERMS, SCOPE OF SUPPLY & AUTHORIZED SIGNATURE          */}
      {/* ============================================================== */}
      <Page size="A4" style={styles.page}>
        {/* Background Watermark */}
        {resolvedLogo ? (
          <View style={styles.watermarkContainer}>
            <Image src={resolvedLogo} style={styles.watermarkImage} />
          </View>
        ) : null}

        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerContactCol}>
            <Text style={styles.headerContactItem}>
              Email: powerbankbd23@gmail.com
            </Text>
            <Text style={styles.headerContactItem}>
              Address: Kamalapur, Biruliya, Savar, Dhaka
            </Text>
            <Text style={styles.headerContactItem}>
              Hotline: +88 (0) 1989 474 447 | Office: +88 (0) 1625 181 403
            </Text>
          </View>
          {resolvedLogo ? (
            <Image src={resolvedLogo} style={styles.headerLogo} />
          ) : null}
        </View>

        {/* Section 1: Scope of Supply */}
        <View style={{ marginTop: 8 }}>
          <Text style={styles.sectionTitle}>Scope of Supply & Inclusions</Text>
          <View style={styles.scopeGrid}>
            {quotation.scopeOfSupply?.map((s, idx) => (
              <View key={idx} style={styles.scopeItem}>
                <Text style={styles.scopeItemText}>{s.item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 2: Commercial Terms and Conditions */}
        <Text style={styles.sectionTitle}>Commercial Terms & Conditions</Text>
        <View style={styles.termsList}>
          <View style={styles.termRow}>
            <Text style={styles.termTitle}>1. Payment Terms:</Text>
            <Text style={styles.termDesc}>
              {quotation.commercialTerms?.paymentTerms || "As agreed."}
            </Text>
          </View>
          <View style={styles.termRow}>
            <Text style={styles.termTitle}>2. Offer Validity:</Text>
            <Text style={styles.termDesc}>
              {quotation.commercialTerms?.offerValidity || "30 days from date of quotation."}
            </Text>
          </View>
          <View style={styles.termRow}>
            <Text style={styles.termTitle}>3. Warranty:</Text>
            <Text style={styles.termDesc}>
              {quotation.commercialTerms?.warranty || "12 Months or 1000 running hours."}
            </Text>
          </View>
          <View style={styles.termRow}>
            <Text style={styles.termTitle}>4. Erection & Comm.:</Text>
            <Text style={styles.termDesc}>
              {quotation.commercialTerms?.installation ||
                "Supervision of installation & commissioning included."}
            </Text>
          </View>
          <View style={styles.termRow}>
            <Text style={styles.termTitle}>5. Delivery Schedule:</Text>
            <Text style={styles.termDesc}>
              {quotation.commercialTerms?.deliveryTerms || "Within 60 days."}
            </Text>
          </View>
          <View style={styles.termRow}>
            <Text style={styles.termTitle}>6. After-Sales Service:</Text>
            <Text style={styles.termDesc}>
              {quotation.commercialTerms?.afterSales ||
                "Prompt 24/7 technical assistance and maintenance support."}
            </Text>
          </View>
          <View style={styles.termRow}>
            <Text style={styles.termTitle}>7. Operator Training:</Text>
            <Text style={styles.termDesc}>
              {quotation.commercialTerms?.training ||
                "1-day free operator training at time of commissioning."}
            </Text>
          </View>
        </View>

        {/* Section 3: Standard Exclusions */}
        <Text style={styles.sectionTitle}>Standard Exclusions & Limitations</Text>
        <View style={styles.exclusionsBox}>
          <Text style={styles.exclusionsText}>
            {quotation.standardExclusions ||
              "Civil engineering works, foundation, external power cables, cable lugs, earthing materials, ducting, fuel (diesel), distilled water, coolant and lubricating oil are excluded unless explicitly specified."}
          </Text>
        </View>

        {/* Signatory Area */}
        <View style={styles.signatorySection}>
          <View style={styles.signatoryLeft}>
            <Text style={{ fontSize: 7.5, color: COLORS.ink500 }}>
              Thank you,
            </Text>
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: COLORS.ink900, marginTop: 2 }}>
              Power Bank Bangladesh
            </Text>
          </View>
          <View style={styles.signatoryRight}>
            <View style={styles.signatureSpace} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatoryName}>
              {quotation.signatoryName || "Md Tawfikur Rahman"}
            </Text>
            <Text style={styles.signatoryRole}>
              {quotation.signatoryTitle || "Manager (CEO)"}
            </Text>
            <Text style={styles.signatoryRole}>
              {quotation.signatoryPhone || "Cell: +88 (0) 1989 474 447"}
            </Text>
          </View>
        </View>

        {/* Page 2 Footer */}
        <View style={styles.footerStrip}>
          <Text style={styles.footerBrandText}>
            Powered by: CAT | DOOSAN | CUMMINS | PERKINS | RICARDO | VOLVO PENTA | JOHN DEERE
          </Text>
          <Text style={styles.pageNumber}>Page 2 of 2</Text>
        </View>
      </Page>
    </Document>
  );
}

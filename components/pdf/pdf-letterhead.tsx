// Shared PBB letterhead for every commercial PDF (quotations, invoices):
// page box, logo watermark, contact header and brand footer strip.
// Keep these identical across documents; change them here only.

import React from "react";
import { Text, View, Image, StyleSheet } from "@react-pdf/renderer";

// Color Palette matching PBB Brand & Commercial Guidelines
export const PDF_COLORS = {
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

const COLORS = PDF_COLORS;

export const letterheadStyles = StyleSheet.create({
  page: {
    size: "A4",
    paddingTop: 36,     // Top margin (e.g. 0.5 inch / 36 pt)
    paddingBottom: 36,  // Bottom margin
    paddingLeft: 72,    // Left margin
    paddingRight: 72,   // Right margin
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

const styles = letterheadStyles;

/** Faint rotated logo behind the page content. `fixed` repeats it on overflow pages. */
export function PdfWatermark({ logoSrc }: { logoSrc?: string }) {
  if (!logoSrc) return null;
  return (
    <View style={styles.watermarkContainer} fixed>
      <Image src={logoSrc} style={styles.watermarkImage} />
    </View>
  );
}

/** Contact details on the left, PBB logo on the right. */
export function PdfHeader({ logoSrc, fixed = false }: { logoSrc?: string; fixed?: boolean }) {
  return (
    <View style={styles.headerRow} fixed={fixed}>
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
      {logoSrc ? <Image src={logoSrc} style={styles.headerLogo} /> : null}
    </View>
  );
}

/**
 * Brand strip pinned to the bottom of the page. Pass `pageLabel` for a
 * fixed-length document; without it the page count is computed per page.
 */
export function PdfFooter({ pageLabel }: { pageLabel?: string }) {
  return (
    <View style={styles.footerStrip} fixed>
      <Text style={styles.footerBrandText}>
        Powered by: CAT | DOOSAN | CUMMINS | PERKINS | RICARDO | VOLVO PENTA | JOHN DEERE
      </Text>
      {pageLabel ? (
        <Text style={styles.pageNumber}>{pageLabel}</Text>
      ) : (
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      )}
    </View>
  );
}

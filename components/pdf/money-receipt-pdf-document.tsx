// Money receipt PDF: a tear-off stub on the left, the receipt on the right.
//
// Laid out from measurements of the approved artwork (1600 x 693 px). Every
// coordinate below is in those reference pixels and `u()` converts to PDF
// points at 0.5 pt per px, so the page is 800 x 346.5 pt (about 282 x 122 mm)
// with exactly the artwork's proportions. To print larger or smaller, change
// SCALE only.

import React from "react";
import { Document, Page, Text, View, Image, Svg, Line, Path } from "@react-pdf/renderer";
import type { MoneyReceiptRecord } from "../../lib/money-receipts";
import { formatBdtCurrency, numberToTakaWords } from "../../lib/format-bdt-words";
import { formatQuotationDateTime } from "../../lib/format-date";
import { fitFontSize, textWidth } from "../../lib/pdf/text-width";

const SCALE = 0.5;
const u = (px: number) => px * SCALE;

const PAGE_PX = { w: 1600, h: 693 };

// Colours sampled from the artwork. The band orange is the artwork's own
// (slightly lighter than the website's brand-500) and the text is its
// near-black, so the print matches the approved design.
const PAPER = "#FEFEF6";
const ORANGE = "#EF8333";
const INK = "#010000";
const RULE = "#2D2D25";
const STUB_BOX = "#45443F";
const AMOUNT_BOX = "#74736E";
const CHECK_BOX = "#54544C";
const FOOTER_TEXT = "#4B4E47";
const DATE_CELL = "#E4E5EA";
const CUT_LINE = "#E2E2DA";

// Font sizes in reference px.
const LABEL = 20.4;
const STUB_LABEL = 15.1;
const SMALL = 16.5;

// public/logo.png is 533 x 401; its solid artwork (not the faint edge) sits inside this box.
const LOGO = { w: 533, h: 401, x0: 45, y0: 71, x1: 496, y1: 376 };

type Px = { x0: number; y0: number; x1: number; y1: number };

/** Place the logo file so its artwork exactly fills `target`. */
function logoStyle(target: Px) {
  const sx = (target.x1 - target.x0 + 1) / (LOGO.x1 - LOGO.x0 + 1);
  const sy = (target.y1 - target.y0 + 1) / (LOGO.y1 - LOGO.y0 + 1);
  return {
    position: "absolute" as const,
    left: u(target.x0 - LOGO.x0 * sx),
    top: u(target.y0 - LOGO.y0 * sy),
    width: u(LOGO.w * sx),
    height: u(LOGO.h * sy),
  };
}

function Rect({
  x,
  y,
  w,
  h,
  fill,
  border,
  borderColor,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  border?: number;
  borderColor?: string;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left: u(x),
        top: u(y),
        width: u(w),
        height: u(h),
        backgroundColor: fill,
        borderWidth: border ? u(border) : 0,
        borderColor,
      }}
    />
  );
}

/** Horizontal 2px rule between inclusive pixel columns x0..x1, starting at row y. */
function Rule({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  return <Rect x={x0} y={y} w={x1 - x0 + 1} h={2} fill={RULE} />;
}

/** Box outline given by inclusive pixel bounds, with a 2px border. */
function Box({ x0, y0, x1, y1, color }: Px & { color: string }) {
  return (
    <Rect x={x0} y={y0} w={x1 - x0 + 1} h={y1 - y0 + 1} border={2} borderColor={color} />
  );
}

/**
 * Text placed by its left edge and baseline. react-pdf puts the baseline at
 * 0.9 x font size below the top of the text box (Helvetica), so top is derived.
 */
function Txt({
  x,
  base,
  size,
  bold,
  color = INK,
  width,
  align,
  spacing,
  children,
}: {
  x: number;
  base: number;
  size: number;
  bold?: boolean;
  color?: string;
  width?: number;
  align?: "left" | "center" | "right";
  spacing?: number;
  children: React.ReactNode;
}) {
  return (
    <Text
      style={{
        position: "absolute",
        left: u(x),
        top: u(base) - 0.9 * u(size),
        width: width !== undefined ? u(width) : undefined,
        fontFamily: bold ? "Helvetica-Bold" : "Helvetica",
        fontSize: u(size),
        color,
        textAlign: align,
        letterSpacing: spacing !== undefined ? u(spacing) : undefined,
      }}
    >
      {children}
    </Text>
  );
}

/** A filled-in value that shrinks to fit the line it sits on. */
function Value({
  text,
  x,
  base,
  maxWidth,
  size,
  min,
  bold,
}: {
  text?: string;
  x: number;
  base: number;
  maxWidth: number;
  size: number;
  min: number;
  bold?: boolean;
}) {
  if (!text) return null;
  const fitted = fitFontSize(text, { maxWidth, size, min, bold });
  return (
    <Txt x={x} base={base} size={fitted} bold={bold} width={maxWidth}>
      {text}
    </Txt>
  );
}

/** Greedy word wrap using Helvetica widths; a single over-long word stays on its own line. */
function wrapWords(text: string, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * A value for the narrow stub: stays on one line at full size when it fits,
 * otherwise wraps to up to `maxLines` lines at the largest size that works
 * (never below `min`). Lines grow upward from `base`, the baseline of the
 * last line, so the text always rests on its rule or box.
 */
function StubValue({
  text,
  x,
  base,
  centre,
  maxWidth,
  size,
  twoLineSize = size,
  min,
}: {
  text?: string;
  x: number;
  /** Baseline of the last line, for values that rest on a rule. */
  base?: number;
  /** Vertical centre, for values inside a box. Wins over `base`. */
  centre?: number;
  maxWidth: number;
  size: number;
  /** Largest size allowed once the value needs two lines. */
  twoLineSize?: number;
  min: number;
}) {
  if (!text) return null;
  let s = size;
  let lines = wrapWords(text, s, maxWidth);
  while (!(lines.length <= 1 || (lines.length <= 2 && s <= twoLineSize)) && s > min) {
    s = Math.max(min, s - 0.5);
    lines = wrapWords(text, s, maxWidth);
  }
  // Never more than two lines on the stub (it is only the tear-off copy; the
  // receipt itself prints the full text). Cut with "..." rather than collide
  // with the line below.
  if (lines.length > 2) {
    lines = lines.slice(0, 2);
    let last = lines[1];
    while (last.length > 1 && textWidth(last + "...", s) > maxWidth) {
      last = last.slice(0, -1).trimEnd();
    }
    lines[1] = last + "...";
  }
  const step = s * 1.18;
  const first =
    centre !== undefined
      ? centre - ((lines.length - 1) * step) / 2 + 0.36 * s
      : (base ?? 0) - (lines.length - 1) * step;
  return (
    <>
      {lines.map((line, i) => (
        <Txt key={i} x={x} base={first + i * step} size={s} width={maxWidth + 4}>
          {line}
        </Txt>
      ))}
    </>
  );
}

function Tick({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <Svg
      style={{ position: "absolute", left: u(x), top: u(y), width: u(w), height: u(h) }}
      viewBox="0 0 25 25"
    >
      <Path
        d="M5 13.5 L10.5 19 L20.5 6"
        stroke={INK}
        strokeWidth={2.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const DATE_CELL_X = [479, 514, 554, 588, 629, 663, 698, 733];

function dateDigits(iso?: string): string[] {
  const m = String(iso ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return [];
  const [, yyyy, mm, dd] = m;
  return `${dd}${mm}${yyyy}`.split("");
}

function formatShortDate(iso?: string) {
  return iso ? formatQuotationDateTime(iso).date : "";
}

interface MoneyReceiptPdfProps {
  receipt: MoneyReceiptRecord;
  logoSrc?: string;
}

export function MoneyReceiptPdfDocument({ receipt, logoSrc }: MoneyReceiptPdfProps) {
  const amount = receipt.amount > 0 ? Math.round(receipt.amount) : 0;
  const amountText = amount > 0 ? formatBdtCurrency(amount) : "";
  const words = amount > 0 ? receipt.amountInWords || numberToTakaWords(amount) : "";
  const isCheque = receipt.paymentMode === "cheque";
  const digits = dateDigits(receipt.receiptDate);

  const chequeDate = formatShortDate(receipt.chequeDate);
  const stubMode = isCheque
    ? ["Cheque No. " + (receipt.chequeNo ?? ""), receipt.chequeBank, chequeDate]
        .filter((p, i) => (i === 0 ? Boolean(receipt.chequeNo) : Boolean(p)))
        .join(", ") || "Cheque"
    : receipt.paymentMode === "cash"
      ? "Cash"
      : "";

  return (
    <Document
      title={`MoneyReceipt_${receipt.receiptNumber}`}
      author="Power Bank Bangladesh"
      subject={`Money Receipt ${receipt.receiptNumber}`}
    >
      <Page size={[u(PAGE_PX.w), u(PAGE_PX.h)]} style={{ backgroundColor: PAPER }}>
        {/* ---------------- Watermarks (behind everything) ---------------- */}
        {logoSrc ? (
          <>
            <Image
              src={logoSrc}
              style={{
                position: "absolute",
                left: u(489.5),
                top: u(52),
                width: u(861),
                // Kept inside the page: react-pdf loops forever on an image box
                // that runs past the bottom edge (the logo file's blank margin).
                height: u(640),
                opacity: 0.045,
              }}
            />
            <Image
              src={logoSrc}
              style={{
                position: "absolute",
                left: u(52),
                top: u(277),
                width: u(283),
                height: u(213),
                opacity: 0.045,
              }}
            />
          </>
        ) : null}

        {/* The approved watermark is the mark only; hide the logo file's small caption. */}
        <Rect x={636} y={566} w={666} h={50} fill={PAPER} />
        <Rect x={96} y={446} w={230} h={19} fill={PAPER} />

        {/* Tear line between stub and receipt */}
        <Svg
          style={{ position: "absolute", left: u(372), top: 0, width: u(6), height: u(PAGE_PX.h) }}
          viewBox={`0 0 6 ${PAGE_PX.h}`}
        >
          <Line
            x1={2.25}
            x2={2.25}
            y1={2}
            y2={PAGE_PX.h}
            stroke={CUT_LINE}
            strokeWidth={1.6}
            strokeDasharray="5.3 5.9"
          />
        </Svg>

        {/* ============================ STUB ============================ */}
        <Rect x={0} y={0} w={180} h={125} fill={ORANGE} />
        <Txt x={22} base={89} size={16.4} bold color="#FFFFFF" spacing={0.6}>
          MONEY RECEIPT
        </Txt>
        {logoSrc ? (
          <Image src={logoSrc} style={logoStyle({ x0: 208, y0: 35, x1: 340, y1: 123 })} />
        ) : null}

        <Txt x={22} base={163} size={LABEL}>
          No:
        </Txt>
        <Txt x={66} base={163} size={17} bold>
          {receipt.receiptNumber}
        </Txt>

        <Txt x={22} base={207} size={STUB_LABEL}>
          Received from
        </Txt>
        <Rule x0={124} x1={345} y={207} />
        <StubValue text={receipt.receivedFrom} x={128} base={203} maxWidth={214} size={15.5} twoLineSize={14} min={9} />

        <Txt x={21} base={243} size={STUB_LABEL}>
          a sum of taka
        </Txt>
        <Rule x0={112} x1={344} y={243} />
        <StubValue text={words} x={117} base={239} maxWidth={224} size={15} twoLineSize={13.5} min={9} />

        <Box x0={18} y0={264} x1={351} y1={303} color={STUB_BOX} />
        <Txt x={29} base={291} size={21.5}>
          Tk.
        </Txt>
        <Value text={amountText} x={68} base={291} maxWidth={275} size={21} min={12} bold />

        <Txt x={21} base={341} size={STUB_LABEL} bold>
          on account of:
        </Txt>
        <Box x0={18} y0={353} x1={351} y1={391} color={STUB_BOX} />
        <Box x0={18} y0={401} x1={351} y1={439} color={STUB_BOX} />
        <StubValue text={receipt.onAccountOf} x={28} centre={372} maxWidth={314} size={15.5} twoLineSize={12.5} min={9.5} />
        <StubValue text={receipt.onAccountOf2} x={28} centre={420} maxWidth={314} size={15.5} twoLineSize={12.5} min={9.5} />

        <Txt x={21} base={466} size={STUB_LABEL} bold>
          mode of Payment:
        </Txt>
        <Box x0={18} y0={475} x1={351} y1={513} color={STUB_BOX} />
        <StubValue text={stubMode} x={28} centre={494} maxWidth={314} size={15.5} twoLineSize={12.5} min={9.5} />

        <Box x0={18} y0={527} x1={351} y1={593} color={STUB_BOX} />
        <Txt x={28} base={550} size={15.3} width={314}>
          note:
          {receipt.note ? ` ${receipt.note}` : ""}
        </Txt>

        <Rule x0={23} x1={120} y={642} />
        <Rule x0={214} x1={331} y={642} />
        <Txt x={37} base={666} size={SMALL}>
          Authority
        </Txt>
        <Txt x={227} base={666} size={SMALL}>
          Received by
        </Txt>

        {/* =========================== RECEIPT =========================== */}
        <Rect x={375} y={0} w={816} h={125} fill={ORANGE} />
        <Txt x={424} base={89} size={53} bold color="#FFFFFF" spacing={-1.35}>
          MONEY RECEIPT
        </Txt>
        {logoSrc ? (
          <Image src={logoSrc} style={logoStyle({ x0: 1255, y0: 35, x1: 1535, y1: 223 })} />
        ) : null}

        <Txt x={426} base={169} size={LABEL}>
          No:
        </Txt>
        <Txt x={472} base={169} size={LABEL} bold>
          {receipt.receiptNumber}
        </Txt>

        <Txt x={426} base={218} size={LABEL}>
          Date.
        </Txt>
        {DATE_CELL_X.map((x, i) => (
          <React.Fragment key={x}>
            <Rect x={x} y={196} w={31} h={31} fill={DATE_CELL} />
            {digits[i] ? (
              <Txt x={x} base={218.5} size={LABEL} bold width={31} align="center">
                {digits[i]}
              </Txt>
            ) : null}
          </React.Fragment>
        ))}

        <Txt x={426} base={269} size={LABEL}>
          Received with thanks from
        </Txt>
        <Rule x0={673} x1={1303} y={270} />
        <Value text={receipt.receivedFrom} x={679} base={265} maxWidth={618} size={LABEL} min={12} />

        <Txt x={425} base={316} size={LABEL}>
          a sum of taka
        </Txt>
        <Rule x0={546} x1={1298} y={317} />
        <Value text={words} x={552} base={312} maxWidth={740} size={LABEL} min={12} />

        <Box x0={1314} y0={258} x1={1568} y1={321} color={AMOUNT_BOX} />
        <Txt x={1326} base={309} size={21.5}>
          Tk.
        </Txt>
        <Value text={amountText} x={1372} base={309} maxWidth={188} size={22} min={13} bold />

        <Txt x={425} base={377} size={LABEL} bold>
          on account of:
        </Txt>
        <Rule x0={423} x1={1548} y={414} />
        <Rule x0={691} x1={1554} y={462} />
        <Value text={receipt.onAccountOf} x={429} base={409} maxWidth={1112} size={LABEL} min={12} />
        <Value text={receipt.onAccountOf2} x={697} base={457} maxWidth={850} size={LABEL} min={12} />

        <Txt x={425} base={486} size={LABEL} bold>
          mode of Payment:
        </Txt>

        <Box x0={426} y0={511} x1={450} y1={535} color={CHECK_BOX} />
        {!isCheque && receipt.paymentMode === "cash" ? (
          <Tick x={426} y={511} w={25} h={25} />
        ) : null}
        <Txt x={460} base={532} size={LABEL}>
          Cash
        </Txt>

        <Box x0={528} y0={511} x1={553} y1={535} color={CHECK_BOX} />
        {isCheque ? <Tick x={528} y={511} w={26} h={25} /> : null}
        <Txt x={566} base={532} size={LABEL}>
          Cheque No.
        </Txt>
        <Rule x0={676} x1={1417} y={534} />
        <Value
          text={isCheque ? receipt.chequeNo : ""}
          x={682}
          base={528}
          maxWidth={728}
          size={LABEL}
          min={12}
        />

        <Txt x={567} base={582} size={LABEL}>
          Drawn on.
        </Txt>
        <Rule x0={664} x1={1062} y={583} />
        <Value
          text={isCheque ? receipt.chequeBank : ""}
          x={670}
          base={578}
          maxWidth={386}
          size={LABEL}
          min={12}
        />
        <Txt x={1092} base={582} size={LABEL}>
          Dated.
        </Txt>
        <Rule x0={1154} x1={1419} y={583} />
        <Value
          text={isCheque ? chequeDate : ""}
          x={1160}
          base={578}
          maxWidth={254}
          size={LABEL}
          min={12}
        />

        <Txt x={423} base={648} size={SMALL} color={FOOTER_TEXT}>
          Address: Kamalapur, Biruliya, Savar, Dhaka
        </Txt>
        <Txt x={424} base={666} size={SMALL} color={FOOTER_TEXT}>
          Cell: +8801989474447
        </Txt>

        <Rule x0={1199} x1={1326} y={642} />
        <Rule x0={1409} x1={1535} y={642} />
        <Txt x={1218} base={666} size={SMALL}>
          Received by
        </Txt>
        <Txt x={1445} base={666} size={SMALL}>
          Authority
        </Txt>
      </Page>
    </Document>
  );
}

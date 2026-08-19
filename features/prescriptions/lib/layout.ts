/**
 * Shared A4 prescription layout coordinates (percent of sheet).
 * Used by on-screen preview and PDF — keep as the single source of truth.
 */

export const PRESCRIPTION_TEMPLATE_PATH = "/prescription-template.jpeg" as const;

/** CSS size matching A4 portrait. */
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

export type OverlayBox = {
  top: number;
  left: number;
  width: number;
  height?: number;
};

/**
 * Coordinates derived from the printed template artwork (1414x2000 px):
 * header labels sit on two rows — "Name / Age-Gender / Date" (glyphs 19.6%-21.0%)
 * and "Mobile No / OPD no" (glyphs 23.2%-24.3%). Values are boxed in the gap
 * that follows each label so nothing overlaps the pre-printed text.
 */
export const prescriptionPositions = {
  patientName: { top: 19.6, left: 12.5, width: 29 } satisfies OverlayBox,
  ageSex: { top: 19.6, left: 59, width: 19 } satisfies OverlayBox,
  date: { top: 19.6, left: 87, width: 11 } satisfies OverlayBox,
  mobile: { top: 23.15, left: 17, width: 24.5 } satisfies OverlayBox,
  opdNumber: { top: 23.15, left: 54.5, width: 23.5 } satisfies OverlayBox,
  /** Starts right of the pre-printed Rx glyph (3.5%-9.4% wide, ends at 31.9%). */
  content: {
    top: 27.4,
    left: 11,
    width: 80,
    height: 57,
  } satisfies OverlayBox,
  /** Sits above the footer rule at 96.45%. */
  signature: {
    top: 86,
    left: 61,
    width: 30,
    height: 7,
  } satisfies OverlayBox,
  pageBadge: { top: 3, left: 86, width: 10 } satisfies OverlayBox,
} as const;

/**
 * Medicine table columns — shared by the rendered table and the pagination
 * cost estimator so wrapping predictions match what actually prints.
 */
export const PRESCRIPTION_MEDICINE_COLUMNS = [
  { key: "serial", label: "#", widthPercent: 5, align: "center" },
  { key: "medicineName", label: "Medicine", widthPercent: 26, align: "left" },
  { key: "dosage", label: "Dosage", widthPercent: 14, align: "left" },
  { key: "frequency", label: "Frequency", widthPercent: 15, align: "center" },
  { key: "duration", label: "Duration", widthPercent: 15, align: "center" },
  {
    key: "instructions",
    label: "Instructions",
    widthPercent: 25,
    align: "left",
  },
] as const;

export type PrescriptionMedicineColumn =
  (typeof PRESCRIPTION_MEDICINE_COLUMNS)[number];

export const PRESCRIPTION_LAYOUT = {
  /**
   * Characters per printed line at 12pt Montserrat across the 168mm content
   * box. Chromium measures ~80 for running text; kept lower so the estimate
   * errs towards predicting an extra line rather than one too few.
   */
  charsPerLine: 74,
  /**
   * Medical History values sit in the right column of a label/value grid, so
   * they wrap earlier than full-width body copy. The `max-content` label
   * column is at its widest (~40mm) when "Current Medication" is present,
   * leaving ~56 characters — kept a touch under that.
   */
  medicalHistoryCharsPerLine: 54,
  bodyLineHeight: 1.4,
  bodyFontSizePt: 12,
  /** Header overlay values (name / age / date / mobile / OPD). */
  headerFontSizePt: 10.5,
  /** Medicine table body text — one step down from the body copy. */
  tableFontSizePt: 10.5,
  /** Uppercase micro-labels for section headings and table headers. */
  labelFontSizePt: 9,
} as const;

const MM_PER_PT = 25.4 / 72;
/** A 1px CSS border at 96dpi. */
const HAIRLINE_MM = 25.4 / 96;

function lineBoxMm(fontSizePt: number): number {
  return fontSizePt * PRESCRIPTION_LAYOUT.bodyLineHeight * MM_PER_PT;
}

/**
 * Millimetre heights of every block the writing area can hold, mirroring the
 * padding/border/line-height declared in `PrescriptionPreview`. Pagination
 * budgets in millimetres rather than abstract "lines" so a sheet is only split
 * once it genuinely runs out of room — PDF generation re-measures the rendered
 * DOM and rejects any sheet that overflows, so these must stay in sync with
 * the component.
 */
export const PRESCRIPTION_METRICS = {
  contentHeightMm: (A4_HEIGHT_MM * prescriptionPositions.content.height) / 100,
  /** Absorbs font-metric and text-wrapping differences against Chromium. */
  safetyMarginMm: 6,
  /** `gap-[3mm]` between top-level sections of the writing area. */
  sectionGapMm: 3,
  bodyLineMm: lineBoxMm(PRESCRIPTION_LAYOUT.bodyFontSizePt),
  tableLineMm: lineBoxMm(PRESCRIPTION_LAYOUT.tableFontSizePt),
  continuationHeadingMm: lineBoxMm(PRESCRIPTION_LAYOUT.labelFontSizePt),
  medicalHistory: {
    /** `py-[2mm]` plus the `border-y` hairlines of the callout. */
    framingMm: 4 + 2 * HAIRLINE_MM,
    /** Callout heading plus its `mb-[1.2mm]`. */
    headingMm: lineBoxMm(PRESCRIPTION_LAYOUT.labelFontSizePt) + 1.2,
    /** `gap-y-[0.6mm]` between definition-list rows. */
    rowGapMm: 0.6,
  },
  medicineTable: {
    /** `py-[1.5mm]` header cells plus their `border-y` hairlines. */
    headerMm:
      3 + lineBoxMm(PRESCRIPTION_LAYOUT.labelFontSizePt) + 2 * HAIRLINE_MM,
    /** `py-[1.4mm]` body cells plus the row `border-b`. */
    rowFramingMm: 2.8 + HAIRLINE_MM,
  },
  /** Pill badge: `py-[1.1mm]` plus its border. */
  followUpMm:
    lineBoxMm(PRESCRIPTION_LAYOUT.tableFontSizePt) + 2.2 + 2 * HAIRLINE_MM,
} as const;

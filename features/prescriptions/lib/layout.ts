/**
 * Shared A4 prescription layout coordinates (percent of sheet).
 * Used by on-screen preview and PDF — keep as the single source of truth.
 */

export const PRESCRIPTION_TEMPLATE_PATH = "/prescription-template.png" as const;

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
   * they wrap far earlier than full-width body copy.
   */
  medicalHistoryCharsPerLine: 48,
  /**
   * Safe capacity of the fixed writing area. Chromium fits 28.5 lines of
   * 12pt/1.4 copy in 57% of 297mm; the 3mm section gaps, history callout
   * padding and row gaps that the cost model does not charge add up to
   * ~3.9 lines in the worst case, and the remainder absorbs wrapping
   * surprises. Staying conservative matters — PDF generation rejects a
   * sheet whose content overflows.
   */
  contentLineCapacity: 23,
  continuationHeadingLineCost: 1,
  /** Header row + cell padding charged once per page that carries medicines. */
  medicineTableHeaderLineCost: 2,
  /** Vertical cell padding amortised per medicine row. */
  medicineRowPaddingLineCost: 1,
  followUpLineCost: 2,
  bodyLineHeight: 1.4,
  bodyFontSizePt: 12,
  /** Header overlay values (name / age / date / mobile / OPD). */
  headerFontSizePt: 10.5,
  /** Medicine table body text — one step down from the body copy. */
  tableFontSizePt: 10.5,
  /** Uppercase micro-labels for section headings and table headers. */
  labelFontSizePt: 9,
} as const;

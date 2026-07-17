/**
 * Shared A4 prescription layout coordinates (percent of sheet).
 * Used by on-screen preview and PDF — keep as the single source of truth.
 */

export const PRESCRIPTION_TEMPLATE_PATH =
  "/images/prescription-template.jpeg" as const;

/** CSS size matching A4 portrait. */
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

export type OverlayBox = {
  top: number;
  left: number;
  width: number;
  height?: number;
};

export const PRESCRIPTION_LAYOUT = {
  /** Approximate characters per diagnosis/notes line at configured font. */
  charsPerLine: 72,
  /** Medicine rows that fit on the first sheet body. */
  medicinesPerFirstPage: 8,
  /** Medicine rows on continuation sheets. */
  medicinesPerContinuationPage: 12,
  /** Text block lines reserved above medicines on first page. */
  textLinesPerFirstPage: 6,
  textLinesPerContinuationPage: 10,

  patientName: { top: 22.8, left: 22, width: 42 } satisfies OverlayBox,
  ageSex: { top: 25.6, left: 22, width: 28 } satisfies OverlayBox,
  date: { top: 22.8, left: 68, width: 26 } satisfies OverlayBox,
  opd: { top: 25.6, left: 68, width: 26 } satisfies OverlayBox,

  bodyStartTop: 32,
  bodyLeft: 12,
  bodyWidth: 76,
  bodyLineHeight: 1.35,
  bodyFontSizePx: 11,

  signature: { top: 78, left: 58, width: 32 } satisfies OverlayBox,
  pageBadge: { top: 3, left: 86, width: 10 } satisfies OverlayBox,
} as const;

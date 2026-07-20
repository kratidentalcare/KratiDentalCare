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

export const prescriptionPositions = {
  patientName: {
    top: 25.75,
    left: 25.5,
    width: 28.5,
  } satisfies OverlayBox,
  ageSex: { top: 29.75, left: 17, width: 18 } satisfies OverlayBox,
  date: { top: 25.75, left: 72.5, width: 21.5 } satisfies OverlayBox,
  opdNumber: {
    top: 29.75,
    left: 76.5,
    width: 17.5,
  } satisfies OverlayBox,
  content: {
    top: 39.5,
    left: 8.5,
    width: 83,
    height: 31.5,
  } satisfies OverlayBox,
  signature: {
    top: 72,
    left: 61,
    width: 30,
    height: 5.5,
  } satisfies OverlayBox,
  pageBadge: { top: 3, left: 86, width: 10 } satisfies OverlayBox,
} as const;

export const PRESCRIPTION_LAYOUT = {
  /** Approximate characters per printed line at 11pt within the content box. */
  charsPerLine: 82,
  /** Conservative measured capacity of the fixed writing area. */
  contentLineCapacity: 18,
  continuationHeadingLineCost: 1,
  medicineSpacingLineCost: 1,
  followUpLineCost: 2,
  bodyLineHeight: 1.35,
  bodyFontSizePt: 11,
} as const;

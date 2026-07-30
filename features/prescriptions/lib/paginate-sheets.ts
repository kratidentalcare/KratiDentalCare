import {
  PRESCRIPTION_LAYOUT,
  PRESCRIPTION_MEDICINE_COLUMNS,
  PRESCRIPTION_METRICS,
} from "@/features/prescriptions/lib/layout";
import {
  buildMedicalHistoryLines,
  medicalHistoryHeightMm,
} from "@/features/prescriptions/lib/medical-history";
import type {
  PrescriptionMedicalHistoryDto,
  PrescriptionMedicineDto,
  PrescriptionPreviewData,
  PrescriptionPreviewSheet,
} from "@/features/prescriptions/types";

function wrapText(text: string, charsPerLine: number): string[] {
  const normalized = text.trim();
  if (!normalized) {
    return [];
  }

  const words = normalized.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= charsPerLine) {
      current = next;
      continue;
    }
    if (current) {
      lines.push(current);
    }
    if (word.length <= charsPerLine) {
      current = word;
    } else {
      // Hard-wrap very long tokens.
      let remaining = word;
      while (remaining.length > charsPerLine) {
        lines.push(remaining.slice(0, charsPerLine));
        remaining = remaining.slice(charsPerLine);
      }
      current = remaining;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

type TextBucket = {
  key: "diagnosis" | "chiefComplaint" | "clinicalNotes" | "advice";
  label: string;
  lines: string[];
};

function buildTextBuckets(data: PrescriptionPreviewData): TextBucket[] {
  const chars = PRESCRIPTION_LAYOUT.charsPerLine;
  const buckets: TextBucket[] = [];

  const diagnosis = wrapText(data.diagnosis, chars);
  if (diagnosis.length) {
    buckets.push({ key: "diagnosis", label: "Diagnosis", lines: diagnosis });
  }

  const complaint = wrapText(data.chiefComplaint, chars);
  if (complaint.length) {
    buckets.push({
      key: "chiefComplaint",
      label: "Chief complaint",
      lines: complaint,
    });
  }

  const notes = wrapText(data.clinicalNotes, chars);
  if (notes.length) {
    buckets.push({
      key: "clinicalNotes",
      label: "Clinical notes",
      lines: notes,
    });
  }

  const advice = wrapText(data.advice, chars);
  if (advice.length) {
    buckets.push({ key: "advice", label: "Advice", lines: advice });
  }

  return buckets;
}

/** A table row is as tall as its tallest wrapped cell. */
function medicineRowHeightMm(medicine: PrescriptionMedicineDto): number {
  const cellValues: Record<string, string> = {
    serial: "00",
    medicineName: medicine.medicineName,
    dosage: medicine.dosage,
    frequency: medicine.frequency,
    duration: medicine.duration,
    instructions: medicine.instructions ?? "",
  };

  const tallestCell = PRESCRIPTION_MEDICINE_COLUMNS.reduce(
    (tallest, column) => {
      const columnChars = Math.max(
        1,
        Math.floor(
          (PRESCRIPTION_LAYOUT.charsPerLine * column.widthPercent) / 100,
        ),
      );
      const cellLines = wrapText(
        cellValues[column.key] ?? "",
        columnChars,
      ).length;
      return Math.max(tallest, cellLines);
    },
    1,
  );

  return (
    tallestCell * PRESCRIPTION_METRICS.tableLineMm +
    PRESCRIPTION_METRICS.medicineTable.rowFramingMm
  );
}

function emptySheetBody(): Pick<
  PrescriptionPreviewSheet,
  | "medicalHistory"
  | "diagnosisLines"
  | "chiefComplaintLines"
  | "clinicalNotesLines"
  | "adviceLines"
  | "medications"
  | "followUpLabel"
> {
  return {
    medicalHistory: [],
    diagnosisLines: [],
    chiefComplaintLines: [],
    clinicalNotesLines: [],
    adviceLines: [],
    medications: [],
    followUpLabel: "",
  };
}

/**
 * Deterministically paginate preview content into template-backed sheets.
 * First + continuation pages share the same header overlays.
 */
export function paginatePrescriptionSheets(
  data: PrescriptionPreviewData,
): PrescriptionPreviewSheet[] {
  const historyLines = buildMedicalHistoryLines(data.medicalHistory);
  const historyHeightMm = medicalHistoryHeightMm(
    historyLines,
    PRESCRIPTION_LAYOUT.medicalHistoryCharsPerLine,
  );
  const buckets = buildTextBuckets(data);
  const medicines = data.medications;
  const followUp = data.followUpLabel.trim();

  const { bodyLineMm, sectionGapMm } = PRESCRIPTION_METRICS;
  const pageBudgetMm =
    PRESCRIPTION_METRICS.contentHeightMm - PRESCRIPTION_METRICS.safetyMarginMm;

  type PageDraft = {
    remainingMm: number;
    /** A further section on this page would be preceded by a `gap-[3mm]`. */
    hasSection: boolean;
    isContinuation: boolean;
    body: ReturnType<typeof emptySheetBody>;
  };

  const pages: PageDraft[] = [];

  function startPage(isContinuation: boolean): PageDraft {
    const page: PageDraft = {
      isContinuation,
      remainingMm:
        pageBudgetMm -
        (isContinuation ? PRESCRIPTION_METRICS.continuationHeadingMm : 0),
      hasSection: isContinuation,
      body: emptySheetBody(),
    };
    pages.push(page);
    return page;
  }

  let page = startPage(false);

  /** Height a new section costs on the current page, gap included. */
  function sectionCostMm(heightMm: number): number {
    return heightMm + (page.hasSection ? sectionGapMm : 0);
  }

  function claimSection(heightMm: number) {
    page.remainingMm -= sectionCostMm(heightMm);
    page.hasSection = true;
  }

  // Medical History always leads content on the first sheet when present.
  if (historyLines.length > 0) {
    page.body.medicalHistory = historyLines;
    claimSection(historyHeightMm);
  }

  function appendLabeledLines(
    targetKey: TextBucket["key"],
    label: string,
    lines: string[],
  ) {
    let index = 0;
    while (index < lines.length) {
      const gapMm = page.hasSection ? sectionGapMm : 0;
      const room = Math.floor((page.remainingMm - gapMm) / bodyLineMm);
      if (room < 1) {
        page = startPage(true);
        continue;
      }

      const slice = lines.slice(index, index + room);
      const firstLine = slice[0] ?? "";
      const prefixed = [`${label}: ${firstLine}`, ...slice.slice(1)];

      const field =
        targetKey === "diagnosis"
          ? "diagnosisLines"
          : targetKey === "chiefComplaint"
            ? "chiefComplaintLines"
            : targetKey === "clinicalNotes"
              ? "clinicalNotesLines"
              : "adviceLines";

      page.body[field].push(...prefixed);
      claimSection(prefixed.length * bodyLineMm);
      index += slice.length;
    }
  }

  for (const bucket of buckets) {
    appendLabeledLines(bucket.key, bucket.label, bucket.lines);
  }

  let medIndex = 0;
  while (medIndex < medicines.length) {
    const medicine = medicines[medIndex];
    if (!medicine) {
      break;
    }
    // The table header reprints on every page that carries medicines.
    const isFirstRow = page.body.medications.length === 0;
    const rowMm = medicineRowHeightMm(medicine);
    const costMm = isFirstRow
      ? sectionCostMm(PRESCRIPTION_METRICS.medicineTable.headerMm + rowMm)
      : rowMm;

    if (page.remainingMm < costMm && (page.hasSection || !isFirstRow)) {
      page = startPage(true);
      continue;
    }

    page.body.medications.push(medicine);
    page.remainingMm -= costMm;
    page.hasSection = true;
    medIndex += 1;
  }

  if (followUp) {
    if (page.remainingMm < sectionCostMm(PRESCRIPTION_METRICS.followUpMm)) {
      page = startPage(true);
    }
    page.body.followUpLabel = followUp;
    claimSection(PRESCRIPTION_METRICS.followUpMm);
  }

  // Ensure at least one sheet even for empty draft preview.
  if (pages.length === 0) {
    startPage(false);
  }

  const pageCount = pages.length;

  return pages.map((draft, pageIndex) => ({
    pageIndex,
    pageCount,
    isContinuation: draft.isContinuation,
    header: {
      patientName: data.patientName,
      ageSexLabel: data.ageSexLabel,
      dateLabel: data.dateLabel,
      mobileLabel: data.mobileLabel,
      opdLabel: data.opdLabel,
    },
    medicalHistory: draft.body.medicalHistory,
    diagnosisLines: draft.body.diagnosisLines,
    chiefComplaintLines: draft.body.chiefComplaintLines,
    clinicalNotesLines: draft.body.clinicalNotesLines,
    adviceLines: draft.body.adviceLines,
    followUpLabel: draft.body.followUpLabel,
    medications: draft.body.medications,
    doctorName: data.doctorName,
    doctorQualification: data.doctorQualification,
    signatureLabel: data.signatureLabel,
    showSignature: pageIndex === pageCount - 1,
  }));
}

export function toPreviewData(input: {
  patientName: string;
  ageSexLabel: string;
  dateLabel: string;
  mobileLabel: string;
  opdLabel: string;
  medicalHistory?: PrescriptionMedicalHistoryDto | null;
  diagnosis: string;
  chiefComplaint: string;
  clinicalNotes: string;
  advice: string;
  followUpLabel: string;
  medications: PrescriptionMedicineDto[];
  doctorName: string;
  doctorQualification: string | null;
}): PrescriptionPreviewData {
  return {
    ...input,
    medicalHistory: input.medicalHistory ?? null,
    signatureLabel: "Doctor's Signature",
  };
}

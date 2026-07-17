import { PRESCRIPTION_LAYOUT } from "@/features/prescriptions/lib/layout";
import type {
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

function emptySheetBody(): Pick<
  PrescriptionPreviewSheet,
  | "diagnosisLines"
  | "chiefComplaintLines"
  | "clinicalNotesLines"
  | "adviceLines"
  | "medications"
  | "followUpLabel"
> {
  return {
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
  const buckets = buildTextBuckets(data);
  const medicines = data.medications;
  const followUp = data.followUpLabel.trim();

  type PageDraft = {
    textLineBudget: number;
    medicineBudget: number;
    isContinuation: boolean;
    body: ReturnType<typeof emptySheetBody>;
  };

  const pages: PageDraft[] = [];

  function startPage(isContinuation: boolean): PageDraft {
    const page: PageDraft = {
      isContinuation,
      textLineBudget: isContinuation
        ? PRESCRIPTION_LAYOUT.textLinesPerContinuationPage
        : PRESCRIPTION_LAYOUT.textLinesPerFirstPage,
      medicineBudget: isContinuation
        ? PRESCRIPTION_LAYOUT.medicinesPerContinuationPage
        : PRESCRIPTION_LAYOUT.medicinesPerFirstPage,
      body: emptySheetBody(),
    };
    pages.push(page);
    return page;
  }

  let page = startPage(false);

  function ensureTextCapacity(neededLines: number) {
    if (page.textLineBudget >= neededLines) {
      return;
    }
    page = startPage(true);
  }

  function appendLabeledLines(
    targetKey: TextBucket["key"],
    label: string,
    lines: string[],
  ) {
    let index = 0;
    while (index < lines.length) {
      // Label + at least one content line.
      ensureTextCapacity(2);
      const room = Math.max(1, page.textLineBudget - 1);
      const slice = lines.slice(index, index + room);
      const prefixed = [`${label}:`, ...slice];

      const field =
        targetKey === "diagnosis"
          ? "diagnosisLines"
          : targetKey === "chiefComplaint"
            ? "chiefComplaintLines"
            : targetKey === "clinicalNotes"
              ? "clinicalNotesLines"
              : "adviceLines";

      page.body[field].push(...prefixed);
      page.textLineBudget -= prefixed.length;
      index += slice.length;
    }
  }

  for (const bucket of buckets) {
    appendLabeledLines(bucket.key, bucket.label, bucket.lines);
  }

  let medIndex = 0;
  while (medIndex < medicines.length) {
    if (page.medicineBudget <= 0) {
      page = startPage(true);
    }
    const room = page.medicineBudget;
    const slice: PrescriptionMedicineDto[] = medicines.slice(
      medIndex,
      medIndex + room,
    );
    page.body.medications.push(...slice);
    page.medicineBudget -= slice.length;
    medIndex += slice.length;
  }

  if (followUp) {
    if (page.textLineBudget < 1) {
      page = startPage(true);
    }
    page.body.followUpLabel = followUp;
    page.textLineBudget -= 1;
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
      opdLabel: data.opdLabel,
    },
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
  opdLabel: string;
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
    signatureLabel: "Doctor's Signature",
  };
}

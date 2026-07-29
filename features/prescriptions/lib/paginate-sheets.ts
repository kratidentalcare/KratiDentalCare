import { PRESCRIPTION_LAYOUT } from "@/features/prescriptions/lib/layout";
import {
  buildMedicalHistoryBlocks,
  medicalHistoryLineCost,
  type MedicalHistoryRenderBlock,
} from "@/features/prescriptions/lib/medical-history";
import type {
  PrescriptionMedicalHistoryDto,
  PrescriptionMedicalHistorySheet,
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

function blocksToSheet(
  blocks: MedicalHistoryRenderBlock[],
): PrescriptionMedicalHistorySheet | null {
  if (blocks.length === 0) {
    return null;
  }

  let currentMedication: string | null = null;
  let pregnantDueDateLabel: string | null = null;
  let nursing = false;
  let habits: string[] = [];
  let allergy: string | null = null;

  for (const block of blocks) {
    switch (block.kind) {
      case "kv":
        if (block.label === "Current Medication") {
          currentMedication = block.value;
        }
        break;
      case "pregnant":
        pregnantDueDateLabel = block.dueDateLabel;
        break;
      case "nursing":
        nursing = true;
        break;
      case "habits":
        habits = block.items;
        break;
      case "allergy":
        allergy = block.value;
        break;
      default:
        break;
    }
  }

  return {
    currentMedication,
    pregnantDueDateLabel,
    nursing,
    habits,
    allergy,
  };
}

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

function medicineLineCost(medicine: PrescriptionMedicineDto): number {
  const charsPerLine = PRESCRIPTION_LAYOUT.charsPerLine;
  const title = [medicine.medicineName, medicine.dosage]
    .filter(Boolean)
    .join(" ");
  const directions = [
    medicine.frequency,
    medicine.duration,
    medicine.instructions,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    Math.max(1, wrapText(title, charsPerLine).length) +
    Math.max(1, wrapText(directions, charsPerLine).length) +
    PRESCRIPTION_LAYOUT.medicineSpacingLineCost
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
    medicalHistory: null,
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
  const historyBlocks = buildMedicalHistoryBlocks(data.medicalHistory);
  const historySheet = blocksToSheet(historyBlocks);
  const historyCost = medicalHistoryLineCost(
    historyBlocks,
    PRESCRIPTION_LAYOUT.charsPerLine,
  );
  const buckets = buildTextBuckets(data);
  const medicines = data.medications;
  const followUp = data.followUpLabel.trim();

  type PageDraft = {
    lineBudget: number;
    isContinuation: boolean;
    body: ReturnType<typeof emptySheetBody>;
  };

  const pages: PageDraft[] = [];

  function startPage(isContinuation: boolean): PageDraft {
    const page: PageDraft = {
      isContinuation,
      lineBudget:
        PRESCRIPTION_LAYOUT.contentLineCapacity -
        (isContinuation ? PRESCRIPTION_LAYOUT.continuationHeadingLineCost : 0),
      body: emptySheetBody(),
    };
    pages.push(page);
    return page;
  }

  let page = startPage(false);

  function ensureCapacity(neededLines: number) {
    if (page.lineBudget >= neededLines) {
      return;
    }
    page = startPage(true);
  }

  // Medical History always leads content on the first sheet when present.
  if (historySheet && historyCost > 0) {
    page.body.medicalHistory = historySheet;
    page.lineBudget -= historyCost;
  }

  function appendLabeledLines(
    targetKey: TextBucket["key"],
    label: string,
    lines: string[],
  ) {
    let index = 0;
    while (index < lines.length) {
      ensureCapacity(1);
      const room = page.lineBudget;
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
      page.lineBudget -= prefixed.length;
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
    const itemCost = medicineLineCost(medicine);
    const pageHasContent =
      page.body.medicalHistory != null ||
      page.body.diagnosisLines.length > 0 ||
      page.body.chiefComplaintLines.length > 0 ||
      page.body.clinicalNotesLines.length > 0 ||
      page.body.adviceLines.length > 0 ||
      page.body.medications.length > 0;

    if (page.lineBudget < itemCost && pageHasContent) {
      page = startPage(true);
      continue;
    }

    page.body.medications.push(medicine);
    page.lineBudget -= itemCost;
    medIndex += 1;
  }

  if (followUp) {
    if (page.lineBudget < PRESCRIPTION_LAYOUT.followUpLineCost) {
      page = startPage(true);
    }
    page.body.followUpLabel = followUp;
    page.lineBudget -= PRESCRIPTION_LAYOUT.followUpLineCost;
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

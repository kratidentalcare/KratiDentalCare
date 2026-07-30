import { GENDERS, type Gender } from "@/constants/patient";
import { formatCivilDateLabel } from "@/features/prescriptions/lib/format";
import { PRESCRIPTION_METRICS } from "@/features/prescriptions/lib/layout";
import type {
  PrescriptionMedicalHistoryDto,
  PrescriptionMedicalHistoryLine,
} from "@/features/prescriptions/types";
import type { LeanPrescription } from "@/models/prescription";
import type { PrescriptionMedicalHistoryFormInput } from "@/validators/prescription";

export const EMPTY_MEDICAL_HISTORY: PrescriptionMedicalHistoryDto = {
  takingMedication: false,
  currentMedication: null,
  pregnant: false,
  dueDate: null,
  nursing: false,
  panMasala: false,
  tobacco: false,
  smoking: false,
  cigarettesPerDay: null,
  hasAllergy: false,
  allergyName: null,
};

export type MedicalHistoryRenderBlock =
  | {
      kind: "kv";
      label: string;
      value: string;
    }
  | {
      kind: "pregnant";
      dueDateLabel: string;
    }
  | {
      kind: "nursing";
    }
  | {
      kind: "habits";
      items: string[];
    }
  | {
      kind: "allergy";
      value: string;
    };

function isMeaningfulText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Build printable Medical History blocks — only meaningful Yes/values.
 * Never emits No / false / blank labels.
 */
export function buildMedicalHistoryBlocks(
  history: PrescriptionMedicalHistoryDto | null | undefined,
): MedicalHistoryRenderBlock[] {
  if (!history) {
    return [];
  }

  const blocks: MedicalHistoryRenderBlock[] = [];

  if (history.takingMedication && isMeaningfulText(history.currentMedication)) {
    blocks.push({
      kind: "kv",
      label: "Current Medication",
      value: history.currentMedication.trim(),
    });
  }

  if (history.pregnant && isMeaningfulText(history.dueDate)) {
    blocks.push({
      kind: "pregnant",
      dueDateLabel: formatCivilDateLabel(history.dueDate),
    });
  }

  if (history.nursing) {
    blocks.push({ kind: "nursing" });
  }

  const habits: string[] = [];
  if (history.panMasala) {
    habits.push("Pan Masala Chewing");
  }
  if (history.tobacco) {
    habits.push("Tobacco Chewing");
  }
  if (history.smoking && history.cigarettesPerDay != null) {
    habits.push(
      `Smoking (${history.cigarettesPerDay} Cigarettes/Day)`,
    );
  } else if (history.smoking) {
    habits.push("Smoking");
  }
  if (habits.length > 0) {
    blocks.push({ kind: "habits", items: habits });
  }

  if (history.hasAllergy && isMeaningfulText(history.allergyName)) {
    blocks.push({
      kind: "allergy",
      value: history.allergyName.trim(),
    });
  }

  return blocks;
}

/**
 * Printable Medical History rows — the single source of truth for the label
 * text, shared by the renderer and the pagination cost estimator.
 */
export function buildMedicalHistoryLines(
  history: PrescriptionMedicalHistoryDto | null | undefined,
): PrescriptionMedicalHistoryLine[] {
  return buildMedicalHistoryBlocks(history).map((block) => {
    switch (block.kind) {
      case "kv":
        return { label: block.label, value: block.value };
      case "pregnant":
        return {
          label: "Pregnant",
          value: `Yes (Due Date: ${block.dueDateLabel})`,
        };
      case "nursing":
        return { label: "Nursing Mother", value: "Yes" };
      case "habits":
        return { label: "Habits", value: block.items.join(", ") };
      case "allergy":
        return { label: "Allergy", value: block.value };
    }
  });
}

/** Rendered height of the Medical History callout, for pagination budgeting. */
export function medicalHistoryHeightMm(
  lines: PrescriptionMedicalHistoryLine[],
  charsPerLine: number,
): number {
  if (lines.length === 0) {
    return 0;
  }

  const { framingMm, headingMm, rowGapMm } = PRESCRIPTION_METRICS.medicalHistory;

  const rowsMm = lines.reduce((total, line) => {
    const text = `${line.label}: ${line.value}`;
    const wrapped = Math.max(1, Math.ceil(text.length / charsPerLine));
    return total + wrapped * PRESCRIPTION_METRICS.bodyLineMm;
  }, 0);

  return framingMm + headingMm + rowsMm + (lines.length - 1) * rowGapMm;
}

export function mapStoredMedicalHistory(
  stored: LeanPrescription["medicalHistory"] | null | undefined,
  timezoneCivilDate: (date: Date) => string,
): PrescriptionMedicalHistoryDto {
  if (!stored) {
    return { ...EMPTY_MEDICAL_HISTORY };
  }

  return {
    takingMedication: Boolean(stored.takingMedication),
    currentMedication: stored.currentMedication ?? null,
    pregnant: Boolean(stored.pregnant),
    dueDate: stored.dueDate ? timezoneCivilDate(stored.dueDate) : null,
    nursing: Boolean(stored.nursing),
    panMasala: Boolean(stored.panMasala),
    tobacco: Boolean(stored.tobacco),
    smoking: Boolean(stored.smoking),
    cigarettesPerDay: stored.cigarettesPerDay ?? null,
    hasAllergy: Boolean(stored.hasAllergy),
    allergyName: stored.allergyName ?? null,
  };
}

/**
 * Normalize form medical history for persistence.
 * Clears dependent fields when flags are off; clears women-only fields for non-female patients.
 */
export function sanitizeMedicalHistoryForSave(
  input: PrescriptionMedicalHistoryFormInput | undefined,
  patientGender: Gender | null | undefined,
  parseDueDate: (civil: string | null) => Date | null,
): LeanPrescription["medicalHistory"] {
  const source = input ?? EMPTY_MEDICAL_HISTORY;
  const isFemale = patientGender === GENDERS.FEMALE;

  const takingMedication = Boolean(source.takingMedication);
  const pregnant = isFemale && Boolean(source.pregnant);
  const nursing = isFemale && Boolean(source.nursing);
  const smoking = Boolean(source.smoking);
  const hasAllergy = Boolean(source.hasAllergy);

  return {
    takingMedication,
    currentMedication: takingMedication
      ? (source.currentMedication?.trim() || null)
      : null,
    pregnant,
    dueDate: pregnant ? parseDueDate(source.dueDate ?? null) : null,
    nursing,
    panMasala: Boolean(source.panMasala),
    tobacco: Boolean(source.tobacco),
    smoking,
    cigarettesPerDay: smoking ? (source.cigarettesPerDay ?? null) : null,
    hasAllergy,
    allergyName: hasAllergy ? (source.allergyName?.trim() || null) : null,
  };
}

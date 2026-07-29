import { GENDERS, type Gender } from "@/constants/patient";
import { formatCivilDateLabel } from "@/features/prescriptions/lib/format";
import type { PrescriptionMedicalHistoryDto } from "@/features/prescriptions/types";
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

/** Approximate line cost for pagination budgeting. */
export function medicalHistoryLineCost(
  blocks: MedicalHistoryRenderBlock[],
  charsPerLine: number,
): number {
  if (blocks.length === 0) {
    return 0;
  }

  let lines = 1; // "Medical History" heading

  for (const block of blocks) {
    switch (block.kind) {
      case "kv": {
        const text = `${block.label}: ${block.value}`;
        lines += Math.max(1, Math.ceil(text.length / charsPerLine));
        break;
      }
      case "pregnant":
        lines += 2; // Pregnant + Due Date
        break;
      case "nursing":
        lines += 1;
        break;
      case "habits":
        lines += 1 + block.items.length; // heading + bullets
        break;
      case "allergy":
        lines += 1 + Math.max(1, Math.ceil(block.value.length / charsPerLine));
        break;
      default:
        break;
    }
  }

  return lines;
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

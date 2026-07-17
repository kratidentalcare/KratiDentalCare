import type { Gender } from "@/constants/patient";
import { GENDERS } from "@/constants/patient";

export function formatGenderShort(gender: Gender | null | undefined): string {
  switch (gender) {
    case GENDERS.MALE:
      return "M";
    case GENDERS.FEMALE:
      return "F";
    case GENDERS.OTHER:
      return "O";
    case GENDERS.PREFER_NOT_TO_SAY:
      return "—";
    default:
      return "—";
  }
}

export function formatAgeSexLabel(
  ageYears: number | null | undefined,
  gender: Gender | null | undefined,
): string {
  const age = ageYears == null ? "—" : String(ageYears);
  const sex = formatGenderShort(gender);
  return `${age} / ${sex}`;
}

export function formatDisplayDate(isoOrDate: string | Date | null): string {
  if (!isoOrDate) {
    return "—";
  }
  const date =
    typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Civil YYYY-MM-DD → display label. */
export function formatCivilDateLabel(civil: string | null | undefined): string {
  if (!civil) {
    return "—";
  }
  const [year, month, day] = civil.split("-").map(Number);
  if (!year || !month || !day) {
    return "—";
  }
  return formatDisplayDate(new Date(Date.UTC(year, month - 1, day)));
}

export function generatePrescriptionNumber(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RX${y}${m}${d}-${rand}`;
}

export function shortOpdLabel(
  appointmentId: string | null,
  prescriptionNumber?: string | null,
): string {
  if (prescriptionNumber) {
    return prescriptionNumber;
  }
  if (!appointmentId) {
    return "—";
  }
  return appointmentId.slice(-6).toUpperCase();
}
